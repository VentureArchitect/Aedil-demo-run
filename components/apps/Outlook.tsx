
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
    <div className="flex flex-col h-full bg-black font-sans text-slate-200">
      
      {/* TOP HEADER (Blue Brand Bar) */}
      <div className="h-12 xl:h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-2 xl:px-4 shrink-0 transition-all">
         <div className="flex items-center gap-4">
            <div className="w-9 h-9 grid grid-cols-3 gap-0.5 p-1.5 cursor-pointer hover:bg-black/10 rounded">
               {[...Array(9)].map((_,i) => <div key={i} className="bg-black w-1 h-1 rounded-full"></div>)}
            </div>
            <span className="text-white font-semibold text-sm xl:text-lg tracking-wide">Outlook</span>
         </div>
         
         {/* Search Bar */}
         <div className="flex-1 max-w-2xl mx-4">
            <div className="relative group">
               <Search className="absolute left-3 top-2 xl:top-2.5 w-4 h-4 text-blue-100 group-focus-within:text-white" />
               <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/20 text-white placeholder-blue-100 border-none rounded-md py-1.5 xl:py-2 pl-9 pr-4 text-sm xl:text-base focus:bg-black focus:text-white focus:placeholder-gray-400 focus:outline-none transition-colors"
               />
            </div>
         </div>

         {/* Right Controls */}
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white/80 text-sm xl:text-base mr-2 bg-black/10 px-3 py-1 rounded cursor-pointer hover:bg-black/20">
               <span className="w-2 h-2 rounded-full bg-green-400"></span>
               <span>On Call</span>
            </div>
            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs xl:text-sm font-bold border-2 border-white/20">
               JS
            </div>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
         
         {/* 1. NAVIGATION RAIL (Far Left) */}
         <div className="w-14 xl:w-16 bg-zinc-950 flex flex-col items-center py-4 gap-6 border-r border-white/10 shrink-0 transition-all">
            <NavIcon icon={Mail} active />
            <NavIcon icon={Calendar} />
            <NavIcon icon={Users} />
            <div className="w-8 h-px bg-white/20 my-2"></div>
            <NavIcon icon={Archive} />
            <NavIcon icon={CheckCircle} />
         </div>

         {/* 2. FOLDER & EMAIL LIST (Resizable usually, fixed here) */}
         <div className="w-60 xl:w-72 flex flex-col border-r border-white/10 bg-zinc-900 shrink-0 transition-all">
            {/* Toolbar */}
            <div className="h-12 xl:h-14 flex items-center px-4 border-b border-white/10 gap-4">
               <button className="bg-white/5 border-b border-white/10 hover:bg-white/10 text-white text-sm xl:text-base font-semibold px-4 py-1.5 xl:py-2 rounded shadow-sm flex items-center gap-2 w-full justify-center transition-all">
                  <span>New Email</span>
                  <ChevronDown className="w-3 h-3" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto">
               {/* Folders */}
               <div className="py-4">
                  <div className="px-4 text-xs xl:text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">Favorites</div>
                  <FolderItem label="Inbox" count={emails.filter(e=>e.unread).length} active />
                  <FolderItem label="Sent Items" />
                  <FolderItem label="Drafts" />
                  
                  <div className="mt-6 px-4 text-xs xl:text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">Folders</div>
                  <FolderItem label="Archive" />
                  <FolderItem label="Junk Email" />
                  <FolderItem label="Deleted Items" />
               </div>
            </div>
         </div>

         {/* 3. EMAIL LIST (Middle) */}
         <div className="w-80 xl:w-[450px] flex flex-col border-r border-white/10 bg-black shrink-0 transition-all">
             <div className="h-12 xl:h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black">
                <div className="flex items-center gap-2 text-sm xl:text-base font-semibold text-slate-300">
                   <span className="border-b-2 border-[#0f6cbd] text-white py-3 xl:py-4">Focused</span>
                   <span className="text-zinc-500 hover:bg-white/10 px-2 py-1 rounded cursor-pointer">Other</span>
                </div>
                <div className="text-xs xl:text-sm text-zinc-500 cursor-pointer">Filter ▼</div>
             </div>
             
             <div className="flex-1 overflow-y-auto">
                {/* Date Group */}
                <div className="px-4 py-2 text-xs xl:text-sm font-bold text-zinc-500 bg-zinc-900">Today</div>
                
                {filteredEmails.length > 0 ? filteredEmails.map(email => (
                   <div 
                     key={email.id}
                     onClick={() => handleSelectMail(email.id)}
                     className={`px-4 py-3 xl:py-4 border-b border-white/5 cursor-pointer group relative transition-colors ${selectedEmailId === email.id ? 'bg-white/10 border-l-4 border-l-white' : 'hover:bg-zinc-900 border-l-4 border-l-transparent'}`}
                   >
                      <div className="flex justify-between items-start mb-1">
                         <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-xs xl:text-sm font-bold text-white ${email.unread ? 'bg-white/5 border-b border-white/10' : 'bg-zinc-700'}`}>
                               {email.sender.charAt(0)}
                            </div>
                            <div className={`text-sm xl:text-base truncate max-w-[180px] xl:max-w-[280px] ${email.unread ? 'font-bold text-white' : 'text-zinc-400'}`}>
                               {email.sender}
                            </div>
                         </div>
                         <div className={`text-xs xl:text-sm ${email.unread ? 'text-white font-bold' : 'text-zinc-500'}`}>{email.time}</div>
                      </div>
                      <div className={`text-sm xl:text-base mb-1 truncate ${email.unread ? 'font-bold text-white' : 'text-gray-800'}`}>
                         {email.subject}
                      </div>
                      <div className="text-xs xl:text-sm text-zinc-500 line-clamp-2 h-8 xl:h-10">
                         {email.body.substring(0, 120)}...
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute right-2 top-8 hidden group-hover:flex gap-1 bg-black/80 backdrop-blur rounded px-1">
                         <Trash2 className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-500 hover:text-red-500 cursor-pointer" />
                         <Archive className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-500 hover:text-blue-500 cursor-pointer" />
                      </div>
                   </div>
                )) : (
                  <div className="p-8 text-center text-zinc-500 text-sm xl:text-base">No emails match your search.</div>
                )}
             </div>
         </div>

         {/* 4. READING PANE (Right) */}
         <div className="flex-1 bg-black flex flex-col min-w-[400px]">
            {activeMail ? (
               <div className="flex flex-col h-full max-w-6xl xl:max-w-7xl mx-auto w-full border-l border-white/5 shadow-sm">
                  {/* Message Header */}
                  <div className="px-6 xl:px-8 py-4 xl:py-6 border-b border-white/5 shrink-0">
                     <div className="flex justify-between items-start mb-4">
                        <h1 className="text-xl xl:text-2xl font-semibold text-slate-200">{activeMail.subject}</h1>
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-white/10 rounded"><Reply className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-400"/></button>
                           <button className="p-2 hover:bg-white/10 rounded"><ReplyAll className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-400"/></button>
                           <button className="p-2 hover:bg-white/10 rounded"><Forward className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-400"/></button>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-white/5 border-b border-white/10 flex items-center justify-center text-white text-sm xl:text-base font-bold">
                           {activeMail.sender.charAt(0)}
                        </div>
                        <div className="flex-1">
                           <div className="text-sm xl:text-base font-semibold text-slate-200">
                              {activeMail.sender} <span className="text-zinc-500 font-normal">&lt;sender@external.com&gt;</span>
                           </div>
                           <div className="text-xs xl:text-sm text-zinc-500">
                              To: Service Desk Team; Dispatch Group
                           </div>
                        </div>
                        <div className="text-xs xl:text-sm text-zinc-500">{activeMail.time}</div>
                     </div>
                  </div>

                  {/* COPILOT SUMMARY (The "Magic" integration point) */}
                  <div className="mx-6 xl:mx-8 mt-4 p-4 xl:p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/20 relative group shrink-0">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Microsoft_365_Copilot_Icon.svg" className="w-4 h-4 xl:w-5 xl:h-5" alt="Copilot" />
                           <span className="text-xs xl:text-sm font-bold text-slate-300">Summary by Copilot</span>
                        </div>
                        <button className="text-zinc-500 hover:text-zinc-400 text-lg leading-3">×</button>
                     </div>
                     <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
                        The sender, <strong>{activeMail.sender}</strong>, is reporting a critical failure with <strong>Equipment {activeMail.data?.equipment || 'Unknown'}</strong>. 
                        The reported issue involves a <span className="bg-white/10 text-white px-1 rounded">grinding noise</span> and hydraulic lift failure (Error {activeMail.data?.error || 'Unknown'}). 
                        This requires immediate dispatch.
                     </p>
                     
                     {/* Reactions to Copilot */}
                     <div className="flex gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs xl:text-sm text-zinc-500 bg-black px-2 py-1 rounded border border-white/10 shadow-sm cursor-pointer hover:bg-gray-50">
                           <ThumbsUp className="w-3 h-3 xl:w-4 xl:h-4 text-yellow-500" /> 1
                        </div>
                        <div className="flex items-center gap-1 text-xs xl:text-sm text-zinc-500 bg-black px-2 py-1 rounded border border-white/10 shadow-sm cursor-pointer hover:bg-gray-50">
                           <Heart className="w-3 h-3 xl:w-4 xl:h-4 text-red-500" /> 2
                        </div>
                     </div>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 p-6 xl:p-8 overflow-y-auto">
                     <textarea 
                        className="w-full h-full resize-none outline-none text-sm xl:text-lg text-slate-200 leading-relaxed xl:leading-8 font-serif"
                        value={activeMail.body}
                        onChange={(e) => updateEmailBody(activeMail.id, e.target.value)}
                     />
                  </div>

                  {/* Reply Bar */}
                  <div className="p-4 xl:p-6 border-t border-white/10 flex gap-2 shrink-0 bg-black">
                     <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs xl:text-sm font-bold">JS</div>
                     <div className="flex-1 border border-white/20 rounded-full px-4 py-2 xl:py-3 text-sm xl:text-base text-zinc-500 hover:border-white/30 cursor-text flex items-center justify-between shadow-sm">
                        <span>Reply to {activeMail.sender}...</span>
                        <div className="flex gap-2">
                           <Smile className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-500" />
                           <Paperclip className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-500" />
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Mail className="w-16 h-16 xl:w-24 xl:h-24 mb-4 opacity-20" />
                  <div className="text-lg xl:text-xl font-semibold">Select an item to read</div>
                  <div className="text-sm xl:text-base">Nothing is selected</div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, active }: any) => (
   <div className={`w-10 h-10 xl:w-12 xl:h-12 flex items-center justify-center rounded-md cursor-pointer transition-colors ${active ? 'bg-black shadow-sm text-white' : 'text-zinc-500 hover:bg-black/50'}`}>
      <Icon className="w-5 h-5 xl:w-6 xl:h-6" strokeWidth={active ? 2.5 : 2} />
   </div>
);

const FolderItem = ({ label, count, active }: any) => (
   <div className={`px-4 py-2 xl:py-2.5 flex items-center justify-between cursor-pointer text-sm xl:text-base ${active ? 'bg-white/10 font-semibold text-white border-l-4 border-l-white' : 'text-slate-300 hover:bg-white/5 border-l-4 border-l-transparent'}`}>
      <span>{label}</span>
      {count > 0 && <span className={`text-xs xl:text-sm font-semibold ${active ? 'text-white' : 'text-white'}`}>{count}</span>}
   </div>
);
