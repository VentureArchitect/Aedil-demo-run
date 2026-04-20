
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Activity, Brain, Zap, Globe, BarChart3, Shield, Users, 
  Search, CheckCircle, Cpu, RefreshCw, GitMerge,
  ListTodo, FileText, Truck, Phone, CheckSquare, Network, Box, Mic, Settings, Download, MoreHorizontal, ArrowUpRight, UserPlus, X, Loader2, Key, Plug, Mail, Database, Send, MessageSquare, Calendar, AlertCircle, ChevronRight, Sparkles, ChevronDown, ChevronUp, Check, Play, Clock, ChevronLeft, Lock, Construction, File, Clipboard, Filter, History, Stethoscope, AlertTriangle, Layers, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { Diagnosis, ReasoningStep, Ticket } from '../../types';
import { IntelligenceGraph } from './IntelligenceGraph';

// --- OVERVIEW VIEW ---
export const OverviewView = ({ diagnosis, addToast }: { diagnosis: Diagnosis | null, addToast?: any }) => {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold text-white mb-8">System Overview</h1>
            <div className="mb-12">
                <IntelligenceGraph />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard icon={Zap} label="Daily Intake" value="1,284" trend="+12%" />
                <StatCard icon={Brain} label="AI Diagnostics" value="94.2%" trend="+2%" />
                <StatCard icon={Truck} label="Fleet Uptime" value="99.8%" trend="0%" />
                <StatCard icon={Shield} label="Security" value="Secure" color="text-emerald-400" />
            </div>
            {diagnosis && <TicketInspector diagnosis={diagnosis} />}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, trend, color = "text-white" }: any) => (
    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white/10 border-white/10 text-zinc-300"><Icon className="w-5 h-5" /></div>
            {trend && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
        <div className="text-xs text-zinc-500 font-medium">{label}</div>
    </div>
);

// --- TICKETS VIEW ---
export const TicketsView = ({ addToast }: any) => {
    const { tickets } = useOS();
    return (
        <div className="p-8 h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">Service Notifications</h1>
                <div className="flex gap-3">
                    <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2"><Filter className="w-4 h-4" /> Filter</button>
                    <button className="bg-white/10 border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Create New</button>
                </div>
            </div>
            <div className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="grid grid-cols-6 p-4 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span>Notification</span>
                    <span className="col-span-2">Customer</span>
                    <span>Equipment</span>
                    <span>Priority</span>
                    <span>Status</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tickets.map(t => (
                        <div key={t.id} className="grid grid-cols-6 p-4 border-b border-white/5 text-sm items-center hover:bg-white/5 cursor-pointer">
                            <span className="text-zinc-300 font-mono font-bold">#{t.number}</span>
                            <span className="col-span-2 text-white font-medium">{t.customer.name}</span>
                            <span className="text-zinc-400">{t.equipment.model}</span>
                            <span><PriorityBadge priority={t.priority} /></span>
                            <span><StatusBadge status={t.status} /></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PlusIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const PriorityBadge = ({ priority }: any) => {
    const isHigh = priority.includes('High');
    return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${isHigh ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-500/10 text-zinc-400 border-slate-500/20'}`}>{priority}</span>;
};

const StatusBadge = ({ status }: any) => (
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/10 border-white/10 text-zinc-300 font-bold">{status}</span>
);

// --- AEDIL CORTEX VIEW (REAL IMPLEMENTATION) ---
export const CortexView = ({ addToast }: any) => {
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const metrics = [
        { label: "Parameters", value: "42.8M", icon: Cpu, color: "text-blue-400" },
        { label: "Synapses", value: "1.2M", icon: Network, color: "text-zinc-300" },
        { label: "Base Growth", value: "+14%", icon: Activity, color: "text-emerald-400" },
        { label: "Recall Rate", value: "99.2%", icon: Zap, color: "text-zinc-300" }
    ];

    // UPDATED: Using percentage coordinates to ensure 100% visibility in any container size
    const nodes = [
        { id: 'n1', label: 'ETM 214', type: 'equipment', x: '20%', y: '30%', description: 'Reach Truck Series 2. High density in Hamburg warehouse sectors.' },
        { id: 'n2', label: 'Voltage Drop', type: 'symptom', x: '45%', y: '20%', description: 'Sudden VDC decline. Historically leads to hard shutdown events.' },
        { id: 'n3', label: 'Steering Load', type: 'symptom', x: '50%', y: '60%', description: 'High Amp draw in nodes. Usually correlates with mechanical resistance.' },
        { id: 'n4', label: 'Bearing Wear', type: 'fault', x: '75%', y: '40%', description: 'Mechanical degradation of Drehkranzlager. Confirmed root cause in 92% of similar cases.' },
        { id: 'n5', label: 'EJC 220', type: 'equipment', x: '25%', y: '75%', description: 'Electric Pedestrian Stackers. Common in retail and small-scale logistics.' }
    ];

    const edges = [
        { source: 'n1', target: 'n2', strength: 0.8 },
        { source: 'n1', target: 'n3', strength: 0.95 },
        { source: 'n2', target: 'n4', strength: 0.74 },
        { source: 'n3', target: 'n4', strength: 0.92 }
    ];

    return (
        <div className="h-full flex flex-col bg-black overflow-hidden">
            {/* Header Stats */}
            <div className="grid grid-cols-4 gap-px bg-white/5 shrink-0 border-b border-white/5">
                {metrics.map((m, i) => (
                    <div key={i} className="p-6 bg-black flex flex-col items-center">
                        <div className={`mb-2 ${m.color}`}><m.icon className="w-5 h-5" /></div>
                        <div className="text-xl font-bold text-white font-mono">{m.value}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{m.label}</div>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Neural Map (Graph) */}
                <div className="flex-1 relative bg-black overflow-hidden cursor-crosshair group/map">
                    {/* High-Tech Background Elements */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    
                    {/* Scanner Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                        />
                    </div>

                    {/* SVG Edges Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(99,102,241,0.2)" />
                                <stop offset="50%" stopColor="rgba(99,102,241,0.8)" />
                                <stop offset="100%" stopColor="rgba(99,102,241,0.2)" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {edges.map((edge, i) => {
                            const s = nodes.find(n => n.id === edge.source)!;
                            const t = nodes.find(n => n.id === edge.target)!;
                            return (
                                <g key={i}>
                                    <motion.line 
                                        x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                                        stroke="rgba(99,102,241,0.15)" 
                                        strokeWidth={edge.strength * 3} 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    />
                                    {/* Animated Pulse along the synapse */}
                                    <motion.line 
                                        x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                                        stroke="url(#edge-grad)" 
                                        strokeWidth={1.5}
                                        strokeDasharray="10, 100"
                                        filter="url(#glow)"
                                    >
                                        <animate 
                                            attributeName="stroke-dashoffset" 
                                            from="100" to="0" 
                                            dur={`${2 / edge.strength}s`} 
                                            repeatCount="indefinite" 
                                        />
                                    </motion.line>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map((node) => (
                        <motion.div 
                            key={node.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                opacity: 1,
                                y: [0, -6, 0] // Floating effect
                            }}
                            transition={{ 
                                scale: { type: "spring", stiffness: 200, damping: 20, delay: Math.random() * 0.5 },
                                y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            style={{ left: node.x, top: node.y }}
                            onClick={() => setSelectedNode(node)}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${selectedNode?.id === node.id ? 'bg-white/10 border border-white/20 scale-125 shadow-[0_0_40px_rgba(99,102,241,0.6)]' : 'bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20'}`}>
                                {node.type === 'equipment' && <Box className={`w-5 h-5 ${selectedNode?.id === node.id ? 'text-white' : 'text-zinc-400'}`} />}
                                {node.type === 'symptom' && <AlertTriangle className={`w-5 h-5 ${selectedNode?.id === node.id ? 'text-white' : 'text-zinc-300'}`} />}
                                {node.type === 'fault' && <Brain className={`w-5 h-5 ${selectedNode?.id === node.id ? 'text-white' : 'text-zinc-300'}`} />}
                                
                                {node.type === 'fault' && (
                                    <div className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-ping opacity-20"></div>
                                )}
                                
                                {/* Label Tooltip (Always Visible at low opacity, bright on hover) */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded backdrop-blur border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity z-20">
                                    {node.label}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="absolute bottom-6 left-6 text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-slate-700"></div> Equipment</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-white/10 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div> Symptom</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-white/10 border border-white/20 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div> Pattern</div>
                    </div>
                </div>

                {/* Info Panel / Learning Stream */}
                <div className="w-[400px] bg-black border-l border-white/5 flex flex-col shrink-0">
                    <div className="p-8 border-b border-white/5">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-white" /> Neural Context
                        </h3>
                        {selectedNode ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={selectedNode.id} className="space-y-4">
                                <div>
                                    <div className="text-2xl font-bold text-white tracking-tight mb-1">{selectedNode.label}</div>
                                    <div className="text-[10px] text-zinc-300 font-mono uppercase tracking-[0.2em]">{selectedNode.type} Entity Vector</div>
                                </div>
                                <div className="p-4 bg-white/10 border-white/10 rounded-xl">
                                    <p className="text-sm text-zinc-400 leading-relaxed italic">
                                        "{selectedNode.description}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                                        <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Confidence</div>
                                        <div className="text-lg font-bold text-white">94.2%</div>
                                    </div>
                                    <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                                        <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Frequency</div>
                                        <div className="text-lg font-bold text-white">High</div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold hover:bg-white/10 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 group">
                                    <Layers className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" /> Deep Model Insights
                                </button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                                <Brain className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-sm italic">Select a node on the Neural Map to inspect its diagnostic history and synaptic strength.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-4">Active Learning Stream</h4>
                        <div className="space-y-6">
                            <LearningLog icon={RefreshCw} time="Just now" text="Refined correlation: Voltage Drop vs. ETM 214 Steering Bearing." impact="+2.1%" status="up" />
                            <LearningLog icon={CheckCircle} time="4m ago" text="New solution validated: Sensorlage replacement on DMK Milchkontor fleet." impact="+0.8%" status="up" />
                            <LearningLog icon={Brain} time="12m ago" text="Semantic analysis complete for 2k service reports (Q3 2024)." impact="+5.4%" status="up" />
                            <LearningLog icon={Radio} time="1h ago" text="Telemetric pattern for 'E0015' confirmed across 12 warehouses." impact="+1.2%" status="up" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LearningLog = ({ icon: Icon, time, text, impact, status }: any) => (
    <div className="flex gap-5 group">
        <div className="shrink-0 pt-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 border-white/10 transition-colors">
                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-600 font-mono uppercase">{time}</span>
                <span className={`text-[9px] font-bold ${status === 'up' ? 'text-emerald-500 bg-emerald-500/5' : 'text-white bg-white/10 border-white/10'} px-1.5 py-0.5 rounded border border-current opacity-60`}>
                    {impact}
                </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 group-hover:text-slate-200 transition-colors">{text}</p>
        </div>
    </div>
);

// --- OTHER VIEWS ---
export const AgentsView = ({ addToast }: any) => <PlaceholderView label="Agent Management" icon={Brain} />;
export const ConnectorsView = ({ addToast }: any) => <PlaceholderView label="Infrastructure" icon={Globe} />;
export const AnalyticsView = ({ addToast }: any) => <PlaceholderView label="Analytics & Insights" icon={BarChart3} />;
export const SecurityView = ({ addToast }: any) => <PlaceholderView label="Security & Access" icon={Shield} />;
export const TeamView = ({ addToast }: any) => <PlaceholderView label="Team Collaboration" icon={Users} />;
export const SettingsView = ({ addToast }: any) => <PlaceholderView label="System Settings" icon={Settings} />;

const PlaceholderView = ({ label, icon: Icon }: any) => (
    <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
        <Icon className="w-16 h-16 opacity-10" />
        <h2 className="text-xl font-bold text-white/20 uppercase tracking-widest">{label}</h2>
        <p className="text-sm">Module initializing in sandbox environment...</p>
    </div>
);

// --- TICKET INSPECTOR (ENHANCED FOR MULTI-PART DIAGNOSIS) ---
export const TicketInspector = (props: any) => {
    const { diagnosis, closeTicketAnalysis, submitDiagnosisFeedback, performDispatch } = useOS();
    const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

    if (!diagnosis) return (
        <div className="h-full flex items-center justify-center text-zinc-500 flex-col gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span>Loading Ticket Intelligence...</span>
        </div>
    );

    const steps = diagnosis.reasoningChain || [];
    const isFeedbackGiven = !!diagnosis.feedback;

    // Combine primary and secondary faults into a single list of candidates
    const candidates = useMemo(() => [
        { ...diagnosis.primaryFault, rank: 1, type: 'Primary' },
        ...diagnosis.secondaryFaults.map((f, i) => ({ ...f, rank: i + 2, type: 'Secondary' }))
    ], [diagnosis]);

    const selectedFault = candidates[selectedCandidateIndex];
    const faultText = (selectedFault.fault || "").toLowerCase();

    // -- DYNAMIC EVIDENCE & SYMPTOM GENERATION --
    let evidenceCards = [];
    let symptomGuidance = null;

    // 1. DREHKRANZLAGER (Primary / Rank 1)
    if (faultText.includes('drehkranz') || faultText.includes('50452065')) {
        evidenceCards = [
            { 
                title: "Service History", source: "Fleet Analytics", value: "39 Einsätze (High)", 
                subtext: "Extremely high frequency", status: "Anomalous", statusColor: "red", icon: History 
            },
            { 
                title: "Error Log Pattern", source: "Control Unit", value: "200+ Steering Errors", 
                subtext: "13x Hardware Short Circuit", status: "Critical", statusColor: "red", icon: Zap 
            },
            { 
                title: "Battery Usage", source: "Telemetry", value: "40% Deep Discharge", 
                subtext: "Permanent heavy load", status: "Critical", statusColor: "amber", icon: Activity 
            },
            { 
                title: "Exclusion Logic", source: "AI Reasoner", value: "No Error 3154", 
                subtext: "Excludes Sensor Bearing", status: "Verified", statusColor: "emerald", icon: Shield 
            }
        ];
        symptomGuidance = (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-zinc-300" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Symptom vor Ort (On-Site Verification)</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Kunde meldet "Fahrzeug geht aus". Dies passt zu starken Spannungseinbrüchen durch mechanische Blockade. 
                    <br/><span className="text-white font-bold">Prüfung:</span> Achte bei der Lenkung auf ungewöhnliche Geräusche wie <span className="text-zinc-300">Knacken, Mahlen oder Quietschen</span>, die auf hohen mechanischen Widerstand des Drehkranzlagers hindeuten.
                </p>
            </div>
        );
    } 
    // 2. SENSORLAGER (Secondary / Rank 2)
    else if (faultText.includes('sensorlager') || faultText.includes('51509314')) {
        evidenceCards = [
            { 
                title: "Signal Integrity", source: "Telemetry", value: "High Jitter", 
                subtext: "Position signal noisy", status: "Warning", statusColor: "amber", icon: Activity 
            },
            { 
                title: "Error Code Check", source: "Control Unit", value: "Missing 3154", 
                subtext: "Error 3154 not present", status: "Mismatch", statusColor: "slate", icon: AlertCircle 
            },
            { 
                title: "Voltage Impact", source: "Circuit Analysis", value: "Stable 24V", 
                subtext: "Cannot explain shutdown", status: "OK", statusColor: "emerald", icon: Zap 
            },
            { 
                title: "Component Age", source: "Asset History", value: "Replaced 6mo", 
                subtext: "Relatively new part", status: "Low Prob", statusColor: "slate", icon: Clock 
            }
        ];
        symptomGuidance = (
            <div className="bg-zinc-900/30 border-white/10 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Symptom vor Ort (Alternative)</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Ein defektes Sensorlager führt meist zu <span className="text-white font-bold">zitternder Lenkung</span> oder Sprüngen in der Lenkposition, aber selten zum kompletten Systemabsturz (Shutdown).
                    <br/><span className="text-white font-bold">Prüfung:</span> Prüfe Lenkwinkel im Display. Wenn stabil, ist Sensorlager unwahrscheinlich.
                </p>
            </div>
        );
    }
    // 3. INITIATOR (Secondary / Rank 3)
    else if (faultText.includes('initiator') || faultText.includes('51470075')) {
        evidenceCards = [
            { 
                title: "Switch State", source: "Log Analysis", value: "No Events", 
                subtext: "Switch logic normal", status: "OK", statusColor: "emerald", icon: CheckCircle 
            },
            { 
                title: "Symptom Match", source: "Manuals KB", value: "Limp Mode", 
                subtext: "Would cause 'Schleichgang'", status: "Mismatch", statusColor: "red", icon: FileText 
            },
            { 
                title: "Cost Factor", source: "Inventory", value: "Cheap Part", 
                subtext: "Bring as backup", status: "Info", statusColor: "indigo", icon: Box 
            },
            { 
                title: "Short Circuit", source: "Electric Diag", value: "Negative", 
                subtext: "No short detected", status: "OK", statusColor: "emerald", icon: Zap 
            }
        ];
        symptomGuidance = (
            <div className="bg-zinc-900/30 border-white/10 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Symptom vor Ort (Alternative)</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Ein defekter Initiator (Referenzschalter) würde typischerweise den <span className="text-white font-bold">Schleichgang</span> aktivieren, aber das Fahrzeug nicht komplett abschalten.
                    <br/><span className="text-white font-bold">Prüfung:</span> Fährt das Fahrzeug langsam? Wenn es normal fährt und dann ausgeht, ist der Initiator nicht die Ursache.
                </p>
            </div>
        );
    }
    // DEFAULT FALLBACK
    else {
        evidenceCards = [
            { title: "Telemetry Signature", source: "IoT Stream", value: "Pressure Drop", subtext: "Consistent decline", status: "Critical", statusColor: "red", icon: Activity },
            { title: "Error Code Match", source: "Manuals KB", value: "E0015: Hydr. Pump", subtext: "Matches manual pg 42", status: "Verified", statusColor: "indigo", icon: Database },
            { title: "Historical Correlation", source: "Fleet History", value: "91% Match", subtext: "Similar models", status: "High", statusColor: "emerald", icon: Clock },
            { title: "Parts Availability", source: "Inventory", value: "Ready in Van", subtext: "Stock verified", status: "Ready", statusColor: "emerald", icon: Box }
        ];
    }

    return (
        <div className="h-full flex flex-col bg-black font-sans selection:bg-white/10 border-white/20">
            {/* Top Bar */}
            <div className="h-16 border-b border-white/5 flex items-center px-6 shrink-0 bg-zinc-950 justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={closeTicketAnalysis} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-sm flex items-center gap-2">
                            Case Analysis <span className="text-zinc-500 font-normal">#{diagnosis.ticketId.replace('T-','')}</span>
                        </h1>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                            <span>Started {new Date(diagnosis.timestamp).toLocaleTimeString()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span className="text-zinc-300">AEDIL Agent v2.5</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {isFeedbackGiven ? (
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 ${diagnosis.feedback?.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                            {diagnosis.feedback?.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {diagnosis.feedback?.status === 'approved' ? 'Decision: Approved' : 'Decision: Rejected'}
                        </div>
                    ) : (
                        <>
                            <button onClick={() => submitDiagnosisFeedback(diagnosis.ticketId, 'rejected', 'Incorrect diagnosis')} className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Reject Analysis</button>
                            <button onClick={() => { submitDiagnosisFeedback(diagnosis.ticketId, 'approved'); performDispatch(); }} className="bg-white text-black px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Zap className="w-3.5 h-3.5 fill-black" /> Approve & Dispatch
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: TIMELINE */}
                <div className="w-[360px] border-r border-white/5 bg-black flex flex-col">
                    <div className="p-5 border-b border-white/5"><h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-white" /> Investigation Steps</h2></div>
                    <div className="flex-1 overflow-y-auto p-5 relative">
                        <div className="absolute left-[33px] top-5 bottom-5 w-px bg-white/5"></div>
                        <div className="space-y-6">{steps.map((step, idx) => (<TimelineStep key={step.id} step={step} index={idx} isLast={idx === steps.length - 1} />))}</div>
                    </div>
                </div>

                {/* RIGHT: DOSSIER */}
                <div className="flex-1 overflow-y-auto bg-black p-8 xl:p-12 flex flex-col">
                    <div className="max-w-4xl mx-auto w-full space-y-8">
                        
                        {/* CANDIDATE SELECTOR */}
                        <div className="flex items-center gap-2 mb-4 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
                            {candidates.map((cand, idx) => {
                                const isSelected = selectedCandidateIndex === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedCandidateIndex(idx)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isSelected ? 'bg-white/10 border border-white/20 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${isSelected ? 'bg-white text-white' : 'bg-white/10 text-zinc-400'}`}>{cand.rank}</span>
                                        {cand.rank === 1 ? 'Primary Fault' : cand.rank === 2 ? 'Secondary Fault' : cand.rank === 3 ? 'Tertiary Fault' : `Candidate ${cand.rank}`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* DIAGNOSIS HEADER */}
                        <motion.div 
                            key={selectedFault.fault}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${selectedFault.rank === 1 ? 'text-zinc-300 border-white/10 bg-white/10 border-white/10' : 'text-zinc-400 border-slate-500/20 bg-slate-500/10'}`}>
                                        Diagnosis Rank {selectedFault.rank}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2">{selectedFault.fault.replace(/\(Rang \d\)/, '')}</h1>
                                <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                                    {selectedFault.reasoning}
                                </p>
                                {symptomGuidance}
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Confidence Score</div>
                                <div className="text-5xl font-bold text-white tracking-tighter">
                                    {selectedFault.confidence.toFixed(2).replace('.', ',')}<span className="text-2xl text-slate-600 font-normal"> %</span>
                                </div>
                            </div>
                        </motion.div>

                        <div className="h-px bg-white/5 w-full"></div>

                        {/* EVIDENCE GRID */}
                        <motion.div
                            key={`evidence-${selectedFault.fault}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> 
                                {selectedFault.rank === 1 ? 'Key Evidence (Beobachtungen)' : 'Exclusion Indicators (Gegenindikatoren)'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {evidenceCards.map((card, i) => (
                                    <EvidenceCard 
                                        key={i} 
                                        title={card.title} 
                                        source={card.source} 
                                        value={card.value} 
                                        subtext={card.subtext} 
                                        status={card.status} 
                                        statusColor={card.statusColor} 
                                        icon={card.icon} 
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimelineStep = ({ step, index, isLast }: any) => (
    <div className="relative pl-12 group">
        <div className={`absolute left-[29px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#08080C] z-10 transition-colors ${step.status === 'complete' ? 'bg-white/10 border border-white/20 group-hover:bg-white' : 'bg-white/10 border border-white/20'}`}></div>
        <div className="flex flex-col gap-1 pb-4">
            <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{step.action}</span><span className="text-[9px] font-mono text-slate-600">{step.duration}ms</span></div>
            <div className="flex items-center gap-2"><span className={`text-[9px] px-1.5 py-0.5 rounded border ${getSystemBadgeStyle(step.system)}`}>{step.system}</span>{step.result && <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{step.result}</span>}</div>
        </div>
    </div>
);

const EvidenceCard = ({ title, source, value, subtext, status, statusColor = 'zinc', icon: Icon }: any) => {
    const statusStyles: any = { emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", red: "bg-red-500/10 text-red-400 border-red-500/20", amber: "bg-white/10 border border-white/10 text-zinc-300", amber: "bg-white/10 border border-white/10 text-zinc-300", slate: "bg-slate-500/10 text-zinc-400 border-slate-500/20" };
    return (
        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-3"><div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors text-zinc-400 group-hover:text-white"><Icon className="w-4 h-4" /></div><span className={`text-[10px] font-bold px-2 py-1 rounded border ${statusStyles[statusColor]}`}>{status}</span></div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{source}</div>
            <div className="text-lg font-bold text-white mb-0.5">{value}</div>
            {subtext && <div className="text-xs text-zinc-300 mb-1">{subtext}</div>}
            <div className="text-[10px] text-slate-600">{title}</div>
        </div>
    );
};

const getSystemBadgeStyle = (system: string) => {
    switch(system) {
        case 'SAP': return 'bg-white/10 text-zinc-300 border-white/20';
        case 'IoT': return 'bg-white/5 text-orange-400 border-orange-500/20';
        case 'Manuals': return 'bg-zinc-900 text-zinc-400 border-slate-600/30';
        case 'History': return 'bg-rose-900/20 text-rose-400 border-rose-500/20';
        case 'Inventory': return 'bg-white/5 text-zinc-300 border-white/10';
        default: return 'bg-white/5 text-zinc-400 border-white/10';
    }
};
