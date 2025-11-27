



import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GoogleGenAI } from "@google/genai";
import { OSState, AppId, AgentLog, WindowState, SapFormState, ReasoningStep, MobileState, WorkflowNode, WorkflowEdge, NodeType, KnowledgeNode, KnowledgeEdge, LearningEvent, TechnicianFeedback, PortaState, Email, ChatMessage, Ticket } from './types';
import { analyzeEmailWithGPT } from './services/llm';
import { CurioService } from './services/curio';
import { MOCK_TICKETS } from './constants';

interface OSStore extends OSState {
  // Window Management
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  toggleMaximizeApp: (id: AppId) => void;
  switchToApp: (id: AppId) => void;
  updateWindowPosition: (id: AppId, position: { x: number, y: number }) => void;
  
  // Config
  setOpenAIApiKey: (key: string) => void;
  
  // App Interactions
  selectEmail: (id: string) => void;
  updateEmailBody: (id: string, body: string) => void;
  updateSapField: (field: keyof SapFormState, value: string) => void;
  assignTech: (techName: string) => void;
  
  // Mobile Interactions
  toggleSmartLens: (isOpen: boolean) => void;
  acceptDiagnosis: () => void;
  rejectDiagnosis: () => void;
  orderParts: () => void;
  sendTechMessage: (text: string) => void;
  submitJobFeedback: (correct: boolean, voiceNote: string) => void;

  // Porta (Customer Intake) Actions
  setPortaStatus: (status: PortaState['status']) => void;
  addPortaMessage: (sender: 'user' | 'ai' | 'system', text: string) => void;
  processPortaInput: (text: string) => Promise<void>;
  finalizePortaSession: () => Promise<void>;

  // Agent Logic
  addAgentLog: (type: AgentLog['type'], message: string) => void;
  
  // "Real" Agent Actions
  performScan: () => Promise<void>;
  performAutoFill: () => void;
  performDiagnosis: (ticketId?: string) => Promise<void>;
  performDispatch: () => void;
  simulateElevenLabsIntake: () => void;
  
  // Console Deep Dive
  viewTicketAnalysis: (ticketId: string) => void;
  closeTicketAnalysis: () => void;
  submitDiagnosisFeedback: (ticketId: string, status: 'approved' | 'rejected', reason?: string) => void;
  manualOverride: () => void; // New action for "Reject & Continue Manually"

  // Workflow Builder Actions
  addWorkflowNode: (type: NodeType, label: string, provider: string) => void;
  updateWorkflowNodePosition: (id: string, x: number, y: number) => void;
  updateNodeProvider: (nodeId: string, provider: string) => void;
  deleteWorkflowNode: (id: string) => void;
  generateWorkflow: (prompt: string) => Promise<void>;

  // Cortex Actions
  askCortex: (query: string) => Promise<void>;
}

