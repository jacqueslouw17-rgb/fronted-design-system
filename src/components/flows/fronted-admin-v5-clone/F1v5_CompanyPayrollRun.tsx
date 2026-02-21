/**
 * F1v4_CompanyPayrollRun - Company-level payroll run controller cockpit
 * 
 * Matches CA3_PayrollSection exactly:
 * - Landing view: KPI card with "Continue to submissions" button
 * - Workflow: Submissions → Approve → Track with back arrow navigation
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, DollarSign, Receipt, Building2, TrendingUp, Clock, CheckCircle2, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyPayrollData } from "./F1v5_PayrollTab";
import { F1v4_SubmissionsView, WorkerSubmission } from "./F1v5_SubmissionsView";

import { F1v4_ApproveStep } from "./F1v5_ApproveStep";
import { F1v4_TrackStep } from "./F1v5_TrackStep";
import { F1v4_ApproveConfirmationModal } from "./F1v5_ApproveConfirmationModal";
import { F1v4_PeriodDropdown, PayrollPeriod } from "./F1v5_PeriodDropdown";
import { F1v4_PayrollStepper, F1v4_PayrollStep as StepperStep } from "./F1v5_PayrollStepper";
import { F1v4_HistoricalTrackingView } from "./F1v5_HistoricalTrackingView";
export type F1v4_PayrollStep = "submissions" | "approve" | "track";

import { HistoricalWorker } from "./F1v5_HistoricalTrackingView";

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
    currency: "SGD", 
    status: "ready",
    basePay: 12000,
    estimatedNet: 12000,
    totalImpact: 500,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "INV-2026-001",
    lineItems: [
      { label: "Base Contract Fee", amount: 12000, type: "Earnings" },
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
      { type: "expenses", amount: 8500, description: "Travel reimbursement", status: "pending",
        tags: ["NY trip", "Client visit"],
        attachments: [
          { id: "att-f1", fileName: "travel_receipt.pdf", fileType: "application/pdf", fileSize: "1.4 MB", url: "#", uploadedAt: "Jan 28, 2026", uploadedBy: "Maria Santos" },
          { id: "att-f2", fileName: "taxi_receipts.jpg", fileType: "image/jpeg", fileSize: "2.3 MB", url: "#", uploadedAt: "Jan 28, 2026", uploadedBy: "Maria Santos" },
        ],
        attachmentsCount: 2,
      },
      { type: "bonus", amount: 6500, description: "Q4 Performance Bonus", status: "pending",
        threadId: "thread-bonus-maria",
        previousSubmission: {
          submissionId: "prev-maria-1",
          threadId: "thread-bonus-maria",
          versionNumber: 1,
          submittedAt: "Jan 18, 2026",
          submittedBy: "Maria Santos",
          status: "rejected",
          decision: { decidedAt: "Jan 20, 2026", decidedBy: "Admin", reason: "Amount exceeds pre-approved bonus cap. Please resubmit with manager approval." },
          payload: { amount: 8000, currency: "PHP", label: "Q4 Performance Bonus", type: "bonus" },
          attachments: [],
        },
        attachments: [
          { id: "att-f3", fileName: "manager_approval.pdf", fileType: "application/pdf", fileSize: "250 KB", url: "#", uploadedAt: "Jan 22, 2026", uploadedBy: "Maria Santos" },
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
      { type: "overtime", amount: 4500, hours: 12, description: "12h overtime", status: "pending" },
    ],
    pendingLeaves: [
      { id: "leave-1", leaveType: "Unpaid", startDate: "2026-01-20", endDate: "2026-01-21", totalDays: 2, daysInThisPeriod: 2, status: "pending", dailyRate: 2955 },
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
    currency: "NOK", 
    status: "pending",
    basePay: 72000,
    estimatedNet: 72000,
    totalImpact: 3200,
    periodLabel: "Jan 1 – Jan 31",
    invoiceNumber: "INV-2026-006",
    lineItems: [
      { label: "Base Contract Fee", amount: 72000, type: "Earnings" },
    ],
    submissions: [
      { type: "expenses", amount: 2800, description: "Equipment purchase", status: "pending",
        attachments: [
          { id: "att-f4", fileName: "equipment_invoice.pdf", fileType: "application/pdf", fileSize: "890 KB", url: "#", uploadedAt: "Jan 27, 2026", uploadedBy: "Emma Wilson" },
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
      submissions: [{ type: "expenses", amount: 320, currency: "SGD", description: "Client meeting expenses", status: "pending" }],
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
      submissions: [{ type: "overtime", hours: 4, description: "Month-end close", amount: 280, status: "pending" }],
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
      submissions: [{ type: "expenses", amount: 8500, currency: "INR", description: "Software licenses", status: "pending" }],
      pendingLeaves: [],
      status: "pending",
      totalImpact: 8500,
      currency: "INR",
    },
  ],
};

// Multiple runs can be "in-review" simultaneously
const MOCK_PERIODS: PayrollPeriod[] = [
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

  // Get current run metrics and submissions
  const currentRunMetrics = RUN_METRICS[selectedPeriodId] || RUN_METRICS["jan-monthly"];
  const currentRunSubmissions = deduplicateByWorker(RUN_SUBMISSIONS[selectedPeriodId] || MOCK_SUBMISSIONS);

  const employees = currentRunSubmissions.filter(w => w.workerType === "employee");
  const contractors = currentRunSubmissions.filter(w => w.workerType === "contractor");
  
  // Determine if viewing historical (paid) run
  const selectedPeriodData = MOCK_PERIODS.find(p => p.id === selectedPeriodId);
  const isViewingPrevious = selectedPeriodData?.status === "paid";
  const selectedHistoricalPayroll = isViewingPrevious 
    ? HISTORICAL_PAYROLLS.find(p => p.id.includes(selectedPeriodId.replace("-monthly", "").replace("-fortnight-1", "").replace("-fortnight-2", ""))) 
    : null;

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => currentRunSubmissions.filter(s => s.status === "pending").length, [currentRunSubmissions]);

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    // Reset workflow when switching to a paid period
    const period = MOCK_PERIODS.find(p => p.id === periodId);
    if (period?.status === "paid") {
      setHasEnteredWorkflow(false);
    }
    // Reset step state when switching runs
    setCurrentStep("submissions");
    setCompletedSteps([]);
    setIsApproved(false);
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
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-visible">
        <CardContent className="py-6 px-6 overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-6 relative z-[101]">
              <F1v4_PeriodDropdown 
                periods={MOCK_PERIODS}
                selectedPeriodId={selectedPeriodId}
                onPeriodChange={handlePeriodChange}
              />
              {isViewingPrevious ? (
                <Badge variant="outline" className="bg-accent-green/10 text-accent-green-text border-accent-green/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                  <Clock className="h-3 w-3 mr-1" />
                  In review
                </Badge>
              )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Gross Pay */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm">Gross Pay</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">≈ {displayMetrics.grossPay}</p>
              <p className="text-xs text-muted-foreground mt-1">Salaries + Contractor fees</p>
            </div>

            {/* Total Adjustments */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-sm">Adjustments</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">≈ {displayMetrics.adjustments}</p>
              <p className="text-xs text-muted-foreground mt-1">Bonuses, overtime & expenses</p>
            </div>

            {/* Fronted Fees */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm">Fronted Fees</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{displayMetrics.fees}</p>
              <p className="text-xs text-muted-foreground mt-1">Transaction + Service</p>
            </div>

            {/* Total Cost */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm">Total Cost</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{displayMetrics.totalCost}</p>
              <p className="text-xs text-muted-foreground mt-1">Pay + All Fees</p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-3 border-t border-border/30">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Employees: <strong className="text-foreground">{displayMetrics.employeeCount}</strong>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Contractors: <strong className="text-foreground">{displayMetrics.contractorCount}</strong>
            </span>
            <span className="text-border">·</span>
            <span>Currencies: <strong className="text-foreground">{displayMetrics.currencyCount}</strong></span>
          </div>
        </CardContent>
      </Card>
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
            submissions={currentRunSubmissions}
            onContinue={goToApprove}
            onClose={() => setHasEnteredWorkflow(false)}
          />
        );
      case "approve":
        return (
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
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
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setHasEnteredWorkflow(false)}
                    className="h-9 text-xs"
                  >
                    Close
                  </Button>
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
          />
        );
      default:
        return null;
    }
  };

  // Historical view for previous periods
  if (isViewingPrevious) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-5">
        {renderSummaryCard()}
        {selectedHistoricalPayroll && (
          <F1v4_HistoricalTrackingView
            workers={selectedHistoricalPayroll.workers}
            paidDate={selectedHistoricalPayroll.paidDate}
          />
        )}
      </div>
    );
  }

  // Summary card + workflow step content below
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-5">
      {renderSummaryCard()}
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
