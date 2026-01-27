/**
 * Flow 4.1 — Employee Dashboard v5 Store
 * 
 * Namespaced store for Employee Dashboard v5.
 * Includes 5-status payroll states and adjustment tracking.
 * INDEPENDENT from v4 and all other flows - changes here do not affect other flows.
 */

import { create } from 'zustand';

// New 5-status payroll states
export type F41v5_PayrollStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'finalised' | 'rejected';

export type F41v5_WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type F41v5_AdjustmentType = 'Expense' | 'Overtime' | 'Bonus' | 'Correction';
export type F41v5_AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';
export type F41v5_LeaveType = 'Vacation' | 'Sick' | 'Compassionate' | 'Maternity';
export type F41v5_LeaveStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface F41v5_LineItem {
  type: 'Earnings' | 'Deduction';
  label: string;
  amount: number;
  locked: boolean;
}

export interface F41v5_EmployerCost {
  label: string;
  amount: number;
}

export interface F41v5_Adjustment {
  id: string;
  type: F41v5_AdjustmentType;
  label: string;
  amount: number | null;
  status: F41v5_AdjustmentStatus;
  description?: string;
  category?: string;
  hours?: number;
  // For overtime resubmissions
  date?: string;
  startTime?: string;
  endTime?: string;
  receiptUrl?: string;
  submittedAt: string;
  rejectionReason?: string;
}

export interface F41v5_LeaveRequest {
  id: string;
  leaveType: F41v5_LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: F41v5_LeaveStatus;
  submittedAt: string;
  rejectionReason?: string;
}

interface F41v5_DashboardState {
  dashboard_context: 'employee_v5';
  isLoading: boolean;
  
  // Employee info
  employeeCountry: string;
  
  // Pay data
  nextPayoutDate: string;
  periodLabel: string;
  periodMonth: string;
  estimatedNet: number;
  currency: string;
  countryRuleLocks: string[];
  lineItems: F41v5_LineItem[];
  employerCosts: F41v5_EmployerCost[];
  windowState: F41v5_WindowState;
  
  // New 5-status state
  payrollStatus: F41v5_PayrollStatus;
  returnedReason?: string;
  resubmitDeadline?: string;
  submittedAt?: string; // Timestamp when submission was made
  approvedAt?: string; // Timestamp when approval was received
  
  // Legacy - keeping for backwards compat
  confirmed: boolean;
  
  adjustments: F41v5_Adjustment[];
  leaveRequests: F41v5_LeaveRequest[];
  
  // Track resubmitted rejected items (hide from "Needs attention")
  resubmittedRejectionIds: string[];
  
  // Computed
  daysUntilClose: number;
  cutoffDate: string;
  isCutoffSoon: boolean;
}

