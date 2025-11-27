





import React from 'react';
import { useOS } from '../../store';
import { 
  Save, ArrowLeft, X, Printer, Search, HelpCircle, 
  MoreVertical, ChevronLeft, ChevronRight, ChevronDown,
  Maximize2, Settings, Menu, FileText, User, Calendar,
  Briefcase, AlertTriangle, Binoculars, Zap, ArrowUpRight, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SAP: React.FC = () => {
  const { sapForm, updateSapField, diagnosis, viewTicketAnalysis, manualOverride } = useOS();

  // Check if user has explicitly rejected the diagnosis
  const isRejected = diagnosis?.feedback?.status === 'rejected';

  return (
    <div className="h-full flex flex-col bg-[#EAF0F6] font-sans text-[11px] text-[#333] overflow-hidden select-none relative">
       
       {/* 1. SAP MENU BAR */}
       <div className="h-7 bg-gradient-to-b from-[#F7F9FB] to-[#DEE5F0] border-b border-[#A3B0C5] flex items-center px-2 text-[#444]">
          <div className="flex gap-3 px-1">
             <span className="hover:bg-blue-100 px-1 cursor-default">Service Notification</span>
             <span className="hover:bg-blue-100 px-1 cursor-default">Edit</span>
             <span className="hover:bg-blue-100 px-1 cursor-default">Goto</span>
             <span className="hover:bg-blue-100 px-1 cursor-default">Extras</span>
             <span className="hover:bg-blue-100 px-1 cursor-default">Environment</span>
             <span className="hover:bg-blue-100 px-1 cursor-default">System</span>
             <span className="hover:bg-blue-100 px-1 cursor-default">Help</span>
          </div>
       </div>

       {/* 2. STANDARD TOOLBAR */}
       <div className="h-9 bg-[#EAF0F6] border-b border-[#BDC7D6] flex items-center px-2 gap-1 shadow-sm">
          <div className="flex items-center bg-white border border-[#ABADB3] rounded-sm h-6 px-1 w-48 shadow-inner">
             <div className="text-green-600 mr-auto"><CheckIcon /></div>
             <input className="w-full text-[11px] outline-none ml-1" placeholder="" />
             <ChevronDown className="w-3 h-3 text-gray-500" />
          </div>
          <div className="w-px h-6 bg-[#BDC7D6] mx-1"></div>
          <ToolbarIcon icon={Save} tooltip="Save (Ctrl+S)" />
          <ToolbarIcon icon={ArrowLeft} tooltip="Back" />
          <ToolbarIcon icon={X} tooltip="Exit" />
          <ToolbarIcon icon={Printer} tooltip="Print" />
          <div className="w-px h-6 bg-[#BDC7D6] mx-1"></div>
          <ToolbarIcon icon={Search} tooltip="Find" />
          <div className="ml-auto flex items-center gap-1">
             <HelpCircle className="w-4 h-4 text-blue-600" />
             <Settings className="w-4 h-4 text-[#666]" />
          </div>
       </div>

       {/* 3. TITLE BAR */}
       <div className="h-7 bg-gradient-to-r from-[#E1E9F4] to-[#C9D6E9] border-b border-[#99A8BF] flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-600 rounded-sm flex items-center justify-center">
                <FileText className="w-3 h-3 text-yellow-700" />
             </div>
             <span className="font-bold text-[#333] text-[12px] italic text-shadow-sm">Change Service Notification: JH Service Notification</span>
          </div>
       </div>

       {/* 4. HEADER FIELDS */}
       <div className="px-4 py-2 flex items-center gap-6 border-b border-[#D0D9E5]">
          <div className="flex items-center gap-2">
             <label className="w-20 text-right">Notification</label>
             <div className="flex">
               <input value="11447115" readOnly className="w-24 bg-[#EBEBE4] border border-[#A0A0A0] px-1 h-5 shadow-inner" />
               <div className="bg-[#EBEBE4] border border-[#A0A0A0] border-l-0 px-1 h-5 flex items-center justify-center w-6">
                  <FileText className="w-3 h-3 text-gray-500" />
               </div>
             </div>
             <input value="Hydraulic Fault" readOnly className="w-48 bg-[#FFF] border border-[#A0A0A0] px-1 h-5 ml-1" />
          </div>
          <div className="flex items-center gap-2">
             <label className="w-12 text-right">Status</label>
             <input value="OSNO" readOnly className="w-16 bg-[#EBEBE4] border border-[#A0A0A0] px-1 h-5 shadow-inner" />
             <span className="text-gray-500">Outstanding Notification</span>
          </div>
       </div>

       {/* 5. CONTENT AREA */}
       <div className="flex-1 overflow-y-auto p-2 relative">
          
          {/* TABS */}
          <div className="flex items-end px-2 gap-0.5 h-7 border-b border-[#99A8BF]">
             <Tab active label="Cust. Report via Dispatcher" icon={User} />
             <Tab label="Additional Data" icon={Briefcase} />
             <Tab label="Tasks" icon={FileText} />
             <Tab label="Credit Check" icon={AlertTriangle} />
          </div>

          <div className="bg-[#F4F7FC] border border-[#99A8BF] border-t-0 p-3 shadow-sm h-full flex flex-col">
             
             {/* GROUP: Reference Object */}
             <GroupPanel title="Reference Object">
                <div className="grid grid-cols-[100px_1fr] gap-y-2 items-center">
                   <label className="text-right pr-2 text-[#444]">Equipment</label>
                   <div className="flex items-center gap-1">
                      <input 
                        value={sapForm.equipment}
                        onChange={(e) => updateSapField('equipment', e.target.value)}
                        className={`w-32 h-5 border border-[#7F9DB9] px-1 shadow-inner outline-none focus:bg-[#FEFFD6] transition-colors ${sapForm.equipment ? 'bg-[#FFF]' : 'bg-[#FFF]'}`} 
                      />
                      <div className="text-[10px] text-gray-500">EJC 220 Li-Ion</div>
                      <div className="ml-auto flex gap-1">
                         <IconButton icon={Binoculars} />
                         <IconButton icon={Maximize2} />
                      </div>
                   </div>
                </div>
             </GroupPanel>

             {/* GROUP: Contact Person */}
             <GroupPanel title="Contact Partner">
                <div className="grid grid-cols-[100px_1fr] gap-y-2 items-center">
                   <label className="text-right pr-2">Sold-to Party</label>
                   <div className="flex items-center gap-1">
                      <input 
                         value={sapForm.soldToParty}
                         onChange={(e) => updateSapField('soldToParty', e.target.value)}
                         className="w-24 h-5 border border-[#7F9DB9] bg-white px-1 shadow-inner focus:bg-[#FEFFD6]" 
                      />
                      <input 
                        value={sapForm.soldToParty ? (sapForm.customerName || "Dynamic Debitor GmbH") : ""} 
                        readOnly 
                        className="flex-1 h-5 border border-[#A0A0A0] bg-[#EBEBE4] px-1 text-gray-600" 
                      />
                   </div>

                   <label className="text-right pr-2">Customer Addr.</label>
                   <div className="flex items-center gap-1">
                       <input value={sapForm.customerAddress || "49451, Holdorf, Dammer Str. 60"} readOnly className="flex-1 h-5 border border-[#A0A0A0] bg-[#EBEBE4] px-1 text-gray-600" />
                       <div className="flex flex-col gap-0.5 text-right text-[10px]">
                          <div className="bg-white border border-[#A0A0A0] px-1">10.09.2025</div>
                          <div className="bg-white border border-[#A0A0A0] px-1">13:45:25</div>
                       </div>
                   </div>
                </div>
             </GroupPanel>

             <div className="flex gap-2 flex-1 min-h-0">
                <div className="flex-1">
                     {/* GROUP: Execution */}
                     <GroupPanel title="Execution">
                        <div className="grid grid-cols-2 gap-4">
                           {/* Left Column */}
                           <div className="grid grid-cols-[100px_1fr] gap-y-2 items-center">
                              <label className="text-right pr-2">Priority</label>
                              <select 
                                value={sapForm.priority}
                                onChange={(e) => updateSapField('priority', e.target.value)}
                                className="h-5 border border-[#7F9DB9] bg-white w-full text-[11px]"
                              >
                                 <option value="">Select...</option>
                                 <option value="1-Very High">1-Very High</option>
                                 <option value="2-High">2-High</option>
                                 <option value="3-Medium">3-Medium</option>
                              </select>

                              <label className="text-right pr-2">Req. Start</label>
                              <div className="flex gap-1">
                                 <input defaultValue="20.11.2025" className="w-20 h-5 border border-[#7F9DB9] px-1" />
                                 <input defaultValue="14:00:00" className="w-16 h-5 border border-[#7F9DB9] px-1" />
                              </div>
                           </div>
                           
                           {/* Right Column */}
                           <div className="grid grid-cols-[80px_1fr] gap-y-2 items-center">
                              <div className="col-span-2 flex justify-end gap-2 items-center">
                                 <input type="checkbox" /> <label>Breakdown</label>
                              </div>
                              <label className="text-right pr-2">Req. End</label>
                              <div className="flex gap-1">
                                 <input defaultValue="20.11.2025" className="w-20 h-5 border border-[#7F9DB9] px-1" />
                                 <input defaultValue="18:00:00" className="w-16 h-5 border border-[#7F9DB9] px-1" />
                              </div>
                           </div>
                        </div>
                     </GroupPanel>

                     {/* GROUP: Facts / Subject */}
                     <GroupPanel title="Subject / Description">
                        <div className="flex flex-col gap-1">
                           <div className="flex gap-2 items-center">
                              <label className="w-24 text-right pr-2">Description</label>
                              <input 
                                value={sapForm.shortText}
                                onChange={(e) => updateSapField('shortText', e.target.value)}
                                className="flex-1 h-5 border border-[#7F9DB9] bg-white px-1 focus:bg-[#FEFFD6]" 
                              />
                           </div>
                           <textarea 
                             className="w-full h-24 border border-[#7F9DB9] bg-white p-1 resize-none shadow-inner font-mono text-[10px] leading-tight ml-[108px] max-w-[calc(100%-108px)] focus:bg-[#FEFFD6] outline-none"
                             defaultValue={sapForm.errorDesc} // This would be the long text
                           />
                        </div>
                     </GroupPanel>
                </div>
                
                {/* NEURAL INSIGHT CARD */}
                <AnimatePresence>
                    {diagnosis && diagnosis.isComplete && !isRejected && (
                        <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="w-[280px] bg-white border border-indigo-200 rounded-lg shadow-xl flex flex-col overflow-hidden shrink-0 relative"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <Brain className="w-4 h-4" />
                                    <span className="font-bold text-xs tracking-wide">Curio Insight</span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-[9px] text-white font-mono">
                                    <Zap className="w-2.5 h-2.5" /> 24ms
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Diagnosis</div>
                                <div className="text-sm font-bold text-slate-800 leading-tight mb-2">
                                    {diagnosis.primaryFault.fault}
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[89%]"></div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600">89% Conf.</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-3">
                                    {diagnosis.primaryFault.reasoning}
                                </p>
                                
                                <div className="mt-auto pt-3 border-t border-indigo-50 flex flex-col gap-2">
                                    <button 
                                        onClick={() => viewTicketAnalysis(diagnosis.ticketId)}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[10px] font-bold transition-colors shadow-sm"
                                    >
                                        <Search className="w-3.5 h-3.5" /> INSPECT REASONING
                                    </button>
                                    
                                    <button 
                                        onClick={manualOverride}
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-md text-[10px] font-bold transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" /> REJECT / MANUAL OVERRIDE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

          </div>
       </div>
       
       {/* 6. STATUS BAR */}
       <div className="h-6 bg-[#EAF0F6] border-t border-[#A0A0A0] flex items-center px-2 text-gray-500 text-[10px] justify-between">
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
   <button title={tooltip} className="p-0.5 hover:bg-[#D3E0F0] hover:border hover:border-[#8EA6CE] border border-transparent rounded-[2px] active:bg-[#B4C7E3]">
      <Icon className="w-4 h-4 text-[#555]" strokeWidth={1.5} />
   </button>
);

const CheckIcon = () => (
   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
      <polyline points="20 6 9 17 4 12"></polyline>
   </svg>
);

const IconButton = ({ icon: Icon }: any) => (
   <button className="w-5 h-5 flex items-center justify-center bg-[#F0F0F0] border border-[#888] hover:bg-[#E0E0E0] rounded-[2px]">
      <Icon className="w-3 h-3 text-[#333]" />
   </button>
);

const Tab = ({ active, label, icon: Icon }: any) => (
   <div className={`
      flex items-center gap-1.5 px-3 h-full rounded-t-[3px] border border-[#99A8BF] border-b-0 text-[11px] cursor-pointer select-none
      ${active 
        ? 'bg-[#F4F7FC] font-bold text-[#000] relative -mb-[1px] z-10' 
        : 'bg-gradient-to-b from-[#E8E8E8] to-[#D0D0D0] text-[#555] hover:from-[#F0F0F0] hover:to-[#E0E0E0]'
      }
   `}>
      {Icon && <Icon className={`w-3 h-3 ${active ? 'text-orange-600' : 'text-gray-500'}`} />}
      <span>{label}</span>
   </div>
);

const GroupPanel = ({ title, children }: any) => (
   <div className="border border-[#B0B9C6] rounded-sm mb-2 overflow-hidden">
      <div className="bg-gradient-to-r from-[#D3E0F0] to-[#EAF0F6] px-2 py-0.5 font-bold text-[#334455] text-[11px] border-b border-[#CAD5E2]">
         {title}
      </div>
      <div className="p-2 bg-[#EAF0F6]/30">
         {children}
      </div>
   </div>
);