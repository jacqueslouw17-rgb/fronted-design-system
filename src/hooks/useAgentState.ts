import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentMessage = {
  id: string;
  role: 'user' | 'kurt';
  text: string;
  ts: string;
  actions?: Array<{ type: 'navigate' | 'focus' | 'applyChange'; payload: any }>;
};

export type AgentState = {
  open: boolean;
  messages: AgentMessage[];
  loading: boolean;
  lastAction?: { type: string; payload: any };
  context?: string; // Current flow/page context
};

interface AgentStore extends AgentState {
  setOpen: (open: boolean) => void;
  addMessage: (message: Omit<AgentMessage, 'id' | 'ts'>) => void;
  setLoading: (loading: boolean) => void;
  setLastAction: (action: { type: string; payload: any }) => void;
  setContext: (context: string) => void;
  clearMessages: () => void;
  simulateResponse: (userText: string) => Promise<void>;
}

export const useAgentState = create<AgentStore>()(
  persist(
    (set, get) => ({
      open: false,
      messages: [],
      loading: false,
      lastAction: undefined,
      context: undefined,

      setOpen: (open) => set({ open }),

      addMessage: (message) => {
        const newMessage: AgentMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random()}`,
          ts: new Date().toISOString(),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },

      setLoading: (loading) => set({ loading }),

      setLastAction: (action) => set({ lastAction: action }),

      setContext: (context) => set({ context }),

      clearMessages: () => set({ messages: [] }),

      simulateResponse: async (userText: string) => {
        const { addMessage, setLoading, context } = get();
        
        setLoading(true);

        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock response based on context and user query
        let response = "I can help you with that. Let me check the details...";
        
        if (userText.toLowerCase().includes('contract')) {
          response = "I've reviewed the contract details. Everything looks compliant and ready to proceed.";
        } else if (userText.toLowerCase().includes('status')) {
          response = `Currently viewing: ${context || 'Dashboard'}. All systems are running smoothly.`;
        } else if (userText.toLowerCase().includes('help')) {
          response = "I can assist with contracts, compliance, onboarding, and general questions. What would you like to know?";
        }

        addMessage({
          role: 'kurt',
          text: response,
        });

        setLoading(false);
      },
    }),
    {
      name: 'agent-state',
      partialize: (state) => ({
        messages: state.messages,
        context: state.context,
      }),
    }
  )
);
