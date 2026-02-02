import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X, Square, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useCA4Agent, PendingActionType, TargetedItemInfo } from './CA4_AgentContext';
import { AgentMessage, AgentAction } from './CA4_AgentTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kurt-chat`;

// Worker name to ID mapping for navigation
const WORKER_MAP: Record<string, { id: string; name: string }> = {
  'david': { id: '1', name: 'David Martinez' },
  'david martinez': { id: '1', name: 'David Martinez' },
  'sophie': { id: '2', name: 'Sophie Laurent' },
  'sophie laurent': { id: '2', name: 'Sophie Laurent' },
  'maria': { id: '6', name: 'Maria Santos' },
  'maria santos': { id: '6', name: 'Maria Santos' },
  'alex': { id: '4', name: 'Alex Hansen' },
  'alex hansen': { id: '4', name: 'Alex Hansen' },
  'emma': { id: '5', name: 'Emma Wilson' },
  'emma wilson': { id: '5', name: 'Emma Wilson' },
  'jonas': { id: '7', name: 'Jonas Schmidt' },
  'jonas schmidt': { id: '7', name: 'Jonas Schmidt' },
  'priya': { id: '8', name: 'Priya Sharma' },
  'priya sharma': { id: '8', name: 'Priya Sharma' },
  'lisa': { id: '9', name: 'Lisa Chen' },
  'lisa chen': { id: '9', name: 'Lisa Chen' },
};

// Worker data for intelligent suggestions
const WORKERS_DATA = [
  { id: '1', name: 'David Martinez', pendingItems: 2, status: 'pending' },
  { id: '2', name: 'Sophie Laurent', pendingItems: 1, status: 'pending' },
  { id: '4', name: 'Alex Hansen', pendingItems: 0, status: 'reviewed' },
  { id: '5', name: 'Emma Wilson', pendingItems: 1, status: 'pending' },
  { id: '6', name: 'Maria Santos', pendingItems: 0, status: 'reviewed' },
  { id: '7', name: 'Jonas Schmidt', pendingItems: 2, status: 'pending' },
  { id: '8', name: 'Priya Sharma', pendingItems: 1, status: 'pending' },
  { id: '9', name: 'Lisa Chen', pendingItems: 0, status: 'ready' },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: SuggestedAction;
}

// Suggested next action for proactive flow
interface SuggestedAction {
  type: PendingActionType | 'view_worker' | 'continue_to_submit';
  label: string;
  description?: string;
  workerId?: string;
  workerName?: string;
}

// Detect worker name and navigation intent from query
function detectWorkerIntent(query: string): { workerId?: string; workerName?: string; wantsNavigation?: boolean } {
  const lowerQuery = query.toLowerCase();
  
  // Check for navigation intent
  const wantsNavigation = lowerQuery.includes('open') || 
    lowerQuery.includes('show') || 
    lowerQuery.includes('submission') || 
    lowerQuery.includes('go to') ||
    lowerQuery.includes('navigate');
  
  // Find worker name
  for (const [key, value] of Object.entries(WORKER_MAP)) {
    if (lowerQuery.includes(key)) {
      return { workerId: value.id, workerName: value.name, wantsNavigation };
    }
  }
  
  return { wantsNavigation };
}

// Detect action intents (approve, reject, confirm, etc.)
interface ActionIntent {
  type: PendingActionType | 'confirm_yes' | 'confirm_no' | null;
  workerId?: string;
  workerName?: string;
  // For targeted item approval
  targetedItem?: TargetedItemInfo;
}

