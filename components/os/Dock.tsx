
import React from 'react';
import { motion } from 'framer-motion';
import { useOS } from '../../store';
import { Mail, Database, Truck, Smartphone, Settings, Zap, Mic } from 'lucide-react';
import { AppId, WindowState } from '../../types';

export const Dock: React.FC = () => {
  const { windows, openApp, focusApp } = useOS();
  
  // Check if any active window is maximized to auto-hide the dock
  const isMaximized = Object.values(windows).some((w) => (w as WindowState).isOpen && (w as WindowState).isMaximized);

  const apps = [
    { id: 'outlook', icon: Mail, label: 'Outlook', color: 'bg-[#0078D4]', iconImg: null }, // Fixed broken icon
    { id: 'sap', icon: Database, label: 'SAP', color: 'bg-indigo-600', iconImg: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
    { id: 'fsm', icon: Truck, label: 'IFS FSM', color: 'bg-purple-600', iconImg: '' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', color: 'bg-zinc-800', iconImg: '' },
  ];

  const handleAppClick = (id: AppId) => {
    if (windows[id].isOpen) {
       focusApp(id);
    } else {
       openApp(id);
    }
  };

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-500 ease-in-out ${isMaximized ? 'translate-y-40 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
       <div className="flex items-end gap-3 px-4 py-3 bg-white/10 backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-macos-dock">
          
          {/* Finder Icon (Static) */}
          <DockIcon 
             icon={null} 
             iconImg="https://upload.wikimedia.org/wikipedia/commons/c/c9/Finder_Icon_macOS_Big_Sur.png"
             label="Finder"
             color=""
             isOpen={true}
             onClick={() => {}}
          />
          
          <div className="w-px h-10 bg-white/10 mx-1" />

          {apps.map((app) => {
             const isOpen = windows[app.id as AppId]?.isOpen;
             return (
                <DockIcon 
                   key={app.id}
                   icon={app.icon}
                   iconImg={app.iconImg}
                   label={app.label}
                   color={app.color}
                   isOpen={isOpen}
                   onClick={() => handleAppClick(app.id as AppId)}
                />
             );
          })}
          
          <div className="w-px h-10 bg-white/10 mx-1" />
          
          {/* PORTA ICON (New) */}
          <DockIcon 
             icon={Mic} 
             label="AEDIL Porta" 
             color="bg-gradient-to-tr from-indigo-500 to-purple-500" 
             isOpen={windows.porta.isOpen} 
             onClick={() => handleAppClick('porta')} 
          />

          {/* AEDIL CONSOLE ICON */}
          <DockIcon 
             icon={Zap} 
             label="AEDIL Console" 
             color="bg-amber-500" 
             isOpen={windows.console.isOpen} 
             onClick={() => handleAppClick('console')} 
          />

          <DockIcon 
            icon={Settings} 
            label="System Settings" 
            color="bg-gray-500" 
            iconImg={null} // Fixed broken icon
            isOpen={windows.settings.isOpen} 
            onClick={() => handleAppClick('settings')} 
          />
          
          <div className="w-px h-10 bg-white/10 mx-1" />
          
          {/* Trash (Static) */}
           <DockIcon 
             icon={null} 
             iconImg="https://findicons.com/files/icons/569/longhorn_objects/128/trash_full.png"
             label="Bin"
             color=""
             isOpen={false}
             onClick={() => {}}
          />
       </div>
    </div>
  );
};

const DockIcon = ({ icon: Icon, iconImg, label, color, isOpen, onClick }: any) => {
   return (
      <motion.button
         whileHover={{ scale: 1.15, y: -8 }}
         whileTap={{ scale: 0.9 }}
         onClick={onClick}
         className="relative group flex flex-col items-center"
      >
         {/* Tooltip */}
         <div className="absolute -top-14 opacity-0 group-hover:opacity-100 bg-[#2A2A2A] text-white/90 backdrop-blur font-medium text-[12px] px-3 py-1.5 rounded-lg shadow-xl border border-white/10 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 transform translate-y-2 group-hover:translate-y-0">
            {label}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2A2A2A] rotate-45 border-r border-b border-white/10"></div>
         </div>

         {/* Icon Box */}
         <div className={`w-[52px] h-[52px] rounded-[14px] ${!iconImg ? color : ''} flex items-center justify-center shadow-lg overflow-hidden border border-white/5 transition-all duration-200 group-hover:brightness-110`}>
            {iconImg ? (
               <img src={iconImg} className="w-full h-full object-cover" alt={label} />
            ) : (
               <Icon className="w-7 h-7 text-white" strokeWidth={2} />
            )}
         </div>

         {/* Active Dot */}
         <div className={`absolute -bottom-2 w-1 h-1 rounded-full bg-white/80 shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
      </motion.button>
   );
};
