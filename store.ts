
import { create } from 'zustand';
import { 
  AppId, WindowState, AgentLog, SapFormState, Email, 
  Diagnosis, MobileState, PortaState, AgentState, 
  WorkflowNode, WorkflowEdge, Ticket, ChatMessage,
  KnowledgeNode, KnowledgeEdge, LearningEvent, OSState
} from './types';
import { MOCK_TICKETS } from './constants';

const getApiKey = () => {
  try { return process.env.API_KEY || ""; } catch (e) { return ""; }
};

interface OSStore extends OSState {
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  toggleMaximizeApp: (id: AppId) => void;
  updateWindowPosition: (id: AppId, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: AppId, size: { width: number; height: number }) => void;
  selectEmail: (id: string | null) => void;
  updateEmailBody: (id: string, body: string) => void;
  setOpenAIApiKey: (key: string) => void;
  addAgentLog: (type: AgentLog['type'], message: string) => void;
  performScan: () => void;
  performAutoFill: () => void;
  performDiagnosis: () => void;
  performDispatch: () => void;
  selectDispatchSlot: (techId: string, techName: string, time: string) => void;
  finalizeDispatch: () => void;
  submitDiagnosisFeedback: (ticketId: string, status: 'approved' | 'rejected', reason?: string) => void;
  viewTicketAnalysis: (id: string) => void;
  closeTicketAnalysis: () => void;
  manualOverride: () => void;
  switchToApp: (id: AppId) => void;
  orderParts: () => void;
  toggleSmartLens: (open: boolean) => void;
  addPortaMessage: (sender: ChatMessage['sender'], text: string) => void;
  setPortaStatus: (status: PortaState['status']) => void;
  finalizePortaSession: (extractedFields?: any[]) => Promise<void>;
  runGoldenPathSimulation: () => void;
  updateSapField: (field: keyof SapFormState, value: any) => void;
  updateNodeProvider: (nodeId: string, provider: string) => void;
  addWorkflowNode: (type: any, label: string, provider: string, parentId?: string, pos?: any) => void;
  updateWorkflowNodePosition: (id: string, x: number, y: number) => void;
  deleteWorkflowNode: (id: string) => void;
}

