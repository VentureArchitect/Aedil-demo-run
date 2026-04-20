
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { Zap, Check, AlertCircle, Loader2, LayoutGrid, Copy, ArrowRight, Sparkles, Brain, Box, Link as LinkIcon, Network, X, Search, Package, Warehouse, Truck, MousePointer2, UserCheck, Clock, Info, History, FileText, Activity, GitMerge, ShieldCheck, ScanFace, Radar, Lock } from 'lucide-react';
import { AppId } from '../../types';
import { AedilLogo } from '../ui/AedilLogo';

export const AedilOverlay: React.FC<{ appId: AppId }> = ({ appId }) => {
  const { activeAppId, agent, windows, selectedEmailId, emails, sapForm, assignedTech, dispatchStatus, selectedSlot } = useOS();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [agent.logs]);

  // DERIVED STATE: Force expansion if agent is diagnosing.
  // This prevents the "wait a little bit" issue where the user sees a collapsed spinner.
  const isDiagnosing = agent.status === 'diagnosing';
  const isWorking = agent.status !== 'idle';
  const shouldBeExpanded = expanded || isDiagnosing || dispatchStatus === 'review';

  // Only render if this overlay belongs to the currently active app
  if (activeAppId !== appId) return null;

  const hasExtractedData = emails.some(e => e.data);
  let isRelevant = false;
  let hintText = "AEDIL";
  let contextLabel = "System Idle";
  let accentColor = "from-white/20 via-white/10 to-transparent";
  let Icon: any = AedilLogo;

  if (isWorking) {
      isRelevant = true;
      hintText = isDiagnosing ? "Deep Analysis..." : "Processing...";
      contextLabel = "Neural Agent Working";
      accentColor = isDiagnosing ? "from-white/20 to-white/5" : "from-white/20 to-white/5";
      Icon = Loader2;
  } else if (activeAppId === 'outlook') {
      contextLabel = "Connected to Outlook";
      Icon = Network;
      isRelevant = true; 
      const email = emails.find(e => e.id === selectedEmailId);
      if (email?.data) {
         hintText = "Data Ready";
         accentColor = "from-emerald-500 to-teal-400";
         Icon = Check;
      } else if (email) {
         hintText = "Analyze";
         accentColor = "from-blue-500 to-transparent";
         Icon = Brain;
      } else {
         hintText = "Waiting";
         accentColor = "from-slate-500 to-slate-400";
      }
  } else if (activeAppId === 'sap') {
      contextLabel = "Connected to SAP S/4HANA";
      Icon = LayoutGrid;
      isRelevant = true;
      if (hasExtractedData && !sapForm.equipment) {
          hintText = "Auto-Fill";
          accentColor = "from-white/20 to-yellow-400";
          Icon = Copy;
      } else if (sapForm.equipment && sapForm.isDirty) {
          hintText = "Diagnosis";
          accentColor = "from-white/20 to-white/5";
          Icon = Brain;
      } else {
          hintText = "Monitoring";
          accentColor = "from-blue-600 to-blue-400";
      }
  } else if (activeAppId === 'fsm') {
      isRelevant = true;
      contextLabel = "Connected to IFS FSM";
      if (dispatchStatus === 'confirmed') {
          hintText = "Sync Mobile";
          accentColor = "from-zinc-600 to-zinc-400";
          Icon = ArrowRight;
      } else if (dispatchStatus === 'planning') {
          hintText = "Select Slot";
          accentColor = "from-white/20 to-orange-500";
          Icon = MousePointer2;
      } else if (dispatchStatus === 'review' && selectedSlot) {
          hintText = "Confirm";
          accentColor = "from-emerald-500 to-teal-500";
          Icon = UserCheck;
      } else {
          hintText = "Schedule";
          accentColor = "from-white/20 to-transparent";
      }
  }

  if (!isRelevant && !shouldBeExpanded) return null;

  return (
    <motion.div
       className="absolute top-[48px] right-[20px] z-[9999] pointer-events-auto flex flex-col items-end font-sans"
       initial={{ y: -10, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
       <motion.div
          layout
          onClick={() => !shouldBeExpanded && setExpanded(true)}
          className={`relative overflow-hidden bg-black/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] ${shouldBeExpanded ? 'cursor-default' : 'cursor-pointer group'}`}
          initial={false}
          animate={{ 
              width: shouldBeExpanded ? 360 : 'auto', 
              height: shouldBeExpanded ? 'auto' : 44, 
              borderRadius: shouldBeExpanded ? 24 : 99,
              borderColor: isDiagnosing ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.15)'
          }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
          style={{ minWidth: shouldBeExpanded ? 360 : 44 }}
       >
          <motion.div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-5 transition-opacity duration-500 pointer-events-none`} />
          
          {/* ABSOLUTE INVESTIGATION OVERLAY - Guaranteed to be visible during diagnosis */}
          <AnimatePresence>
            {isDiagnosing && (
                <InvestigationSequence />
            )}
          </AnimatePresence>

          <div className="relative w-full h-full">
             <AnimatePresence mode="wait" initial={false}>
                {shouldBeExpanded ? (
                   <motion.div
                      key="expanded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }} 
                      transition={{ duration: 0.2 }} 
                      className="flex flex-col w-full h-full"
                   >
                      <ExpandedHeader setExpanded={setExpanded} agent={agent} contextLabel={contextLabel} />
                      {/* Only show content if NOT diagnosing, because diagnosing has its own full-cover overlay */}
                      {!isDiagnosing && (
                          <>
                            <ExpandedContent scrollRef={scrollRef} agent={agent} />
                            <ContextualActions />
                          </>
                      )}
                   </motion.div>
                ) : (
                   <motion.div
                      key="collapsed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center h-full pl-1.5 pr-5 gap-3 whitespace-nowrap"
                   >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${accentColor} flex items-center justify-center relative z-10 shadow-lg shrink-0`}>
                         <Icon className="w-4 h-4 text-white drop-shadow-md" />
                         <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                      </div>
                      <div className="flex flex-col z-10">
                         <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest leading-none mb-0.5">AEDIL OS</span>
                         <span className="text-[13px] font-bold text-white leading-none tracking-wide">{hintText}</span>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
       </motion.div>
    </motion.div>
  );
};

