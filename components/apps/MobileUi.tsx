
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, MapPin, Calendar, MessageSquare, CheckCircle, 
  ChevronUp, ChevronDown, X, Box, AlertTriangle, ShieldCheck, Check, Loader2, Mic, ArrowRight, ClipboardList
} from 'lucide-react';
import { Ticket, Diagnosis } from '../../types';
import { useOS } from '../../store';

export const Header = () => (
   <div className="bg-[#1C1C1E] text-white pt-10 pb-4 px-5 shadow-lg z-10 shrink-0">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h1 className="font-bold text-xl tracking-tight">My Schedule</h1>
            <p className="text-zinc-400 text-xs mt-0.5">Tuesday, 24 Oct</p>
         </div>
         <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/50">SK</div>
      </div>
      <div className="flex gap-6 text-zinc-400 text-xs font-medium border-b border-white/10 pb-1">
         <button className="text-white border-b-2 border-blue-500 pb-2 -mb-1.5 transition-colors">Active</button>
         <button className="hover:text-zinc-200 transition-colors pb-2">Pending (2)</button>
         <button className="hover:text-zinc-200 transition-colors pb-2">History</button>
      </div>
   </div>
);

export const Navigation = () => (
   <div className="bg-white/80 backdrop-blur-xl border-t border-zinc-200 py-3 px-8 flex justify-between text-zinc-400 z-10 shrink-0 mb-safe">
      <div className="flex flex-col items-center gap-1 text-blue-600">
         <Calendar className="w-6 h-6" />
         <span className="text-[10px] font-medium">Schedule</span>
      </div>
      <div className="flex flex-col items-center gap-1 hover:text-zinc-600 transition-colors">
         <MapPin className="w-6 h-6" />
         <span className="text-[10px] font-medium">Map</span>
      </div>
      <div className="flex flex-col items-center gap-1 hover:text-zinc-600 transition-colors">
         <MessageSquare className="w-6 h-6" />
         <span className="text-[10px] font-medium">Messages</span>
      </div>
   </div>
);

export const JobCard = ({ ticket }: { ticket: Ticket }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-zinc-200 relative group"
  >
     <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
     <div className="p-5 pl-6">
        <div className="flex justify-between items-start mb-3">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100">{ticket.status}</span>
                 <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider border border-red-100">{ticket.priority} Priority</span>
              </div>
              <h3 className="font-bold text-lg text-zinc-900 leading-tight">{ticket.error.description}</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Ref: {ticket.number}</p>
           </div>
        </div>
        
        <div className="space-y-2.5 mt-4">
           <div className="flex items-start gap-3 text-sm text-zinc-600">
              <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <span className="font-medium">{ticket.customer.name}, {ticket.customer.location.split(',')[0]}</span>
           </div>
           <div className="flex items-start gap-3 text-sm text-zinc-600">
              <Box className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <span>{ticket.equipment.model} <span className="text-zinc-400">•</span> <span className="font-mono text-xs text-zinc-500">{ticket.equipment.serialNumber}</span></span>
           </div>
           <div className="flex items-start gap-3 text-sm text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs leading-snug">{ticket.error.customerReport}</span>
           </div>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-100 flex gap-3">
           <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Zap className="w-3.5 h-3.5 fill-white" /> Start Job
           </button>
           <button className="flex-1 bg-white border border-zinc-200 text-zinc-700 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-50 active:scale-95 transition-all">
              Details
           </button>
        </div>
     </div>
  </motion.div>
);

export const InactiveJobCard = () => (
    <div className="bg-white rounded-2xl p-4 border border-zinc-200/60 opacity-60 grayscale hover:grayscale-0 transition-all">
        <div className="flex justify-between mb-2">
        <span className="font-bold text-zinc-700 text-sm">Routine Maintenance</span>
        <span className="text-zinc-400 text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded">16:00</span>
        </div>
        <p className="text-sm text-zinc-500 flex items-center gap-1">
        <MapPin className="w-3 h-3" /> Logistics Pro • Munich
        </p>
    </div>
);

