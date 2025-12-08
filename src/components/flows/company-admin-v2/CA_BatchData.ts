// Flow 6 v2 - Company Admin Dashboard - Mock Batch Data (Local to this flow only)

import { CA_PaymentBatch, CA_BatchWorker, CA_BatchAdjustment, CA_BatchSummary, CA_AuditEntry } from "./CA_BatchTypes";

export const mockClientReviewItems: CA_BatchAdjustment[] = [
  {
    id: "review-1",
    type: "bonus",
    label: "+Bonus",
    amount: 500,
    description: "Q3 performance bonus",
    status: "client_review",
    workerId: "w-3",
    workerName: "David Martinez",
    workerCountry: "Portugal",
    workerCountryFlag: "🇵🇹",
    workerType: "contractor"
  },
  {
    id: "review-2",
    type: "expense",
    label: "+Expense",
    amount: 120,
    hasReceipt: true,
    description: "Client lunch meeting",
    status: "client_review",
    workerId: "w-2",
    workerName: "John Chen",
    workerCountry: "Singapore",
    workerCountryFlag: "🇸🇬",
    workerType: "employee"
  },
  {
    id: "review-3",
    type: "overtime",
    label: "+Overtime",
    amount: 5000,
    description: "Weekend overtime - project deadline",
    status: "client_review",
    workerId: "w-1",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerCountryFlag: "🇵🇭",
    workerType: "employee"
  }
];

export const mockBatchWorkers: CA_BatchWorker[] = [
  {
    id: "w-1",
    name: "Maria Santos",
    country: "Philippines",
    countryFlag: "🇵🇭",
    type: "employee",
    base: 280000,
    currency: "PHP",
    adjustments: [{ id: "adj-1", type: "overtime", label: "+Overtime", amount: 5000, status: "client_review" }],
    deductions: 35000,
    netPay: 250000,
    employerCost: 42000,
    hasClientReviewItem: true,
    lineItems: [
      { id: "li-1", name: "Basic Salary", amount: 280000, type: "earning" },
      { id: "li-2", name: "SSS Employee", amount: -1125, type: "deduction" },
      { id: "li-3", name: "PhilHealth Employee", amount: -1400, type: "deduction" },
      { id: "li-4", name: "Pag-IBIG Employee", amount: -100, type: "deduction" },
      { id: "li-5", name: "Withholding Tax", amount: -32375, type: "deduction" }
    ]
  },
  {
    id: "w-2",
    name: "John Chen",
    country: "Singapore",
    countryFlag: "🇸🇬",
    type: "employee",
    base: 8500,
    currency: "SGD",
    adjustments: [{ id: "adj-2", type: "expense", label: "+Expense", amount: 120, hasReceipt: true, status: "client_review" }],
    deductions: 1700,
    netPay: 6920,
    employerCost: 1360,
    hasClientReviewItem: true,
    lineItems: [
      { id: "li-6", name: "Basic Salary", amount: 8500, type: "earning" },
      { id: "li-7", name: "CPF Employee", amount: -1700, type: "deduction" },
      { id: "li-8", name: "CPF Employer", amount: 1360, type: "contribution" }
    ]
  },
  {
    id: "w-3",
    name: "David Martinez",
    country: "Portugal",
    countryFlag: "🇵🇹",
    type: "contractor",
    base: 4200,
    currency: "EUR",
    adjustments: [{ id: "adj-3", type: "bonus", label: "+Bonus", amount: 500, status: "client_review" }],
    deductions: 0,
    netPay: 4700,
    hasClientReviewItem: true,
    lineItems: [
      { id: "li-9", name: "Base Consultancy Fee", amount: 4200, type: "earning" },
      { id: "li-10", name: "Q3 Bonus", amount: 500, type: "earning" }
    ]
  },
  {
    id: "w-4",
    name: "Sophie Laurent",
    country: "France",
    countryFlag: "🇫🇷",
    type: "employee",
    base: 5800,
    currency: "EUR",
    adjustments: [{ id: "adj-4", type: "correction", label: "Correction", amount: -200, status: "approved" }],
    deductions: 1450,
    netPay: 4150,
    employerCost: 1740,
    hasClientReviewItem: false,
    lineItems: [
      { id: "li-11", name: "Basic Salary", amount: 5800, type: "earning" },
      { id: "li-12", name: "Social Charges", amount: -1450, type: "deduction" },
      { id: "li-13", name: "Employer Charges", amount: 1740, type: "contribution" }
    ]
  },
  {
    id: "w-5",
    name: "Alex Hansen",
    country: "Norway",
    countryFlag: "🇳🇴",
    type: "employee",
    base: 65000,
    currency: "NOK",
    adjustments: [],
    deductions: 19500,
    netPay: 45500,
    employerCost: 9750,
    hasClientReviewItem: false,
    lineItems: [
      { id: "li-14", name: "Basic Salary", amount: 65000, type: "earning" },
      { id: "li-15", name: "Tax Withholding", amount: -19500, type: "deduction" },
      { id: "li-16", name: "Employer Tax", amount: 9750, type: "contribution" }
    ]
  },
  {
    id: "w-6",
    name: "Emma Wilson",
    country: "Norway",
    countryFlag: "🇳🇴",
    type: "contractor",
    base: 72000,
    currency: "NOK",
    adjustments: [{ id: "adj-5", type: "additional_hours", label: "+Hours", amount: 8500, status: "approved" }],
    deductions: 0,
    netPay: 80500,
    hasClientReviewItem: false,
    lineItems: [
      { id: "li-17", name: "Base Fee", amount: 72000, type: "earning" },
      { id: "li-18", name: "Additional Hours", amount: 8500, type: "earning" }
    ]
  },
  {
    id: "w-7",
    name: "Jose Reyes",
    country: "Philippines",
    countryFlag: "🇵🇭",
    type: "contractor",
    base: 245000,
    currency: "PHP",
    adjustments: [],
    deductions: 0,
    netPay: 245000,
    hasClientReviewItem: false,
    lineItems: [
      { id: "li-19", name: "Base Consultancy Fee", amount: 245000, type: "earning" }
    ]
  },
  {
    id: "w-8",
    name: "Marco Rossi",
    country: "Italy",
    countryFlag: "🇮🇹",
    type: "contractor",
    base: 4500,
    currency: "EUR",
    adjustments: [],
    deductions: 0,
    netPay: 4500,
    hasClientReviewItem: false,
    lineItems: [
      { id: "li-20", name: "Base Consultancy Fee", amount: 4500, type: "earning" }
    ]
  }
];