const INITIAL_WINDOWS = {
  outlook: { id: 'outlook', title: 'Outlook Web', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 1, position: { x: 100, y: 80 }, size: { width: 1100, height: 650 } },
  sap: { id: 'sap', title: 'SAP S/4HANA', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0, position: { x: 150, y: 120 }, size: { width: 1024, height: 650 } },
  fsm: { id: 'fsm', title: 'IFS FSM', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0, position: { x: 200, y: 160 }, size: { width: 1024, height: 650 } },
  mobile: { id: 'mobile', title: 'Technician Device', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0, position: { x: 900, y: 50 }, size: { width: 380, height: 720 } },
  console: { id: 'console', title: 'AEDIL Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0, position: { x: 120, y: 100 }, size: { width: 1000, height: 650 } },
  settings: { id: 'settings', title: 'System Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0, position: { x: 350, y: 200 }, size: { width: 800, height: 600 } },
  porta: { id: 'porta', title: 'AEDIL Porta', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 100, position: { x: 400, y: 100 }, size: { width: 400, height: 600 } },
} as const;

const MOCK_EMAILS = [
  {
    id: 'e1',
    sender: 'AEDIL System',
    subject: 'Ticket: EJC 220 Failure - Hamburg',
    time: '10:42 AM',
    unread: true,
    body: 'A new high-priority ticket has been generated via Voice Intake. Operator reported grinding noise on equipment 51654367. Error code E0015 displayed. Customer DMK Milchkontor requires immediate assistance.',
    data: {
      ticketId: '11447115',
      customer: 'DMK Milchkontor',
      customerAddress: '49451, Holdorf, Dammer Str. 60',
      debitorId: '11316498',
      equipment: '51654367',
      error: 'E0015',
      priority: '1-Very High',
      desc: 'Hydraulic Failure - Pump Noise - E0015'
    }
  },
  {
    id: 'e2',
    sender: 'Hans Weber',
    subject: 'Weekly Report',
    time: 'Yesterday',
    unread: false,
    body: 'Attached is the weekly efficiency report. We are seeing a 15% upturn in FTFR.',
  }
];

const INITIAL_WORKFLOW_NODES: WorkflowNode[] = [
  { id: '1', type: 'trigger', label: 'Customer Intake', position: { x: 100, y: 250 }, provider: 'AEDIL Porta', status: 'active' },
  { id: '2', type: 'system', label: 'ERP System', position: { x: 400, y: 250 }, provider: 'SAP S/4HANA', status: 'active' },
  { id: '3', type: 'agent', label: 'Diagnostic Intelligence', position: { x: 700, y: 250 }, provider: 'Curio (GPT-4)', status: 'active' },
  { id: '4', type: 'system', label: 'Scheduling', position: { x: 1000, y: 250 }, provider: 'IFS FSM', status: 'active' },
  { id: '5', type: 'action', label: 'Technician App', position: { x: 1300, y: 250 }, provider: 'AEDIL Aquila', status: 'active' },
];

const INITIAL_WORKFLOW_EDGES: WorkflowEdge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];

const INITIAL_KNOWLEDGE_NODES: KnowledgeNode[] = [
  { id: 'n1', label: 'E0015', type: 'error', confidence: 100, frequency: 847 },
  { id: 'n2', label: 'Pump Motor', type: 'solution', confidence: 89, frequency: 760 },
  { id: 'n3', label: 'Valve Block', type: 'solution', confidence: 8, frequency: 68 },
  { id: 'n4', label: 'Hydraulic Fluid', type: 'solution', confidence: 3, frequency: 19 },
  { id: 'n5', label: 'Grinding Noise', type: 'symptom', confidence: 95, frequency: 800 },
];

const INITIAL_KNOWLEDGE_EDGES: KnowledgeEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', weight: 8 },
  { id: 'e2', source: 'n1', target: 'n3', weight: 2 },
  { id: 'e3', source: 'n1', target: 'n4', weight: 1 },
  { id: 'e4', source: 'n5', target: 'n2', weight: 9 },
];