export const SmartLensOverlay = ({ ticket }: { ticket: Ticket }) => {
   const { mobile, toggleSmartLens, performDiagnosis, diagnosis } = useOS();

   return (
      <motion.div
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         exit={{ y: "100%" }}
         transition={{ type: "spring", damping: 25, stiffness: 300 }}
         className="absolute inset-0 bg-[#F2F2F7] z-30 flex flex-col shadow-2xl"
      >
         {/* OVERLAY HEADER */}
         <div className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0 pt-10">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-black/5">
                  <Zap className="w-5 h-5 text-white fill-white" />
               </div>
               <div>
                  <div className="font-bold text-sm leading-none text-zinc-900">Smart Lens</div>
                  <div className="text-[10px] text-zinc-500 font-medium mt-1 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     Live Connection
                  </div>
               </div>
            </div>
            <button 
               onClick={() => toggleSmartLens(false)}
               className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-colors"
            >
               <ChevronDown className="w-5 h-5" />
            </button>
         </div>

         {/* MAIN CONTENT AREA */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F2F2F7]">
            
            <DispatchContextCard ticket={ticket} />

            {/* DIAGNOSIS FLOW */}
            {!diagnosis ? (
               <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-zinc-200">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm mb-1">Run System Diagnostics?</h3>
                  <p className="text-xs text-zinc-500 mb-4 px-4 leading-relaxed">
                     Curio will cross-reference the dispatcher's report with live telemetry and historical manuals.
                  </p>
                  <button 
                     onClick={() => performDiagnosis(ticket.id)}
                     className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                  >
                     <Zap className="w-4 h-4 fill-white" /> Run Diagnostics
                  </button>
               </div>
            ) : (
               <DiagnosisCard diagnosis={diagnosis} status={mobile.diagnosisStatus} />
            )}

            {/* NEXT ACTIONS (Parts & Chat) */}
            <AnimatePresence>
               {mobile.diagnosisStatus === 'accepted' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                     <PartsCard diagnosis={diagnosis!} ordered={mobile.partsOrdered} />
                  </motion.div>
               )}
            </AnimatePresence>
            
            <ChatInterface />
            
            {/* Bottom spacer for safe area */}
            <div className="h-12" />
         </div>
      </motion.div>
   );
};

export const DispatchContextCard = ({ ticket }: { ticket: Ticket }) => (
   <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-200">
      <div className="flex items-center gap-2 mb-3">
         <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
         </div>
         <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">Dispatcher Context</span>
      </div>
      
      <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 mb-3">
         <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wide">Problem Description</div>
         <p className="text-sm font-medium text-zinc-800 leading-snug">
            "{ticket.error.customerReport}"
         </p>
      </div>
      
      <div className="flex gap-2">
         <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Code: {ticket.error.code}
         </div>
         <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
            <Box className="w-3 h-3 text-zinc-400" /> Serial: {ticket.equipment.serialNumber}
         </div>
      </div>
   </div>
);

