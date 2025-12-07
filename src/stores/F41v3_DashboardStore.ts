/**
 * Flow 4.1 — Employee Dashboard v3 Store
 * 
 * Namespaced store for Employee Dashboard v3.
 * Mirrors v2 structure with employee context discriminator.
 */

import { create } from 'zustand';

interface F41v3_DashboardState {
  dashboard_context: 'employee_v3';
  isLoading: boolean;
  // Future state fields will be added here
}

interface F41v3_DashboardActions {
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: F41v3_DashboardState = {
  dashboard_context: 'employee_v3',
  isLoading: false,
};

export const useF41v3_DashboardStore = create<F41v3_DashboardState & F41v3_DashboardActions>((set) => ({
  ...initialState,
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  reset: () => set(initialState),
}));
