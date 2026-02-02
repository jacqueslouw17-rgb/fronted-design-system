import React, { createContext, useContext, useState, useCallback } from 'react';
import { AgentState, AgentMessage, AgentAction, UIHighlight } from './CA4_AgentTypes';

interface AgentContextType extends AgentState {
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  setNavigating: (navigating: boolean, message?: string) => void;
  setHighlights: (highlights: UIHighlight[]) => void;
  clearHighlights: () => void;
  setOpenWorkerId: (workerId?: string) => void;
  setDraftAdjustment: (draft?: AgentState['draftAdjustment']) => void;
  executeAction: (action: AgentAction) => void;
  clearMessages: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const CA4_AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState<string>();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [highlights, setHighlightsState] = useState<UIHighlight[]>([]);
  const [openWorkerId, setOpenWorkerIdState] = useState<string>();
  const [draftAdjustment, setDraftAdjustmentState] = useState<AgentState['draftAdjustment']>();

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const addMessage = useCallback((message: Omit<AgentMessage, 'id' | 'timestamp'>) => {
    const newMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const setNavigating = useCallback((navigating: boolean, message?: string) => {
    setIsNavigating(navigating);
    setNavigationMessage(message);
  }, []);

  const setHighlights = useCallback((newHighlights: UIHighlight[]) => {
    setHighlightsState(newHighlights);
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightsState([]);
  }, []);

  const setOpenWorkerId = useCallback((workerId?: string) => {
    setOpenWorkerIdState(workerId);
  }, []);

  const setDraftAdjustment = useCallback((draft?: AgentState['draftAdjustment']) => {
    setDraftAdjustmentState(draft);
  }, []);

  const executeAction = useCallback((action: AgentAction) => {
    switch (action.type) {
      case 'open_panel':
        if (action.payload?.workerId) {
          setOpenWorkerIdState(action.payload.workerId);
        }
        break;
      case 'highlight':
        if (action.payload?.cardId) {
          setHighlightsState([{ type: 'card', id: action.payload.cardId, active: true }]);
          setTimeout(() => setHighlightsState([]), 3000);
        }
        break;
      case 'draft_adjustment':
        if (action.payload?.workerId) {
          setOpenWorkerIdState(action.payload.workerId);
          setDraftAdjustmentState({
            workerId: action.payload.workerId,
            type: action.payload.adjustmentType || 'bonus',
            amount: action.payload.amount,
          });
        }
        break;
      default:
        break;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        isOpen,
        isNavigating,
        navigationMessage,
        messages,
        highlights,
        openWorkerId,
        draftAdjustment,
        toggleOpen,
        setOpen,
        addMessage,
        setNavigating,
        setHighlights,
        clearHighlights,
        setOpenWorkerId,
        setDraftAdjustment,
        executeAction,
        clearMessages,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useCA4Agent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useCA4Agent must be used within a CA4_AgentProvider');
  }
  return context;
};