// Infer an actionable "approve_item" request from Kurt's own message when it contains
// an "Action Required" section (so the user's Yes/No actually drives the UI).
function inferActionRequiredApproveItem(content: string): {
  workerId: string;
  workerName: string;
  targetedItem: TargetedItemInfo;
} | null {
  const lower = content.toLowerCase();

  const mentionsActionRequired = lower.includes('action required');
  const asksToApprove = /would you like me to approve|do you want.*approve|approve this submission|approve this item/i.test(content);
  if (!mentionsActionRequired || !asksToApprove) return null;

  const worker = Object.values(WORKER_MAP).find(w => lower.includes(w.name.toLowerCase()));
  if (!worker) return null;

  let itemType: TargetedItemInfo['itemType'] | undefined;
  if (/(expense|expenses|reimbursement)/i.test(content)) itemType = 'expenses';
  else if (/bonus/i.test(content)) itemType = 'bonus';
  else if (/overtime/i.test(content)) itemType = 'overtime';
  else if (/leave/i.test(content)) itemType = 'leave';
  if (!itemType) return null;

  // Extract all currency amounts and pick the smallest (line-item) amount.
  const amounts = Array.from(content.matchAll(/[€$£]\s?(\d+(?:[\.,]\d+)?)/g))
    .map(m => Number(String(m[1]).replace(',', '.')))
    .filter(n => Number.isFinite(n)) as number[];

  const amount = amounts.length ? amounts.sort((a, b) => a - b)[0] : undefined;

  return {
    workerId: worker.id,
    workerName: worker.name,
    targetedItem: {
      workerId: worker.id,
      workerName: worker.name,
      itemType,
      amount,
    },
  };
}

