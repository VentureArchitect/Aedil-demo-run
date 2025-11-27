
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { 
  Zap, Database, Brain, Truck, Smartphone, Settings, 
  X, CheckCircle, Play, ZoomIn, ZoomOut, Grip, Loader2, Sparkles, ArrowRight
} from 'lucide-react';
import { WorkflowNode, NodeType } from '../../types';

export const WorkflowBuilder = (props: any) => {
  const { addToast } = props;
  const { workflowNodes, workflowEdges, updateNodeProvider, addWorkflowNode, updateWorkflowNodePosition, generateWorkflow, isGeneratingWorkflow } = useOS();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const selectedNode = workflowNodes.find(n => n.id === selectedNodeId);

  const handleMouseDown = (e: React.MouseEvent) => {
    hasMoved.current = false;
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]');
    if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id');
        if (nodeId) {
            setDraggedNodeId(nodeId);
            setSelectedNodeId(nodeId);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            e.stopPropagation();
            return;
        }
    }
    setIsDraggingCanvas(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId || isDraggingCanvas) hasMoved.current = true;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (draggedNodeId) {
        const node = workflowNodes.find(n => n.id === draggedNodeId);
        if (node) updateWorkflowNodePosition(draggedNodeId, node.position.x + (dx / zoom), node.position.y + (dy / zoom));
    } else if (isDraggingCanvas) {
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    }
  };

  const handleMouseUp = () => { setIsDraggingCanvas(false); setDraggedNodeId(null); };
  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved.current) return;
    if (!(e.target as HTMLElement).closest('[data-node-id]')) setSelectedNodeId(null);
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(Math.max(0.5, z + (-e.deltaY * 0.001)), 2));
    } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };
  const handleRunTest = () => { setIsTestRunning(true); setTimeout(() => setIsTestRunning(false), 3000); };
  const handleGenerate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;
      generateWorkflow(prompt);
      setPrompt('');
      addToast('Architecting workflow structure...', 'info');
  };

  return (
    <div className="h-full w-full flex relative bg-[#05050A] text-slate-300 overflow-hidden select-none font-sans">
      <div 
        ref={containerRef}
        className={`flex-1 relative w-full h-full overflow-hidden ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      >
        <div 
            style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '100%',
                height: '100%'
            }}
            className="relative transition-transform duration-75 ease-out w-full h-full"
        >
            <div className="absolute -inset-[5000px] opacity-[0.15] pointer-events-none" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at center, #4F46E5 1.5px, transparent 1.5px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} 
            />
            <svg className="absolute -inset-[5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible z-0">
                <defs>
                    <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#EC4899" /></linearGradient>
                    <filter id="glow-line"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {workflowEdges.map(edge => {
                    const source = workflowNodes.find(n => n.id === edge.source);
                    const target = workflowNodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;
                    const startX = source.position.x + 220; const startY = source.position.y + 55;
                    const endX = target.position.x; const endY = target.position.y + 55;
                    const pathD = `M ${startX} ${startY} C ${startX + 100} ${startY}, ${endX - 100} ${endY}, ${endX} ${endY}`;
                    return (
                    <g key={edge.id}>
                        <path d={pathD} fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                        {isTestRunning && (<path d={pathD} fill="none" stroke="url(#flow-grad)" strokeWidth="3" strokeLinecap="round" className="animate-pulse" filter="url(#glow-line)"><animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="1.5s" repeatCount="indefinite" /></path>)}
                        <circle r="4" fill="#F59E0B" filter="url(#glow-line)"><animateMotion dur="2s" repeatCount="indefinite" path={pathD} /></circle>
                    </g>
                    );
                })}
            </svg>
            <div className="absolute top-0 left-0 w-full h-full z-10">
                <AnimatePresence>
                {workflowNodes.map(node => (<GlassNode key={node.id} node={node} selected={selectedNodeId === node.id} isTesting={isTestRunning} />))}
                </AnimatePresence>
            </div>
        </div>
        {/* Controls */}
        <div className="absolute bottom-28 left-8 flex gap-2 z-50">
             <div className="bg-black/60 backdrop-blur border border-white/10 rounded-lg p-1 flex flex-col shadow-xl">
                 <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-white"><ZoomIn className="w-4 h-4" /></button>
                 <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 hover:bg-white/10 rounded text-white"><ZoomOut className="w-4 h-4" /></button>
                 <button onClick={() => { setZoom(1); setPan({x:0,y:0}) }} className="p-2 hover:bg-white/10 rounded text-white"><Grip className="w-4 h-4" /></button>
             </div>
             <div className="bg-black/60 backdrop-blur border border-white/10 rounded-lg p-3 text-xs text-slate-400 font-mono shadow-xl">{Math.round(zoom * 100)}%</div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <form onSubmit={handleGenerate} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative flex items-center bg-[#0F1019] rounded-2xl p-2 pl-4 border border-white/10 shadow-2xl">
                <Sparkles className={`w-5 h-5 mr-3 ${isGeneratingWorkflow ? 'text-amber-400 animate-spin' : 'text-indigo-400'}`} />
                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={isGeneratingWorkflow ? "Architecting infrastructure..." : "Describe a workflow to build..."} disabled={isGeneratingWorkflow} className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-medium" />
                <button type="submit" disabled={isGeneratingWorkflow || !prompt.trim()} className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors disabled:opacity-50"><ArrowRight className="w-4 h-4" /></button>
            </div>
        </form>
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40">
         <div className="flex items-center gap-2 p-2 bg-[#0F1019]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5">
            <FabButton icon={Zap} label="Trigger" color="text-indigo-400" onClick={() => addWorkflowNode('trigger', 'New Trigger', 'Porta')} />
            <FabButton icon={Brain} label="Intelligence" color="text-amber-400" onClick={() => addWorkflowNode('agent', 'New Agent', 'Curio')} />
            <FabButton icon={Database} label="System" color="text-blue-400" onClick={() => addWorkflowNode('system', 'New System', 'SAP')} />
            <FabButton icon={Truck} label="Action" color="text-emerald-400" onClick={() => addWorkflowNode('action', 'New Action', 'Aquila')} />
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <FabButton icon={isTestRunning ? Loader2 : Play} label={isTestRunning ? "Running..." : "Run Test"} color="text-white" highlight onClick={handleRunTest} spin={isTestRunning} />
         </div>
      </div>
      <AnimatePresence>
         {selectedNode && (
            <motion.div initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }} className="absolute top-4 right-4 bottom-24 w-80 bg-[#0F1019]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col">
               <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner border border-white/5 ${getNodeColor(selectedNode.type)}`}><NodeIcon type={selectedNode.type} /></div>
                      <div><h2 className="font-bold text-white text-sm tracking-wide">{selectedNode.label}</h2><p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{selectedNode.type}</p></div>
                  </div>
                  <button onClick={() => setSelectedNodeId(null)} className="hover:bg-white/10 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
               </div>
               <div className="flex-1 p-5 space-y-8 overflow-y-auto">
                  <div><SectionHeader label="Provider Integration" /><ProviderSelector node={selectedNode} updateProvider={updateNodeProvider} /></div>
                  <div><SectionHeader label="Node Configuration" /><div className="space-y-3"><ConfigInput label="API Endpoint URL" value="https://api.aedil.ai/v1/webhook" /><ConfigInput label="Request Timeout" value="5000ms" /><ConfigInput label="Retry Attempts" value="3" /></div></div>
               </div>
               <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end"><button className="px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-colors">Save Configuration</button></div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

const GlassNode = ({ node, selected, isTesting }: any) => (
    <motion.div layoutId={node.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: selected ? 1.05 : 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} data-node-id={node.id} className={`absolute w-[220px] h-[110px] rounded-2xl pointer-events-auto transition-all duration-200 group cursor-grab active:cursor-grabbing backdrop-blur-lg ${selected ? 'bg-[#1E1E2E]/95 ring-2 ring-indigo-500 shadow-[0_0_50px_-10px_rgba(99,102,241,0.4)] z-20' : 'bg-[#0F1019]/80 border border-white/10 hover:border-white/30 shadow-xl z-10'}`} style={{ left: node.position.x, top: node.position.y }}>
        {isTesting && (<div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0F1019] z-30 animate-ping" />)}
        {node.type !== 'trigger' && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 border border-slate-600 shadow-sm group-hover:bg-white transition-colors" />}
        {node.type !== 'action' && <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 border border-slate-600 shadow-sm group-hover:bg-white transition-colors" />}
        <div className="h-full p-4 flex flex-col pointer-events-none">
            <div className="flex items-center gap-3.5 mb-auto"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-white/5 ${getNodeColor(node.type)}`}><NodeIcon type={node.type} /></div><div><div className="text-[13px] font-bold text-white leading-tight">{node.label}</div><div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">{node.type}</div></div></div>
            <div className="flex items-center justify-between mt-3"><span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{node.provider}</span><span className="text-[10px] text-slate-500 font-mono">v1.0.4</span></div>
        </div>
    </motion.div>
);
const FabButton = ({ icon: Icon, label, color, highlight, onClick, spin }: any) => (<button onClick={onClick} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl w-18 transition-all hover:-translate-y-1 active:scale-95 ${highlight ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500' : 'hover:bg-white/10'}`}><Icon className={`w-5 h-5 ${color} ${spin ? 'animate-spin' : ''}`} strokeWidth={2} /><span className="text-[10px] font-bold text-slate-300">{label}</span></button>);
const SectionHeader = ({ label }: { label: string }) => (<div className="flex items-center gap-3 mb-4"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div><div className="h-px flex-1 bg-white/10"></div></div>);
const ConfigInput = ({ label, value }: { label: string, value: string }) => (<div><label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wide">{label}</label><input type="text" defaultValue={value} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all" /></div>);
const ProviderSelector = ({ node, updateProvider }: any) => { const options = ['ElevenLabs', 'Parloa', 'SAP', 'Salesforce', 'Curio', 'GPT-4', 'Teams']; return (<div className="grid grid-cols-1 gap-2.5">{options.slice(0, 6).map(opt => (<div key={opt} onClick={() => updateProvider(node.id, opt)} className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${node.provider === opt ? 'bg-indigo-500/10 border-indigo-500/50 shadow-sm' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}><span className={`text-xs font-medium ${node.provider === opt ? 'text-white' : 'text-slate-400'}`}>{opt}</span>{node.provider === opt && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}</div>))}</div>); }
const getNodeColor = (type: NodeType) => { switch (type) { case 'trigger': return 'bg-indigo-500/20 text-indigo-300'; case 'system': return 'bg-slate-700/30 text-slate-300'; case 'agent': return 'bg-amber-500/20 text-amber-300'; case 'action': return 'bg-emerald-500/20 text-emerald-300'; default: return 'bg-slate-800'; } };
const NodeIcon = ({ type }: { type: NodeType }) => { switch (type) { case 'trigger': return <Zap className="w-5 h-5" />; case 'system': return <Database className="w-5 h-5" />; case 'agent': return <Brain className="w-5 h-5" />; case 'action': return <Smartphone className="w-5 h-5" />; default: return <Settings className="w-5 h-5" />; } };
