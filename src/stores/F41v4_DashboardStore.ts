/**
 * Flow 4.1 — Employee Dashboard v4 Store
 * 
 * Namespaced store for Employee Dashboard v4.
 * Includes T-5 confirmation and adjustment state.
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { create } from 'zustand';

export type F41v4_WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type F41v4_AdjustmentType = 'Expense' | 'Overtime' | 'Bonus' | 'Correction';
export type F41v4_AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';
export type F41v4_LeaveType = 'Annual leave' | 'Sick leave' | 'Unpaid leave' | 'Other';
export type F41v4_LeaveStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface F41v4_LineItem {
  type: 'Earnings' | 'Deduction';
  label: string;
  amount: number;
  locked: boolean;
}

export interface F41v4_EmployerCost {
  label: string;
  amount: number;
}

export interface F41v4_Adjustment {
  id: string;
  type: F41v4_AdjustmentType;
  label: string;
  amount: number | null;
  status: F41v4_AdjustmentStatus;
  description?: string;
  category?: string;
  hours?: number;
  receiptUrl?: string;
  submittedAt: string;
}

export interface F41v4_LeaveRequest {
  id: string;
  leaveType: F41v4_LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: F41v4_LeaveStatus;
  submittedAt: string;
}

interface F41v4_DashboardState {
  dashboard_context: 'employee_v4';
  isLoading: boolean;
  
  // Pay data
  nextPayoutDate: string;
  periodLabel: string;
  estimatedNet: number;
  currency: string;
  countryRuleLocks: string[];
  lineItems: F41v4_LineItem[];
  employerCosts: F41v4_EmployerCost[];
  windowState: F41v4_WindowState;
  confirmed: boolean;
  adjustments: F41v4_Adjustment[];
  leaveRequests: F41v4_LeaveRequest[];
  
  // Computed
  daysUntilClose: number;
}

interface F41v4_DashboardActions {
  setLoading: (loading: boolean) => void;
  confirmPay: () => void;
  addAdjustment: (adjustment: Omit<F41v4_Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  addLeaveRequest: (leave: Omit<F41v4_LeaveRequest, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  withdrawLeaveRequest: (id: string) => void;
  reset: () => void;
}

const initialState: F41v4_DashboardState = {
  dashboard_context: 'employee_v4',
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
  leaveRequests: [],
  daysUntilClose: 3,
};

export const useF41v4_DashboardStore = create<F41v4_DashboardState & F41v4_DashboardActions>((set) => ({
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
  
  addLeaveRequest: (leave) => set((state) => ({
    leaveRequests: [
      ...state.leaveRequests,
      {
        ...leave,
        id: `leave-${Date.now()}`,
        status: state.windowState === 'CLOSED' ? 'Queued for next cycle' : 'Pending',
        submittedAt: new Date().toISOString(),
      },
    ],
  })),
  
  withdrawAdjustment: (id) => set((state) => ({
    adjustments: state.adjustments.filter((adj) => adj.id !== id),
  })),
  
  withdrawLeaveRequest: (id) => set((state) => ({
    leaveRequests: state.leaveRequests.filter((leave) => leave.id !== id),
  })),
  
  reset: () => set(initialState),
}));
