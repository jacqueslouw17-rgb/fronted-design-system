import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CA3_TopSummary, PayrollStatus } from "./CA3_TopSummary";
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
    submissions: [
      { type: "timesheet", hours: 160, description: "October 2024" },
      { type: "expenses", amount: 245, currency: "EUR", description: "Travel expenses" },
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
    submissions: [
      { type: "leave", days: 2, description: "Personal time" },
    ],
    status: "approved",
    currency: "EUR",
  },
  {
    id: "sub-3",
    workerId: "6",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerType: "employee",
    submissions: [
      { type: "overtime", hours: 8, description: "Project deadline" },
      { type: "bonus", amount: 15000, currency: "PHP", description: "Performance bonus" },
    ],
    status: "pending",
    totalImpact: 15000,
    currency: "PHP",
  },
  {
    id: "sub-4",
    workerId: "4",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    workerType: "employee",
    submissions: [
      { type: "expenses", amount: 1200, currency: "NOK", description: "Home office equipment" },
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
    submissions: [
      { type: "timesheet", hours: 168, description: "October 2024" },
    ],
    status: "approved",
    currency: "NOK",
  },
  {
    id: "sub-6",
    workerId: "7",
    workerName: "Jonas Schmidt",
    workerCountry: "Germany",
    workerType: "employee",
    submissions: [
      { type: "expenses", amount: 890, currency: "EUR", description: "Conference registration fee" },
    ],
    status: "rejected",
    totalImpact: 890,
    currency: "EUR",
    rejectionReason: "Amount exceeds policy limit",
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
  // Step state - 4 steps now (removed checks)
  const [currentStep, setCurrentStep] = useState<CA3_PayrollStep>("review");
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

  // Get current payroll status based on step
  const getPayrollStatus = (): PayrollStatus => {
    if (currentStep === "track") return "processing";
    if (currentStep === "submit") return "ready";
    return "in-review";
  };

  const handleStepClick = (step: CA3_PayrollStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  // Navigation handlers
  const goToSubmissions = () => {
    setCompletedSteps(prev => [...prev, "review"]);
    setCurrentStep("submissions");
  };

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

  // Submission handlers
  const handleApproveSubmission = (submission: WorkerSubmission) => {
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: "approved" } : s
    ));
  };

  const handleRejectSubmission = (submission: WorkerSubmission, reason: string) => {
    setSubmissions(prev => prev.map(s => 
      s.id === submission.id ? { ...s, status: "rejected" } : s
    ));
  };

  const handleApproveAllSafe = () => {
    setSubmissions(prev => prev.map(s => 
      s.status === "pending" ? { ...s, status: "approved" } : s
    ));
    toast.success("All safe submissions approved");
  };

  const handleExportCSV = () => {
    toast.success("CSV exported");
  };

  const handleDownloadAuditPDF = () => {
    toast.success("Audit PDF downloaded");
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "review":
        return (
          <div className="space-y-4">
            {/* Top Summary */}
            <CA3_TopSummary
              payPeriod={payPeriod}
              companyName="Acme Corp"
              grossPay={124850}
              netPay={98500}
              frontedFees={3742}
              totalCost={128592}
              employeeCount={4}
              contractorCount={5}
              currencyCount={3}
              status={getPayrollStatus()}
              paymentRails={["SEPA", "Local", "SWIFT"]}
              processingTime="2-3 days"
            />

            {/* Continue action */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Submit before <span className="font-medium text-foreground">Jan 25, 2026</span> — 5 days remaining
              </p>
              <Button onClick={goToSubmissions} size="sm" className="gap-1.5">
                Continue to Submissions
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );

      case "submissions":
        return (
          <CA3_SubmissionsView
            submissions={submissions}
            onApprove={handleApproveSubmission}
            onFlag={handleRejectSubmission}
            onApproveAll={handleApproveAllSafe}
            onContinue={goToSubmit}
          />
        );

      case "submit":
        return (
          <CA3_SubmitStep
            totalCost="$128,592"
            employeeCount={4}
            contractorCount={5}
            currencyCount={3}
            isSubmitted={isPayrollSubmitted}
            onRequestSubmit={handleOpenSubmitModal}
            trackingWorkers={trackingWorkers}
            onExportCSV={handleExportCSV}
            onDownloadAuditPDF={handleDownloadAuditPDF}
          />
        );

      case "track":
        return (
          <CA3_TrackingView
            workers={trackingWorkers}
            onExportCSV={handleExportCSV}
            onDownloadAuditPDF={handleDownloadAuditPDF}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper - hidden after submission */}
      {currentStep !== "track" && !isPayrollSubmitted && (
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
