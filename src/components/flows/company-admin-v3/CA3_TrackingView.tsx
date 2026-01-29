import React from "react";
import { CheckCircle2, Clock, Download, FileText, Users, Briefcase, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";

export type WorkerPaymentStatus = "paid" | "posted" | "processing" | "failed" | "queued" | "sent";

export interface TrackingWorker {
  id: string;
  name: string;
  country: string;
  type: "employee" | "contractor";
  amount: number;
  currency: string;
  status: WorkerPaymentStatus;
  errorMessage?: string;
  fixInstructions?: string;
  canRetry?: boolean;
}

interface CA3_TrackingViewProps {
  workers: TrackingWorker[];
  onExportCSV: () => void;
  onDownloadAuditPDF: () => void;
  onBack?: () => void;
  onClose?: () => void;
  isHistorical?: boolean;
  paidDate?: string;
  // Stepper props
  currentStep?: CA3_PayrollStep;
  completedSteps?: CA3_PayrollStep[];
  onStepClick?: (step: CA3_PayrollStep) => void;
  showStepper?: boolean;
}

export const CA3_TrackingView: React.FC<CA3_TrackingViewProps> = ({
  workers,
  onExportCSV,
  onDownloadAuditPDF,
  onBack,
  onClose,
  isHistorical = false,
  paidDate,
  // Stepper props
  currentStep = "track",
  completedSteps = ["submissions", "submit"],
  onStepClick,
  showStepper = false,
}) => {
  const paidCount = workers.filter(w => w.status === "paid" || w.status === "posted").length;
  const notPaidCount = workers.filter(w => w.status === "failed").length;
  const processingCount = workers.filter(w => w.status === "processing" || w.status === "queued" || w.status === "sent").length;
  const progressPercent = workers.length > 0 ? Math.round((paidCount / workers.length) * 100) : 0;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status: WorkerPaymentStatus) => {
    switch (status) {
      case "paid":
      case "posted":
        return { icon: CheckCircle2, color: "text-accent-green-text", bg: "bg-accent-green/10", label: "Paid" };
      case "processing":
        return { icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10", label: "Processing" };
      case "queued":
      case "sent":
        return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "In progress" };
      case "failed":
        return { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10", label: isHistorical ? "Not paid" : "Attention" };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  // Sort: attention first, then processing, then completed
  const sortedWorkers = [...workers].sort((a, b) => {
    const priority = (status: WorkerPaymentStatus) => {
      if (status === "failed") return 0;
      if (status === "processing" || status === "queued" || status === "sent") return 1;
      return 2;
    };
    return priority(a.status) - priority(b.status);
  });

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Stepper Header - only show when showStepper is true */}
      {showStepper && (
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
              <CA3_PayrollStepper
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={onStepClick}
              />
            </div>
            <div className="flex items-center gap-3">
              {onClose && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onClose}
                  className="h-9 text-xs"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      {/* Progress Hero */}
      <div className="px-6 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-start justify-between mb-4">
          <div>
            {isHistorical ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <span className="px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green-text text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Paid
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
                  <span className="text-lg text-muted-foreground">of {workers.length}</span>
                  <span className="text-sm text-muted-foreground">payments paid</span>
                </div>
                {paidDate && (
                  <p className="text-xs text-muted-foreground mt-1">Paid on {paidDate}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Payment Progress</p>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">In review</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
                  <span className="text-lg text-muted-foreground">of {workers.length}</span>
                  <span className="text-sm text-muted-foreground">payments paid</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Submit before Jan 25, 2026 — 5 days remaining</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={onExportCSV} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownloadAuditPDF} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Audit
            </Button>
          </div>
        </div>
        
        {/* Progress bar - hidden for historical view */}
        {!isHistorical && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-1" />
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent-green" />
                <span className="text-muted-foreground">{paidCount} paid</span>
              </div>
              {processingCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">{processingCount} processing</span>
                </div>
              )}
              {notPaidCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">{notPaidCount} needs attention</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Worker List */}
      <CardContent className="p-4">
        <div className="max-h-[380px] overflow-y-auto space-y-1">
          {sortedWorkers.map((worker) => {
            const statusConfig = getStatusConfig(worker.status);
            const StatusIcon = statusConfig.icon;
            const needsAttention = worker.status === "failed";
            const TypeIcon = worker.type === "employee" ? Users : Briefcase;

            return (
              <div 
                key={worker.id}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-muted/30 border border-border/20",
                  needsAttention && "border-amber-500/30 bg-amber-500/5"
                )}
              >
                {/* Avatar */}
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Country */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                    <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">· {worker.country}</span>
                  </div>
                  {needsAttention && worker.errorMessage && (
                    <p className="text-[10px] text-amber-600 truncate leading-tight">{worker.errorMessage}</p>
                  )}
                </div>

                {/* Amount */}
                <p className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
                  {formatCurrency(worker.amount, worker.currency)}
                </p>

                {/* Status Pill */}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0",
                  statusConfig.bg,
                  statusConfig.color
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CA3_TrackingView;
