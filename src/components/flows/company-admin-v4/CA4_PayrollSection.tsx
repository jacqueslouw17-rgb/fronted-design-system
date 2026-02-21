import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DollarSign, Receipt, Building2, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { CA4_PayrollStepper, CA4_PayrollStep } from "./CA4_PayrollStepper";
import { CA4_SubmissionsView, WorkerSubmission, PendingLeaveItem } from "./CA4_SubmissionsView";
import { CA4_SubmitConfirmationModal } from "./CA4_SubmitConfirmationModal";
import { CA4_TrackingView, TrackingWorker } from "./CA4_TrackingView";
import { CA4_SubmitStep } from "./CA4_SubmitStep";
import { CA4_PeriodDropdown, PayrollPeriod } from "./CA4_PeriodDropdown";
import { useCA4Agent } from "./CA4_AgentContext";

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
      { type: "expenses", amount: 245, currency: "EUR", description: "Travel expenses", status: "pending" },
    ],
    status: "pending",
    totalImpact: 245,
    currency: "EUR",
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
      { type: "bonus", amount: 500, currency: "EUR", description: "Q4 performance bonus", status: "pending" },
    ],
    status: "pending",
    totalImpact: 500,
    currency: "EUR",
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
      { type: "expenses", amount: 1212, currency: "PHP", description: "Meals", status: "pending" },
    ],
    // Pending leave requests for this pay period - only unpaid leave affects payroll
    pendingLeaves: [],
    status: "pending",
    totalImpact: 4712,
    currency: "PHP",
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
      { type: "expenses", amount: 1200, currency: "NOK", description: "Home office equipment", status: "pending" },
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
    ],
    status: "ready",
    currency: "NOK",
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
  { id: "3", name: "Marco Rossi", country: "Italy", type: "contractor", amount: 4500, currency: "EUR", status: "in-progress" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "in-progress" },
  { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid" },
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
    grossPay: "€109.7K",
    adjustments: "€6.3K",
    fees: "€3,256",
    totalCost: "€113.0K",
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
    grossPay: "€106.8K",
    adjustments: "€5.0K",
    fees: "€3,133",
    totalCost: "€109.9K",
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

// Build periods array for dropdown - defined inside component to be dynamic
const buildPeriods = (isSubmitted: boolean): PayrollPeriod[] => [
  { id: "current", label: "January 2026", status: isSubmitted ? "processing" : "current" },
  ...previousPayrolls.map(p => ({ id: p.id, label: p.period, status: "paid" as const })),
];

interface CA4_PayrollSectionProps {
  payPeriod: string;
}

export const CA4_PayrollSection: React.FC<CA4_PayrollSectionProps> = ({ payPeriod }) => {
  // Period view state - "current" = current, or previous period id
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("current");
  
  // Workflow entered state - start on landing view
  const [hasEnteredWorkflow, setHasEnteredWorkflow] = useState(false);
  
  // Step state - 3 steps now (Submissions, Submit, Track)
  const [currentStep, setCurrentStep] = useState<CA4_PayrollStep>("submissions");
  const [completedSteps, setCompletedSteps] = useState<CA4_PayrollStep[]>([]);
  
  // Submissions state
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>(mockSubmissions);
  
  // Modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  
  // Submit state for in-place transition in Submit step
  const [isPayrollSubmitted, setIsPayrollSubmitted] = useState(false);
  
  // Tracking state
  const [trackingWorkers, setTrackingWorkers] = useState<TrackingWorker[]>(mockTrackingWorkers);

  // Get selected previous payroll
  const isViewingPrevious = selectedPeriodId !== "current";
  const selectedPrevious = isViewingPrevious 
    ? previousPayrolls.find(p => p.id === selectedPeriodId) 
    : null;

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => submissions.filter(s => s.status === "pending").length, [submissions]);

  // Get agent context for coordinated navigation
  const { 
    requestedStep, 
    setRequestedStep, 
    isButtonLoading, 
    openWorkerId,
    setOpenWorkerId 
  } = useCA4Agent();

  // Respond to agent navigation requests
  useEffect(() => {
    if (requestedStep) {
      console.log('[CA4_PayrollSection] Received requestedStep:', requestedStep);
      // Navigate to the requested step
      if (requestedStep === 'submissions') {
        setHasEnteredWorkflow(true);
        setCurrentStep('submissions');
      } else if (requestedStep === 'submit') {
        setHasEnteredWorkflow(true);
        setCompletedSteps(prev => prev.includes('submissions') ? prev : [...prev, 'submissions']);
        setCurrentStep('submit');
      } else if (requestedStep === 'track') {
        setHasEnteredWorkflow(true);
        setCompletedSteps(['submissions', 'submit']);
        setCurrentStep('track');
      }
      // Clear the request after handling
      setRequestedStep(undefined);
    }
  }, [requestedStep, setRequestedStep]);

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    // Reset workflow when switching periods
    if (periodId !== "current") {
      setHasEnteredWorkflow(false);
    }
  };

  const handleStepClick = (step: CA4_PayrollStep) => {
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
    const displayMetrics = metrics || {
      grossPay: "€115.7K",
      adjustments: "€7.6K",
      fees: "€3,468",
      totalCost: "€119.2K",
      employeeCount: 4,
      contractorCount: 5,
      currencyCount: 3,
    };
    
    const periods = buildPeriods(isPayrollSubmitted);
    const selectedPeriodData = periods.find(p => p.id === selectedPeriodId);
    const periodLabel = selectedPeriodData?.label || payPeriod;
    
    return (
      <>
        {/* Period Selector — docks below header on scroll */}
        <div className="sticky top-14 sm:top-16 z-[101] -mx-4 sm:-mx-8 px-4 sm:px-8 py-2 bg-card/95 backdrop-blur-sm border-b border-border/30">
          <div className="flex items-center justify-center gap-2.5">
            <CA4_PeriodDropdown 
              periods={periods}
              selectedPeriodId={selectedPeriodId}
              onPeriodChange={handlePeriodChange}
            />
            {isViewingPrevious ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-green-text">
                <CheckCircle2 className="h-3 w-3" />
                Paid
              </span>
            ) : isSubmitted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <Clock className="h-3 w-3" />
                Processing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                In review
              </span>
            )}
          </div>
        </div>

        {/* KPI Metrics Card */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardContent className="py-4 px-4 sm:py-6 sm:px-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
              {/* Gross Pay */}
              <div className="bg-primary/[0.04] rounded-xl p-2.5 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Gross Pay</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">≈ {displayMetrics.grossPay}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Salaries + Contractor fees</p>
              </div>

              {/* Total Adjustments */}
              <div className="bg-primary/[0.04] rounded-xl p-2.5 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground mb-1 sm:mb-2">
                  <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm">Adjustments</span>
                </div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground">≈ {displayMetrics.adjustments}</p>
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
      </>
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
        <CA4_TrackingView
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
      <CA4_TrackingView
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
          <CA4_SubmissionsView
            submissions={submissions}
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
            agentOpenWorkerId={openWorkerId}
            onAgentOpenHandled={() => setOpenWorkerId(undefined)}
          />
        );

      case "submit":
        // Before submission: show CA3_SubmitStep
        // After submission: show summary card with tracking below
        if (isPayrollSubmitted) {
          return (
            <div className="space-y-6">
              {renderSummaryCard(true)}
              <CA4_TrackingView
                workers={trackingWorkers}
                onExportCSV={handleExportCSV}
                onDownloadAuditPDF={handleDownloadAuditPDF}
              />
            </div>
          );
        }
        return (
          <CA4_SubmitStep
            totalCost="€128,592"
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

  // Historical view for previous periods
  if (isViewingPrevious) {
    return renderPreviousPayrollView();
  }

  // Track view - summary card with tracking below
  if (currentStep === "track") {
    return (
      <>
        {renderTrackView()}
        <CA4_SubmitConfirmationModal
          open={submitModalOpen}
          onOpenChange={setSubmitModalOpen}
          onConfirm={handleConfirmSubmit}
          employeeCount={4}
          contractorCount={5}
          totalAmount="€128,592"
        />
      </>
    );
  }

  // Summary card + workflow step content below
  return (
    <div className="space-y-6">
      {!(currentStep === "submit" && isPayrollSubmitted) && renderSummaryCard(false)}
      <div>
        {renderStepContent()}
      </div>

      <CA4_SubmitConfirmationModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        onConfirm={handleConfirmSubmit}
        employeeCount={4}
        contractorCount={5}
        totalAmount="€128,592"
      />
    </div>
  );
};

export default CA4_PayrollSection;
