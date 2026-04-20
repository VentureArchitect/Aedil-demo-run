import React from 'react';
import { useOS } from '../../store';
import { Key, Plug, Brain, CheckCircle, ChevronRight, Lock, Globe, Wifi } from 'lucide-react';

export const Settings: React.FC = () => {
  const { openaiApiKey, setOpenAIApiKey } = useOS();

  return (
    <div className="h-full bg-black flex text-slate-300 font-sans">
       
       {/* Sidebar */}
       <div className="w-64 border-r border-white/10 pt-6 px-3 flex flex-col gap-1">
          <div className="px-3 mb-4 flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-zinc-950/10 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" alt="Profile" />
             </div>
             <div>
                <div className="font-bold text-sm">Admin User</div>
                <div className="text-xs text-zinc-500">Apple ID</div>
             </div>
          </div>

          <input type="text" placeholder="Search" className="bg-zinc-950 border border-white/10 rounded px-3 py-1 text-sm mb-4 mx-2" />

          <SettingsItem icon={Wifi} label="Wi-Fi" active={false} />
          <SettingsItem icon={Brain} label="Intelligence" active={true} />
          <SettingsItem icon={Plug} label="Connectors" active={false} />
          <SettingsItem icon={Globe} label="Network" active={false} />
          <SettingsItem icon={Lock} label="Privacy & Security" active={false} />
       </div>
       
       {/* Content */}
       <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">Intelligence & AI</h1>
          
          {/* AI Brain Config */}
          <div className="bg-zinc-950 p-5 rounded-xl border border-white/10 shadow-sm mb-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-zinc-950/10 border border-white/20 rounded-lg flex items-center justify-center text-white">
                   <Brain className="w-5 h-5" />
                </div>
                <div>
                   <div className="font-semibold">OpenAI Model Access</div>
                   <div className="text-xs text-zinc-500">Configure your reasoning engine</div>
                </div>
                <div className="ml-auto">
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" checked={!!openaiApiKey} readOnly className="sr-only peer" />
                     <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-950 after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/10 border border-white/20"></div>
                   </label>
                </div>
             </div>
             
             <div className="space-y-3">
                <label className="text-xs font-medium text-gray-600">API KEY</label>
                <input 
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenAIApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm font-mono"
                />
                <p className="text-xs text-zinc-500">Keys are stored locally in your browser session.</p>
             </div>
          </div>

          {/* Connectors */}
          <h2 className="text-lg font-bold mb-4 mt-8">Active Integrations</h2>
          <div className="bg-zinc-950 rounded-xl border border-white/10 shadow-sm divide-y divide-white/5">
             <IntegrationRow name="Outlook 365" status="Synced" color="bg-white/10 border border-white/20" />
             <IntegrationRow name="SAP S/4HANA" status="Synced" color="bg-zinc-950/10 border border-white/20" />
             <IntegrationRow name="IFS FSM" status="Synced" color="bg-white/10 border border-white/20" />
          </div>

       </div>
    </div>
  );
};

const SettingsItem = ({ icon: Icon, label, active }: any) => (
   <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer text-sm ${active ? 'bg-white/10 border border-white/20 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
   </div>
);

const IntegrationRow = ({ name, status, color }: any) => (
   <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
         <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white font-bold text-xs`}>
            {name.charAt(0)}
         </div>
         <span className="font-medium text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
         {status} <CheckCircle className="w-4 h-4" />
         <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
   </div>
);