import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, User, Box, AlertTriangle, Activity, Hash, Phone, CheckCircle, ArrowRight } from 'lucide-react';

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  required: boolean;
  icon: any;
  placeholder: string;
}

export const createDefaultFields = (): ExtractedField[] => [
  { id: 'customer', label: 'Kunde', value: '', confidence: 0, required: true, icon: User, placeholder: 'Firmenname...' },
  { id: 'contact', label: 'Kontakt', value: '', confidence: 0, required: true, icon: Phone, placeholder: 'Name des Anrufers...' },
  { id: 'equipment', label: 'Gerät / Modell', value: '', confidence: 0, required: true, icon: Box, placeholder: 'Modell / Seriennr...' },
  { id: 'error', label: 'Fehlercode', value: '', confidence: 0, required: false, icon: Hash, placeholder: 'Falls angezeigt...' },
  { id: 'desc', label: 'Symptom', value: '', confidence: 0, required: true, icon: AlertTriangle, placeholder: 'Problembeschreibung...' },
  { id: 'priority', label: 'Priorität', value: '', confidence: 0, required: true, icon: Activity, placeholder: 'Dringlichkeit...' },
];

export const calculateCompleteness = (fields: ExtractedField[]) => {
  const required = fields.filter(f => f.required);
  const filled = required.filter(f => f.value && f.value.length > 2).length;
  return Math.round((filled / required.length) * 100);
};

// IMPROVED EXTRACTION LOGIC to prevent "hallucinations"
// Instead of broad keyword matching, we use stricter patterns and
// rely on the user confirming data or stating it clearly.
export const extractFromTranscript = (text: string, currentFields: ExtractedField[]): ExtractedField[] => {
  const lower = text.toLowerCase();
  const newFields = currentFields.map(field => ({ ...field }));

  const update = (id: string, val: string, conf: number) => {
    const field = newFields.find(f => f.id === id);
    // Only update if value is new or longer/better confidence
    if (field && (!field.value || (val.length > field.value.length && val !== field.value) || conf > field.confidence)) {
       field.value = val.trim();
       field.confidence = conf;
    }
  };

  // 1. CUSTOMER (Firma)
  // Look for "Firma [Name]", "von [Name] GmbH", "bei [Name] AG"
  // Avoid common words that are not companies.
  const firmaMatch = text.match(/(?:Firma|Unternehmen|bei der|von)\s+([A-ZÄÖÜ][a-zA-Zäöüß]+(?:\s[A-ZÄÖÜ][a-zA-Zäöüß]+)*)/);
  if (firmaMatch && firmaMatch[1]) {
     const candidate = firmaMatch[1];
     // Exclude common false positives
     if (!['Dank', 'Bitte', 'Guten', 'Hallo', 'Der', 'Das', 'Die', 'Ein', 'Eine', 'Einen', 'Porta'].includes(candidate)) {
        update('customer', candidate, 80);
     }
  }
  // Explicit confirmation "Ich notiere als Kunde: [Name]"
  const confirmCustomer = text.match(/Kunde[:\s]+([A-ZÄÖÜ][a-zA-Z0-9\s]+)/i);
  if (confirmCustomer) update('customer', confirmCustomer[1], 95);

  // 2. CONTACT PERSON
  // "Mein Name ist [Name]", "Hier ist [Name]"
  const nameMatch = text.match(/(?:mein Name ist|hier ist|ich bin|am Apparat ist)\s+([A-ZÄÖÜ][a-zäöü]+(?:\s[A-ZÄÖÜ][a-zäöü]+)?)/i);
  if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1];
      if (name.length > 2 && !['Porta', 'AEDIL', 'Ein', 'Der', 'Eine'].includes(name)) {
          update('contact', name, 85);
      }
  }

  // 3. EQUIPMENT
  // Look for specific model patterns or "Gerät [X]"
  if (lower.match(/\b(ejc|efg|ere|etv|eke)\s?\d{3}\b/)) {
      const match = text.match(/\b(EJC|EFG|ERE|ETV|EKE)\s?\d{3}\b/i);
      if(match) update('equipment', match[0].toUpperCase(), 95);
  }
  // Generic "Gerät [Name]"
  const deviceMatch = text.match(/(?:Gerät|Maschine|Modell)\s+([A-Z0-9]+(?:\s[A-Z0-9]+)?)/i);
  if (deviceMatch && deviceMatch[1] && deviceMatch[1].length > 2) {
      if(!['ist', 'hat', 'macht', 'nicht', 'defekt'].includes(deviceMatch[1].toLowerCase())) {
         update('equipment', deviceMatch[1], 70);
      }
  }
  // Serial number (516xxxxx or similar)
  const serialMatch = text.match(/\b5\d{7}\b/);
  if (serialMatch) {
      const existing = newFields.find(f => f.id === 'equipment')?.value || '';
      // Append serial if model exists, or set as main if empty
      if (existing && !existing.includes(serialMatch[0])) {
          update('equipment', `${existing} (SN: ${serialMatch[0]})`, 99);
      } else if (!existing) {
          update('equipment', `SN: ${serialMatch[0]}`, 90);
      }
  }

  // 4. ERROR CODE
  // Matches E00xx, W22xx, generic 4 digit code
  const errorMatch = text.match(/\b([EFW]\s?0+\d+)\b/i);
  if (errorMatch) update('error', errorMatch[1].toUpperCase().replace(/\s/,''), 95);
  else if (lower.includes('fehler') || lower.includes('code')) {
      const codeOnly = text.match(/\b(\d{3,5})\b/);
      if(codeOnly) update('error', codeOnly[1], 80);
  }

  // 5. PRIORITY
  // Strict keywords
  if (lower.includes('stillstand') || lower.includes('produktionsausfall') || lower.includes('nichts geht mehr')) update('priority', '1-Very High (Stillstand)', 95);
  else if (lower.includes('dringend') || lower.includes('eilig') || lower.includes('wichtig') || lower.includes('hohe priorität')) update('priority', '2-High', 85);
  else if (lower.includes('hat zeit') || lower.includes('nicht dringend') || lower.includes('wartung')) update('priority', '4-Low', 80);
  else if (lower.includes('normal') || lower.includes('warnung') || lower.includes('geräusch')) update('priority', '3-Medium', 70);

  // 6. SYMPTOM / DESC
  // Capture phrases after key verbs/nouns
  // "Problem ist [X]", "Es [X]", "Macht [X]"
  const problemMatch = text.match(/(?:Problem ist|Fehler ist|Symptom ist|es gibt|macht)\s+([^.?!]+)/i);
  if (problemMatch && problemMatch[1].length > 5) {
      update('desc', problemMatch[1].trim(), 80);
  }
  // Specific keywords overrides
  if (lower.includes('schleifgeräusch') || lower.includes('kratzt')) update('desc', 'Mechanische Geräusche', 85);
  if (lower.includes('verliert öl') || lower.includes('tropft')) update('desc', 'Leckage / Flüssigkeit', 85);
  if (lower.includes('hebt nicht') || lower.includes('kein hub')) update('desc', 'Hubfunktion defekt', 85);
  if (lower.includes('fährt nicht') || lower.includes('bewegt sich nicht')) update('desc', 'Fahrantrieb defekt', 85);

  return newFields;
};

