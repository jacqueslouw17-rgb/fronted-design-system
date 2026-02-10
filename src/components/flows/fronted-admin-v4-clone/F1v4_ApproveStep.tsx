/**
 * F1v4_ApproveStep - Final approval step with sign-off confirmation
 * 
 * Layout aligned with CA3_SubmitStep: 2-column grid with stepper in header
 */

import React, { useState } from "react";
import { 
  CheckCircle2,
  ShieldCheck,
  Users,
  Briefcase,
  Globe,
  FileCheck,
  ChevronLeft,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_PayrollStepper, F1v4_PayrollStep } from "./F1v4_PayrollStepper";
import { F1v4_ApproveConfirmationModal } from "./F1v4_ApproveConfirmationModal";

interface F1v4_ApproveStepProps {
  company: CompanyPayrollData;
  onApprove: () => void;
  onBack?: () => void;
  onClose?: () => void;
  hideHeader?: boolean;
  // Stepper props
  currentStep?: F1v4_PayrollStep;
  completedSteps?: F1v4_PayrollStep[];
  onStepClick?: (step: F1v4_PayrollStep) => void;
}

export const F1v4_ApproveStep: React.FC<F1v4_ApproveStepProps> = ({
  company,
  onApprove,
  onBack,
  onClose,
  hideHeader = false,
  currentStep = "approve",
  completedSteps = ["submissions", "exceptions"],
  onStepClick,
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

  // Timeline steps for right panel
  const timelineSteps = [
    { id: 1, title: "Approve & lock run", description: "Sign off on payroll numbers", active: true },
    { id: 2, title: "Generate payment summary", description: "Bank list and payslips ready", active: false },
    { id: 3, title: "External payment", description: "Processed outside Fronted", active: false },
    { id: 4, title: "Track & reconcile", description: "Mark as paid/not paid", active: false },
  ];

  // Content for left panel (matching CA3_SubmitStep batch overview)
  const renderBatchOverview = () => (
    <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
      <div className="p-5 space-y-5">
        {/* Pre-flight validation message */}

        {/* Total payout - Hero with breakdown */}
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
          <p className="text-3xl font-semibold text-primary tracking-tight">{formatCurrency(company.totalCost)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Based on current rates · EUR 1.08 · PHP 0.018 · NOK 0.089
          </p>
          
          {/* Receipt-style breakdown */}
          <div className="mt-4 pt-3 border-t border-primary/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground">Total Compensation before fees</span>
                <p className="text-[10px] text-muted-foreground/60">Incl. statutory earnings & deductions</p>
              </div>
              <span className="text-foreground tabular-nums">$118,500</span>
            </div>
            
            {/* Approved adjustments */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                Approved adjustments
                <span className="text-[10px] text-muted-foreground/70">(3 items)</span>
              </span>
              <span className="text-accent-green-text tabular-nums">+$6,300</span>
            </div>
            
            {/* Rejected adjustments */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <XCircle className="h-3 w-3 text-muted-foreground/50" />
                Rejected
                <span className="text-[10px] text-muted-foreground/70">(1 item)</span>
              </span>
              <span className="text-muted-foreground/60 tabular-nums line-through">$1,200</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fronted fees</span>
              <span className="text-foreground tabular-nums">$3,792</span>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-primary/10">
              <span className="text-primary/80 font-medium">Net payout</span>
              <span className="text-primary font-medium tabular-nums">$128,592</span>
            </div>
          </div>
          
          {/* Review summary badges */}
          <div className="mt-3 pt-3 border-t border-primary/10 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-green-fill/10 border border-accent-green-outline/20">
              <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
              <span className="text-[10px] font-medium text-accent-green-text">3 approved</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/30 border border-border/40">
              <XCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">1 rejected</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-[10px] font-medium text-blue-600">2 leaves approved</span>
            </div>
          </div>
        </div>
        
        {/* Breakdown tiles */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-lg border border-border/60 bg-card/80">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Employees</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{company.employeeCount}</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-card/80">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Contractors</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{company.contractorCount}</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-card/80">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Currencies</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{company.currencyCount}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Right panel - Timeline (matching CA3_SubmitStep)
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

  // When hideHeader is true, render content without card wrappers
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
              employeeCount={company.employeeCount}
              contractorCount={company.contractorCount}
              totalAmount={formatCurrency(company.totalCost)}
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
