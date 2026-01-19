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
  hidden?: boolean;
}

export const FLOW_REGISTRY: Record<string, FlowMetadata> = {
  'f1-admin-onboarding': {
    id: 'f1-admin-onboarding',
    title: 'Flow 2.1 - Company Admin Onboarding',
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
  'f3-candidate-data-v2': {
    id: 'f3-candidate-data-v2',
    title: 'Flow 2 — Candidate Data Collection v2',
    path: '/flows/candidate-data-collection-v2',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/CandidateDataCollectionV2.tsx'
    ],
    hidden: true
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
  'f5-candidate-dashboard-v2': {
    id: 'f5-candidate-dashboard-v2',
    title: 'Flow 4 — Candidate Dashboard v2',
    path: '/flows/candidate-dashboard-v2',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/CandidateDashboardV2.tsx',
      'src/pages/CandidateProfileSettingsV2.tsx',
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
  },
  'f2-1-admin-contracting-multi-company': {
    id: 'f2-1-admin-contracting-multi-company',
    title: 'Flow 2.1 — Admin Contracting (Multi-Company)',
    path: '/flows/contract-flow-multi-company',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/AdminContractingMultiCompany.tsx'
    ]
  },
  'f1.1-fronted-admin': {
    id: 'f1.1-fronted-admin',
    title: 'Flow 1.1 — Fronted Admin Dashboard v2',
    path: '/flows/contract-flow-multi-company',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/AdminContractingMultiCompany.tsx',
      'src/components/contract-flow/PipelineView.tsx',
      'src/components/contract-flow/AddCandidateDrawer.tsx',
      'src/components/contract-flow/OnboardingFormDrawer.tsx',
      'src/components/flows/onboarding/EmbeddedAdminOnboarding.tsx',
      'src/components/flows/onboarding/Step2OrgProfileSimplified.tsx',
      'src/components/flows/onboarding/Step7Finish.tsx'
    ]
  },
  'f5-company-admin-onboarding': {
    id: 'f5-company-admin-onboarding',
    title: 'Flow 5 — Company Admin Onboarding v1 - old',
    path: '/flows/company-admin-onboarding',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/CompanyAdminOnboarding.tsx',
      'src/components/flows/onboarding/Step2OrgProfileSimplified.tsx',
      'src/components/flows/onboarding/Step3Localization.tsx',
      'src/components/flows/onboarding/Step7Finish.tsx'
    ],
    hidden: true
  },
  'f6-company-admin-dashboard': {
    id: 'f6-company-admin-dashboard',
    title: 'Flow 6 — Company Admin Dashboard v1',
    path: '/flows/company-admin-dashboard',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/CompanyAdminDashboard.tsx'
    ]
  },
  'f6-company-admin-dashboard-v2': {
    id: 'f6-company-admin-dashboard-v2',
    title: 'Flow 6 — Company Admin Dashboard v2',
    path: '/flows/company-admin-dashboard-v2',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/CompanyAdminDashboardV2.tsx'
    ]
  },
  'f1.1-fronted-admin-v3': {
    id: 'f1.1-fronted-admin-v3',
    title: 'Flow 1 — Fronted Admin Dashboard v3',
    path: '/flows/contract-flow-multi-company-v3',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/AdminContractingMultiCompanyV3.tsx',
      'src/components/contract-flow/PipelineView.tsx',
      'src/components/contract-flow/AddCandidateDrawer.tsx',
      'src/components/contract-flow/OnboardingFormDrawer.tsx',
      'src/components/flows/onboarding/EmbeddedAdminOnboarding.tsx',
      'src/components/flows/onboarding/Step2OrgProfileSimplified.tsx',
      'src/components/flows/onboarding/Step7Finish.tsx'
    ]
  },
  'f4.1-employee-dashboard-v3': {
    id: 'f4.1-employee-dashboard-v3',
    title: 'Flow 4.1 — Employee Dashboard v3',
    path: '/candidate-dashboard-employee-v3',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/F41v3_EmployeeDashboardPage.tsx',
      'src/stores/F41v3_DashboardStore.ts'
    ]
  },
  'f4.2-contractor-dashboard-v3': {
    id: 'f4.2-contractor-dashboard-v3',
    title: 'Flow 4.2 — Contractor Dashboard v3',
    path: '/candidate-dashboard-contractor-v3',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/F42v3_ContractorDashboardPage.tsx',
      'src/stores/F42v3_DashboardStore.ts'
    ]
  },
  'f4.2-contractor-dashboard-v4': {
    id: 'f4.2-contractor-dashboard-v4',
    title: 'Flow 4.2 — Contractor Dashboard v4',
    path: '/candidate-dashboard-contractor-v4',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/F42v4_ContractorDashboardPage.tsx',
      'src/stores/F42v4_DashboardStore.ts'
    ]
  },
  'shared-secure-link-error': {
    id: 'shared-secure-link-error',
    title: 'Shared – Secure Link Error (403)',
    path: '/secure-link-error',
    locked: false,
    lockedDate: undefined,
    lockedReason: undefined,
    filePaths: [
      'src/pages/flows/SecureLinkError.tsx'
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
