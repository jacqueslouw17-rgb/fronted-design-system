/**
 * F1v4_ApproveStep - Final approval step with sign-off confirmation
 * 
 * Layout aligned with CA3_SubmitStep: 2-column grid with stepper in header
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
  RefreshCw,
  AlertCircle,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_PayrollStepper, F1v4_PayrollStep } from "./F1v4_PayrollStepper";
import { F1v4_ApproveConfirmationModal } from "./F1v4_ApproveConfirmationModal";
import { WorkerSubmission } from "./F1v4_SubmissionsView";

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
  const [isRefreshingFx, setIsRefreshingFx] = useState(false);

  const handleRefreshFx = () => {
    setIsRefreshingFx(true);
    setTimeout(() => setIsRefreshingFx(false), 1200);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  // Compute off-cycle totals from actual submissions — only count approved items
  const offCycleTotals = useMemo(() => {
    if (!isCustomBatch || submissions.length === 0) return null;
    
    const workers = submissions;
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

    // Tax: 10% for employees only
    const employeeTotalApproved = workers
      .filter(w => w.workerType === "employee")
      .reduce((sum, w) => sum + w.submissions.filter(s => s.status === "approved").reduce((s2, s) => s2 + (s.amount || 0), 0), 0);
    const totalDeductions = Math.round(employeeTotalApproved * 0.10);
    const netPayout = totalApprovedAmount - totalDeductions;
    const fees = Math.round(netPayout * 0.03);
    
    return {
      employeeCount,
      contractorCount,
      currencyCount: currencies.size,
      totalApprovedAmount,
      totalDeductions,
      netPayout,
      fees,
      totalCost: netPayout + fees,
      approvedCount,
      rejectedCount,
      rejectedAmount,
      skippedCount,
      workerCount: workers.length,
      totalRequests,
    };
  }, [isCustomBatch, submissions]);

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

  const renderBatchOverview = () => {
    const displayData = offCycleTotals || {
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
    };

    if (isCustomBatch) {
      return (
        <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
          <div className="p-5 space-y-5">
            {/* Hero payout */}
            <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <p className="text-xs text-primary/70 mb-1">Off-cycle payout total</p>
              <p className="text-3xl font-semibold text-primary tracking-tight">{formatCurrency(displayData.totalCost)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {displayData.workerCount} worker{displayData.workerCount !== 1 ? "s" : ""} · {displayData.totalRequests} adjustment{displayData.totalRequests !== 1 ? "s" : ""} processed
              </p>
            </div>


            {/* Financial ledger */}
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

    // Normal batch view
    return (
      <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-primary/70">Total payout</p>
              <button 
                onClick={handleRefreshFx}
                disabled={isRefreshingFx}
                className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-2.5 w-2.5", isRefreshingFx && "animate-spin")} />
                {isRefreshingFx ? "Refreshing..." : "Refresh FX"}
              </button>
            </div>
            <p className="text-3xl font-semibold text-primary tracking-tight">{formatCurrency(displayData.totalCost)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Based on current rates · EUR 1.08 · PHP 0.018 · NOK 0.089
            </p>
            
            <div className="mt-4 pt-3 border-t border-primary/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground">Total Compensation before fees</span>
                  <p className="text-[10px] text-muted-foreground/60">Incl. statutory earnings & deductions</p>
                </div>
                <span className="text-foreground tabular-nums">$118,500</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                  Approved adjustments
                  <span className="text-[10px] text-muted-foreground/70">({displayData.approvedCount} item{displayData.approvedCount !== 1 ? "s" : ""})</span>
                </span>
                <span className="text-accent-green-text tabular-nums">+{formatCurrency(displayData.totalApprovedAmount)}</span>
              </div>
              
              {displayData.rejectedCount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <XCircle className="h-3 w-3 text-muted-foreground/50" />
                    Rejected
                    <span className="text-[10px] text-muted-foreground/70">({displayData.rejectedCount} item{displayData.rejectedCount !== 1 ? "s" : ""})</span>
                  </span>
                  <span className="text-muted-foreground/60 tabular-nums line-through">{formatCurrency(displayData.rejectedAmount)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fronted fees</span>
                <span className="text-foreground tabular-nums">{formatCurrency(displayData.fees)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-primary/10">
                <span className="text-primary/80 font-medium">Net payout</span>
                <span className="text-primary font-medium tabular-nums">{formatCurrency(displayData.netPayout)}</span>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden h-fit">
      <div className="p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">What happens next</h3>
        <div className="relative pl-5">
          <div className="absolute left-[6px] top-1.5 bottom-1.5 w-px bg-border" />
          {timelineSteps.map((step, index) => (
            <div key={step.id} className={cn("relative", index < timelineSteps.length - 1 && "pb-4")}>
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
              <p className="text-[11px] text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const approveEmployeeCount = offCycleTotals?.employeeCount ?? company.employeeCount;
  const approveContractorCount = offCycleTotals?.contractorCount ?? company.contractorCount;
  const approveTotalAmount = formatCurrency(offCycleTotals?.totalCost ?? company.totalCost);

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
              adjustmentCount={offCycleTotals?.totalRequests ?? 0}
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
