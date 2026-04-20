
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Box, CheckCircle, ArrowRight, User, MapPin, 
  Phone, Mail, Calendar, Clock, ChevronRight, Camera, 
  Search, MessageSquare, List, Home, Bell, Warehouse, Truck
} from 'lucide-react';
import { useOS } from '../../store';
import { Diagnosis, Ticket } from '../../types';
import { AedilLogo } from '../ui/AedilLogo';

export const Header = () => (
    <div className="h-[90px] px-6 pt-12 flex items-center justify-between shrink-0 bg-black">
        <div className="flex flex-col">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Technician Port</span>
            <h1 className="text-xl font-bold text-white tracking-tight">Active Jobs</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <User className="w-5 h-5 text-zinc-400" />
        </div>
    </div>
);

export const Navigation = () => (
    <div className="absolute bottom-6 left-6 right-6 h-[72px] bg-black/90 backdrop-blur-xl rounded-[28px] flex items-center justify-around px-4 border border-white/10 shadow-2xl z-50">
        <NavIcon icon={Home} active />
        <NavIcon icon={List} />
        <NavIcon icon={MessageSquare} />
        <NavIcon icon={Bell} />
    </div>
);

const NavIcon = ({ icon: Icon, active }: any) => (
    <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-black/10 border border-white/20 text-white shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}>
        <Icon className="w-5 h-5" />
    </div>
);

export const JobCard = ({ ticket }: { ticket: Ticket }) => {
    const { toggleSmartLens } = useOS();
    return (
        <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSmartLens(true)}
            className="bg-black rounded-[32px] p-6 shadow-sm border border-white/10 flex flex-col gap-5 cursor-pointer"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/10 border border-white/10 flex items-center justify-center">
                        <Box className="w-6 h-6 text-zinc-300" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Notification</div>
                        <div className="text-lg font-bold text-white leading-tight">#{ticket.number}</div>
                    </div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20 uppercase tracking-wider">
                    Assigned
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-400">
                    <User className="w-4 h-4 opacity-40" />
                    <span className="text-sm font-medium">{ticket.customer.name}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                    <MapPin className="w-4 h-4 opacity-40" />
                    <span className="text-sm font-medium">{ticket.customer.location}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                    <Calendar className="w-4 h-4 opacity-40" />
                    <span className="text-sm font-medium">Due: Today, 16:30</span>
                </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <span className="text-xs font-bold text-zinc-300">View Details</span>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
            </div>
        </motion.div>
    );
};

export const InactiveJobCard = () => (
    <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 border-dashed flex items-center justify-center min-h-[140px]">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">No further jobs scheduled</span>
    </div>
);

