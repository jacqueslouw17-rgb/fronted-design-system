// Flow 6 v2 - Company Admin Dashboard - Payroll Types (Local to this flow only)

export interface CA_Adjustment {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerCountryFlag: string;
  workerType: "employee" | "contractor";
  type: "overtime" | "expense" | "bonus" | "correction" | "commission" | "additional_hours";
  amount: number;
  currency: string;
  description: string;
  hasReceipt?: boolean;
  status: "pending" | "approved" | "rejected" | "auto_approved";
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CA_LeaveChange {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerCountryFlag: string;
  workerType: "employee" | "contractor";
  leaveType: "annual" | "sick" | "unpaid" | "parental" | "other";
  days: number;
  startDate: string;
  endDate: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  impactAmount: number;
  currency: string;
}

export interface CA_BlockingAlert {
  id: string;
  workerId: string;
  workerName: string;
  type: "missing_bank" | "unconfirmed" | "expired_rtw" | "missing_tax_id";
  description: string;
  severity: "blocking" | "warning";
}

export interface CA_FXTotalsRow {
  currency: string;
  countries: string[];
  employeeCount: number;
  contractorCount: number;
  adjustmentsTotal: number;
  employerCost: number;
  netToPay: number;
}

export interface CA_WorkerPreviewRow {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  base: number;
  currency: string;
  adjustments: Array<{ label: string; amount: number }>;
  deductions: number;
  netPay: number;
  isClientEditable?: boolean;
}