const DEFAULT_WINDOWS: Record<AppId, WindowState> = {
  outlook: { id: 'outlook', title: 'Outlook Web', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 10 },
  sap: { id: 'sap', title: 'SAP S/4HANA', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 11 },
  fsm: { id: 'fsm', title: 'IFS FSM', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 12 },
  mobile: { id: 'mobile', title: 'Technician Mobile', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 13, size: { width: 340, height: 680 } },
  console: { id: 'console', title: 'AEDIL Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 14 },
  settings: { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 15 },
  porta: { id: 'porta', title: 'AEDIL Porta', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 16, size: { width: 340, height: 680 } },
  gallery: { id: 'gallery', title: 'Sales Deck SVGs', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 17 },
};

export const useOS = create<OSStore>()((set, get) => ({
  windows: DEFAULT_WINDOWS,
  activeAppId: 'outlook',
  theme: 'dark',
  tickets: [],
  emails: [],
  selectedEmailId: null,
  sapForm: {
    orderType: 'SV01',
    equipment: '',
    soldToParty: '',
    priority: '',
    shortText: '',
    errorDesc: '',
    isDirty: false
  },
  assignedTech: null,
  dispatchStatus: 'idle',
  selectedSlot: null,
  diagnosis: null,
  mobile: { isOpen: false, diagnosisStatus: 'pending', partsOrdered: false, chatHistory: [], debriefStatus: 'pending', feedback: null },
  porta: { messages: [{ id: '1', sender: 'ai', text: 'Jungheinrich Service Support. Nennen Sie bitte Ihren Namen und Ihre Firma.', timestamp: Date.now() }], status: 'idle', transcript: '' },
  agent: { status: 'idle', activeTask: null, logs: [] },
  workflowNodes: [],
  workflowEdges: [],
  isGeneratingWorkflow: false,
  knowledgeNodes: [],
  knowledgeEdges: [],
  learningEvents: [],
  cortexMessages: [],
  isCortexThinking: false,
  inspectingTicketId: null,

  openApp: (id) => set(state => ({
    windows: { ...state.windows, [id]: { ...state.windows[id], isOpen: true, isMinimized: false } },
    activeAppId: id
  })),
  closeApp: (id) => set(state => ({ windows: { ...state.windows, [id]: { ...state.windows[id], isOpen: false } } })),
  minimizeApp: (id) => set(state => ({ windows: { ...state.windows, [id]: { ...state.windows[id], isMinimized: true } } })),
  focusApp: (id) => set(state => ({
    activeAppId: id,
    windows: { 
      ...state.windows, 
      [id]: { 
        ...state.windows[id], 
        zIndex: Math.max(0, ...Object.values(state.windows).map(w => (w as WindowState).zIndex)) + 1 
      } 
    }
  })),
  toggleMaximizeApp: (id) => set(state => ({ windows: { ...state.windows, [id]: { ...state.windows[id], isMaximized: !state.windows[id].isMaximized } } })),
  updateWindowPosition: (id, pos) => set(state => ({ windows: { ...state.windows, [id]: { ...state.windows[id], position: pos } } })),
  updateWindowSize: (id, size) => set(state => ({ windows: { ...state.windows, [id]: { ...state.windows[id], size } } })),
  selectEmail: (id) => set({ selectedEmailId: id }),
  updateEmailBody: (id, body) => set(state => ({ emails: state.emails.map(e => e.id === id ? { ...e, body } : e) })),
  setOpenAIApiKey: (key) => set({ openaiApiKey: key }),
  addAgentLog: (type, message) => set(state => ({
    agent: { ...state.agent, logs: [...state.agent.logs, { id: Math.random().toString(), timestamp: Date.now(), type, message }] }
  })),
  performScan: () => {
    const { addAgentLog, selectedEmailId, emails } = get();
    const email = emails.find(e => e.id === selectedEmailId);
    if (!email) return;
    addAgentLog('thinking', 'Scanning email for service entities...');
    setTimeout(() => {
      const isGold = email.body.includes('Müller') || email.body.includes('Logistik GmbH') || email.body.includes('91165099');
      set(state => ({
        emails: state.emails.map(e => e.id === selectedEmailId ? {
          ...e,
          data: isGold ? {
            ticketId: '1165099',
            customer: 'Müller Logistik GmbH',
            customerAddress: "21033 Hamburg, Billwerder Ring 42",
            debitorId: '51109912',
            equipment: 'ETM 214',
            error: '3xxx Errors / Shutdown',
            priority: '1-Very High',
            desc: 'Fahrzeug geht sporadisch komplett aus.'
          } : {
            ticketId: '11447115',
            customer: 'DMK Milchkontor',
            debitorId: '11316498',
            equipment: 'EJC 220',
            error: 'E0015',
            priority: '2-High',
            desc: 'Hydraulic system fault'
          }
        } : e)
      }));
      addAgentLog('success', isGold ? 'Entities extracted: Müller Logistik GmbH, ETM 214, SN: 91165099.' : 'Entities extracted: DMK Milchkontor, EJC 220, E0015.');
    }, 1500);
  },
  performAutoFill: () => {
    const { addAgentLog, emails, selectedEmailId } = get();
    const email = emails.find(e => e.id === selectedEmailId);
    if (!email?.data) return;
    addAgentLog('action', 'Injecting data into SAP mask...');
    set(state => ({
      sapForm: {
        ...state.sapForm,
        equipment: email.data!.equipment,
        soldToParty: email.data!.debitorId,
        customerName: email.data!.customer,
        customerAddress: email.data!.customerAddress || "21033 Hamburg, Billwerder Ring 42",
        priority: email.data!.priority,
        shortText: email.data!.desc,
        errorDesc: email.body,
        isDirty: true
      }
    }));
  },
  performDiagnosis: async () => {
    const { sapForm } = get();
    
    // ATOMIC UPDATE: Set status to diagnosing AND add log in one go.
    // This ensures no render cycle misses the 'diagnosing' state.
    set(state => ({ 
        agent: { 
            ...state.agent, 
            status: 'diagnosing',
            logs: [...state.agent.logs, { id: Math.random().toString(), timestamp: Date.now(), type: 'thinking', message: 'Running multi-agent diagnosis...' }]
        } 
    }));
    
    // Dynamic import to keep initial bundle small
    const { CurioService } = await import('./services/curio');
    
    const analysisContext: Ticket = {
        ...MOCK_TICKETS[0],
        id: 'context-ticket',
        equipment: {
            ...MOCK_TICKETS[0].equipment,
            model: sapForm.equipment || MOCK_TICKETS[0].equipment.model, 
            serialNumber: sapForm.equipment?.includes('214') ? '91165099' : MOCK_TICKETS[0].equipment.serialNumber
        },
        customer: {
            ...MOCK_TICKETS[0].customer,
            name: sapForm.customerName || MOCK_TICKETS[0].customer.name
        }
    };

    // This service call is guaranteed to take ~4.7s for the Gold Path
    const diagnosisResult = await CurioService.generateRealDiagnosis(analysisContext.id, analysisContext);
    
    set(state => ({ 
        diagnosis: diagnosisResult as Diagnosis, 
        agent: { 
            ...state.agent, 
            status: 'idle',
            logs: [...state.agent.logs, { id: Math.random().toString(), timestamp: Date.now(), type: 'success', message: `Diagnosis complete: ${diagnosisResult.primaryFault?.fault}` }]
        } 
    }));
  },
  performDispatch: () => { 
      set({ dispatchStatus: 'planning' }); 
      get().addAgentLog('action', 'Opening IFS FSM for scheduling...'); 
      get().closeApp('sap'); 
      get().openApp('fsm'); 
  },
  selectDispatchSlot: (techId, techName, time) => set({ selectedSlot: { techId, techName, time }, dispatchStatus: 'review' }),
  finalizeDispatch: () => {
    const { selectedSlot, addAgentLog } = get();
    if (!selectedSlot) return;
    set({ dispatchStatus: 'confirmed', assignedTech: selectedSlot.techName });
    addAgentLog('success', `Job dispatched to ${selectedSlot.techName} for ${selectedSlot.time}`);
  },
  submitDiagnosisFeedback: (ticketId, status) => set(state => ({ diagnosis: state.diagnosis ? { ...state.diagnosis, feedback: { status, timestamp: Date.now() } } : null })),
  viewTicketAnalysis: (id) => set(state => {
      const maxZ = Math.max(0, ...Object.values(state.windows).map(w => (w as WindowState).zIndex));
      return { 
          inspectingTicketId: id, 
          activeAppId: 'console',
          windows: {
              ...state.windows,
              console: {
                  ...state.windows.console,
                  isOpen: true,
                  isMinimized: false,
                  zIndex: maxZ + 1
              }
          }
      };
  }),
  closeTicketAnalysis: () => set({ inspectingTicketId: null }),
  manualOverride: () => set({ diagnosis: null }),
  switchToApp: (id) => {
      const { activeAppId, closeApp, openApp } = get();
      if (activeAppId) closeApp(activeAppId);
      openApp(id);
  },
  orderParts: () => set(state => ({ mobile: { ...state.mobile, partsOrdered: true } })),
  toggleSmartLens: (open) => set(state => ({ mobile: { ...state.mobile, isOpen: open } })),
  addPortaMessage: (sender, text) => set(state => ({ porta: { ...state.porta, messages: [...state.porta.messages, { id: Math.random().toString(), sender, text, timestamp: Date.now() }] } })),
  setPortaStatus: (status) => set(state => ({ porta: { ...state.porta, status } })),
  runGoldenPathSimulation: () => {
     const { addPortaMessage, setPortaStatus, finalizePortaSession } = get();
     set(state => ({ porta: { messages: [], status: 'idle', transcript: '' } }));
     setTimeout(() => addPortaMessage('ai', 'Jungheinrich Service Support. Nennen Sie bitte Ihren Namen und Ihre Firma.'), 100);
     setTimeout(() => setPortaStatus('listening'), 1000);
     setTimeout(() => addPortaMessage('user', 'Hier ist Arnold Kampers von Müller Logistik GmbH.'), 2500);
     setTimeout(() => addPortaMessage('ai', 'Willkommen Herr Kampers. Geht es um ein Fahrzeug?'), 3500);
     setTimeout(() => addPortaMessage('user', 'Ja, mein ETM 214 mit der Seriennummer 91165099 geht immer wieder komplett aus.'), 5000);
     setTimeout(() => { setPortaStatus('processing'); setTimeout(() => finalizePortaSession(), 1500); }, 6000);
  },
  finalizePortaSession: async () => {
    const { addAgentLog, openApp, closeApp, selectEmail } = get();
    set(state => ({ porta: { ...state.porta, status: 'processing' } }));
    get().addPortaMessage('system', 'Generiere Ticket und Service-Bericht...');
    try {
      const transcript = get().porta.messages.map(m => m.text).join(' ');
      const isGold = transcript.includes('Müller') || transcript.includes('Logistik GmbH') || transcript.includes('91165099');
      const data = isGold ? {
        customer: "Müller Logistik GmbH",
        equipment: "ETM 214",
        serial: "91165099",
        error: "3xxx / Shutting Down",
        priority: "1-Very High",
        desc: "Fahrzeug geht sporadisch komplett aus.",
        emailSubject: "Störungsmeldung: Müller Logistik GmbH (ETM 214)",
        emailBody: "Der Kunde Müller Logistik GmbH berichtet, dass das Fahrzeug ETM 214 (#91165099) immer wieder komplett ausgeht. Dies tritt scheinbar ohne Vorwarnung auf."
      } : {
        customer: "Unbekannt",
        equipment: "EJC 220",
        serial: "51654367",
        error: "Unbekannt",
        priority: "3-Medium",
        desc: "Störung gemeldet.",
        emailSubject: "Serviceanfrage",
        emailBody: "Es wurde eine Störung gemeldet."
      };
      const generatedAddress = `21033 Hamburg, Billwerder Ring 42`;
      const generatedDebitorId = isGold ? "51109912" : "11000000";
      const newTicket: Ticket = { 
        ...MOCK_TICKETS[0], 
        id: `T-${Date.now()}`, 
        number: isGold ? "1165099" : Math.floor(100000 + Math.random() * 900000).toString(), 
        customer: { name: data.customer, debitorId: generatedDebitorId, contact: "Arnold Müller", phone: "N/A", email: "info@mueller-logistik.de", location: generatedAddress }, 
        equipment: { ...MOCK_TICKETS[0].equipment, model: data.equipment, serialNumber: data.serial }, 
        error: { code: data.error, description: data.desc, customerReport: data.emailBody },
        priority: data.priority, status: 'NEW', createdAt: new Date().toISOString()
      };
      const newEmail: Email = {
        id: `e-${Date.now()}`,
        sender: 'AEDIL Porta <intake@aedil.ai>',
        subject: data.emailSubject,
        time: 'Gerade eben',
        unread: true,
        body: data.emailBody,
        data: { ticketId: newTicket.number, customer: data.customer, customerAddress: generatedAddress, debitorId: generatedDebitorId, equipment: data.equipment, error: data.error, priority: data.priority, desc: data.desc }
      };
      set(state => ({
        tickets: [newTicket, ...state.tickets],
        emails: [newEmail, ...state.emails],
        sapForm: {
          ...state.sapForm,
          customerAddress: generatedAddress, 
          soldToParty: generatedDebitorId,
          customerName: data.customer,
          equipment: data.equipment,
          priority: data.priority,
          shortText: data.desc,
          errorDesc: data.emailBody,
          isDirty: true
        },
        porta: { ...state.porta, status: 'completed' }
      }));
      addAgentLog('success', 'Ticket und E-Mail erfolgreich generiert.');
      setTimeout(() => {
        closeApp('porta'); openApp('outlook'); selectEmail(newEmail.id);
        set(state => ({ porta: { messages: [{ id: Date.now().toString(), sender: 'ai', text: 'Jungheinrich Service Support. Nennen Sie bitte Ihren Namen und Ihre Firma.', timestamp: Date.now() }], status: 'idle', transcript: '' } }));
      }, 1000);
    } catch (err) { set(state => ({ porta: { ...state.porta, status: 'idle' } })); }
  },
  updateSapField: (field, value) => set(state => ({ sapForm: { ...state.sapForm, [field]: value, isDirty: true } })),
  updateNodeProvider: (nodeId, provider) => set(state => ({ workflowNodes: state.workflowNodes.map(n => n.id === nodeId ? { ...n, provider } : n) })),
  addWorkflowNode: (type, label, provider, parentId, pos) => set(state => {
    const newNode: WorkflowNode = { id: Math.random().toString(), type, label, position: pos || { x: 100, y: 100 }, provider, status: 'active' };
    const newEdge: WorkflowEdge | null = parentId ? { id: Math.random().toString(), source: parentId, target: newNode.id } : null;
    return { workflowNodes: [...state.workflowNodes, newNode], workflowEdges: newEdge ? [...state.workflowEdges, newEdge] : state.workflowEdges };
  }),
  updateWorkflowNodePosition: (id, x, y) => set(state => ({ workflowNodes: state.workflowNodes.map(n => n.id === id ? { ...n, position: { x, y } } : n) })),
  deleteWorkflowNode: (id) => set(state => ({ workflowNodes: state.workflowNodes.filter(n => n.id !== id), workflowEdges: state.workflowEdges.filter(e => e.source !== id && e.target !== id) }))
}));