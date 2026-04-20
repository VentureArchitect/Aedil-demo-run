
import React, { useState } from 'react';
import { 
  Activity, Brain, Zap, Globe, BarChart3, Shield, Users, 
  Bell, Settings, GitMerge, ListTodo, Network, X, CheckCircle, AlertCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../store';
import { WorkflowBuilder } from './WorkflowBuilder';
import { 
  OverviewView, TicketsView, CortexView, AgentsView, 
  ConnectorsView, AnalyticsView, SecurityView, TeamView, SettingsView 
} from './ConsoleViews';
import { Toast } from '../../types';
import { AedilLogo } from '../ui/AedilLogo';

export const AedilConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { diagnosis } = useOS();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const renderContent = () => {
    const props = { addToast };
    
    switch (activeTab) {
      case 'overview': return <OverviewView diagnosis={diagnosis} {...props} />;
      case 'tickets': return <TicketsView {...props} />;
      case 'workflows': return <WorkflowBuilder {...props} />;
      case 'cortex': return <CortexView {...props} />;
      case 'agents': return <AgentsView {...props} />;
      case 'connectors': return <ConnectorsView {...props} />;
      case 'analytics': return <AnalyticsView {...props} />;
      case 'security': return <SecurityView {...props} />;
      case 'team': return <TeamView {...props} />;
      case 'settings': return <SettingsView {...props} />;
      default: return <OverviewView diagnosis={diagnosis} {...props} />;
    }
  };

  return (
    <div className="h-full bg-black font-sans text-slate-300 flex overflow-hidden selection:bg-white/10 border-white/10 relative">
      
      {/* TOAST CONTAINER */}
      <div className="absolute top-20 right-8 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="bg-black/95 backdrop-blur border border-white/10 shadow-2xl rounded-xl p-4 pr-8 min-w-[300px] flex items-center gap-3 pointer-events-auto"
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              <span className="text-sm font-medium text-white">{toast.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SIDEBAR */}
      <div className="w-64 border-r border-white/5 bg-black flex flex-col shrink-0 relative z-20">
        <div className="p-6 flex items-center gap-3 mb-2">
           <div className="flex items-center justify-center text-white">
             <AedilLogo className="w-8 h-8" />
           </div>
           <span className="text-xl font-bold text-white tracking-tight">AEDIL OS</span>
        </div>

        <div className="px-3 space-y-0.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
           <div className="mb-2 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Operations</div>
           <NavItem icon={Activity} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <NavItem icon={ListTodo} label="Tickets" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
           <NavItem icon={GitMerge} label="Workflows" active={activeTab === 'workflows'} onClick={() => setActiveTab('workflows')} />
           
           <div className="mt-6 mb-2 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Intelligence</div>
           <NavItem icon={Network} label="Cortex" active={activeTab === 'cortex'} onClick={() => setActiveTab('cortex')} />
           <NavItem icon={Brain} label="Agents" active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} />
           <NavItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
           
           <div className="mt-6 mb-2 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Infrastructure</div>
           <NavItem icon={Globe} label="Connectors" active={activeTab === 'connectors'} onClick={() => setActiveTab('connectors')} />
           <NavItem icon={Shield} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
           <NavItem icon={Users} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
           <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
        
        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10"></div>
              <div>
                 <div className="text-xs font-bold text-white">Admin User</div>
                 <div className="text-[10px] text-zinc-500">Pro Plan</div>
              </div>
           </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative z-10 h-full overflow-hidden">
         {/* Sticky Header removed to match screenshot full-height look, or kept minimal */}
         
         <div className="flex-1 h-full overflow-hidden relative">
            {activeTab === 'workflows' ? (
               <WorkflowBuilder addToast={addToast} />
            ) : (
               <motion.div
                 key={activeTab}
                 className="h-full w-full overflow-hidden"
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.2 }}
               >
                 {renderContent()}
               </motion.div>
            )}
         </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
   <div 
     onClick={onClick}
     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-white/10 border border-white/20 text-white font-medium shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
   >
      <Icon className={`w-4 h-4 ${active ? 'text-zinc-300' : ''}`} strokeWidth={2} />
      <span className="text-sm">{label}</span>
   </div>
);
