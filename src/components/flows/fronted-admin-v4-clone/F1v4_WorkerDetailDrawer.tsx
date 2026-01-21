/**
 * F1v4_WorkerDetailDrawer - Premium worker details right-side drawer
 * 
 * 4 tabs: Payroll Summary, Overrides, Payslips, Audit Log
 * Calm audit panel design with worker navigation
 */

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  missingData?: { field: string; reason: string; fix: string }[];
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
  "needs-attention": { label: "Needs attention", className: "bg-destructive/10 text-destructive border-destructive/20" },
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
  { id: "4", action: "Reviewed by admin", timestamp: "Jan 19, 2026 11:15", actor: "Sarah Admin" },
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
  const [activeTab, setActiveTab] = useState("summary");
  const [overridesEnabled, setOverridesEnabled] = useState(false);
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOverride, setPendingOverride] = useState<{ field: string; value: string } | null>(null);

  // Override fields
  const [startDateOverride, setStartDateOverride] = useState("");
  const [endDateOverride, setEndDateOverride] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [payAmountOverride, setPayAmountOverride] = useState("");
  const [daysOverride, setDaysOverride] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideNote, setOverrideNote] = useState("");

  // New adjustment form
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
  const adjustmentsTotal = worker.adjustments || 0;
  const fees = worker.fees || worker.netPay * 0.03;
  const baseSalary = worker.baseSalary || worker.netPay * 1.2;
  const scheduledDays = worker.scheduledDays || 22;
  const actualDays = worker.actualDays || 21;
  const leaveTaken = worker.leaveTaken || 1;
  const netPayableDays = worker.netPayableDays || 21;

  const missingData = worker.missingData || (worker.status === "missing-submission" ? [
    { field: "Bank details", reason: "Required for payout", fix: "Request from worker" }
  ] : worker.status === "needs-attention" ? [
    { field: "Timesheet", reason: "Not submitted for this period", fix: "Send reminder" }
  ] : []);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < workers.length - 1;

  const handleResetOverrides = () => {
    setStartDateOverride("");
    setEndDateOverride("");
    setStatusOverride("");
    setPayAmountOverride("");
    setDaysOverride("");
    setOverrideReason("");
    setOverrideNote("");
    setAdjustments([]);
    toast.success("Overrides reset");
  };

  const handleAddAdjustment = () => {
    if (!newAdjLabel || !newAdjAmount || !newAdjReason) {
      toast.error("Please fill all adjustment fields");
      return;
    }
    const amount = parseFloat(newAdjAmount);
    if (isNaN(amount)) {
      toast.error("Invalid amount");
      return;
    }

    // Check for large delta
    const delta = Math.abs(amount / worker.netPay);
    if (delta > 0.2) {
      setPendingOverride({ field: "adjustment", value: newAdjAmount });
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
    toast.success("Adjustment added");
  };

  const handleRemoveAdjustment = (id: string) => {
    setAdjustments(prev => prev.filter(a => a.id !== id));
    toast.success("Adjustment removed");
  };

  const handleConfirmOverride = () => {
    if (pendingOverride?.field === "adjustment") {
      addAdjustment(parseFloat(pendingOverride.value));
    }
    setShowConfirmDialog(false);
    setPendingOverride(null);
  };

  const totalAdjustments = adjustments.reduce((sum, adj) => {
    return sum + (adj.type === "deduction" ? -adj.amount : adj.amount);
  }, 0);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[520px] sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 pb-4 border-b border-border/40 shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-base font-semibold text-foreground mb-1">
                    {worker.name}
                  </SheetTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {countryFlags[worker.country] || ""} {worker.country}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{worker.currency}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {worker.type === "employee" ? "Employee" : "Contractor"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-semibold text-foreground tabular-nums">
                  {formatCurrency(worker.netPay + totalAdjustments, worker.currency)}
                </p>
                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 mt-1", config.className)}>
                  {config.label}
                </Badge>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(currentIndex - 1)}
                disabled={!hasPrev}
                className="gap-1 text-xs h-7"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} of {workers.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(currentIndex + 1)}
                disabled={!hasNext}
                className="gap-1 text-xs h-7"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Exception Alert (if any) */}
          {missingData.length > 0 && (
            <div className="mx-5 mt-4 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive mb-1">
                    {worker.status === "blocking" ? "Blocking issue" : "Attention required"}
                  </p>
                  {missingData.map((item, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground mb-2 last:mb-0">
                      <p><strong>{item.field}:</strong> {item.reason}</p>
                      <Button variant="link" size="sm" className="h-5 p-0 text-xs text-primary">
                        {item.fix}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-5 mt-4 h-9 bg-muted/30 p-0.5 shrink-0">
              <TabsTrigger value="summary" className="text-xs h-8 px-3 data-[state=active]:bg-background">
                Summary
              </TabsTrigger>
              <TabsTrigger value="overrides" className="text-xs h-8 px-3 data-[state=active]:bg-background">
                Overrides
              </TabsTrigger>
              <TabsTrigger value="payslips" className="text-xs h-8 px-3 data-[state=active]:bg-background">
                Payslips
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs h-8 px-3 data-[state=active]:bg-background">
                Audit Log
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {/* TAB 1: Payroll Summary */}
              <TabsContent value="summary" className="mt-4 space-y-5">
                {/* Pay Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Pay Breakdown
                  </h4>
                  <div className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gross pay</span>
                      <span className="font-medium tabular-nums">{formatCurrency(grossPay, worker.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Adjustments</span>
                      <span className={cn("font-medium tabular-nums", adjustmentsTotal !== 0 && (adjustmentsTotal > 0 ? "text-accent-green-text" : "text-destructive"))}>
                        {adjustmentsTotal >= 0 ? "+" : ""}{formatCurrency(adjustmentsTotal, worker.currency)}
                      </span>
                    </div>
                    {worker.type === "contractor" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fees</span>
                        <span className="font-medium tabular-nums text-muted-foreground">-{formatCurrency(fees, worker.currency)}</span>
                      </div>
                    )}
                    <div className="border-t border-border/40 pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">Net pay</span>
                        <span className="font-semibold text-foreground tabular-nums">{formatCurrency(worker.netPay + totalAdjustments, worker.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payroll Inputs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Payroll Inputs
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-border/40 bg-card/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Base {worker.type === "contractor" ? "Rate" : "Salary"}</p>
                      <p className="text-sm font-medium tabular-nums">{formatCurrency(baseSalary, worker.currency)}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/40 bg-card/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Scheduled Days</p>
                      <p className="text-sm font-medium tabular-nums">{scheduledDays}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/40 bg-card/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Actual Days</p>
                      <p className="text-sm font-medium tabular-nums">{actualDays}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border/40 bg-card/30">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Leave Taken</p>
                      <p className="text-sm font-medium tabular-nums">{leaveTaken} day{leaveTaken !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 col-span-2">
                      <p className="text-[10px] text-primary/70 mb-0.5">Net Payable Days</p>
                      <p className="text-sm font-semibold text-primary tabular-nums">{netPayableDays}</p>
                    </div>
                  </div>
                </div>

                {/* Track Step: Payment Status */}
                {isTrackStep && worker.paymentStatus && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Payment Status
                    </h4>
                    <div className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <div className={cn("flex items-center gap-1.5 text-sm font-medium", paymentStatusConfig[worker.paymentStatus]?.className)}>
                          {React.createElement(paymentStatusConfig[worker.paymentStatus]?.icon || Clock, { className: "h-4 w-4" })}
                          {paymentStatusConfig[worker.paymentStatus]?.label}
                        </div>
                      </div>
                      {worker.providerRef && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Provider Ref</span>
                          <span className="font-mono text-xs">{worker.providerRef}</span>
                        </div>
                      )}
                      {worker.receiptUrl && (
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                          <Receipt className="h-3.5 w-3.5" />
                          View Receipt
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                      )}
                      {worker.paymentStatus === "not-paid" && (
                        <div className="flex gap-2 pt-2">
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
                            className="flex-1 text-xs"
                            onClick={() => onRetryPayout?.(worker.id)}
                          >
                            Retry payout
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: Overrides */}
              <TabsContent value="overrides" className="mt-4 space-y-5">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable overrides for this run</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Changes apply to this cycle only
                    </p>
                  </div>
                  <Switch checked={overridesEnabled} onCheckedChange={setOverridesEnabled} />
                </div>

                {overridesEnabled && (
                  <>
                    {/* Override Fields */}
                    <div className="space-y-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Overrides apply to this cycle only</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start Date Override</Label>
                          <Input
                            type="date"
                            value={startDateOverride}
                            onChange={(e) => setStartDateOverride(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">End Date Override</Label>
                          <Input
                            type="date"
                            value={endDateOverride}
                            onChange={(e) => setEndDateOverride(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Status Override</Label>
                        <Select value={statusOverride} onValueChange={setStatusOverride}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="No override" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive for cycle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Pay Amount Override</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={payAmountOverride}
                            onChange={(e) => setPayAmountOverride(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Days Override</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={daysOverride}
                            onChange={(e) => setDaysOverride(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Reason *</Label>
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

                      <div className="space-y-1.5">
                        <Label className="text-xs">Notes</Label>
                        <Textarea
                          placeholder="Add context for this override..."
                          value={overrideNote}
                          onChange={(e) => setOverrideNote(e.target.value)}
                          className="text-xs min-h-[60px]"
                        />
                      </div>
                    </div>

                    {/* Manual Adjustments */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Manual Adjustments
                      </h4>

                      {adjustments.map((adj) => (
                        <div key={adj.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/30">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "text-[9px] px-1.5 py-0 h-4",
                                adj.type === "bonus" && "bg-accent-green-fill/10 text-accent-green-text",
                                adj.type === "deduction" && "bg-destructive/10 text-destructive",
                                adj.type === "reimbursement" && "bg-blue-500/10 text-blue-600"
                              )}>
                                {adj.type}
                              </Badge>
                              <span className="text-sm font-medium">{adj.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{adj.reason}</p>
                          </div>
                          <span className={cn(
                            "text-sm font-medium tabular-nums",
                            adj.type === "deduction" ? "text-destructive" : "text-accent-green-text"
                          )}>
                            {adj.type === "deduction" ? "-" : "+"}{formatCurrency(adj.amount, worker.currency)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleRemoveAdjustment(adj.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}

                      {/* Add Adjustment Form */}
                      <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-3">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Add adjustment</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Type</Label>
                            <Select value={newAdjType} onValueChange={(v) => setNewAdjType(v as typeof newAdjType)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bonus">Bonus</SelectItem>
                                <SelectItem value="deduction">Deduction</SelectItem>
                                <SelectItem value="reimbursement">Reimbursement</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Amount</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={newAdjAmount}
                              onChange={(e) => setNewAdjAmount(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Label</Label>
                          <Input
                            placeholder="e.g., Q4 Performance Bonus"
                            value={newAdjLabel}
                            onChange={(e) => setNewAdjLabel(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Reason</Label>
                          <Input
                            placeholder="Reason for adjustment"
                            value={newAdjReason}
                            onChange={(e) => setNewAdjReason(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs"
                          onClick={handleAddAdjustment}
                        >
                          Add Adjustment
                        </Button>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground"
                      onClick={handleResetOverrides}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset all overrides
                    </Button>
                  </>
                )}
              </TabsContent>

              {/* TAB 3: Payslips */}
              <TabsContent value="payslips" className="mt-4 space-y-4">
                <div className="p-5 rounded-xl border border-border/40 bg-card/50 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">January 2026 Payslip</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Pay period: Jan 1 - Jan 31, 2026
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => onPayslipPreview(worker)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => toast.success("Payslip downloaded")}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                {/* Previous Payslips */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Previous Payslips
                  </h4>
                  {["December 2025", "November 2025", "October 2025"].map((month) => (
                    <div key={month} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/30 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{month}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 4: Audit Log */}
              <TabsContent value="audit" className="mt-4">
                <div className="space-y-2">
                  {mockAuditLog.map((log, idx) => (
                    <div
                      key={log.id}
                      className={cn(
                        "relative pl-5 pb-4",
                        idx !== mockAuditLog.length - 1 && "border-l border-border/40 ml-1.5"
                      )}
                    >
                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-muted border-2 border-background" />
                      <div className="ml-2">
                        <p className="text-sm text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp} • {log.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Large Delta Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Significant change detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              This adjustment changes the payout by more than 20%. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverride}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default F1v4_WorkerDetailDrawer;