export const ExtractionPanel = ({ fields, completeness, isExtracting, isConnected, recentlyUpdatedIds, onFinalize }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden h-full flex flex-col relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20/5 to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0 gap-3 bg-white/5">
         <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-lg shadow-white/10">
            <Sparkles className="w-4 h-4 text-white" />
         </div>
         <div>
            <div className="text-xs font-bold text-white tracking-wide">Live Extraction</div>
            <div className="text-[10px] text-zinc-500 font-medium">Neural Entity Recognition</div>
         </div>
         {isExtracting && (
             <div className="ml-auto flex items-center gap-1.5 text-[9px] font-bold text-zinc-300 bg-white/10 border border-white/20/10 px-2 py-0.5 rounded-full border border-white/20 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Aktiv
             </div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
         {/* Progress Card */}
         <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 border border-white/20/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 border border-white/20/20 transition-colors duration-500"></div>
            
            <div className="flex justify-between items-end mb-2 relative z-10">
               <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Datenvollständigkeit</div>
               <div className="text-2xl font-bold text-white">{completeness}%</div>
            </div>
            
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative z-10">
               <motion.div 
                 className="h-full bg-gradient-to-r from-white/20 via-white/10 to-emerald-500"
                 initial={{ width: 0 }}
                 animate={{ width: `${completeness}%` }}
                 transition={{ duration: 0.5 }}
               />
            </div>
         </div>

         {/* Fields */}
         <div className="space-y-3">
            {fields.map((field: ExtractedField) => {
               const Icon = field.icon;
               const isFilled = !!field.value;
               const isUpdated = recentlyUpdatedIds.includes(field.id);
               
               return (
                  <motion.div 
                    layout
                    key={field.id} 
                    className={`group relative bg-zinc-950/50 rounded-xl p-3 border transition-all duration-300 ${isFilled ? 'border-white/30 bg-white/10' : 'border-white/5'}`}
                  >
                     {isUpdated && (
                        <motion.div 
                           initial={{ opacity: 0.5 }} 
                           animate={{ opacity: 0 }} 
                           transition={{ duration: 1.5 }}
                           className="absolute inset-0 bg-white/10 border border-white/20/20 rounded-xl z-0" 
                        />
                     )}
                     
                     <div className="flex items-center gap-2 mb-1.5 relative z-10">
                        <div className={`p-1 rounded ${isFilled ? 'bg-white/10 border border-white/20/20' : 'bg-zinc-900'}`}>
                           <Icon className={`w-3 h-3 ${isFilled ? 'text-zinc-300' : 'text-slate-600'}`} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isFilled ? 'text-white' : 'text-zinc-500'}`}>{field.label}</span>
                        {isFilled && (
                           <span className="ml-auto text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                           </span>
                        )}
                        {field.required && !isFilled && (
                           <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/10 border border-white/20/50 animate-pulse"></span>
                        )}
                     </div>
                     
                     <div className="relative z-10 pl-6">
                        {isFilled ? (
                           <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-white font-medium break-words leading-snug"
                           >
                              {field.value}
                           </motion.div>
                        ) : (
                           <div className="text-xs text-slate-700 italic">
                              {field.placeholder}
                           </div>
                        )}
                     </div>
                  </motion.div>
               );
            })}
         </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-white/5 bg-white/5 shrink-0">
          <button 
             onClick={onFinalize}
             className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                 completeness >= 1 
                 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                 : 'bg-white/10 border border-white/20 hover:bg-white/10 border border-white/20 text-white shadow-white/10'
             }`}
          >
             {completeness >= 80 ? (
                 <>Ticket erstellen <ArrowRight className="w-3.5 h-3.5" /></>
             ) : (
                 <>Ticket Generieren (AI) <ArrowRight className="w-3.5 h-3.5" /></>
             )}
          </button>
      </div>
    </motion.div>
  );
};