// --- CINEMATIC INVESTIGATION SEQUENCE ---
const InvestigationSequence = () => {
    const [stepIndex, setStepIndex] = useState(0);
    
    // Matched to ~6.0s timing in CurioService
    const steps = [
        { label: "INITIALIZING CURIO AGENT...", subtext: "Context: ETM 214 / SN 91165099", icon: ScanFace, color: "text-zinc-300", ringColor: "border-white/20" },
        { label: "ANALYZING SERVICE HISTORY", subtext: "Retrieving 39 past entries...", icon: History, color: "text-blue-400", ringColor: "border-blue-500" },
        { label: "CORRELATING MANUALS", subtext: "Mapping 3xxx error patterns...", icon: FileText, color: "text-orange-400", ringColor: "border-orange-500" },
        { label: "CHECKING IOT TELEMETRY", subtext: "Scanning CAN-Bus Node 4...", icon: Radar, color: "text-emerald-400", ringColor: "border-emerald-500" },
        { label: "DETERMINING ROOT CAUSE", subtext: "Finalizing confidence score...", icon: Brain, color: "text-white", ringColor: "border-white" }
    ];

    useEffect(() => {
        // Advance step every ~1100ms
        if (stepIndex < steps.length - 1) {
            const timeout = setTimeout(() => {
                setStepIndex(prev => prev + 1);
            }, 1100); 
            return () => clearTimeout(timeout);
        }
    }, [stepIndex]);

    const currentStep = steps[stepIndex];
    const Icon = currentStep.icon;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center overflow-hidden rounded-[24px]"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-black to-black"></div>
            
            {/* Top Security Header */}
            <div className="absolute top-4 left-0 w-full flex justify-center opacity-50">
                <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase tracking-[0.2em] border border-white/10 px-2 py-0.5 rounded bg-white/5">
                    <Lock className="w-2.5 h-2.5" /> Neural Analysis Active
                </div>
            </div>

            {/* Scanning Line Animation */}
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
            </div>
            
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>

            {/* Central Animated Icon */}
            <div className="relative z-10 mb-8 mt-4">
                {/* Pulse Rings */}
                <div className={`absolute inset-0 rounded-full border-[1px] opacity-20 scale-150 animate-ping ${currentStep.ringColor}`}></div>
                <div className={`absolute inset-0 rounded-full border-[1px] opacity-40 scale-110 animate-pulse ${currentStep.ringColor}`}></div>
                
                <motion.div 
                    key={stepIndex}
                    initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
                    <Icon className={`w-10 h-10 ${currentStep.color} drop-shadow-[0_0_15px_currentColor]`} strokeWidth={1.5} />
                </motion.div>
            </div>

            {/* Text Content */}
            <div className="space-y-2 max-w-[300px] z-10 min-h-[80px]">
                <motion.div
                    key={`text-${stepIndex}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-lg font-bold text-white tracking-widest font-mono uppercase"
                >
                    {currentStep.label}
                </motion.div>
                <motion.div
                    key={`sub-${stepIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-xs text-zinc-400 font-medium font-mono"
                >
                    {currentStep.subtext}
                </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-white/10 rounded-full mt-6 overflow-hidden z-10 relative">
                <motion.div 
                    initial={{ width: `${(stepIndex / steps.length) * 100}%` }}
                    animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 1.1, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-white/20 to-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                />
            </div>
            
            {/* Step Indicators */}
            <div className="flex gap-2 mt-4 z-10">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-white/10 border border-white/20 scale-125' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </motion.div>
    );
};

const ExpandedHeader = ({ setExpanded, agent, contextLabel }: any) => (
    <div className="p-5 flex items-center justify-between cursor-pointer z-10 border-b border-white/5 shrink-0" onClick={() => setExpanded(false)}>
       <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-5 h-5">
             <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'thinking' || agent.status === 'diagnosing' ? 'bg-white/20 animate-ping' : 'bg-emerald-400'} absolute`}></div>
             <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'thinking' || agent.status === 'diagnosing' ? 'bg-white/20' : 'bg-emerald-400'} relative z-10 shadow-[0_0_10px_currentColor]`}></div>
          </div>
          <div>
              <span className="text-sm font-bold text-white tracking-wide block leading-none">Neural Core</span>
              <span className="text-[10px] text-white font-mono flex items-center gap-1 mt-1"><LinkIcon className="w-2.5 h-2.5" /> {contextLabel}</span>
          </div>
       </div>
       <div className="p-1.5 rounded-full hover:bg-white/10 transition-colors"><div className="w-6 h-1 bg-white/20 rounded-full"></div></div>
    </div>
);