export const mockBatchSummary: CA_BatchSummary[] = [
  { currency: "PHP", workers: 3, adjustmentsTotal: 5000, employerCost: 42000, netToPay: 495000 },
  { currency: "EUR", workers: 3, adjustmentsTotal: 300, employerCost: 1740, netToPay: 13350 },
  { currency: "NOK", workers: 2, adjustmentsTotal: 8500, employerCost: 9750, netToPay: 126000 },
  { currency: "SGD", workers: 1, adjustmentsTotal: 120, employerCost: 1360, netToPay: 6920 }
];

export const mockAuditLog: CA_AuditEntry[] = [
  { id: "audit-1", action: "Batch created", user: "System", timestamp: "Today, 09:30" },
  { id: "audit-2", action: "3 adjustments flagged for review", user: "System", timestamp: "Today, 09:30" },
  { id: "audit-3", action: "FX rates locked", user: "Maria Santos", timestamp: "Today, 10:15" }
];

export const createMockBatch = (): CA_PaymentBatch => ({
  id: "batch-nov-2025",
  period: "November 2025",
  payoutDate: "November 30, 2025",
  status: "awaiting_approval",
  executionMode: "fronted",
  autoApproveTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  workers: mockBatchWorkers,
  clientReviewItems: mockClientReviewItems,
  blockers: [],
  summaryByCurrency: mockBatchSummary,
  auditLog: mockAuditLog,
  employeeCount: 4,
  contractorCount: 4
});
