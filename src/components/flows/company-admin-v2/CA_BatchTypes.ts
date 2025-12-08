// Flow 6 v2 - Company Admin Dashboard - Payment Batch Types (Local to this flow only)

export type CA_BatchStatus = "draft" | "awaiting_approval" | "client_approved" | "auto_approved" | "requires_changes";

export type CA_ExecutionMode = "fronted" | "client";

export interface CA_BatchWorker {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  type: "employee" | "contractor";
  base: number;
  currency: string;
  adjustments: CA_BatchAdjustment[];
  deductions: number;
  netPay: number;
  employerCost?: number;
  hasClientReviewItem?: boolean;
  lineItems?: CA_WorkerLineItem[];
}

export interface CA_BatchAdjustment {
  id: string;
  type: "overtime" | "expense" | "bonus" | "correction" | "commission" | "additional_hours";
  label: string;
  amount: number;
  hasReceipt?: boolean;
  description?: string;
  status: "pending" | "approved" | "rejected" | "client_review";
  workerName?: string;
  workerId?: string;
  workerCountry?: string;
  workerCountryFlag?: string;
  workerType?: "employee" | "contractor";
}

export interface CA_WorkerLineItem {
  id: string;
  name: string;
  amount: number;
  type: "earning" | "deduction" | "contribution";
  isClientEditable?: boolean;
}

export interface CA_BatchSummary {
  currency: string;
  workers: number;
  adjustmentsTotal: number;
  employerCost: number;
  netToPay: number;
}

export interface CA_BatchBlocker {
  id: string;
  workerId: string;
  workerName: string;
  type: "missing_bank" | "unconfirmed" | "expired_rtw" | "missing_tax_id";
  description: string;
}

export interface CA_AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface CA_PaymentBatch {
  id: string;
  period: string;
  payoutDate: string;
  status: CA_BatchStatus;
  executionMode: CA_ExecutionMode;
  autoApproveTime?: string; // ISO timestamp
  workers: CA_BatchWorker[];
  clientReviewItems: CA_BatchAdjustment[];
  blockers: CA_BatchBlocker[];
  summaryByCurrency: CA_BatchSummary[];
  auditLog: CA_AuditEntry[];
  employeeCount: number;
  contractorCount: number;
}
