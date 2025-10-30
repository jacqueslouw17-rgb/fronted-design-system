import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PayrollIssueType = 'fx_failure' | 'missing_doc' | 'policy_violation' | 'date_change';

export interface PayrollIssue {
  id: string;
  contractorId: string;
  contractorName: string;
  type: PayrollIssueType;
  severity: 'red' | 'yellow' | 'blue';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface PayrollChecklistItem {
  id: string;
  label: string;
  status: 'pending' | 'complete' | 'waiting';
  timestamp?: string;
  kurtMessage?: string;
}

export interface ContractorPayrollStatus {
  id: string;
  name: string;
  country: string;
  flag: string;
  checklist: PayrollChecklistItem[];
  progress: number;
  issues: PayrollIssue[];
  lastUpdated: string;
}

interface PayrollSyncStore {
  contractors: ContractorPayrollStatus[];
  issues: PayrollIssue[];
  addIssue: (issue: Omit<PayrollIssue, 'id' | 'timestamp'>) => void;
  resolveIssue: (issueId: string) => void;
  updateChecklistItem: (contractorId: string, itemId: string, status: PayrollChecklistItem['status'], kurtMessage?: string) => void;
  addContractor: (contractor: Omit<ContractorPayrollStatus, 'lastUpdated'>) => void;
  getContractorStatus: (contractorId: string) => ContractorPayrollStatus | undefined;
}

export const usePayrollSync = create<PayrollSyncStore>()(
  persist(
    (set, get) => ({
      contractors: [],
      issues: [],

      addIssue: (issue) => {
        const newIssue: PayrollIssue = {
          ...issue,
          id: `issue_${Date.now()}_${Math.random()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          issues: [...state.issues, newIssue],
        }));
      },

      resolveIssue: (issueId) => {
        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.id === issueId ? { ...issue, resolved: true } : issue
          ),
        }));
      },

      updateChecklistItem: (contractorId, itemId, status, kurtMessage) => {
        set((state) => ({
          contractors: state.contractors.map((contractor) => {
            if (contractor.id !== contractorId) return contractor;

            const updatedChecklist = contractor.checklist.map((item) =>
              item.id === itemId
                ? { ...item, status, timestamp: new Date().toISOString(), kurtMessage }
                : item
            );

            const completedItems = updatedChecklist.filter((item) => item.status === 'complete').length;
            const progress = Math.round((completedItems / updatedChecklist.length) * 100);

            return {
              ...contractor,
              checklist: updatedChecklist,
              progress,
              lastUpdated: new Date().toISOString(),
            };
          }),
        }));
      },

      addContractor: (contractor) => {
        const newContractor: ContractorPayrollStatus = {
          ...contractor,
          lastUpdated: new Date().toISOString(),
        };
        set((state) => ({
          contractors: [...state.contractors, newContractor],
        }));
      },

      getContractorStatus: (contractorId) => {
        return get().contractors.find((c) => c.id === contractorId);
      },
    }),
    {
      name: 'payroll-sync',
      partialize: (state) => ({
        contractors: state.contractors,
        issues: state.issues,
      }),
    }
  )
);
