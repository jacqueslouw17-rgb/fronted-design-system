/**
 * Flow 4.1 — Employee Dashboard v4 Store
 * 
 * Namespaced store for Employee Dashboard v4 (UI: v2).
 * Includes 5-status payroll states and adjustment tracking.
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { create } from 'zustand';

// New 5-status payroll states
export type PayrollStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'finalised';

export type WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type AdjustmentType = 'Expense' | 'Overtime' | 'Bonus' | 'Correction';
export type AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';
export type LeaveType = 'Annual leave' | 'Sick leave' | 'Unpaid leave' | 'Other';
export type LeaveStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

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

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  submittedAt: string;
}

interface F41v4_DashboardState {
  dashboard_context: 'employee_v4';
  isLoading: boolean;
  
  // Pay data
  nextPayoutDate: string;
  periodLabel: string;
  periodMonth: string;
  estimatedNet: number;
  currency: string;
  countryRuleLocks: string[];
  lineItems: LineItem[];
  employerCosts: EmployerCost[];
  windowState: WindowState;
  
  // New 5-status state
  payrollStatus: PayrollStatus;
  returnedReason?: string;
  resubmitDeadline?: string;
  
  // Legacy - keeping for backwards compat
  confirmed: boolean;
  
  adjustments: Adjustment[];
  leaveRequests: LeaveRequest[];
  
  // Computed
  daysUntilClose: number;
  cutoffDate: string;
  isCutoffSoon: boolean;
}

interface F41v4_DashboardActions {
  setLoading: (loading: boolean) => void;
  submitForReview: () => void;
  submitNoChanges: () => void;
  fixAndResubmit: () => void;
  setPayrollStatus: (status: PayrollStatus) => void;
  confirmPay: () => void;
  addAdjustment: (adjustment: Omit<Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  addLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  withdrawLeaveRequest: (id: string) => void;
  reset: () => void;
}

const initialState: F41v4_DashboardState = {
  dashboard_context: 'employee_v4',
  isLoading: false,
  
  // Mock data matching the spec
  nextPayoutDate: '2026-01-31',
  periodLabel: 'Jan 1 – Jan 31',
  periodMonth: 'January 2026',
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
  payrollStatus: 'draft',
  returnedReason: undefined,
  resubmitDeadline: undefined,
  confirmed: false,
  adjustments: [],
  leaveRequests: [],
  daysUntilClose: 3,
  cutoffDate: '15 Jan',
  isCutoffSoon: false,
};

export const useF41v4_DashboardStore = create<F41v4_DashboardState & F41v4_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  submitForReview: () => set({ payrollStatus: 'submitted', confirmed: true }),
  
  submitNoChanges: () => set({ payrollStatus: 'submitted', confirmed: true }),
  
  fixAndResubmit: () => set({ payrollStatus: 'submitted', confirmed: true }),
  
  setPayrollStatus: (status) => set({ payrollStatus: status }),
  
  confirmPay: () => set({ confirmed: true, payrollStatus: 'submitted' }),
  
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
