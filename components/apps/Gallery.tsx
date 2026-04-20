import React, { useRef, useState } from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toSvg, toPng } from 'html-to-image';
import { Outlook } from './Outlook';
import { SAP } from './SAP';
import { FSM } from './FSM';
import { Mobile } from './Mobile';
import { AedilConsole } from './AedilConsole';
import { Porta } from './Porta';

const SCREENS = [
  { id: 'outlook', name: 'Outlook (Ticket Intake)', component: <Outlook /> },
  { id: 'sap', name: 'SAP S/4HANA', component: <SAP /> },
  { id: 'fsm', name: 'IFS FSM (Dispatch)', component: <FSM /> },
  { id: 'console', name: 'AEDIL Console', component: <AedilConsole /> },
  { id: 'mobile', name: 'Technician Mobile', component: <Mobile />, width: 340, height: 680 },
  { id: 'porta', name: 'AEDIL Porta', component: <Porta />, width: 340, height: 680 },
];

export const Gallery: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState(SCREENS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeComponent = SCREENS.find(s => s.id === activeScreen);

  const handleDownload = async (format: 'svg' | 'png') => {
    if (!containerRef.current || !activeComponent) return;
    
    setIsGenerating(true);
    try {
      const element = containerRef.current;
      const dataUrl = format === 'svg' 
        ? await toSvg(element, { quality: 1, backgroundColor: '#000' })
        : await toPng(element, { quality: 1, backgroundColor: '#000' });
      
      const link = document.createElement('a');
      link.download = `${activeComponent.id}-screen.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Sales Deck Assets
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Generate high-quality SVGs of the main screens for your presentations.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {SCREENS.map(screen => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeScreen === screen.id 
                  ? 'bg-white/10 border border-white/20 text-white' 
                  : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              {screen.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950">
          <h3 className="font-medium">{activeComponent?.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('png')}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PNG
            </button>
            <button
              onClick={() => handleDownload('svg')}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 hover:bg-white/20 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download SVG
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-black/50 p-8 flex items-center justify-center">
          <div 
            className="relative shadow-2xl ring-1 ring-white/10 rounded-lg overflow-hidden bg-black"
            style={{ 
              width: activeComponent?.width || 1024, 
              height: activeComponent?.height || 768,
              transform: 'scale(0.8)',
              transformOrigin: 'center center'
            }}
          >
            <div ref={containerRef} className="w-full h-full bg-black">
              {activeComponent?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
