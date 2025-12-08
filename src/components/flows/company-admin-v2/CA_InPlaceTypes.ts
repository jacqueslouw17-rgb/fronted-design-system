// Flow 6 v2 - Company Admin Dashboard - In-Place Batch Types (Local to this flow only)

export type CA_InPlaceBatchStatus = "draft" | "in_review" | "client_approved" | "auto_approved" | "requires_changes";

export type CA_InPlaceStep = "review" | "exceptions" | "execute";

export interface CA_InPlaceWorker {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  currency: string;
  type: "employee" | "contractor";
  base: number;
  adjustments: CA_InPlaceAdjustmentChip[];
  deductions: number;
  netPay: number;
  employerCost?: number;
  status: "ready" | "pending" | "exception";
  isManualMode?: boolean;
}

export interface CA_InPlaceAdjustmentChip {
  id: string;
  type: "overtime" | "expense" | "bonus" | "correction" | "leave";
  label: string;
  amount: number;
  hasReceipt?: boolean;
}

export interface CA_InPlaceException {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  type: "missing_bank" | "missing_tax_id" | "expired_rtw" | "negative_net" | "bonus_threshold" | "overtime_cap" | "manual_mode";
  description: string;
  isBlocking: boolean; // red chip vs amber chip
  canResolve: boolean;
  resolved: boolean;
}

export interface CA_LeaveRequest {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerCountryFlag: string;
  leaveType: "annual" | "sick" | "unpaid" | "parental";
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface CA_PayAdjustment {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerCountryFlag: string;
  type: "overtime" | "expense" | "bonus" | "correction";
  amount: number;
  currency: string;
  description: string;
  hasReceipt?: boolean;
  status: "pending" | "approved" | "rejected";
}

export interface CA_CurrencyTotal {
  currency: string;
  countries: string[];
  employees: number;
  contractors: number;
  employeeTotal: number;
  contractorTotal: number;
  adjustmentsTotal: number;
  employerCost: number;
  netToPay: number;
}

export interface CA_InPlaceBatch {
  id: string;
  period: string;
  payoutDate: string;
  status: CA_InPlaceBatchStatus;
  workers: CA_InPlaceWorker[];
  currencyTotals: CA_CurrencyTotal[];
  exceptions: CA_InPlaceException[];
  employeeCount: number;
  contractorCount: number;
}
