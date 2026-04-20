
import React from 'react';
import { useOS } from '../../store';
import { 
  Save, ArrowLeft, X, Printer, Search, HelpCircle, 
  MoreVertical, ChevronLeft, ChevronRight, ChevronDown,
  Maximize2, Settings, Menu, FileText, User, Calendar,
  Briefcase, AlertTriangle, Binoculars, Zap, ArrowUpRight, Brain, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SAP: React.FC = () => {
  const { sapForm, updateSapField, diagnosis } = useOS();

  // Check if user has explicitly rejected the diagnosis
  const isRejected = diagnosis?.feedback?.status === 'rejected';

  return (
    <div className="h-full flex flex-col bg-black font-sans text-[11px] xl:text-sm text-slate-300 overflow-hidden select-none relative transition-all">
       
       {/* 1. SAP MENU BAR */}
       <div className="h-7 xl:h-8 bg-gradient-to-b from-white/10 to-white/5 border-b border-white/10 flex items-center px-2 text-zinc-400 shrink-0">
          <div className="flex gap-3 px-1 text-[11px] xl:text-xs">
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">Service Notification</span>
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">Edit</span>
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">Goto</span>
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">Extras</span>
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">Environment</span>
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">System</span>
             <span className="hover:bg-zinc-900/10 px-1 cursor-default">Help</span>
          </div>
       </div>

       {/* 2. STANDARD TOOLBAR */}
       <div className="h-9 xl:h-11 bg-black border-b border-white/10 flex items-center px-2 gap-1 shadow-sm shrink-0">
          <div className="flex items-center bg-zinc-900 border border-white/20 rounded-sm h-6 xl:h-8 px-1 w-48 xl:w-64 shadow-inner">
             <div className="text-emerald-400 mr-auto"><CheckIcon /></div>
             <input className="w-full text-[11px] xl:text-sm outline-none ml-1" placeholder="" />
             <ChevronDown className="w-3 h-3 text-zinc-500" />
          </div>
          <div className="w-px h-6 bg-[#BDC7D6] mx-1"></div>
          <ToolbarIcon icon={Save} tooltip="Save (Ctrl+S)" />
          <ToolbarIcon icon={ArrowLeft} tooltip="Back" />
          <ToolbarIcon icon={X} tooltip="Exit" />
          <ToolbarIcon icon={Printer} tooltip="Print" />
          <div className="w-px h-6 bg-[#BDC7D6] mx-1"></div>
          <ToolbarIcon icon={Search} tooltip="Find" />
          <div className="ml-auto flex items-center gap-1">
             <HelpCircle className="w-4 h-4 xl:w-5 xl:h-5 text-blue-400" />
             <Settings className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-400" />
          </div>
       </div>

       {/* 3. TITLE BAR */}
       <div className="h-7 xl:h-9 bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 xl:w-5 xl:h-5 bg-white/10 border border-white/20 rounded-sm flex items-center justify-center">
                <FileText className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-amber-400" />
             </div>
             <span className="font-bold text-slate-300 text-[12px] xl:text-sm italic text-shadow-sm">Change Service Notification: JH Service Notification</span>
          </div>
       </div>

       {/* 4. HEADER FIELDS */}
       <div className="px-4 py-2 xl:py-4 flex items-center gap-6 border-b border-white/10 shrink-0 bg-zinc-950">
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
             <label className="w-20 xl:w-28 text-right font-medium text-zinc-400">Notification</label>
             <div className="flex flex-1">
               <input value="11447115" readOnly className="w-24 xl:w-32 bg-zinc-900 border border-white/20 px-1 h-5 xl:h-7 shadow-inner text-slate-300" />
               <div className="bg-zinc-900 border border-white/20 border-l-0 px-1 h-5 xl:h-7 flex items-center justify-center w-6">
                  <FileText className="w-3 h-3 text-zinc-500" />
               </div>
               <input value="Hydraulic Fault" readOnly className="flex-1 min-w-[200px] bg-black border border-white/20 px-1 h-5 xl:h-7 ml-1 font-bold text-white" />
             </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
             <label className="text-right font-medium text-zinc-400">Status</label>
             <input value="OSNO" readOnly className="w-16 xl:w-20 bg-zinc-900 border border-white/20 px-1 h-5 xl:h-7 shadow-inner text-center font-bold" />
             <span className="text-zinc-500 whitespace-nowrap hidden sm:inline">Outstanding Notification</span>
          </div>
       </div>

       {/* 5. CONTENT AREA */}
       <div className="flex-1 overflow-y-auto p-2 xl:p-4 relative">
          
          {/* TABS */}
          <div className="flex items-end px-2 gap-0.5 h-7 xl:h-8 border-b border-white/10">
             <Tab active label="Cust. Report via Dispatcher" icon={User} />
             <Tab label="Additional Data" icon={Briefcase} />
             <Tab label="Tasks" icon={FileText} />
             <Tab label="Credit Check" icon={AlertTriangle} />
          </div>

          <div className="bg-zinc-950 border border-white/10 border-t-0 p-3 xl:p-6 shadow-sm h-full flex flex-col gap-2 xl:gap-4">
             
             {/* TOP SECTION: 2 COLUMNS ON LARGE SCREENS */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                
                {/* GROUP: Reference Object */}
                <GroupPanel title="Reference Object">
                   <div className="grid grid-cols-[100px_1fr] xl:grid-cols-[120px_1fr] gap-y-2 xl:gap-y-4 items-center">
                      <label className="text-right pr-2 text-zinc-400 font-medium">Equipment</label>
                      <div className="flex items-center gap-1 w-full">
                         <input 
                           value={sapForm.equipment}
                           onChange={(e) => updateSapField('equipment', e.target.value)}
                           className={`flex-1 h-5 xl:h-8 border border-white/20 px-2 shadow-inner outline-none focus:bg-white/10 transition-colors ${sapForm.equipment ? 'bg-black' : 'bg-black'}`} 
                         />
                         <div className="text-[10px] xl:text-xs text-zinc-500 whitespace-nowrap px-1">EJC 220 Li-Ion</div>
                         <div className="ml-2 flex gap-1">
                            <IconButton icon={Binoculars} />
                            <IconButton icon={Maximize2} />
                         </div>
                      </div>
                   </div>
                </GroupPanel>

                {/* GROUP: Contact Person */}
                <GroupPanel title="Contact Partner">
                   <div className="grid grid-cols-[100px_1fr] xl:grid-cols-[120px_1fr] gap-y-2 xl:gap-y-4 items-center">
                      <label className="text-right pr-2 font-medium">Sold-to Party</label>
                      <div className="flex items-center gap-1 w-full">
                         <input 
                            value={sapForm.soldToParty}
                            onChange={(e) => updateSapField('soldToParty', e.target.value)}
                            className="w-24 xl:w-32 h-5 xl:h-8 border border-white/20 bg-zinc-900 px-2 shadow-inner focus:bg-white/10" 
                         />
                         <input 
                           value={sapForm.soldToParty ? (sapForm.customerName || "Dynamic Debitor GmbH") : ""} 
                           readOnly 
                           className="flex-1 h-5 xl:h-8 border border-white/20 bg-zinc-900 px-2 text-zinc-400" 
                         />
                      </div>

                      <label className="text-right pr-2 font-medium">Customer Addr.</label>
                      <div className="flex items-center gap-1 w-full">
                          <input value={sapForm.customerAddress || "49451, Holdorf, Dammer Str. 60"} readOnly className="flex-1 h-5 xl:h-8 border border-white/20 bg-zinc-900 px-2 text-zinc-400" />
                          <div className="flex flex-col gap-0.5 text-right text-[10px] xl:text-xs ml-2">
                             <div className="bg-zinc-900 border border-white/20 px-1 whitespace-nowrap">10.09.2025</div>
                             <div className="bg-zinc-900 border border-white/20 px-1 whitespace-nowrap">13:45:25</div>
                          </div>
                      </div>
                   </div>
                </GroupPanel>
             </div>

             <div className="flex gap-2 xl:gap-6 flex-1 min-h-0">
                <div className="flex-1 flex flex-col gap-2 xl:gap-4">
                     {/* GROUP: Execution */}
                     <GroupPanel title="Execution">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-8">
                           {/* Left Column */}
                           <div className="grid grid-cols-[100px_1fr] xl:grid-cols-[120px_1fr] gap-y-2 xl:gap-y-4 items-center">
                              <label className="text-right pr-2 font-medium">Priority</label>
                              <select 
                                value={sapForm.priority}
                                onChange={(e) => updateSapField('priority', e.target.value)}
                                className="h-5 xl:h-8 border border-white/20 bg-zinc-900 w-full text-[11px] xl:text-sm px-1"
                              >
                                 <option value="">Select...</option>
                                 <option value="1-Very High">1-Very High</option>
                                 <option value="2-High">2-High</option>
                                 <option value="3-Medium">3-Medium</option>
                              </select>

                              <label className="text-right pr-2 font-medium">Req. Start</label>
                              <div className="flex gap-1 w-full">
                                 <input defaultValue="20.11.2025" className="flex-1 h-5 xl:h-8 border border-white/20 px-2" />
                                 <input defaultValue="14:00:00" className="w-20 h-5 xl:h-8 border border-white/20 px-2" />
                              </div>
                           </div>
                           
                           {/* Right Column */}
                           <div className="grid grid-cols-[80px_1fr] xl:grid-cols-[100px_1fr] gap-y-2 xl:gap-y-4 items-center">
                              <div className="col-span-2 flex justify-end gap-2 items-center">
                                 <input type="checkbox" className="xl:w-4 xl:h-4" /> <label className="font-medium">Breakdown</label>
                              </div>
                              <label className="text-right pr-2 font-medium">Req. End</label>
                              <div className="flex gap-1 w-full">
                                 <input defaultValue="20.11.2025" className="flex-1 h-5 xl:h-8 border border-white/20 px-2" />
                                 <input defaultValue="18:00:00" className="w-20 h-5 xl:h-8 border border-white/20 px-2" />
                              </div>
                           </div>
                        </div>
                     </GroupPanel>

                     {/* GROUP: Facts / Subject */}
                     <GroupPanel title="Subject / Description">
                        <div className="flex flex-col gap-2 h-full">
                           <div className="flex gap-2 items-center">
                              <label className="w-24 xl:w-32 text-right pr-2 font-medium">Description</label>
                              <input 
                                value={sapForm.shortText}
                                onChange={(e) => updateSapField('shortText', e.target.value)}
                                className="flex-1 h-5 xl:h-8 border border-white/20 bg-zinc-900 px-2 focus:bg-white/10 font-medium" 
                              />
                           </div>
                           <div className="flex-1 flex pl-[104px] xl:pl-[136px]">
                               <textarea 
                                className="w-full h-full min-h-[100px] border border-white/20 bg-zinc-900 p-2 resize-none shadow-inner font-mono text-[11px] xl:text-sm leading-tight focus:bg-white/10 outline-none"
                                defaultValue={sapForm.errorDesc} 
                                />
                           </div>
                        </div>
                     </GroupPanel>
                </div>
                
                {/* 
                    [REMOVED] The 'Curio Insight' card has been removed. 
                    The actions (Approve, Inspect, Reject) are now handled exclusively by the Aedil Overlay.
                */}
             </div>

          </div>
       </div>
       
       {/* 6. STATUS BAR */}
       <div className="h-6 xl:h-7 bg-black border-t border-white/20 flex items-center px-2 text-zinc-500 text-[10px] xl:text-xs justify-between shrink-0">
          <div className="flex items-center gap-2">
             <span>No system messages</span>
             {isRejected && <span className="text-red-500 font-bold flex items-center gap-1"><X className="w-3 h-3"/> AI Recommendation Rejected (Manual Mode)</span>}
          </div>
          <div className="flex gap-4">
             <span>INS</span>
             <span>PRD (100)</span>
             <span>{sapForm.isDirty ? 'Unsaved Data' : 'Saved'}</span>
          </div>
       </div>

    </div>
  );
};

// --- SUB-COMPONENTS ---

const ToolbarIcon = ({ icon: Icon, tooltip }: any) => (
   <button title={tooltip} className="p-0.5 xl:p-1 hover:bg-white/10 hover:border hover:border-white/20 border border-transparent rounded-[2px] active:bg-white/20 transition-colors">
      <Icon className="w-4 h-4 xl:w-6 xl:h-6 text-zinc-400" strokeWidth={1.5} />
   </button>
);

const CheckIcon = () => (
   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="xl:w-5 xl:h-5">
      <polyline points="20 6 9 17 4 12"></polyline>
   </svg>
);

const IconButton = ({ icon: Icon }: any) => (
   <button className="w-5 h-5 xl:w-8 xl:h-8 flex items-center justify-center bg-white/5 border border-white/20 hover:bg-white/10 rounded-[2px]">
      <Icon className="w-3 h-3 xl:w-4 xl:h-4 text-slate-300" />
   </button>
);

const Tab = ({ active, label, icon: Icon }: any) => (
   <div className={`
      flex items-center gap-1.5 px-3 h-full rounded-t-[3px] border border-white/10 border-b-0 text-[11px] xl:text-sm cursor-pointer select-none transition-colors
      ${active 
        ? 'bg-zinc-950 font-bold text-white relative -mb-[1px] z-10' 
        : 'bg-gradient-to-b from-white/5 to-transparent text-zinc-400 hover:from-white/10 hover:to-white/5'
      }
   `}>
      {Icon && <Icon className={`w-3 h-3 xl:w-4 xl:h-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} />}
      <span>{label}</span>
   </div>
);

const GroupPanel = ({ title, children }: any) => (
   <div className="border border-white/10 rounded-sm mb-2 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-white/10 to-white/5 px-2 py-0.5 font-bold text-slate-200 text-[11px] xl:text-sm border-b border-white/10">
         {title}
      </div>
      <div className="p-2 xl:p-4 bg-black/30 flex-1">
         {children}
      </div>
   </div>
);
