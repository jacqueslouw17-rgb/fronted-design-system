/**
 * F1v4_WorkerDetailDrawer - Premium payslip-first worker details drawer
 * 
 * Design: "Less is more" - Payslip preview as primary action
 * - Calm, spacious layout
 * - Progressive disclosure for details
 * - Contextual overrides (not default visible)
 * - Contextual overrides (not default visible)
 */

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  FileText,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Receipt,
  ExternalLink,
  ChevronDown,
  Pencil,
  XCircle,
  Bell,
} from "lucide-react";

export interface WorkerData {
  id: string;
  name: string;
  type: "employee" | "contractor";
  country: string;
  currency: string;
  status: "ready" | "auto-generated" | "missing-submission" | "needs-attention" | "blocking";
  netPay: number;
  issues: number;
  // Extended data for detail view
  grossPay?: number;
  adjustments?: number;
  fees?: number;
  baseSalary?: number;
  scheduledDays?: number;
  actualDays?: number;
  leaveTaken?: number;
  netPayableDays?: number;
  missingData?: { field: string; reason: string; fix: string; isBlocking?: boolean }[];
  // Track step fields
  paymentStatus?: "paid" | "not-paid" | "in-transit" | "posted";
  providerRef?: string;
  receiptUrl?: string;
}

interface F1v4_WorkerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerData | null;
  workers: WorkerData[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onPayslipPreview: (worker: WorkerData) => void;
  isTrackStep?: boolean;
  onMarkAsPaid?: (workerId: string) => void;
  onRetryPayout?: (workerId: string) => void;
}

interface ManualAdjustment {
  id: string;
  type: "bonus" | "deduction" | "reimbursement";
  label: string;
  amount: number;
  reason: string;
}

const statusConfig: Record<WorkerData["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  "auto-generated": { label: "Auto-generated", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "missing-submission": { label: "Missing submission", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "needs-attention": { label: "Needs attention", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  blocking: { label: "Blocking", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const paymentStatusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  paid: { label: "Paid", icon: CheckCircle2, className: "text-accent-green-text" },
  "not-paid": { label: "Not paid", icon: AlertCircle, className: "text-destructive" },
  "in-transit": { label: "In transit", icon: Clock, className: "text-amber-600" },
  posted: { label: "Posted", icon: CheckCircle2, className: "text-blue-600" },
};

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹"
};

const mockAuditLog = [
  { id: "1", action: "Payroll calculated", timestamp: "Jan 15, 2026 09:00", actor: "System" },
  { id: "2", action: "Auto-generated from contract", timestamp: "Jan 15, 2026 09:00", actor: "System" },
  { id: "3", action: "FX rate locked", timestamp: "Jan 18, 2026 14:30", actor: "System" },
];

