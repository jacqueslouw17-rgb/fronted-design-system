/**
 * Flow 4.2 — Contractor Dashboard v4 Store
 * 
 * Namespaced store for Contractor Dashboard v4.
 * Includes T-5 invoice confirmation and adjustment state for contractors.
 * 
 * ISOLATED: This is a complete copy from v3 - changes here do NOT affect v3.
 */

import { create } from 'zustand';

export type F42v4_WindowState = 'OPEN' | 'CLOSED' | 'PAID' | 'NONE';
export type F42v4_ContractType = 'hourly' | 'fixed';
export type F42v4_AdjustmentType = 'Expense' | 'Additional hours' | 'Bonus' | 'Correction';
export type F42v4_AdjustmentStatus = 'Pending' | 'Admin approved' | 'Admin rejected' | 'Queued for next cycle';

export interface F42v4_LineItem {
  type: 'Earnings' | 'Adjustment';
  label: string;
  meta?: string; // e.g., "152 h @ $30/h"
  amount: number;
  locked?: boolean;
}

export interface F42v4_Adjustment {
  id: string;
  type: F42v4_AdjustmentType;
  label: string;
  amount: number | null;
  status: F42v4_AdjustmentStatus;
  description?: string;
  category?: string;
  hours?: number;
  receiptUrl?: string;
  submittedAt: string;
}

interface F42v4_DashboardState {
  dashboard_context: 'contractor_v4';
  isLoading: boolean;
  
  // Invoice data
  nextInvoiceDate: string;
  periodLabel: string;
  invoiceTotal: number;
  currency: string;
  contractType: F42v4_ContractType;
  lineItems: F42v4_LineItem[];
  windowState: F42v4_WindowState;
  confirmed: boolean;
  adjustments: F42v4_Adjustment[];
  
  // Computed
  daysUntilClose: number;
}

interface F42v4_DashboardActions {
  setLoading: (loading: boolean) => void;
  confirmInvoice: () => void;
  addAdjustment: (adjustment: Omit<F42v4_Adjustment, 'id' | 'submittedAt' | 'status'>) => void;
  withdrawAdjustment: (id: string) => void;
  reset: () => void;
}

const initialState: F42v4_DashboardState = {
  dashboard_context: 'contractor_v4',
  isLoading: false,
  
  // Mock data matching the spec
  nextInvoiceDate: '2026-01-05',
  periodLabel: 'Dec 1 – Dec 31',
  invoiceTotal: 4500,
  currency: 'USD',
  contractType: 'hourly', // 'hourly' | 'fixed'
  lineItems: [
    { type: 'Earnings', label: 'Approved hours', meta: '152 h @ $30/h', amount: 4560 },
    { type: 'Adjustment', label: 'Expense (Travel)', amount: -60 },
  ],
  windowState: 'OPEN',
  confirmed: false,
  adjustments: [],
  daysUntilClose: 3,
};

export const useF42v4_DashboardStore = create<F42v4_DashboardState & F42v4_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  confirmInvoice: () => set({ confirmed: true }),
  
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
  
  withdrawAdjustment: (id) => set((state) => ({
    adjustments: state.adjustments.filter((adj) => adj.id !== id),
  })),
  
  reset: () => set(initialState),
}));
