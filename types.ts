

export type AppId = 'outlook' | 'sap' | 'fsm' | 'mobile' | 'console' | 'settings' | 'porta';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface AgentLog {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'action' | 'thinking';
  message: string;
}

export interface SapFormState {
  orderType: string;
  equipment: string;
  soldToParty: string;
  customerAddress?: string;
  customerName?: string;
  priority: string;
  shortText: string;
  errorDesc: string;
  isDirty: boolean;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  time: string;
  body: string;
  unread: boolean;
  data?: {
    ticketId: string;
    customer: string;
    customerAddress?: string;
    debitorId: string;
    equipment: string;
    error: string;
    priority: string;
    desc: string;
  };
}

// Enhanced Reasoning Step for Deep Dive Visualization
export interface ReasoningStep {
  id: string;
  system: 'SAP' | 'IoT' | 'Manuals' | 'History' | 'Inventory' | 'Reasoning';
  action: string;
  status: 'pending' | 'working' | 'complete';
  result?: string;
  input?: any;   // The arguments passed to the tool
  output?: any;  // The raw JSON response from the tool
  duration?: number;
  timestamp?: number;
}

export interface FaultCandidate {
  fault: string;
  confidence: number;
  reasoning: string;
}

export interface Diagnosis {
  ticketId: string;
  timestamp: number;
  primaryFault: FaultCandidate;
  secondaryFaults: FaultCandidate[];
  requiredParts: Part[];
  reasoningChain: ReasoningStep[];
  isComplete: boolean;
  feedback?: {
      status: 'approved' | 'rejected';
      reason?: string;
      timestamp: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'tech' | 'ai' | 'user' | 'system';
  text: string;
  timestamp: number;
}

export interface MobileState {
  isOpen: boolean;
  diagnosisStatus: 'pending' | 'accepted' | 'rejected';
  partsOrdered: boolean;
  chatHistory: ChatMessage[];
  debriefStatus: 'pending' | 'recording' | 'completed';
  feedback: TechnicianFeedback | null;
}

export interface PortaState {
    messages: ChatMessage[];
    status: 'idle' | 'listening' | 'processing' | 'speaking' | 'completed';
    transcript: string;
}

export interface AgentState {
  status: 'idle' | 'reading' | 'thinking' | 'executing' | 'waiting' | 'diagnosing';
  activeTask: string | null;
  logs: AgentLog[];
}

export type NodeType = 'trigger' | 'system' | 'agent' | 'action' | 'logic';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  provider: string;
  icon?: string;
  status: 'active' | 'inactive' | 'error';
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface TechnicianFeedback {
  id: string;
  ticketId: string;
  diagnosisCorrect: boolean;
  actualFault?: string;
  voiceNote?: string;
  timestamp: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'error' | 'solution' | 'symptom';
  confidence: number;
  frequency: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface LearningEvent {
  id: string;
  timestamp: number;
  description: string;
  impact: number;
  nodeId: string;
}

export interface Ticket {
  id: string;
  number: string;
  customer: {
    name: string;
    debitorId: string;
    contact: string;
    phone: string;
    email: string;
    location: string;
  };
  equipment: {
    model: string;
    serialNumber: string;
    operatingHours: number;
    lastService: string;
  };
  error: {
    code: string;
    description: string;
    customerReport: string;
  };
  priority: string;
  status: string;
  createdAt: string;
  slaDeadline: string;
  assignedTech?: string;
}

export interface OSState {
  windows: Record<AppId, WindowState>;
  activeAppId: AppId | null;
  theme: 'dark' | 'light';
  openaiApiKey?: string;
  
  tickets: Ticket[];
  emails: Email[];
  selectedEmailId: string | null;
  sapForm: SapFormState;
  assignedTech: string | null;
  
  diagnosis: Diagnosis | null;
  mobile: MobileState;
  porta: PortaState;
  agent: AgentState;

  workflowNodes: WorkflowNode[];
  workflowEdges: WorkflowEdge[];
  isGeneratingWorkflow: boolean;

  knowledgeNodes: KnowledgeNode[];
  knowledgeEdges: KnowledgeEdge[];
  learningEvents: LearningEvent[];
  cortexMessages: ChatMessage[];
  isCortexThinking: boolean;

  // New field to handle the Deep Dive UI state in Console
  inspectingTicketId: string | null;
}

export interface Technician {
  id: string;
  name: string;
  distance: string;
  eta: string;
  experience: string;
  ftfr: number;
  available: boolean;
}

export interface Part {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  quantity: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
