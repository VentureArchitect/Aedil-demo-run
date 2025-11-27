

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Activity, Brain, Zap, Globe, BarChart3, Shield, Users, 
  Search, CheckCircle, Cpu, RefreshCw, GitMerge,
  ListTodo, FileText, Truck, Phone, CheckSquare, Network, Box, Mic, Settings, Download, MoreHorizontal, ArrowUpRight, UserPlus, X, Loader2, Key, Plug, Mail, Database, Send, MessageSquare, Calendar, AlertCircle, ChevronRight, Sparkles, ChevronDown, ChevronUp, Check, Play, Clock, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { Diagnosis, ReasoningStep, Ticket } from '../../types';

// --- TICKET INSPECTOR (NEW DEEP DIVE VIEW) ---
export const TicketInspector = (props: any) => {
    const { diagnosis, closeTicketAnalysis, submitDiagnosisFeedback, performDispatch } = useOS();
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    if (!diagnosis) return (
        <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span>Loading Ticket Intelligence...</span>
        </div>
    );

    const steps = diagnosis.reasoningChain || [];
    const isFeedbackGiven = !!diagnosis.feedback;

    return (
        <div className="h-full flex flex-col bg-[#0B0C15] overflow-hidden relative">
            {/* Header / Breadcrumb */}
            <div className="h-16 border-b border-white/5 flex items-center px-8 shrink-0 bg-[#0E0E14] z-10">
                <button onClick={closeTicketAnalysis} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors mr-6">
                    <ChevronLeft className="w-4 h-4" /> Back to Tickets
                </button>
                <div className="h-6 w-px bg-white/10 mr-6"></div>
                <div>
                    <h1 className="text-white font-bold text-lg flex items-center gap-3">
                        Ticket #{diagnosis.ticketId.replace('T-','')} Analysis
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                            AGENTIC TRACE
                        </span>
                    </h1>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    {isFeedbackGiven ? (
                        <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${diagnosis.feedback?.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {diagnosis.feedback?.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            {diagnosis.feedback?.status === 'approved' ? 'Approved by Operator' : 'Rejected by Operator'}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    submitDiagnosisFeedback(diagnosis.ticketId, 'approved');
                                    performDispatch();
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
                            >
                                <Check className="w-4 h-4" /> Approve & Dispatch
                            </button>
                            <button 
                                onClick={() => submitDiagnosisFeedback(diagnosis.ticketId, 'rejected', 'Incorrect diagnosis')}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: REASONING TIMELINE */}
                <div className="flex-1 overflow-y-auto p-8 relative scrollbar-thin scrollbar-thumb-white/10">
                    <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                    
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {steps.map((step: ReasoningStep, index: number) => (
                            <motion.div 
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-12 group"
                            >
                                {/* Time marker */}
                                <div className="absolute -left-20 top-4 text-[10px] font-mono text-slate-600 w-16 text-right">
                                    +{index * 350}ms
                                </div>

                                {/* Node Dot */}
                                <div className={`absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#0B0C15] z-10 ${step.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                                <div className="bg-[#15151A] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                                    <div 
                                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                        className="p-4 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSystemColor(step.system)} bg-opacity-10`}>
                                                {getSystemIcon(step.system)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                    {step.action}
                                                    {step.system !== 'Reasoning' && (
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${getSystemColor(step.system)} bg-opacity-10 border border-opacity-20`}>
                                                            {step.system} TOOL
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                                    Duration: {step.duration || 120}ms • Status: {step.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {step.input && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">INPUT DATA</span>}
                                            {step.output && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">OUTPUT DATA</span>}
                                            {expandedStep === step.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedStep === step.id && (step.input || step.output) && (
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden bg-black/30 border-t border-white/5"
                                            >
                                                <div className="p-4 grid grid-cols-2 gap-4">
                                                    {step.input && (
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <ArrowUpRight className="w-3 h-3" /> Input Payload
                                                            </div>
                                                            <div className="bg-[#0B0C15] rounded border border-white/5 p-3 overflow-x-auto">
                                                                <pre className="text-[10px] font-mono text-indigo-300 leading-relaxed">
                                                                    {JSON.stringify(step.input, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {step.output && (
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <Download className="w-3 h-3" /> Output Payload
                                                            </div>
                                                            <div className="bg-[#0B0C15] rounded border border-white/5 p-3 overflow-x-auto">
                                                                <pre className="text-[10px] font-mono text-emerald-300 leading-relaxed">
                                                                    {JSON.stringify(step.output, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* Final Conclusion Block */}
                    <div className="max-w-4xl mx-auto mt-8 pl-12 relative">
                         <div className="absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#0B0C15] bg-white shadow-[0_0_10px_white] z-10"></div>
                         <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none"></div>
                             <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Final Conclusion</div>
                                    <h2 className="text-xl font-bold text-white mb-2">{diagnosis.primaryFault.fault}</h2>
                                    <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                                        {diagnosis.primaryFault.reasoning}
                                    </p>
                                </div>
                                <div className="ml-auto flex flex-col items-end">
                                    <div className="text-3xl font-bold text-white">{diagnosis.primaryFault.confidence}%</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence</div>
                                </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* RIGHT: CONTEXT DATA */}
                <div className="w-80 border-l border-white/5 bg-[#0E0E14] p-6 hidden xl:block">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Data Sources Accessed</h3>
                     <div className="space-y-4">
                        <DataSourceCard icon={Database} label="SAP S/4HANA" status="Connected" ping="24ms" />
                        <DataSourceCard icon={Box} label="Inventory DB" status="Connected" ping="42ms" />
                        <DataSourceCard icon={Network} label="IoT Stream" status="Active" ping="120ms" />
                        <DataSourceCard icon={FileText} label="Vector Docs" status="Indexed" ping="18ms" />
                     </div>
                </div>
            </div>
        </div>
    );
};

const DataSourceCard = ({ icon: Icon, label, status, ping }: any) => (
    <div className="bg-[#15151A] rounded-lg p-4 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-300">{label}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-[10px] text-emerald-400 font-bold">{status}</span>
            <span className="text-[9px] text-slate-600 font-mono">{ping}</span>
        </div>
    </div>
);

const getSystemIcon = (system: string) => {
    switch(system) {
        case 'SAP': return <Database className="w-5 h-5 text-blue-400" />;
        case 'IoT': return <Activity className="w-5 h-5 text-purple-400" />;
        case 'Manuals': return <FileText className="w-5 h-5 text-slate-400" />;
        case 'Inventory': return <Box className="w-5 h-5 text-amber-400" />;
        case 'History': return <Clock className="w-5 h-5 text-rose-400" />;
        default: return <Sparkles className="w-5 h-5 text-white" />;
    }
}

const getSystemColor = (system: string) => {
    switch(system) {
        case 'SAP': return 'text-blue-400 bg-blue-500';
        case 'IoT': return 'text-purple-400 bg-purple-500';
        case 'Manuals': return 'text-slate-400 bg-slate-500';
        case 'Inventory': return 'text-amber-400 bg-amber-500';
        case 'History': return 'text-rose-400 bg-rose-500';
        default: return 'text-white bg-indigo-500';
    }
}


// --- 1. OVERVIEW VIEW (Matching Screenshot 1) ---
export const OverviewView = (props: any) => {
  const { diagnosis } = props;
  const { agent, simulateElevenLabsIntake } = useOS();

  return (
    <div className="h-full flex flex-col p-8 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
       {/* TOP METRICS ROW */}
       <div className="grid grid-cols-4 gap-6 shrink-0">
          <MetricCard label="Tickets Automated" value="1,248" change="+12%" sub="vs last period" />
          <MetricCard label="Time Saved" value="342h" change="+8.5%" sub="vs last period" />
          <MetricCard label="Cost Avoidance" value="€84.2k" change="+22%" sub="vs last period" />
          <MetricCard label="First Time Fix" value="91.4%" change="+4.1%" sub="vs last period" />
       </div>

       {/* MAIN DASHBOARD AREA */}
       <div className="flex gap-6 flex-1 min-h-[400px]">
          {/* LIVE NEURAL STREAM (Left) */}
          <div className="flex-[2] bg-[#15151A] rounded-2xl border border-white/5 p-6 relative overflow-hidden flex flex-col">
             <div className="flex items-center gap-2 mb-6 z-10">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Live Neural Stream</h3>
             </div>
             
             <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
             <div className="absolute right-[-50px] top-[20%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

             <div className="space-y-0 relative z-10 flex-1 overflow-hidden">
                <StreamItem time="10:42:15" icon={Brain} color="text-emerald-400" text="Curio extracted E0015 from Outlook email #992" />
                <StreamItem time="10:42:12" icon={Mic} color="text-blue-400" text="Porta processed voice call +49 40 123..." />
                <StreamItem time="10:41:55" icon={Zap} color="text-amber-400" text="Aquila delivered Job Pack to Stefan K." />
                <StreamItem time="10:41:30" icon={RefreshCw} color="text-slate-400" text="System synchronized with SAP S/4HANA" />
                <StreamItem time="10:40:12" icon={Shield} color="text-slate-400" text="Audit log backup completed successfully" />
             </div>

             <button 
               onClick={simulateElevenLabsIntake}
               className="absolute top-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
             >
               <Mic className="w-3 h-3" /> Test ElevenLabs Call
             </button>
          </div>

          {/* SYSTEM STATUS (Right) */}
          <div className="flex-1 bg-[#15151A] rounded-2xl border border-white/5 p-6 flex flex-col">
             <div className="flex items-center gap-2 mb-6">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">System Status</h3>
             </div>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Real-time API latency monitoring</p>
             
             <div className="space-y-4">
                <StatusRow label="SAP S/4HANA" latency="24ms" status="Synced" />
                <StatusRow label="IFS FSM" latency="42ms" status="Synced" />
                <StatusRow label="Microsoft Graph" latency="18ms" status="Synced" />
                <StatusRow label="Azure IoT Hub" latency="65ms" status="Active" />
             </div>
          </div>
       </div>
    </div>
  );
};

// --- 2. TICKETS VIEW (Updated with Dynamic Pipeline) ---
export const TicketsView = (props: any) => {
  const { tickets, inspectingTicketId, viewTicketAnalysis } = useOS();

  // If we are inspecting a ticket, return the Deep Dive View
  if (inspectingTicketId) {
     return <TicketInspector />;
  }
  
  const getStepStatus = (ticketStatus: string, step: 'intake' | 'reasoning' | 'field') => {
      // Normalize statuses to a linear progression
      // 0: NEW/READY
      // 1: DIAGNOSED
      // 2: DISPATCHED
      // 3: COMPLETED
      const s = ticketStatus.toUpperCase();
      let level = 0;
      if (s === 'NEW' || s === 'READY') level = 0;
      else if (s === 'DIAGNOSED') level = 1;
      else if (s === 'DISPATCHED') level = 2;
      else if (s === 'COMPLETED') level = 3;

      const stepLevelMap = { 'intake': 0, 'reasoning': 1, 'field': 2 };
      const stepLevel = stepLevelMap[step];
      
      if (level > stepLevel) return 'done';
      if (level === stepLevel) return 'active';
      return 'pending';
  };

  const renderPipelineStep = (status: 'done' | 'active' | 'pending', icon: any, label: string) => {
      let bg = 'bg-slate-700/30';
      let border = 'border-slate-600/30';
      let text = 'text-slate-500';
      let glow = '';

      if (status === 'done' || status === 'active') {
          if (label === 'INTAKE') { bg = 'bg-emerald-500/20'; border = 'border-emerald-500/30'; text = 'text-emerald-400'; }
          if (label === 'REASONING') { bg = 'bg-amber-500/20'; border = 'border-amber-500/30'; text = 'text-amber-400'; }
          if (label === 'FIELD') { bg = 'bg-blue-500/20'; border = 'border-blue-500/30'; text = 'text-blue-400'; }
      }
      
      if (status === 'active') {
         glow = 'animate-pulse ring-1 ring-white/10';
      }

      return (
          <div className={`flex flex-col items-center gap-1 transition-opacity ${status === 'pending' ? 'opacity-30 grayscale' : 'opacity-100'}`}>
              <div className={`w-6 h-6 rounded flex items-center justify-center ${bg} border ${border} ${text} ${glow}`}>
                  {React.createElement(icon, { className: "w-3 h-3" })}
              </div>
              <span className={`text-[8px] font-bold ${status === 'active' ? 'text-white' : 'text-slate-500'}`}>{label}</span>
          </div>
      );
  };

  const PipelineConnector = ({ active }: { active: boolean }) => (
      <div className={`w-6 h-px mt-[-14px] transition-colors ${active ? 'bg-slate-600' : 'bg-slate-800'}`}></div>
  );

  return (
    <div className="h-full flex flex-col p-8 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
       {/* PIPELINE METRICS */}
       <div className="grid grid-cols-3 gap-6 shrink-0">
          <div className="bg-[#15151A] border border-white/5 rounded-xl p-5">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Pipeline</div>
             <div className="text-3xl font-bold text-white mb-2">{tickets.filter(t => t.status !== 'COMPLETED').length}</div>
             <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">{tickets.filter(t => t.priority === 'High' || t.priority === '1-Very High').length} High Prio</span>
                <span className="text-[10px] text-slate-500">Live Status</span>
             </div>
          </div>
          <div className="bg-[#15151A] border border-white/5 rounded-xl p-5">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Avg. Resolution</div>
             <div className="text-3xl font-bold text-white mb-2">1h 14m</div>
             <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">-12m</span>
                <span className="text-[10px] text-slate-500">vs last period</span>
             </div>
          </div>
          <div className="bg-[#15151A] border border-white/5 rounded-xl p-5">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Auto-Diagnosis</div>
             <div className="text-3xl font-bold text-white mb-2">94%</div>
             <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">+2%</span>
                <span className="text-[10px] text-slate-500">vs last period</span>
             </div>
          </div>
       </div>

       {/* TICKET INTELLIGENCE QUEUE */}
       <div className="flex-1 bg-[#15151A] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
             <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2"><ListTodo className="w-4 h-4 text-amber-500" /> Ticket Intelligence Queue</h3>
                <p className="text-[10px] text-slate-500 mt-1">AI-driven ticket orchestration and status tracking</p>
             </div>
             <div className="flex gap-2">
                <div className="relative">
                   <Search className="w-3 h-3 text-slate-500 absolute left-3 top-2" />
                   <input className="bg-black/20 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500/50 w-48" placeholder="Search tickets..." />
                </div>
                <button className="p-1.5 hover:bg-white/5 rounded border border-white/5"><RefreshCw className="w-3 h-3 text-slate-400" /></button>
             </div>
          </div>
          
          <div className="flex-1 overflow-auto">
             <table className="w-full text-left">
                <thead className="bg-black/20 text-[9px] uppercase font-bold text-slate-500 border-b border-white/5">
                   <tr>
                      <th className="px-6 py-3">Ticket Ref</th>
                      <th className="px-6 py-3">Customer & Issue</th>
                      <th className="px-6 py-3 text-center">Workflow Pipeline</th>
                      <th className="px-6 py-3">Technician</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Analysis</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-400">
                   {tickets.map(t => {
                      const intakeStatus = getStepStatus(t.status, 'intake');
                      const reasoningStatus = getStepStatus(t.status, 'reasoning');
                      const fieldStatus = getStepStatus(t.status, 'field');
                      const isReadyForReview = t.status === 'DIAGNOSED' || t.status === 'DISPATCHED';
                      
                      return (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm">{t.number}</div>
                            <div className="text-[10px] mt-1 flex items-center gap-1 opacity-70"><Calendar className="w-2.5 h-2.5" /> {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-white mb-1">{t.customer.name}</div>
                            <div className="flex items-center gap-1 bg-white/5 w-fit px-2 py-1 rounded border border-white/5 text-[10px]">
                               <FileText className="w-2.5 h-2.5" /> {t.error.description || t.error.code}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-0">
                               {renderPipelineStep(intakeStatus, Phone, 'INTAKE')}
                               <PipelineConnector active={intakeStatus === 'done'} />
                               {renderPipelineStep(reasoningStatus, Brain, 'REASONING')}
                               <PipelineConnector active={reasoningStatus === 'done'} />
                               {renderPipelineStep(fieldStatus, Truck, 'FIELD')}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            {t.assignedTech ? (
                                <div className="flex items-center gap-2 text-white">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] border border-white/20 shadow-sm">
                                        {t.assignedTech.split(' ').map(n => n[0]).join('')}
                                    </div> 
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[11px]">{t.assignedTech}</span>
                                        <span className="text-[9px] text-emerald-400">On Route</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-600 italic">
                                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] border border-white/5">?</div> 
                                    <span>Unassigned</span>
                                </div>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border tracking-wider ${
                                t.priority === 'HIGH' || t.priority === '1-Very High' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : (t.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20')
                            }`}>
                                {t.priority} PRIORITY
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            {isReadyForReview && (
                                <button 
                                    onClick={() => viewTicketAnalysis(t.id)}
                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                                >
                                    <Search className="w-3 h-3" /> INSPECT
                                </button>
                            )}
                         </td>
                      </tr>
                   )})}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

// --- 3. ANALYTICS VIEW (Matching Screenshot 3) ---
export const AnalyticsView = (props: any) => {
   const [range, setRange] = useState('7d');
   // Mock data with varying heights
   const chartData = [85, 92, 65, 88, 76, 95, 82, 70, 90, 55, 98, 80];

   return (
      <div className="h-full flex flex-col p-8 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
         {/* HEADER */}
         <div className="flex justify-between items-center shrink-0">
            <div>
               <h2 className="text-xl font-bold text-white mb-1">Performance Analytics</h2>
               <p className="text-xs text-slate-400">Real-time operational metrics and ROI analysis.</p>
            </div>
            <div className="flex bg-[#15151A] rounded-lg p-1 border border-white/10">
               {['24h', '7d', '30d', '90d'].map(r => (
                  <button 
                     key={r}
                     onClick={() => setRange(r)}
                     className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${range === r ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                  >
                     {r}
                  </button>
               ))}
            </div>
         </div>

         <div className="flex gap-6 flex-1 min-h-[400px]">
            {/* MAIN CHART */}
            <div className="flex-[3] bg-[#15151A] rounded-2xl border border-white/5 p-6 flex flex-col">
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <BarChart3 className="w-3 h-3 text-emerald-500" /> Cost Savings vs. Ticket Volume
                  </h3>
                  <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider">
                     <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div> Volume</div>
                     <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div> Savings</div>
                  </div>
               </div>

               {/* BAR CHART RENDERING */}
               <div className="flex-1 w-full flex items-end justify-between gap-3 px-4 pb-2 border-b border-white/5 relative">
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2 opacity-20">
                     {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-white/10"></div>)}
                  </div>

                  {chartData.map((h, i) => (
                     <div key={i} className="w-full h-full flex items-end relative z-10 group">
                        <div className="w-full flex flex-col justify-end h-full gap-1 group-hover:opacity-80 transition-opacity cursor-pointer">
                           {/* Top Bar (Purple - Volume) */}
                           <div 
                              style={{ height: `${h}%` }}
                              className="bg-indigo-500 w-full rounded-t-[2px] transition-all duration-1000 ease-out"
                           />
                           {/* Bottom Bar (Green - Savings) */}
                           <div 
                              style={{ height: `${h * 0.6}%` }}
                              className="bg-emerald-500 w-full rounded-b-[2px] transition-all duration-1000 ease-out delay-100"
                           />
                        </div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-mono uppercase tracking-widest px-2">
                  <span>Nov 01</span><span>Nov 05</span><span>Nov 10</span><span>Nov 15</span><span>Nov 20</span><span>Nov 25</span>
               </div>
            </div>

            {/* RIGHT COLUMN KPIS */}
            <div className="flex-1 flex flex-col gap-4">
               <AnalyticsCard label="Total Cost Savings" value="€84,250" change="+22%" />
               <AnalyticsCard label="Avg. Resolution Time" value="1h 14m" change="-12%" color="emerald" />
               <AnalyticsCard label="Auto-Resolution Rate" value="34.2%" change="+5%" />
               <AnalyticsCard label="Technician Utilization" value="89.1%" change="+2%" />
            </div>
         </div>
      </div>
   );
};

// --- 4. CORTEX VIEW (Matching Screenshot 4) ---
export const CortexView = (props: any) => {
    const { knowledgeNodes, knowledgeEdges, askCortex, cortexMessages, isCortexThinking } = useOS();
    const [query, setQuery] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cortexMessages]);

    return (
      <div className="h-full flex bg-[#0E0E14] overflow-hidden relative">
         {/* GRAPH AREA */}
         <div className="flex-1 relative bg-black">
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <h2 className="text-white font-bold text-sm flex items-center gap-2"><Network className="w-4 h-4 text-indigo-500" /> Neural Cortex</h2>
                <p className="text-slate-500 text-[10px] mt-1">Visualizing 847 learned failure patterns</p>
            </div>
            <NeuralConstellationImproved nodes={knowledgeNodes} edges={knowledgeEdges} />
         </div>

         {/* RIGHT SIDEBAR */}
         <div className="w-[320px] bg-[#15151A] border-l border-white/5 flex flex-col z-20">
             <div className="p-4 border-b border-white/5 bg-[#1A1A20]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Settings className="w-3 h-3" /> Model Confidence
                </div>
                <div className="text-2xl font-bold text-white mb-1">92.4%</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                   <div className="h-full w-[92%] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                   <span className="text-emerald-400">+0.4% today</span>
                   <span>847 Nodes</span>
                </div>
             </div>

             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <MessageSquare className="w-3 h-3" /> Neural Uplink
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   <div className="bg-[#1E1E24] p-3 rounded-lg text-xs text-slate-300 border border-white/5 shadow-sm">
                      Neural Cortex Online. I am ready to analyze system knowledge.
                   </div>
                   {cortexMessages.filter(m => m.id !== 'c1').map(m => (
                      <div key={m.id} className={`rounded-lg p-3 text-xs border ${m.sender === 'user' ? 'bg-indigo-600 text-white border-indigo-500 ml-4' : 'bg-[#1E1E24] text-slate-300 border-white/5 mr-4'}`}>
                         {m.text}
                      </div>
                   ))}
                   {isCortexThinking && <div className="flex gap-1"><span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-100"></span><span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-200"></span></div>}
                   <div ref={chatEndRef} />
                </div>

                <div className="p-3 border-t border-white/5 bg-[#1A1A20]">
                   <form onSubmit={(e) => { e.preventDefault(); if(query.trim()) { askCortex(query); setQuery(''); } }} className="relative">
                      <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                        placeholder="Ask Cortex about failure patterns..."
                      />
                      <button type="submit" className="absolute right-2 top-2 text-indigo-500 hover:text-indigo-400"><Send className="w-3 h-3" /></button>
                   </form>
                </div>
             </div>
         </div>
      </div>
    );
};

// --- HELPER COMPONENTS ---

const MetricCard = ({ label, value, change, sub }: any) => (
   <div className="bg-[#15151A] border border-white/5 rounded-xl p-5 relative overflow-hidden">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{label}</div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="flex items-center gap-2 text-[10px]">
         <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">{change}</span>
         <span className="text-slate-500">{sub}</span>
      </div>
   </div>
);

const StreamItem = ({ time, icon: Icon, color, text }: any) => (
   <div className="flex gap-4 py-3 border-b border-white/5 items-start">
      <span className="text-[10px] font-mono text-slate-600 pt-0.5">{time}</span>
      <div className="flex items-start gap-3">
         <Icon className={`w-3.5 h-3.5 ${color} mt-0.5`} />
         <span className="text-xs text-slate-300 font-medium">{text}</span>
      </div>
   </div>
);

const StatusRow = ({ label, latency, status }: any) => (
   <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${status === 'Synced' || status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
         <span className="text-xs font-bold text-slate-200">{label}</span>
      </div>
      <div className="flex items-center gap-4">
         <div className="text-[9px] text-slate-500 font-mono text-right">
            LATENCY<br/><span className="text-slate-300">{latency}</span>
         </div>
         <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{status}</span>
      </div>
   </div>
);

const AnalyticsCard = ({ label, value, change, color = 'indigo' }: any) => (
   <div className="bg-[#15151A] border border-white/5 rounded-xl p-4 flex-1 flex flex-col justify-center">
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-bold text-white mb-1">{value}</div>
      <div className={`text-[10px] font-bold ${change.includes('+') ? 'text-emerald-400' : 'text-emerald-400'}`}>{change} <span className="text-slate-600 font-normal">vs last period</span></div>
   </div>
);

const NeuralConstellationImproved = ({ nodes, edges }: any) => (
    <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">{edges.map((edge: any) => { const pos: any = { n1: { x: 40, y: 50 }, n2: { x: 60, y: 35 }, n3: { x: 60, y: 65 }, n4: { x: 75, y: 50 }, n5: { x: 50, y: 20 } }; const s = pos[edge.source]; const t = pos[edge.target]; if(!s || !t) return null; return (<motion.line key={edge.id} x1={`${s.x}%`} y1={`${s.y}%`} x2={`${t.x}%`} y2={`${t.y}%`} stroke="rgba(99, 102, 241, 0.2)" strokeWidth={Math.max(1, edge.weight * 0.3)} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }} />); })}</svg>
        {nodes.map((node: any) => { const pos: any = { n1: { left: '40%', top: '50%' }, n2: { left: '60%', top: '35%' }, n3: { left: '60%', top: '65%' }, n4: { left: '75%', top: '50%' }, n5: { left: '50%', top: '20%' } }; const p = pos[node.id]; if(!p) return null; return (<div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={p}><ConstellationNode node={node} /></div>); })}
    </div>
);

const ConstellationNode = ({ node }: any) => (
   <div className="relative group cursor-pointer flex flex-col items-center justify-center">
      <div className={`absolute inset-0 rounded-full blur-[40px] opacity-30 group-hover:opacity-70 transition-opacity duration-500 w-[400%] h-[400%] -translate-x-1/3 -translate-y-1/3 ${node.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
      <motion.div className={`${node.type === 'error' ? 'w-10 h-10' : 'w-5 h-5'} rounded-full ${node.type === 'error' ? 'bg-rose-500' : 'bg-white'} shadow-[0_0_30px_rgba(255,255,255,0.5)] z-10 relative border-4 border-black`} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <div className={`mt-4 px-4 py-2 rounded-full border border-white/10 bg-[#15151A]/90 backdrop-blur-md text-[10px] font-bold text-slate-300 whitespace-nowrap transition-all duration-300 group-hover:scale-110 group-hover:text-white group-hover:border-indigo-500/50 shadow-xl`}>{node.label}</div>
   </div>
);

// --- PLACEHOLDER VIEWS ---
export const SecurityView = (props: any) => <div className="p-10 text-white">Security Dashboard Placeholder</div>;
export const TeamView = (props: any) => <div className="p-10 text-white">Team Management Placeholder</div>;
export const AgentsView = (props: any) => <div className="p-10 text-white">Agent Configuration Placeholder</div>;
export const ConnectorsView = (props: any) => <div className="p-10 text-white">System Connectors Placeholder</div>;
export const SettingsView = (props: any) => <div className="p-10 text-white">System Settings Placeholder</div>;