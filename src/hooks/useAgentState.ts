import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentMessage = {
  id: string;
  role: 'user' | 'kurt';
  text: string;
  ts: string;
  actions?: Array<{ type: string; payload: any }>;
  actionButtons?: Array<{ label: string; action: string; variant?: 'default' | 'outline' | 'secondary' }>;
};

export type AgentState = {
  open: boolean;
  messages: AgentMessage[];
  loading: boolean;
  isSpeaking: boolean;
  currentWordIndex: number;
  lastAction?: { type: string; payload: any };
  context?: string; // Current flow/page context
};

interface AgentStore extends AgentState {
  setOpen: (open: boolean) => void;
  addMessage: (message: Omit<AgentMessage, 'id' | 'ts'>) => void;
  setLoading: (loading: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setCurrentWordIndex: (index: number) => void;
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
      isSpeaking: false,
      currentWordIndex: 0,
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

      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),

      setCurrentWordIndex: (index) => set({ currentWordIndex: index }),

      setLastAction: (action) => set({ lastAction: action }),

      setContext: (context) => set({ context }),

      clearMessages: () => set({ messages: [] }),

  simulateResponse: async (userText: string) => {
    const { addMessage, setLoading, context } = get();
    
    setLoading(true);

    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Use intent router to match user utterance
      const { matchIntent, getIntentDescription } = await import('@/lib/intent-router');
      const { createKurtActions, executeIntentAction } = await import('@/lib/kurt-actions');
      
      // Match intent
      const match = matchIntent(userText);
      const description = getIntentDescription(match);
      
      console.log('[Kurt] Matched intent:', match);
      
      // Create actions - use a mock navigate that doesn't reload
      const mockNavigate = (path: string) => {
        console.log('[Kurt] Navigate to:', path);
        // Don't actually navigate - just log for now
        // The actual navigation should be handled by the router
      };
      
      const actions = createKurtActions(mockNavigate as any);
      
      // Execute action
      const result = await executeIntentAction(match.intent, match.entities, actions);
      
      // Generate response message
      let response = description;
      if (match.confidence < 0.5) {
        response = "I'm not sure I understood that. " + response;
      }
      
      // Add context if available
      if (context) {
        response += ` (Context: ${context})`;
      }

      addMessage({
        role: 'kurt',
        text: response,
        actions: result.success ? [{ 
          type: result.action || 'info', 
          payload: { ...match.entities, description } 
        }] : undefined
      });
    } catch (error) {
      console.error('[Kurt] Error processing message:', error);
      addMessage({
        role: 'kurt',
        text: "Sorry, I encountered an error processing your request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
