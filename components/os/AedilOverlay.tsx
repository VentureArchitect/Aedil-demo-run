
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { Zap, Check, AlertCircle, Loader2, LayoutGrid, Copy, ArrowRight, Sparkles, Brain, Box } from 'lucide-react';
import { ReasoningStep, WindowState } from '../../types';

export const AedilOverlay: React.FC = () => {
  const { activeAppId, agent, windows, selectedEmailId, emails, sapForm, assignedTech } = useOS();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [agent.logs]);

  useEffect(() => {
     if (agent.status !== 'idle') setExpanded(true);
  }, [agent.status]);

  // --- CONTEXT AWARENESS ENGINE ---
  const hasExtractedData = emails.some(e => e.data);
  let isRelevant = false;
  let hintText = "AEDIL";
  let accentColor = "bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500";

  if (agent.status !== 'idle') {
      isRelevant = true;
      hintText = agent.status === 'diagnosing' ? "Diagnosing..." : "Working...";
      accentColor = agent.status === 'diagnosing' ? "bg-amber-500" : "bg-indigo-500";
  } else if (activeAppId === 'outlook' && selectedEmailId) {
      isRelevant = true;
      const email = emails.find(e => e.id === selectedEmailId);
      if (email?.data) {
         hintText = "Data Extracted";
         accentColor = "bg-emerald-500";
      } else {
         hintText = "Analyze Email";
         accentColor = "bg-blue-500";
      }
  } else if (activeAppId === 'sap') {
      if (hasExtractedData && !sapForm.equipment) {
          isRelevant = true;
          hintText = "Data Available";
          accentColor = "bg-amber-500";
      } else if (sapForm.equipment && sapForm.isDirty) {
          isRelevant = true;
          hintText = "Ready to Diagnose";
          accentColor = "bg-indigo-500";
      }
  } else if (activeAppId === 'fsm' && assignedTech) {
      isRelevant = true;
      hintText = "View Mobile";
      accentColor = "bg-zinc-600";
  }

  if (!activeAppId || !windows[activeAppId]) return null;
  const activeWindow = windows[activeAppId];
  
  // Prevent overlay from attaching to these specific apps
  if (activeAppId === 'console' || activeAppId === 'settings' || activeAppId === 'mobile' || activeAppId === 'porta') return null;
  
  // Show overlay even if window is minimized, but require active app context
  if (!activeWindow.isOpen) return null;
  if (!isRelevant && !expanded) return null;

  const isMaximized = activeWindow.isMaximized;
  
  // Calculate position based on window state
  // If maximized, fix to top right of screen. If windowed, relative to window.
  const winX = isMaximized ? 0 : (activeWindow.position?.x || 0);
  const winY = isMaximized ? 28 : (activeWindow.position?.y || 0);
  const winWidth = isMaximized ? window.innerWidth : (activeWindow.size?.width || 900);

  // Position relative to the window's top-right corner
  const anchorX = winX + winWidth - (isMaximized ? 40 : 24); 
  const anchorY = winY + (isMaximized ? 40 : 16); 

  return (
    <motion.div
       layout
       className="absolute z-[100000] pointer-events-auto flex flex-col items-end"
       initial={{ opacity: 0, scale: 0.8, x: anchorX, y: anchorY + 20 }}
       animate={{ 
          opacity: 1,
          scale: 1,
          x: anchorX,
          y: anchorY,
       }}
       exit={{ opacity: 0, scale: 0.8, y: anchorY + 20 }}
       transition={{ type: "spring", stiffness: 300, damping: 25 }}
       style={{ transformOrigin: 'top right' }}
    >
       <AnimatePresence mode="wait">
          {expanded ? (
             <ExpandedNeuralCore key="expanded" setExpanded={setExpanded} scrollRef={scrollRef} />
          ) : (
             <IdleNeuralPill key="collapsed" setExpanded={setExpanded} hintText={hintText} accentColor={accentColor} />
          )}
       </AnimatePresence>
    </motion.div>
  );
};

const IdleNeuralPill = ({ setExpanded, hintText, accentColor }: any) => {
   const { agent } = useOS();
   const isThinking = agent.status !== 'idle';
   
   return (
      <motion.div
         layoutId="neural-core"
         className="h-9 bg-[#0F0F0F]/90 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer flex items-center gap-2.5 px-1.5 pr-5 group overflow-hidden relative hover:border-white/30 transition-colors"
         onClick={() => setExpanded(true)}
         initial={{ width: 44, opacity: 0 }}
         animate={{ width: 'auto', opacity: 1 }} 
         exit={{ opacity: 0, scale: 0.9 }}
         transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      >
         <div className={`w-6 h-6 rounded-full ${accentColor} flex items-center justify-center relative z-10 shadow-inner`}>
            {isThinking ? (
               <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
               <Zap className="w-3.5 h-3.5 text-white fill-white drop-shadow-sm" />
            )}
            <div className={`absolute inset-0 rounded-full ${accentColor} blur-md opacity-50 animate-pulse`}></div>
         </div>
         <div className="flex flex-col z-10">
            <span className="text-[12px] font-semibold text-white/90 leading-none tracking-wide whitespace-nowrap">
               {hintText}
            </span>
         </div>
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
      </motion.div>
   );
};