export const DiagnosisCard = ({ diagnosis, status }: { diagnosis: Diagnosis, status: string }) => {
   const { acceptDiagnosis, rejectDiagnosis } = useOS();
   const isAccepted = status === 'accepted';

   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 10 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className={`rounded-2xl p-5 shadow-sm border overflow-hidden relative transition-all ${isAccepted ? 'bg-white border-emerald-200' : 'bg-white border-zinc-200'}`}
      >
         {isAccepted && <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>}
         
         {!diagnosis.isComplete ? (
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Analyzing System Telemetry...
               </div>
               {diagnosis.reasoningChain.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 text-xs">
                     <div className={`w-1.5 h-1.5 rounded-full ${step.status === 'complete' ? 'bg-emerald-500' : (step.status === 'working' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-200')}`} />
                     <span className={step.status === 'working' ? 'text-zinc-800 font-bold' : 'text-zinc-500'}>{step.action}</span>
                  </div>
               ))}
            </div>
         ) : (
            <>
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                     <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="font-bold text-zinc-800 text-sm">Diagnosis Ready</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                     {diagnosis.primaryFault.confidence}% Confidence
                  </span>
               </div>
               
               <div className="text-zinc-900 font-bold text-base mb-1">{diagnosis.primaryFault.fault}</div>
               <p className="text-xs text-zinc-500 leading-relaxed mb-5 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  {diagnosis.primaryFault.reasoning}
               </p>

               {status === 'pending' ? (
                  <div className="flex gap-3">
                     <button 
                        onClick={acceptDiagnosis}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                     >
                        <Check className="w-3.5 h-3.5" /> Accept
                     </button>
                     <button 
                        onClick={rejectDiagnosis}
                        className="flex-1 bg-white border border-zinc-200 text-zinc-600 py-3 rounded-xl text-xs font-bold shadow-sm hover:bg-zinc-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                     >
                        <X className="w-3.5 h-3.5" /> Reject
                     </button>
                  </div>
               ) : (
                  <div className={`rounded-xl p-3 flex items-center gap-3 ${isAccepted ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAccepted ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {isAccepted ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-600" />}
                     </div>
                     <div>
                        <div className={`text-xs font-bold ${isAccepted ? 'text-emerald-800' : 'text-red-800'}`}>
                           {isAccepted ? 'Diagnosis Accepted' : 'Diagnosis Rejected'}
                        </div>
                        <div className={`text-[10px] font-medium ${isAccepted ? 'text-emerald-600' : 'text-red-600'}`}>
                           {isAccepted ? 'Work order updated.' : 'Feedback logged for learning.'}
                        </div>
                     </div>
                  </div>
               )}
            </>
         )}
      </motion.div>
   );
};

export const PartsCard = ({ diagnosis, ordered }: { diagnosis: Diagnosis, ordered: boolean }) => {
   const { orderParts } = useOS();
   return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200">
         <div className="font-bold text-zinc-800 text-sm mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-500" /> Recommended Parts
         </div>
         <div className="space-y-2 mb-5">
            {diagnosis.requiredParts.map((part) => (
               <div key={part.id} className="flex items-center justify-between text-xs bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <div className="flex flex-col">
                     <span className="font-bold text-zinc-700">{part.name}</span>
                     <span className="text-[10px] text-zinc-400 font-mono">ID: {part.id}</span>
                  </div>
                  {part.inStock ? (
                     <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Van
                     </span>
                  ) : (
                     <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                        <Loader2 className="w-3 h-3" /> Order
                     </span>
                  )}
               </div>
            ))}
         </div>
         {!ordered ? (
            <button 
               onClick={orderParts}
               className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               Order Missing Parts & Log Usage <ArrowRight className="w-3.5 h-3.5" />
            </button>
         ) : (
            <div className="text-center text-xs text-zinc-400 font-medium py-2 bg-zinc-50 rounded-xl border border-zinc-100 border-dashed">
               Parts allocation confirmed.
            </div>
         )}
      </div>
   );
};

export const ChatInterface = () => {
   const { mobile, sendTechMessage } = useOS();
   const [input, setInput] = useState('');
   const endRef = useRef<HTMLDivElement>(null);

   useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [mobile.chatHistory]);

   const handleSend = () => {
      if (!input.trim()) return;
      sendTechMessage(input);
      setInput('');
   };

   return (
      <div className="pt-2">
         <div className="space-y-4 pb-4">
            {mobile.chatHistory.map((msg) => (
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'tech' ? 'justify-end' : 'justify-start'}`}
               >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${msg.sender === 'tech' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-sm'}`}>
                     {msg.text}
                  </div>
               </motion.div>
            ))}
            <div ref={endRef} />
         </div>

         {/* INPUT AREA */}
         <div className="sticky bottom-0 bg-[#F2F2F7] pt-2 pb-2">
            <div className="flex gap-2 items-end">
               <button className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors shrink-0">
                  <Mic className="w-5 h-5" />
               </button>
               <div className="flex-1 relative bg-zinc-100 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                  <input 
                     type="text" 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Ask Curio..."
                     className="w-full h-10 bg-transparent px-4 pr-10 text-sm focus:outline-none placeholder:text-zinc-400 text-zinc-800"
                  />
                  <AnimatePresence>
                     {input.trim().length > 0 && (
                        <motion.button 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           exit={{ scale: 0 }}
                           onClick={handleSend}
                           className="absolute right-1 top-1 bottom-1 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-blue-500 transition-colors"
                        >
                           <ChevronUp className="w-5 h-5" />
                        </motion.button>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>
      </div>
   );
};