const ExpandedContent = ({ scrollRef, agent }: any) => {
    const { diagnosis, dispatchStatus, selectedSlot } = useOS();
    
    return (
        <div ref={scrollRef} className="max-h-[500px] min-h-[140px] overflow-y-auto p-5 space-y-4 scrollbar-hide relative">
           {dispatchStatus === 'review' && selectedSlot ? (
               <JobPackPreview selectedSlot={selectedSlot} diagnosis={diagnosis} />
           ) : (
               diagnosis && <DiagnosisVisuals diagnosis={diagnosis} />
           )}

           <div className="space-y-3 pt-2">
               <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <ActivityIcon className="w-3 h-3" /> Live Reasoning Chain
               </div>
               <AnimatePresence mode="popLayout">
               {agent.logs.slice(-5).map((log: any) => (
                   <motion.div key={log.id} initial={{ opacity: 0, x: -10, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} className="flex gap-3 items-start group">
                       <div className="pt-1.5 shrink-0 relative">
                           {getLogIcon(log.type)}
                           <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-full bg-white/5 last:hidden"></div>
                       </div>
                       <div className="text-[12px] text-slate-300 leading-relaxed font-medium py-1">{log.message}</div>
                   </motion.div>
               ))}
               </AnimatePresence>
           </div>
        </div>
    );
};

const JobPackPreview = ({ selectedSlot, diagnosis }: any) => {
    const isRecommendedTech = selectedSlot.techName.includes('Stefan');
    
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                    {selectedSlot.techName.split(' ').map((n:string) => n[0]).join('')}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dispatch Target</div>
                    <div className="text-white font-bold">{selectedSlot.techName}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {selectedSlot.time} Today</div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Package className="w-3 h-3" /> Inventory Check</div>
                    {!isRecommendedTech && (<span className="text-[9px] text-zinc-300 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded font-bold">Transfer Needed</span>)}
                </div>
                
                {diagnosis?.requiredParts.map((part: any, idx: number) => {
                    const inVan = isRecommendedTech || idx === 0; 
                    return (
                        <div key={part.id} className="flex items-center justify-between text-[11px] bg-black/20 p-2.5 rounded-lg border border-white/5">
                            <span className="text-slate-300 font-medium truncate max-w-[170px]">{part.name}</span>
                            {inVan ? (
                                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"><Truck className="w-2.5 h-2.5" /> In Van</span>
                            ) : (
                                <span className="flex items-center gap-1 text-[9px] text-zinc-300 font-bold bg-white/10 border border-white/10 px-1.5 py-0.5 rounded"><Warehouse className="w-2.5 h-2.5" /> Warehouse</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const DiagnosisVisuals = ({ diagnosis }: any) => {
  const { assignedTech } = useOS();
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  
  const stockLabel = assignedTech ? "Van Stock" : "Warehouse";
  const StockIcon = assignedTech ? Truck : Warehouse;
  const shortReasoning = diagnosis.primaryFault?.shortReasoning || diagnosis.primaryFault?.reasoning?.substring(0, 50) + "..." || "Analysis complete.";

  return (
    <div className="mb-4 space-y-4">
      {diagnosis.isComplete && diagnosis.primaryFault && (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 border border-white/10 blur-[50px] rounded-full group-hover:bg-white/10 group-hover:border-white/20 transition-colors duration-500"></div>
            
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/10 px-2 py-1 rounded"><Brain className="w-3 h-3" /> Analysis Complete</div>
                <div className="text-2xl font-bold text-white tracking-tighter">
                    {diagnosis.primaryFault.confidence.toFixed(2).replace('.', ',')}<span className="text-sm text-zinc-500 font-normal"> %</span>
                </div>
            </div>

            <div className="text-sm text-white font-bold mb-1 tracking-tight leading-snug">{diagnosis.primaryFault.fault}</div>
            <div className="text-[11px] text-zinc-400 leading-snug mb-3 pr-2 border-b border-white/5 pb-3">"{shortReasoning}"</div>
            
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-4">
               <motion.div initial={{ width: 0 }} animate={{ width: `${diagnosis.primaryFault.confidence}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-white/20 to-orange-500" />
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider"><Package className="w-3 h-3" /> Recommended Parts</div>
                {diagnosis.requiredParts.length > 0 ? (
                    <div className="space-y-1">
                        {diagnosis.requiredParts.map((part: any) => {
                           const isSelected = selectedPartId === part.id;
                           return (
                               <div key={part.id} className="flex flex-col gap-2">
                                  <div 
                                      onClick={() => setSelectedPartId(isSelected ? null : part.id)}
                                      className={`flex items-center justify-between text-[11px] bg-black/20 p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-white/10 border border-white/20' : 'border-white/5 hover:bg-white/5'}`}
                                  >
                                      <div className="flex items-center gap-2">
                                        <Info className="w-3 h-3 text-zinc-500" />
                                        <span className="text-slate-300 font-medium truncate max-w-[150px]">{part.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          {part.confidence && (
                                              <span className="text-[9px] text-zinc-400 font-mono bg-white/5 px-1 rounded">{part.confidence.toFixed(2)}%</span>
                                          )}
                                          {part.inStock ? (
                                              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"><StockIcon className="w-2.5 h-2.5" /></span>
                                          ) : (
                                              <span className="flex items-center gap-1 text-[9px] text-zinc-300 font-bold bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">Order</span>
                                          )}
                                      </div>
                                  </div>
                                  {isSelected && part.reasoning && (
                                      <motion.div 
                                         initial={{ opacity: 0, height: 0 }} 
                                         animate={{ opacity: 1, height: 'auto' }} 
                                         className="text-[10px] text-zinc-300 bg-white/5 p-2 rounded-md border-l-2 border-white/20 ml-2"
                                      >
                                          {part.reasoning}
                                      </motion.div>
                                  )}
                               </div>
                           );
                        })}
                    </div>
                ) : (
                    <div className="text-[10px] text-zinc-500 italic px-2">No specific parts required.</div>
                )}
            </div>

         </motion.div>
      )}
    </div>
  );
};

const getLogIcon = (type: string) => {
   switch (type) {
      case 'success': return <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'action': return <Zap className="w-3 h-3 text-zinc-300 fill-white" />;
      case 'thinking': return <Loader2 className="w-3 h-3 text-zinc-300 animate-spin" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>;
   }
};

const ActivityIcon = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;

const ContextualActions = () => {
   const { activeAppId, agent, selectedEmailId, sapForm, performAutoFill, performDispatch, switchToApp, emails, performScan, performDiagnosis, diagnosis, submitDiagnosisFeedback, viewTicketAnalysis, manualOverride, dispatchStatus, finalizeDispatch, selectedSlot } = useOS();
   const activeEmail = emails.find(e => e.id === selectedEmailId);
   const hasData = activeEmail?.data;

   if (activeAppId === 'outlook') {
      if (!hasData && activeEmail) {
         return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><ActionButton onClick={performScan} label="Scan & Extract Entities" subLabel="AI Analysis" icon={Sparkles} color="zinc" /></div>;
      }
      if (hasData) {
         return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><ActionButton onClick={() => switchToApp('sap')} label="Open SAP S/4HANA" subLabel="Data Ready for Transfer" icon={LayoutGrid} color="blue" /></div>;
      }
      return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><div className="text-[11px] text-center text-zinc-500 py-2 border border-dashed border-white/10 rounded-xl">Select an email to activate Neural Core</div></div>;
   }

   if (activeAppId === 'sap') {
      if (!sapForm.equipment && hasData) return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><ActionButton onClick={performAutoFill} label="Inject Data to Mask" subLabel="Auto-Fill Form" icon={Copy} color="zinc" /></div>;
      if (sapForm.equipment && sapForm.isDirty) {
          if (!diagnosis) return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><ActionButton onClick={performDiagnosis} label="Run Diagnostics" subLabel="Multi-Agent Analysis" icon={Brain} color="zinc" /></div>;
          else if (diagnosis.isComplete) {
             return (
               <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6">
                   <div className="flex flex-col gap-2">
                      <ActionButton onClick={() => { submitDiagnosisFeedback(diagnosis.ticketId, 'approved'); performDispatch(); }} label="Approve & Dispatch" subLabel="Send to Technician" icon={Zap} color="emerald" />
                      <div className="flex gap-2">
                         <button onClick={() => viewTicketAnalysis(diagnosis.ticketId)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"><Search className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" /> Inspect</button>
                         <button onClick={manualOverride} className="flex-1 bg-zinc-900 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"><X className="w-3.5 h-3.5" /> Reject</button>
                      </div>
                   </div>
               </div>
             );
          }
      }
   }

   if (activeAppId === 'fsm') {
      if (dispatchStatus === 'review' && selectedSlot) return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><ActionButton onClick={finalizeDispatch} label="Confirm & Send" subLabel={`Dispatch to ${selectedSlot.techName}`} icon={UserCheck} color="emerald" /></div>;
      return <div className="p-5 pt-2 z-10 bg-gradient-to-t from-black via-black to-transparent pb-6"><ActionButton onClick={() => switchToApp('mobile')} label="View Technician Device" subLabel="Live Mirror" icon={ArrowRight} color="zinc" /></div>;
   }

   return null;
};

const ActionButton = ({ onClick, label, subLabel, icon: Icon, color }: any) => {
   const colors: any = { amber: "bg-white/10 border border-white/20 hover:bg-white/10 shadow-white/10", blue: "bg-white/10 hover:bg-white/20 shadow-white/10", amber: "bg-white/10 hover:bg-white/20 border border-white/20 shadow-white/10", orange: "bg-white/10 hover:bg-white/10 shadow-white/10", emerald: "bg-white/10 hover:bg-white/20 shadow-white/10", zinc: "bg-white/10 hover:bg-white/20 shadow-white/10" };
   return (
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} className={`w-full py-3.5 px-5 rounded-2xl flex items-center gap-4 text-left shadow-lg transition-all group ${colors[color]}`}>
         <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300"><Icon className="w-5 h-5 text-white" /></div>
         <div><div className="text-xs font-bold text-white leading-tight">{label}</div><div className="text-[10px] text-white/70 font-medium">{subLabel}</div></div>
         <ArrowRight className="w-4 h-4 text-white/50 ml-auto group-hover:translate-x-1 transition-transform" />
      </motion.button>
   );
};
