/**
 * F1v4_WorkerReceiptDrawer - Receipt-first worker breakdown drawer
 * 
 * Reuses Flow 6 v3 patterns: receipt view first, then edit mode for adjustments
 * Simplified statuses for Fronted Admin (company admin already resolved issues)
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  Download,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Receipt,
} from "lucide-react";
import { CollapsibleSection } from "@/components/flows/company-admin-v3/CA3_CollapsibleSection";

export interface WorkerData {
  id: string;
  name: string;
  type: "employee" | "contractor";
  country: string;
  currency: string;
  status: "ready" | "pending" | "flagged";
  netPay: number;
  grossPay?: number;
  baseSalary?: number;
  issues?: number;
}

interface ManualAdjustment {
  id: string;
  type: "bonus" | "deduction" | "reimbursement";
  label: string;
  amount: number;
  reason: string;
}

interface F1v4_WorkerReceiptDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerData | null;
  workers: WorkerData[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

// Status config simplified for Fronted Admin
const statusConfig: Record<WorkerData["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  flagged: { label: "Flagged", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹"
};

// Static breakdown row
const BreakdownRow = ({ 
  label, 
  amount, 
  currency, 
  isPositive = true,
  isTotal = false,
}: { 
  label: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isTotal?: boolean;
}) => {
  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-2",
      isTotal && "pt-3 mt-1 border-t border-dashed border-border/50"
    )}>
      <span className={cn(
        "truncate",
        isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"
      )}>
        {label}
      </span>
      <span className={cn(
        "whitespace-nowrap tabular-nums text-right font-mono shrink-0 ml-4",
        isTotal ? "text-sm font-semibold text-foreground" : "text-sm",
        isPositive ? "text-foreground" : "text-muted-foreground"
      )}>
        {isPositive ? '' : '−'}{formatAmount(amount, currency)}
      </span>
    </div>
  );
};

export const F1v4_WorkerReceiptDrawer: React.FC<F1v4_WorkerReceiptDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  workers,
  currentIndex,
  onNavigate,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New adjustment form
  const [newAdjType, setNewAdjType] = useState<"bonus" | "deduction" | "reimbursement">("bonus");
  const [newAdjLabel, setNewAdjLabel] = useState("");
  const [newAdjAmount, setNewAdjAmount] = useState("");
  const [newAdjReason, setNewAdjReason] = useState("");

  // Reset state when worker changes
  useEffect(() => {
    setIsEditMode(false);
    setShowAddForm(false);
    setAdjustments([]);
  }, [worker?.id]);

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

  // Mock data for breakdown
  const grossPay = worker.grossPay || worker.netPay * 1.25;
  const baseSalary = worker.baseSalary || worker.netPay * 1.2;
  const deductions = worker.type === "employee" ? grossPay * 0.15 : 0;
  const fees = worker.type === "contractor" ? worker.netPay * 0.03 : 0;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < workers.length - 1;

  const totalAdjustments = adjustments.reduce((sum, adj) => {
    return sum + (adj.type === "deduction" ? -adj.amount : adj.amount);
  }, 0);

  const calculatedNetPay = worker.netPay + totalAdjustments;
  const hasChanges = adjustments.length > 0;

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
    setShowAddForm(false);
    toast.success("Adjustment added");
  };

  const handleRemoveAdjustment = (id: string) => {
    setAdjustments(prev => prev.filter(a => a.id !== id));
    toast.success("Adjustment removed");
  };

  const handleSaveChanges = () => {
    toast.success("Changes saved", {
      description: "Payroll recalculated for this worker"
    });
    setIsEditMode(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 py-5 border-b border-border/40 shrink-0 bg-background pt-12">
          <div className="flex items-center gap-3">
            {/* Prev Arrow */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={!hasPrev}
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Worker Identity */}
            <div className="flex-1 flex flex-col items-center text-center min-w-0">
              <Avatar className="h-12 w-12 mb-2">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {getInitials(worker.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-foreground truncate">
                  {worker.name}
                </h2>
                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 shrink-0", config.className)}>
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted/30">
                  <TypeIcon className="h-2.5 w-2.5 mr-1" />
                  {worker.type === "employee" ? "Employee" : "Contractor"}
                </Badge>
                <span className="text-muted-foreground/40">•</span>
                <span>{countryFlags[worker.country] || ""} {worker.country}</span>
                <span className="text-muted-foreground/40">•</span>
                <span>{worker.currency}</span>
              </div>
              <span className="text-[10px] text-muted-foreground/60 mt-1.5">
                {currentIndex + 1} of {workers.length}
              </span>
            </div>

            {/* Next Arrow */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={!hasNext}
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Hero Amount */}
          <div className="text-center mb-5">
            <p className="text-xs text-muted-foreground mb-1">
              {worker.type === "employee" ? "Net Pay" : "Invoice Total"} · This Cycle
            </p>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {formatCurrency(calculatedNetPay, worker.currency)}
            </p>
            {hasChanges && (
              <p className="text-xs text-amber-600 mt-1">
                (includes pending changes)
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
            <span className="text-xs text-muted-foreground">
              {isEditMode ? "Edit Mode" : "Receipt View"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="h-7 text-xs gap-1.5"
            >
              {isEditMode ? (
                <>
                  <Receipt className="h-3 w-3" />
                  View Receipt
                </>
              ) : (
                <>
                  <Pencil className="h-3 w-3" />
                  Edit Breakdown
                </>
              )}
            </Button>
          </div>

          {/* Receipt-Style Breakdown */}
          <div className="space-y-1">
            {/* Earnings Section */}
            <CollapsibleSection
              title="Earnings"
              totalCount={2}
              defaultOpen={true}
            >
              <BreakdownRow 
                label="Base Salary" 
                amount={baseSalary} 
                currency={worker.currency} 
              />
              {worker.type === "contractor" && (
                <BreakdownRow 
                  label="Contract Fee" 
                  amount={grossPay - baseSalary} 
                  currency={worker.currency} 
                />
              )}
              <BreakdownRow 
                label="Total Earnings" 
                amount={grossPay} 
                currency={worker.currency}
                isTotal 
              />
            </CollapsibleSection>

            {/* Deductions Section */}
            <CollapsibleSection
              title="Deductions"
              totalCount={worker.type === "employee" ? 3 : 1}
              defaultOpen={true}
            >
              {worker.type === "employee" ? (
                <>
                  <BreakdownRow 
                    label="Income Tax" 
                    amount={deductions * 0.6} 
                    currency={worker.currency}
                    isPositive={false}
                  />
                  <BreakdownRow 
                    label="Social Security" 
                    amount={deductions * 0.3} 
                    currency={worker.currency}
                    isPositive={false}
                  />
                  <BreakdownRow 
                    label="Other Deductions" 
                    amount={deductions * 0.1} 
                    currency={worker.currency}
                    isPositive={false}
                  />
                </>
              ) : (
                <BreakdownRow 
                  label="Fronted Fees" 
                  amount={fees} 
                  currency={worker.currency}
                  isPositive={false}
                />
              )}
              <BreakdownRow 
                label="Total Deductions" 
                amount={worker.type === "employee" ? deductions : fees} 
                currency={worker.currency}
                isPositive={false}
                isTotal 
              />
            </CollapsibleSection>

            {/* Adjustments Section - Editable in edit mode */}
            <CollapsibleSection
              title="Adjustments"
              pendingCount={adjustments.length}
              defaultOpen={isEditMode || adjustments.length > 0}
              forceOpen={isEditMode || adjustments.length > 0}
            >
              {adjustments.length === 0 && !isEditMode ? (
                <p className="text-xs text-muted-foreground py-2">No adjustments</p>
              ) : (
                <div className="space-y-1">
                  {adjustments.map((adj) => (
                    <div 
                      key={adj.id} 
                      className="flex items-center justify-between py-2 -mx-2 px-2 rounded hover:bg-muted/50 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-foreground truncate">{adj.label}</span>
                        <Badge variant="outline" className="text-[9px] px-1 h-4 shrink-0">
                          {adj.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm tabular-nums font-mono",
                          adj.type === "deduction" ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {adj.type === "deduction" ? "−" : "+"}{formatCurrency(adj.amount, worker.currency).replace(worker.currency + " ", "")}
                        </span>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAdjustment(adj.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Adjustment Form (Edit Mode) */}
              {isEditMode && (
                <>
                  {!showAddForm ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddForm(true)}
                      className="h-7 text-xs gap-1.5 mt-2 w-full justify-start text-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                      Add Adjustment
                    </Button>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg border border-border/50 bg-muted/30 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Type</label>
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
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Amount ({worker.currency})</label>
                          <Input
                            type="number"
                            value={newAdjAmount}
                            onChange={(e) => setNewAdjAmount(e.target.value)}
                            className="h-8 text-xs"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Label</label>
                        <Input
                          value={newAdjLabel}
                          onChange={(e) => setNewAdjLabel(e.target.value)}
                          className="h-8 text-xs"
                          placeholder="e.g., Performance bonus"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Reason</label>
                        <Textarea
                          value={newAdjReason}
                          onChange={(e) => setNewAdjReason(e.target.value)}
                          className="min-h-[60px] text-xs resize-none"
                          placeholder="Reason for this adjustment..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddForm(false);
                            setNewAdjLabel("");
                            setNewAdjAmount("");
                            setNewAdjReason("");
                          }}
                          className="flex-1 h-8 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddAdjustment}
                          className="flex-1 h-8 text-xs"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CollapsibleSection>
          </div>

          {/* Net Pay Summary */}
          <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {worker.type === "employee" ? "Net Pay" : "Invoice Total"}
              </span>
              <span className="text-lg font-bold text-foreground tabular-nums">
                {formatCurrency(calculatedNetPay, worker.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-border/40 bg-gradient-to-t from-background to-background/80">
          {isEditMode && hasChanges ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdjustments([]);
                  setIsEditMode(false);
                }}
                className="flex-1 h-10 text-sm"
              >
                Discard Changes
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="flex-1 h-10 text-sm"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-10 text-sm gap-2"
            >
              <Download className="h-4 w-4" />
              Download {worker.type === "employee" ? "Payslip" : "Invoice"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default F1v4_WorkerReceiptDrawer;
