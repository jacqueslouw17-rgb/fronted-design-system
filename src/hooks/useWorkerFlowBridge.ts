/**
 * Bridge hook for Worker/Candidate Onboarding flow
 * Connects to useOnboardingStore for persistent state management
 */
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCallback } from 'react';

export const useWorkerFlowBridge = () => {
  const {
    candidateOnboardingFlow,
    setCandidateOnboardingCurrentStep,
    setCandidateOnboardingExpandedStep,
    completeCandidateOnboardingStep,
    updateCandidateOnboardingStepData,
    getCandidateOnboardingStepData,
    getCandidateOnboardingStepStatus,
  } = useOnboardingStore();

  // Bridge the old API to the new store
  const state = {
    currentStep: candidateOnboardingFlow.currentStep,
    completedSteps: candidateOnboardingFlow.completedSteps,
    formData: candidateOnboardingFlow.stepData,
  };

  const updateFormData = useCallback((data: Record<string, any>) => {
    // Update the current step's data
    updateCandidateOnboardingStepData(candidateOnboardingFlow.currentStep, data);
  }, [candidateOnboardingFlow.currentStep, updateCandidateOnboardingStepData]);

  const completeStep = useCallback((stepId: string) => {
    completeCandidateOnboardingStep(stepId);
  }, [completeCandidateOnboardingStep]);

  const goToStep = useCallback((stepId: string) => {
    setCandidateOnboardingCurrentStep(stepId);
  }, [setCandidateOnboardingCurrentStep]);

  return {
    state,
    updateFormData,
    completeStep,
    goToStep,
    // Also expose store-specific methods
    expandedStep: candidateOnboardingFlow.expandedStep,
    setExpandedStep: setCandidateOnboardingExpandedStep,
    getStepData: getCandidateOnboardingStepData,
    getStepStatus: getCandidateOnboardingStepStatus,
  };
};
