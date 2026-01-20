import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { CA3_TopSummary, PayrollStatus } from "./CA3_TopSummary";
import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";
import { CA3_ReadinessIndicator } from "./CA3_ReadinessIndicator";
import { CA3_ReviewCheckCard, ReviewCheck, CheckSeverity, CheckStatus } from "./CA3_ReviewCheckCard";
import { CA3_SubmissionsView, WorkerSubmission } from "./CA3_SubmissionsView";
import { CA3_FixCheckDrawer } from "./CA3_FixCheckDrawer";
import { CA3_SubmitConfirmationModal } from "./CA3_SubmitConfirmationModal";
import { CA3_TrackingView, TrackingWorker } from "./CA3_TrackingView";
import { CA3_SubmitStep } from "./CA3_SubmitStep";

// Mock data for the streamlined UI
const mockReviewChecks: ReviewCheck[] = [
  {
    id: "check-1",
    workerId: "5",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    workerType: "contractor",
    title: "Missing bank details",
    description: "Payment can't be processed without IBAN or account number.",
    severity: "blocking",
    status: "pending",
    canFixNow: true,
  },
  {
    id: "check-2",
    workerId: "7",
    workerName: "Luis Hernandez",
    workerCountry: "Philippines",
    workerType: "contractor",
    title: "Currency mismatch",
    description: "Contract specifies PHP but preference is set to USD.",
    severity: "warning",
    status: "pending",
    canFixNow: false,
  },
  {
    id: "check-3",
    workerId: "6",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    workerType: "employee",
    title: "Missing withholding tax",
    description: "Withholding tax required before submitting.",
    severity: "blocking",
    status: "pending",
    canFixNow: true,
  },
  {
    id: "check-4",
    workerId: "2",
    workerName: "Sophie Laurent",
    workerCountry: "France",
    workerType: "employee",
    title: "Contract ending soon",
    description: "Employment ends Dec 15. Verify final pay adjustments.",
    severity: "info",
    status: "pending",
    canFixNow: false,
  },
];

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
];

