
import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOS } from '../../store';
import { AppId } from '../../types';
import { X } from 'lucide-react';

interface WindowProps {
  id: AppId;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: number;
}

export const Window: React.FC<WindowProps> = ({ id, children, defaultPosition, width }) => {
  const { windows, closeApp, focusApp, minimizeApp, toggleMaximizeApp, updateWindowPosition } = useOS();
  const windowState = windows[id];
  const dragControls = useDragControls();

  if (!windowState.isOpen) return null;

  const isMobile = id === 'mobile';
  const isMaximized = windowState.isMaximized;
  const canMaximize = !isMobile;

  // Maximize styling overrides
  const maximizedStyle = {
    x: 0,
    y: 28, // Below menu bar
    width: '100vw',
    height: 'calc(100vh - 28px)',
    borderRadius: 0,
  };

  const currentWidth = width || windowState.size?.width || 900;
  const currentHeight = windowState.size?.height || (id === 'mobile' ? 700 : 650);

  const handleMouseDown = () => {
    focusApp(id);
  };

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      dragControls={dragControls}
      dragListener={false} // We trigger drag manually from handles
      initial={{ 
        x: windowState.position?.x ?? defaultPosition?.x ?? 100, 
        y: windowState.position?.y ?? defaultPosition?.y ?? 100, 
        opacity: 0, 
        scale: 0.95,
        filter: 'blur(10px)'
      }}
      animate={{ 
        opacity: windowState.isMinimized ? 0 : 1, 
        scale: windowState.isMinimized ? 0.85 : 1,
        filter: windowState.isMinimized ? 'blur(10px)' : 'blur(0px)',
        y: windowState.isMinimized ? 1200 : (isMaximized ? maximizedStyle.y : windowState.position?.y),
        x: isMaximized ? maximizedStyle.x : windowState.position?.x,
        width: isMaximized ? maximizedStyle.width : currentWidth,
        height: isMaximized ? maximizedStyle.height : currentHeight,
        borderRadius: isMaximized ? 0 : (isMobile ? 50 : 12),
        zIndex: windowState.zIndex 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onDragEnd={(e, info) => {
        if (windowState.position && !isMaximized) {
            updateWindowPosition(id, {
                x: windowState.position.x + info.offset.x,
                y: windowState.position.y + info.offset.y
            });
        }
      }}
      onPointerDown={handleMouseDown}
      className={`absolute flex flex-col ${
          isMobile 
          ? 'bg-transparent shadow-none border-none overflow-visible items-center justify-center' 
          : 'bg-[#1E1E1E] overflow-hidden shadow-macos-window border border-white/10'
      }`}
    >
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
             {/* Floating Close Button */}
             <button 
                onPointerDown={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    closeApp(id); 
                }}
                className="absolute top-12 -right-12 w-10 h-10 bg-zinc-800/90 backdrop-blur-md border border-white/10 rounded-full text-white/50 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all z-[200] shadow-xl hover:scale-110 group cursor-pointer"
             >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
             </button>
          </>
      )}

      {/* STANDARD DESKTOP TITLE BAR */}
      {!isMobile && (
        <div 
            className="h-[32px] bg-[#252526] border-b border-black/20 flex items-center px-4 cursor-default select-none relative shrink-0 z-50" 
            onPointerDown={(e) => {
                if (!isMaximized) dragControls.start(e);
                focusApp(id);
            }}
            onDoubleClick={(e) => {
                e.preventDefault();
                if(canMaximize) toggleMaximizeApp(id);
            }}
        >
            {/* Traffic Lights - ABSOLUTE POSITION WITH STOP PROPAGATION */}
            <div 
              className="absolute left-4 top-0 bottom-0 flex gap-[8px] items-center z-[200]"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      closeApp(id); 
                  }} 
                  className="w-[12px] h-[12px] rounded-full bg-[#FF5F57] flex items-center justify-center transition-transform active:scale-90 group hover:brightness-90 shadow-sm cursor-pointer"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#4d0000] font-bold mt-px">×</span>
                </button>
                
                <button 
                  onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      minimizeApp(id); 
                  }} 
                  className="w-[12px] h-[12px] rounded-full bg-[#FEBC2E] flex items-center justify-center transition-transform active:scale-90 group hover:brightness-90 shadow-sm cursor-pointer"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#5c3c00] font-bold mb-[1px]">-</span>
                </button>
                
                <button 
                  onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      if(canMaximize) toggleMaximizeApp(id); 
                  }}
                  className={`w-[12px] h-[12px] rounded-full bg-[#28C840] flex items-center justify-center transition-transform active:scale-90 group hover:brightness-90 shadow-sm cursor-pointer ${!canMaximize ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[6px] text-[#0a3f0f] rotate-45 font-bold mt-[1px] ml-[1px]">⤢</span>
                </button>
            </div>
            
            {/* Title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span className="text-[13px] font-medium text-white/80 tracking-tight flex items-center gap-2">
                {id === 'outlook' && <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" className="w-3.5 h-3.5" />}
                {windowState.title}
                </span>
            </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 relative ${isMobile ? 'overflow-visible' : 'overflow-hidden bg-[#1E1E1E] h-full'}`}>
         {children}
      </div>

    </motion.div>
  );
};
