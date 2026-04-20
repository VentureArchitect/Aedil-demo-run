
import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOS } from '../../store';
import { AppId } from '../../types';
import { X } from 'lucide-react';
import { AedilOverlay } from './AedilOverlay';

interface WindowProps {
  id: AppId;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: number;
}

export const Window: React.FC<WindowProps> = ({ id, children, defaultPosition, width }) => {
  const { windows, closeApp, focusApp, toggleMaximizeApp, updateWindowPosition, updateWindowSize, activeAppId } = useOS();
  const windowState = windows[id];
  const dragControls = useDragControls();

  if (!windowState.isOpen) return null;

  // Treat Porta as a mobile app for the phone chassis UI
  const isMobile = id === 'mobile' || id === 'porta';
  const isMaximized = windowState.isMaximized;
  const canMaximize = !isMobile;
  const isActive = activeAppId === id;

  // Dimensions & Position
  const currentWidth = isMaximized ? '100vw' : (windowState.size?.width || width || 1000);
  const currentHeight = isMaximized ? '100vh' : (windowState.size?.height || 680); 
  
  const xPos = isMaximized ? 0 : (windowState.position?.x ?? defaultPosition?.x ?? 100);
  const yPos = isMaximized ? 0 : (windowState.position?.y ?? defaultPosition?.y ?? 80);

  const handleMouseDown = () => {
    focusApp(id);
  };

  const handleYellowClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const optimalWidth = 1000;
      const optimalHeight = 680;
      const newX = Math.max(0, (window.innerWidth - optimalWidth) / 2);
      const newY = Math.max(0, (window.innerHeight - optimalHeight) / 2);

      updateWindowSize(id, { width: optimalWidth, height: optimalHeight });
      updateWindowPosition(id, { x: newX, y: newY });
      if (isMaximized) toggleMaximizeApp(id);
  };

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      dragControls={dragControls}
      dragListener={false} 
      initial={{ 
        x: xPos, 
        y: yPos, 
        width: currentWidth,
        height: currentHeight,
        opacity: 0, 
        scale: 0.95,
      }}
      animate={{ 
        opacity: windowState.isMinimized ? 0 : 1, 
        scale: windowState.isMinimized ? 0.85 : 1,
        y: windowState.isMinimized ? 1200 : yPos,
        x: xPos,
        width: currentWidth,
        height: currentHeight,
        borderRadius: isMaximized ? 0 : (isMobile ? 55 : 12),
        zIndex: isMaximized ? 10000 : windowState.zIndex,
        filter: windowState.isMinimized ? 'blur(10px)' : 'blur(0px)',
      }}
      style={isMaximized ? { position: 'fixed', top: 0, left: 0 } : { position: 'absolute' }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      onDragEnd={(e, info) => {
        // Only update store at the end of drag to prevent re-render loops
        if (windowState.position && !isMaximized) {
            updateWindowPosition(id, {
                x: windowState.position.x + info.offset.x,
                y: windowState.position.y + info.offset.y
            });
        }
      }}
      onPointerDown={handleMouseDown}
      className={`flex flex-col pointer-events-auto relative group ${
          isMobile 
          ? 'bg-transparent shadow-none border-none overflow-visible items-center justify-center' 
          : 'bg-[#1E1E1E] shadow-macos-window border border-white/10'
      }`}
    >
      {/* Attach Aedil Overlay Inside the Window Frame */}
      <AedilOverlay appId={id} />

      {/* MOBILE SPECIFIC CONTROLS */}
      {isMobile && (
          <>
             <div 
                className="absolute top-[15px] left-[60px] right-[60px] h-[30px] z-[100] cursor-grab active:cursor-grabbing rounded-full"
                onPointerDown={(e) => {
                    dragControls.start(e);
                    focusApp(id);
                }}
             />
             <button 
                onPointerDown={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    closeApp(id); 
                }}
                className="absolute top-12 -right-12 w-10 h-10 bg-zinc-800/90 backdrop-blur-md border border-white/10 rounded-full text-white/50 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all z-[200] shadow-xl hover:scale-110 cursor-pointer"
             >
                <X className="w-5 h-5" />
             </button>
          </>
      )}

      {/* STANDARD DESKTOP TITLE BAR */}
      {!isMobile && (
        <div 
            className="h-[32px] bg-[#252526] border-b border-black/20 flex items-center px-4 cursor-default select-none relative shrink-0 z-50 rounded-t-xl" 
            onPointerDown={(e) => {
                if (!isMaximized) dragControls.start(e);
                focusApp(id);
            }}
            onDoubleClick={(e) => {
                e.preventDefault();
                if(canMaximize) toggleMaximizeApp(id);
            }}
        >
            <div 
              className="absolute left-4 top-0 bottom-0 flex gap-[8px] items-center z-[200]"
              onPointerDown={(e) => e.stopPropagation()}
            >
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeApp(id); }} className="w-[12px] h-[12px] rounded-full bg-[#FF5F57] flex items-center justify-center transition-transform active:scale-90 group/btn hover:brightness-90 shadow-sm cursor-pointer"><span className="opacity-0 group-hover/btn:opacity-100 text-[8px] text-[#4d0000] font-bold mt-px">×</span></button>
                <button onClick={handleYellowClick} className="w-[12px] h-[12px] rounded-full bg-[#FEBC2E] flex items-center justify-center transition-transform active:scale-90 group/btn hover:brightness-90 shadow-sm cursor-pointer"><span className="opacity-0 group-hover/btn:opacity-100 text-[8px] text-[#5c3c00] font-bold mb-[1px]">-</span></button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(canMaximize) toggleMaximizeApp(id); }} className={`w-[12px] h-[12px] rounded-full bg-[#28C840] flex items-center justify-center transition-transform active:scale-90 group/btn hover:brightness-90 shadow-sm cursor-pointer ${!canMaximize ? 'opacity-50 cursor-not-allowed' : ''}`}><span className="opacity-0 group-hover/btn:opacity-100 text-[6px] text-[#0a3f0f] rotate-45 font-bold mt-[1px] ml-[1px]">⤢</span></button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span className="text-[13px] font-medium text-white/80 tracking-tight flex items-center gap-2">
                {id === 'outlook' && <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" className="w-3.5 h-3.5" />}
                {windowState.title}
                </span>
            </div>
        </div>
      )}

      <div className={`flex-1 relative ${isMobile ? 'overflow-visible' : 'overflow-hidden bg-[#1E1E1E] h-full rounded-b-xl'}`}>
         {children}
      </div>
    </motion.div>
  );
};