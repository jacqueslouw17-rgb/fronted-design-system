/**
 * Flow 2 v3 - Form Store (F2v3_ namespaced)
 * 
 * Isolated store for candidate data collection v3 (Future).
 * Cloned from v2. Does NOT interact with v1/v2 or any other flow stores.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Re-export types with v3 namespace
export type F2v3_EmploymentType = 'employee' | 'contractor';
export type F2v3_EmployeeRateStructure = 'monthly_salary' | 'annual_salary';
export type F2v3_ContractorBillingModel = 'hourly' | 'fixed';
export type F2v3_ContractorBillingCadence = 'monthly' | 'biweekly' | 'weekly' | 'per_milestone';
export type F2v3_InvoiceCadence = 'auto-month-end' | 'manual-submit';

export interface F2v3_Allowance {
  id: string;
  label: string;
  amount: number;
}

export interface F2v3_CoreFormData {
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

export interface F2v3_PayrollFormData {
  employment_type: F2v3_EmploymentType | '';
  country_code: string;
  currency: string;
  start_date: string;
  employee_rate_structure: F2v3_EmployeeRateStructure | '';
  employee_base_amount: number | null;
  employee_allowances: F2v3_Allowance[];
  employee_overtime_eligible: boolean;
  employee_hours_per_week: number | null;
  contractor_billing_model: F2v3_ContractorBillingModel | '';
  contractor_hourly_rate: number | null;
  contractor_max_hours_per_period: number | null;
  contractor_retainer_amount: number | null;
  contractor_billing_cadence: F2v3_ContractorBillingCadence | '';
  contractor_invoice_cadence: F2v3_InvoiceCadence;
  contractor_timesheet_required: boolean;
}

export interface F2v3_FormState {
  core: F2v3_CoreFormData;
  payroll: F2v3_PayrollFormData;
  F2v3_version: string;
  F2v3_last_saved_at: string | null;
  currentStep: number;
  isSubmitted: boolean;
}

interface F2v3_FormActions {
  setCoreData: (data: Partial<F2v3_CoreFormData>) => void;
  setPayrollData: (data: Partial<F2v3_PayrollFormData>) => void;
  setEmploymentType: (type: F2v3_EmploymentType) => void;
  clearEmployeeFields: () => void;
  clearContractorFields: () => void;
  addAllowance: (allowance: F2v3_Allowance) => void;
  removeAllowance: (id: string) => void;
  updateAllowance: (id: string, data: Partial<F2v3_Allowance>) => void;
  setCurrentStep: (step: number) => void;
  saveDraft: () => void;
  submit: () => void;
  reset: () => void;
}

const initialCoreData: F2v3_CoreFormData = {
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

const initialPayrollData: F2v3_PayrollFormData = {
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

const initialState: F2v3_FormState = {
  core: initialCoreData,
  payroll: initialPayrollData,
  F2v3_version: 'v3',
  F2v3_last_saved_at: null,
  currentStep: 0,
  isSubmitted: false,
};

export const useF2v3_FormStore = create<F2v3_FormState & F2v3_FormActions>()(
  persist(
    (set) => ({
      ...initialState,
      setCoreData: (data) => set((state) => ({ core: { ...state.core, ...data } })),
      setPayrollData: (data) => set((state) => ({ payroll: { ...state.payroll, ...data } })),
      setEmploymentType: (type) => set((state) => ({ payroll: { ...state.payroll, employment_type: type } })),
      clearEmployeeFields: () => set((state) => ({
        payroll: { ...state.payroll, employee_rate_structure: '', employee_base_amount: null, employee_allowances: [], employee_overtime_eligible: false, employee_hours_per_week: null }
      })),
      clearContractorFields: () => set((state) => ({
        payroll: { ...state.payroll, contractor_billing_model: '', contractor_hourly_rate: null, contractor_max_hours_per_period: null, contractor_retainer_amount: null, contractor_billing_cadence: '', contractor_invoice_cadence: 'auto-month-end', contractor_timesheet_required: true }
      })),
      addAllowance: (allowance) => set((state) => ({ payroll: { ...state.payroll, employee_allowances: [...state.payroll.employee_allowances, allowance] } })),
      removeAllowance: (id) => set((state) => ({ payroll: { ...state.payroll, employee_allowances: state.payroll.employee_allowances.filter(a => a.id !== id) } })),
      updateAllowance: (id, data) => set((state) => ({ payroll: { ...state.payroll, employee_allowances: state.payroll.employee_allowances.map(a => a.id === id ? { ...a, ...data } : a) } })),
      setCurrentStep: (step) => set({ currentStep: step }),
      saveDraft: () => set({ F2v3_last_saved_at: new Date().toISOString() }),
      submit: () => set({ isSubmitted: true, F2v3_last_saved_at: new Date().toISOString() }),
      reset: () => set(initialState),
    }),
    { name: 'F2v3_draft_formstore' }
  )
);

export const F2v3_Analytics = {
  track: (event: string, data?: Record<string, unknown>) => {
    console.log(`[F2v3_Analytics][staging] ${event}`, data || {});
  }
};
