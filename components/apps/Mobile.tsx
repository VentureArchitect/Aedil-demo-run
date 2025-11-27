

import React, { useState, useEffect } from 'react';
import { useOS } from '../../store';
import { MOCK_TICKETS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Wifi, Battery, Signal } from 'lucide-react';
import { 
  Header, Navigation, JobCard, InactiveJobCard, SmartLensOverlay 
} from './MobileUi';

export const Mobile: React.FC = () => {
  const { mobile, toggleSmartLens, tickets } = useOS();
  // IMPORTANT: Use the latest ticket from the store state (which contains the Voice Intake ticket)
  // instead of the static mock data.
  const activeTicket = tickets[0] || MOCK_TICKETS[0]; 
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Frameless iPhone Chassis
  // No outer container, allowing Window.tsx to handle the float.
  return (
    <div className="relative w-[340px] h-[680px] bg-black rounded-[55px] shadow-[0_0_0_6px_#2a2a2a,0_20px_60px_rgba(0,0,0,0.6)] border-[4px] border-[#111] overflow-visible ring-1 ring-white/10 z-10 select-none">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-[100] flex items-center justify-end pr-2 gap-1.5 pointer-events-none">
                {/* Camera Lens Reflection */}
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/20 box-border border border-white/5"></div>
        </div>

        {/* Hardware Buttons - Negatively positioned to stick out of chassis */}
        <div className="absolute top-28 -left-[7px] w-[6px] h-8 bg-[#2a2a2a] rounded-l-md shadow-inner"></div> 
        <div className="absolute top-44 -left-[7px] w-[6px] h-14 bg-[#2a2a2a] rounded-l-md shadow-inner"></div> 
        <div className="absolute top-60 -left-[7px] w-[6px] h-14 bg-[#2a2a2a] rounded-l-md shadow-inner"></div> 
        <div className="absolute top-48 -right-[7px] w-[6px] h-20 bg-[#2a2a2a] rounded-r-md shadow-inner"></div> 

        {/* SCREEN AREA */}
        <div className="w-full h-full bg-[#F2F2F7] font-sans flex flex-col relative overflow-hidden rounded-[48px] mask-image-fill">
            
            {/* iOS Status Bar */}
            <div className="absolute top-0 left-0 w-full h-[44px] px-6 flex items-center justify-between text-white z-[60] pointer-events-none mix-blend-difference">
                <span className="text-[13px] font-semibold tracking-wide pl-1">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
                <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5 fill-current" />
                    <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <div className="w-5 h-2.5 rounded-[3px] border-[1.5px] border-current relative ml-0.5">
                        <div className="absolute inset-0.5 bg-current rounded-[1px]"></div>
                    </div>
                </div>
            </div>

            <Header />
            
            {/* SCROLLABLE JOB LIST */}
            <div className="flex-1 overflow-y-auto z-0 p-4 space-y-4 pb-32 no-scrollbar scroll-smooth">
                <JobCard ticket={activeTicket} />
                <InactiveJobCard />
            </div>

            {/* FLOATING ACTION BUTTON */}
            <AnimatePresence>
                {!mobile.isOpen && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute bottom-24 left-0 w-full px-6 z-20"
                >
                    <button 
                        onClick={() => toggleSmartLens(true)}
                        className="group w-full flex items-center justify-center gap-3 bg-[#1C1C1E]/95 backdrop-blur-xl hover:bg-black text-white font-semibold py-3.5 px-6 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500 shadow-lg shadow-amber-500/30">
                            <Zap className="w-3.5 h-3.5 text-black fill-black" />
                        </div>
                        <span className="text-[13px] tracking-wide">Open Smart Lens</span>
                    </button>
                </motion.div>
                )}
            </AnimatePresence>

            <Navigation />

            {/* FULL SCREEN OVERLAY */}
            <AnimatePresence>
                {mobile.isOpen && <SmartLensOverlay ticket={activeTicket} />}
            </AnimatePresence>

            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/80 rounded-full z-[100] pointer-events-none backdrop-blur-md"></div>
        </div>
    </div>
  );
};