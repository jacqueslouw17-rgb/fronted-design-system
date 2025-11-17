/**
 * Flow Registry
 * 
 * Central registry for all flows in the application.
 * Tracks locked status to prevent structural, design, or logic changes.
 * 
 * LOCKED FLOWS are finalized and should NOT be modified for:
 * - Structural changes (adding/removing steps)
 * - Design changes (styling, layout)
 * - Logic changes (validation, flow control)
 * - Batch updates or pattern-level edits
 * 
 * To unlock a flow, update the `locked` property to false.
 */

export interface FlowMetadata {
  id: string;
  title: string;
  path: string;
  locked: boolean;
  lockedDate?: string;
  lockedReason?: string;
  filePaths: string[];
}

export const FLOW_REGISTRY: Record<string, FlowMetadata> = {
  'f1-admin-onboarding': {
    id: 'f1-admin-onboarding',
    title: 'Flow 1 — Admin Onboarding',
    path: '/flows/admin/onboarding',
    locked: true,
    lockedDate: '2025-01-13',
    lockedReason: 'Finalized for backend integration. Structure, design, and logic frozen.',
    filePaths: [
      'src/pages/flows/AdminOnboarding.tsx',
      'src/components/flows/onboarding/Step1IntroTrust.tsx',
      'src/components/flows/onboarding/Step2OrgProfileSimplified.tsx',
      'src/components/flows/onboarding/Step3Localization.tsx',
      'src/components/flows/onboarding/Step4Integrations.tsx',
      'src/components/flows/onboarding/Step5MiniRules.tsx',
      'src/components/flows/onboarding/Step6Pledge.tsx',
      'src/components/flows/onboarding/Step7Finish.tsx'
    ]
  },
  'f3-candidate-onboarding': {
    id: 'f3-candidate-onboarding',
    title: 'Flow 3 — Candidate Data Collection',
    path: '/flows/candidate-onboarding',
    locked: true,
    lockedDate: '2025-01-13',
    lockedReason: 'Finalized for backend integration. Structure, design, and logic frozen.',
    filePaths: [
      'src/pages/CandidateOnboarding.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep2PersonalDetails.tsx'
    ]
  },
  'f4-candidate-onboarding-flow': {
    id: 'f4-candidate-onboarding-flow',
    title: 'Flow 4 — Candidate Onboarding',
    path: '/flows/candidate-onboarding-flow',
    locked: true,
    lockedDate: '2025-01-14',
    lockedReason: 'Locked for backend build — no further changes allowed.',
    filePaths: [
      'src/pages/CandidateOnboardingFlow.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep2Personal.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep2WorkPay.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep3Tax.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep4Bank.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep5Emergency.tsx',
      'src/components/flows/candidate-onboarding/CandidateStep6Review.tsx'
    ]
  },
  'f5-candidate-dashboard': {
    id: 'f5-candidate-dashboard',
    title: 'Flow 5 — Candidate Dashboard',
    path: '/flows/candidate-dashboard',
    locked: true,
    lockedDate: '2025-01-14',
    lockedReason: 'Finalized contract flow with signing sub-statuses and document management. All steps, patterns, and screens frozen.',
    filePaths: [
      'src/pages/flows/CandidateDashboard.tsx',
      'src/components/contract-flow/ContractPreviewDrawer.tsx'
    ]
  },
  'f5-1-employee-payroll': {
    id: 'f5-1-employee-payroll',
    title: 'Flow 5.1 — Employee Payroll',
    path: '/flows/employee-payroll',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/EmployeePayroll.tsx'
    ]
  },
  'f5-2-contractor-payroll': {
    id: 'f5-2-contractor-payroll',
    title: 'Flow 5.2 — Contractor Payroll',
    path: '/flows/contractor-payroll',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/ContractorPayroll.tsx'
    ]
  }
};

/**
 * Check if a flow is locked
 */
export const isFlowLocked = (flowId: string): boolean => {
  return FLOW_REGISTRY[flowId]?.locked ?? false;
};

/**
 * Get flow metadata
 */
export const getFlowMetadata = (flowId: string): FlowMetadata | undefined => {
  return FLOW_REGISTRY[flowId];
};

/**
 * Get all locked flows
 */
export const getLockedFlows = (): FlowMetadata[] => {
  return Object.values(FLOW_REGISTRY).filter(flow => flow.locked);
};