export const useOS = create<OSStore>()(
  persist(
    (set, get) => ({
      windows: INITIAL_WINDOWS,
      activeAppId: 'outlook',
      theme: 'dark',
      openaiApiKey: '',
      
      tickets: MOCK_TICKETS,
      emails: MOCK_EMAILS,
      selectedEmailId: null,
      
      sapForm: {
        orderType: 'SM01 (Corrective)',
        equipment: '',
        soldToParty: '',
        customerAddress: '49451, Holdorf, Dammer Str. 60',
        customerName: '', 
        priority: '',
        shortText: '',
        errorDesc: '',
        isDirty: false
      },
      
      assignedTech: null,
      diagnosis: null,
      inspectingTicketId: null,

      mobile: {
        isOpen: false,
        diagnosisStatus: 'pending',
        partsOrdered: false,
        chatHistory: [
          { id: 'msg1', sender: 'ai', text: 'Hi Stefan, I have analyzed the ticket for DMK Milchkontor. Based on E0015 and the noise profile, I am 89% confident it is the pump motor.', timestamp: Date.now() }
        ],
        debriefStatus: 'pending',
        feedback: null
      },

      porta: {
        messages: [
           { id: 'init', sender: 'ai', text: 'Hello, I am Porta. Please describe the problem you are experiencing with your equipment.', timestamp: Date.now() }
        ],
        status: 'idle',
        transcript: ''
      },

      agent: {
        status: 'idle',
        activeTask: null,
        logs: [{ id: 'init', timestamp: Date.now(), type: 'info', message: 'AEDIL Neural Core initialized.' }]
      },

      workflowNodes: INITIAL_WORKFLOW_NODES,
      workflowEdges: INITIAL_WORKFLOW_EDGES,
      isGeneratingWorkflow: false,

      knowledgeNodes: INITIAL_KNOWLEDGE_NODES,
      knowledgeEdges: INITIAL_KNOWLEDGE_EDGES,
      learningEvents: [],
      cortexMessages: [
         { id: 'c1', sender: 'ai', text: 'Neural Cortex Online. I am ready to analyze system knowledge.', timestamp: Date.now() }
      ],
      isCortexThinking: false,

      setOpenAIApiKey: (key) => set({ openaiApiKey: key }),

      openApp: (id) => set((state) => {
        const maxZ = Math.max(0, ...(Object.values(state.windows) as WindowState[]).map(w => w.zIndex || 0));
        return {
          windows: {
            ...state.windows,
            [id]: { ...state.windows[id], isOpen: true, isMinimized: false, zIndex: maxZ + 1 }
          },
          activeAppId: id
        };
      }),

      closeApp: (id) => set((state) => ({
        windows: { ...state.windows, [id]: { ...state.windows[id], isOpen: false, isMaximized: false } },
        activeAppId: state.activeAppId === id ? null : state.activeAppId
      })),

      focusApp: (id) => set((state) => {
        const maxZ = Math.max(0, ...(Object.values(state.windows) as WindowState[]).map(w => w.zIndex || 0));
        if (state.windows[id].zIndex === maxZ) return {}; // Already on top
        return {
          windows: { ...state.windows, [id]: { ...state.windows[id], zIndex: maxZ + 1, isMinimized: false } },
          activeAppId: id
        };
      }),

      minimizeApp: (id) => set((state) => ({
        windows: { ...state.windows, [id]: { ...state.windows[id], isMinimized: true } },
        activeAppId: state.activeAppId === id ? null : state.activeAppId
      })),

      toggleMaximizeApp: (id) => set((state) => {
        const maxZ = Math.max(0, ...(Object.values(state.windows) as WindowState[]).map(w => w.zIndex || 0));
        const isMax = !state.windows[id].isMaximized;
        return {
          windows: { 
            ...state.windows, 
            [id]: { 
              ...state.windows[id], 
              isMaximized: isMax,
              isMinimized: false,
              zIndex: maxZ + 1
            } 
          },
          activeAppId: id
        };
      }),

      switchToApp: (id) => set((state) => {
        const currentApp = state.activeAppId;
        const maxZ = Math.max(0, ...(Object.values(state.windows) as WindowState[]).map(w => w.zIndex || 0));
        const newWindows = { ...state.windows };
        
        if (currentApp && currentApp !== id) {
          newWindows[currentApp] = { ...newWindows[currentApp], isMinimized: true };
        }
        newWindows[id] = { ...newWindows[id], isOpen: true, isMinimized: false, zIndex: maxZ + 1 };
        return { windows: newWindows, activeAppId: id };
      }),

      updateWindowPosition: (id, position) => set((state) => ({
        windows: { ...state.windows, [id]: { ...state.windows[id], position } }
      })),

      selectEmail: (id) => set({ selectedEmailId: id }),
      updateEmailBody: (id, body) => set(state => ({ emails: state.emails.map(e => e.id === id ? { ...e, body } : e) })),
      updateSapField: (field, value) => set((state) => ({ sapForm: { ...state.sapForm, [field]: value, isDirty: true } })),
      assignTech: (techName) => set((state) => {
         const newTickets = [...state.tickets];
         if (newTickets.length > 0) {
             newTickets[0] = { 
                 ...newTickets[0], 
                 status: 'DISPATCHED',
                 assignedTech: techName 
             };
         }
         return { 
             assignedTech: techName,
             tickets: newTickets
         };
      }),
      toggleSmartLens: (isOpen) => set(state => ({ mobile: { ...state.mobile, isOpen } })),
      acceptDiagnosis: () => set(state => ({ mobile: { ...state.mobile, diagnosisStatus: 'accepted' } })),
      rejectDiagnosis: () => set(state => ({ mobile: { ...state.mobile, diagnosisStatus: 'rejected' } })),
      orderParts: () => set(state => ({ mobile: { ...state.mobile, partsOrdered: true } })),
      
      // --- AI LOGIC ---
      sendTechMessage: async (text) => {
        const { mobile, diagnosis } = get();
        const currentHistory = mobile.chatHistory;
        const newUserMsg = { id: Date.now().toString(), sender: 'tech', text, timestamp: Date.now() };
        
        set(state => ({
          mobile: { ...state.mobile, chatHistory: [...state.mobile.chatHistory, newUserMsg as any] }
        }));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const activeTicket = get().tickets[0] || MOCK_TICKETS[0];
            
            let context = `You are Curio, an expert industrial AI assistant. 
            Ticket Context: #${activeTicket.number}.
            Customer: ${activeTicket.customer.name}. 
            Equipment: ${activeTicket.equipment.model}.
            Error: ${activeTicket.error.code} - ${activeTicket.error.description}.`;
            
            if (diagnosis && diagnosis.isComplete) {
                context += `\nDiagnosis: Primary Fault: ${diagnosis.primaryFault.fault} (${diagnosis.primaryFault.confidence}%). Reasoning: ${diagnosis.primaryFault.reasoning}.`;
            } else {
                context += `\nDiagnosis: Pending.`;
            }

            const systemInstruction = `${context} Keep answers brief, professional, and technical. Do not markdown your response.`;
            
            const history = currentHistory.map(msg => ({
                role: msg.sender === 'tech' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction }, history });
            const result = await chat.sendMessage({ message: text });
            const responseText = result.text;

            const newAiMsg = { id: (Date.now()+1).toString(), sender: 'ai', text: responseText, timestamp: Date.now() };
            set(state => ({ mobile: { ...state.mobile, chatHistory: [...state.mobile.chatHistory, newAiMsg as any] } }));
        } catch (err) {
           console.error("AI Error", err);
           const errorMsg = { id: (Date.now()+1).toString(), sender: 'ai', text: "Connection interrupted. Using cached manual data.", timestamp: Date.now() };
           set(state => ({ mobile: { ...state.mobile, chatHistory: [...state.mobile.chatHistory, errorMsg as any] } }));
        }
      },

      setPortaStatus: (status) => set(state => ({ porta: { ...state.porta, status } })),
      addPortaMessage: (sender, text) => set(state => ({ porta: { ...state.porta, messages: [...state.porta.messages, { id: Date.now().toString(), sender, text, timestamp: Date.now() }] } })),
      
      processPortaInput: async (text) => {
          const { porta, addPortaMessage, setPortaStatus } = get();
          addPortaMessage('user', text);
          setPortaStatus('processing');

          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const systemInstruction = `You are AEDIL Porta, a voice intake agent.`;
              
              const history = porta.messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
              const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction }, history });
              const result = await chat.sendMessage({ message: text });
              
              addPortaMessage('ai', result.text);
              setPortaStatus('idle');
          } catch (err) {
              setPortaStatus('idle');
              addPortaMessage('ai', "Connection error.");
          }
      },

      finalizePortaSession: async () => {
         const { porta, addAgentLog, openApp, addPortaMessage, closeApp, selectEmail } = get();
         
         set({ porta: { ...porta, status: 'processing' } });
         addPortaMessage('system', 'Generating ticket based on conversation...');

         try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let transcript = porta.messages
                .filter(m => m.sender !== 'system')
                .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
                .join('\n');
            
            if (!transcript || transcript.length < 10) {
                console.log("[Porta] Transcript empty or too short, forcing fallback.");
                transcript = "USER: Machine is broken. Need help. EJC 220 error.";
            }

            console.log("[Porta] Finalizing with transcript:", transcript);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `
                Analyze this voice conversation transcript between an AI Agent (Porta) and a User.
                TRANSCRIPT:
                ${transcript}
                
                EXTRACT JSON with these fields:
                - customer (Company Name, default to "Unknown Co.")
                - equipment (Machine Model/Serial, default to "Equipment")
                - error (Error Code, default to "GEN-01")
                - priority (Low/Medium/High/Critical, infer High if urgent)
                - desc (A detailed description of the symptoms and problem)
                - short_summary (A 5-word summary)
                
                If fields are missing, infer them based on context or use "Unspecified".
                `,
                config: { responseMimeType: 'application/json' }
            });
            const data = JSON.parse(response.text);

            const charCodeSum = (str: string) => str.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
            const seed = charCodeSum(data.customer || "Customer");
            const cities = ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart"];
            const streets = ["Industriestraße", "Hauptstraße", "Gewerbepark", "Siemensstraße", "Dieselstraße"];
            const city = cities[seed % cities.length];
            const street = streets[seed % streets.length];
            const number = (seed % 150) + 1;
            const zip = 10000 + (seed % 80000);
            const generatedAddress = `${zip} ${city}, ${street} ${number}`;
            const generatedDebitorId = (50000000 + (seed % 999999)).toString();
            
            const newTicket: Ticket = { 
                ...MOCK_TICKETS[0], 
                id: `T-${Date.now()}`, 
                number: Math.floor(100000 + Math.random() * 900000).toString(), 
                customer: { ...MOCK_TICKETS[0].customer, name: data.customer, location: generatedAddress }, 
                equipment: { ...MOCK_TICKETS[0].equipment, model: data.equipment }, 
                error: { code: data.error || 'GEN-ERR', description: data.short_summary, customerReport: data.desc },
                priority: data.priority || 'High',
                status: 'NEW',
                createdAt: new Date().toISOString()
            };

            const newEmail: Email = {
                id: `e-${Date.now()}`,
                sender: 'AEDIL Porta <intake@aedil.ai>',
                subject: `URGENT: ${data.customer} - ${data.equipment} Failure`,
                time: 'Now',
                unread: true,
                body: `Automatic Voice Intake Report:\n\nCustomer: ${data.customer}\nEquipment: ${data.equipment}\nReported Issue: ${data.desc}\n\nThis ticket has been auto-generated and prioritized as ${data.priority}. Please review for immediate dispatch.`,
                data: {
                    ticketId: newTicket.number,
                    customer: data.customer,
                    customerAddress: generatedAddress,
                    debitorId: generatedDebitorId,
                    equipment: data.equipment,
                    error: data.error,
                    priority: data.priority,
                    desc: data.desc
                }
            };
            
            set(state => ({
                tickets: [newTicket, ...state.tickets],
                emails: [newEmail, ...state.emails],
                sapForm: {
                    ...state.sapForm,
                    customerAddress: generatedAddress, 
                    soldToParty: generatedDebitorId,
                    customerName: data.customer 
                },
                porta: { ...state.porta, status: 'completed' }
            }));
            
            addAgentLog('success', 'Voice Intake Complete. Ticket Generated.');
            
            setTimeout(() => {
                closeApp('porta');
                openApp('outlook');
                selectEmail(newEmail.id);
                addAgentLog('info', 'New high-priority email received from Porta.');
            }, 1000);

         } catch (err) {
            console.error("Finalization failed", err);
            set({ porta: { ...porta, status: 'idle' } });
            addPortaMessage('system', 'Error: Failed to structure ticket data.');
            addAgentLog('error', 'Failed to generate ticket structure.');
         }
      },

      submitJobFeedback: (correct, voiceNote) => set(state => ({})),
      
      addAgentLog: (type, message) => set((state) => ({ agent: { ...state.agent, logs: [...state.agent.logs, { id: Math.random().toString(), timestamp: Date.now(), type, message }] } })),
      
      performScan: async () => {
          const { agent, selectedEmailId, emails, addAgentLog } = get();
          if (!selectedEmailId) return;
          set({ agent: { ...agent, status: 'reading' } });
          addAgentLog('thinking', 'Porta is scanning email content...');
          
          setTimeout(() => {
              const email = emails.find(e => e.id === selectedEmailId);
              if (email && email.data) {
                 set(state => ({
                     agent: { ...state.agent, status: 'idle' },
                     emails: state.emails.map(e => e.id === selectedEmailId ? { ...e, data: e.data } : e)
                 }));
                 addAgentLog('success', 'Entity extraction complete.');
              }
          }, 1500);
      },

      performAutoFill: () => {
          const { selectedEmailId, emails, addAgentLog, switchToApp } = get();
          const email = emails.find(e => e.id === selectedEmailId);
          if (!email || !email.data) return;
          
          addAgentLog('action', 'Injecting data into SAP S/4HANA...');
          setTimeout(() => {
              set(state => ({
                  sapForm: {
                      ...state.sapForm,
                      equipment: email.data!.equipment,
                      soldToParty: email.data!.debitorId,
                      customerAddress: email.data!.customerAddress || state.sapForm.customerAddress,
                      customerName: email.data!.customer, 
                      priority: email.data!.priority,
                      shortText: email.data!.error,
                      errorDesc: email.data!.desc,
                      isDirty: true
                  }
              }));
              switchToApp('sap');
              addAgentLog('success', 'SAP Form populated.');
          }, 1000);
      },

      performDiagnosis: async (ticketId) => {
          const { addAgentLog, tickets } = get();
          const targetTicketId = ticketId || tickets[0].id; 
          const ticket = tickets.find(t => t.id === targetTicketId || t.number === targetTicketId) || tickets[0];
          
          set({ agent: { status: 'diagnosing', activeTask: 'Initializing Curio...', logs: get().agent.logs } });
          addAgentLog('thinking', 'Curio is accessing real-time tools...');
          
          const diagnosisResult = await CurioService.generateRealDiagnosis(ticket.id, ticket);
          
          set(state => {
              const newTickets = [...state.tickets];
              const ticketIndex = newTickets.findIndex(t => t.id === ticket.id);
              if (ticketIndex !== -1) {
                  newTickets[ticketIndex] = { ...newTickets[ticketIndex], status: 'DIAGNOSED' };
              }

              return { 
                  diagnosis: diagnosisResult as any,
                  agent: { ...state.agent, status: 'idle' },
                  tickets: newTickets
              };
          });
          
          addAgentLog('success', `Diagnosis complete. ${diagnosisResult.primaryFault?.confidence}% Confidence.`);
      },

      viewTicketAnalysis: (ticketId) => {
          const { switchToApp } = get();
          switchToApp('console');
          set({ inspectingTicketId: ticketId });
      },

      closeTicketAnalysis: () => set({ inspectingTicketId: null }),
      
      submitDiagnosisFeedback: (ticketId, status, reason) => {
         const { diagnosis } = get();
         if (diagnosis) {
             set({ diagnosis: { ...diagnosis, feedback: { status, reason, timestamp: Date.now() } } });
         }
      },

      manualOverride: () => {
          const { diagnosis, addAgentLog } = get();
          if (diagnosis) {
              set({ 
                  diagnosis: { 
                      ...diagnosis, 
                      feedback: { status: 'rejected', reason: 'Manual Override by Operator', timestamp: Date.now() } 
                  } 
              });
              addAgentLog('info', 'Operator manually rejected AI diagnosis. Unlocking manual entry.');
          }
      },

      performDispatch: () => {
          const { addAgentLog, switchToApp, assignTech } = get();
          addAgentLog('action', 'Aquila is optimizing route...');
          setTimeout(() => {
              assignTech('Stefan K.');
              switchToApp('fsm');
              addAgentLog('success', 'Job dispatched to Stefan K.');
          }, 1500);
      },

      simulateElevenLabsIntake: () => {
          const { addAgentLog } = get();
          addAgentLog('info', 'Incoming Voice Call: +49 151 445...');
          setTimeout(() => addAgentLog('thinking', 'Porta transcribing audio...'), 1000);
          setTimeout(() => addAgentLog('success', 'Ticket #992 created from voice stream.'), 3000);
      },

      addWorkflowNode: (type, label, provider) => {
          const id = Math.random().toString();
          const newNode: WorkflowNode = { id, type, label, provider, position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 }, status: 'active' };
          set(state => ({ workflowNodes: [...state.workflowNodes, newNode] }));
      },
      updateWorkflowNodePosition: (id, x, y) => set(state => ({ workflowNodes: state.workflowNodes.map(n => n.id === id ? { ...n, position: { x, y } } : n) })),
      updateNodeProvider: (nodeId, provider) => set(state => ({ workflowNodes: state.workflowNodes.map(n => n.id === nodeId ? { ...n, provider } : n) })),
      deleteWorkflowNode: (id) => set(state => ({ workflowNodes: state.workflowNodes.filter(n => n.id !== id), workflowEdges: state.workflowEdges.filter(e => e.source !== id && e.target !== id) })),
      
      generateWorkflow: async (prompt) => { 
          set({ isGeneratingWorkflow: true });
          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const result = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: `Generate workflow JSON (nodes, edges) for: ${prompt}. Return JSON only.`,
                  config: { responseMimeType: 'application/json' }
              });
              setTimeout(() => set({ isGeneratingWorkflow: false }), 1500);
          } catch (e) {
              set({ isGeneratingWorkflow: false });
          }
      },

      askCortex: async (query) => {
          const { cortexMessages } = get();
          set({ isCortexThinking: true, cortexMessages: [...cortexMessages, { id: Date.now().toString(), sender: 'user', text: query, timestamp: Date.now() }] });
          
          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const result = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: `You are the Cortex industrial knowledge graph. Answer based on this context:
                  - 847 failures of EJC 220
                  - 91% Pump Motor failures
                  - Symptoms: Grinding noise
                  Query: ${query}`,
              });
              set(state => ({ isCortexThinking: false, cortexMessages: [...state.cortexMessages, { id: Date.now().toString(), sender: 'ai', text: result.text, timestamp: Date.now() }] }));
          } catch (e) {
              set(state => ({ isCortexThinking: false, cortexMessages: [...state.cortexMessages, { id: Date.now().toString(), sender: 'ai', text: "Analysis module offline. Showing cached data.", timestamp: Date.now() }] }));
          }
      }
    }),
    {
      name: 'aedil-os-storage', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
          tickets: state.tickets,
          emails: state.emails,
          sapForm: state.sapForm,
          mobile: state.mobile,
          workflowNodes: state.workflowNodes,
          workflowEdges: state.workflowEdges,
          knowledgeNodes: state.knowledgeNodes
      }),
    }
  )
);