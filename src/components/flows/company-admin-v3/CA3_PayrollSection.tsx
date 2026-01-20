import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { CA3_TopSummary } from "./CA3_TopSummary";
import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";
import { CA3_ReadinessIndicator } from "./CA3_ReadinessIndicator";
import { CA3_ReviewCheckCard, ReviewCheck, CheckSeverity, CheckStatus } from "./CA3_ReviewCheckCard";
import { CA3_FixCheckDrawer } from "./CA3_FixCheckDrawer";
import { CA3_SubmitConfirmationModal } from "./CA3_SubmitConfirmationModal";
import { CA3_TrackingView, TrackingWorker } from "./CA3_TrackingView";

// Mock data for the new streamlined UI
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

const mockTrackingWorkers: TrackingWorker[] = [
  { id: "1", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid" },
  { id: "2", name: "Sophie Laurent", country: "France", type: "employee", amount: 5800, currency: "EUR", status: "posted" },
  { id: "3", name: "Marco Rossi", country: "Italy", type: "contractor", amount: 4500, currency: "EUR", status: "processing" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "queued" },
  { id: "6", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid" },
  { id: "7", name: "Jose Reyes", country: "Philippines", type: "contractor", amount: 245000, currency: "PHP", status: "failed", errorMessage: "Bank rejected payment - invalid account" },
];

interface CA3_PayrollSectionProps {
  payPeriod: string;
}

export const CA3_PayrollSection: React.FC<CA3_PayrollSectionProps> = ({ payPeriod }) => {
  // Step state
  const [currentStep, setCurrentStep] = useState<CA3_PayrollStep>("review");
  const [completedSteps, setCompletedSteps] = useState<CA3_PayrollStep[]>([]);
  
  // Checks state
  const [checks, setChecks] = useState<ReviewCheck[]>(mockReviewChecks);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | CheckSeverity>("all");
  const [showResolved, setShowResolved] = useState(false);
  
  // Drawer/Modal state
  const [fixDrawerOpen, setFixDrawerOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<ReviewCheck | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  
  // Tracking state
  const [trackingWorkers, setTrackingWorkers] = useState<TrackingWorker[]>(mockTrackingWorkers);

  // Computed values
  const pendingChecks = useMemo(() => checks.filter(c => c.status === "pending"), [checks]);
  const blockingCount = useMemo(() => pendingChecks.filter(c => c.severity === "blocking").length, [pendingChecks]);
  const warningCount = useMemo(() => pendingChecks.filter(c => c.severity === "warning").length, [pendingChecks]);
  const infoCount = useMemo(() => pendingChecks.filter(c => c.severity === "info").length, [pendingChecks]);
  const isReady = blockingCount === 0;

  // Filtered checks
  const filteredChecks = useMemo(() => {
    return checks.filter(check => {
      // Status filter
      if (!showResolved && check.status !== "pending") return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!check.workerName.toLowerCase().includes(query) && 
            !check.title.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Severity filter
      if (severityFilter !== "all" && check.severity !== severityFilter) return false;
      
      return true;
    });
  }, [checks, searchQuery, severityFilter, showResolved]);

  // Group checks by severity for tabs
  const blockingChecks = filteredChecks.filter(c => c.severity === "blocking");
  const warningChecks = filteredChecks.filter(c => c.severity === "warning");
  const infoChecks = filteredChecks.filter(c => c.severity === "info");

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

  const handleContinueToResolve = () => {
    setCompletedSteps(prev => [...prev, "review"]);
    setCurrentStep("resolve");
  };

  const handleContinueToSubmit = () => {
    if (!isReady) {
      toast.error("Please resolve all blocking issues first");
      return;
    }
    setCompletedSteps(prev => [...prev, "resolve"]);
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

  const handleViewIssue = (worker: TrackingWorker) => {
    toast.info(`Viewing issue for ${worker.name}: ${worker.errorMessage}`);
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
          <div className="space-y-6">
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
            />

            {/* Quick action card */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
              <CardContent className="py-4 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Review your workers and payroll totals above.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Continue to resolve any checks before submitting.
                    </p>
                  </div>
                  <Button onClick={handleContinueToResolve} className="gap-2">
                    Continue to Resolve Checks
                    <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "resolve":
        return (
          <div className="space-y-6">
            {/* Readiness + Summary Row */}
            <div className="flex items-center justify-between">
              <CA3_ReadinessIndicator
                blockingCount={blockingCount}
                warningCount={warningCount}
                infoCount={infoCount}
                isReady={isReady}
              />
              
              <Button 
                onClick={handleContinueToSubmit} 
                disabled={!isReady}
                className="gap-2"
              >
                Continue to Submit
                <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by worker name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Tabbed checks view */}
            <Tabs defaultValue="blocking" className="w-full">
              <TabsList className="mb-4 bg-muted/30">
                <TabsTrigger value="blocking" className="text-xs gap-1.5 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600">
                  Blocking ({blockingCount})
                </TabsTrigger>
                <TabsTrigger value="warning" className="text-xs gap-1.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600">
                  Warnings ({warningCount})
                </TabsTrigger>
                <TabsTrigger value="info" className="text-xs gap-1.5 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
                  Info ({infoCount})
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">
                  All ({pendingChecks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blocking" className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {blockingChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No blocking issues. Ready to submit! ✓
                    </motion.div>
                  ) : (
                    blockingChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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

              <TabsContent value="warning" className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {warningChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No warnings to review.
                    </motion.div>
                  ) : (
                    warningChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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

              <TabsContent value="info" className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {infoChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No informational items.
                    </motion.div>
                  ) : (
                    infoChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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

              <TabsContent value="all" className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {pendingChecks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      All checks resolved! Ready to submit.
                    </motion.div>
                  ) : (
                    pendingChecks.map((check) => (
                      <motion.div
                        key={check.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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
          <div className="space-y-6">
            {/* Compact summary before submit */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
              <CardContent className="py-6 px-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green-fill/10 border border-accent-green-outline/30">
                    <span className="text-accent-green-text text-sm font-medium">
                      ✓ All checks resolved
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Ready to submit
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your batch is complete. Submit to Fronted for processing.
                    </p>
                  </div>

                  <div className="flex justify-center gap-6 py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">4</p>
                      <p className="text-xs text-muted-foreground">Employees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">5</p>
                      <p className="text-xs text-muted-foreground">Contractors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">$128.6K</p>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                    </div>
                  </div>

                  {warningCount > 0 && (
                    <p className="text-xs text-amber-600">
                      Note: {warningCount} warning{warningCount !== 1 ? 's' : ''} acknowledged and will proceed.
                    </p>
                  )}

                  <Button size="lg" onClick={handleOpenSubmitModal} className="gap-2 mt-4">
                    Submit to Fronted
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "track":
        return (
          <CA3_TrackingView
            workers={trackingWorkers}
            onViewIssue={handleViewIssue}
            onExportCSV={handleExportCSV}
            onDownloadAuditPDF={handleDownloadAuditPDF}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex justify-center">
        <CA3_PayrollStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          blockingCount={blockingCount}
        />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

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
