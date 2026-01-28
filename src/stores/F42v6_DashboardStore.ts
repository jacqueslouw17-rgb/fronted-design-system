/**
 * Flow 4.2 — Contractor Dashboard v6 Store
 * 
 * Namespaced store for Contractor Dashboard v6.
 * Includes invoice status states matching employee payroll patterns.
 * 
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v5 or any other flow.
 */

import { create } from 'zustand';

export type F42v6_WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type F42v6_InvoiceStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'finalised' | 'rejected';
export type F42v6_ContractType = 'hourly' | 'fixed';
export type F42v6_AdjustmentType = 'Expense' | 'Additional hours' | 'Bonus' | 'Correction';
export type F42v6_AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface F42v6_LineItem {
  type: 'Earnings' | 'Adjustment';
  label: string;
  meta?: string; // e.g., "152 h @ $30/h"
  amount: number;
  locked?: boolean;
}

export interface F42v6_Adjustment {
  id: string;
  type: F42v6_AdjustmentType;
  label: string;
  amount: number | null;
  status: F42v6_AdjustmentStatus;
  description?: string;
  category?: string;
  hours?: number;
  // For additional hours resubmissions
  date?: string;
  startTime?: string;
  endTime?: string;
  receiptUrl?: string;
  submittedAt: string;
  rejectionReason?: string; // Reason for rejection from admin
}

interface F42v6_DashboardState {
  dashboard_context: 'contractor_v6';
  isLoading: boolean;
  
  // Invoice data
  nextInvoiceDate: string;
  periodLabel: string;
  periodMonth: string;
  invoiceTotal: number;
  currency: string;
  contractType: F42v6_ContractType;
  lineItems: F42v6_LineItem[];
  windowState: F42v6_WindowState;
  invoiceStatus: F42v6_InvoiceStatus;
  returnedReason?: string;
  resubmitDeadline?: string;
  adjustments: F42v6_Adjustment[];
  
  // Track resubmitted rejected items (hide from "Needs attention")
  resubmittedRejectionIds: string[];
  
  // Cut-off
  cutoffDate: string;
  isCutoffSoon: boolean;
  daysUntilClose: number;
  
  // Timestamps for state transitions
  submittedAt?: string;
  approvedAt?: string;
}

interface F42v6_DashboardActions {
  setLoading: (loading: boolean) => void;
  submitInvoice: () => void;
  withdrawSubmission: () => void;
  setInvoiceStatus: (status: F42v6_InvoiceStatus) => void;
  addAdjustment: (adjustment: Omit<F42v6_Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  markRejectionResubmitted: (id: string) => void;
  reset: () => void;
}

const initialState: F42v6_DashboardState = {
  dashboard_context: 'contractor_v6',
  isLoading: false,
  
  // Mock data matching the spec
  nextInvoiceDate: '2026-01-05',
  periodLabel: 'Dec 1 – Dec 31',
  periodMonth: 'December',
  invoiceTotal: 4500,
  currency: 'USD',
  contractType: 'hourly', // 'hourly' | 'fixed'
  lineItems: [
    { type: 'Earnings', label: 'Approved hours', meta: '150 h @ $30/h', amount: 4500, locked: true },
  ],
  windowState: 'OPEN',
  invoiceStatus: 'draft',
  returnedReason: undefined,
  resubmitDeadline: undefined,
  adjustments: [
    // Mock pending adjustment
    {
      id: 'adj-demo-pending-1',
      type: 'Expense' as F42v6_AdjustmentType,
      label: 'Client lunch',
      amount: 85,
      status: 'Pending' as F42v6_AdjustmentStatus,
      category: 'Meals',
      submittedAt: '2026-01-20T10:00:00.000Z',
    },
    // Mock rejected adjustment with reason
    {
      id: 'adj-demo-rejected-1',
      type: 'Additional hours' as F42v6_AdjustmentType,
      label: 'Extra hours',
      amount: 240,
      status: 'Admin rejected' as F42v6_AdjustmentStatus,
      hours: 8,
      date: '2026-01-10',
      startTime: '18:00',
      endTime: '02:00',
      submittedAt: '2026-01-15T10:00:00.000Z',
      rejectionReason: 'Hours not logged in the system. Please add them to your timesheet first.',
    },
  ],
  resubmittedRejectionIds: [],
  cutoffDate: 'Jan 2',
  isCutoffSoon: true,
  daysUntilClose: 3,
};

export const useF42v6_DashboardStore = create<F42v6_DashboardState & F42v6_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  submitInvoice: () => set({ 
    invoiceStatus: 'submitted',
    submittedAt: new Date().toISOString(),
  }),
  
  withdrawSubmission: () => set({ 
    invoiceStatus: 'draft',
    submittedAt: undefined,
    approvedAt: undefined,
  }),
  
  setInvoiceStatus: (status) =>
    set((state) => {
      const isApprovedOrLater = status === 'approved' || status === 'finalised';

      // If the invoice is approved, there should be no "Pending" items.
      // Convert any pending requests to admin-approved to keep the UI consistent.
      const nextAdjustments = isApprovedOrLater
        ? state.adjustments.map((adj) =>
            adj.status === 'Pending' ? { ...adj, status: 'Admin approved' as const } : adj
          )
        : state.adjustments;

      return {
        invoiceStatus: status,
        submittedAt: status === 'submitted' ? new Date().toISOString() : state.submittedAt,
        approvedAt: isApprovedOrLater ? state.approvedAt ?? new Date().toISOString() : state.approvedAt,
        adjustments: nextAdjustments,
      };
    }),
  
  addAdjustment: (adjustment) =>
    set((state) => {
      const isApprovedOrLater = state.invoiceStatus === 'approved' || state.invoiceStatus === 'finalised';
      const nextInvoiceStatus: F42v6_InvoiceStatus = isApprovedOrLater ? 'submitted' : state.invoiceStatus;

      return {
        invoiceStatus: nextInvoiceStatus,
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
  
  withdrawAdjustment: (id) => set((state) => ({
    adjustments: state.adjustments.filter((adj) => adj.id !== id),
  })),
  
  markRejectionResubmitted: (id) => set((state) => ({
    resubmittedRejectionIds: [...state.resubmittedRejectionIds, id],
  })),
  
  reset: () => set(initialState),
}));
