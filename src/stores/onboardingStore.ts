import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StepStatus = 'inactive' | 'active' | 'completed';

interface StepData {
  [key: string]: any;
}

interface OnboardingState {
  // Admin Onboarding (Flow 1)
  adminFlow: {
    currentStep: string;
    completedSteps: string[];
    stepData: Record<string, StepData>;
    expandedStep: string | null;
  };
  
  // Candidate Data Collection (Flow 3)
  candidateDataFlow: {
    currentStep: string;
    completedSteps: string[];
    stepData: Record<string, StepData>;
    expandedStep: string | null;
  };
  
  // Candidate Onboarding (Flow 4)
  candidateOnboardingFlow: {
    currentStep: string;
    completedSteps: string[];
    stepData: Record<string, StepData>;
    expandedStep: string | null;
  };
}

interface OnboardingActions {
  // Admin Flow Actions
  setAdminCurrentStep: (step: string) => void;
  setAdminExpandedStep: (step: string | null) => void;
  completeAdminStep: (step: string) => void;
  updateAdminStepData: (step: string, data: StepData) => void;
  getAdminStepData: (step: string) => StepData;
  getAdminStepStatus: (step: string) => StepStatus;
  resetAdminFlow: () => void;
  
  // Candidate Data Flow Actions
  setCandidateDataCurrentStep: (step: string) => void;
  setCandidateDataExpandedStep: (step: string | null) => void;
  completeCandidateDataStep: (step: string) => void;
  updateCandidateDataStepData: (step: string, data: StepData) => void;
  getCandidateDataStepData: (step: string) => StepData;
  getCandidateDataStepStatus: (step: string) => StepStatus;
  resetCandidateDataFlow: () => void;
  
  // Candidate Onboarding Flow Actions
  setCandidateOnboardingCurrentStep: (step: string) => void;
  setCandidateOnboardingExpandedStep: (step: string | null) => void;
  completeCandidateOnboardingStep: (step: string) => void;
  updateCandidateOnboardingStepData: (step: string, data: StepData) => void;
  getCandidateOnboardingStepData: (step: string) => StepData;
  getCandidateOnboardingStepStatus: (step: string) => StepStatus;
  resetCandidateOnboardingFlow: () => void;
}

const initialAdminFlow = {
  currentStep: 'intro_trust_model',
  completedSteps: [],
  stepData: {},
  expandedStep: 'intro_trust_model',
};

const initialCandidateDataFlow = {
  currentStep: 'welcome',
  completedSteps: [],
  stepData: {},
  expandedStep: null,
};

const initialCandidateOnboardingFlow = {
  currentStep: 'welcome',
  completedSteps: [],
  stepData: {},
  expandedStep: 'welcome',
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      // Initial State
      adminFlow: initialAdminFlow,
      candidateDataFlow: initialCandidateDataFlow,
      candidateOnboardingFlow: initialCandidateOnboardingFlow,

      // Admin Flow Actions
      setAdminCurrentStep: (step) =>
        set((state) => ({
          adminFlow: { ...state.adminFlow, currentStep: step },
        })),

      setAdminExpandedStep: (step) =>
        set((state) => ({
          adminFlow: { ...state.adminFlow, expandedStep: step },
        })),

      completeAdminStep: (step) =>
        set((state) => ({
          adminFlow: {
            ...state.adminFlow,
            completedSteps: state.adminFlow.completedSteps.includes(step)
              ? state.adminFlow.completedSteps
              : [...state.adminFlow.completedSteps, step],
          },
        })),

      updateAdminStepData: (step, data) =>
        set((state) => ({
          adminFlow: {
            ...state.adminFlow,
            stepData: {
              ...state.adminFlow.stepData,
              [step]: {
                ...state.adminFlow.stepData[step],
                ...data,
              },
            },
          },
        })),

      getAdminStepData: (step) => {
        return get().adminFlow.stepData[step] || {};
      },

      getAdminStepStatus: (step): StepStatus => {
        const state = get().adminFlow;
        if (state.completedSteps.includes(step)) return 'completed';
        if (state.currentStep === step) return 'active';
        return 'inactive';
      },

      resetAdminFlow: () =>
        set(() => ({
          adminFlow: initialAdminFlow,
        })),

      // Candidate Data Flow Actions
      setCandidateDataCurrentStep: (step) =>
        set((state) => ({
          candidateDataFlow: { ...state.candidateDataFlow, currentStep: step },
        })),

      setCandidateDataExpandedStep: (step) =>
        set((state) => ({
          candidateDataFlow: { ...state.candidateDataFlow, expandedStep: step },
        })),

      completeCandidateDataStep: (step) =>
        set((state) => ({
          candidateDataFlow: {
            ...state.candidateDataFlow,
            completedSteps: state.candidateDataFlow.completedSteps.includes(step)
              ? state.candidateDataFlow.completedSteps
              : [...state.candidateDataFlow.completedSteps, step],
          },
        })),

      updateCandidateDataStepData: (step, data) =>
        set((state) => ({
          candidateDataFlow: {
            ...state.candidateDataFlow,
            stepData: {
              ...state.candidateDataFlow.stepData,
              [step]: {
                ...state.candidateDataFlow.stepData[step],
                ...data,
              },
            },
          },
        })),

      getCandidateDataStepData: (step) => {
        return get().candidateDataFlow.stepData[step] || {};
      },

      getCandidateDataStepStatus: (step): StepStatus => {
        const state = get().candidateDataFlow;
        if (state.completedSteps.includes(step)) return 'completed';
        if (state.currentStep === step) return 'active';
        return 'inactive';
      },

      resetCandidateDataFlow: () =>
        set(() => ({
          candidateDataFlow: initialCandidateDataFlow,
        })),

      // Candidate Onboarding Flow Actions
      setCandidateOnboardingCurrentStep: (step) =>
        set((state) => ({
          candidateOnboardingFlow: { ...state.candidateOnboardingFlow, currentStep: step },
        })),

      setCandidateOnboardingExpandedStep: (step) =>
        set((state) => ({
          candidateOnboardingFlow: { ...state.candidateOnboardingFlow, expandedStep: step },
        })),

      completeCandidateOnboardingStep: (step) =>
        set((state) => ({
          candidateOnboardingFlow: {
            ...state.candidateOnboardingFlow,
            completedSteps: state.candidateOnboardingFlow.completedSteps.includes(step)
              ? state.candidateOnboardingFlow.completedSteps
              : [...state.candidateOnboardingFlow.completedSteps, step],
          },
        })),

      updateCandidateOnboardingStepData: (step, data) =>
        set((state) => ({
          candidateOnboardingFlow: {
            ...state.candidateOnboardingFlow,
            stepData: {
              ...state.candidateOnboardingFlow.stepData,
              [step]: {
                ...state.candidateOnboardingFlow.stepData[step],
                ...data,
              },
            },
          },
        })),

      getCandidateOnboardingStepData: (step) => {
        return get().candidateOnboardingFlow.stepData[step] || {};
      },

      getCandidateOnboardingStepStatus: (step): StepStatus => {
        const state = get().candidateOnboardingFlow;
        if (state.completedSteps.includes(step)) return 'completed';
        if (state.currentStep === step) return 'active';
        return 'inactive';
      },

      resetCandidateOnboardingFlow: () =>
        set(() => ({
          candidateOnboardingFlow: initialCandidateOnboardingFlow,
        })),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        adminFlow: state.adminFlow,
        candidateDataFlow: state.candidateDataFlow,
        candidateOnboardingFlow: state.candidateOnboardingFlow,
      }),
    }
  )
);
