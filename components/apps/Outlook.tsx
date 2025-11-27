
import React, { useState } from 'react';
import { useOS } from '../../store';
import { 
  Mail, Calendar, Users, Archive, Trash2, Star, 
  Search, Paperclip, MoreHorizontal, ChevronDown, 
  Reply, ReplyAll, Forward, ThumbsUp, Heart, Smile, CheckCircle
} from 'lucide-react';
import { Email } from '../../types';

// Replicating the "New Outlook" / Web Interface from the screenshot
export const Outlook: React.FC = () => {
  const { emails, selectedEmailId, selectEmail, performScan, updateEmailBody, openaiApiKey } = useOS();
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeMail = emails.find(e => e.id === selectedEmailId);

  const filteredEmails = emails.filter(e => 
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMail = (id: string) => {
     selectEmail(id);
     // Auto-trigger agent scan when opening an email
     setTimeout(() => performScan(), 800);
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-[#252423]">
      
      {/* TOP HEADER (Blue Brand Bar) */}
      <div className="h-12 bg-[#0f6cbd] flex items-center justify-between px-2 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-9 h-9 grid grid-cols-3 gap-0.5 p-1.5 cursor-pointer hover:bg-white/10 rounded">
               {[...Array(9)].map((_,i) => <div key={i} className="bg-white w-1 h-1 rounded-full"></div>)}
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">Outlook</span>
         </div>
         
         {/* Search Bar */}
         <div className="flex-1 max-w-2xl mx-4">
            <div className="relative group">
               <Search className="absolute left-3 top-2 w-4 h-4 text-blue-100 group-focus-within:text-[#0f6cbd]" />
               <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 text-white placeholder-blue-100 border-none rounded-md py-1.5 pl-9 pr-4 text-sm focus:bg-white focus:text-black focus:placeholder-gray-400 focus:outline-none transition-colors"
               />
            </div>
         </div>

         {/* Right Controls */}
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white/80 text-sm mr-2 bg-white/10 px-3 py-1 rounded cursor-pointer hover:bg-white/20">
               <span className="w-2 h-2 rounded-full bg-green-400"></span>
               <span>On Call</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">
               JS
            </div>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
         
         {/* 1. NAVIGATION RAIL (Far Left) */}
         <div className="w-14 bg-[#f0f0f0] flex flex-col items-center py-4 gap-6 border-r border-gray-200 shrink-0">
            <NavIcon icon={Mail} active />
            <NavIcon icon={Calendar} />
            <NavIcon icon={Users} />
            <div className="w-8 h-px bg-gray-300 my-2"></div>
            <NavIcon icon={Archive} />
            <NavIcon icon={CheckCircle} />
         </div>

         {/* 2. FOLDER & EMAIL LIST (Resizable usually, fixed here) */}
         <div className="w-80 flex flex-col border-r border-gray-200 bg-[#faf9f8] shrink-0">
            {/* Toolbar */}
            <div className="h-12 flex items-center px-4 border-b border-gray-200 gap-4">
               <button className="bg-[#0f6cbd] hover:bg-[#0e5ea3] text-white text-sm font-semibold px-4 py-1.5 rounded shadow-sm flex items-center gap-2">
                  <span>New Email</span>
                  <ChevronDown className="w-3 h-3" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto">
               {/* Folders */}
               <div className="py-4">
                  <div className="px-4 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Favorites</div>
                  <FolderItem label="Inbox" count={emails.filter(e=>e.unread).length} active />
                  <FolderItem label="Sent Items" />
                  <FolderItem label="Drafts" />
                  
                  <div className="mt-6 px-4 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Folders</div>
                  <FolderItem label="Archive" />
                  <FolderItem label="Junk Email" />
                  <FolderItem label="Deleted Items" />
               </div>
            </div>
         </div>

         {/* 3. EMAIL LIST (Middle) */}
         <div className="w-80 flex flex-col border-r border-gray-200 bg-white shrink-0">
             <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                   <span className="border-b-2 border-[#0f6cbd] text-[#0f6cbd] py-3">Focused</span>
                   <span className="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Other</span>
                </div>
                <div className="text-xs text-gray-500 cursor-pointer">Filter ▼</div>
             </div>
             
             <div className="flex-1 overflow-y-auto">
                {/* Date Group */}
                <div className="px-4 py-2 text-xs font-bold text-gray-500 bg-[#faf9f8]">Today</div>
                
                {filteredEmails.length > 0 ? filteredEmails.map(email => (
                   <div 
                     key={email.id}
                     onClick={() => handleSelectMail(email.id)}
                     className={`px-4 py-3 border-b border-gray-100 cursor-pointer group relative ${selectedEmailId === email.id ? 'bg-[#cce3f5] border-l-4 border-l-[#0f6cbd]' : 'hover:bg-[#faf9f8] border-l-4 border-l-transparent'}`}
                   >
                      <div className="flex justify-between items-start mb-1">
                         <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${email.unread ? 'bg-[#0f6cbd]' : 'bg-gray-400'}`}>
                               {email.sender.charAt(0)}
                            </div>
                            <div className={`text-sm truncate max-w-[120px] ${email.unread ? 'font-bold text-black' : 'text-gray-600'}`}>
                               {email.sender}
                            </div>
                         </div>
                         <div className={`text-xs ${email.unread ? 'text-[#0f6cbd] font-bold' : 'text-gray-500'}`}>{email.time}</div>
                      </div>
                      <div className={`text-sm mb-1 truncate ${email.unread ? 'font-bold text-[#0f6cbd]' : 'text-gray-800'}`}>
                         {email.subject}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2 h-8">
                         {email.body.substring(0, 80)}...
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute right-2 top-8 hidden group-hover:flex gap-1 bg-white/80 backdrop-blur rounded px-1">
                         <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer" />
                         <Archive className="w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer" />
                      </div>
                   </div>
                )) : (
                  <div className="p-8 text-center text-gray-400 text-sm">No emails match your search.</div>
                )}
             </div>
         </div>

         {/* 4. READING PANE (Right) */}
         <div className="flex-1 bg-white flex flex-col min-w-[400px]">
            {activeMail ? (
               <>
                  {/* Message Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                     <div className="flex justify-between items-start mb-4">
                        <h1 className="text-xl font-semibold text-[#252423]">{activeMail.subject}</h1>
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-gray-100 rounded"><Reply className="w-4 h-4 text-gray-600"/></button>
                           <button className="p-2 hover:bg-gray-100 rounded"><ReplyAll className="w-4 h-4 text-gray-600"/></button>
                           <button className="p-2 hover:bg-gray-100 rounded"><Forward className="w-4 h-4 text-gray-600"/></button>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0f6cbd] flex items-center justify-center text-white text-sm font-bold">
                           {activeMail.sender.charAt(0)}
                        </div>
                        <div className="flex-1">
                           <div className="text-sm font-semibold text-[#252423]">
                              {activeMail.sender} <span className="text-gray-500 font-normal">&lt;sender@external.com&gt;</span>
                           </div>
                           <div className="text-xs text-gray-500">
                              To: Service Desk Team; Dispatch Group
                           </div>
                        </div>
                        <div className="text-xs text-gray-500">{activeMail.time}</div>
                     </div>
                  </div>

                  {/* COPILOT SUMMARY (The "Magic" integration point) */}
                  <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-[#f0f6ff] to-[#f5f9ff] rounded-lg border border-blue-100 relative group">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Microsoft_365_Copilot_Icon.svg" className="w-4 h-4" alt="Copilot" />
                           <span className="text-xs font-bold text-gray-700">Summary by Copilot</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 text-lg leading-3">×</button>
                     </div>
                     <p className="text-sm text-gray-700 leading-relaxed">
                        The sender, <strong>{activeMail.sender}</strong>, is reporting a critical failure with <strong>Equipment {activeMail.data?.equipment || 'Unknown'}</strong>. 
                        The reported issue involves a <span className="bg-yellow-100 px-1 rounded">grinding noise</span> and hydraulic lift failure (Error {activeMail.data?.error || 'Unknown'}). 
                        This requires immediate dispatch.
                     </p>
                     
                     {/* Reactions to Copilot */}
                     <div className="flex gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                           <ThumbsUp className="w-3 h-3 text-yellow-500" /> 1
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                           <Heart className="w-3 h-3 text-red-500" /> 2
                        </div>
                     </div>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 p-6 overflow-y-auto">
                     <textarea 
                        className="w-full h-full resize-none outline-none text-sm text-[#252423] leading-relaxed"
                        value={activeMail.body}
                        onChange={(e) => updateEmailBody(activeMail.id, e.target.value)}
                     />
                  </div>

                  {/* Reply Bar */}
                  <div className="p-4 border-t border-gray-200 flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">JS</div>
                     <div className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-500 hover:border-gray-400 cursor-text flex items-center justify-between">
                        <span>Reply to {activeMail.sender}...</span>
                        <div className="flex gap-2">
                           <Smile className="w-4 h-4 text-gray-400" />
                           <Paperclip className="w-4 h-4 text-gray-400" />
                        </div>
                     </div>
                  </div>
               </>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Mail className="w-16 h-16 mb-4 opacity-20" />
                  <div className="text-lg font-semibold">Select an item to read</div>
                  <div className="text-sm">Nothing is selected</div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, active }: any) => (
   <div className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${active ? 'bg-white shadow-sm text-[#0f6cbd]' : 'text-gray-500 hover:bg-white/50'}`}>
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
   </div>
);

const FolderItem = ({ label, count, active }: any) => (
   <div className={`px-4 py-2 flex items-center justify-between cursor-pointer text-sm ${active ? 'bg-[#e1dfdd] font-semibold text-black border-l-4 border-l-[#0f6cbd]' : 'text-gray-700 hover:bg-[#edebe9] border-l-4 border-l-transparent'}`}>
      <span>{label}</span>
      {count > 0 && <span className={`text-xs font-semibold ${active ? 'text-[#0f6cbd]' : 'text-[#0f6cbd]'}`}>{count}</span>}
   </div>
);