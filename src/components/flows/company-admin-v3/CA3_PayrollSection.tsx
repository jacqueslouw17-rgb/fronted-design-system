import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { ChevronRight, DollarSign, Receipt, Building2, TrendingUp, Clock, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";
import { CA3_SubmissionsView, WorkerSubmission } from "./CA3_SubmissionsView";
import { CA3_SubmitConfirmationModal } from "./CA3_SubmitConfirmationModal";
import { CA3_TrackingView, TrackingWorker } from "./CA3_TrackingView";
import { CA3_SubmitStep } from "./CA3_SubmitStep";

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
    status: "pending",
    totalImpact: 890,
    currency: "EUR",
  },
];

const mockTrackingWorkers: TrackingWorker[] = [
  { id: "1", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid" },
  { id: "2", name: "Sophie Laurent", country: "France", type: "employee", amount: 5800, currency: "EUR", status: "posted" },
  { id: "3", name: "Marco Rossi", country: "Italy", type: "contractor", amount: 4500, currency: "EUR", status: "processing" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "sent" },
  { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid" },
  { id: "7", name: "Jose Reyes", country: "Philippines", type: "contractor", amount: 245000, currency: "PHP", status: "failed", errorMessage: "Bank rejected payment - invalid account number. Contact Fronted support to update bank details." },
];

interface CA3_PayrollSectionProps {
  payPeriod: string;
}

export const CA3_PayrollSection: React.FC<CA3_PayrollSectionProps> = ({ payPeriod }) => {
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

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => submissions.filter(s => s.status === "pending").length, [submissions]);

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
  const renderSummaryCard = (isSubmitted: boolean = false) => (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardContent className="py-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{payPeriod} Payroll</h3>
              {isSubmitted ? (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                  <Clock className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                  <Clock className="h-3 w-3 mr-1" />
                  In review
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isSubmitted ? "Payroll submitted to Fronted for processing" : "Workers have 3 days left to submit"}
            </p>
          </div>
          {!isSubmitted && (
            <Button onClick={handleEnterWorkflow} size="sm" className="gap-1.5">
              Continue to submissions
              <ChevronRight className="h-3.5 w-3.5" />
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
            <p className="text-2xl font-semibold text-foreground">$3,742</p>
            <p className="text-xs text-muted-foreground mt-1">Transaction + Service</p>
          </div>

          {/* Total Cost */}
          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm">Total Cost</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">$128.6K</p>
            <p className="text-xs text-muted-foreground mt-1">Pay + All Fees</p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-3 border-t border-border/30">
          <span>Employees: <strong className="text-foreground">4</strong></span>
          <span className="text-border">·</span>
          <span>Contractors: <strong className="text-foreground">5</strong></span>
          <span className="text-border">·</span>
          <span>Currencies: <strong className="text-foreground">3</strong></span>
        </div>

        {/* CTA - only in landing view */}
      </CardContent>
    </Card>
  );

  // Render landing view (before entering workflow)
  const renderLandingView = () => renderSummaryCard(false);

  // Render track view with summary card above
  const renderTrackView = () => (
    <div className="space-y-6">
      {/* Summary card with submitted status */}
      {renderSummaryCard(true)}
      
      {/* Tracking view below */}
      <CA3_TrackingView
        workers={trackingWorkers}
        onExportCSV={handleExportCSV}
        onDownloadAuditPDF={handleDownloadAuditPDF}
        onClose={() => setHasEnteredWorkflow(false)}
      />
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "submissions":
        return (
          <CA3_SubmissionsView
            submissions={submissions}
            onApprove={handleApproveSubmission}
            onFlag={handleRejectSubmission}
            onApproveAll={handleApproveAllSafe}
            onContinue={goToSubmit}
            onClose={() => setHasEnteredWorkflow(false)}
            pendingCount={pendingSubmissions}
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

  // Workflow view - with stepper
  return (
    <div className="space-y-6">
      {/* Stepper - hidden after submission */}
      {!isPayrollSubmitted && (
        <CA3_PayrollStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          pendingSubmissions={pendingSubmissions}
        />
      )}

      {/* Step Content */}
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
