import { create } from 'zustand';

interface PayrollMetrics {
  batchCount: number;
  totalGross: number;
  fxVariance: number;
  executingCount: number;
  paidCount: number;
  readyCount: number;
  lastUpdated: Date;
}

interface PayrollState {
  metrics: PayrollMetrics;
  updateMetrics: (updates: Partial<PayrollMetrics>) => void;
  incrementExecuting: () => void;
  incrementPaid: () => void;
  decrementExecuting: () => void;
  reset: () => void;
}

const defaultMetrics: PayrollMetrics = {
  batchCount: 0,
  totalGross: 0,
  fxVariance: 2.3,
  executingCount: 0,
  paidCount: 0,
  readyCount: 0,
  lastUpdated: new Date(),
};

export const usePayrollState = create<PayrollState>((set) => ({
  metrics: defaultMetrics,
  
  updateMetrics: (updates) => 
    set((state) => ({
      metrics: {
        ...state.metrics,
        ...updates,
        lastUpdated: new Date(),
      },
    })),
  
  incrementExecuting: () =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        executingCount: state.metrics.executingCount + 1,
        readyCount: Math.max(0, state.metrics.readyCount - 1),
        lastUpdated: new Date(),
      },
    })),
  
  incrementPaid: () =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        paidCount: state.metrics.paidCount + 1,
        executingCount: Math.max(0, state.metrics.executingCount - 1),
        lastUpdated: new Date(),
      },
    })),
  
  decrementExecuting: () =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        executingCount: Math.max(0, state.metrics.executingCount - 1),
        lastUpdated: new Date(),
      },
    })),
  
  reset: () => set({ metrics: defaultMetrics }),
}));
