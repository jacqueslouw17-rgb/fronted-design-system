// Types for the agentic payroll assistant

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // Structured response parts (for assistant messages)
  summary?: string;
  context?: {
    payPeriod?: string;
    worker?: string;
    country?: string;
    currency?: string;
  };
  assumptions?: string[];
  actions?: AgentAction[];
  isTyping?: boolean;
}

export interface AgentAction {
  id: string;
  label: string;
  type: 'navigate' | 'open_panel' | 'highlight' | 'draft_adjustment' | 'export' | 'explain';
  payload?: {
    step?: 'submissions' | 'submit' | 'track';
    workerId?: string;
    workerName?: string;
    cardId?: string;
    adjustmentType?: 'bonus' | 'overtime' | 'expenses';
    amount?: number;
  };
}

export interface UIHighlight {
  type: 'card' | 'worker' | 'section';
  id: string;
  active: boolean;
}

export interface AgentState {
  isOpen: boolean;
  isNavigating: boolean;
  navigationMessage?: string;
  messages: AgentMessage[];
  highlights: UIHighlight[];
  openWorkerId?: string;
  draftAdjustment?: {
    workerId: string;
    type: 'bonus' | 'overtime' | 'expenses';
    amount?: number;
    description?: string;
  };
}

// Demo questions for suggested chips
export const SUGGESTED_PROMPTS = [
  "How much tax do we need to pay for our India employee this pay period?",
  "Compare average total cost of a UK employee vs India employee",
  "How much bonus did we pay Jonas last cycle, and what's recommended this cycle?",
];
