/**
 * Flow 4.2 — Contractor Dashboard v3 Store
 * 
 * Namespaced store for Contractor Dashboard v3.
 * Mirrors v2 structure with contractor context discriminator.
 */

import { create } from 'zustand';

interface F42v3_DashboardState {
  dashboard_context: 'contractor_v3';
  isLoading: boolean;
  // Future state fields will be added here
}

interface F42v3_DashboardActions {
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: F42v3_DashboardState = {
  dashboard_context: 'contractor_v3',
  isLoading: false,
};

export const useF42v3_DashboardStore = create<F42v3_DashboardState & F42v3_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  reset: () => set(initialState),
}));