// Parse targeted item approval: "approve the expense of 245 for David"
function parseTargetedItemApproval(query: string): { workerId: string; workerName: string; itemType: 'expenses' | 'bonus' | 'overtime'; amount?: number } | null {
  const lowerQuery = query.toLowerCase();
  
  // Must contain "approve" but NOT "all"
  if (!lowerQuery.includes('approve') || lowerQuery.includes('all')) return null;
  
  // Find worker name
  let foundWorker: { id: string; name: string } | null = null;
  for (const [key, value] of Object.entries(WORKER_MAP)) {
    if (lowerQuery.includes(key)) {
      foundWorker = value;
      break;
    }
  }
  if (!foundWorker) return null;
  
  // Find item type
  let itemType: 'expenses' | 'bonus' | 'overtime' | null = null;
  if (lowerQuery.includes('expense')) itemType = 'expenses';
  else if (lowerQuery.includes('bonus')) itemType = 'bonus';
  else if (lowerQuery.includes('overtime')) itemType = 'overtime';
  
  if (!itemType) return null;
  
  // Parse amount (optional) - look for numbers
  const amountMatch = query.match(/(\d+(?:[.,]\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : undefined;
  
  return {
    workerId: foundWorker.id,
    workerName: foundWorker.name,
    itemType,
    amount,
  };
}

function detectActionIntent(query: string): ActionIntent {
  const lowerQuery = query.toLowerCase().trim();
  
  // Confirmation responses
  if (/^(yes|yeah|yep|sure|confirm|ok|okay|do it|go ahead|proceed|approve it|yes please)$/i.test(lowerQuery) ||
      lowerQuery.includes('yes, approve') || 
      lowerQuery.includes('yes approve') ||
      lowerQuery.includes('yes, mark') ||
      lowerQuery.includes('yes mark') ||
      lowerQuery.includes('confirm') && (lowerQuery.includes('approve') || lowerQuery.includes('mark') || lowerQuery.includes('submit'))) {
    return { type: 'confirm_yes' };
  }
  
  if (/^(no|nope|cancel|stop|don't|nevermind|never mind)$/i.test(lowerQuery)) {
    return { type: 'confirm_no' };
  }
  
  // Check for targeted item approval FIRST (before approve_all)
  const targetedItem = parseTargetedItemApproval(query);
  if (targetedItem) {
    return { 
      type: 'approve_item', 
      workerId: targetedItem.workerId, 
      workerName: targetedItem.workerName,
      targetedItem: {
        workerId: targetedItem.workerId,
        workerName: targetedItem.workerName,
        itemType: targetedItem.itemType,
        amount: targetedItem.amount,
      },
    };
  }
  
  // Approve all intent
  if ((lowerQuery.includes('approve') && lowerQuery.includes('all')) ||
      lowerQuery.includes('approve everything') ||
      lowerQuery.includes('approve all pending') ||
      lowerQuery.includes('approve all items')) {
    return { type: 'approve_all' };
  }
  
  // Reject all intent  
  if ((lowerQuery.includes('reject') && lowerQuery.includes('all')) ||
      lowerQuery.includes('reject everything')) {
    return { type: 'reject_all' };
  }
  
  // Mark ready intent - check for specific worker or all workers
  if (lowerQuery.includes('mark') && lowerQuery.includes('ready')) {
    // Check for "all" workers
    if (lowerQuery.includes('all') || lowerQuery.includes('everyone') || lowerQuery.includes('everybody')) {
      return { type: 'mark_ready' }; // No workerId means all workers
    }
    // Check for specific worker name
    for (const [key, value] of Object.entries(WORKER_MAP)) {
      if (lowerQuery.includes(key)) {
        return { type: 'mark_ready', workerId: value.id, workerName: value.name };
      }
    }
    // Default to current worker context
    return { type: 'mark_ready' };
  }
  
  // Submit payroll intent
  if ((lowerQuery.includes('submit') && lowerQuery.includes('payroll')) ||
      lowerQuery.includes('continue to submit') ||
      lowerQuery.includes('finalize payroll') ||
      lowerQuery.includes('proceed to submit') ||
      lowerQuery.includes('go to submit')) {
    return { type: 'submit_payroll' };
  }
  
  return { type: null };
}

// Generate the next suggested action based on current state
function getNextSuggestedAction(completedAction: PendingActionType, workerId?: string): SuggestedAction | undefined {
  switch (completedAction) {
    case 'approve_all':
      // After approving all, suggest marking workers as ready
      const workersToMark = WORKERS_DATA.filter(w => w.status !== 'ready');
      if (workersToMark.length > 0) {
        return {
          type: 'mark_ready',
          label: 'Mark workers as ready',
          description: `${workersToMark.length} worker${workersToMark.length > 1 ? 's' : ''} can now be finalized`,
        };
      }
      break;
      
    case 'mark_ready':
      // After marking ready, check if all workers are ready → suggest submit
      const remainingWorkers = WORKERS_DATA.filter(w => w.status !== 'ready');
      if (remainingWorkers.length === 0 || remainingWorkers.length <= 1) {
        return {
          type: 'submit_payroll',
          label: 'Continue to submit',
          description: 'All workers are ready for payroll',
        };
      } else {
        // Suggest marking more workers
        const nextWorker = remainingWorkers[0];
        return {
          type: 'mark_ready',
          label: `Mark ${nextWorker.name} as ready`,
          description: `${remainingWorkers.length} more worker${remainingWorkers.length > 1 ? 's' : ''} to finalize`,
          workerId: nextWorker.id,
          workerName: nextWorker.name,
        };
      }
      
    case 'reject_all':
      // After rejecting, no automatic next step - worker needs to resubmit
      return undefined;
      
    case 'submit_payroll':
      // After submitting, we're done with this flow
      return undefined;
      
    default:
      return undefined;
  }
}

export const CA4_AgentChatPanel: React.FC = () => {
  const {
    isOpen,
    setOpen,
    addMessage,
    isNavigating,
    navigationMessage,
    setNavigating,
    setRequestedStep,
    setOpenWorkerId,
    setButtonLoading,
    pendingAction,
    setPendingAction,
    confirmPendingAction,
    cancelPendingAction,
    setButtonLoadingState,
    executeCallback,
  } = useCA4Agent();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showRetrieving, setShowRetrieving] = useState(false);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [currentSuggestedAction, setCurrentSuggestedAction] = useState<SuggestedAction | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive or confirmation buttons appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showRetrieving, currentSuggestedAction, awaitingConfirmation]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // Hide skeleton when both streaming starts AND minimum loading time passed
  useEffect(() => {
    if (isStreaming && minLoadingComplete && showRetrieving) {
      setShowRetrieving(false);
    }
  }, [isStreaming, minLoadingComplete, showRetrieving]);

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    setShowRetrieving(false);
  };

  // Execute a suggested action
  const executeSuggestedAction = useCallback((action: SuggestedAction) => {
    // Clear the current suggestion
    setCurrentSuggestedAction(undefined);
    
    // Simulate user confirming via input
    if (action.type === 'mark_ready') {
      if (action.workerId) {
        handleSubmit(`Mark ${action.workerName} as ready`);
      } else {
        handleSubmit('Mark all workers as ready');
      }
    } else if (action.type === 'submit_payroll') {
      handleSubmit('Continue to submit payroll');
    } else if (action.type === 'approve_all') {
      handleSubmit('Approve all pending items');
    }
  }, []);

  // Complete an action and show next suggestion (optionally trigger follow-up for item approval)
  const completeAction = useCallback((actionType: PendingActionType, workerId?: string, workerName?: string) => {
    // Get the next suggested action
    let nextAction = getNextSuggestedAction(actionType, workerId);
    
    // Update button states
    setButtonLoadingState(actionType, false);
    setButtonLoading(false);
    setAwaitingConfirmation(false);
    
    // Build response message with context
    let responseContent = '';
    switch (actionType) {
      case 'approve_all':
        responseContent = '✓ **Done!** All pending adjustments and leaves have been approved.';
        break;
      case 'mark_ready':
        responseContent = workerId 
          ? `✓ **Done!** Worker has been marked as ready for payroll.`
          : '✓ **Done!** All reviewed workers have been marked as ready.';
        break;
      case 'submit_payroll':
        responseContent = '✓ **Done!** Payroll has been submitted for processing.';
        break;
      case 'reject_all':
        responseContent = '✓ **Done!** All pending items have been rejected. Workers will need to resubmit.';
        break;
      case 'approve_item':
        responseContent = `✓ **Done!** The item has been approved for ${workerName || 'the worker'}.`;
        // After approving a single item, prompt to mark worker as ready
        if (workerId && workerName) {
          nextAction = {
            type: 'mark_ready',
            label: `Mark ${workerName} as ready`,
            description: `${workerName} can now be finalized`,
            workerId,
            workerName,
          };
          responseContent += `\n\n**Next step:** Would you like to mark ${workerName} as ready?`;
        }
        break;
    }
    
    // For non-approve_item actions, add the next suggested action to the message
    if (actionType !== 'approve_item' && nextAction) {
      responseContent += `\n\n**Next step:** ${nextAction.description || nextAction.label}`;
    }
    
    setCurrentSuggestedAction(nextAction);
    setPendingAction(undefined);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: responseContent,
      suggestedAction: nextAction,
    }]);
    
    setIsLoading(false);
    setShowRetrieving(false);
  }, [setButtonLoading, setButtonLoadingState, setPendingAction]);

  const handleConfirmNo = useCallback(() => {
    if (!pendingAction) return;
    setButtonLoadingState(pendingAction.type, false);
    setButtonLoading(false);
    cancelPendingAction();
    setAwaitingConfirmation(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "Cancelled. Tell me what you'd like to do next.",
    }]);
  }, [pendingAction, setButtonLoadingState, setButtonLoading, cancelPendingAction]);

  const handleConfirmYes = useCallback(() => {
    if (!pendingAction) return;

    const actionType = pendingAction.type;
    const workerId = pendingAction.workerId;
    const workerName = pendingAction.workerName;
    const targetedItem = pendingAction.targetedItem;

    // Prevent double submit.
    setAwaitingConfirmation(false);
    setPendingAction(undefined);

    // Keep chat open and show the relevant drawer.
    setOpen(true);
    setRequestedStep('submissions');
    if (workerId) setOpenWorkerId(workerId);

    setButtonLoadingState(actionType, true);
    setButtonLoading(true);

    setTimeout(() => {
      let ok = false;
      if (actionType === 'approve_item' && targetedItem) {
        ok = executeCallback('approve_item', workerId, targetedItem);
      } else if (actionType === 'mark_ready' && !workerId) {
        WORKERS_DATA.forEach(w => {
          if (w.status !== 'ready') executeCallback('mark_ready', w.id);
        });
        ok = true;
      } else {
        ok = executeCallback(actionType, workerId);
      }

      if (!ok) {
        setButtonLoadingState(actionType, false);
        setButtonLoading(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I couldn't find a matching **pending** item to approve for **${workerName || 'that worker'}**. Please keep the drawer open and try again with the exact type/amount.`,
        }]);
        return;
      }

      completeAction(actionType, workerId, workerName);
    }, 650);
  }, [pendingAction, setAwaitingConfirmation, setPendingAction, setOpen, setRequestedStep, setOpenWorkerId, setButtonLoadingState, setButtonLoading, executeCallback, completeAction]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setShowRetrieving(true);
    setMinLoadingComplete(false);
    setCurrentSuggestedAction(undefined);
    
    // Minimum loading duration for smooth UX (1.5s)
    setTimeout(() => setMinLoadingComplete(true), 1500);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add to agent context
    addMessage({ role: 'user', content: query });

    // FIRST: Check for action intents (approve, reject, confirm)
    const actionIntent = detectActionIntent(query);
    
    // Handle confirmation responses
    if (actionIntent.type === 'confirm_yes' && pendingAction?.awaitingConfirmation) {
      console.log('[AgentChat] User confirmed action:', pendingAction.type);
      handleConfirmYes();
      return;
    }
    
    if (actionIntent.type === 'confirm_no' && pendingAction?.awaitingConfirmation) {
      console.log('[AgentChat] User cancelled action');
      handleConfirmNo();
      setIsLoading(false);
      setShowRetrieving(false);
      return;
    }
    
    // Handle new action intents (approve all, reject all, mark ready, submit, approve_item)
    if (actionIntent.type && actionIntent.type !== 'confirm_yes' && actionIntent.type !== 'confirm_no') {
      console.log('[AgentChat] Detected action intent:', actionIntent);
      
      const actionType = actionIntent.type as PendingActionType;
      
      // MARK_READY: Execute immediately without confirmation
      if (actionType === 'mark_ready') {
        const workerId = actionIntent.workerId;
        const workerName = actionIntent.workerName;
        
        setOpen(true);
        
        // Navigate to submissions
        setTimeout(() => {
          setRequestedStep('submissions');
        }, 300);
        
        // Open the worker drawer briefly to show context
        if (workerId) {
          setTimeout(() => {
            setOpenWorkerId(workerId);
          }, 600);
        }
        
        // Execute the action after drawer opens
        setTimeout(() => {
          if (workerId) {
            // Single worker
            executeCallback('mark_ready', workerId);
          } else {
            // All workers
            WORKERS_DATA.forEach(w => {
              if (w.status !== 'ready') {
                executeCallback('mark_ready', w.id);
              }
            });
          }
        }, 1200);
        
        // Close drawer and show completion
        setTimeout(() => {
          setOpenWorkerId(undefined); // Close drawer
          
          // Check for remaining pending items to suggest next action
          const workersWithPending = WORKERS_DATA.filter(w => w.pendingItems > 0);
          let nextAction: SuggestedAction | undefined;
          let responseContent = workerId 
            ? `✓ **Done!** ${workerName} has been marked as ready for payroll.`
            : '✓ **Done!** All reviewed workers have been marked as ready.';
          
          if (workersWithPending.length > 0) {
            nextAction = {
              type: 'approve_all',
              label: 'Approve all pending items',
              description: `${workersWithPending.length} worker${workersWithPending.length > 1 ? 's' : ''} have pending items`,
            };
            responseContent += `\n\n**Next:** ${workersWithPending.length} worker${workersWithPending.length > 1 ? 's' : ''} still have pending items. Want me to approve them all?`;
          } else {
            nextAction = {
              type: 'submit_payroll',
              label: 'Continue to submit',
              description: 'All workers are ready',
            };
            responseContent += `\n\n**Next:** All workers are ready! Would you like to continue to submit?`;
          }
          
          setCurrentSuggestedAction(nextAction);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: responseContent,
            suggestedAction: nextAction,
          }]);
          
          setIsLoading(false);
          setShowRetrieving(false);
        }, 1800);
        
        return;
      }
      
      // OTHER ACTIONS: Ask for confirmation
      setOpen(true);
      setButtonLoading(true);
      
      // Navigate to submissions if not already there
      setTimeout(() => {
        setRequestedStep('submissions');
      }, 300);
      
      // Open the target worker (or first worker for approve_all)
      const targetWorkerId = actionIntent.workerId || '1';
      setTimeout(() => {
        setOpenWorkerId(targetWorkerId);
      }, 800);
      
      // Set the button loading state to show the button is "preparing"
      setTimeout(() => {
        setButtonLoadingState(actionType, true);
      }, 1200);
      
      // Set up pending action and ask for confirmation
      setTimeout(() => {
        // Build action labels and descriptions including approve_item
        const itemTypeLabel = actionIntent.targetedItem?.itemType === 'expenses' ? 'expense' 
          : actionIntent.targetedItem?.itemType === 'bonus' ? 'bonus'
          : actionIntent.targetedItem?.itemType === 'overtime' ? 'overtime' : 'item';
        
        const amountStr = actionIntent.targetedItem?.amount 
          ? ` of €${actionIntent.targetedItem.amount}` 
          : '';
        
        const actionLabels: Record<string, string> = {
          'approve_all': 'approve all pending items',
          'reject_all': 'reject all pending items',
          'submit_payroll': 'submit the payroll for processing',
          'approve_item': `approve the ${itemTypeLabel}${amountStr} for ${actionIntent.workerName}`,
        };
        
        const actionDescriptions: Record<string, string> = {
          'approve_all': 'This will approve all pending adjustments and leaves across all workers.',
          'reject_all': 'This will reject all pending items. Workers will need to resubmit.',
          'submit_payroll': 'This will submit the payroll run for processing. Payments will be scheduled.',
          'approve_item': `I'll open ${actionIntent.workerName}'s drawer, find the ${itemTypeLabel}${amountStr}, and approve it.`,
        };
        
        setPendingAction({
          type: actionType,
          workerId: actionIntent.workerId,
          workerName: actionIntent.workerName,
          awaitingConfirmation: true,
          targetedItem: actionIntent.targetedItem,
        });
        
        setAwaitingConfirmation(true);
        setButtonLoading(false);
        
        // Show confirmation prompt as assistant message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `I can **${actionLabels[actionType] || 'do that'}** for you.\n\n${actionDescriptions[actionType] || ''}\n\n**Do you want to proceed?**`
        }]);
        
        setIsLoading(false);
        setShowRetrieving(false);
      }, 1800);
      
      return;
    }

    // Detect worker intent and trigger UI orchestration
    const intent = detectWorkerIntent(query);
    
    // Calculate when we expect the AI response to arrive (roughly 2-3 seconds)
    // We want the UI transitions to complete around the same time as the AI response
    const TRANSITION_DURATION = 2500; // Total orchestration time in ms
    
    // If navigation is requested, orchestrate the UI transitions
    if (intent.wantsNavigation || intent.workerId) {
      console.log('[AgentChat] Detected intent:', intent);
      
      // CRITICAL: Ensure chat panel stays open throughout the entire transition
      setOpen(true);
      
      // Start button loading animation after a brief delay
      setTimeout(() => {
        // Re-assert open state in case something tried to close it
        setOpen(true);
        setButtonLoading(true);
        setNavigating(true, `Navigating to ${intent.workerName || 'submissions'}...`);
      }, 300);
      
      // After 1000ms, navigate to submissions step  
      setTimeout(() => {
        console.log('[AgentChat] Triggering navigation to submissions');
        setRequestedStep('submissions');
      }, 1000);
      
      // After 1800ms, open the worker panel if specified
      if (intent.workerId) {
        setTimeout(() => {
          console.log('[AgentChat] Opening worker panel:', intent.workerId);
          setOpenWorkerId(intent.workerId);
        }, 1800);
      }
      
      // After full duration, clear button loading
      setTimeout(() => {
        setButtonLoading(false);
        setNavigating(false);
      }, TRANSITION_DURATION);
    }

    abortControllerRef.current = new AbortController();
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortControllerRef.current.signal,
      });

      // Handle rate limit and other errors gracefully
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        
        // Handle specific error types with friendly messages
        if (resp.status === 429) {
          setMessages(prev => [
            ...prev.filter(m => !(m.role === 'assistant' && m.content === '')),
            { role: 'assistant', content: "I'm a bit busy right now. Please try again in a moment! 🙏" }
          ]);
          setIsLoading(false);
          setShowRetrieving(false);
          return;
        }
        
        if (resp.status === 402) {
          setMessages(prev => [
            ...prev.filter(m => !(m.role === 'assistant' && m.content === '')),
            { role: 'assistant', content: "AI credits are temporarily exhausted. Please try again later." }
          ]);
          setIsLoading(false);
          setShowRetrieving(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let streamDone = false;
      let firstTokenReceived = false;

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              // Mark first token received - skeleton hides when min loading also complete
              if (!firstTokenReceived) {
                firstTokenReceived = true;
                setIsStreaming(true);
              }
              
              assistantContent += content;
              // Update the last message with new content
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantContent,
                  };
                }
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, put back and wait for more
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                  newMessages[newMessages.length - 1].content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Add to agent context
      if (assistantContent) {
        addMessage({ role: 'assistant', content: assistantContent });

        // Convert Kurt's "Action Required" text into a real UI-wired confirmation.
        // This prevents the user from having to type "yes" and ensures the click
        // actually executes the drawer action.
        if (!pendingAction?.awaitingConfirmation) {
          const inferred = inferActionRequiredApproveItem(assistantContent);
          if (inferred) {
            setCurrentSuggestedAction(undefined);
            setOpen(true);
            setRequestedStep('submissions');
            setOpenWorkerId(inferred.workerId);
            setPendingAction({
              type: 'approve_item',
              workerId: inferred.workerId,
              workerName: inferred.workerName,
              awaitingConfirmation: true,
              targetedItem: inferred.targetedItem,
            });
            setAwaitingConfirmation(true);
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled - keep partial response
        return;
      }
      console.error('Kurt chat error:', error);
      
      // Show friendly error message instead of technical details
      const friendlyMessage = error.message?.includes('Rate limit') 
        ? "I'm a bit busy right now. Please try again in a moment! 🙏"
        : "Sorry, I had trouble processing that. Please try again.";
        
      setMessages(prev => [
        ...prev.filter(m => !(m.role === 'assistant' && m.content === '')),
        { role: 'assistant', content: friendlyMessage }
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setShowRetrieving(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full bg-background flex flex-col overflow-hidden border-l border-border/30 relative z-[60]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
            <span className="text-sm font-medium text-foreground">Kurt</span>
            <button 
              onClick={() => setOpen(false)} 
              className="p-1.5 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-4">
              {messages.length === 0 && !showRetrieving ? (
                <div className="pt-2">
                  <p className="text-[13px] text-muted-foreground/70">
                    Ask about payroll, workers, or submissions. Try:
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      'Approve all pending items',
                      'Show David Martinez',
                      'Mark all workers as ready',
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(suggestion)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-[12px] text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                    showInlineConfirm={
                      awaitingConfirmation &&
                      !!pendingAction &&
                      index === messages.length - 1 &&
                      message.role === 'assistant'
                    }
                    onConfirmYes={handleConfirmYes}
                    onConfirmNo={handleConfirmNo}
                  />
                ))
              )}

              {/* Enhanced skeleton loading with cool staggered animation */}
              {showRetrieving && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Status indicator */}
                  <motion.div 
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex items-center gap-2.5"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5] 
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <span className="text-xs text-muted-foreground/70 font-medium">Retrieving context...</span>
                  </motion.div>

                  {/* Content skeleton blocks with staggered fade-in */}
                  <div className="space-y-3">
                    {[
                      { width: '92%', delay: 0.15 },
                      { width: '78%', delay: 0.25 },
                      { width: '85%', delay: 0.35 },
                      { width: '65%', delay: 0.45 },
                    ].map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: line.delay, duration: 0.3, ease: "easeOut" }}
                      >
                        <Skeleton 
                          className="h-3 rounded-full" 
                          style={{ 
                            width: line.width,
                            animationDelay: `${i * 150}ms`,
                          }} 
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Simulated action buttons skeleton */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <Skeleton className="h-7 w-24 rounded-lg" />
                    <Skeleton className="h-7 w-20 rounded-lg" style={{ animationDelay: '100ms' }} />
                  </motion.div>
                </motion.div>
              )}

              {/* Suggested next action button */}
              {currentSuggestedAction && !awaitingConfirmation && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => executeSuggestedAction(currentSuggestedAction)}
                    className="text-xs h-8 gap-1.5"
                  >
                    {currentSuggestedAction.label}
                  </Button>
                </motion.div>
              )}

              {/* Navigation status */}
              {isNavigating && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground/60 flex items-center gap-1.5"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {navigationMessage || 'Navigating...'}
                </motion.p>
              )}
            </div>
          </div>

          {/* Input Area - Lovable style */}
          <div className="p-4 border-t border-border/20">
            <div className={cn(
              "relative flex items-end gap-3 rounded-2xl border bg-muted/30 px-4 py-3 transition-all",
              input.trim() ? "border-border/60" : "border-border/30",
              "focus-within:border-border/80 focus-within:bg-muted/40"
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[200px] leading-relaxed placeholder:text-muted-foreground/50"
                disabled={isLoading && !isStreaming}
              />
              
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="shrink-0 p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  title="Stop generating"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(input)}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "shrink-0 p-2 rounded-xl transition-all",
                    input.trim() 
                      ? "bg-foreground text-background hover:bg-foreground/90" 
                      : "bg-muted text-muted-foreground/40"
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Message component with markdown support
const MessageBubble: React.FC<{
  message: ChatMessage;
  isStreaming?: boolean;
  showInlineConfirm?: boolean;
  onConfirmYes?: () => void;
  onConfirmNo?: () => void;
}> = ({ message, isStreaming, showInlineConfirm, onConfirmYes, onConfirmNo }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] px-3 py-2 rounded-2xl bg-muted-foreground/10 text-foreground text-[13px] leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  // Don't render empty assistant messages (skeleton will show instead)
  if (!message.content) return null;

  // Assistant message with markdown - tight, dense styling
  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "text-[13px] text-foreground/90 leading-relaxed",
        "[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        "[&_h1]:text-sm [&_h1]:font-semibold [&_h1]:mt-3 [&_h1]:mb-1.5",
        "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
        "[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-2.5 [&_h3]:mb-1",
        "[&_ul]:my-1.5 [&_ul]:pl-4 [&_ul]:list-disc",
        "[&_ol]:my-1.5 [&_ol]:pl-4 [&_ol]:list-decimal",
        "[&_li]:my-0.5",
        "[&_strong]:font-semibold",
        "[&_code]:bg-muted/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
        "[&_pre]:bg-muted/40 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto",
      )}
    >
      <ReactMarkdown>
        {message.content || ''}
      </ReactMarkdown>
      {showInlineConfirm && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button size="sm" onClick={onConfirmYes} className="h-7 px-3 text-[11px]">
            Yes
          </Button>
          <Button size="sm" variant="outline" onClick={onConfirmNo} className="h-7 px-3 text-[11px]">
            No
          </Button>
        </div>
      )}
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-foreground/50 animate-pulse ml-0.5 rounded-sm" />
      )}
    </motion.div>
  );
};
