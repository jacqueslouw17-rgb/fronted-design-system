// Flow 6 v2 - Company Admin Dashboard - Mock Payroll Data (Local to this flow only)

import { CA_Adjustment, CA_LeaveChange, CA_BlockingAlert, CA_FXTotalsRow, CA_WorkerPreviewRow } from "./CA_PayrollTypes";

export const mockAdjustments: CA_Adjustment[] = [
  {
    id: "adj-1",
    workerId: "w-1",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerCountryFlag: "🇵🇭",
    workerType: "employee",
    type: "overtime",
    amount: 5000,
    currency: "PHP",
    description: "Weekend overtime - project deadline",
    status: "pending",
    submittedAt: "2025-11-05T10:30:00Z"
  },
  {
    id: "adj-2",
    workerId: "w-2",
    workerName: "John Chen",
    workerCountry: "Singapore",
    workerCountryFlag: "🇸🇬",
    workerType: "employee",
    type: "expense",
    amount: 120,
    currency: "SGD",
    description: "Client lunch meeting",
    hasReceipt: true,
    status: "pending",
    submittedAt: "2025-11-04T14:15:00Z"
  },
  {
    id: "adj-3",
    workerId: "w-3",
    workerName: "David Martinez",
    workerCountry: "Portugal",
    workerCountryFlag: "🇵🇹",
    workerType: "contractor",
    type: "bonus",
    amount: 500,
    currency: "EUR",
    description: "Q3 performance bonus",
    status: "pending",
    submittedAt: "2025-11-03T09:00:00Z"
  },
  {
    id: "adj-4",
    workerId: "w-4",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    workerCountryFlag: "🇳🇴",
    workerType: "contractor",
    type: "additional_hours",
    amount: 8500,
    currency: "NOK",
    description: "10 additional hours @ 850 NOK/hr",
    status: "pending",
    submittedAt: "2025-11-02T16:45:00Z"
  },
  {
    id: "adj-5",
    workerId: "w-5",
    workerName: "Sophie Laurent",
    workerCountry: "France",
    workerCountryFlag: "🇫🇷",
    workerType: "employee",
    type: "correction",
    amount: -200,
    currency: "EUR",
    description: "Previous month overpayment correction",
    status: "auto_approved",
    submittedAt: "2025-11-01T08:00:00Z",
    approvedAt: "2025-11-01T08:00:00Z",
    approvedBy: "Policy: Auto-approve corrections < €500"
  }
];

export const mockLeaveChanges: CA_LeaveChange[] = [
  {
    id: "leave-1",
    workerId: "w-1",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerCountryFlag: "🇵🇭",
    workerType: "employee",
    leaveType: "annual",
    days: 2,
    startDate: "2025-11-18",
    endDate: "2025-11-19",
    description: "Annual leave - personal matters",
    status: "pending",
    submittedAt: "2025-11-01T09:00:00Z",
    impactAmount: -8000,
    currency: "PHP"
  },
  {
    id: "leave-2",
    workerId: "w-6",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    workerCountryFlag: "🇳🇴",
    workerType: "employee",
    leaveType: "sick",
    days: 1,
    startDate: "2025-11-12",
    endDate: "2025-11-12",
    description: "Sick leave - medical appointment",
    status: "pending",
    submittedAt: "2025-11-06T07:30:00Z",
    impactAmount: 0,
    currency: "NOK"
  }
];

export const mockBlockingAlerts: CA_BlockingAlert[] = [
  // No blocking alerts for a clean demo - can be toggled
];

export const mockFXTotalsData: CA_FXTotalsRow[] = [
  {
    currency: "PHP",
    countries: ["Philippines"],
    employeeCount: 1,
    contractorCount: 3,
    adjustmentsTotal: 5000,
    employerCost: 42000,
    netToPay: 790000
  },
  {
    currency: "EUR",
    countries: ["Portugal", "France", "Italy"],
    employeeCount: 1,
    contractorCount: 2,
    adjustmentsTotal: 300,
    employerCost: 1740,
    netToPay: 14800
  },
  {
    currency: "NOK",
    countries: ["Norway"],
    employeeCount: 1,
    contractorCount: 1,
    adjustmentsTotal: 8500,
    employerCost: 9750,
    netToPay: 145500
  }
];

export const mockEmployeePreviewData: CA_WorkerPreviewRow[] = [
  {
    id: "emp-1",
    name: "Maria Santos",
    country: "Philippines",
    countryFlag: "🇵🇭",
    base: 280000,
    currency: "PHP",
    adjustments: [{ label: "+Overtime", amount: 5000 }],
    deductions: 35000,
    netPay: 250000,
    isClientEditable: true
  },
  {
    id: "emp-2",
    name: "Sophie Laurent",
    country: "France",
    countryFlag: "🇫🇷",
    base: 5800,
    currency: "EUR",
    adjustments: [{ label: "Correction", amount: -200 }],
    deductions: 1450,
    netPay: 4150
  },
  {
    id: "emp-3",
    name: "Alex Hansen",
    country: "Norway",
    countryFlag: "🇳🇴",
    base: 65000,
    currency: "NOK",
    adjustments: [],
    deductions: 19500,
    netPay: 45500
  }
];

export const mockContractorPreviewData: CA_WorkerPreviewRow[] = [
  {
    id: "con-1",
    name: "David Martinez",
    country: "Portugal",
    countryFlag: "🇵🇹",
    base: 4200,
    currency: "EUR",
    adjustments: [{ label: "+Bonus", amount: 500 }],
    deductions: 0,
    netPay: 4700
  },
  {
    id: "con-2",
    name: "Emma Wilson",
    country: "Norway",
    countryFlag: "🇳🇴",
    base: 72000,
    currency: "NOK",
    adjustments: [{ label: "+Hours", amount: 8500 }],
    deductions: 0,
    netPay: 80500
  },
  {
    id: "con-3",
    name: "Jose Reyes",
    country: "Philippines",
    countryFlag: "🇵🇭",
    base: 245000,
    currency: "PHP",
    adjustments: [],
    deductions: 0,
    netPay: 245000
  },
  {
    id: "con-4",
    name: "Marco Rossi",
    country: "Italy",
    countryFlag: "🇮🇹",
    base: 4500,
    currency: "EUR",
    adjustments: [],
    deductions: 0,
    netPay: 4500
  }
];
