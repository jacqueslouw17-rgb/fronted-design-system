/**
 * Flow 2 v2 - Form Store (F2v2_ namespaced)
 * 
 * Isolated store for candidate data collection v2.
 * Does NOT interact with v1 or any other flow stores.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Employment type enum
export type F2v2_EmploymentType = 'employee' | 'contractor';

// Employee rate structure
export type F2v2_EmployeeRateStructure = 'monthly_salary' | 'annual_salary';

// Contractor billing model
export type F2v2_ContractorBillingModel = 'hourly' | 'fixed';

// Contractor billing cadence
export type F2v2_ContractorBillingCadence = 'monthly' | 'biweekly' | 'weekly' | 'per_milestone';

// Invoice cadence
export type F2v2_InvoiceCadence = 'auto-month-end' | 'manual-submit';

// Allowance item
export interface F2v2_Allowance {
  id: string;
  label: string;
  amount: number;
}

// Core form data (profile info)
export interface F2v2_CoreFormData {
  fullName: string;
  email: string;
  role: string;
  idType: string;
  idNumber: string;
  taxResidence: string;
  city: string;
  nationality: string;
  address: string;
}

// Payroll form data
export interface F2v2_PayrollFormData {
  // Common fields
  employment_type: F2v2_EmploymentType | '';
  country_code: string;
  currency: string;
  start_date: string;
  
  // Employee-only fields
  employee_rate_structure: F2v2_EmployeeRateStructure | '';
  employee_base_amount: number | null;
  employee_allowances: F2v2_Allowance[];
  employee_overtime_eligible: boolean;
  employee_hours_per_week: number | null;
  
  // Contractor-only fields
  contractor_billing_model: F2v2_ContractorBillingModel | '';
  contractor_hourly_rate: number | null;
  contractor_max_hours_per_period: number | null;
  contractor_retainer_amount: number | null;
  contractor_billing_cadence: F2v2_ContractorBillingCadence | '';
  contractor_invoice_cadence: F2v2_InvoiceCadence;
  contractor_timesheet_required: boolean;
}

// Complete form state
export interface F2v2_FormState {
  // Core profile data
  core: F2v2_CoreFormData;
  
  // Payroll data
  payroll: F2v2_PayrollFormData;
  
  // Meta
  F2v2_version: string;
  F2v2_last_saved_at: string | null;
  currentStep: number;
  isSubmitted: boolean;
}

// Store actions
interface F2v2_FormActions {
  setCoreData: (data: Partial<F2v2_CoreFormData>) => void;
  setPayrollData: (data: Partial<F2v2_PayrollFormData>) => void;
  setEmploymentType: (type: F2v2_EmploymentType) => void;
  clearEmployeeFields: () => void;
  clearContractorFields: () => void;
  addAllowance: (allowance: F2v2_Allowance) => void;
  removeAllowance: (id: string) => void;
  updateAllowance: (id: string, data: Partial<F2v2_Allowance>) => void;
  setCurrentStep: (step: number) => void;
  saveDraft: () => void;
  submit: () => void;
  reset: () => void;
}

const initialCoreData: F2v2_CoreFormData = {
  fullName: '',
  email: '',
  role: '',
  idType: '',
  idNumber: '',
  taxResidence: '',
  city: '',
  nationality: '',
  address: '',
};

const initialPayrollData: F2v2_PayrollFormData = {
  employment_type: '',
  country_code: 'MX',
  currency: 'MXN',
  start_date: '',
  employee_rate_structure: '',
  employee_base_amount: null,
  employee_allowances: [],
  employee_overtime_eligible: false,
  employee_hours_per_week: null,
  contractor_billing_model: '',
  contractor_hourly_rate: null,
  contractor_max_hours_per_period: null,
  contractor_retainer_amount: null,
  contractor_billing_cadence: '',
  contractor_invoice_cadence: 'auto-month-end',
  contractor_timesheet_required: true,
};

const initialState: F2v2_FormState = {
  core: initialCoreData,
  payroll: initialPayrollData,
  F2v2_version: 'v2',
  F2v2_last_saved_at: null,
  currentStep: 0,
  isSubmitted: false,
};

export const useF2v2_FormStore = create<F2v2_FormState & F2v2_FormActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCoreData: (data) => set((state) => ({
        core: { ...state.core, ...data }
      })),
      
      setPayrollData: (data) => set((state) => ({
        payroll: { ...state.payroll, ...data }
      })),
      
      setEmploymentType: (type) => set((state) => ({
        payroll: { ...state.payroll, employment_type: type }
      })),
      
      clearEmployeeFields: () => set((state) => ({
        payroll: {
          ...state.payroll,
          employee_rate_structure: '',
          employee_base_amount: null,
          employee_allowances: [],
          employee_overtime_eligible: false,
          employee_hours_per_week: null,
        }
      })),
      
      clearContractorFields: () => set((state) => ({
        payroll: {
          ...state.payroll,
          contractor_billing_model: '',
          contractor_hourly_rate: null,
          contractor_max_hours_per_period: null,
          contractor_retainer_amount: null,
          contractor_billing_cadence: '',
          contractor_invoice_cadence: 'auto-month-end',
          contractor_timesheet_required: true,
        }
      })),
      
      addAllowance: (allowance) => set((state) => ({
        payroll: {
          ...state.payroll,
          employee_allowances: [...state.payroll.employee_allowances, allowance]
        }
      })),
      
      removeAllowance: (id) => set((state) => ({
        payroll: {
          ...state.payroll,
          employee_allowances: state.payroll.employee_allowances.filter(a => a.id !== id)
        }
      })),
      
      updateAllowance: (id, data) => set((state) => ({
        payroll: {
          ...state.payroll,
          employee_allowances: state.payroll.employee_allowances.map(a => 
            a.id === id ? { ...a, ...data } : a
          )
        }
      })),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      saveDraft: () => set({ 
        F2v2_last_saved_at: new Date().toISOString() 
      }),
      
      submit: () => set({ 
        isSubmitted: true,
        F2v2_last_saved_at: new Date().toISOString()
      }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'F2v2_draft_formstore', // unique localStorage key for v2
    }
  )
);

// Analytics helper (v2 staging only)
export const F2v2_Analytics = {
  track: (event: string, data?: Record<string, unknown>) => {
    console.log(`[F2v2_Analytics][staging] ${event}`, data || {});
  }
};
