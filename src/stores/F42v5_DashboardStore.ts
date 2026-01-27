/**
 * Flow 4.2 — Contractor Dashboard v5 Store
 * 
 * Namespaced store for Contractor Dashboard v5.
 * Includes invoice status states matching employee payroll patterns.
 * 
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v4 or any other flow.
 */

import { create } from 'zustand';

export type F42v5_WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type F42v5_InvoiceStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'finalised' | 'rejected';
export type F42v5_ContractType = 'hourly' | 'fixed';
export type F42v5_AdjustmentType = 'Expense' | 'Additional hours' | 'Bonus' | 'Correction';
export type F42v5_AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface F42v5_LineItem {
  type: 'Earnings' | 'Adjustment';
  label: string;
  meta?: string; // e.g., "152 h @ $30/h"
  amount: number;
  locked?: boolean;
}

export interface F42v5_Adjustment {
  id: string;
  type: F42v5_AdjustmentType;
  label: string;
  amount: number | null;
  status: F42v5_AdjustmentStatus;
  description?: string;
  category?: string;
  hours?: number;
  receiptUrl?: string;
  submittedAt: string;
  rejectionReason?: string; // Reason for rejection from admin
}

interface F42v5_DashboardState {
  dashboard_context: 'contractor_v5';
  isLoading: boolean;
  
  // Invoice data
  nextInvoiceDate: string;
  periodLabel: string;
  periodMonth: string;
  invoiceTotal: number;
  currency: string;
  contractType: F42v5_ContractType;
  lineItems: F42v5_LineItem[];
  windowState: F42v5_WindowState;
  invoiceStatus: F42v5_InvoiceStatus;
  returnedReason?: string;
  resubmitDeadline?: string;
  adjustments: F42v5_Adjustment[];
  
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

interface F42v5_DashboardActions {
  setLoading: (loading: boolean) => void;
  submitInvoice: () => void;
  withdrawSubmission: () => void;
  setInvoiceStatus: (status: F42v5_InvoiceStatus) => void;
  addAdjustment: (adjustment: Omit<F42v5_Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  markRejectionResubmitted: (id: string) => void;
  reset: () => void;
}

const initialState: F42v5_DashboardState = {
  dashboard_context: 'contractor_v5',
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
  adjustments: [],
  resubmittedRejectionIds: [],
  cutoffDate: 'Jan 2',
  isCutoffSoon: true,
  daysUntilClose: 3,
};

export const useF42v5_DashboardStore = create<F42v5_DashboardState & F42v5_DashboardActions>((set) => ({
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
      const nextInvoiceStatus: F42v5_InvoiceStatus = isApprovedOrLater ? 'submitted' : state.invoiceStatus;

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