const ExpandedNeuralCore = ({ setExpanded, scrollRef }: any) => {
   const { agent, diagnosis } = useOS();
   
   return (
      <motion.div
         layoutId="neural-core"
         className="w-[340px] bg-[#0F0F0F]/95 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col relative"
         initial={{ opacity: 0, scale: 0.95, x: -320 }} 
         animate={{ opacity: 1, scale: 1, x: -320 }}
         exit={{ opacity: 0, scale: 0.9 }}
         transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
      >
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

         <div 
            className="p-4 flex items-center justify-between cursor-pointer z-10 border-b border-white/5"
            onClick={() => setExpanded(false)}
         >
            <div className="flex items-center gap-3">
               <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'thinking' || agent.status === 'diagnosing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></div>
                  <div className={`w-2.5 h-2.5 rounded-full absolute top-0 left-0 ${agent.status === 'thinking' || agent.status === 'diagnosing' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
               </div>
               <span className="text-xs font-bold text-white tracking-widest uppercase opacity-90">Neural Core</span>
            </div>
            <div className="w-8 h-1 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors"></div>
         </div>

         <div 
           ref={scrollRef}
           className="flex-1 max-h-[450px] min-h-[120px] overflow-y-auto p-4 space-y-3 scrollbar-hide relative"
         >
            {diagnosis && (
                <DiagnosisVisuals diagnosis={diagnosis} />
            )}

            <AnimatePresence>
               {agent.logs.slice(-4).map((log) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-start group"
                  >
                     <div className="pt-1 shrink-0">
                        {getLogIcon(log.type)}
                     </div>
                     <div className="text-[12px] text-slate-300 leading-relaxed font-medium">
                        {log.message}
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         <div className="p-4 pt-0 z-10 bg-gradient-to-t from-[#0F0F0F] to-transparent pb-5">
            <ContextualActions />
         </div>
      </motion.div>
   );
};

const DiagnosisVisuals = ({ diagnosis }: any) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Reasoning</div>
        {diagnosis.reasoningChain.map((step: ReasoningStep) => (
           <div key={step.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 border border-white/5 transition-colors hover:bg-white/10">
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${step.status === 'working' ? 'bg-amber-500 animate-pulse' : (step.status === 'complete' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700')}`}></div>
                 <span className="text-[12px] text-slate-200 font-medium">{step.system}</span>
              </div>
              <span className="text-[11px] text-slate-400">{step.status === 'complete' ? step.result?.split(' ').slice(0,3).join(' ')+'...' : step.action}</span>
           </div>
        ))}
      </div>

      {diagnosis.isComplete && diagnosis.primaryFault && (
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/30 p-4 shadow-lg relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 blur-[40px] rounded-full"></div>
            <div className="flex items-center gap-2 mb-3 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
               <Brain className="w-3.5 h-3.5" /> Primary Diagnosis
            </div>
            <div className="text-sm text-white font-bold mb-2 tracking-tight">{diagnosis.primaryFault.fault}</div>
            <div className="flex items-center gap-3 mb-4">
               <div className="h-1.5 flex-1 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[89%] shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
               </div>
               <span className="text-xs font-mono text-emerald-400 font-bold">89%</span>
            </div>
            
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
               <Box className="w-3 h-3" /> Required Parts
            </div>
            <div className="space-y-1.5">
               {diagnosis.requiredParts.map((part: any) => (
                  <div key={part.id} className="flex justify-between text-[12px] text-slate-300 items-center">
                     <span>{part.name.split(' ').slice(0,2).join(' ')}...</span>
                     <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">In Stock</span>
                  </div>
               ))}
            </div>
         </motion.div>
      )}
    </div>
  );
};

const getLogIcon = (type: string) => {
   switch (type) {
      case 'success': return <Check className="w-4 h-4 text-emerald-400 drop-shadow-sm" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400 drop-shadow-sm" />;
      case 'action': return <Zap className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-sm" />;
      case 'thinking': return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin drop-shadow-sm" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5" />;
   }
};

const ContextualActions = () => {
   const { activeAppId, agent, selectedEmailId, sapForm, performAutoFill, performDispatch, switchToApp, emails, performScan, performDiagnosis, diagnosis } = useOS();
   const activeEmail = emails.find(e => e.id === selectedEmailId);
   const hasData = activeEmail?.data;

   if (activeAppId === 'outlook') {
      if (!hasData && activeEmail) {
         return <ActionButton onClick={performScan} label="Analyze Email Content" icon={Sparkles} color="indigo" />;
      }
      if (hasData) {
         return <ActionButton onClick={() => switchToApp('sap')} label="Open SAP Environment" icon={LayoutGrid} color="blue" />;
      }
      return <div className="text-[11px] text-center text-slate-600 py-2 italic">Select an email to activate Neural Core</div>;
   }

   if (activeAppId === 'sap') {
      if (!sapForm.equipment && hasData) {
         return <ActionButton onClick={performAutoFill} label="Inject Data Fields" icon={Copy} color="amber" />;
      }
      if (sapForm.equipment && sapForm.isDirty) {
          if (!diagnosis) {
             return <ActionButton onClick={performDiagnosis} label="Run Multi-Agent Diagnosis" icon={Brain} color="purple" />;
          } else if (diagnosis.isComplete) {
             return <ActionButton onClick={performDispatch} label="Dispatch Technician" icon={Zap} color="emerald" />;
          }
      }
   }

   if (activeAppId === 'fsm') {
      return <ActionButton onClick={() => switchToApp('mobile')} label="View Mobile Device" icon={ArrowRight} color="zinc" />;
   }

   return null;
};

const ActionButton = ({ onClick, label, icon: Icon, color }: any) => {
   const colors: any = {
      indigo: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20",
      blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
      amber: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
      purple: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20",
      emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
      zinc: "bg-zinc-700 hover:bg-zinc-600 shadow-zinc-500/20"
   };
   
   return (
      <motion.button 
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         onClick={onClick}
         className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold text-white shadow-lg transition-all ${colors[color]}`}
      >
         <Icon className="w-4 h-4" />
         {label}
      </motion.button>
   );
};
