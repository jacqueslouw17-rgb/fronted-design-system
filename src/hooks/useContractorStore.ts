import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "trigger-onboarding" | "onboarding-pending" | "CERTIFIED" | "PAYROLL_PENDING" | "IN_BATCH" | "EXECUTING" | "PAID" | "ON_HOLD";
  formSent?: boolean;
  dataReceived?: boolean;
  employmentType?: "contractor" | "employee";
}

interface ContractorStore {
  contractors: Contractor[];
  setContractors: (contractors: Contractor[]) => void;
  updateContractor: (id: string, updates: Partial<Contractor>) => void;
  getContractorsByStatus: (status: Contractor['status']) => Contractor[];
  getCertifiedCount: () => number;
  getInBatchCount: () => number;
  getPayrollCount: () => number;
}

export const useContractorStore = create<ContractorStore>()(
  persist(
    (set, get) => ({
      contractors: [],
      
      setContractors: (contractors) => set({ contractors }),
      
      updateContractor: (id, updates) => set((state) => ({
        contractors: state.contractors.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      getContractorsByStatus: (status) => {
        return get().contractors.filter((c) => c.status === status);
      },
      
      getCertifiedCount: () => {
        return get().contractors.filter((c) => c.status === "CERTIFIED").length;
      },
      
  getInBatchCount: () => {
    return get().contractors.filter((c) => c.status === "IN_BATCH").length;
  },
  
  getPayrollCount: () => {
    return get().contractors.filter((c) => 
      c.status === "IN_BATCH" || c.status === "EXECUTING" || c.status === "PAID"
    ).length;
  },
    }),
    {
      name: 'contractor-storage',
    }
  )
);
