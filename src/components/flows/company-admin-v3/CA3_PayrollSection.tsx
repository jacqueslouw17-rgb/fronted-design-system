import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { DollarSign, Receipt, Building2, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";
import { CA3_SubmissionsView, WorkerSubmission, PendingLeaveItem } from "./CA3_SubmissionsView";
import { CA3_SubmitConfirmationModal } from "./CA3_SubmitConfirmationModal";
import { CA3_TrackingView, TrackingWorker } from "./CA3_TrackingView";
import { CA3_SubmitStep } from "./CA3_SubmitStep";
import { CA3_PeriodDropdown, PayrollPeriod } from "./CA3_PeriodDropdown";

const mockSubmissions: WorkerSubmission[] = [
  {
    id: "sub-1",
    workerId: "1",
    workerName: "David Martinez",
    workerCountry: "Portugal",
    workerType: "contractor",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 4200,
    estimatedNet: 4200,
    lineItems: [
      { type: "Earnings", label: "Base Rate", amount: 4200, locked: false },
    ],
    submissions: [
      { type: "timesheet", hours: 160, description: "October 2024" },
      { type: "expenses", amount: 245, currency: "EUR", description: "Travel expenses", status: "pending",
        tags: ["Lisbon offsite"],
        attachments: [
          { id: "att-1", fileName: "flight_receipt.pdf", fileType: "application/pdf", fileSize: "1.2 MB", url: "#", uploadedAt: "Jan 28, 2026", uploadedBy: "David Martinez" },
          { id: "att-2", fileName: "hotel_invoice.pdf", fileType: "application/pdf", fileSize: "840 KB", url: "#", uploadedAt: "Jan 28, 2026", uploadedBy: "David Martinez" },
        ],
        attachmentsCount: 2,
      },
    ],
    status: "pending",
    totalImpact: 245,
    currency: "EUR",
    flags: [
      { type: "end_date", endDate: "Jan 31, 2026", endReason: "Termination" },
    ],
  },
  {
    id: "sub-2",
    workerId: "2",
    workerName: "Sophie Laurent",
    workerCountry: "France",
    workerType: "employee",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 5800,
    estimatedNet: 4350,
    lineItems: [
      { type: "Earnings", label: "Base Salary", amount: 5800, locked: false },
      { type: "Deduction", label: "Income Tax", amount: -870, locked: true },
      { type: "Deduction", label: "Social Security", amount: -580, locked: true },
    ],
    submissions: [
      { type: "bonus", amount: 500, currency: "EUR", description: "Q4 performance bonus", status: "pending",
        threadId: "thread-bonus-sophie",
        previousSubmission: {
          submissionId: "prev-sophie-1",
          threadId: "thread-bonus-sophie",
          versionNumber: 1,
          submittedAt: "Jan 20, 2026",
          submittedBy: "Sophie Laurent",
          status: "rejected",
          decision: { decidedAt: "Jan 22, 2026", decidedBy: "Admin", reason: "Missing supporting documentation for Q4 bonus claim" },
          payload: { amount: 750, currency: "EUR", label: "Q4 performance bonus", type: "bonus" },
          attachments: [],
        },
        attachments: [
          { id: "att-3", fileName: "q4_review.pdf", fileType: "application/pdf", fileSize: "320 KB", url: "#", uploadedAt: "Jan 24, 2026", uploadedBy: "Sophie Laurent" },
        ],
        attachmentsCount: 1,
      },
    ],
    status: "pending",
    totalImpact: 500,
    currency: "EUR",
    flags: [
      { type: "end_date", endDate: "Feb 14, 2026", endReason: "Resignation" },
    ],
  },
  {
    id: "sub-3",
    workerId: "6",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerType: "employee",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 50000,
    estimatedNet: 38000,
    lineItems: [
      { type: "Earnings", label: "Base Salary", amount: 50000, locked: false },
      { type: "Earnings", label: "13th Month (pro-rated)", amount: 4166.67, locked: false },
      { type: "Deduction", label: "Income Tax", amount: -7500, locked: true },
      { type: "Deduction", label: "SSS Employee", amount: -2250, locked: true },
      { type: "Deduction", label: "PhilHealth Employee", amount: -1250, locked: true },
      { type: "Deduction", label: "Pag-IBIG Employee", amount: -1000, locked: true },
    ],
    submissions: [
      { type: "overtime", hours: 8, description: "Project deadline", amount: 3500, status: "pending" },
      { type: "expenses", amount: 1212, currency: "PHP", description: "Meals", status: "pending", tags: ["Client dinner"] },
    ],
    // Pending leave requests for this pay period - only unpaid leave affects payroll
    pendingLeaves: [],
    status: "pending",
    totalImpact: 4712,
    currency: "PHP",
    flags: [
      { type: "pay_change", payChangePercent: 22, payChangeDelta: 8500 },
    ],
  },
  {
    id: "sub-4",
    workerId: "4",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    workerType: "employee",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 65000,
    estimatedNet: 42250,
    lineItems: [
      { type: "Earnings", label: "Base Salary", amount: 65000, locked: false },
      { type: "Deduction", label: "Income Tax", amount: -15600, locked: true },
      { type: "Deduction", label: "Pension", amount: -4550, locked: true },
      { type: "Deduction", label: "National Insurance", amount: -2600, locked: true },
    ],
    submissions: [
      { type: "expenses", amount: 1200, currency: "NOK", description: "Home office equipment", status: "pending",
        attachments: [
          { id: "att-4", fileName: "ikea_receipt.jpg", fileType: "image/jpeg", fileSize: "2.1 MB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Alex Hansen" },
          { id: "att-5", fileName: "monitor_invoice.pdf", fileType: "application/pdf", fileSize: "156 KB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Alex Hansen" },
          { id: "att-6", fileName: "desk_receipt.png", fileType: "image/png", fileSize: "1.8 MB", url: "#", uploadedAt: "Jan 25, 2026", uploadedBy: "Alex Hansen" },
        ],
        attachmentsCount: 3,
      },
    ],
    // Pending unpaid leave (affects pay)
    pendingLeaves: [
      {
        id: "leave-alex-1",
        leaveType: "Unpaid",
        startDate: "2026-01-15",
        endDate: "2026-01-15",
        totalDays: 0.5,
        daysInThisPeriod: 0.5,
        reason: "Personal appointment (morning)",
        status: "pending",
        dailyRate: 2954.55, // 65000 / 22 working days
      },
    ],
    status: "pending",
    totalImpact: 1200,
    currency: "NOK",
  },
  {
    id: "sub-5",
    workerId: "5",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    workerType: "contractor",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 72000,
    estimatedNet: 72000,
    lineItems: [
      { type: "Earnings", label: "Contract Rate", amount: 72000, locked: false },
    ],
    submissions: [
      { type: "timesheet", hours: 168, description: "October 2024", status: "approved" },
      { type: "expenses", amount: 3200, currency: "NOK", description: "Software licenses", status: "pending" },
      { type: "bonus", amount: 5000, currency: "NOK", description: "Project completion bonus", status: "pending" },
    ],
    status: "pending",
    totalImpact: 8200,
    currency: "NOK",
    flags: [
      { type: "end_date", endDate: "Feb 15, 2026", endReason: "End contract" },
    ],
  },
  {
    id: "sub-6",
    workerId: "7",
    workerName: "Jonas Schmidt",
    workerCountry: "Germany",
    workerType: "employee",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 6200,
    estimatedNet: 4030,
    lineItems: [
      { type: "Earnings", label: "Base Salary", amount: 6200, locked: false },
      { type: "Deduction", label: "Income Tax", amount: -1240, locked: true },
      { type: "Deduction", label: "Health Insurance", amount: -465, locked: true },
      { type: "Deduction", label: "Pension Insurance", amount: -465, locked: true },
    ],
    submissions: [
      { type: "expenses", amount: 890, currency: "EUR", description: "Conference registration fee", status: "pending" },
    ],
    // No pending leaves - sick leave handled separately in Leaves tab
    pendingLeaves: [],
    status: "pending",
    totalImpact: 890,
    currency: "EUR",
  },
  {
    id: "sub-7",
    workerId: "8",
    workerName: "Priya Sharma",
    workerCountry: "India",
    workerType: "employee",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 150000,
    estimatedNet: 112500,
    lineItems: [
      { type: "Earnings", label: "Base Salary", amount: 150000, locked: false },
      { type: "Deduction", label: "Income Tax", amount: -22500, locked: true },
      { type: "Deduction", label: "PF Employee", amount: -12000, locked: true },
      { type: "Deduction", label: "ESI", amount: -3000, locked: true },
    ],
    submissions: [],
    // No pending leaves - compassionate leave handled separately in Leaves tab
    pendingLeaves: [],
    status: "ready",
    totalImpact: 0,
    currency: "INR",
  },
  {
    id: "sub-8",
    workerId: "9",
    workerName: "Lisa Chen",
    workerCountry: "Sweden",
    workerType: "employee",
    periodLabel: "Jan 1 – Jan 31",
    basePay: 55000,
    estimatedNet: 38500,
    lineItems: [
      { type: "Earnings", label: "Base Salary", amount: 55000, locked: false },
      { type: "Deduction", label: "Income Tax", amount: -11000, locked: true },
      { type: "Deduction", label: "Pension", amount: -3850, locked: true },
      { type: "Deduction", label: "Social Security", amount: -1650, locked: true },
    ],
    submissions: [
      { type: "bonus", amount: 5000, currency: "SEK", description: "Q4 performance bonus", status: "pending" },
    ],
    // No pending leaves - maternity leave handled separately in Leaves tab
    pendingLeaves: [],
    status: "pending",
    totalImpact: 5000,
    currency: "SEK",
  },
];

const mockTrackingWorkers: TrackingWorker[] = [
  { id: "1", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid" },
  { id: "2", name: "Sophie Laurent", country: "France", type: "employee", amount: 5800, currency: "EUR", status: "paid" },
  { id: "3", name: "Marco Rossi", country: "Italy", type: "contractor", amount: 4500, currency: "EUR", status: "paid" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "in-progress" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "in-progress" },
  { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "in-progress" },
  { id: "7", name: "Jose Reyes", country: "Philippines", type: "contractor", amount: 245000, currency: "PHP", status: "in-progress" },
];

// Previous payroll periods - immutable historical data
interface PreviousPayroll {
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
  workers: TrackingWorker[];
}

const previousPayrolls: PreviousPayroll[] = [
  {
    id: "dec-2025",
    period: "December 2025",
    paidDate: "Dec 28, 2025",
    grossPay: "$118.4K",
    adjustments: "$6.8K",
    fees: "$3,512",
    totalCost: "$121.9K",
    employeeCount: 4,
    contractorCount: 5,
    currencyCount: 3,
    workers: [
      { id: "1", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid" },
      { id: "2", name: "Sophie Laurent", country: "France", type: "employee", amount: 5800, currency: "EUR", status: "paid" },
      { id: "3", name: "Marco Rossi", country: "Italy", type: "contractor", amount: 4500, currency: "EUR", status: "paid" },
      { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid" },
      { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "paid" },
      { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid" },
      { id: "7", name: "Jose Reyes", country: "Philippines", type: "contractor", amount: 245000, currency: "PHP", status: "paid" },
    ],
  },
  {
    id: "nov-2025",
    period: "November 2025",
    paidDate: "Nov 28, 2025",
    grossPay: "$115.2K",
    adjustments: "$5.4K",
    fees: "$3,380",
    totalCost: "$118.6K",
    employeeCount: 4,
    contractorCount: 4,
    currencyCount: 3,
    workers: [
      { id: "1", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid" },
      { id: "2", name: "Sophie Laurent", country: "France", type: "employee", amount: 5800, currency: "EUR", status: "paid" },
      { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid" },
      { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "paid" },
      { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid" },
      { id: "7", name: "Jose Reyes", country: "Philippines", type: "contractor", amount: 245000, currency: "PHP", status: "paid" },
    ],
  },
];

// Per-run KPI metrics
const RUN_METRICS: Record<string, { grossPay: string; adjustments: string; fees: string; totalCost: string; employeeCount: number; contractorCount: number; currencyCount: number }> = {
  "jan-monthly": { grossPay: "$124.9K", adjustments: "$8.2K", fees: "$3,742", totalCost: "$128.6K", employeeCount: 4, contractorCount: 5, currencyCount: 3 },
  "jan-fortnight-2": { grossPay: "$62.4K", adjustments: "$3.1K", fees: "$1,890", totalCost: "$65.5K", employeeCount: 3, contractorCount: 2, currencyCount: 2 },
  "jan-fortnight-1": { grossPay: "$58.2K", adjustments: "$2.8K", fees: "$1,750", totalCost: "$61.0K", employeeCount: 2, contractorCount: 3, currencyCount: 2 },
  "dec-monthly": { grossPay: "$118.4K", adjustments: "$6.8K", fees: "$3,512", totalCost: "$121.9K", employeeCount: 4, contractorCount: 5, currencyCount: 3 },
  "nov-monthly": { grossPay: "$115.2K", adjustments: "$5.4K", fees: "$3,380", totalCost: "$118.6K", employeeCount: 4, contractorCount: 4, currencyCount: 3 },
};

// Per-run worker submissions (different workers per run)
const RUN_SUBMISSIONS: Record<string, WorkerSubmission[]> = {
  "jan-monthly": mockSubmissions,
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
      status: "pending",
      totalImpact: 280,
      currency: "GBP",
    },
    {
      id: "f2-sub-3",
      workerId: "f2-3",
      workerName: "Sofia Rodriguez",
      workerCountry: "Spain",
      workerType: "contractor",
      periodLabel: "Jan 15 – Jan 31",
      basePay: 4100,
      estimatedNet: 4100,
      lineItems: [{ type: "Earnings", label: "Design Services", amount: 4100, locked: false }],
      submissions: [],
      status: "ready",
      totalImpact: 0,
      currency: "EUR",
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
      status: "pending",
      totalImpact: 8500,
      currency: "INR",
    },
  ],
};

// Build periods array for dropdown - defined inside component to be dynamic
// Multiple runs can be "in-review" simultaneously
const buildPeriods = (isSubmitted: boolean): PayrollPeriod[] => [
  // Current active runs (can have multiple in-review)
  { 
    id: "jan-monthly", 
    frequency: "monthly", 
    periodLabel: "Jan 2026", 
    payDate: "30th", 
    status: isSubmitted ? "processing" : "in-review",
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

interface CA3_PayrollSectionProps {
  payPeriod: string;
}

export const CA3_PayrollSection: React.FC<CA3_PayrollSectionProps> = ({ payPeriod }) => {
  // Period view state - default to first "in-review" run
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("jan-monthly");
  
  // Workflow entered state - start on landing view
  const [hasEnteredWorkflow, setHasEnteredWorkflow] = useState(false);
  
  // Step state - 3 steps now (Submissions, Submit, Track)
  const [currentStep, setCurrentStep] = useState<CA3_PayrollStep>("submissions");
  const [completedSteps, setCompletedSteps] = useState<CA3_PayrollStep[]>([]);
  
  // Submissions state
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>(mockSubmissions);
  
  // Modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  
  // Submit state for in-place transition in Submit step
  const [isPayrollSubmitted, setIsPayrollSubmitted] = useState(false);
  
  // Tracking state
  const [trackingWorkers, setTrackingWorkers] = useState<TrackingWorker[]>(mockTrackingWorkers);

  // Get periods and determine if viewing historical (paid) run
  const periods = buildPeriods(isPayrollSubmitted);
  const selectedPeriodData = periods.find(p => p.id === selectedPeriodId);
  const isViewingPrevious = selectedPeriodData?.status === "paid";
  const selectedPrevious = isViewingPrevious 
    ? previousPayrolls.find(p => p.id.includes(selectedPeriodId.replace("-monthly", "").replace("-fortnight-1", "").replace("-fortnight-2", ""))) 
    : null;

  // Get current run metrics and submissions
  const currentRunMetrics = RUN_METRICS[selectedPeriodId] || RUN_METRICS["jan-monthly"];
  const currentRunSubmissionsRaw = RUN_SUBMISSIONS[selectedPeriodId] || mockSubmissions;

  // Deduplicate: 1 invoice/payslip per worker per pay period
  const STATUS_PRIORITY: Record<string, number> = { ready: 3, reviewed: 2, pending: 1, handover: 1, expired: 0 };
  const currentRunSubmissions = useMemo(() => {
    const seen = new Map<string, WorkerSubmission>();
    for (const w of currentRunSubmissionsRaw) {
      const existing = seen.get(w.workerId);
      if (!existing) {
        seen.set(w.workerId, w);
      } else {
        const existingPriority = STATUS_PRIORITY[existing.status] ?? 0;
        const newPriority = STATUS_PRIORITY[w.status] ?? 0;
        if (newPriority > existingPriority) {
          seen.set(w.workerId, w);
        }
      }
    }
    return Array.from(seen.values());
  }, [currentRunSubmissionsRaw]);

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => currentRunSubmissions.filter(s => s.status === "pending").length, [currentRunSubmissions]);

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    // Reset workflow when switching to a paid period
    const period = periods.find(p => p.id === periodId);
    if (period?.status === "paid") {
      setHasEnteredWorkflow(false);
    }
    // Reset step state when switching runs
    setCurrentStep("submissions");
    setCompletedSteps([]);
    setIsPayrollSubmitted(false);
  };

  const handleStepClick = (step: CA3_PayrollStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  // Enter workflow
  const handleEnterWorkflow = () => {
    setHasEnteredWorkflow(true);
    setCurrentStep("submissions");
  };

  // Navigation handlers
  const goToSubmit = () => {
    setCompletedSteps(prev => [...prev, "submissions"]);
    setCurrentStep("submit");
  };

  const handleOpenSubmitModal = () => {
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setSubmitModalOpen(false);
    setIsPayrollSubmitted(true);
    setCompletedSteps(prev => [...prev, "submit"]);
    toast.success("Batch submitted to Fronted for processing");
  };

  // Submission handlers - worker becomes "ready" when all adjustments reviewed
  const handleApproveSubmission = (submission: WorkerSubmission) => {
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: "ready" as const } : s
    ));
  };

  const handleRejectSubmission = (submission: WorkerSubmission, reason: string) => {
    // Rejecting an adjustment doesn't block - worker still becomes "ready"
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: "ready" as const } : s
    ));
  };

  const handleApproveAllSafe = () => {
    setSubmissions(prev => prev.map(s => 
      s.status === "pending" ? { ...s, status: "ready" as const } : s
    ));
    toast.success("All safe submissions approved");
  };

  const handleExportCSV = () => {
    toast.success("CSV exported");
  };

  const handleDownloadAuditPDF = () => {
    toast.success("Audit PDF downloaded");
  };

  // Render summary card (used in both landing and track views)
  const renderSummaryCard = (isSubmitted: boolean = false, metrics?: { grossPay: string; adjustments: string; fees: string; totalCost: string; employeeCount: number; contractorCount: number; currencyCount: number }) => {
    const displayMetrics = metrics || currentRunMetrics;
    
    const periodLabel = selectedPeriodData?.label || payPeriod;
    
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-visible">
        <CardContent className="py-4 px-4 sm:py-6 sm:px-6 overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 relative z-[101]">
            <div className="flex items-center gap-3 min-w-0">
              <CA3_PeriodDropdown 
                periods={periods}
                selectedPeriodId={selectedPeriodId}
                onPeriodChange={handlePeriodChange}
              />
              {isViewingPrevious ? (
                <Badge variant="outline" className="bg-accent-green/10 text-accent-green-text border-accent-green/20 flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              ) : isSubmitted ? (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 flex-shrink-0">
                  <Clock className="h-3 w-3 mr-1" />
                  In review
                </Badge>
              )}
            </div>
            {!isSubmitted && !isViewingPrevious && (
              <Button onClick={handleEnterWorkflow} size="sm" className="flex-shrink-0 whitespace-nowrap">
                <span className="sm:hidden">Continue</span>
                <span className="hidden sm:inline">Continue to submissions</span>
              </Button>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
            {/* Gross Pay */}
            <div className="bg-primary/[0.04] rounded-xl p-2.5 sm:p-4">
              <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm">Gross Pay</span>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.grossPay}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Salaries + Contractor fees</p>
            </div>

            {/* Total Adjustments */}
            <div className="bg-primary/[0.04] rounded-xl p-2.5 sm:p-4">
              <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm">Adjustments</span>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.adjustments}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Bonuses, overtime & expenses</p>
            </div>

            {/* Fronted Fees */}
            <div className="bg-primary/[0.04] rounded-xl p-2.5 sm:p-4">
              <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm">Fronted Fees</span>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.fees}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Transaction + Service</p>
            </div>

            {/* Total Cost */}
            <div className="bg-primary/[0.04] rounded-xl p-2.5 sm:p-4">
              <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm">Total Cost</span>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-foreground">{displayMetrics.totalCost}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Pay + All Fees</p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground py-3 border-t border-border/30 flex-wrap">
            <span>Employees: <strong className="text-foreground">{displayMetrics.employeeCount}</strong></span>
            <span className="text-border">·</span>
            <span>Contractors: <strong className="text-foreground">{displayMetrics.contractorCount}</strong></span>
            <span className="text-border">·</span>
            <span>Currencies: <strong className="text-foreground">{displayMetrics.currencyCount}</strong></span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render previous payroll view (immutable historical data) - reuses CA3_TrackingView
  const renderPreviousPayrollView = () => {
    if (!selectedPrevious) return null;

    return (
      <div className="space-y-6">
        {renderSummaryCard(false, {
          grossPay: selectedPrevious.grossPay,
          adjustments: selectedPrevious.adjustments,
          fees: selectedPrevious.fees,
          totalCost: selectedPrevious.totalCost,
          employeeCount: selectedPrevious.employeeCount,
          contractorCount: selectedPrevious.contractorCount,
          currencyCount: selectedPrevious.currencyCount,
        })}
        <CA3_TrackingView
          workers={selectedPrevious.workers}
          onExportCSV={handleExportCSV}
          onDownloadAuditPDF={handleDownloadAuditPDF}
          isHistorical={true}
          paidDate={selectedPrevious.paidDate}
        />
      </div>
    );
  };

  // Render landing view (before entering workflow)
  const renderLandingView = () => {
    // If viewing a previous period, show historical view instead
    if (isViewingPrevious) {
      return renderPreviousPayrollView();
    }
    return renderSummaryCard(false);
  };

  // Render track view with summary card above
  const renderTrackView = () => (
    <div className="space-y-6">
      {/* Summary card with submitted status */}
      {renderSummaryCard(true)}
      
      {/* Tracking view below - with stepper */}
      <CA3_TrackingView
        workers={trackingWorkers}
        onExportCSV={handleExportCSV}
        onDownloadAuditPDF={handleDownloadAuditPDF}
        onClose={() => setHasEnteredWorkflow(false)}
        onBack={() => setCurrentStep("submit")}
        showStepper={true}
        currentStep="track"
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "submissions":
        return (
          <CA3_SubmissionsView
            submissions={currentRunSubmissions}
            onApprove={handleApproveSubmission}
            onFlag={handleRejectSubmission}
            onApproveAll={handleApproveAllSafe}
            onContinue={goToSubmit}
            onClose={() => setHasEnteredWorkflow(false)}
            onBack={() => setHasEnteredWorkflow(false)}
            pendingCount={pendingSubmissions}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            pendingSubmissions={pendingSubmissions}
          />
        );

      case "submit":
        // Before submission: show CA3_SubmitStep
        // After submission: show summary card with tracking below
        if (isPayrollSubmitted) {
          return (
            <div className="space-y-6">
              {renderSummaryCard(true)}
              <CA3_TrackingView
                workers={trackingWorkers}
                onExportCSV={handleExportCSV}
                onDownloadAuditPDF={handleDownloadAuditPDF}
              />
            </div>
          );
        }
        return (
          <CA3_SubmitStep
            totalCost="$128,592"
            employeeCount={4}
            contractorCount={5}
            currencyCount={3}
            isSubmitted={false}
            onRequestSubmit={handleOpenSubmitModal}
            trackingWorkers={trackingWorkers}
            onExportCSV={handleExportCSV}
            onDownloadAuditPDF={handleDownloadAuditPDF}
            onBack={() => setCurrentStep("submissions")}
            onClose={() => setHasEnteredWorkflow(false)}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        );

      case "track":
        return null; // Track view is rendered separately with summary card

      default:
        return null;
    }
  };

  // Landing view - no stepper, just summary card
  if (!hasEnteredWorkflow) {
    return renderLandingView();
  }

  // Track view - summary card with tracking below
  if (currentStep === "track") {
    return (
      <>
        {renderTrackView()}
        {/* Submit Confirmation Modal */}
        <CA3_SubmitConfirmationModal
          open={submitModalOpen}
          onOpenChange={setSubmitModalOpen}
          onConfirm={handleConfirmSubmit}
          employeeCount={4}
          contractorCount={5}
          totalAmount="$128,592"
        />
      </>
    );
  }

  // Workflow view - stepper now embedded in each step's card header
  return (
    <div className="space-y-6">
      {/* Step Content - stepper is now inside each step component */}
      <div>
        {renderStepContent()}
      </div>

      {/* Submit Confirmation Modal */}
      <CA3_SubmitConfirmationModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        onConfirm={handleConfirmSubmit}
        employeeCount={4}
        contractorCount={5}
        totalAmount="$128,592"
      />
    </div>
  );
};

export default CA3_PayrollSection;
