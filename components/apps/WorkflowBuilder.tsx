
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { 
  Zap, Database, Brain, Truck, Smartphone, Settings, 
  X, CheckCircle, Play, ZoomIn, ZoomOut, Grip, Loader2, Sparkles, ArrowRight,
  Mail, MessageSquare, Globe, Server, Layers, Box, 
  Terminal, ShieldCheck, Cpu, Radio, Mic, Map, Bell, ArrowRightCircle, Plus
} from 'lucide-react';
import { WorkflowNode, NodeType } from '../../types';

// --- CONFIGURATION CONSTANTS ---

// Phases Definition for Logical Flow
const WORKFLOW_PHASES = {
    trigger: { label: '1. Intake', color: 'text-zinc-300', border: 'border-white/20', bg: 'bg-white/10 border border-white/20/10', description: 'Problem Reporting Channel' },
    system: { label: '2. System', color: 'text-zinc-300', border: 'border-white/20', bg: 'bg-white/10', description: 'System of Record' },
    agent: { label: '3. Intelligence', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', description: 'AI Processing & Diagnostics' },
    logic: { label: '4. Planning', color: 'text-zinc-300', border: 'border-white/20', bg: 'bg-white/10 border border-white/20/10', description: 'Scheduling & Dispatch' },
    action: { label: '5. Execution', color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10', description: 'Field Service & Notifications' }
};

const PhoneIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

interface ProviderConfig {
    icon: any;
    color: string;
    category: string;
    description: string;
    allowedTypes: NodeType[]; 
    type: NodeType; 
}

const PROVIDER_LIBRARY: Record<string, ProviderConfig> = {
    // INTAKE (Trigger)
    'AEDIL Porta': { icon: Mic, color: '#8B5CF6', category: 'Voice AI', description: 'Voice Intake Agent', allowedTypes: ['trigger'], type: 'trigger' },
    'Outlook Ingest': { icon: Mail, color: '#0078D4', category: 'Email', description: 'Exchange Online / O365', allowedTypes: ['trigger'], type: 'trigger' },
    'WhatsApp': { icon: MessageSquare, color: '#25D366', category: 'Messaging', description: 'WhatsApp Business API', allowedTypes: ['trigger'], type: 'trigger' },
    'IoT Alert': { icon: Radio, color: '#EF4444', category: 'Sensor', description: 'Azure IoT Hub / MQTT', allowedTypes: ['trigger'], type: 'trigger' },
    'Phone Call': { icon: PhoneIcon, color: '#10B981', category: 'Voice', description: 'Legacy PBX', allowedTypes: ['trigger'], type: 'trigger' },

    // SYSTEM OF RECORD (System)
    'SAP S/4HANA': { icon: Database, color: '#0FAAFF', category: 'ERP', description: 'Cloud / On-Premise', allowedTypes: ['system'], type: 'system' },
    'Salesforce': { icon: Globe, color: '#00A1E0', category: 'CRM', description: 'Service Cloud', allowedTypes: ['system'], type: 'system' },
    'Jira': { icon: Layers, color: '#0052CC', category: 'Ticket System', description: 'Core Issue Tracking', allowedTypes: ['system'], type: 'system' },
    'Microsoft Dynamics': { icon: Server, color: '#002050', category: 'ERP', description: 'F&O / Business Central', allowedTypes: ['system'], type: 'system' },

    // INTELLIGENCE (Agent)
    'AEDIL (GPT-4)': { icon: Brain, color: '#10B981', category: 'LLM', description: 'Reasoning Engine', allowedTypes: ['agent'], type: 'agent' },
    'Custom Script': { icon: Terminal, color: '#F59E0B', category: 'Code', description: 'Python / Node.js', allowedTypes: ['agent'], type: 'agent' },
    'Azure OpenAI': { icon: Cpu, color: '#0078D4', category: 'LLM', description: 'Private Instance', allowedTypes: ['agent'], type: 'agent' },

    // PLANNING (Logic)
    'IFS FSM': { icon: Truck, color: '#6d28d9', category: 'FSM', description: 'Field Service Management', allowedTypes: ['logic'], type: 'logic' },
    'Visitour': { icon: Map, color: '#F97316', category: 'Scheduling', description: 'Route Optimization', allowedTypes: ['logic'], type: 'logic' },
    'SAP FSM': { icon: Map, color: '#0FAAFF', category: 'FSM', description: 'Cloud Field Service', allowedTypes: ['logic'], type: 'logic' },

    // EXECUTION (Action)
    'AEDIL Aquila': { icon: Smartphone, color: '#3B82F6', category: 'Mobile', description: 'Technician App', allowedTypes: ['action'], type: 'action' },
    'Email Out': { icon: Mail, color: '#64748B', category: 'Notify', description: 'SMTP Relay', allowedTypes: ['action'], type: 'action' },
    'Teams Notify': { icon: MessageSquare, color: '#6264A7', category: 'Notify', description: 'Channel Alert', allowedTypes: ['action'], type: 'action' },
};

const DEFAULT_PROVIDER = { icon: Box, color: '#64748B', category: 'Generic', description: 'Generic Integration', allowedTypes: [], type: 'system' as NodeType };

// --- MAIN COMPONENT ---

export const WorkflowBuilder = (props: any) => {
  const { addToast } = props;
  
  // Use specific selectors
  const workflowNodes = useOS(state => state.workflowNodes);
  const workflowEdges = useOS(state => state.workflowEdges);
  const updateNodeProvider = useOS(state => state.updateNodeProvider);
  const addWorkflowNode = useOS(state => state.addWorkflowNode);
  const updateWorkflowNodePosition = useOS(state => state.updateWorkflowNodePosition);
  const deleteWorkflowNode = useOS(state => state.deleteWorkflowNode);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const selectedNode = workflowNodes.find(n => n.id === selectedNodeId);

  // --- ACTIONS ---

  const handleDeleteNode = () => {
      if (selectedNodeId) {
          deleteWorkflowNode(selectedNodeId);
          setSelectedNodeId(null);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const providerKey = e.dataTransfer.getData('provider');
      if (!providerKey || !containerRef.current) return;

      const providerConfig = PROVIDER_LIBRARY[providerKey];
      if (!providerConfig) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      let parentId = undefined;
      if (selectedNodeId) {
          const parent = workflowNodes.find(n => n.id === selectedNodeId);
          if (parent && isNextPhase(parent.type, providerConfig.type)) {
              parentId = selectedNodeId;
          }
      }

      if (!parentId && workflowNodes.length > 0) {
          const lastNode = workflowNodes[workflowNodes.length - 1];
          if (isNextPhase(lastNode.type, providerConfig.type)) {
              parentId = lastNode.id;
          }
      }

      let finalX = x;
      let finalY = y;
      
      finalX -= 120;
      finalY -= 60;

      addWorkflowNode(
          providerConfig.type, 
          providerConfig.type.charAt(0).toUpperCase() + providerConfig.type.slice(1), 
          providerKey, 
          parentId,
          { x: finalX, y: finalY }
      );
      
      addToast(`Added ${providerKey}`, 'success');
  };

  const isNextPhase = (current: NodeType, next: NodeType) => {
      const order = ['trigger', 'system', 'agent', 'logic', 'action'];
      const cIdx = order.indexOf(current);
      const nIdx = order.indexOf(next);
      return nIdx > cIdx; 
  };

  // --- EVENT HANDLERS ---

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

  const handleRunTest = () => { 
      setIsTestRunning(true); 
      addToast('Validating workflow logic...', 'info');
      setTimeout(() => {
          setIsTestRunning(false);
          addToast('Workflow validation successful', 'success');
      }, 3000); 
  };

  return (
    <div className="h-full w-full flex bg-black text-slate-300 overflow-hidden select-none font-sans">
      
      {/* LEFT SIDEBAR: PALETTE */}
      <div className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-white/5">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Box className="w-3 h-3 text-white" /> Component Library
              </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-6">
              {/* Render categories */}
              <PaletteCategory title="Intake Sources" type="trigger" />
              <PaletteCategory title="Systems of Record" type="system" />
              <PaletteCategory title="AEDIL Intelligence" type="agent" />
              <PaletteCategory title="Planning & Sched" type="logic" />
              <PaletteCategory title="Output & Actions" type="action" />
          </div>
          <div className="p-3 border-t border-white/5 bg-black/20 text-[10px] text-zinc-500 text-center">
              Drag nodes to canvas
          </div>
      </div>

      {/* CANVAS AREA */}
      <div 
        ref={containerRef}
        className={`flex-1 relative w-full h-full overflow-hidden ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
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
            {/* Background Grid */}
            <div className="absolute -inset-[5000px] opacity-[0.1] pointer-events-none" 
                style={{ 
                    backgroundImage: `
                        linear-gradient(to right, #4F46E5 1px, transparent 1px),
                        linear-gradient(to bottom, #4F46E5 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }} 
            />
            
            {/* Connections (Edges) */}
            <svg className="absolute -inset-[5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible z-0">
                <defs>
                    <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#EC4899" /></linearGradient>
                    <filter id="glow-line"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#334155" />
                    </marker>
                </defs>
                {workflowEdges.map(edge => {
                    const source = workflowNodes.find(n => n.id === edge.source);
                    const target = workflowNodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;
                    const startX = source.position.x + 240; const startY = source.position.y + 60;
                    const endX = target.position.x; const endY = target.position.y + 60;
                    
                    const deltaX = Math.abs(endX - startX);
                    const controlPointOffset = Math.max(deltaX * 0.5, 50);
                    const pathD = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
                    
                    return (
                    <g key={edge.id}>
                        <path d={pathD} fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                        <path d={pathD} fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrowhead)" />
                        
                        {isTestRunning && (
                            <path d={pathD} fill="none" stroke="url(#flow-grad)" strokeWidth="3" strokeLinecap="round" className="animate-flow" filter="url(#glow-line)">
                                <animate attributeName="stroke-dasharray" values="0,1000; 1000,0" dur="1.5s" repeatCount="indefinite" />
                            </path>
                        )}
                        <circle r="3" fill="#F59E0B" filter="url(#glow-line)">
                            <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
                        </circle>
                    </g>
                    );
                })}
            </svg>

            {/* Nodes */}
            <div className="absolute top-0 left-0 w-full h-full z-10">
                <AnimatePresence>
                {workflowNodes.map(node => (
                    <GlassNode key={node.id} node={node} selected={selectedNodeId === node.id} isTesting={isTestRunning} />
                ))}
                </AnimatePresence>
            </div>
        </div>

        {/* View Controls */}
        <div className="absolute bottom-10 left-10 flex gap-2 z-50">
             <div className="bg-black/60 backdrop-blur border border-white/10 rounded-lg p-1 flex flex-col shadow-xl">
                 <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 hover:bg-white/10 rounded text-white"><ZoomIn className="w-4 h-4" /></button>
                 <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 hover:bg-white/10 rounded text-white"><ZoomOut className="w-4 h-4" /></button>
                 <button onClick={() => { setZoom(1); setPan({x:0,y:0}) }} className="p-2 hover:bg-white/10 rounded text-white"><Grip className="w-4 h-4" /></button>
             </div>
        </div>

        {/* Test Button */}
        <div className="absolute top-6 right-80 z-40">
            <button 
                onClick={handleRunTest}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/10 border border-white/20 rounded-xl text-white transition-all shadow-lg hover:shadow-white/10"
            >
                {isTestRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span className="text-xs font-bold">Run Simulation</span>
            </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR: INSPECTOR */}
      <AnimatePresence>
         {selectedNode && (
            <motion.div 
                initial={{ x: 320, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: 320, opacity: 0 }} 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-80 bg-zinc-950 border-l border-white/10 flex flex-col z-30 shadow-2xl relative"
            >
               {/* Inspector Header */}
               <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/5 bg-gradient-to-br from-slate-800 to-black">
                          <NodeIcon type={selectedNode.type} className="w-5 h-5 text-slate-300" />
                      </div>
                      <div>
                          <h2 className="font-bold text-white text-sm tracking-wide">{selectedNode.label.split('.')[1] || selectedNode.label}</h2>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{WORKFLOW_PHASES[selectedNode.type as keyof typeof WORKFLOW_PHASES]?.label}</p>
                      </div>
                  </div>
                  <button onClick={() => setSelectedNodeId(null)} className="hover:bg-white/10 p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                  </button>
               </div>

               {/* Inspector Body */}
               <div className="flex-1 p-5 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  
                  {/* Provider Selection (Restricted) */}
                  <div>
                      <SectionHeader label="Integration Provider" />
                      <ProviderSelector 
                          node={selectedNode} 
                          updateProvider={updateNodeProvider} 
                      />
                  </div>

                  {/* Configuration */}
                  <div>
                      <SectionHeader label="Node Configuration" />
                      <div className="space-y-4">
                          <ConfigInput label="Endpoint / Connection String" value="https://api.gateway.internal/v1/hook" />
                          <ConfigInput label="Authentication" value="OAuth 2.0 (Connected)" secure />
                          
                          <div className="flex gap-2">
                              <div className="flex-1">
                                  <ConfigInput label="Timeout (ms)" value="5000" />
                              </div>
                              <div className="flex-1">
                                  <ConfigInput label="Retries" value="3" />
                              </div>
                          </div>
                      </div>
                  </div>

               </div>

               {/* Inspector Footer */}
               <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                   <button 
                       onClick={handleDeleteNode}
                       className="text-xs text-red-400 hover:text-red-300 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                   >
                       <X className="w-3 h-3" /> Remove Node
                   </button>
                   <button className="px-4 py-2.5 rounded-lg text-xs font-bold bg-white/10 border border-white/20 text-white hover:bg-white/10 border border-white/20 shadow-lg shadow-white/5 transition-colors">
                       Save Changes
                   </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const DraggableItem: React.FC<{ name: string; config: ProviderConfig }> = ({ name, config }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('provider', name);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const isAedil = name.includes('AEDIL') || name.includes('Curio');

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            className={`
                px-3 py-2 rounded-lg border flex items-center gap-3 cursor-grab active:cursor-grabbing hover:translate-x-1 transition-all
                ${isAedil ? 'bg-white/10 border border-white/20/5 border-white/10 hover:border-white/20' : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'}
            `}
        >
            <div className={`p-1.5 rounded-md bg-white/5 ${isAedil ? 'text-zinc-300' : 'text-zinc-400'}`}>
                <config.icon className="w-3.5 h-3.5" />
            </div>
            <div>
                <div className={`text-xs font-bold ${isAedil ? 'text-white' : 'text-slate-300'}`}>{name}</div>
                <div className="text-[9px] text-slate-600">{config.category}</div>
            </div>
            {isAedil && <Sparkles className="w-3 h-3 text-white ml-auto animate-pulse" />}
        </div>
    );
};

const PaletteCategory = ({ title, type }: { title: string, type: NodeType }) => {
    const items = Object.entries(PROVIDER_LIBRARY).filter(([key, config]) => config.type === type);
    
    return (
        <div className="mb-4">
            <div className="px-2 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${WORKFLOW_PHASES[type as keyof typeof WORKFLOW_PHASES]?.bg.replace('/10','/50')}`}></span>
                {title}
            </div>
            <div className="space-y-1">
                {items.map(([key, config]) => (
                    <DraggableItem key={key} name={key} config={config} />
                ))}
            </div>
        </div>
    );
};

const GlassNode = ({ node, selected, isTesting }: any) => {
    const providerConfig = PROVIDER_LIBRARY[node.provider] || DEFAULT_PROVIDER;
    const Icon = providerConfig.icon;
    
    const phase = WORKFLOW_PHASES[node.type as keyof typeof WORKFLOW_PHASES] || WORKFLOW_PHASES.system;
    const isAedil = node.provider.includes('AEDIL') || node.provider.includes('Curio');

    return (
        <motion.div 
            layoutId={node.id} 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: selected ? 1.05 : 1, opacity: 1 }} 
            exit={{ scale: 0, opacity: 0 }} 
            data-node-id={node.id} 
            className={`
                absolute w-[240px] h-[120px] rounded-2xl pointer-events-auto transition-all duration-200 group cursor-grab active:cursor-grabbing backdrop-blur-md overflow-hidden flex flex-col
                ${selected 
                    ? 'bg-zinc-900/95 ring-2 shadow-[0_0_50px_-10px_rgba(255,255,255,0.1)] z-20' 
                    : 'bg-zinc-950/90 border border-white/10 hover:border-white/30 shadow-xl z-10'
                }
                ${isAedil ? 'shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)]' : ''}
            `} 
            style={{ 
                left: node.position.x, 
                top: node.position.y,
                borderColor: selected ? providerConfig.color : (isAedil ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)')
            }}
        >
            <div className={`h-8 px-4 flex items-center gap-2 border-b border-white/5 ${phase.bg}`}>
                <div className={`w-2 h-2 rounded-full ${phase.color.replace('text-','bg-')}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${phase.color}`}>{phase.label.split('.')[1]}</span>
                {isAedil && <span className="ml-auto text-[9px] font-bold text-zinc-300 border border-white/10 px-1.5 rounded bg-white/10 border border-white/20/10">AI</span>}
            </div>

            <div className="flex-1 p-4 flex flex-col relative z-10">
                <div className="flex items-start gap-3.5 mb-auto">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/5 shrink-0 bg-white/5"
                    >
                        <Icon style={{ color: providerConfig.color }} className="w-5 h-5" strokeWidth={2} />
                    </div>
                    
                    <div>
                        <div className="text-[13px] font-bold text-white leading-tight mb-0.5">{node.provider}</div>
                        <div className="text-[10px] text-zinc-400 font-medium">{providerConfig.category}</div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                        {isTesting ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                                <span className="text-emerald-500">Processing...</span>
                            </>
                        ) : (
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Idle</span>
                        )}
                    </div>
                </div>
            </div>

            {isTesting && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0F1019] z-30 animate-ping" />
            )}

            {node.type !== 'trigger' && (
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-800 border border-slate-600 shadow-sm group-hover:scale-125 transition-transform" />
            )}
            {node.type !== 'action' && (
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-800 border border-slate-600 shadow-sm group-hover:scale-125 transition-transform" />
            )}
        </motion.div>
    );
};

const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</div>
        <div className="h-px flex-1 bg-white/10"></div>
    </div>
);

const ConfigInput = ({ label, value, secure }: { label: string, value: string, secure?: boolean }) => (
    <div>
        <label className="text-[10px] font-bold text-zinc-400 mb-1.5 block uppercase tracking-wide">{label}</label>
        <div className="relative">
            <input 
                type={secure ? "password" : "text"} 
                defaultValue={value} 
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-200 font-mono focus:border-white/20 focus:ring-1 focus:ring-white/20 outline-none transition-all shadow-inner" 
            />
            {secure && <ShieldCheck className="absolute right-3 top-2.5 w-3.5 h-3.5 text-emerald-500" />}
        </div>
    </div>
);

const ProviderSelector = ({ node, updateProvider }: any) => { 
    const allowedProviders = Object.entries(PROVIDER_LIBRARY).filter(([name, config]) => {
        return config.allowedTypes.includes(node.type);
    });
    
    if (allowedProviders.length === 0) {
        return <div className="text-xs text-zinc-500 italic p-4 text-center">No providers available for this phase.</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-2">
            {allowedProviders.map(([name, config]) => (
                <div 
                    key={name} 
                    onClick={() => updateProvider(node.id, name)} 
                    className={`
                        p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all group
                        ${node.provider === name 
                            ? 'bg-white/10 border border-white/20/10 border-white/20 shadow-sm' 
                            : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${config.color}20` }}
                        >
                            <config.icon style={{ color: config.color }} className="w-4 h-4" />
                        </div>
                        <div>
                            <div className={`text-xs font-bold ${node.provider === name ? 'text-white' : 'text-slate-300'}`}>{name}</div>
                            <div className="text-[10px] text-zinc-500">{config.description}</div>
                        </div>
                    </div>
                    {node.provider === name && <CheckCircle className="w-4 h-4 text-zinc-300" />}
                </div>
            ))}
        </div>
    ); 
}

const NodeIcon = ({ type, className }: { type: NodeType, className?: string }) => { 
    switch (type) { 
        case 'trigger': return <Zap className={className} />; 
        case 'system': return <Database className={className} />; 
        case 'agent': return <Brain className={className} />; 
        case 'logic': return <Map className={className} />; 
        case 'action': return <Smartphone className={className} />; 
        default: return <Settings className={className} />; 
    } 
};