export const SmartLensOverlay = ({ ticket }: { ticket: Ticket }) => {
    const { toggleSmartLens, diagnosis } = useOS();
    return (
        <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-black z-[80] flex flex-col rounded-[48px] overflow-hidden shadow-2xl"
        >
            <div className="h-[120px] bg-black px-8 pt-14 pb-4 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-white font-bold text-lg">Smart Lens</h2>
                    <span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <AedilLogo className="w-3 h-3" /> AEDIL Intelligence v2.5
                    </span>
                </div>
                <button 
                    onClick={() => toggleSmartLens(false)}
                    className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-white"
                >
                    <ArrowRight className="w-5 h-5 rotate-90" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Diagnosis Report</h3>
                    {diagnosis ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-white">{diagnosis.primaryFault.fault.replace('Rang 1: ', '')}</span>
                                <span className="text-emerald-400 font-bold">{diagnosis.primaryFault.confidence.toFixed(2).replace('.', ',')}%</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed italic">"{diagnosis.primaryFault.reasoning}"</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 py-4">
                            <Search className="w-5 h-5 text-zinc-400 animate-pulse" />
                            <span className="text-sm text-zinc-400 italic">Analyzing equipment telemetry...</span>
                        </div>
                    )}
                </div>

                {diagnosis && <PartsCard diagnosis={diagnosis} ordered={false} />}
                
                {diagnosis?.secondaryFaults && diagnosis.secondaryFaults.length > 0 && (
                   <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Secondary Probabilities</h3>
                      <div className="space-y-3">
                         {diagnosis.secondaryFaults.map((f, i) => (
                            <div key={i} className="flex items-center justify-between">
                               <span className="text-xs font-bold text-zinc-400">{f.fault}</span>
                               <span className="text-xs font-mono text-zinc-400">{f.confidence.toFixed(2).replace('.', ',')}%</span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
            </div>
        </motion.div>
    );
};

export const PartsCard = ({ diagnosis, ordered }: { diagnosis: Diagnosis, ordered: boolean }) => {
   const { orderParts, assignedTech } = useOS();
   const [expandedPart, setExpandedPart] = React.useState<string | null>(null);
   
   // Logic consistency with FSM: 
   // If tech is Stefan (recommended), they have everything (or logic defined in Overlay).
   // If tech is NOT Stefan, they only have the first part (simulated logic from Overlay).
   const isStefan = assignedTech?.includes('Stefan');
   const hasMissingParts = diagnosis.requiredParts.some((_, idx) => !isStefan && idx !== 0);

   return (
      <div className="bg-black rounded-2xl p-5 shadow-sm border border-white/10">
         <div className="font-bold text-slate-200 text-sm mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-zinc-400" /> Technical Job Pack
            </div>
            <span className="text-[10px] text-zinc-400 font-mono uppercase">AEDIL v2.5</span>
         </div>
         
         <div className="space-y-3 mb-5">
            {diagnosis.requiredParts.map((part, idx) => {
               // Consistency Check: Matches logic in AedilOverlay.tsx
               const inVan = isStefan || idx === 0;

               return (
                   <div key={part.id} className="flex flex-col gap-2">
                       <div 
                          onClick={() => setExpandedPart(expandedPart === part.id ? null : part.id)}
                          className={`flex items-center justify-between text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${inVan ? 'bg-white/5 border-white/5' : 'bg-white/5 border-white/10'}`}
                       >
                          <div className="flex flex-col">
                             <span className="font-bold text-slate-300">{part.name}</span>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-zinc-400 font-mono">ID: {part.id}</span>
                                <span className="text-[9px] font-bold text-zinc-300">€{part.price}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end">
                              {inVan ? (
                                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Van
                                  </span>
                              ) : (
                                  <span className="text-zinc-300 font-bold bg-white/10 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                                    <Warehouse className="w-3 h-3" /> Warehouse
                                  </span>
                              )}
                              <span className="text-[8px] text-zinc-400 mt-1 uppercase font-bold">Rang {idx + 1}</span>
                          </div>
                       </div>
                       {expandedPart === part.id && part.reasoning && (
                           <div className="bg-white/5 p-3 rounded-lg text-[10px] text-zinc-300 border border-white/10">
                               <div className="font-bold mb-1 flex justify-between">
                                   <span>AI Reasoning</span>
                                   <span>{part.confidence ? `${part.confidence.toFixed(2)}%` : ''}</span>
                               </div>
                               {part.reasoning}
                           </div>
                       )}
                   </div>
               );
            })}
         </div>
         
         {!ordered ? (
            <button 
               onClick={orderParts}
               className={`w-full text-white py-3 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${hasMissingParts ? 'bg-white/10 border border-white/20 shadow-white/10' : 'bg-white/10 border border-white/20 shadow-white/10'}`}
            >
               {hasMissingParts ? (
                   <>Request Transfer & Accept Job <Truck className="w-3.5 h-3.5" /></>
               ) : (
                   <>Accept Job Pack & Log Usage <ArrowRight className="w-3.5 h-3.5" /></>
               )}
            </button>
         ) : (
            <div className="text-center text-xs text-zinc-400 font-medium py-2 bg-white/5 rounded-xl border border-white/5 border-dashed">
               Parts allocation confirmed.
            </div>
         )}
      </div>
   );
};
