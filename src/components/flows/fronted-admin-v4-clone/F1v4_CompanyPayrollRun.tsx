/**
 * F1v4_CompanyPayrollRun - Company-level payroll run controller cockpit
 * 
 * Matches CA3_PayrollSection exactly:
 * - Landing view: KPI card with "Continue to submissions" button
 * - Workflow: Submissions → Approve → Track with back arrow navigation
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

import { motion } from "framer-motion";
import { ChevronLeft, DollarSign, Receipt, Building2, TrendingUp, Clock, CheckCircle2, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_SubmissionsView, WorkerSubmission } from "./F1v4_SubmissionsView";

import { F1v4_ApproveStep } from "./F1v4_ApproveStep";
import { F1v4_TrackStep } from "./F1v4_TrackStep";
import { F1v4_ApproveConfirmationModal } from "./F1v4_ApproveConfirmationModal";
import { F1v4_PeriodDropdown, PayrollPeriod } from "./F1v4_PeriodDropdown";
import { F1v4_PayrollStepper, F1v4_PayrollStep as StepperStep } from "./F1v4_PayrollStepper";
import { F1v4_HistoricalTrackingView } from "./F1v4_HistoricalTrackingView";
export type F1v4_PayrollStep = "submissions" | "approve" | "track";

import { HistoricalWorker } from "./F1v4_HistoricalTrackingView";

// Historical payroll data
interface HistoricalPayroll {
  id: string;
  period: string;
  paidDate: string;
  grossPay: string;
  adjustments: string;
  fees: string;
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount: number;
  workers: HistoricalWorker[];
}

const HISTORICAL_PAYROLLS: HistoricalPayroll[] = [
  {
    id: "dec-2025",
    period: "December 2025",
    paidDate: "Dec 28, 2025",
    grossPay: "€109.7K",
    adjustments: "€6.3K",
    fees: "€3,256",
    totalCost: "€113.0K",
    employeeCount: 3,
    contractorCount: 4,
    currencyCount: 3,
    workers: [
      { id: "1", name: "Marcus Chen", country: "Singapore", type: "contractor", amount: 11500, currency: "SGD", status: "paid", providerRef: "PAY-2025-112134" },
      { id: "2", name: "Sofia Rodriguez", country: "Spain", type: "contractor", amount: 6200, currency: "EUR", status: "paid", providerRef: "PAY-2025-112135" },
      { id: "3", name: "Maria Santos", country: "Philippines", type: "employee", amount: 275000, currency: "PHP", status: "paid", providerRef: "PAY-2025-112136" },
      { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 64000, currency: "NOK", status: "paid", providerRef: "PAY-2025-112137" },
      { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 70000, currency: "NOK", status: "paid", providerRef: "PAY-2025-112138" },
      { id: "6", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4100, currency: "EUR", status: "paid", providerRef: "PAY-2025-112139" },
      { id: "7", name: "Jonas Schmidt", country: "Germany", type: "employee", amount: 5700, currency: "EUR", status: "paid", providerRef: "PAY-2025-112140" },
    ],
  },
  {
    id: "nov-2025",
    period: "November 2025",
    paidDate: "Nov 28, 2025",
    grossPay: "€106.8K",
    adjustments: "€5.0K",
    fees: "€3,133",
    totalCost: "€109.9K",
    employeeCount: 3,
    contractorCount: 3,
    currencyCount: 3,
    workers: [
      { id: "1", name: "Marcus Chen", country: "Singapore", type: "contractor", amount: 11000, currency: "SGD", status: "paid", providerRef: "PAY-2025-111034" },
      { id: "2", name: "Sofia Rodriguez", country: "Spain", type: "contractor", amount: 6100, currency: "EUR", status: "paid", providerRef: "PAY-2025-111035" },
      { id: "3", name: "Maria Santos", country: "Philippines", type: "employee", amount: 270000, currency: "PHP", status: "paid", providerRef: "PAY-2025-111036" },
      { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 63000, currency: "NOK", status: "paid", providerRef: "PAY-2025-111037" },
      { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 68000, currency: "NOK", status: "paid", providerRef: "PAY-2025-111038" },
      { id: "6", name: "Jonas Schmidt", country: "Germany", type: "employee", amount: 5600, currency: "EUR", status: "paid", providerRef: "PAY-2025-111039" },
    ],
  },
];

interface F1v4_CompanyPayrollRunProps {
  company: CompanyPayrollData;
  initialStep?: number; // 1=submissions, 2=exceptions, 3=approve, 4=track
}

// Mock submissions data
const MOCK_SUBMISSIONS: WorkerSubmission[] = [
  { 
    id: "1", 
    workerId: "1",
    workerName: "Marcus Chen", 
    workerType: "contractor", 
    workerCountry: "Singapore", 
    currency: "EUR", 
    status: "ready",
    basePay: 8200,
    estimatedNet: 8200,
    totalImpact: 500,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "INV-2026-001",
    lineItems: [
      { label: "Base Contract Fee", amount: 8200, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
    flags: [
      { type: "end_date", endDate: "Jan 31, 2026", endReason: "Termination" },
    ],
  },
  { 
    id: "2", 
    workerId: "2",
    workerName: "Sofia Rodriguez", 
    workerType: "contractor", 
    workerCountry: "Spain", 
    currency: "EUR", 
    status: "ready",
    basePay: 6500,
    estimatedNet: 6500,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "INV-2026-002",
    lineItems: [
      { label: "Base Contract Fee", amount: 6500, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
  },
  { 
    id: "3", 
    workerId: "3",
    workerName: "Maria Santos", 
    workerType: "employee", 
    workerCountry: "Philippines", 
    currency: "PHP", 
    status: "pending",
    basePay: 280000,
    estimatedNet: 238000,
    totalImpact: 15000,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "PAY-2026-003",
    lineItems: [
      { label: "Base Salary", amount: 280000, type: "Earnings" },
      { label: "Income Tax", amount: -28000, type: "Deduction", locked: true },
      { label: "Social Security", amount: -14000, type: "Deduction", locked: true },
    ],
    submissions: [
      { type: "expenses", amount: 5200, description: "Travel", status: "pending",
        tags: ["NY trip"],
        attachments: [
          { id: "att-v4-1", fileName: "flight_booking.pdf", fileType: "application/pdf", fileSize: "2.1 MB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Maria Santos" },
          { id: "att-v4-1b", fileName: "hotel_confirmation.pdf", fileType: "application/pdf", fileSize: "1.4 MB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Maria Santos" },
          { id: "att-v4-1c", fileName: "boarding_pass.jpg", fileType: "image/jpeg", fileSize: "320 KB", url: "#", uploadedAt: "Jan 26, 2026", uploadedBy: "Maria Santos" },
        ],
        attachmentsCount: 3,
      },
      { type: "expenses", amount: 3300, description: "Meals", status: "pending",
        tags: ["NY trip"],
        attachments: [
          { id: "att-v4-2", fileName: "meal_receipts.jpg", fileType: "image/jpeg", fileSize: "156 KB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Maria Santos" },
          { id: "att-v4-2b", fileName: "restaurant_invoice.pdf", fileType: "application/pdf", fileSize: "98 KB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Maria Santos" },
        ],
        attachmentsCount: 2,
      },
      { type: "bonus", amount: 6500, description: "Q4 Performance Bonus", status: "pending",
        threadId: "thread-bonus-maria-v4",
        previousSubmission: {
          submissionId: "prev-maria-v4-1",
          threadId: "thread-bonus-maria-v4",
          versionNumber: 1,
          submittedAt: "Jan 18, 2026",
          submittedBy: "Maria Santos",
          status: "rejected",
          decision: { decidedAt: "Jan 20, 2026", decidedBy: "Admin", reason: "Amount exceeds pre-approved bonus cap. Please resubmit with manager approval." },
          payload: { amount: 8000, currency: "PHP", label: "Q4 Performance Bonus", type: "bonus" },
          attachments: [],
        },
        attachments: [
          { id: "att-v4-3", fileName: "manager_approval.pdf", fileType: "application/pdf", fileSize: "250 KB", url: "#", uploadedAt: "Jan 22, 2026", uploadedBy: "Maria Santos" },
        ],
        attachmentsCount: 1,
      },
      { type: "expenses", amount: 1200, description: "Taxi receipt", status: "pending",
        attachments: [
          { id: "att-v4-taxi", fileName: "taxi_receipt.jpg", fileType: "image/jpeg", fileSize: "89 KB", url: "#", uploadedAt: "Jan 26, 2026", uploadedBy: "Maria Santos" },
        ],
        attachmentsCount: 1,
      },
    ],
    pendingLeaves: [],
    flags: [
      { type: "pay_change", payChangePercent: 18, payChangeDelta: 8100 },
    ],
  },
  { 
    id: "4", 
    workerId: "4",
    workerName: "Alex Hansen", 
    workerType: "employee", 
    workerCountry: "Norway", 
    currency: "NOK", 
    status: "pending",
    basePay: 65000,
    estimatedNet: 52000,
    totalImpact: 4500,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "PAY-2026-004",
    lineItems: [
      { label: "Base Salary", amount: 65000, type: "Earnings" },
      { label: "Income Tax", amount: -9750, type: "Deduction", locked: true },
      { label: "Pension", amount: -3250, type: "Deduction", locked: true },
    ],
    submissions: [
      { type: "overtime", amount: 4500, hours: 12, description: "Jan 11 · 09:00–21:00", status: "pending" },
      { type: "expenses", amount: 750, description: "Parking", status: "pending",
        attachments: [
          { id: "att-v4-park", fileName: "parking_receipt.jpg", fileType: "image/jpeg", fileSize: "120 KB", url: "#", uploadedAt: "Jan 22, 2026", uploadedBy: "David Martinez" },
        ], attachmentsCount: 1,
      },
    ],
    pendingLeaves: [
      { id: "leave-1", leaveType: "Unpaid", startDate: "2026-01-20", endDate: "2026-01-21", totalDays: 2, daysInThisPeriod: 2, status: "pending", dailyRate: 2955, dateDescription: "20–21 Jan" },
    ],
    flags: [
      { type: "end_date", endDate: "Feb 14, 2026", endReason: "Resignation" },
    ],
  },
  { 
    id: "5", 
    workerId: "5",
    workerName: "David Martinez", 
    workerType: "contractor", 
    workerCountry: "Portugal", 
    currency: "EUR", 
    status: "ready",
    basePay: 4200,
    estimatedNet: 4200,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "INV-2026-005",
    
    lineItems: [
      { label: "Base Contract Fee", amount: 4200, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
  },
  { 
    id: "6", 
    workerId: "6",
    workerName: "Emma Wilson", 
    workerType: "contractor", 
    workerCountry: "Norway", 
    currency: "EUR", 
    status: "pending",
    basePay: 6770,
    estimatedNet: 6770,
    totalImpact: 3200,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "INV-2026-006",
    lineItems: [
      { label: "Base Contract Fee", amount: 6770, type: "Earnings" },
    ],
    submissions: [
      { type: "expenses", amount: 2800, description: "Equipment purchase", status: "pending",
        attachments: [
          { id: "att-v4-4", fileName: "equipment_invoice.pdf", fileType: "application/pdf", fileSize: "890 KB", url: "#", uploadedAt: "Jan 27, 2026", uploadedBy: "Emma Wilson" },
        ],
        attachmentsCount: 1,
      },
      { type: "timesheet", hours: 160, description: "January 2026", status: "pending" },
    ],
    pendingLeaves: [],
    flags: [
      { type: "end_date", endDate: "Feb 28, 2026", endReason: "End contract" },
    ],
  },
  { 
    id: "7", 
    workerId: "7",
    workerName: "Jonas Schmidt", 
    workerType: "employee", 
    workerCountry: "Germany", 
    currency: "EUR", 
    status: "ready",
    basePay: 5800,
    estimatedNet: 4350,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "PAY-2026-007",
    lineItems: [
      { label: "Base Salary", amount: 5800, type: "Earnings" },
      { label: "Income Tax", amount: -1160, type: "Deduction", locked: true },
      { label: "Social Security", amount: -290, type: "Deduction", locked: true },
    ],
    submissions: [],
    pendingLeaves: [],
  },
];

// Deduplicate: enforce 1 invoice/payslip per worker per pay period
// If backend data contains duplicates, keep the most advanced status (ready > pending)
// Mark extras as hidden — only the primary is shown
const STATUS_PRIORITY: Record<string, number> = { ready: 3, reviewed: 2, pending: 1 };
const deduplicateByWorker = (workers: WorkerSubmission[]): WorkerSubmission[] => {
  const seen = new Map<string, WorkerSubmission>();
  for (const w of workers) {
    const existing = seen.get(w.workerId);
    if (!existing) {
      seen.set(w.workerId, w);
    } else {
      const existingPriority = STATUS_PRIORITY[existing.status] ?? 0;
      const newPriority = STATUS_PRIORITY[w.status] ?? 0;
      if (newPriority > existingPriority) {
        seen.set(w.workerId, w); // keep higher-priority status
      }
    }
  }
  return Array.from(seen.values());
};

// Per-run KPI metrics
const RUN_METRICS: Record<string, { grossPay: string; adjustments: string; fees: string; totalCost: string; employeeCount: number; contractorCount: number; currencyCount: number }> = {
  "jan-monthly": { grossPay: "€115.7K", adjustments: "€7.6K", fees: "€3,468", totalCost: "€119.2K", employeeCount: 4, contractorCount: 5, currencyCount: 3 },
  "jan-fortnight-2": { grossPay: "€57.8K", adjustments: "€2.9K", fees: "€1,752", totalCost: "€60.7K", employeeCount: 3, contractorCount: 2, currencyCount: 2 },
  "jan-fortnight-1": { grossPay: "€53.9K", adjustments: "€2.6K", fees: "€1,622", totalCost: "€56.5K", employeeCount: 2, contractorCount: 3, currencyCount: 2 },
  "dec-monthly": { grossPay: "€109.7K", adjustments: "€6.3K", fees: "€3,256", totalCost: "€113.0K", employeeCount: 4, contractorCount: 5, currencyCount: 3 },
  "nov-monthly": { grossPay: "€106.8K", adjustments: "€5.0K", fees: "€3,133", totalCost: "€109.9K", employeeCount: 4, contractorCount: 4, currencyCount: 3 },
};

// Per-run worker submissions
const RUN_SUBMISSIONS: Record<string, WorkerSubmission[]> = {
  "jan-monthly": MOCK_SUBMISSIONS,
  "jan-fortnight-2": [
    {
      id: "f2-sub-1",
      workerId: "f2-1",
      workerName: "Marcus Chen",
      workerCountry: "Singapore",
      workerType: "contractor",
      periodLabel: "Jan 15 – Jan 31",
      basePay: 8500,
      estimatedNet: 8500,
      lineItems: [{ type: "Earnings", label: "Consulting Fee", amount: 8500, locked: false }],
      submissions: [{ type: "expenses", amount: 320, currency: "SGD", description: "Client meeting expenses", status: "pending",
        attachments: [
          { id: "att-v4-mc1", fileName: "meeting_receipt.pdf", fileType: "application/pdf", fileSize: "340 KB", url: "#", uploadedAt: "Jan 20, 2026", uploadedBy: "Marcus Chen" },
        ], attachmentsCount: 1,
      }],
      pendingLeaves: [],
      status: "pending",
      totalImpact: 320,
      currency: "SGD",
    },
    {
      id: "f2-sub-2",
      workerId: "f2-2",
      workerName: "Emma Wilson",
      workerCountry: "UK",
      workerType: "employee",
      periodLabel: "Jan 15 – Jan 31",
      basePay: 3200,
      estimatedNet: 2450,
      lineItems: [
        { type: "Earnings", label: "Base Salary", amount: 3200, locked: false },
        { type: "Deduction", label: "Income Tax", amount: -480, locked: true },
        { type: "Deduction", label: "NI", amount: -270, locked: true },
      ],
      submissions: [{ type: "overtime", hours: 4, description: "Jan 31 · 17:00–21:00", amount: 280, status: "pending" }],
      pendingLeaves: [],
      status: "pending",
      totalImpact: 280,
      currency: "GBP",
    },
  ],
  "jan-fortnight-1": [
    {
      id: "f1-sub-1",
      workerId: "f1-1",
      workerName: "Takeshi Yamamoto",
      workerCountry: "Japan",
      workerType: "employee",
      periodLabel: "Jan 1 – Jan 14",
      basePay: 420000,
      estimatedNet: 315000,
      lineItems: [
        { type: "Earnings", label: "Base Salary", amount: 420000, locked: false },
        { type: "Deduction", label: "Income Tax", amount: -63000, locked: true },
        { type: "Deduction", label: "Social Insurance", amount: -42000, locked: true },
      ],
      submissions: [{ type: "bonus", amount: 50000, currency: "JPY", description: "New year bonus", status: "pending" }],
      pendingLeaves: [],
      status: "pending",
      totalImpact: 50000,
      currency: "JPY",
    },
    {
      id: "f1-sub-2",
      workerId: "f1-2",
      workerName: "Priya Sharma",
      workerCountry: "India",
      workerType: "contractor",
      periodLabel: "Jan 1 – Jan 14",
      basePay: 180000,
      estimatedNet: 180000,
      lineItems: [{ type: "Earnings", label: "Development Fee", amount: 180000, locked: false }],
      submissions: [{ type: "expenses", amount: 8500, currency: "INR", description: "Software licenses", status: "pending",
        attachments: [
          { id: "att-v4-ps1", fileName: "license_invoice.pdf", fileType: "application/pdf", fileSize: "1.2 MB", url: "#", uploadedAt: "Jan 18, 2026", uploadedBy: "Priya Sharma" },
        ], attachmentsCount: 1,
      }],
      pendingLeaves: [],
      status: "pending",
      totalImpact: 8500,
      currency: "INR",
    },
  ],
};

// Multiple runs can be "in-review" simultaneously
const MOCK_PERIODS_BASE: PayrollPeriod[] = [
  // Current active runs (can have multiple in-review)
  { 
    id: "jan-monthly", 
    frequency: "monthly", 
    periodLabel: "Jan 2026", 
    payDate: "30th", 
    status: "in-review",
    label: "January 2026"
  },
  { 
    id: "jan-fortnight-2", 
    frequency: "fortnightly", 
    periodLabel: "Jan 15–31", 
    payDate: "30th", 
    status: "in-review",
    label: "Jan 15-31 2026"
  },
  { 
    id: "jan-fortnight-1", 
    frequency: "fortnightly", 
    periodLabel: "Jan 1–14", 
    payDate: "15th", 
    status: "in-review",
    label: "Jan 1-14 2026"
  },
  // Historical paid runs
  { 
    id: "dec-monthly", 
    frequency: "monthly", 
    periodLabel: "Dec 2025", 
    payDate: "30th", 
    status: "paid",
    label: "December 2025"
  },
  { 
    id: "nov-monthly", 
    frequency: "monthly", 
    periodLabel: "Nov 2025", 
    payDate: "30th", 
    status: "paid",
    label: "November 2025"
  },
];

export const F1v4_CompanyPayrollRun: React.FC<F1v4_CompanyPayrollRunProps> = ({
  company,
  initialStep,
}) => {

  // Period view state - default to first "in-review" run
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("jan-monthly");
  
  // Workflow entered state - start on landing view
  const [hasEnteredWorkflow, setHasEnteredWorkflow] = useState(false);
  
  // Step state
  const [currentStep, setCurrentStep] = useState<F1v4_PayrollStep>("submissions");
  const [completedSteps, setCompletedSteps] = useState<F1v4_PayrollStep[]>([]);
  
  // Submissions state
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>(MOCK_SUBMISSIONS);
  
  // Submit/Approved state
  const [isApproved, setIsApproved] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isAllPaid, setIsAllPaid] = useState(false);

  // Custom batch state
  const [customBatches, setCustomBatches] = useState<PayrollPeriod[]>([]);

  // Get current run metrics and submissions
  const currentRunMetrics = RUN_METRICS[selectedPeriodId] || RUN_METRICS["jan-monthly"];
  const currentRunSubmissions = deduplicateByWorker(RUN_SUBMISSIONS[selectedPeriodId] || MOCK_SUBMISSIONS);
  
  // Dynamic periods - include custom batches
  const periods = useMemo(() => {
    const basePeriods = MOCK_PERIODS_BASE.map(p => {
      if (p.id === selectedPeriodId && isAllPaid) return { ...p, status: "paid" as const };
      if (p.id === selectedPeriodId && isApproved) return { ...p, status: "processing" as const };
      return p;
    });
    return [...basePeriods, ...customBatches.map(cb => {
      if (cb.id === selectedPeriodId && isAllPaid) return { ...cb, status: "paid" as const };
      if (cb.id === selectedPeriodId && isApproved) return { ...cb, status: "processing" as const };
      return cb;
    })];
  }, [selectedPeriodId, isApproved, isAllPaid, customBatches]);

  // Determine if viewing historical (paid) run — but NOT if it just got paid in this session
  const selectedPeriodData = periods.find(p => p.id === selectedPeriodId);
  const isViewingPrevious = selectedPeriodData?.status === "paid" && !isAllPaid;
  const isCustomBatch = selectedPeriodData?.isCustomBatch === true;
  const selectedHistoricalPayroll = isViewingPrevious 
    ? HISTORICAL_PAYROLLS.find(p => p.id.includes(selectedPeriodId.replace("-monthly", "").replace("-fortnight-1", "").replace("-fortnight-2", ""))) 
    : null;

  // For custom batches: show only workers with pending adjustments, no base salary
  const customBatchSubmissions = useMemo((): WorkerSubmission[] => {
    if (!isCustomBatch) return [];
    return MOCK_SUBMISSIONS
      .filter(w => w.submissions.some(s => s.status === "pending") || w.pendingLeaves?.some(l => l.status === "pending"))
      .map(w => {
        const adjTotal = w.submissions.filter(s => s.status === "pending").reduce((sum, s) => sum + (s.amount || 0), 0);
        const taxRate = w.workerType === "employee" ? 0.10 : 0;
        const taxAmount = Math.round(adjTotal * taxRate);
        return {
          ...w,
          id: `custom-${w.id}`,
          basePay: 0,
          estimatedNet: adjTotal - taxAmount,
          totalImpact: adjTotal,
          periodLabel: "Off-cycle",
          lineItems: w.workerType === "employee" && taxAmount > 0
            ? [{ label: "Income Tax (on adjustments)", amount: -taxAmount, type: "Deduction" as const, locked: true }]
            : [],
        };
      });
  }, [isCustomBatch]);

  const displaySubmissions = isCustomBatch ? customBatchSubmissions : currentRunSubmissions;
  const employees = displaySubmissions.filter(w => w.workerType === "employee");
  const contractors = displaySubmissions.filter(w => w.workerType === "contractor");

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => displaySubmissions.filter(s => s.status === "pending").length, [displaySubmissions]);

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    const period = MOCK_PERIODS_BASE.find(p => p.id === periodId) || customBatches.find(p => p.id === periodId);
    if (period?.status === "paid") {
      setHasEnteredWorkflow(false);
    }
    setCurrentStep("submissions");
    setCompletedSteps([]);
    setIsApproved(false);
    setIsAllPaid(false);
  };

  // Create custom off-cycle batch
  const handleCreateCustomBatch = (payDate: string) => {
    const date = new Date(payDate);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;
    const batchId = `custom-${Date.now()}`;
    
    const newBatch: PayrollPeriod = {
      id: batchId,
      frequency: "monthly",
      periodLabel: `Pay ${dayLabel}`,
      payDate: dayLabel,
      status: "in-review",
      label: `Off-cycle ${dayLabel}`,
      isCustomBatch: true,
    };
    
    setCustomBatches(prev => [...prev, newBatch]);
    setSelectedPeriodId(batchId);
    setCurrentStep("submissions");
    setCompletedSteps([]);
    setIsApproved(false);
    setIsAllPaid(false);
    setHasEnteredWorkflow(false);
    toast.success(`Off-cycle batch created for ${dayLabel}`);
  };

  // Enter workflow
  const handleEnterWorkflow = () => {
    setHasEnteredWorkflow(true);
    setCurrentStep("submissions");
  };

  // Navigation handlers
  const goToApprove = () => {
    setCompletedSteps(prev => [...prev, "submissions"]);
    setCurrentStep("approve");
  };

  const goToTrack = () => {
    setCompletedSteps(prev => {
      const steps: F1v4_PayrollStep[] = [...prev];
      if (!steps.includes("submissions")) steps.push("submissions");
      if (!steps.includes("approve")) steps.push("approve");
      return steps;
    });
    setIsApproved(true);
    setCurrentStep("track");
    toast.success("Payroll numbers approved and locked");
  };


  // Back navigation
  const handleBack = () => {
    switch (currentStep) {
      case "submissions":
        setHasEnteredWorkflow(false);
        break;
      case "approve":
        setCurrentStep("submissions");
        break;
      case "track":
        // No back from track
        break;
    }
  };

  // Get display metrics based on period selection - use per-run metrics
  const displayMetrics = isViewingPrevious && selectedHistoricalPayroll 
    ? {
        grossPay: selectedHistoricalPayroll.grossPay,
        adjustments: selectedHistoricalPayroll.adjustments,
        fees: selectedHistoricalPayroll.fees,
        totalCost: selectedHistoricalPayroll.totalCost,
        employeeCount: selectedHistoricalPayroll.employeeCount,
        contractorCount: selectedHistoricalPayroll.contractorCount,
        currencyCount: selectedHistoricalPayroll.currencyCount,
      }
    : currentRunMetrics;

  // Render summary card (landing view)
   const renderSummaryCard = () => {
    return (
      <>
        {/* Period Selector */}
        <div className={cn("flex items-center justify-center pt-2", isCustomBatch ? "pb-0" : "pb-4")}>
          <F1v4_PeriodDropdown 
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onPeriodChange={handlePeriodChange}
            allowCustomBatch={company.id === "company-default"}
            onCreateCustomBatch={handleCreateCustomBatch}
          />
        </div>

        {/* KPI Metrics Card - hidden for custom batches */}
        {!isCustomBatch && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardContent className="py-6 px-6">
            {/* Metrics Grid - 5 equal tiles */}
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-visible pb-1">
              <div className="flex sm:grid sm:grid-cols-5 gap-3 w-max sm:w-auto">
              {/* Gross Pay */}
              <div className="w-36 sm:w-auto bg-primary/[0.04] rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Gross Pay</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">≈ {displayMetrics.grossPay}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Salaries + Contractor fees</p>
              </div>

              {/* Adjustments */}
              <div className="w-36 sm:w-auto bg-primary/[0.04] rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Adj. Requests</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">≈ {displayMetrics.adjustments}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Bonuses, overtime & expenses</p>
              </div>

              {/* Employees */}
              <div className="w-36 sm:w-auto bg-primary/[0.04] rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Employees</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.employeeCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Active this period</p>
              </div>

              {/* Contractors */}
              <div className="w-36 sm:w-auto bg-primary/[0.04] rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Contractors</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.contractorCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Active this period</p>
              </div>

              {/* Currencies */}
              <div className="w-36 sm:w-auto bg-primary/[0.04] rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Currencies</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.currencyCount}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Multi-currency run</p>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </>
    );
  };

  // Get step title for header
  const getStepTitle = (): string => {
    switch (currentStep) {
      case "submissions": return "Submissions";
      case "approve": return "Approve";
      case "track": return "Track & Reconcile";
      default: return "";
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "submissions":
        return (
          <F1v4_SubmissionsView
            submissions={displaySubmissions}
            onContinue={goToApprove}
            onClose={() => setHasEnteredWorkflow(false)}
            isCustomBatch={isCustomBatch}
          />
        );
      case "approve":
        return (
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <F1v4_PayrollStepper
                    currentStep="approve"
                    completedSteps={completedSteps as StepperStep[]}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    onClick={() => setIsApproveModalOpen(true)}
                    className="h-9 text-xs"
                  >
                    Approve & Lock
                  </Button>
                  <F1v4_ApproveConfirmationModal
                    open={isApproveModalOpen}
                    onOpenChange={setIsApproveModalOpen}
                    onConfirm={goToTrack}
                    companyName={company.name}
                    employeeCount={employees.length}
                    contractorCount={contractors.length}
                    totalAmount={`€${(company.totalCost / 1000).toFixed(1)}K`}
                  />
                </div>
              </div>
            </div>
            <div className="p-5">
              <F1v4_ApproveStep
                company={company}
                onApprove={goToTrack}
                hideHeader
              />
            </div>
          </Card>
        );
      case "track":
        return (
          <F1v4_TrackStep
            company={company}
            hideSummaryCard
            onAllPaid={() => setIsAllPaid(true)}
          />
        );
      default:
        return null;
    }
  };

  // Historical view for previous periods
  if (isViewingPrevious) {
    return (
      <div className="mx-auto px-4 sm:px-8 pt-3 pb-4">
        <div className="mb-5">
          {renderSummaryCard()}
        </div>
        <div>
          {selectedHistoricalPayroll && (
            <F1v4_HistoricalTrackingView
              workers={selectedHistoricalPayroll.workers}
              paidDate={selectedHistoricalPayroll.paidDate}
            />
          )}
        </div>
      </div>
    );
  }

  // Summary card + workflow step content below
  return (
    <div className="mx-auto px-4 sm:px-8 pt-3 pb-4">
      <div className="mb-5">
        {renderSummaryCard()}
      </div>
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderStepContent()}
      </motion.div>
    </div>
  );
};

export default F1v4_CompanyPayrollRun;
