
import React, { useState, useEffect } from 'react';
import { useOS } from '../../store';
import { Dock } from './Dock';
import { Window } from './Window';
import { AedilOverlay } from './AedilOverlay';
import { Outlook } from '../apps/Outlook';
import { SAP } from '../apps/SAP';
import { FSM } from '../apps/FSM';
import { Mobile } from '../apps/Mobile';
import { Settings } from '../apps/Settings';
import { AedilConsole } from '../apps/AedilConsole';
import { Porta } from '../apps/Porta';
import { Wifi, Battery, Search, Command, HardDrive, Folder, FileImage, Monitor } from 'lucide-react';

export const Desktop: React.FC = () => {
  const { windows, activeAppId } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get the title of the active app for the menu bar
  const activeAppTitle = activeAppId ? windows[activeAppId].title : 'Finder';

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none text-white antialiased">
      
      {/* macOS Wallpaper (Big Sur / Monterey Style) */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
           backgroundImage: `url('https://4kwallpapers.com/images/wallpapers/macos-big-sur-apple-layers-fluidic-colorful-wwdc-2020-5120x2880-1432.jpg')`,
        }}
      />

      {/* macOS Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-[28px] bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 text-[13px] font-medium z-[9999] shadow-sm border-b border-white/5">
        <div className="flex items-center gap-5 pl-1">
          <span className="text-[15px] drop-shadow-md hover:opacity-70 cursor-default"></span>
          <span className="font-bold drop-shadow-md cursor-default">{activeAppId === 'outlook' ? 'Outlook' : (activeAppTitle === 'Outlook Web' ? 'Outlook' : (activeAppId ? activeAppTitle.split(' ')[0] : 'Finder'))}</span>
          <span className="hidden md:inline drop-shadow-md opacity-90 hover:opacity-100 cursor-default">File</span>
          <span className="hidden md:inline drop-shadow-md opacity-90 hover:opacity-100 cursor-default">Edit</span>
          <span className="hidden md:inline drop-shadow-md opacity-90 hover:opacity-100 cursor-default">View</span>
          <span className="hidden md:inline drop-shadow-md opacity-90 hover:opacity-100 cursor-default">Go</span>
          <span className="hidden md:inline drop-shadow-md opacity-90 hover:opacity-100 cursor-default">Window</span>
          <span className="hidden md:inline drop-shadow-md opacity-90 hover:opacity-100 cursor-default">Help</span>
        </div>
        
        <div className="flex items-center gap-4 pr-1">
          <div className="hidden md:flex items-center gap-4 opacity-90">
             <Battery className="w-[18px] h-[18px] drop-shadow-md" />
             <Wifi className="w-[16px] h-[16px] drop-shadow-md" />
             <Search className="w-[14px] h-[14px] drop-shadow-md" />
             <div className="flex items-center justify-center w-[28px] h-[28px] hover:bg-white/10 rounded">
               <Monitor className="w-[14px] h-[14px] drop-shadow-md" />
             </div>
          </div>
          <span className="drop-shadow-md font-medium">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp;
            {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Desktop Icons Grid (Right Side) */}
      <div className="absolute top-10 right-4 flex flex-col gap-6 items-end z-0">
         <DesktopIcon icon={HardDrive} label="Macintosh HD" color="text-gray-300" bg="bg-gray-500" />
         <DesktopIcon icon={Folder} label="Work" color="text-blue-300" bg="bg-blue-500" />
         <DesktopIcon icon={Folder} label="Projects" color="text-blue-300" bg="bg-blue-500" />
         <DesktopIcon icon={FileImage} label="Screen Shot..." color="text-gray-200" bg="bg-white" isFile />
         <DesktopIcon icon={FileImage} label="Presentation.key" color="text-gray-200" bg="bg-white" isFile />
      </div>

      {/* Desktop Area - Window Manager */}
      <div className="relative w-full h-full z-10 pointer-events-none">
         {/* Re-enable pointer events for windows */}
         <div className="contents pointer-events-auto">
            <Window id="outlook" defaultPosition={{x: 100, y: 80}} width={1100}>
               <Outlook />
            </Window>

            <Window id="sap" defaultPosition={{x: 150, y: 120}} width={1024}>
               <SAP />
            </Window>

            <Window id="fsm" defaultPosition={{x: 200, y: 160}} width={1024}>
               <FSM />
            </Window>

            <Window id="mobile" defaultPosition={{x: 900, y: 100}} width={360}>
               <Mobile />
            </Window>

            <Window id="console" defaultPosition={{x: 120, y: 100}} width={1000}>
               <AedilConsole />
            </Window>

            <Window id="settings" defaultPosition={{x: 350, y: 200}} width={800}>
               <Settings />
            </Window>

            <Window id="porta" defaultPosition={{x: 400, y: 100}} width={400}>
               <Porta />
            </Window>

            {/* The Neural Overlay */}
            <AedilOverlay />
         </div>
      </div>

      {/* Dock */}
      <Dock />
      
    </div>
  );
};

const DesktopIcon = ({ icon: Icon, label, color, bg, isFile }: any) => (
   <div className="flex flex-col items-center gap-1 group w-24 cursor-pointer">
      <div className={`w-14 h-14 rounded-xl ${isFile ? 'bg-white shadow-sm' : ''} flex items-center justify-center relative`}>
         {!isFile && <div className={`absolute inset-0 ${bg} opacity-20 rounded-xl blur-sm`}></div>}
         {isFile ? (
            <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
               <Icon className="w-8 h-8 text-gray-400" strokeWidth={1} />
            </div>
         ) : (
            <Icon className={`w-12 h-12 ${color} drop-shadow-2xl`} strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
         )}
      </div>
      <span className="text-[12px] font-medium text-white drop-shadow-md px-2 py-0.5 rounded group-hover:bg-white/20 group-active:bg-blue-600/80 transition-colors text-center leading-tight">
         {label}
      </span>
   </div>
);