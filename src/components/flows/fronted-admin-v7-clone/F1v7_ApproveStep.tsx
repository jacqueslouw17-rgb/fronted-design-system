/**
 * F1v5_ApproveStep - Final approval step with sign-off confirmation
 * 
 * Includes a client switcher in the hero payout card that dynamically
 * filters totals and ledger to show per-client or all-clients data.
 */

import React, { useState, useMemo } from "react";
import { 
  CheckCircle2,
  Users,
  Briefcase,
  Globe,
  FileCheck,
  ChevronLeft,
  XCircle,
  Clock,
  AlertCircle,
  UserMinus,
  Building2,
  ChevronDown,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v7_PayrollTab";
import { F1v4_PayrollStepper, F1v4_PayrollStep } from "./F1v7_PayrollStepper";
import { F1v4_ApproveConfirmationModal } from "./F1v7_ApproveConfirmationModal";
import { WorkerSubmission } from "./F1v7_SubmissionsView";

interface F1v4_ApproveStepProps {
  company: CompanyPayrollData;
  onApprove: () => void;
  onBack?: () => void;
  onClose?: () => void;
  hideHeader?: boolean;
  isCustomBatch?: boolean;
  submissions?: WorkerSubmission[];
  currentStep?: F1v4_PayrollStep;
  completedSteps?: F1v4_PayrollStep[];
  onStepClick?: (step: F1v4_PayrollStep) => void;
  pendingWorkerCount?: number;
  excludedWorkerCount?: number;
}

const ALL_CLIENTS_KEY = "__all__";

export const F1v4_ApproveStep: React.FC<F1v4_ApproveStepProps> = ({
  company,
  onApprove,
  onBack,
  onClose,
  hideHeader = false,
  isCustomBatch = false,
  submissions = [],
  currentStep = "approve",
  completedSteps = ["submissions", "exceptions"],
  onStepClick,
  pendingWorkerCount = 0,
  excludedWorkerCount = 0,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(ALL_CLIENTS_KEY);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  // Extract unique client names from submissions
  const clientNames = useMemo(() => {
    const names = new Set<string>();
    submissions.forEach(s => {
      if (s.companyName) names.add(s.companyName);
    });
    return Array.from(names).sort();
  }, [submissions]);

  const hasMultipleClients = clientNames.length > 1;

  // Filter submissions by selected client
  const filteredSubmissions = useMemo(() => {
    if (selectedClient === ALL_CLIENTS_KEY) return submissions;
    return submissions.filter(s => s.companyName === selectedClient);
  }, [submissions, selectedClient]);

  // Compute totals from filtered submissions
  const computeTotals = (workers: WorkerSubmission[]) => {
    const employeeCount = workers.filter(w => w.workerType === "employee").length;
    const contractorCount = workers.filter(w => w.workerType === "contractor").length;
    const currencies = new Set(workers.map(w => w.currency).filter(Boolean));

    let totalApprovedAmount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let rejectedAmount = 0;
    let skippedCount = 0;
    let totalRequests = 0;

    workers.forEach(w => {
      w.submissions.forEach(s => {
        totalRequests++;
        if (s.status === "approved") {
          approvedCount++;
          totalApprovedAmount += s.amount || 0;
        } else if (s.status === "rejected") {
          rejectedCount++;
          rejectedAmount += s.amount || 0;
        } else {
          skippedCount++;
        }
      });
    });

    const employeeTotalApproved = workers
      .filter(w => w.workerType === "employee")
      .reduce((sum, w) => sum + w.submissions.filter(s => s.status === "approved").reduce((s2, s) => s2 + (s.amount || 0), 0), 0);
    const totalDeductions = Math.round(employeeTotalApproved * 0.10);
    const netPayout = totalApprovedAmount - totalDeductions;
    const fees = Math.round(netPayout * 0.03);

    // For regular batches, compute base compensation from basePay
    const totalBasePay = workers.reduce((sum, w) => sum + (w.basePay || 0), 0);

    return {
      employeeCount,
      contractorCount,
      currencyCount: currencies.size,
      totalApprovedAmount,
      totalDeductions,
      netPayout,
      fees,
      totalCost: isCustomBatch ? netPayout + fees : totalBasePay + totalApprovedAmount + Math.round((totalBasePay + totalApprovedAmount) * 0.032),
      approvedCount,
      rejectedCount,
      rejectedAmount,
      skippedCount,
      workerCount: workers.length,
      totalRequests,
      totalBasePay,
    };
  };

  const displayData = useMemo(() => {
    if (filteredSubmissions.length > 0) {
      return computeTotals(filteredSubmissions);
    }
    // Fallback for no submissions
    return {
      employeeCount: company.employeeCount,
      contractorCount: company.contractorCount,
      currencyCount: company.currencyCount,
      totalApprovedAmount: 6300,
      totalDeductions: 0,
      netPayout: company.totalCost,
      fees: 3792,
      totalCost: company.totalCost,
      approvedCount: 3,
      rejectedCount: 1,
      rejectedAmount: 1200,
      skippedCount: 0,
      workerCount: company.employeeCount + company.contractorCount,
      totalRequests: 4,
      totalBasePay: 118500,
    };
  }, [filteredSubmissions, company, isCustomBatch]);

  const timelineSteps = isCustomBatch
    ? [
        { id: 1, title: "Approve & lock off-cycle", description: "Sign off on adjustment payouts", active: true },
        { id: 2, title: "Generate payslips/invoices", description: "Additional docs for tax purposes", active: false },
        { id: 3, title: "External payment", description: "Processed outside Fronted", active: false },
        { id: 4, title: "Track & reconcile", description: "Mark as paid/not paid", active: false },
      ]
    : [
        { id: 1, title: "Approve & lock run", description: "Sign off on payroll numbers", active: true },
        { id: 2, title: "Generate payment summary", description: "Bank list and payslips ready", active: false },
        { id: 3, title: "External payment", description: "Processed outside Fronted", active: false },
        { id: 4, title: "Track & reconcile", description: "Mark as paid/not paid", active: false },
      ];

  // Client switcher pill component
  const renderClientSwitcher = () => {
    if (!hasMultipleClients) return null;

    const allOptions = [
      { key: ALL_CLIENTS_KEY, label: "All Clients", count: submissions.length },
      ...clientNames.map(name => ({
        key: name,
        label: name,
        count: submissions.filter(s => s.companyName === name).length,
      })),
    ];

    return (
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-primary/[0.04] border border-primary/10 overflow-x-auto scrollbar-hide">
        {allOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelectedClient(opt.key)}
            className={cn(
              "relative px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all duration-200",
              selectedClient === opt.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
            )}
          >
            {opt.label}
            <span className={cn(
              "ml-1 tabular-nums",
              selectedClient === opt.key ? "text-primary-foreground/70" : "text-muted-foreground/60"
            )}>
              ({opt.count})
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderBatchOverview = () => {
    const selectedLabel = selectedClient === ALL_CLIENTS_KEY
      ? `${clientNames.length} clients`
      : selectedClient;

    if (isCustomBatch) {
      return (
        <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
          <div className="p-5 space-y-5">
            {/* Hero payout */}
            <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <p className="text-xs text-primary/70 mb-1">Off-cycle payout total</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedClient}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-3xl font-semibold text-primary tracking-tight">{formatCurrency(displayData.totalCost)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {displayData.workerCount} worker{displayData.workerCount !== 1 ? "s" : ""} · {displayData.totalRequests} adjustment{displayData.totalRequests !== 1 ? "s" : ""} · USD → EUR 1.0842
                  </p>
                </motion.div>
              </AnimatePresence>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Transfer this amount outside of Fronted to complete the pay run
              </p>

              {/* Client switcher */}
              {hasMultipleClients && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                  {renderClientSwitcher()}
                </div>
              )}
            </div>

            {/* Financial ledger */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedClient}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="rounded-lg border border-border/40 bg-card/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                      Approved adjustments ({displayData.approvedCount})
                    </span>
                    <span className="text-accent-green-text font-medium tabular-nums">+{formatCurrency(displayData.totalApprovedAmount)}</span>
                  </div>
                  
                  {displayData.rejectedCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <XCircle className="h-3 w-3 text-muted-foreground/50" />
                        Rejected ({displayData.rejectedCount})
                      </span>
                      <span className="text-muted-foreground/60 tabular-nums line-through">{formatCurrency(displayData.rejectedAmount)}</span>
                    </div>
                  )}

                  {displayData.totalDeductions > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tax deductions (employees)</span>
                      <span className="text-foreground tabular-nums">-{formatCurrency(displayData.totalDeductions)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fronted fees (3%)</span>
                    <span className="text-foreground tabular-nums">{formatCurrency(displayData.fees)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/40">
                    <span className="text-foreground font-medium">Net payout</span>
                    <span className="text-primary font-semibold tabular-nums">{formatCurrency(displayData.netPayout)}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Excluded / pending workers info */}
            {(pendingWorkerCount > 0 || excludedWorkerCount > 0) && (
              <div className="space-y-2">
                {pendingWorkerCount > 0 && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{pendingWorkerCount} worker{pendingWorkerCount !== 1 ? "s" : ""}</span> skipped — adjustments remain open for the next batch.
                    </p>
                  </div>
                )}
                {excludedWorkerCount > 0 && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <UserMinus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{excludedWorkerCount} worker{excludedWorkerCount !== 1 ? "s" : ""}</span> excluded from this batch.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
        <div className="p-5 space-y-5">
          {/* Hero payout */}
          <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <p className="text-xs text-primary/70 mb-1">
              {selectedClient !== ALL_CLIENTS_KEY ? `${selectedClient} payout` : "Total payout"}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedClient}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-3xl font-semibold text-primary tracking-tight">{formatCurrency(displayData.totalCost)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {displayData.workerCount} worker{displayData.workerCount !== 1 ? "s" : ""}
                  {selectedClient === ALL_CLIENTS_KEY && hasMultipleClients && ` · ${clientNames.length} clients`}
                  {" · "}USD → EUR 1.0842
                </p>
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Transfer this amount outside of Fronted to complete the pay run
            </p>

            {/* Client switcher */}
            {hasMultipleClients && (
              <div className="mt-3 pt-3 border-t border-primary/10">
                {renderClientSwitcher()}
              </div>
            )}
          </div>

          {/* Financial ledger */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedClient}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="rounded-lg border border-border/40 bg-card/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Total compensation before fees</span>
                    <p className="text-[10px] text-muted-foreground/60">Incl. statutory earnings & deductions</p>
                  </div>
                  <span className="text-foreground tabular-nums">{formatCurrency(displayData.totalBasePay || 118500)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                    Approved adjustments ({displayData.approvedCount})
                  </span>
                  <span className="text-accent-green-text font-medium tabular-nums">+{formatCurrency(displayData.totalApprovedAmount)}</span>
                </div>
                
                {displayData.rejectedCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <XCircle className="h-3 w-3 text-muted-foreground/50" />
                      Rejected ({displayData.rejectedCount})
                    </span>
                    <span className="text-muted-foreground/60 tabular-nums line-through">{formatCurrency(displayData.rejectedAmount)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fronted fees</span>
                  <span className="text-foreground tabular-nums">{formatCurrency(displayData.fees)}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/40">
                  <span className="text-foreground font-medium">Net payout</span>
                  <span className="text-primary font-semibold tabular-nums">{formatCurrency(displayData.netPayout || displayData.totalCost)}</span>
                </div>

                {/* Per-client breakdown when viewing all */}
                {selectedClient === ALL_CLIENTS_KEY && hasMultipleClients && (
                  <div className="pt-2.5 border-t border-border/30 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">By client</p>
                    {clientNames.map(name => {
                      const clientWorkers = submissions.filter(s => s.companyName === name);
                      const clientTotal = computeTotals(clientWorkers);
                      return (
                        <button
                          key={name}
                          onClick={() => setSelectedClient(name)}
                          className="flex items-center justify-between w-full text-xs px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors group"
                        >
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{name}</span>
                            <span className="text-muted-foreground/40 text-[10px]">({clientTotal.workerCount})</span>
                          </span>
                          <span className="text-foreground tabular-nums font-medium">{formatCurrency(clientTotal.totalCost)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden h-full flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-foreground mb-6">What happens next</h3>
        <div className="relative pl-5 flex-1 flex flex-col justify-between">
          <div className="absolute left-[6px] top-1.5 bottom-1.5 w-px bg-border" />
          {timelineSteps.map((step) => (
            <div key={step.id} className="relative">
              <div className={cn(
                "absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center",
                step.active 
                  ? "bg-primary/10 border-2 border-primary" 
                  : "bg-muted border-2 border-muted-foreground/30"
              )}>
                {step.active && <div className="w-1 h-1 rounded-full bg-primary" />}
              </div>
              <p className={cn(
                "text-sm font-medium",
                step.active ? "text-foreground" : "text-muted-foreground"
              )}>{step.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const approveEmployeeCount = displayData.employeeCount;
  const approveContractorCount = displayData.contractorCount;
  const approveTotalAmount = formatCurrency(displayData.totalCost);

  if (hideHeader) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {renderBatchOverview()}
        </div>
        <div className="lg:col-span-2">
          {renderTimeline()}
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <F1v4_PayrollStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={onStepClick}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-1.5" onClick={() => setIsConfirmOpen(true)}>
              <FileCheck className="h-3.5 w-3.5" />
              Approve & Lock
            </Button>
            <F1v4_ApproveConfirmationModal
              open={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
              onConfirm={onApprove}
              companyName={company.name}
              employeeCount={approveEmployeeCount}
              contractorCount={approveContractorCount}
              totalAmount={approveTotalAmount}
              isCustomBatch={isCustomBatch}
              adjustmentCount={displayData.totalRequests}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {renderBatchOverview()}
          </div>
          <div className="lg:col-span-2">
            {renderTimeline()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default F1v4_ApproveStep;
