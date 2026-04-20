
import React, { useEffect, useState, useRef } from 'react';
import { useOS } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, ChevronRight, 
  Settings, Calendar, Users, Map, Activity,
  Maximize2, RefreshCw, LogOut, Box, CheckCircle, MousePointer2
} from 'lucide-react';

export const FSM: React.FC = () => {
  // Use selective state mapping to avoid re-rendering on every store update
  const assignedTech = useOS(state => state.assignedTech);
  const diagnosis = useOS(state => state.diagnosis);
  const switchToApp = useOS(state => state.switchToApp);
  const toggleSmartLens = useOS(state => state.toggleSmartLens);
  const tickets = useOS(state => state.tickets);
  const dispatchStatus = useOS(state => state.dispatchStatus);
  const selectDispatchSlot = useOS(state => state.selectDispatchSlot);

  const [showNewJob, setShowNewJob] = useState(false);
  
  // Interaction State
  const [hoveredCell, setHoveredCell] = useState<{ resourceId: string, time: number } | null>(null);
  
  const activeTicket = tickets[0] || { number: '00000000', customer: { name: 'Unknown Co.' } };

  // Trigger animation when tech is assigned
  useEffect(() => {
    if (assignedTech && dispatchStatus === 'confirmed') {
      const timer = setTimeout(() => setShowNewJob(true), 500);
      return () => clearTimeout(timer);
    }
  }, [assignedTech, dispatchStatus]);

  const handleMobileSwitch = () => {
      switchToApp('mobile');
      setTimeout(() => toggleSmartLens(true), 800);
  };

  const handleGridMouseMove = (e: React.MouseEvent, resourceId: string) => {
      if (dispatchStatus !== 'planning') return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      
      // Calculate time (8:00 to 18:00 = 10 hours)
      const pct = Math.max(0, Math.min(1, x / width));
      const hours = 10 * pct; 
      const snappedHours = Math.round(hours * 4) / 4;
      
      // Optimization: Only update state if the value actually changed
      const newTime = 8 + snappedHours;
      if (hoveredCell?.resourceId !== resourceId || hoveredCell?.time !== newTime) {
          setHoveredCell({ resourceId, time: newTime });
      }
  };

  const handleGridMouseLeave = () => {
      setHoveredCell(null);
  };

  const handleGridClick = (resourceId: string) => {
      if (dispatchStatus !== 'planning' || !hoveredCell) return;
      
      const resource = RESOURCES.find(r => r.id === resourceId);
      if (resource) {
          const timeStr = `${Math.floor(hoveredCell.time)}:${(Math.round((hoveredCell.time % 1) * 60)).toString().padStart(2, '0')}`;
          selectDispatchSlot(resource.id, resource.name, timeStr);
      }
  };

  const formatTime = (time: number) => {
      const h = Math.floor(time);
      const m = Math.round((time - h) * 60);
      return `${h}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-black font-sans text-[10px] xl:text-xs text-slate-300 overflow-hidden select-none border border-white/10 transition-all">
       
       {/* 1. IFS PURPLE HEADER */}
       <div className="h-8 xl:h-10 bg-zinc-950 border-b border-white/10 flex items-center px-2 xl:px-4 justify-between shrink-0 text-white relative z-50">
          <div className="flex items-end h-full gap-1 pt-1 overflow-x-auto no-scrollbar">
             <Tab label="Resources" active />
             <Tab label="Activities" />
             <Tab label="Mapping" />
             <Tab label="Advanced Mapping" />
             <Tab label="Compare" />
             <Tab label="System Status" />
             <Tab label="Analysis" />
          </div>
          <div className="flex items-center gap-2 pl-4 bg-zinc-950 border-b border-white/10">
             <div className="flex bg-zinc-950/5 rounded px-2 py-0.5 items-center gap-1 border border-white/20">
                <Search className="w-3 h-3 text-white/70" />
                <span className="text-white/50 italic text-[10px] xl:text-xs">Find...</span>
             </div>
             <button className="flex items-center gap-1 bg-zinc-950/5 px-2 py-0.5 rounded border border-white/20 hover:bg-zinc-950/10 text-[10px] xl:text-xs">
                <RefreshCw className="w-3 h-3" /> Refresh
             </button>
             <button className="bg-zinc-950/5 px-2 py-0.5 rounded border border-white/20 hover:bg-zinc-950/10 text-[10px] xl:text-xs">Logoff</button>
          </div>
       </div>

       {/* PLANNING MODE BANNER */}
       <AnimatePresence>
       {dispatchStatus === 'planning' && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="bg-white/5 border-b border-white/10 text-zinc-300 px-4 py-2 flex items-center justify-between shadow-inner relative z-40 overflow-hidden"
           >
              <div className="flex items-center gap-2">
                 <MousePointer2 className="w-4 h-4 animate-bounce" />
                 <span className="font-bold text-sm">Select a time slot to dispatch Job #{activeTicket.number}</span>
                 <span className="text-xs opacity-70">(Click on any technician timeline)</span>
              </div>
              <div className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  Planning Mode Active
              </div>
           </motion.div>
       )}
       </AnimatePresence>

       {/* 2. TOOLBAR */}
       <div className="h-8 xl:h-10 bg-zinc-900 border-b border-white/10 flex items-center px-2 xl:px-4 justify-between shrink-0 relative z-30">
          <div className="flex gap-2 items-center">
             <ToolButton icon={Users} label="Teams" />
             <div className="h-4 w-px bg-zinc-950/20"></div>
             <ToolButton icon={Filter} label="Filters: None" />
             <ToolButton icon={Calendar} label="14 Apr 2025" />
             <div className="h-4 w-px bg-zinc-950/20"></div>
             <span className="font-bold text-amber-400 text-[11px] xl:text-sm">Display by Exception Type</span>
          </div>
          <div className="flex gap-2 items-center">
             <span className="text-zinc-500 text-[10px] xl:text-xs">Zoom:</span>
             <div className="flex bg-zinc-950 border border-gray-300 rounded overflow-hidden">
                <button className="px-2 hover:bg-white/10">-</button>
                <button className="px-2 hover:bg-white/10 border-l border-r">+</button>
             </div>
             <button 
                onClick={handleMobileSwitch}
                className="flex items-center gap-1 px-2 py-0.5 bg-zinc-950 border border-gray-300 rounded shadow-sm hover:bg-white/10 transition-colors text-zinc-300 font-bold text-[10px] xl:text-xs"
             >
                <Activity className="w-3 h-3 text-amber-500" /> Open Technician View
             </button>
          </div>
       </div>

       {/* 3. MAIN SPLIT VIEW */}
       <div className="flex-1 flex overflow-hidden relative z-0">
          
          {/* LEFT PANEL: RESOURCES */}
          <div className="w-64 xl:w-80 bg-zinc-950 border-r border-white/10 flex flex-col shrink-0">
             <div className="h-6 xl:h-8 bg-white/5 border-b border-white/10 flex items-center px-2 font-bold text-zinc-400 text-[11px] xl:text-sm">
                Resources (14)
             </div>
             <div className="grid grid-cols-[30px_1fr_1fr] bg-zinc-900 border-b border-white/10 py-1 px-1 font-bold text-zinc-500 text-[10px] xl:text-xs">
                <div>ID</div>
                <div>Name</div>
                <div>City</div>
             </div>
             <div className="flex-1 overflow-y-auto">
                {RESOURCES.map((res, i) => (
                   <div key={res.id} className={`group relative grid grid-cols-[30px_1fr_1fr] h-[30px] xl:h-[37px] px-1 border-b border-white/5 items-center hover:bg-white/5 cursor-pointer ${hoveredCell?.resourceId === res.id ? 'bg-white/10' : ''}`}>
                      <div className="text-zinc-500 text-[10px] xl:text-xs">{res.id}</div>
                      <div className="text-slate-300 truncate flex items-center gap-1 text-[11px] xl:text-sm font-medium">
                        {res.name}
                        {res.name.includes('Stefan') && diagnosis && (
                            <div className="flex items-center gap-0.5 bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/30 text-[8px] xl:text-[9px]">
                                <Box className="w-2 h-2" /> Match
                            </div>
                        )}
                      </div>
                      <div className="text-zinc-500 truncate text-[10px] xl:text-xs">{res.city}</div>
                      
                      {/* Inventory Tooltip */}
                      {res.name.includes('Stefan') && diagnosis && (
                         <div className="hidden group-hover:block absolute left-full top-0 z-50 bg-zinc-950 border border-gray-300 shadow-xl p-2 w-48 xl:w-56 rounded ml-1">
                            <div className="text-[9px] xl:text-[10px] font-bold text-zinc-500 mb-1 uppercase">Van Inventory Match</div>
                            {diagnosis.requiredParts.map((p: any) => (
                                <div key={p.id} className="flex justify-between text-[10px] xl:text-xs py-0.5">
                                    <span>{p.name.split(' ').slice(0,2).join(' ')}</span>
                                    <span className="text-emerald-400 font-bold">✓ Stock</span>
                                </div>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* CENTER PANEL: GANTT CHART */}
          <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative min-w-[400px]">
             <div className="h-6 xl:h-8 bg-zinc-900 border-b border-white/10 flex shrink-0 relative w-full pointer-events-none">
                {[8,9,10,11,12,13,14,15,16,17,18].map((hour, i) => (
                   <div key={hour} className="flex-1 border-r border-white/10 text-center pt-1 text-zinc-500 font-mono text-[10px] xl:text-xs min-w-[50px]">
                      {hour}:00
                   </div>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto relative w-full" style={{ cursor: dispatchStatus === 'planning' ? 'crosshair' : 'default' }}>
                <div className="absolute inset-0 flex pointer-events-none w-full">
                   {[...Array(11)].map((_, i) => (
                      <div key={i} className="flex-1 border-r border-dashed border-white/10 min-w-[50px]"></div>
                   ))}
                </div>

                {RESOURCES.map((res, i) => (
                   <div 
                        key={res.id} 
                        className={`h-[30px] xl:h-[37px] border-b border-white/5 relative hover:bg-white/5 w-full transition-colors ${hoveredCell?.resourceId === res.id ? 'bg-white/10/50' : ''}`}
                        onMouseMove={(e) => handleGridMouseMove(e, res.id)}
                        onMouseLeave={handleGridMouseLeave}
                        onClick={() => handleGridClick(res.id)}
                   >
                      {res.jobs.map((job, j) => (
                         <JobBlock key={j} {...job} />
                      ))}

                      {hoveredCell?.resourceId === res.id && dispatchStatus === 'planning' && (
                          <div 
                            className="absolute top-[4px] xl:top-[6px] h-[22px] xl:h-[25px] rounded-full border border-white/20 bg-white/10 shadow-lg z-20 flex items-center px-2 pointer-events-none"
                            style={{ 
                                left: `${(hoveredCell.time - 8) * 10}%`, 
                                width: '12%' 
                            }}
                          >
                             <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                             <span className="text-[9px] font-bold text-amber-400 truncate">
                                {formatTime(hoveredCell.time)}
                             </span>
                          </div>
                      )}

                      {assignedTech === res.name && dispatchStatus === 'confirmed' && (
                         <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="absolute top-[4px] xl:top-[6px] h-[22px] xl:h-[25px] rounded-full border border-white/20 bg-white/10 shadow-lg z-20 flex items-center justify-center px-2 cursor-pointer"
                            style={{ left: '65%', width: '12%' }} 
                         >
                            <div className="w-2 h-2 bg-red-500 rotate-45 mr-1"></div>
                            <span className="text-[9px] xl:text-[10px] font-bold text-amber-400 truncate">
                                {activeTicket.customer.name.substring(0, 12)}...
                            </span>
                         </motion.div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-64 xl:w-72 bg-zinc-900 border-l border-white/10 flex flex-col shrink-0">
             <div className="h-6 xl:h-8 bg-white/5 border-b border-white/10 flex items-center justify-between px-2 font-bold text-zinc-400 text-[11px] xl:text-sm">
                <span>Display by Exception</span>
                <Filter className="w-3 h-3" />
             </div>

             <div className="flex-1 overflow-y-auto p-1 space-y-1">
                <AccordionItem title="Planned Activity in jeopardy" count={59} color="bg-red-500/20 border-red-500/30" textColor="text-red-400">
                   <div className="pl-4 py-1 text-zinc-500 text-[10px] xl:text-xs">Electrician (1)</div>
                   <div className="pl-4 py-1 text-zinc-500 text-[10px] xl:text-xs">Normal (54)</div>
                   <div className="pl-4 py-1 text-zinc-500 text-[10px] xl:text-xs">Reactive (1)</div>
                </AccordionItem>

                <AccordionItem title="Unplanned Activities" count={5} color="bg-emerald-500/20 border-emerald-500/30" textColor="text-emerald-400" />
                <AccordionItem title="Unplanned Activity in jeopardy" count={5} color="bg-white/10 border-white/20" textColor="text-zinc-300" />

                <div className="mt-4 border border-white/10 bg-zinc-950">
                   <div className="bg-white/5 border-b border-white/10 px-2 py-1 font-bold text-[10px] xl:text-xs">Backlog</div>
                   {[...Array(8)].map((_,i) => (
                      <div key={i} className="flex justify-between px-2 py-1 border-b border-white/5 text-zinc-400 hover:bg-white/5 text-[10px] xl:text-xs cursor-pointer">
                         <span>Job #{2000 + i}</span>
                         <span className="text-zinc-500">1h 30m</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

       </div>
       
       <div className="h-6 xl:h-7 bg-black border-t border-white/10 flex items-center px-2 justify-between text-zinc-500 text-[10px] xl:text-xs relative z-30">
          <div className="flex gap-4">
            <span>Time Zone: GMT+1</span>
            <span>Dataset: 30PRDE</span>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <span>Online</span>
          </div>
       </div>

    </div>
  );
};

const Tab = ({ label, active }: any) => (
   <div className={`
      px-3 py-1.5 rounded-t-md text-[11px] xl:text-xs font-medium cursor-pointer transition-colors
      ${active ? 'bg-zinc-900 text-slate-300 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]' : 'text-white/80 hover:bg-zinc-950/10'}
   `}>
      {label}
   </div>
);

const ToolButton = ({ icon: Icon, label }: any) => (
   <button className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-slate-300 text-[10px] xl:text-xs">
      <Icon className="w-3 h-3 text-amber-500" /> {label}
   </button>
);

const JobBlock = ({ start, width, color, label }: any) => (
   <div 
      className={`absolute top-[4px] xl:top-[6px] h-[22px] xl:h-[25px] rounded-full border text-[9px] xl:text-[10px] flex items-center px-2 shadow-sm hover:brightness-95 cursor-pointer overflow-hidden whitespace-nowrap ${color}`}
      style={{ left: `${start}%`, width: `${width}%` }}
   >
      <div className="w-1.5 h-1.5 bg-red-600 rotate-45 mr-1 shrink-0"></div>
      <span className="font-medium truncate">{label}</span>
   </div>
);

const AccordionItem = ({ title, count, color, textColor, children }: any) => (
   <div className={`border rounded-sm ${color}`}>
      <div className={`px-2 py-1 flex justify-between font-bold text-[10px] xl:text-xs ${textColor} cursor-pointer`}>
         <div className="flex items-center gap-1">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-current"></div>
            {title}
         </div>
         <span>{count}</span>
      </div>
      {children}
   </div>
);

const RESOURCES = [
   { id: 'R16', name: 'John Roberts', city: 'Runcorn', jobs: [{ start: 10, width: 15, color: 'bg-white/10 border-white/20 text-zinc-300', label: 'A145' }, { start: 60, width: 20, color: 'bg-white/10 border-white/20 text-zinc-300', label: 'A138' }] },
   { id: 'R17', name: 'Brian James', city: 'Barlaston', jobs: [{ start: 25, width: 18, color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400', label: 'A124' }, { start: 75, width: 12, color: 'bg-red-500/20 border-red-500/30 text-red-400', label: 'A125' }] },
   { id: 'R15', name: 'Steven Cooper', city: 'Flint', jobs: [{ start: 5, width: 30, color: 'bg-white/10 border-white/20 text-zinc-300', label: 'A130' }] },
   { id: 'R4', name: 'Stefan K.', city: 'Hamburg', jobs: [{ start: 15, width: 10, color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', label: 'Travel' }] }, 
   { id: 'R14', name: 'Edward Morgan', city: 'Aston', jobs: [{ start: 40, width: 25, color: 'bg-white/10 border-white/20 text-zinc-300', label: 'A147' }] },
   { id: 'R1', name: 'Jeremy Green', city: 'Omptan', jobs: [] },
   { id: 'R22', name: 'Michael Clarke', city: 'Walton', jobs: [{ start: 55, width: 15, color: 'bg-red-500/20 border-red-500/30 text-red-400', label: 'A154' }] },
   { id: 'R23', name: 'Linda Watson', city: 'Shouldham', jobs: [{ start: 20, width: 12, color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400', label: 'A91' }] },
   { id: 'R21', name: 'Joanne Evans', city: 'Basingstoke', jobs: [{ start: 10, width: 40, color: 'bg-white/10 border-white/20 text-zinc-300', label: 'A116' }] },
   { id: 'R20', name: 'Sally King', city: 'Maidstone', jobs: [] },
   { id: 'R12', name: 'Ben Williams', city: 'Keynsham', jobs: [{ start: 5, width: 15, color: 'bg-white/10 border-white/20 text-zinc-300', label: 'A117' }] },
];
