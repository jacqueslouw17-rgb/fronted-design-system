// Flow 6 v2 - Company Admin Dashboard - In-Place Batch Mock Data

import { 
  CA_InPlaceWorker, 
  CA_LeaveRequest, 
  CA_PayAdjustment, 
  CA_CurrencyTotal, 
  CA_InPlaceException,
  CA_InPlaceBatch 
} from "./CA_InPlaceTypes";

export const mockLeaveRequests: CA_LeaveRequest[] = [
  {
    id: "leave-1",
    workerId: "1",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerCountryFlag: "🇵🇭",
    leaveType: "annual",
    startDate: "Nov 15, 2025",
    endDate: "Nov 18, 2025",
    days: 3,
    status: "pending",
    notes: "Family vacation"
  },
  {
    id: "leave-2",
    workerId: "2",
    workerName: "Sophie Laurent",
    workerCountry: "France",
    workerCountryFlag: "🇫🇷",
    leaveType: "sick",
    startDate: "Nov 10, 2025",
    endDate: "Nov 11, 2025",
    days: 2,
    status: "pending"
  },
  {
    id: "leave-3",
    workerId: "4",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    workerCountryFlag: "🇳🇴",
    leaveType: "annual",
    startDate: "Nov 20, 2025",
    endDate: "Nov 22, 2025",
    days: 3,
    status: "approved"
  }
];

export const mockPayAdjustments: CA_PayAdjustment[] = [
  {
    id: "adj-1",
    workerId: "1",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerCountryFlag: "🇵🇭",
    type: "overtime",
    amount: 5000,
    currency: "PHP",
    description: "16 hours overtime in October",
    status: "pending"
  },
  {
    id: "adj-2",
    workerId: "3",
    workerName: "Marco Rossi",
    workerCountry: "Italy",
    workerCountryFlag: "🇮🇹",
    type: "expense",
    amount: 120,
    currency: "EUR",
    description: "Client meeting travel expenses",
    hasReceipt: true,
    status: "pending"
  },
  {
    id: "adj-3",
    workerId: "6",
    workerName: "Jose Reyes",
    workerCountry: "Philippines",
    workerCountryFlag: "🇵🇭",
    type: "bonus",
    amount: 15000,
    currency: "PHP",
    description: "Q4 performance bonus",
    status: "pending"
  },
  {
    id: "adj-4",
    workerId: "4",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    workerCountryFlag: "🇳🇴",
    type: "correction",
    amount: -2500,
    currency: "NOK",
    description: "Payroll correction from previous month",
    status: "approved"
  }
];

export const mockInPlaceWorkers: CA_InPlaceWorker[] = [
  // EUR Workers
  {
    id: "1",
    name: "Sophie Laurent",
    country: "France",
    countryFlag: "🇫🇷",
    currency: "EUR",
    type: "employee",
    base: 5800,
    adjustments: [],
    deductions: 1450,
    netPay: 4350,
    employerCost: 1740,
    status: "ready"
  },
  {
    id: "2",
    name: "Marco Rossi",
    country: "Italy",
    countryFlag: "🇮🇹",
    currency: "EUR",
    type: "contractor",
    base: 4500,
    adjustments: [
      { id: "a1", type: "expense", label: "Expense", amount: 120, hasReceipt: true }
    ],
    deductions: 0,
    netPay: 4620,
    status: "pending"
  },
  {
    id: "3",
    name: "David Martinez",
    country: "Portugal",
    countryFlag: "🇵🇹",
    currency: "EUR",
    type: "contractor",
    base: 4200,
    adjustments: [],
    deductions: 0,
    netPay: 4200,
    status: "ready"
  },
  // NOK Workers
  {
    id: "4",
    name: "Alex Hansen",
    country: "Norway",
    countryFlag: "🇳🇴",
    currency: "NOK",
    type: "employee",
    base: 65000,
    adjustments: [
      { id: "a2", type: "correction", label: "Correction", amount: -2500 }
    ],
    deductions: 9750,
    netPay: 52750,
    employerCost: 9750,
    status: "ready"
  },
  {
    id: "5",
    name: "Emma Wilson",
    country: "Norway",
    countryFlag: "🇳🇴",
    currency: "NOK",
    type: "contractor",
    base: 72000,
    adjustments: [],
    deductions: 0,
    netPay: 72000,
    status: "exception"
  },
  // PHP Workers
  {
    id: "6",
    name: "Maria Santos",
    country: "Philippines",
    countryFlag: "🇵🇭",
    currency: "PHP",
    type: "employee",
    base: 85000,
    adjustments: [
      { id: "a3", type: "overtime", label: "Overtime", amount: 5000 }
    ],
    deductions: 12750,
    netPay: 77250,
    employerCost: 12750,
    status: "pending"
  },
  {
    id: "7",
    name: "Jose Reyes",
    country: "Philippines",
    countryFlag: "🇵🇭",
    currency: "PHP",
    type: "contractor",
    base: 75000,
    adjustments: [
      { id: "a4", type: "bonus", label: "Bonus", amount: 15000 }
    ],
    deductions: 0,
    netPay: 90000,
    status: "pending"
  },
  {
    id: "8",
    name: "Luis Hernandez",
    country: "Philippines",
    countryFlag: "🇵🇭",
    currency: "PHP",
    type: "contractor",
    base: 68000,
    adjustments: [],
    deductions: 0,
    netPay: 68000,
    status: "ready",
    isManualMode: true
  }
];

export const mockCurrencyTotals: CA_CurrencyTotal[] = [
  {
    currency: "EUR",
    countries: ["France", "Italy", "Portugal"],
    employees: 1,
    contractors: 2,
    employeeTotal: 5800,
    contractorTotal: 8820,
    adjustmentsTotal: 120,
    employerCost: 1740,
    netToPay: 13170
  },
  {
    currency: "NOK",
    countries: ["Norway"],
    employees: 1,
    contractors: 1,
    employeeTotal: 65000,
    contractorTotal: 72000,
    adjustmentsTotal: -2500,
    employerCost: 9750,
    netToPay: 124750
  },
  {
    currency: "PHP",
    countries: ["Philippines"],
    employees: 1,
    contractors: 2,
    employeeTotal: 85000,
    contractorTotal: 143000,
    adjustmentsTotal: 20000,
    employerCost: 12750,
    netToPay: 235250
  }
];

export const mockInPlaceExceptions: CA_InPlaceException[] = [
  {
    id: "exc-1",
    workerId: "5",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    type: "missing_bank",
    description: "Bank account IBAN/routing number missing – cannot process payment",
    isBlocking: true,
    canResolve: true,
    resolved: false
  },
  {
    id: "exc-2",
    workerId: "7",
    workerName: "Jose Reyes",
    workerCountry: "Philippines",
    type: "bonus_threshold",
    description: "Bonus amount (₱15,000) exceeds company threshold (₱10,000)",
    isBlocking: false,
    canResolve: false,
    resolved: false
  },
  {
    id: "exc-3",
    workerId: "8",
    workerName: "Luis Hernandez",
    workerCountry: "Philippines",
    type: "manual_mode",
    description: "Worker is in manual payroll mode – verify amounts before execution",
    isBlocking: false,
    canResolve: false,
    resolved: false
  }
];

export const createMockInPlaceBatch = (): CA_InPlaceBatch => ({
  id: `batch-${Date.now()}`,
  period: "November 2025",
  payoutDate: "November 30, 2025",
  status: "draft",
  workers: mockInPlaceWorkers,
  currencyTotals: mockCurrencyTotals,
  exceptions: mockInPlaceExceptions,
  employeeCount: 3,
  contractorCount: 5
});
