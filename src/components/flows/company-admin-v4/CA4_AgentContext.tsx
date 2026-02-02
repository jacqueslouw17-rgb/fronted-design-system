import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AgentState, AgentMessage, AgentAction, UIHighlight } from './CA4_AgentTypes';

// Pending action types for agent-driven confirmations
export type PendingActionType = 
  | 'approve_all' 
  | 'reject_all' 
  | 'mark_ready' 
  | 'submit_payroll'
  | 'approve_worker'
  | 'reject_worker'
  | 'approve_item'; // Approve a specific item (e.g. expense, bonus)

// For targeted item approval
export interface TargetedItemInfo {
  workerId: string;
  workerName: string;
  itemType: 'expenses' | 'bonus' | 'overtime' | 'leave';
  amount?: number;
  itemIndex?: number; // Index of the item in the worker's submissions array
}

export interface PendingAction {
  type: PendingActionType;
  workerId?: string;
  workerName?: string;
  pendingCount?: number;
  awaitingConfirmation: boolean;
  dialogOpen?: boolean;
  // For targeted item approval
  targetedItem?: TargetedItemInfo;
}

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
  // Navigation control for coordinated UI
  requestedStep?: 'submissions' | 'submit' | 'track';
  setRequestedStep: (step?: 'submissions' | 'submit' | 'track') => void;
  isButtonLoading: boolean;
  setButtonLoading: (loading: boolean) => void;
  // NEW: Pending action orchestration
  pendingAction?: PendingAction;
  setPendingAction: (action?: PendingAction) => void;
  confirmPendingAction: () => void;
  cancelPendingAction: () => void;
  // NEW: Action callbacks for UI to register
  actionCallbacks: {
    onApproveAll?: () => void;
    onRejectAll?: (reason: string) => void;
    onMarkReady?: (workerId: string) => void;
    onSubmitPayroll?: () => void;
    onApproveItem?: (workerId: string, itemType: string, amount?: number) => boolean; // Returns true if item found/approved
  };
  registerActionCallbacks: (callbacks: AgentContextType['actionCallbacks']) => void;
  // Execute callback by type - uses ref for latest callbacks
  executeCallback: (actionType: PendingActionType, workerId?: string, targetedItem?: TargetedItemInfo) => boolean;
  // NEW: Button-specific loading states
  loadingButtons: Record<string, boolean>;
  setButtonLoadingState: (buttonId: string, loading: boolean) => void;
  // NEW: Agent-driven item processing state
  processingItem?: TargetedItemInfo;
  setProcessingItem: (item?: TargetedItemInfo) => void;
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
  const [requestedStep, setRequestedStepState] = useState<'submissions' | 'submit' | 'track'>();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [pendingAction, setPendingActionState] = useState<PendingAction>();
  // Use ref for callbacks to avoid stale closure issues
  const actionCallbacksRef = useRef<AgentContextType['actionCallbacks']>({});
  const [loadingButtons, setLoadingButtons] = useState<Record<string, boolean>>({});
  const [processingItem, setProcessingItemState] = useState<TargetedItemInfo | undefined>();

  const setProcessingItem = useCallback((item?: TargetedItemInfo) => {
    setProcessingItemState(item);
  }, []);

  // Execute action callback by type - always uses latest ref
  // For approve_item, pass pendingAction to get targetedItem info
  const executeCallback = useCallback((actionType: PendingActionType, workerId?: string, targetedItem?: TargetedItemInfo): boolean => {
    const callbacks = actionCallbacksRef.current;
    console.log('[AgentContext] executeCallback called:', actionType, 'workerId:', workerId, 'targetedItem:', targetedItem);
    console.log('[AgentContext] Callbacks available:', Object.keys(callbacks));
    console.log('[AgentContext] onApproveItem callback exists:', !!callbacks.onApproveItem);
    
    switch (actionType) {
      case 'approve_all':
        if (callbacks.onApproveAll) {
          callbacks.onApproveAll();
          return true;
        }
        break;
      case 'reject_all':
        // Reject needs a reason - handled separately
        break;
      case 'mark_ready':
        if (callbacks.onMarkReady && workerId) {
          callbacks.onMarkReady(workerId);
          return true;
        }
        break;
      case 'submit_payroll':
        if (callbacks.onSubmitPayroll) {
          callbacks.onSubmitPayroll();
          return true;
        }
        break;
      case 'approve_item':
        console.log('[AgentContext] approve_item case - targetedItem:', targetedItem);
        if (callbacks.onApproveItem && targetedItem) {
          console.log('[AgentContext] Calling onApproveItem with:', targetedItem.workerId, targetedItem.itemType, targetedItem.amount);
          const result = callbacks.onApproveItem(targetedItem.workerId, targetedItem.itemType, targetedItem.amount);
          console.log('[AgentContext] onApproveItem result:', result);
          return result;
        } else {
          console.log('[AgentContext] onApproveItem NOT called - callback exists:', !!callbacks.onApproveItem, 'targetedItem exists:', !!targetedItem);
        }
        break;
    }
    return false;
  }, []);

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

  const setRequestedStep = useCallback((step?: 'submissions' | 'submit' | 'track') => {
    setRequestedStepState(step);
  }, []);

  const setButtonLoading = useCallback((loading: boolean) => {
    setIsButtonLoading(loading);
  }, []);

  const setPendingAction = useCallback((action?: PendingAction) => {
    setPendingActionState(action);
  }, []);

  const setButtonLoadingState = useCallback((buttonId: string, loading: boolean) => {
    setLoadingButtons(prev => ({ ...prev, [buttonId]: loading }));
  }, []);

  const confirmPendingAction = useCallback(() => {
    if (!pendingAction) return;
    
    // Use ref to get latest callbacks (avoids stale closure)
    const callbacks = actionCallbacksRef.current;
    console.log('[AgentContext] confirmPendingAction called, type:', pendingAction.type, 'callbacks:', callbacks);
    
    switch (pendingAction.type) {
      case 'approve_all':
        console.log('[AgentContext] Calling onApproveAll callback');
        callbacks.onApproveAll?.();
        break;
      case 'reject_all':
        // For reject, we need a reason - this triggers dialog instead
        setPendingActionState(prev => prev ? { ...prev, dialogOpen: true } : undefined);
        return;
      case 'mark_ready':
        if (pendingAction.workerId) {
          callbacks.onMarkReady?.(pendingAction.workerId);
        }
        break;
      case 'submit_payroll':
        callbacks.onSubmitPayroll?.();
        break;
    }
    
    setPendingActionState(undefined);
  }, [pendingAction]);

  const cancelPendingAction = useCallback(() => {
    setPendingActionState(undefined);
  }, []);

  const registerActionCallbacks = useCallback((callbacks: AgentContextType['actionCallbacks']) => {
    console.log('[AgentContext] Registering action callbacks:', Object.keys(callbacks));
    actionCallbacksRef.current = callbacks;
  }, []);

  const executeAction = useCallback((action: AgentAction) => {
    switch (action.type) {
      case 'navigate':
        if (action.payload?.step) {
          setRequestedStepState(action.payload.step);
        }
        break;
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
        requestedStep,
        isButtonLoading,
        pendingAction,
        actionCallbacks: actionCallbacksRef.current,
        loadingButtons: loadingButtons || {},
        processingItem,
        setProcessingItem,
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
        setRequestedStep,
        setButtonLoading,
        setPendingAction,
        confirmPendingAction,
        cancelPendingAction,
        registerActionCallbacks,
        executeCallback,
        setButtonLoadingState,
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
