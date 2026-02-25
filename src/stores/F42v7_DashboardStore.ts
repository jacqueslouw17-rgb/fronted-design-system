/**
 * Flow 4.2 — Contractor Dashboard v7 Store
 * 
 * Namespaced store for Contractor Dashboard v7.
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v6 or any other flow.
 */

import { create } from 'zustand';

export type F42v7_WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type F42v7_InvoiceStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'finalised' | 'rejected';
export type F42v7_ContractType = 'hourly' | 'fixed';
export type F42v7_AdjustmentType = 'Expense' | 'Additional hours' | 'Bonus' | 'Correction' | 'Unpaid Leave';
export type F42v7_AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface F42v7_LineItem {
  type: 'Earnings' | 'Adjustment';
  label: string;
  meta?: string;
  amount: number;
  locked?: boolean;
}

export interface F42v7_Adjustment {
  id: string;
  type: F42v7_AdjustmentType;
  label: string;
  amount: number | null;
  status: F42v7_AdjustmentStatus;
  description?: string;
  category?: string;
  days?: number;
  hours?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  receiptUrl?: string;
  tags?: string[];
  submittedAt: string;
  rejectionReason?: string;
}

interface F42v7_DashboardState {
  dashboard_context: 'contractor_v7';
  isLoading: boolean;
  nextInvoiceDate: string;
  periodLabel: string;
  periodMonth: string;
  invoiceTotal: number;
  currency: string;
  contractType: F42v7_ContractType;
  lineItems: F42v7_LineItem[];
  windowState: F42v7_WindowState;
  invoiceStatus: F42v7_InvoiceStatus;
  returnedReason?: string;
  resubmitDeadline?: string;
  adjustments: F42v7_Adjustment[];
  resubmittedRejectionIds: string[];
  cutoffDate: string;
  isCutoffSoon: boolean;
  daysUntilClose: number;
  submittedAt?: string;
  approvedAt?: string;
}

interface F42v7_DashboardActions {
  setLoading: (loading: boolean) => void;
  submitInvoice: () => void;
  withdrawSubmission: () => void;
  setInvoiceStatus: (status: F42v7_InvoiceStatus) => void;
  addAdjustment: (adjustment: Omit<F42v7_Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  markRejectionResubmitted: (id: string) => void;
  reset: () => void;
}

const initialState: F42v7_DashboardState = {
  dashboard_context: 'contractor_v7',
  isLoading: false,
  nextInvoiceDate: '2026-01-05',
  periodLabel: 'Dec 1 – Dec 31',
  periodMonth: 'December',
  invoiceTotal: 4500,
  currency: 'USD',
  contractType: 'hourly',
  lineItems: [
    { type: 'Earnings', label: 'Approved hours', meta: '150 h @ $30/h', amount: 4500, locked: true },
  ],
  windowState: 'OPEN',
  invoiceStatus: 'draft',
  returnedReason: undefined,
  resubmitDeadline: undefined,
  adjustments: [
    {
      id: 'adj-demo-pending-1',
      type: 'Expense' as F42v7_AdjustmentType,
      label: 'Meals · USD 85',
      amount: 85,
      status: 'Pending' as F42v7_AdjustmentStatus,
      category: 'Meals',
      submittedAt: '2026-01-20T10:00:00.000Z',
    },
    {
      id: 'adj-demo-rejected-1',
      type: 'Additional hours' as F42v7_AdjustmentType,
      label: '8h · Jan 10 · 18:00–02:00',
      amount: null,
      status: 'Admin rejected' as F42v7_AdjustmentStatus,
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

export const useF42v7_DashboardStore = create<F42v7_DashboardState & F42v7_DashboardActions>((set) => ({
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
      const nextInvoiceStatus: F42v7_InvoiceStatus = isApprovedOrLater ? 'submitted' : state.invoiceStatus;
      return {
        invoiceStatus: nextInvoiceStatus,
        submittedAt: isApprovedOrLater ? new Date().toISOString() : state.submittedAt,
        approvedAt: isApprovedOrLater ? undefined : state.approvedAt,
        adjustments: [
          {
            ...adjustment,
            id: `adj-${Date.now()}`,
            status: state.windowState === 'CLOSED' ? 'Queued for next cycle' : 'Pending',
            submittedAt: new Date().toISOString(),
          },
          ...state.adjustments,
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
