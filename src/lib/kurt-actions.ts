/**
 * Kurt Actions - Execute UI actions in response to intents
 * 
 * Provides safe, non-destructive UI manipulations:
 * - Navigate to routes
 * - Open/close drawers
 * - Focus elements
 * - Show toasts
 * - Trigger controlled state changes
 */

import { toast } from '@/hooks/use-toast';
import type { NavigateFunction } from 'react-router-dom';

export interface KurtActions {
  navigateTo(route: string, params?: any): void;
  openDrawer(id: string, params?: any): void;
  click(selector: string): void;
  setField(selector: string, value: string): void;
  toast(kind: 'info' | 'success' | 'warn' | 'error', msg: string): void;
  scrollTo(selector: string): void;
  highlightElement(selector: string): void;
}

export interface ActionResult {
  success: boolean;
  message: string;
  action?: string;
}

/**
 * Create Kurt actions bound to router and DOM
 */
export function createKurtActions(navigate: NavigateFunction): KurtActions {
  return {
    navigateTo(route: string, params?: any) {
      console.log('[Kurt Action] Navigate to:', route, params);
      
      // Build route with query params if provided
      let fullRoute = route;
      if (params) {
        const searchParams = new URLSearchParams(params).toString();
        fullRoute = `${route}?${searchParams}`;
      }
      
      navigate(fullRoute);
    },
    
    openDrawer(id: string, params?: any) {
      console.log('[Kurt Action] Open drawer:', id, params);
      
      // Find and trigger drawer/modal
      const drawerTrigger = document.querySelector(`[data-drawer-id="${id}"]`);
      if (drawerTrigger instanceof HTMLElement) {
        drawerTrigger.click();
      }
    },
    
    click(selector: string) {
      console.log('[Kurt Action] Click:', selector);
      
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        element.click();
      }
    },
    
    setField(selector: string, value: string) {
      console.log('[Kurt Action] Set field:', selector, value);
      
      const element = document.querySelector(selector);
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    
    toast(kind: 'info' | 'success' | 'warn' | 'error', msg: string) {
      console.log('[Kurt Action] Toast:', kind, msg);
      
      const variantMap = {
        info: undefined,
        success: undefined,
        warn: 'destructive' as const,
        error: 'destructive' as const
      };
      
      toast({
        variant: variantMap[kind],
        title: kind === 'error' || kind === 'warn' ? 'Warning' : 'Info',
        description: msg,
      });
    },
    
    scrollTo(selector: string) {
      console.log('[Kurt Action] Scroll to:', selector);
      
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    
    highlightElement(selector: string) {
      console.log('[Kurt Action] Highlight:', selector);
      
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        // Add temporary highlight class
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }
  };
}

/**
 * Execute action for matched intent
 */
export async function executeIntentAction(
  intent: string,
  entities: Record<string, string>,
  actions: KurtActions
): Promise<ActionResult> {
  console.log('[Kurt] Executing intent:', intent, entities);
  
  try {
    switch (intent) {
      case 'open_pipeline':
        actions.click('[data-testid="tab-pipeline"]');
        return {
          success: true,
          message: 'Opened pipeline view',
          action: 'tab_switch'
        };
      
      case 'open_metrics':
        actions.click('[data-testid="tab-metrics"]');
        return {
          success: true,
          message: 'Opened metrics view',
          action: 'tab_switch'
        };
      
      case 'draft_contract':
        if (entities.person) {
          actions.toast('info', `Focusing draft button for ${entities.person}`);
          actions.highlightElement('[data-testid="draft-contract"]');
        } else {
          actions.navigateTo('/flows/contract-flow');
        }
        return {
          success: true,
          message: entities.person 
            ? `Highlighted draft button for ${entities.person}`
            : 'Navigated to contract flow',
          action: 'navigate'
        };
      
      case 'review_signatures':
        actions.toast('info', 'Opening signature review panel');
        actions.click('[data-testid="review-signatures"]');
        return {
          success: true,
          message: 'Opened signature review',
          action: 'drawer_open'
        };
      
      case 'send_for_signature':
        actions.toast('warn', 'Send for signature requires confirmation');
        actions.highlightElement('[data-testid="send-signature"]');
        return {
          success: true,
          message: 'Highlighted send button - click to confirm',
          action: 'highlight'
        };
      
      case 'open_candidate_form':
        if (entities.person) {
          actions.toast('info', `Opening form for ${entities.person}`);
          actions.openDrawer('candidate-form', { person: entities.person });
        }
        return {
          success: true,
          message: `Opened form for ${entities.person || 'candidate'}`,
          action: 'drawer_open'
        };
      
      case 'start_onboarding_for_candidate':
        if (entities.person) {
          actions.toast('success', `Starting onboarding for ${entities.person}`);
          actions.click(`[data-testid="onboard-${entities.person.toLowerCase().split(' ')[0]}"]`);
        } else {
          actions.navigateTo('/flows/candidate-onboarding');
        }
        return {
          success: true,
          message: `Started onboarding for ${entities.person || 'candidate'}`,
          action: 'trigger'
        };
      
      case 'open_checklist':
        if (entities.person) {
          actions.navigateTo('/flows/candidate-dashboard', { 
            tab: 'checklist',
            person: entities.person 
          });
        } else {
          actions.navigateTo('/flows/candidate-dashboard', { tab: 'checklist' });
        }
        return {
          success: true,
          message: 'Opened checklist view',
          action: 'navigate'
        };
      
      case 'complete_checklist_task':
        if (entities.task) {
          actions.toast('success', `Marking "${entities.task}" as complete`);
          actions.click(`[data-testid="task-${entities.task.replace(/\s+/g, '-')}"]`);
        }
        return {
          success: true,
          message: `Completed task: ${entities.task || 'task'}`,
          action: 'toggle'
        };
      
      case 'view_certificate':
        if (entities.person) {
          actions.toast('info', `Viewing certificate for ${entities.person}`);
        }
        actions.navigateTo('/flows/candidate-dashboard', { tab: 'checklist', section: 'certificates' });
        return {
          success: true,
          message: 'Navigated to certificates',
          action: 'navigate'
        };
      
      case 'go_to_step':
        if (entities.step === 'next') {
          actions.click('[data-testid="next-step"]');
        } else if (entities.step === 'previous') {
          actions.click('[data-testid="prev-step"]');
        } else if (entities.step) {
          actions.toast('info', `Navigating to step ${entities.step}`);
          actions.scrollTo(`[data-testid="step-${entities.step}"]`);
        }
        return {
          success: true,
          message: `Navigated to step ${entities.step || ''}`,
          action: 'navigate'
        };
      
      case 'search_people':
        if (entities.person) {
          actions.toast('info', `Searching for ${entities.person}`);
          actions.highlightElement(`[data-person="${entities.person}"]`);
          actions.scrollTo(`[data-person="${entities.person}"]`);
        }
        return {
          success: true,
          message: `Found ${entities.person || 'person'}`,
          action: 'search'
        };
      
      case 'show_status':
        const path = window.location.pathname;
        let contextMsg = 'Viewing the dashboard';
        
        if (path.includes('contract-flow')) {
          contextMsg = 'In Contract Flow - preparing contracts';
        } else if (path.includes('candidate-onboarding')) {
          contextMsg = 'In Candidate Onboarding - collecting data';
        } else if (path.includes('candidate-dashboard')) {
          contextMsg = 'In Candidate Dashboard - tracking progress';
        }
        
        actions.toast('info', contextMsg);
        return {
          success: true,
          message: contextMsg,
          action: 'status'
        };
      
      case 'help':
        const helpMsg = `I can help with:\n• Pipeline & metrics\n• Contract drafting & signatures\n• Candidate onboarding\n• Checklist tasks\n• Navigation`;
        actions.toast('info', helpMsg);
        return {
          success: true,
          message: 'Showing available actions',
          action: 'help'
        };
      
      default:
        actions.toast('warn', 'I\'m not sure how to help with that yet.');
        return {
          success: false,
          message: 'Unknown intent',
          action: 'unknown'
        };
    }
  } catch (error) {
    console.error('[Kurt] Action error:', error);
    actions.toast('error', 'Something went wrong executing that action');
    
    return {
      success: false,
      message: 'Action failed',
      action: 'error'
    };
  }
}
