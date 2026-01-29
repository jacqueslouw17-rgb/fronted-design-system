/**
 * F1v4_CompanyPayrollRun - Company-level payroll run controller cockpit
 * 
 * Matches CA3_PayrollSection exactly:
 * - Landing view: KPI card with "Continue to submissions" button
 * - Workflow: Submissions → Exceptions → Approve → Track with back arrow navigation
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, Receipt, Building2, TrendingUp, Clock, CheckCircle2, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_SubmissionsView, WorkerSubmission } from "./F1v4_SubmissionsView";
import { F1v4_ExceptionsStep } from "./F1v4_ExceptionsStep";
import { F1v4_ApproveStep } from "./F1v4_ApproveStep";
import { F1v4_TrackStep } from "./F1v4_TrackStep";
import { F1v4_PeriodDropdown, PayrollPeriod } from "./F1v4_PeriodDropdown";

export type F1v4_PayrollStep = "submissions" | "exceptions" | "approve" | "track";

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
    lineItems: [
      { label: "Base Contract Fee", amount: 12000, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
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
    lineItems: [
      { label: "Base Salary", amount: 280000, type: "Earnings" },
      { label: "Income Tax", amount: -28000, type: "Deduction", locked: true },
      { label: "Social Security", amount: -14000, type: "Deduction", locked: true },
    ],
    submissions: [
      { type: "expenses", amount: 8500, description: "Travel reimbursement", status: "pending" },
      { type: "bonus", amount: 6500, description: "Q4 Performance Bonus", status: "pending" },
    ],
    pendingLeaves: [],
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
    lineItems: [
      { label: "Base Contract Fee", amount: 72000, type: "Earnings" },
    ],
    submissions: [
      { type: "expenses", amount: 3200, description: "Equipment purchase", status: "rejected", rejectionReason: "Missing receipt - please resubmit with documentation" },
    ],
    pendingLeaves: [],
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
    lineItems: [
      { label: "Base Salary", amount: 5800, type: "Earnings" },
      { label: "Income Tax", amount: -1160, type: "Deduction", locked: true },
      { label: "Social Security", amount: -290, type: "Deduction", locked: true },
    ],
    submissions: [],
    pendingLeaves: [],
  },
];

const MOCK_PERIODS: PayrollPeriod[] = [
  { id: "current", label: "January 2026", status: "current" },
  { id: "dec-2025", label: "December 2025", status: "paid" },
  { id: "nov-2025", label: "November 2025", status: "paid" },
];

export const F1v4_CompanyPayrollRun: React.FC<F1v4_CompanyPayrollRunProps> = ({
  company,
  initialStep,
}) => {
  // Period view state
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("current");
  
  // Workflow entered state - start on landing view
  const [hasEnteredWorkflow, setHasEnteredWorkflow] = useState(false);
  
  // Step state
  const [currentStep, setCurrentStep] = useState<F1v4_PayrollStep>("submissions");
  const [completedSteps, setCompletedSteps] = useState<F1v4_PayrollStep[]>([]);
  
  // Submissions state
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>(MOCK_SUBMISSIONS);
  
  // Exceptions count
  const [exceptionsCount, setExceptionsCount] = useState(company.blockingExceptions);
  
  // Submit/Approved state
  const [isApproved, setIsApproved] = useState(false);

  const employees = submissions.filter(w => w.workerType === "employee");
  const contractors = submissions.filter(w => w.workerType === "contractor");
  const isViewingPrevious = selectedPeriodId !== "current";

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => submissions.filter(s => s.status === "pending").length, [submissions]);

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    if (periodId !== "current") {
      setHasEnteredWorkflow(false);
    }
  };

  // Enter workflow
  const handleEnterWorkflow = () => {
    setHasEnteredWorkflow(true);
    setCurrentStep("submissions");
  };

  // Navigation handlers
  const goToExceptions = () => {
    setCompletedSteps(prev => [...prev, "submissions"]);
    setCurrentStep("exceptions");
  };

  const goToApprove = () => {
    setCompletedSteps(prev => {
      const steps: F1v4_PayrollStep[] = [...prev];
      if (!steps.includes("submissions")) steps.push("submissions");
      if (!steps.includes("exceptions")) steps.push("exceptions");
      return steps;
    });
    setCurrentStep("approve");
  };

  const goToTrack = () => {
    setCompletedSteps(prev => {
      const steps: F1v4_PayrollStep[] = [...prev];
      if (!steps.includes("submissions")) steps.push("submissions");
      if (!steps.includes("exceptions")) steps.push("exceptions");
      if (!steps.includes("approve")) steps.push("approve");
      return steps;
    });
    setIsApproved(true);
    setCurrentStep("track");
    toast.success("Payroll numbers approved and locked");
  };

  const handleResolveException = () => {
    setExceptionsCount(prev => Math.max(0, prev - 1));
    toast.success("Exception resolved");
  };

  // Back navigation
  const handleBack = () => {
    switch (currentStep) {
      case "submissions":
        setHasEnteredWorkflow(false);
        break;
      case "exceptions":
        setCurrentStep("submissions");
        break;
      case "approve":
        setCurrentStep("exceptions");
        break;
      case "track":
        // No back from track
        break;
    }
  };

  // Render summary card (landing view)
  const renderSummaryCard = () => {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardContent className="py-6 px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
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
            {!isViewingPrevious && (
              <Button onClick={handleEnterWorkflow} size="sm">
                Continue to submissions
              </Button>
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
              <p className="text-2xl font-semibold text-foreground">$124.9K</p>
              <p className="text-xs text-muted-foreground mt-1">Salaries + Contractor fees</p>
            </div>

            {/* Total Adjustments */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-sm">Adjustments</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">$8.2K</p>
              <p className="text-xs text-muted-foreground mt-1">Bonuses, overtime & expenses</p>
            </div>

            {/* Fronted Fees */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm">Fronted Fees</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">$3.7K</p>
              <p className="text-xs text-muted-foreground mt-1">Transaction + Service</p>
            </div>

            {/* Total Cost */}
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm">Total Cost</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">${(company.totalCost / 1000).toFixed(1)}K</p>
              <p className="text-xs text-muted-foreground mt-1">Pay + All Fees</p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-3 border-t border-border/30">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Employees: <strong className="text-foreground">{employees.length}</strong>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Contractors: <strong className="text-foreground">{contractors.length}</strong>
            </span>
            <span className="text-border">·</span>
            <span>Currencies: <strong className="text-foreground">{company.currencyCount}</strong></span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get step title for header
  const getStepTitle = (): string => {
    switch (currentStep) {
      case "submissions": return "Submissions";
      case "exceptions": return "Exceptions";
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
            submissions={submissions}
            onContinue={goToExceptions}
            onClose={() => setHasEnteredWorkflow(false)}
          />
        );
      case "exceptions":
        return (
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <h3 className="text-base font-medium text-foreground">Exceptions</h3>
                  {exceptionsCount > 0 && (
                    <Badge variant="destructive" className="text-xs">{exceptionsCount} blocking</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    onClick={goToApprove}
                    disabled={exceptionsCount > 0}
                    className="h-9 text-xs"
                  >
                    Continue to Approve
                  </Button>
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
              <F1v4_ExceptionsStep
                company={company}
                exceptionsCount={exceptionsCount}
                onResolve={handleResolveException}
                onContinue={goToApprove}
                hideHeader
              />
            </div>
          </Card>
        );
      case "approve":
        return (
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <h3 className="text-base font-medium text-foreground">Approve</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    onClick={goToTrack}
                    className="h-9 text-xs"
                  >
                    Approve & Lock
                  </Button>
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

  // Landing view - no stepper, just summary card
  if (!hasEnteredWorkflow) {
    return (
      <div className="max-w-6xl mx-auto p-8 pb-32 space-y-5">
        {renderSummaryCard()}
      </div>
    );
  }

  // Workflow view
  return (
    <div className="max-w-6xl mx-auto p-8 pb-32 space-y-5">
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