const mockTrackingWorkers: TrackingWorker[] = [
  { id: "1", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid" },
  { id: "2", name: "Sophie Laurent", country: "France", type: "employee", amount: 5800, currency: "EUR", status: "posted" },
  { id: "3", name: "Marco Rossi", country: "Italy", type: "contractor", amount: 4500, currency: "EUR", status: "processing" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "queued" },
  { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid" },
  { id: "7", name: "Jose Reyes", country: "Philippines", type: "contractor", amount: 245000, currency: "PHP", status: "failed", errorMessage: "Bank rejected payment - invalid account number", fixInstructions: "Update bank details and retry.", canRetry: true },
];

interface CA3_PayrollSectionProps {
  payPeriod: string;
}

export const CA3_PayrollSection: React.FC<CA3_PayrollSectionProps> = ({ payPeriod }) => {
  // Step state - 5 steps now
  const [currentStep, setCurrentStep] = useState<CA3_PayrollStep>("review");
  const [completedSteps, setCompletedSteps] = useState<CA3_PayrollStep[]>([]);
  
  // Checks state
  const [checks, setChecks] = useState<ReviewCheck[]>(mockReviewChecks);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Submissions state
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>(mockSubmissions);
  
  // Drawer/Modal state
  const [fixDrawerOpen, setFixDrawerOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<ReviewCheck | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  
  // Tracking state
  const [trackingWorkers, setTrackingWorkers] = useState<TrackingWorker[]>(mockTrackingWorkers);

  // Computed values for checks
  const pendingChecks = useMemo(() => checks.filter(c => c.status === "pending"), [checks]);
  const blockingCount = useMemo(() => pendingChecks.filter(c => c.severity === "blocking").length, [pendingChecks]);
  const warningCount = useMemo(() => pendingChecks.filter(c => c.severity === "warning").length, [pendingChecks]);
  const infoCount = useMemo(() => pendingChecks.filter(c => c.severity === "info").length, [pendingChecks]);
  const isReady = blockingCount === 0;

  // Computed values for submissions
  const pendingSubmissions = useMemo(() => submissions.filter(s => s.status === "pending").length, [submissions]);

  // Filtered checks
  const filteredChecks = useMemo(() => {
    return pendingChecks.filter(check => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!check.workerName.toLowerCase().includes(query) && 
            !check.title.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [pendingChecks, searchQuery]);

  // Group checks by severity for tabs
  const blockingChecks = filteredChecks.filter(c => c.severity === "blocking");
  const warningChecks = filteredChecks.filter(c => c.severity === "warning");
  const infoChecks = filteredChecks.filter(c => c.severity === "info");

  // Get current payroll status based on step
  const getPayrollStatus = (): PayrollStatus => {
    if (currentStep === "track") return "processing";
    if (currentStep === "submit") return "ready";
    if (blockingCount > 0) return "checks-pending";
    return "in-review";
  };

  // Handlers
  const handleFixNow = (check: ReviewCheck) => {
    setSelectedCheck(check);
    setFixDrawerOpen(true);
  };

  const handleAcknowledge = (check: ReviewCheck) => {
    setChecks(prev => prev.map(c => 
      c.id === check.id ? { ...c, status: "acknowledged" as CheckStatus } : c
    ));
    toast.success(`Warning acknowledged for ${check.workerName}`);
  };

  const handleSkip = (check: ReviewCheck) => {
    setChecks(prev => prev.map(c => 
      c.id === check.id ? { ...c, status: "skipped" as CheckStatus } : c
    ));
    toast.info(`${check.workerName} skipped for this cycle`);
  };

  const handleSaveCheck = (checkId: string) => {
    setChecks(prev => prev.map(c => 
      c.id === checkId ? { ...c, status: "resolved" as CheckStatus } : c
    ));
    toast.success("Issue fixed. Batch recalculated.");
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

  const goToChecks = () => {
    setCompletedSteps(prev => [...prev, "submissions"]);
    setCurrentStep("checks");
  };

  const goToSubmit = () => {
    if (!isReady) {
      toast.error("Please resolve all blocking issues first");
      return;
    }
    setCompletedSteps(prev => [...prev, "checks"]);
    setCurrentStep("submit");
  };

  const handleOpenSubmitModal = () => {
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setSubmitModalOpen(false);
    setCompletedSteps(prev => [...prev, "submit"]);
    setCurrentStep("track");
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

  // Tracking handlers
  const handleViewIssue = (worker: TrackingWorker) => {
    toast.info(`Viewing issue for ${worker.name}: ${worker.errorMessage}`);
  };

  const handleRetryPayment = (worker: TrackingWorker) => {
    setTrackingWorkers(prev => prev.map(w => 
      w.id === worker.id ? { ...w, status: "processing" } : w
    ));
    toast.info(`Retrying payment for ${worker.name}`);
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
            onContinue={goToChecks}
          />
        );

      case "checks":
        return (
          <div className="space-y-4">
            {/* Header with readiness + action */}
            <div className="flex items-center justify-between">
              <CA3_ReadinessIndicator
                blockingCount={blockingCount}
                warningCount={warningCount}
                infoCount={infoCount}
                isReady={isReady}
              />
              
              <Button 
                onClick={goToSubmit} 
                disabled={!isReady}
                size="sm"
                className="gap-1.5"
              >
                Continue to Submit
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search workers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm w-56"
              />
            </div>

            {/* Tabbed checks view */}
            <Tabs defaultValue="blocking" className="w-full">
              <TabsList className="h-8 bg-muted/20">
                <TabsTrigger value="blocking" className="text-[11px] h-6 px-3 data-[state=active]:text-red-600">
                  Blocking ({blockingCount})
                </TabsTrigger>
                <TabsTrigger value="warning" className="text-[11px] h-6 px-3 data-[state=active]:text-amber-600">
                  Warnings ({warningCount})
                </TabsTrigger>
                <TabsTrigger value="info" className="text-[11px] h-6 px-3 data-[state=active]:text-blue-600">
                  Info ({infoCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blocking" className="mt-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {blockingChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 text-sm text-muted-foreground"
                    >
                      No blocking issues. Ready to submit! ✓
                    </motion.div>
                  ) : (
                    blockingChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <CA3_ReviewCheckCard
                          check={check}
                          onFixNow={handleFixNow}
                          onAcknowledge={handleAcknowledge}
                          onSkip={handleSkip}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="warning" className="mt-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {warningChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 text-sm text-muted-foreground"
                    >
                      No warnings.
                    </motion.div>
                  ) : (
                    warningChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <CA3_ReviewCheckCard
                          check={check}
                          onFixNow={handleFixNow}
                          onAcknowledge={handleAcknowledge}
                          onSkip={handleSkip}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="info" className="mt-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {infoChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 text-sm text-muted-foreground"
                    >
                      No info items.
                    </motion.div>
                  ) : (
                    infoChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <CA3_ReviewCheckCard
                          check={check}
                          onFixNow={handleFixNow}
                          onAcknowledge={handleAcknowledge}
                          onSkip={handleSkip}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "submit":
        return (
          <CA3_SubmitStep
            totalCost="$128,592"
            employeeCount={4}
            contractorCount={5}
            warningCount={warningCount}
            onSubmit={handleOpenSubmitModal}
          />
        );

      case "track":
        return (
          <CA3_TrackingView
            workers={trackingWorkers}
            onViewIssue={handleViewIssue}
            onRetry={handleRetryPayment}
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
      {/* Stepper - left aligned, minimal */}
      <CA3_PayrollStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        blockingCount={blockingCount}
        pendingSubmissions={pendingSubmissions}
      />

      {/* Step Content */}
      <div>
        {renderStepContent()}
      </div>

      {/* Fix Check Drawer */}
      <CA3_FixCheckDrawer
        open={fixDrawerOpen}
        onOpenChange={setFixDrawerOpen}
        check={selectedCheck}
        onSave={handleSaveCheck}
      />

      {/* Submit Confirmation Modal */}
      <CA3_SubmitConfirmationModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        onConfirm={handleConfirmSubmit}
        employeeCount={4}
        contractorCount={5}
        totalAmount="$128,592"
        warningCount={warningCount}
      />
    </div>
  );
};

export default CA3_PayrollSection;
