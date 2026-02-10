import React, { useState } from "react";
import { CheckCircle2, Clock, Download, FileText, Users, Briefcase, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";

export type WorkerPaymentStatus = "paid" | "in-progress";

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", USA: "🇺🇸",
  "United States": "🇺🇸", UK: "🇬🇧", "United Kingdom": "🇬🇧",
  Italy: "🇮🇹"
};

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
  currentStep?: CA3_PayrollStep;
  completedSteps?: CA3_PayrollStep[];
  onStepClick?: (step: CA3_PayrollStep) => void;
  showStepper?: boolean;
}

// Mock earnings data for breakdown
const getWorkerEarnings = (worker: TrackingWorker) => {
  if (worker.type === "contractor") {
    return {
      items: [
        { label: "Consulting Services", description: `${Math.round(worker.amount / 125)} hrs @ $125/hr`, amount: worker.amount * 0.95 },
        { label: "Additional Work", description: "Project deliverables", amount: worker.amount * 0.05 },
      ],
      deductions: [],
    };
  }
  return {
    items: [
      { label: "Base Salary", description: "Monthly salary", amount: worker.amount * 0.85 },
      { label: "Housing Allowance", description: "Monthly allowance", amount: worker.amount * 0.1 },
      { label: "Transport Allowance", description: "Monthly allowance", amount: worker.amount * 0.05 },
    ],
    deductions: [
      { label: "Income Tax", description: "Withholding tax", amount: worker.amount * 0.08 },
      { label: "Social Security", description: "Statutory contribution", amount: worker.amount * 0.05 },
      { label: "Health Insurance", description: "Monthly premium", amount: worker.amount * 0.02 },
    ],
  };
};

export const CA3_TrackingView: React.FC<CA3_TrackingViewProps> = ({
  workers,
  onExportCSV,
  onDownloadAuditPDF,
  onBack,
  onClose,
  isHistorical = false,
  paidDate,
  currentStep = "track",
  completedSteps = ["submissions", "submit"],
  onStepClick,
  showStepper = false,
}) => {
  const [selectedWorker, setSelectedWorker] = useState<TrackingWorker | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const paidCount = workers.filter(w => w.status === "paid").length;
  const inProgressCount = workers.filter(w => w.status === "in-progress").length;
  const progressPercent = workers.length > 0 ? Math.round((paidCount / workers.length) * 100) : 0;
  const allPaid = paidCount === workers.length && workers.length > 0;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status: WorkerPaymentStatus) => {
    switch (status) {
      case "paid":
        return { icon: CheckCircle2, color: "text-accent-green-text", bg: "bg-accent-green/10", label: "Paid" };
      case "in-progress":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", label: "In progress" };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  // Sort: in-progress first, then paid
  const sortedWorkers = [...workers].sort((a, b) => {
    const priority = (status: WorkerPaymentStatus) => {
      if (status === "in-progress") return 0;
      return 1;
    };
    return priority(a.status) - priority(b.status);
  });

  const handleWorkerClick = (worker: TrackingWorker) => {
    // Only clickable when paid
    if (worker.status === "paid") {
      setSelectedWorker(worker);
      setDrawerOpen(true);
    }
  };

  const renderBreakdownDrawer = () => {
    if (!selectedWorker) return null;
    const isContractor = selectedWorker.type === "contractor";
    const earningsData = getWorkerEarnings(selectedWorker);
    const totalEarnings = earningsData.items.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = earningsData.deductions.reduce((sum, item) => sum + item.amount, 0);
    const netTotal = isContractor ? totalEarnings : totalEarnings - totalDeductions;
    const documentLabel = isContractor ? "invoice" : "payslip";

    return (
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[440px] sm:max-w-[440px] p-0 flex flex-col overflow-hidden">
          {/* Clean Header */}
          <SheetHeader className="px-6 py-5 border-b border-border/40 shrink-0 bg-background pt-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {isContractor ? "Invoice breakdown" : "Payslip breakdown"}
                </h2>
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/30">
                  Jan 2026
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(selectedWorker.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedWorker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {countryFlags[selectedWorker.country] || ""} {selectedWorker.country} · {selectedWorker.type === "employee" ? "Employee" : "Contractor"}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* EARNINGS */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Earnings
                </p>
                <div className="space-y-4">
                  {earningsData.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        +{formatCurrency(Math.round(item.amount), selectedWorker.currency)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                  <p className="text-sm font-semibold text-foreground">Total earnings</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    +{formatCurrency(Math.round(totalEarnings), selectedWorker.currency)}
                  </p>
                </div>
              </div>

              {/* DEDUCTIONS (employees only) */}
              {!isContractor && earningsData.deductions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Deductions
                  </p>
                  <div className="space-y-4">
                    {earningsData.deductions.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground tabular-nums">
                          -{formatCurrency(Math.round(item.amount), selectedWorker.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                    <p className="text-sm font-semibold text-foreground">Total deductions</p>
                    <p className="text-sm font-semibold text-muted-foreground tabular-nums">
                      -{formatCurrency(Math.round(totalDeductions), selectedWorker.currency)}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-border/40" />

              {/* NET TOTAL */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {isContractor ? "Invoice total" : "Net pay"}
                  </p>
                  <p className="text-xs text-muted-foreground">Paid on Jan 25, 2026</p>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {formatCurrency(Math.round(netTotal), selectedWorker.currency)}
                </p>
              </div>

              {/* Download - contextually below total */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => toast.success(`${isContractor ? "Invoice" : "Payslip"} downloaded`)}
              >
                <Download className="h-4 w-4" />
                Download {documentLabel}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Stepper Header */}
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
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
                    <span className="text-lg text-muted-foreground">of {workers.length}</span>
                    <span className="text-sm text-muted-foreground">payments paid</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Workers will be marked as paid by Fronted once reconciled</p>
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
          
          {/* Progress bar */}
          {!isHistorical && (
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-1" />
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-accent-green" />
                  <span className="text-muted-foreground">{paidCount} paid</span>
                </div>
                {inProgressCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">{inProgressCount} in progress</span>
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
              const TypeIcon = worker.type === "employee" ? Users : Briefcase;
              const isPaid = worker.status === "paid";

              return (
                <div 
                  key={worker.id}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-border/20",
                    isPaid 
                      ? "bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" 
                      : "bg-muted/30"
                  )}
                  onClick={() => handleWorkerClick(worker)}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                      {getInitials(worker.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                      <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground">· {countryFlags[worker.country] || ""} {worker.country}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
                    {formatCurrency(worker.amount, worker.currency)}
                  </p>

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

      {renderBreakdownDrawer()}
    </>
  );
};

export default CA3_TrackingView;
