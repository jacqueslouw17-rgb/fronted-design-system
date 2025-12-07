/**
 * Flow 4.1 — Employee Dashboard v3 Store
 * 
 * Namespaced store for Employee Dashboard v3.
 * Includes T-5 confirmation and adjustment state.
 */

import { create } from 'zustand';

export type WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type AdjustmentType = 'Expense' | 'Overtime' | 'Bonus' | 'Correction';
export type AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface LineItem {
  type: 'Earnings' | 'Deduction';
  label: string;
  amount: number;
  locked: boolean;
}

export interface EmployerCost {
  label: string;
  amount: number;
}

export interface Adjustment {
  id: string;
  type: AdjustmentType;
  label: string;
  amount: number | null;
  status: AdjustmentStatus;
  description?: string;
  category?: string;
  hours?: number;
  receiptUrl?: string;
  submittedAt: string;
}

interface F41v3_DashboardState {
  dashboard_context: 'employee_v3';
  isLoading: boolean;
  
  // Pay data
  nextPayoutDate: string;
  periodLabel: string;
  estimatedNet: number;
  currency: string;
  countryRuleLocks: string[];
  lineItems: LineItem[];
  employerCosts: EmployerCost[];
  windowState: WindowState;
  confirmed: boolean;
  adjustments: Adjustment[];
  
  // Computed
  daysUntilClose: number;
}

interface F41v3_DashboardActions {
  setLoading: (loading: boolean) => void;
  confirmPay: () => void;
  addAdjustment: (adjustment: Omit<Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  reset: () => void;
}

const initialState: F41v3_DashboardState = {
  dashboard_context: 'employee_v3',
  isLoading: false,
  
  // Mock data matching the spec
  nextPayoutDate: '2026-01-05',
  periodLabel: 'Dec 1 – Dec 31',
  estimatedNet: 42166.67,
  currency: 'PHP',
  countryRuleLocks: ['Income Tax', 'SSS', 'PhilHealth', 'Pag-IBIG'],
  lineItems: [
    { type: 'Earnings', label: 'Base Salary', amount: 50000, locked: false },
    { type: 'Earnings', label: '13th Month (pro-rated)', amount: 4166.67, locked: false },
    { type: 'Deduction', label: 'Income Tax', amount: -7500, locked: true },
    { type: 'Deduction', label: 'SSS Employee', amount: -2250, locked: true },
    { type: 'Deduction', label: 'PhilHealth Employee', amount: -1250, locked: true },
    { type: 'Deduction', label: 'Pag-IBIG Employee', amount: -1000, locked: true },
  ],
  employerCosts: [
    { label: 'SSS Employer', amount: 4750 },
    { label: 'PhilHealth Employer', amount: 1250 },
    { label: 'Pag-IBIG Employer', amount: 1000 },
  ],
  windowState: 'OPEN',
  confirmed: false,
  adjustments: [],
  daysUntilClose: 3,
};

export const useF41v3_DashboardStore = create<F41v3_DashboardState & F41v3_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  confirmPay: () => set({ confirmed: true }),
  
  addAdjustment: (adjustment) => set((state) => ({
    adjustments: [
      ...state.adjustments,
      {
        ...adjustment,
        id: `adj-${Date.now()}`,
        status: state.windowState === 'CLOSED' ? 'Queued for next cycle' : 'Pending',
        submittedAt: new Date().toISOString(),
      },
    ],
  })),
  
  reset: () => set(initialState),
}));
