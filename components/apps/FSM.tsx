
import React, { useEffect, useState } from 'react';
import { useOS } from '../../store';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, ChevronRight, 
  Settings, Calendar, Users, Map, Activity,
  Maximize2, RefreshCw, LogOut, Box
} from 'lucide-react';

export const FSM: React.FC = () => {
  const { assignedTech, agent, diagnosis, switchToApp, toggleSmartLens } = useOS();
  const [showNewJob, setShowNewJob] = useState(false);

  // Trigger animation when tech is assigned
  useEffect(() => {
    if (assignedTech) {
      const timer = setTimeout(() => setShowNewJob(true), 500);
      return () => clearTimeout(timer);
    }
  }, [assignedTech]);

  const handleMobileSwitch = () => {
      switchToApp('mobile');
      // Automatically open the Smart Lens when switching to mobile for demo purposes
      setTimeout(() => toggleSmartLens(true), 800);
  };

  return (
    <div className="h-full flex flex-col bg-[#E0E0E0] font-sans text-[10px] text-[#333] overflow-hidden select-none border border-gray-400">
       
       {/* 1. IFS PURPLE HEADER */}
       <div className="h-8 bg-[#5B2C6F] flex items-center px-2 justify-between shrink-0 text-white">
          <div className="flex items-end h-full gap-1 pt-1 overflow-x-auto no-scrollbar">
             <Tab label="Resources" active />
             <Tab label="Activities" />
             <Tab label="Mapping" />
             <Tab label="Advanced Mapping" />
             <Tab label="Compare" />
             <Tab label="System Status" />
             <Tab label="Analysis" />
          </div>
          <div className="flex items-center gap-2 pl-4 bg-[#5B2C6F]">
             <div className="flex bg-[#4A235A] rounded px-2 py-0.5 items-center gap-1 border border-white/20">
                <Search className="w-3 h-3 text-white/70" />
                <span className="text-white/50 italic">Find...</span>
             </div>
             <button className="flex items-center gap-1 bg-[#4A235A] px-2 py-0.5 rounded border border-white/20 hover:bg-[#6C3483]">
                <RefreshCw className="w-3 h-3" /> Refresh
             </button>
             <button className="bg-[#4A235A] px-2 py-0.5 rounded border border-white/20 hover:bg-[#6C3483]">Logoff</button>
          </div>
       </div>

       {/* 2. TOOLBAR */}
       <div className="h-8 bg-[#F5F5F5] border-b border-[#CCCCCC] flex items-center px-2 justify-between shrink-0">
          <div className="flex gap-2 items-center">
             <ToolButton icon={Users} label="Teams" />
             <div className="h-4 w-px bg-gray-300"></div>
             <ToolButton icon={Filter} label="Filters: None" />
             <ToolButton icon={Calendar} label="14 Apr 2025" />
             <div className="h-4 w-px bg-gray-300"></div>
             <span className="font-bold text-purple-900">Display by Exception Type</span>
          </div>
          <div className="flex gap-2 items-center">
             <span className="text-gray-500">Zoom:</span>
             <div className="flex bg-white border border-gray-300 rounded overflow-hidden">
                <button className="px-2 hover:bg-gray-100">-</button>
                <button className="px-2 hover:bg-gray-100 border-l border-r">+</button>
             </div>
             <button 
                onClick={handleMobileSwitch}
                className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-purple-50 transition-colors text-purple-900 font-bold animate-pulse"
             >
                <Activity className="w-3 h-3 text-purple-700" /> Open Technician View
             </button>
          </div>
       </div>

       {/* 3. MAIN SPLIT VIEW */}
       <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: RESOURCES */}
          <div className="w-64 bg-white border-r border-[#CCCCCC] flex flex-col shrink-0">
             <div className="h-6 bg-[#EFEFEF] border-b border-[#CCCCCC] flex items-center px-2 font-bold text-gray-600">
                Resources (14)
             </div>
             <div className="grid grid-cols-[30px_1fr_1fr] bg-[#FAFAFA] border-b border-[#E0E0E0] py-1 px-1 font-bold text-gray-500">
                <div>ID</div>
                <div>Name</div>
                <div>City</div>
             </div>
             <div className="flex-1 overflow-y-auto">
                {RESOURCES.map((res, i) => (
                   <div key={res.id} className={`group relative grid grid-cols-[30px_1fr_1fr] py-1.5 px-1 border-b border-[#F0F0F0] items-center hover:bg-blue-50 ${res.name.includes('Stefan') && diagnosis ? 'bg-emerald-50 font-medium' : ''}`}>
                      <div className="text-gray-500">{res.id}</div>
                      <div className="text-[#333] truncate flex items-center gap-1">
                        {res.name}
                        {/* SMART MATCH BADGE */}
                        {res.name.includes('Stefan') && diagnosis && (
                            <div className="flex items-center gap-0.5 bg-emerald-100 text-emerald-700 px-1 rounded border border-emerald-200 text-[8px]">
                                <Box className="w-2 h-2" /> 100%
                            </div>
                        )}
                      </div>
                      <div className="text-gray-500 truncate">{res.city}</div>
                      
                      {/* Inventory Tooltip */}
                      {res.name.includes('Stefan') && diagnosis && (
                         <div className="hidden group-hover:block absolute left-full top-0 z-50 bg-white border border-gray-300 shadow-xl p-2 w-48 rounded ml-1">
                            <div className="text-[9px] font-bold text-gray-500 mb-1 uppercase">Van Inventory Match</div>
                            {diagnosis.requiredParts.map((p: any) => (
                                <div key={p.id} className="flex justify-between text-[10px]">
                                    <span>{p.name.split(' ').slice(0,2).join(' ')}</span>
                                    <span className="text-emerald-600 font-bold">✓ Stock</span>
                                </div>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* CENTER PANEL: GANTT CHART */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
             <div className="h-6 bg-[#F9F9F9] border-b border-[#CCCCCC] flex shrink-0 relative">
                {[8,9,10,11,12,13,14,15,16,17,18].map((hour, i) => (
                   <div key={hour} className="flex-1 border-r border-[#E0E0E0] text-center pt-1 text-gray-400 font-mono">
                      {hour}:00
                   </div>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto relative">
                <div className="absolute inset-0 flex pointer-events-none">
                   {[...Array(11)].map((_, i) => (
                      <div key={i} className="flex-1 border-r border-dashed border-[#E0E0E0]"></div>
                   ))}
                </div>

                {RESOURCES.map((res, i) => (
                   <div key={res.id} className={`h-[29px] border-b border-[#F0F0F0] relative hover:bg-gray-50 w-full ${res.name.includes('Stefan') && diagnosis ? 'bg-emerald-50/30' : ''}`}>
                      {res.jobs.map((job, j) => (
                         <JobBlock key={j} {...job} />
                      ))}

                      {res.name.includes('Stefan') && showNewJob && (
                         <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="absolute top-[4px] h-[20px] rounded-full border border-amber-600 bg-amber-200 shadow-lg z-20 flex items-center justify-center px-2 cursor-pointer"
                            style={{ left: '65%', width: '12%' }}
                         >
                            <div className="w-2 h-2 bg-red-500 rotate-45 mr-1"></div>
                            <span className="text-[9px] font-bold text-amber-900">DMK Milch...</span>
                         </motion.div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-64 bg-[#F5F5F5] border-l border-[#CCCCCC] flex flex-col shrink-0">
             <div className="h-6 bg-[#EFEFEF] border-b border-[#CCCCCC] flex items-center justify-between px-2 font-bold text-gray-600">
                <span>Display by Exception</span>
                <Filter className="w-3 h-3" />
             </div>

             <div className="flex-1 overflow-y-auto p-1 space-y-1">
                <AccordionItem title="Planned Activity in jeopardy" count={59} color="bg-red-100 border-red-300" textColor="text-red-800">
                   <div className="pl-4 py-1 text-gray-500">Electrician (1)</div>
                   <div className="pl-4 py-1 text-gray-500">Normal (54)</div>
                   <div className="pl-4 py-1 text-gray-500">Reactive (1)</div>
                </AccordionItem>

                <AccordionItem title="Unplanned Activities" count={5} color="bg-green-100 border-green-300" textColor="text-green-800" />
                
                <AccordionItem title="Unplanned Activity in jeopardy" count={5} color="bg-orange-100 border-orange-300" textColor="text-orange-800" />

                <div className="mt-4 border border-[#CCCCCC] bg-white">
                   <div className="bg-[#EFEFEF] border-b border-[#CCCCCC] px-2 py-1 font-bold">Backlog</div>
                   {[...Array(8)].map((_,i) => (
                      <div key={i} className="flex justify-between px-2 py-1 border-b border-[#F0F0F0] text-gray-600 hover:bg-blue-50">
                         <span>Job #{2000 + i}</span>
                         <span className="text-gray-400">1h 30m</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

       </div>
       
       <div className="h-6 bg-[#E0E0E0] border-t border-[#CCCCCC] flex items-center px-2 justify-between text-gray-500">
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
      px-3 py-1.5 rounded-t-md text-[11px] font-medium cursor-pointer transition-colors
      ${active ? 'bg-[#F5F5F5] text-[#333] shadow-[0_-2px_4px_rgba(0,0,0,0.1)]' : 'text-white/80 hover:bg-[#6C3483]'}
   `}>
      {label}
   </div>
);

const ToolButton = ({ icon: Icon, label }: any) => (
   <button className="flex items-center gap-1 px-2 py-0.5 hover:bg-gray-200 rounded text-gray-700">
      <Icon className="w-3 h-3 text-purple-700" /> {label}
   </button>
);

const JobBlock = ({ start, width, color, label }: any) => (
   <div 
      className={`absolute top-[4px] h-[20px] rounded-full border text-[9px] flex items-center px-2 shadow-sm hover:brightness-95 cursor-pointer overflow-hidden whitespace-nowrap ${color}`}
      style={{ left: `${start}%`, width: `${width}%` }}
   >
      <div className="w-1.5 h-1.5 bg-red-600 rotate-45 mr-1 shrink-0"></div>
      <span className="font-medium">{label}</span>
   </div>
);

const AccordionItem = ({ title, count, color, textColor, children }: any) => (
   <div className={`border rounded-sm ${color}`}>
      <div className={`px-2 py-1 flex justify-between font-bold ${textColor} cursor-pointer`}>
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
   { id: 'R16', name: 'John Roberts', city: 'Runcorn', jobs: [{ start: 10, width: 15, color: 'bg-blue-200 border-blue-400 text-blue-800', label: 'A145' }, { start: 60, width: 20, color: 'bg-purple-200 border-purple-400 text-purple-800', label: 'A138' }] },
   { id: 'R17', name: 'Brian James', city: 'Barlaston', jobs: [{ start: 25, width: 18, color: 'bg-yellow-100 border-yellow-400 text-yellow-800', label: 'A124' }, { start: 75, width: 12, color: 'bg-red-100 border-red-400 text-red-800', label: 'A125' }] },
   { id: 'R15', name: 'Steven Cooper', city: 'Flint', jobs: [{ start: 5, width: 30, color: 'bg-blue-200 border-blue-400 text-blue-800', label: 'A130' }] },
   { id: 'R4', name: 'Stefan K.', city: 'Hamburg', jobs: [{ start: 15, width: 10, color: 'bg-green-100 border-green-400 text-green-800', label: 'Travel' }] }, // AEDIL TARGET
   { id: 'R14', name: 'Edward Morgan', city: 'Aston', jobs: [{ start: 40, width: 25, color: 'bg-purple-200 border-purple-400 text-purple-800', label: 'A147' }] },
   { id: 'R1', name: 'Jeremy Green', city: 'Omptan', jobs: [] },
   { id: 'R22', name: 'Michael Clarke', city: 'Walton', jobs: [{ start: 55, width: 15, color: 'bg-red-100 border-red-400 text-red-800', label: 'A154' }] },
   { id: 'R23', name: 'Linda Watson', city: 'Shouldham', jobs: [{ start: 20, width: 12, color: 'bg-yellow-100 border-yellow-400 text-yellow-800', label: 'A91' }] },
   { id: 'R21', name: 'Joanne Evans', city: 'Basingstoke', jobs: [{ start: 10, width: 40, color: 'bg-blue-200 border-blue-400 text-blue-800', label: 'A116' }] },
   { id: 'R20', name: 'Sally King', city: 'Maidstone', jobs: [] },
   { id: 'R12', name: 'Ben Williams', city: 'Keynsham', jobs: [{ start: 5, width: 15, color: 'bg-purple-200 border-purple-400 text-purple-800', label: 'A117' }] },
];