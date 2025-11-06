/**
 * Bridge hook to gradually migrate from useFlowState to useOnboardingStore
 * This maintains the same API while using the persistent store underneath
 */
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCallback } from 'react';

export const useAdminFlowBridge = () => {
  const {
    adminFlow,
    setAdminCurrentStep,
    setAdminExpandedStep,
    completeAdminStep,
    updateAdminStepData,
    getAdminStepData,
    getAdminStepStatus,
  } = useOnboardingStore();

  // Bridge the old API to the new store
  const state = {
    currentStep: adminFlow.currentStep,
    completedSteps: adminFlow.completedSteps,
    formData: adminFlow.stepData,
    events: [], // Legacy field, no longer used
  };

  const updateFormData = useCallback((data: Record<string, any>) => {
    // Update the current step's data
    updateAdminStepData(adminFlow.currentStep, data);
  }, [adminFlow.currentStep, updateAdminStepData]);

  const completeStep = useCallback((stepId: string) => {
    completeAdminStep(stepId);
  }, [completeAdminStep]);

  const goToStep = useCallback((stepId: string) => {
    setAdminCurrentStep(stepId);
  }, [setAdminCurrentStep]);

  const logEvent = useCallback((
    step: string,
    actor: "user" | "genie" | "system",
    action: string,
    payload?: Record<string, any>
  ) => {
    // Legacy function, now a no-op (logging can be added if needed)
    console.log('[Flow Event]', { step, actor, action, payload });
  }, []);

  return {
    state,
    logEvent,
    updateFormData,
    completeStep,
    goToStep,
    // Also expose store-specific methods
    expandedStep: adminFlow.expandedStep,
    setExpandedStep: setAdminExpandedStep,
    getStepData: getAdminStepData,
    getStepStatus: getAdminStepStatus,
  };
};
