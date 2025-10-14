import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContextType = 'payroll' | 'contract' | 'compliance' | 'support' | 'dashboard';
export type ContextStatus = 'active' | 'archived' | 'paused';

export interface ContextMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ContextAction {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
}

export interface GenieContext {
  id: string;
  name: string;
  type: ContextType;
  status: ContextStatus;
  createdAt: Date;
  updatedAt: Date;
  messages: ContextMessage[];
  actions: ContextAction[];
  metadata?: Record<string, any>;
}

interface ContextStore {
  contexts: GenieContext[];
  activeContextId: string | null;
  
  // Actions
  createContext: (name: string, type: ContextType, metadata?: Record<string, any>) => string;
  switchContext: (contextId: string) => void;
  addMessage: (contextId: string, role: 'user' | 'assistant', content: string) => void;
  addAction: (contextId: string, type: string, description: string, user?: string) => void;
  archiveContext: (contextId: string) => void;
  pauseContext: (contextId: string) => void;
  resumeContext: (contextId: string) => void;
  getActiveContext: () => GenieContext | null;
  getContextById: (id: string) => GenieContext | null;
  getRecentContexts: (limit?: number) => GenieContext[];
}

export const useContextTracker = create<ContextStore>()(
  persist(
    (set, get) => ({
      contexts: [],
      activeContextId: null,

      createContext: (name, type, metadata) => {
        const contextId = `CTX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newContext: GenieContext = {
          id: contextId,
          name,
          type,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
          actions: [],
          metadata,
        };

        set((state) => ({
          contexts: [...state.contexts, newContext],
          activeContextId: contextId,
        }));

        return contextId;
      },

      switchContext: (contextId) => {
        const context = get().contexts.find((c) => c.id === contextId);
        if (context) {
          set({ activeContextId: contextId });
          
          // Update timestamp
          set((state) => ({
            contexts: state.contexts.map((c) =>
              c.id === contextId ? { ...c, updatedAt: new Date() } : c
            ),
          }));
        }
      },

      addMessage: (contextId, role, content) => {
        const message: ContextMessage = {
          id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role,
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          contexts: state.contexts.map((c) =>
            c.id === contextId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      addAction: (contextId, type, description, user) => {
        const action: ContextAction = {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          description,
          timestamp: new Date(),
          user,
        };

        set((state) => ({
          contexts: state.contexts.map((c) =>
            c.id === contextId
              ? {
                  ...c,
                  actions: [...c.actions, action],
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      archiveContext: (contextId) => {
        set((state) => ({
          contexts: state.contexts.map((c) =>
            c.id === contextId ? { ...c, status: 'archived' as ContextStatus } : c
          ),
        }));
      },

      pauseContext: (contextId) => {
        set((state) => ({
          contexts: state.contexts.map((c) =>
            c.id === contextId ? { ...c, status: 'paused' as ContextStatus } : c
          ),
        }));
      },

      resumeContext: (contextId) => {
        set((state) => ({
          contexts: state.contexts.map((c) =>
            c.id === contextId ? { ...c, status: 'active' as ContextStatus, updatedAt: new Date() } : c
          ),
          activeContextId: contextId,
        }));
      },

      getActiveContext: () => {
        const { contexts, activeContextId } = get();
        return contexts.find((c) => c.id === activeContextId) || null;
      },

      getContextById: (id) => {
        return get().contexts.find((c) => c.id === id) || null;
      },

      getRecentContexts: (limit = 5) => {
        return [...get().contexts]
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, limit);
      },
    }),
    {
      name: 'genie-context-storage',
    }
  )
);