export const F1v4_WorkerDetailDrawer: React.FC<F1v4_WorkerDetailDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  workers,
  currentIndex,
  onNavigate,
  onPayslipPreview,
  isTrackStep = false,
  onMarkAsPaid,
  onRetryPayout,
}) => {
  const [overridesEnabled, setOverridesEnabled] = useState(false);
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAdjustment, setPendingAdjustment] = useState<number | null>(null);

  // Collapsible states
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [overridesOpen, setOverridesOpen] = useState(false);

  // Override fields
  const [startDateOverride, setStartDateOverride] = useState("");
  const [endDateOverride, setEndDateOverride] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [payAmountOverride, setPayAmountOverride] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  // New adjustment form
  const [showAddAdjustment, setShowAddAdjustment] = useState(false);
  const [newAdjType, setNewAdjType] = useState<"bonus" | "deduction" | "reimbursement">("bonus");
  const [newAdjLabel, setNewAdjLabel] = useState("");
  const [newAdjAmount, setNewAdjAmount] = useState("");
  const [newAdjReason, setNewAdjReason] = useState("");

  if (!worker) return null;

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const TypeIcon = worker.type === "employee" ? Users : Briefcase;
  const config = statusConfig[worker.status];

  // Mock extended data
  const grossPay = worker.grossPay || worker.netPay * 1.25;
  const fees = worker.fees || (worker.type === "contractor" ? worker.netPay * 0.03 : 0);
  const deductions = worker.type === "employee" ? grossPay * 0.15 : 0;
  const baseSalary = worker.baseSalary || worker.netPay * 1.2;
  const scheduledDays = worker.scheduledDays || 22;
  const actualDays = worker.actualDays || 21;
  const leaveTaken = worker.leaveTaken || 1;

  const missingData = worker.missingData || (worker.status === "blocking" ? [
    { field: "Bank details", reason: "Required for payout", fix: "Request from worker", isBlocking: true }
  ] : worker.status === "missing-submission" ? [
    { field: "Timesheet", reason: "Not submitted for this period", fix: "Send reminder", isBlocking: false }
  ] : worker.status === "needs-attention" ? [
    { field: "Start date mismatch", reason: "Contract shows different date", fix: "Verify dates", isBlocking: false }
  ] : []);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < workers.length - 1;

  const totalAdjustments = adjustments.reduce((sum, adj) => {
    return sum + (adj.type === "deduction" ? -adj.amount : adj.amount);
  }, 0);

  const calculatedNetPay = worker.netPay + totalAdjustments + (payAmountOverride ? parseFloat(payAmountOverride) : 0);
  const hasChanges = adjustments.length > 0 || startDateOverride || endDateOverride || statusOverride || payAmountOverride;
  const canPreviewPayslip = worker.status !== "blocking";

  const handleResetOverrides = () => {
    setStartDateOverride("");
    setEndDateOverride("");
    setStatusOverride("");
    setPayAmountOverride("");
    setOverrideReason("");
    setAdjustments([]);
    setShowAddAdjustment(false);
    toast.success("Overrides reset");
  };

  const handleAddAdjustment = () => {
    if (!newAdjLabel || !newAdjAmount || !newAdjReason) {
      toast.error("Please fill all fields");
      return;
    }
    const amount = parseFloat(newAdjAmount);
    if (isNaN(amount)) {
      toast.error("Invalid amount");
      return;
    }

    // Check for large delta (>20%)
    const delta = Math.abs(amount / worker.netPay);
    if (delta > 0.2) {
      setPendingAdjustment(amount);
      setShowConfirmDialog(true);
      return;
    }

    addAdjustment(amount);
  };

  const addAdjustment = (amount: number) => {
    setAdjustments(prev => [...prev, {
      id: Date.now().toString(),
      type: newAdjType,
      label: newAdjLabel,
      amount,
      reason: newAdjReason,
    }]);
    setNewAdjLabel("");
    setNewAdjAmount("");
    setNewAdjReason("");
    setShowAddAdjustment(false);
    toast.success("Adjustment added");
  };

  const handleConfirmLargeAdjustment = () => {
    if (pendingAdjustment !== null) {
      addAdjustment(pendingAdjustment);
    }
    setShowConfirmDialog(false);
    setPendingAdjustment(null);
  };

  const handleSaveAndRecalculate = () => {
    toast.success("Payroll recalculated", {
      description: "Changes applied to this cycle only"
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[480px] sm:max-w-[480px] p-0 flex flex-col overflow-hidden">
          {/* Header - Always visible */}
          <SheetHeader className="p-5 pb-4 border-b border-border/40 shrink-0 bg-background">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(currentIndex - 1)}
                disabled={!hasPrev}
                className="gap-1 text-xs h-7 px-2"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} of {workers.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(currentIndex + 1)}
                disabled={!hasNext}
                className="gap-1 text-xs h-7 px-2"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Worker Identity + Status */}
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {getInitials(worker.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-foreground truncate">
                    {worker.name}
                  </h2>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 shrink-0", config.className)}>
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted/30">
                    <TypeIcon className="h-2.5 w-2.5 mr-1" />
                    {worker.type === "employee" ? "Employee" : "Contractor"}
                  </Badge>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{countryFlags[worker.country] || ""} {worker.country}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{worker.currency}</span>
                  {overridesEnabled && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Override active
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* SECTION A: Exceptions (if any) - Show FIRST */}
              {missingData.length > 0 && (
                <div className="space-y-2">
                  {missingData.map((issue, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-3 rounded-xl border",
                        issue.isBlocking 
                          ? "border-destructive/30 bg-destructive/5" 
                          : "border-amber-500/30 bg-amber-500/5"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        {issue.isBlocking ? (
                          <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={cn(
                              "text-sm font-medium",
                              issue.isBlocking ? "text-destructive" : "text-amber-700"
                            )}>
                              {issue.field}
                            </p>
                            <Badge variant="outline" className={cn(
                              "text-[9px] px-1.5 py-0 h-4",
                              issue.isBlocking 
                                ? "bg-destructive/10 text-destructive border-destructive/20" 
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                              {issue.isBlocking ? "Blocks payment" : "Warning"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{issue.reason}</p>
                          <div className="flex gap-2">
                            <Button 
                              variant={issue.isBlocking ? "default" : "secondary"} 
                              size="sm" 
                              className="h-6 text-xs px-2"
                            >
                              {issue.fix}
                            </Button>
                            {!issue.isBlocking && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground">
                                <Bell className="h-3 w-3 mr-1" />
                                Snooze
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION B: Payslip Preview (PRIMARY) */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50">
                {/* Mini Payslip Summary */}
                <div className="text-center mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Net Pay · This Cycle</p>
                  <p className="text-3xl font-bold text-foreground tabular-nums">
                    {formatCurrency(calculatedNetPay, worker.currency)}
                  </p>
                  {hasChanges && (
                    <p className="text-xs text-amber-600 mt-1">
                      (includes pending changes)
                    </p>
                  )}
                </div>

                {/* Quick breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Gross</p>
                    <p className="text-sm font-medium tabular-nums">{formatCurrency(grossPay, worker.currency)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">
                      {worker.type === "employee" ? "Deductions" : "Fees"}
                    </p>
                    <p className="text-sm font-medium tabular-nums text-muted-foreground">
                      -{formatCurrency(worker.type === "employee" ? deductions : fees, worker.currency)}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">Adjustments</p>
                    <p className={cn(
                      "text-sm font-medium tabular-nums",
                      totalAdjustments > 0 ? "text-accent-green-text" : totalAdjustments < 0 ? "text-destructive" : ""
                    )}>
                      {totalAdjustments >= 0 ? "+" : ""}{formatCurrency(totalAdjustments, worker.currency)}
                    </p>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 gap-1.5"
                    disabled={!canPreviewPayslip}
                    onClick={() => onPayslipPreview(worker)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview Payslip
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={!canPreviewPayslip}
                    onClick={() => toast.success("Payslip downloaded")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {!canPreviewPayslip && (
                  <p className="text-xs text-destructive text-center mt-2">
                    Resolve blocking issues to preview payslip
                  </p>
                )}
              </div>

              {/* Track Step: Payment Status */}
              {isTrackStep && worker.paymentStatus && (
                <div className="p-4 rounded-xl border border-border/40 bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Status</span>
                    <div className={cn("flex items-center gap-1.5 text-sm font-medium", paymentStatusConfig[worker.paymentStatus]?.className)}>
                      {React.createElement(paymentStatusConfig[worker.paymentStatus]?.icon || Clock, { className: "h-4 w-4" })}
                      {paymentStatusConfig[worker.paymentStatus]?.label}
                    </div>
                  </div>
                  
                  {worker.providerRef && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Provider Ref</span>
                      <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">{worker.providerRef}</span>
                    </div>
                  )}
                  
                  {worker.receiptUrl && (
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mb-2">
                      <Receipt className="h-3.5 w-3.5" />
                      View Receipt
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  )}
                  
                  {worker.paymentStatus === "not-paid" && (
                    <div className="flex gap-2 pt-2 border-t border-border/40">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => onMarkAsPaid?.(worker.id)}
                      >
                        Mark as paid
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs hover:bg-red-100 hover:text-red-700"
                        onClick={() => onRetryPayout?.(worker.id)}
                      >
                        Retry payout
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION C: Payment Breakdown (Collapsible) */}
              <Collapsible open={breakdownOpen} onOpenChange={setBreakdownOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-auto py-3 px-0 hover:bg-transparent">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      View Full Breakdown
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", breakdownOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pb-2">
                  <div className="p-4 rounded-xl border border-border/40 bg-card/30 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base {worker.type === "contractor" ? "rate" : "salary"}</span>
                      <span className="font-medium tabular-nums">{formatCurrency(baseSalary, worker.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled / Actual days</span>
                      <span className="font-medium tabular-nums">{scheduledDays} / {actualDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Leave taken</span>
                      <span className="font-medium tabular-nums">{leaveTaken} day{leaveTaken !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border/40 pt-2.5">
                      <span className="text-muted-foreground">Gross pay</span>
                      <span className="font-medium tabular-nums">{formatCurrency(grossPay, worker.currency)}</span>
                    </div>
                    {worker.type === "employee" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deductions (tax, SSS, etc.)</span>
                        <span className="font-medium tabular-nums text-muted-foreground">-{formatCurrency(deductions, worker.currency)}</span>
                      </div>
                    )}
                    {worker.type === "contractor" && fees > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fees</span>
                        <span className="font-medium tabular-nums text-muted-foreground">-{formatCurrency(fees, worker.currency)}</span>
                      </div>
                    )}
                    {adjustments.length > 0 && adjustments.map(adj => (
                      <div key={adj.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          {adj.label}
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">
                            {adj.type}
                          </Badge>
                        </span>
                        <span className={cn(
                          "font-medium tabular-nums",
                          adj.type === "deduction" ? "text-destructive" : "text-accent-green-text"
                        )}>
                          {adj.type === "deduction" ? "-" : "+"}{formatCurrency(adj.amount, worker.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm border-t border-border/40 pt-2.5">
                      <span className="font-medium text-foreground">Net pay</span>
                      <span className="font-semibold text-foreground tabular-nums">{formatCurrency(calculatedNetPay, worker.currency)}</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SECTION D: Overrides (Contextual, not default) */}
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-auto py-3 px-0 hover:bg-transparent">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Pencil className="h-3 w-3" />
                      Overrides & Adjustments
                      {hasChanges && (
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-3.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
                          {adjustments.length} change{adjustments.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", overridesOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pb-2">
                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">Enable overrides</p>
                      <p className="text-[11px] text-muted-foreground">This cycle only</p>
                    </div>
                    <Switch checked={overridesEnabled} onCheckedChange={setOverridesEnabled} />
                  </div>

                  {overridesEnabled && (
                    <>
                      {/* Override Fields */}
                      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] text-amber-600 mb-2">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Changes apply to this cycle only</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Start date</Label>
                            <Input
                              type="date"
                              value={startDateOverride}
                              onChange={(e) => setStartDateOverride(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">End date</Label>
                            <Input
                              type="date"
                              value={endDateOverride}
                              onChange={(e) => setEndDateOverride(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Status</Label>
                            <Select value={statusOverride} onValueChange={setStatusOverride}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="No change" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Pay amount adj.</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={payAmountOverride}
                              onChange={(e) => setPayAmountOverride(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Reason *</Label>
                          <Select value={overrideReason} onValueChange={setOverrideReason}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contract-change">Contract change</SelectItem>
                              <SelectItem value="correction">Correction</SelectItem>
                              <SelectItem value="special-case">Special case</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Manual Adjustments */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Manual Adjustments</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs gap-1 text-primary"
                            onClick={() => setShowAddAdjustment(!showAddAdjustment)}
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </Button>
                        </div>

                        {adjustments.map((adj) => (
                          <div key={adj.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 bg-card/30">
                            <Badge variant="outline" className={cn(
                              "text-[9px] px-1.5 py-0 h-4 shrink-0",
                              adj.type === "bonus" && "bg-accent-green-fill/10 text-accent-green-text",
                              adj.type === "deduction" && "bg-destructive/10 text-destructive",
                              adj.type === "reimbursement" && "bg-blue-500/10 text-blue-600"
                            )}>
                              {adj.type}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{adj.label}</p>
                            </div>
                            <span className={cn(
                              "text-xs font-medium tabular-nums shrink-0",
                              adj.type === "deduction" ? "text-destructive" : "text-accent-green-text"
                            )}>
                              {adj.type === "deduction" ? "-" : "+"}{formatCurrency(adj.amount, worker.currency)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => setAdjustments(prev => prev.filter(a => a.id !== adj.id))}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}

                        {showAddAdjustment && (
                          <div className="p-3 rounded-lg border border-dashed border-border/60 bg-muted/10 space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <Select value={newAdjType} onValueChange={(v) => setNewAdjType(v as typeof newAdjType)}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bonus">Bonus</SelectItem>
                                  <SelectItem value="deduction">Deduction</SelectItem>
                                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={newAdjAmount}
                                onChange={(e) => setNewAdjAmount(e.target.value)}
                                className="h-7 text-xs"
                              />
                            </div>
                            <Input
                              placeholder="Label (e.g., Q4 Bonus)"
                              value={newAdjLabel}
                              onChange={(e) => setNewAdjLabel(e.target.value)}
                              className="h-7 text-xs"
                            />
                            <Input
                              placeholder="Reason"
                              value={newAdjReason}
                              onChange={(e) => setNewAdjReason(e.target.value)}
                              className="h-7 text-xs"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs flex-1" onClick={handleAddAdjustment}>
                                Add
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddAdjustment(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {hasChanges && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs text-muted-foreground w-full justify-center"
                          onClick={handleResetOverrides}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset all
                        </Button>
                      )}
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* SECTION E: Previous Payslips */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-auto py-3 px-0 hover:bg-transparent">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Previous Payslips
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pb-2">
                  {["December 2025", "November 2025", "October 2025"].map((month) => (
                    <div key={month} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/30 hover:bg-muted/30 transition-colors">
                      <span className="text-xs text-foreground">{month}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>


            </div>
          </div>

          {/* Footer - Save Actions */}
          {hasChanges && (
            <div className="p-4 border-t border-border/40 bg-background shrink-0">
              <p className="text-[11px] text-muted-foreground text-center mb-3">
                Recalculating will update this payroll run totals.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={handleSaveAndRecalculate}
                >
                  Save & Recalculate
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Large Delta Confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Significant change
            </AlertDialogTitle>
            <AlertDialogDescription>
              This adjustment changes the payout by more than 20%. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLargeAdjustment}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default F1v4_WorkerDetailDrawer;
