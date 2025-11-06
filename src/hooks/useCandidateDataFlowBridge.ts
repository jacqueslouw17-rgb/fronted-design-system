/**
 * Bridge hook for Candidate Data Collection flow
 * Connects to useOnboardingStore for persistent state management
 */
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCallback } from 'react';

export const useCandidateDataFlowBridge = () => {
  const {
    candidateDataFlow,
    setCandidateDataCurrentStep,
    setCandidateDataExpandedStep,
    completeCandidateDataStep,
    updateCandidateDataStepData,
    getCandidateDataStepData,
    getCandidateDataStepStatus,
  } = useOnboardingStore();

  // Bridge the old API to the new store
  const state = {
    currentStep: candidateDataFlow.currentStep,
    completedSteps: candidateDataFlow.completedSteps,
    formData: candidateDataFlow.stepData,
  };

  const updateFormData = useCallback((data: Record<string, any>) => {
    // Update the current step's data
    updateCandidateDataStepData(candidateDataFlow.currentStep, data);
  }, [candidateDataFlow.currentStep, updateCandidateDataStepData]);

  const completeStep = useCallback((stepId: string) => {
    completeCandidateDataStep(stepId);
  }, [completeCandidateDataStep]);

  const goToStep = useCallback((stepId: string) => {
    setCandidateDataCurrentStep(stepId);
  }, [setCandidateDataCurrentStep]);

  return {
    state,
    updateFormData,
    completeStep,
    goToStep,
    // Also expose store-specific methods
    expandedStep: candidateDataFlow.expandedStep,
    setExpandedStep: setCandidateDataExpandedStep,
    getStepData: getCandidateDataStepData,
    getStepStatus: getCandidateDataStepStatus,
  };
};