interface F41v5_DashboardActions {
  setLoading: (loading: boolean) => void;
  submitForReview: () => void;
  submitNoChanges: () => void;
  fixAndResubmit: () => void;
  setPayrollStatus: (status: F41v5_PayrollStatus) => void;
  confirmPay: () => void;
  withdrawSubmission: () => void;
  addAdjustment: (adjustment: Omit<F41v5_Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  addLeaveRequest: (leave: Omit<F41v5_LeaveRequest, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  withdrawLeaveRequest: (id: string) => void;
  markRejectionResubmitted: (id: string) => void;
  reset: () => void;
}

const initialState: F41v5_DashboardState = {
  dashboard_context: 'employee_v5',
  isLoading: false,
  
  // Employee info - Norway for demo
  employeeCountry: 'NO',
  
  // Mock data matching the spec
  nextPayoutDate: '2025-12-31',
  periodLabel: 'Dec 1 – Dec 31',
  periodMonth: 'December 2025',
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
  submittedAt: undefined,
  approvedAt: undefined,
  confirmed: false,
  adjustments: [
    // Mock pending adjustment
    {
      id: 'adj-demo-pending-1',
      type: 'Expense' as F41v5_AdjustmentType,
      label: 'Team lunch',
      amount: 2500,
      status: 'Pending' as F41v5_AdjustmentStatus,
      category: 'Meals',
      submittedAt: '2026-01-20T10:00:00.000Z',
    },
    // Mock rejected adjustment with reason
    {
      id: 'adj-demo-rejected-1',
      type: 'Overtime' as F41v5_AdjustmentType,
      label: 'Weekend work',
      amount: 3500,
      status: 'Admin rejected' as F41v5_AdjustmentStatus,
      hours: 8,
      date: '2026-01-11',
      startTime: '09:00',
      endTime: '17:00',
      submittedAt: '2026-01-15T10:00:00.000Z',
      rejectionReason: 'Overtime not pre-approved by manager. Please get approval first.',
    },
  ],
  leaveRequests: [
    // Sample approved leave - will be hidden (only pending/rejected shown)
    {
      id: 'leave-demo-1',
      leaveType: 'Vacation' as F41v5_LeaveType,
      startDate: '2026-01-15',
      endDate: '2026-01-15',
      totalDays: 1,
      status: 'Admin approved' as F41v5_LeaveStatus,
      submittedAt: '2026-01-05T10:00:00.000Z',
    },
    // Sample pending leave
    {
      id: 'leave-demo-2',
      leaveType: 'Vacation' as F41v5_LeaveType,
      startDate: '2026-02-15',
      endDate: '2026-02-17',
      totalDays: 2,
      status: 'Pending' as F41v5_LeaveStatus,
      submittedAt: '2026-01-10T10:00:00.000Z',
    },
    // Sample rejected leave with reason
    {
      id: 'leave-demo-3',
      leaveType: 'Sick' as F41v5_LeaveType,
      startDate: '2026-01-25',
      endDate: '2026-01-26',
      totalDays: 2,
      status: 'Admin rejected' as F41v5_LeaveStatus,
      submittedAt: '2026-01-08T10:00:00.000Z',
      rejectionReason: 'Sick leave requires a medical certificate for more than 1 day.',
    },
  ],
  resubmittedRejectionIds: [],
  daysUntilClose: 3,
  cutoffDate: '15 Jan',
  isCutoffSoon: false,
};

export const useF41v5_DashboardStore = create<F41v5_DashboardState & F41v5_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  submitForReview: () => set({ payrollStatus: 'submitted', confirmed: true, submittedAt: new Date().toISOString() }),
  
  submitNoChanges: () => set({ payrollStatus: 'submitted', confirmed: true, submittedAt: new Date().toISOString() }),
  
  fixAndResubmit: () => set({ payrollStatus: 'submitted', confirmed: true, submittedAt: new Date().toISOString() }),
  
  setPayrollStatus: (status) => set((state) => {
    const isApprovedOrLater = status === 'approved' || status === 'finalised';

    // If the run is approved, there should be no "Pending" items.
    // Convert any pending requests to admin-approved to keep the UI consistent.
    const nextAdjustments = isApprovedOrLater
      ? state.adjustments.map((adj) =>
          adj.status === 'Pending' ? { ...adj, status: 'Admin approved' as const } : adj
        )
      : state.adjustments;

    const nextLeaves = isApprovedOrLater
      ? state.leaveRequests.map((leave) =>
          leave.status === 'Pending' ? { ...leave, status: 'Admin approved' as const } : leave
        )
      : state.leaveRequests;

    return {
      payrollStatus: status,
      approvedAt: isApprovedOrLater ? state.approvedAt ?? new Date().toISOString() : state.approvedAt,
      adjustments: nextAdjustments,
      leaveRequests: nextLeaves,
    };
  }),
  
  confirmPay: () => set({ confirmed: true, payrollStatus: 'submitted', submittedAt: new Date().toISOString() }),
  
  withdrawSubmission: () => set({ payrollStatus: 'draft', confirmed: false, submittedAt: undefined, approvedAt: undefined }),
  
  addAdjustment: (adjustment) =>
    set((state) => {
      const isApprovedOrLater = state.payrollStatus === 'approved' || state.payrollStatus === 'finalised';
      // If a new request is submitted after approval (e.g. resubmission), the run is no longer "Approved".
      const nextPayrollStatus: F41v5_PayrollStatus = isApprovedOrLater ? 'submitted' : state.payrollStatus;

      return {
        payrollStatus: nextPayrollStatus,
        submittedAt: isApprovedOrLater ? new Date().toISOString() : state.submittedAt,
        approvedAt: isApprovedOrLater ? undefined : state.approvedAt,
        adjustments: [
          ...state.adjustments,
          {
            ...adjustment,
            id: `adj-${Date.now()}`,
            status: state.windowState === 'CLOSED' ? 'Queued for next cycle' : 'Pending',
            submittedAt: new Date().toISOString(),
          },
        ],
      };
    }),
  
  addLeaveRequest: (leave) =>
    set((state) => {
      const isApprovedOrLater = state.payrollStatus === 'approved' || state.payrollStatus === 'finalised';
      const nextPayrollStatus: F41v5_PayrollStatus = isApprovedOrLater ? 'submitted' : state.payrollStatus;

      return {
        payrollStatus: nextPayrollStatus,
        submittedAt: isApprovedOrLater ? new Date().toISOString() : state.submittedAt,
        approvedAt: isApprovedOrLater ? undefined : state.approvedAt,
        leaveRequests: [
          ...state.leaveRequests,
          {
            ...leave,
            id: `leave-${Date.now()}`,
            status: state.windowState === 'CLOSED' ? 'Queued for next cycle' : 'Pending',
            submittedAt: new Date().toISOString(),
          },
        ],
      };
    }),
  
  withdrawAdjustment: (id) => set((state) => ({
    adjustments: state.adjustments.filter((adj) => adj.id !== id),
  })),
  
  withdrawLeaveRequest: (id) => set((state) => ({
    leaveRequests: state.leaveRequests.filter((leave) => leave.id !== id),
  })),
  
  markRejectionResubmitted: (id) => set((state) => ({
    resubmittedRejectionIds: [...state.resubmittedRejectionIds, id],
  })),
  
  reset: () => set(initialState),
}));
