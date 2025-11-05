export type PayrollBatchStatus = "Draft" | "AwaitingApproval" | "Approved" | "Executing" | "Completed" | "Failed";
export type PayeeStatus = "CERTIFIED" | "PAYROLL_PENDING" | "IN_BATCH" | "EXECUTING" | "PAID" | "ON_HOLD";
export type AdjustmentType = "Overtime" | "Bonus" | "Expense";
export type ApprovalAction = "Requested" | "Approved" | "Declined";
export type ActorRole = "Admin" | "CFO";
export type BatchEventLevel = "info" | "warn" | "error";
export type BatchEventActor = "Genie" | "System" | "User";
export type PaymentStatus = "Initiated" | "InTransit" | "Paid" | "Failed";
export type FXProvider = "Mock" | "Wise" | "Airwallex";

export interface Adjustment {
  type: AdjustmentType;
  label: string;
  amount: number;
  note?: string;
  receiptUrl?: string;
}

export interface PayrollPayee {
  workerId: string;
  name: string;
  countryCode: string;
  currency: string;
  gross: number;
  employerCosts: number;
  adjustments: Adjustment[];
  proposedFxRate?: number;
  fxFee?: number;
  eta?: string;
  status: PayeeStatus;
}

export interface FXQuote {
  ccy: string;
  rate: number;
  fee: number;
}

export interface FXSnapshot {
  provider: FXProvider;
  baseCcy: string;
  quotes: FXQuote[];
  lockedAt?: string;
  lockTtlSec?: number;
  varianceBps?: number;
}

export interface ApprovalEvent {
  actorId: string;
  role: ActorRole;
  action: ApprovalAction;
  at: string;
  note?: string;
}

export interface BatchEvent {
  at: string;
  actor: BatchEventActor;
  message: string;
  level: BatchEventLevel;
}

export interface PaymentReceipt {
  payeeId: string;
  providerRef: string;
  amount: number;
  ccy: string;
  status: PaymentStatus;
  paidAt?: string;
  failureReason?: string;
}

export interface PayrollBatch {
  id: string;
  period: string; // "2025-10"
  status: PayrollBatchStatus;
  payees: PayrollPayee[];
  totals: {
    gross: number;
    employerCosts: number;
    fxFees: number;
    currency: string;
  };
  fxSnapshot?: FXSnapshot;
  approvals: ApprovalEvent[];
  events: BatchEvent[];
  receipts: PaymentReceipt[];
  createdBy: string;
  createdAt: string;
}
