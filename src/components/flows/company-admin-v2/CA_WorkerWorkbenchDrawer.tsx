// Flow 6 v2 - Company Admin Dashboard - Worker Workbench Drawer
// Unified payroll workbench for FX Review step

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Briefcase, 
  Users, 
  ChevronDown, 
  Lock, 
  Receipt, 
  Calendar,
  Globe,
  Clock,
  FileText,
  Settings,
  Eye,
  Calculator,
  X,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

// Types for the workbench drawer
export interface WorkbenchWorker {
  id: string;
  name: string;
  employmentType: "employee" | "contractor";
  country: string;
  countryCode: string;
  currency: string;
  payFrequency: string;
  baseSalary: number;
  grossPay: number;
  netPay: number;
  estFees: number;
  employerTaxes?: number;
  deductions?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  ftePercent?: number;
  compensationType?: string;
  hourlyRate?: number;
  hoursWorked?: number;
}

interface LeaveAdjustmentSummary {
  id: string;
  type: "leave" | "adjustment";
  label: string;
  amount: number;
  currency: string;
  status: "approved" | "pending" | "rejected";
}

// Types for adjustments
type AdjustmentType = "earning" | "deduction" | "reimbursement";

interface OneOffAdjustment {
  id: string;
  label: string;
  type: AdjustmentType;
  amount: number;
  notes?: string;
}

interface RecurringAdjustment {
  id: string;
  label: string;
  type: AdjustmentType;
  amount: number;
  frequency: "every_pay_run" | "monthly";
  startFrom: string;
  endAfter?: string;
  noEndDate: boolean;
}

interface CA_WorkerWorkbenchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkbenchWorker | null;
  payrollPeriod: string;
  onSaveAndRecalculate?: (workerId: string, updates: any) => void;
}

export const CA_WorkerWorkbenchDrawer: React.FC<CA_WorkerWorkbenchDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  payrollPeriod,
  onSaveAndRecalculate
}) => {
  // Section collapse states
  const [profileOpen, setProfileOpen] = useState(true);
  const [payrollDetailsOpen, setPayrollDetailsOpen] = useState(true);
  const [payBreakdownOpen, setPayBreakdownOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [leaveAdjustmentsOpen, setLeaveAdjustmentsOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);

  // Override states
  const [overrideEmploymentDates, setOverrideEmploymentDates] = useState(false);
  const [overrideStartDate, setOverrideStartDate] = useState("");
  const [overrideEndDate, setOverrideEndDate] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("");
  const [overrideBaseFee, setOverrideBaseFee] = useState(false);
  const [overrideBaseFeeAmount, setOverrideBaseFeeAmount] = useState("");
  const [overrideDeductions, setOverrideDeductions] = useState(false);
  const [overrideDeductionsAmount, setOverrideDeductionsAmount] = useState("");

  // One-off adjustments state
  const [oneOffAdjustments, setOneOffAdjustments] = useState<OneOffAdjustment[]>([]);
  const [showAddOneOff, setShowAddOneOff] = useState(false);
  const [editingOneOffId, setEditingOneOffId] = useState<string | null>(null);
  const [oneOffForm, setOneOffForm] = useState<{
    label: string;
    type: AdjustmentType;
    amount: string;
    notes: string;
  }>({ label: "", type: "earning", amount: "", notes: "" });

  // Recurring adjustments state
  const [recurringAdjustments, setRecurringAdjustments] = useState<RecurringAdjustment[]>([]);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);
  const [recurringForm, setRecurringForm] = useState<{
    label: string;
    type: AdjustmentType;
    amount: string;
    frequency: "every_pay_run" | "monthly";
    startFrom: string;
    endAfter: string;
    noEndDate: boolean;
  }>({ label: "", type: "earning", amount: "", frequency: "every_pay_run", startFrom: "", endAfter: "", noEndDate: true });

  // Confirmation states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<"oneoff" | "recurring" | null>(null);

  if (!worker) return null;

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Mock data for FX details
  const fxDetails = {
    rate: worker.currency === "EUR" ? 0.92 : worker.currency === "PHP" ? 56.2 : worker.currency === "NOK" ? 10.45 : 1,
    baseCurrency: "USD",
    eta: worker.currency === "EUR" ? "1-2 business days" : worker.currency === "PHP" ? "3-5 business days" : "Same day"
  };

  // Mock earnings/deductions for breakdown
  const mockEarnings = [
    { id: "e1", name: worker.employmentType === "contractor" ? "Base Consultancy Fee" : "Base Monthly Salary", amount: worker.baseSalary, isLocked: true },
    { id: "e2", name: "Performance Bonus", amount: worker.baseSalary * 0.05, isLocked: false },
  ];

  const mockDeductions = worker.employmentType === "employee" ? [
    { id: "d1", name: "SSS Contribution", amount: (worker.deductions || 0) * 0.3, isLocked: true },
    { id: "d2", name: "PhilHealth", amount: (worker.deductions || 0) * 0.2, isLocked: true },
    { id: "d3", name: "Pag-IBIG", amount: (worker.deductions || 0) * 0.1, isLocked: true },
    { id: "d4", name: "Withholding Tax", amount: (worker.deductions || 0) * 0.4, isLocked: true }
  ] : [];

  const mockEmployerContributions = worker.employmentType === "employee" && worker.employerTaxes ? [
    { id: "ec1", name: "SSS (Employer)", amount: worker.employerTaxes * 0.4, isLocked: true },
    { id: "ec2", name: "PhilHealth (Employer)", amount: worker.employerTaxes * 0.3, isLocked: true },
    { id: "ec3", name: "Pag-IBIG (Employer)", amount: worker.employerTaxes * 0.3, isLocked: true }
  ] : [];

  // Mock leave & adjustments for this cycle
  const mockLeaveAdjustments: LeaveAdjustmentSummary[] = [
    { id: "la1", type: "leave", label: "2 days Annual Leave", amount: -Math.round(worker.baseSalary / 22 * 2), currency: worker.currency, status: "approved" },
    { id: "la2", type: "adjustment", label: "Overtime bonus", amount: 5000, currency: worker.currency, status: "approved" }
  ];

  // Calculate totals including custom adjustments
  const totalEarnings = mockEarnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = mockDeductions.reduce((sum, d) => sum + d.amount, 0);
  const adjustmentsTotal = mockLeaveAdjustments.filter(a => a.status === "approved").reduce((sum, a) => sum + a.amount, 0);
  
  // Add one-off adjustments to calculation
  const oneOffTotal = oneOffAdjustments.reduce((sum, adj) => {
    if (adj.type === "earning" || adj.type === "reimbursement") return sum + adj.amount;
    if (adj.type === "deduction") return sum - adj.amount;
    return sum;
  }, 0);

  // Add recurring adjustments to calculation
  const recurringTotal = recurringAdjustments.reduce((sum, adj) => {
    if (adj.type === "earning" || adj.type === "reimbursement") return sum + adj.amount;
    if (adj.type === "deduction") return sum - adj.amount;
    return sum;
  }, 0);

  const calculatedNetPay = totalEarnings - totalDeductions + adjustmentsTotal + oneOffTotal + recurringTotal;
  const totalPayable = calculatedNetPay + worker.estFees;

  // One-off adjustment handlers
  const resetOneOffForm = () => {
    setOneOffForm({ label: "", type: "earning", amount: "", notes: "" });
    setShowAddOneOff(false);
    setEditingOneOffId(null);
  };

  const handleAddOneOffAdjustment = () => {
    if (!oneOffForm.label.trim() || !oneOffForm.amount) {
      toast.error("Please fill in label and amount");
      return;
    }

    const newAdjustment: OneOffAdjustment = {
      id: editingOneOffId || `oneoff-${Date.now()}`,
      label: oneOffForm.label.trim(),
      type: oneOffForm.type,
      amount: parseFloat(oneOffForm.amount),
      notes: oneOffForm.notes.trim() || undefined
    };

    if (editingOneOffId) {
      setOneOffAdjustments(prev => prev.map(a => a.id === editingOneOffId ? newAdjustment : a));
      toast.success("Adjustment updated");
    } else {
      setOneOffAdjustments(prev => [...prev, newAdjustment]);
      toast.success("Adjustment added to this cycle");
    }

    resetOneOffForm();
  };

  const handleEditOneOff = (adjustment: OneOffAdjustment) => {
    setOneOffForm({
      label: adjustment.label,
      type: adjustment.type,
      amount: adjustment.amount.toString(),
      notes: adjustment.notes || ""
    });
    setEditingOneOffId(adjustment.id);
    setShowAddOneOff(true);
  };

  const handleRemoveOneOff = (id: string) => {
    setOneOffAdjustments(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
    setDeleteConfirmType(null);
    toast.success("Adjustment removed");
  };

  // Recurring adjustment handlers
  const resetRecurringForm = () => {
    setRecurringForm({ label: "", type: "earning", amount: "", frequency: "every_pay_run", startFrom: "", endAfter: "", noEndDate: true });
    setShowAddRecurring(false);
    setEditingRecurringId(null);
  };

  const handleAddRecurringAdjustment = () => {
    if (!recurringForm.label.trim() || !recurringForm.amount) {
      toast.error("Please fill in label and amount");
      return;
    }

    const newAdjustment: RecurringAdjustment = {
      id: editingRecurringId || `recurring-${Date.now()}`,
      label: recurringForm.label.trim(),
      type: recurringForm.type,
      amount: parseFloat(recurringForm.amount),
      frequency: recurringForm.frequency,
      startFrom: recurringForm.startFrom || payrollPeriod,
      endAfter: recurringForm.noEndDate ? undefined : recurringForm.endAfter || undefined,
      noEndDate: recurringForm.noEndDate
    };

    if (editingRecurringId) {
      setRecurringAdjustments(prev => prev.map(a => a.id === editingRecurringId ? newAdjustment : a));
      toast.success("Recurring adjustment updated");
    } else {
      setRecurringAdjustments(prev => [...prev, newAdjustment]);
      toast.success("Recurring adjustment saved");
    }

    resetRecurringForm();
  };

  const handleEditRecurring = (adjustment: RecurringAdjustment) => {
    setRecurringForm({
      label: adjustment.label,
      type: adjustment.type,
      amount: adjustment.amount.toString(),
      frequency: adjustment.frequency,
      startFrom: adjustment.startFrom,
      endAfter: adjustment.endAfter || "",
      noEndDate: adjustment.noEndDate
    });
    setEditingRecurringId(adjustment.id);
    setShowAddRecurring(true);
  };

  const handleRemoveRecurring = (id: string) => {
    setRecurringAdjustments(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
    setDeleteConfirmType(null);
    toast.success("Recurring adjustment removed");
  };

  const handleSave = () => {
    const updates = {
      overrideEmploymentDates,
      overrideStartDate,
      overrideEndDate,
      overrideStatus,
      overrideBaseFee,
      overrideBaseFeeAmount: overrideBaseFee ? parseFloat(overrideBaseFeeAmount) : null,
      overrideDeductions,
      overrideDeductionsAmount: overrideDeductions ? parseFloat(overrideDeductionsAmount) : null,
      oneOffAdjustments,
      recurringAdjustments,
      calculatedTotals: {
        netPay: calculatedNetPay,
        totalPayable,
        oneOffTotal,
        recurringTotal
      }
    };
    
    onSaveAndRecalculate?.(worker.id, updates);
    toast.success(`${worker.name}'s payroll recalculated for this cycle`);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset overrides
    setOverrideEmploymentDates(false);
    setOverrideStartDate("");
    setOverrideEndDate("");
    setOverrideStatus("");
    setOverrideBaseFee(false);
    setOverrideBaseFeeAmount("");
    setOverrideDeductions(false);
    setOverrideDeductionsAmount("");
    resetOneOffForm();
    resetRecurringForm();
    onOpenChange(false);
  };

  const getTypeLabel = (type: AdjustmentType) => {
    switch (type) {
      case "earning": return "Earning";
      case "deduction": return "Deduction";
      case "reimbursement": return "Reimbursement";
    }
  };

  const getTypeBadgeClass = (type: AdjustmentType) => {
    switch (type) {
      case "earning": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "deduction": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "reimbursement": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    }
  };

  const getAmountDisplay = (type: AdjustmentType, amount: number) => {
    const sign = type === "deduction" ? "-" : "+";
    const colorClass = type === "deduction" ? "text-red-600" : "text-green-600";
    return <span className={cn("font-medium", colorClass)}>{sign} {formatCurrency(amount, worker.currency)}</span>;
  };

  // Adjustment Form Mini-Card Component
  const AdjustmentFormCard = ({ 
    isRecurring = false, 
    onCancel, 
    onSave 
  }: { 
    isRecurring?: boolean; 
    onCancel: () => void; 
    onSave: () => void; 
  }) => {
    const form = isRecurring ? recurringForm : oneOffForm;
    const setForm = isRecurring 
      ? (updates: Partial<typeof recurringForm>) => setRecurringForm(prev => ({ ...prev, ...updates }))
      : (updates: Partial<typeof oneOffForm>) => setOneOffForm(prev => ({ ...prev, ...updates }));
    const isEditing = isRecurring ? !!editingRecurringId : !!editingOneOffId;

    return (
      <Card className="border-primary/20 bg-primary/[0.02] mt-2">
        <CardContent className="p-3 space-y-3">
          {/* Label */}
          <div>
            <Label className="text-xs text-muted-foreground">Label / Description</Label>
            <Input
              value={form.label}
              onChange={(e) => setForm({ label: e.target.value })}
              placeholder={isRecurring ? "Monthly housing allowance" : "Q4 bonus, Commission, Expense reimbursement"}
              className="mt-1 h-8 text-sm"
            />
          </div>

          {/* Type */}
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <div className="flex gap-2 mt-1">
              {(["earning", "deduction", "reimbursement"] as AdjustmentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ type: t })}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-colors",
                    form.type === t
                      ? t === "earning" ? "bg-green-500/20 text-green-700 border-green-500/40"
                        : t === "deduction" ? "bg-red-500/20 text-red-700 border-red-500/40"
                        : "bg-blue-500/20 text-blue-700 border-blue-500/40"
                      : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50"
                  )}
                >
                  {t === "earning" ? "Earning (+)" : t === "deduction" ? "Deduction (−)" : "Reimbursement"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-xs text-muted-foreground">Amount ({worker.currency})</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-muted-foreground">{worker.currency}</span>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ amount: e.target.value })}
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Recurring-specific fields */}
          {isRecurring && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground">Frequency</Label>
                <Select 
                  value={(form as typeof recurringForm).frequency} 
                  onValueChange={(v) => setForm({ frequency: v as "every_pay_run" | "monthly" })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="every_pay_run">Every pay run</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Start from</Label>
                  <Input
                    value={(form as typeof recurringForm).startFrom}
                    onChange={(e) => setForm({ startFrom: e.target.value })}
                    placeholder={payrollPeriod}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End after</Label>
                  <Input
                    value={(form as typeof recurringForm).endAfter}
                    onChange={(e) => setForm({ endAfter: e.target.value })}
                    placeholder="No end date"
                    disabled={(form as typeof recurringForm).noEndDate}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  id="noEndDate"
                  checked={(form as typeof recurringForm).noEndDate} 
                  onCheckedChange={(checked) => setForm({ noEndDate: checked })} 
                />
                <Label htmlFor="noEndDate" className="text-xs">No end date</Label>
              </div>

              <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                These adjustments are automatically applied to each monthly pay run for this worker.
              </p>
            </>
          )}

          {/* Notes (one-off only) */}
          {!isRecurring && (
            <div>
              <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
              <Textarea
                value={(form as typeof oneOffForm).notes}
                onChange={(e) => setForm({ notes: e.target.value })}
                placeholder="Additional notes..."
                className="mt-1 text-sm min-h-[60px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
            <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 h-8">
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} className="flex-1 h-8 bg-primary hover:bg-primary/90">
              {isEditing ? "Update" : isRecurring ? "Save recurring adjustment" : "Add to this cycle"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Adjustment Row Component
  const AdjustmentRow = ({ 
    adjustment, 
    isRecurring = false,
    onEdit,
    onRemove
  }: { 
    adjustment: OneOffAdjustment | RecurringAdjustment;
    isRecurring?: boolean;
    onEdit: () => void;
    onRemove: () => void;
  }) => {
    const isDeleting = deleteConfirmId === adjustment.id && deleteConfirmType === (isRecurring ? "recurring" : "oneoff");

    return (
      <div className="flex items-start justify-between py-2 px-3 rounded bg-muted/20 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{adjustment.label}</span>
            <Badge variant="outline" className={cn("text-[10px]", getTypeBadgeClass(adjustment.type))}>
              {getTypeLabel(adjustment.type)}
            </Badge>
          </div>
          
          {/* Notes for one-off */}
          {!isRecurring && (adjustment as OneOffAdjustment).notes && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {(adjustment as OneOffAdjustment).notes}
            </p>
          )}
          
          {/* Frequency for recurring */}
          {isRecurring && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {(adjustment as RecurringAdjustment).frequency === "every_pay_run" ? "Every pay run" : "Monthly"} from {(adjustment as RecurringAdjustment).startFrom}
              {!(adjustment as RecurringAdjustment).noEndDate && (adjustment as RecurringAdjustment).endAfter && ` until ${(adjustment as RecurringAdjustment).endAfter}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {getAmountDisplay(adjustment.type, adjustment.amount)}
          
          {isDeleting ? (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                onClick={onRemove}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmType(null); }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                onClick={() => { setDeleteConfirmId(adjustment.id); setDeleteConfirmType(isRecurring ? "recurring" : "oneoff"); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="flex-shrink-0 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(worker.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-lg font-semibold text-foreground">
                  {worker.name}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    worker.employmentType === "employee" 
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                  )}>
                    {worker.employmentType === "employee" ? "EOR Employee" : "Contractor (COR)"}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-muted/30">
                    {worker.country} • {worker.currency}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-muted/30">
                    {worker.payFrequency || "Monthly"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Context line */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Payroll cycle: {payrollPeriod} • Currency: {worker.currency}
            </span>
            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
              This cycle only
            </Badge>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* 1. Worker Profile (read-only) */}
          <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Worker Profile
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", profileOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="border-border/20 bg-card/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{worker.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employment Type</p>
                      <p className="font-medium capitalize">{worker.employmentType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="font-medium">{worker.country}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Currency</p>
                      <p className="font-medium">{worker.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compensation Type</p>
                      <p className="font-medium">{worker.compensationType || "Monthly"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employment Status</p>
                      <p className="font-medium">{worker.status || "Active"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-2" />

          {/* 2. Payroll Details – this cycle */}
          <Collapsible open={payrollDetailsOpen} onOpenChange={setPayrollDetailsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Payroll Details – this cycle
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", payrollDetailsOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              <Card className="border-border/20 bg-card/30">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input 
                        value={overrideEmploymentDates ? overrideStartDate : (worker.startDate ? format(new Date(worker.startDate), "MMM d, yyyy") : "—")}
                        disabled={!overrideEmploymentDates}
                        onChange={(e) => setOverrideStartDate(e.target.value)}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date / Last Working Day</Label>
                      <Input 
                        value={overrideEmploymentDates ? overrideEndDate : (worker.endDate ? format(new Date(worker.endDate), "MMM d, yyyy") : "—")}
                        disabled={!overrideEmploymentDates}
                        onChange={(e) => setOverrideEndDate(e.target.value)}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Employment Status</Label>
                    <Select 
                      value={overrideEmploymentDates ? overrideStatus : (worker.status || "Active")} 
                      onValueChange={setOverrideStatus}
                      disabled={!overrideEmploymentDates}
                    >
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                        <SelectItem value="Contract Ended">Contract Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div>
                      <Label className="text-xs font-medium">Override employment dates & status for this cycle</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Enable to modify employment details for this payroll cycle only</p>
                    </div>
                    <Switch 
                      checked={overrideEmploymentDates} 
                      onCheckedChange={setOverrideEmploymentDates}
                    />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-2" />

          {/* 3. Pay for this cycle – breakdown */}
          <Collapsible open={payBreakdownOpen} onOpenChange={setPayBreakdownOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Pay for this cycle – breakdown
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", payBreakdownOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              {/* Earnings */}
              <Card className="border-border/20 bg-card/30">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Earnings</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {mockEarnings.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20">
                      <div className="flex items-center gap-2">
                        {item.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        +{formatCurrency(item.amount, worker.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-xs font-medium">Total Earnings</span>
                    <span className="text-sm font-semibold">{formatCurrency(totalEarnings, worker.currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Adjustment Lines (this cycle only) */}
              <Card className="border-border/20 bg-card/30">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>Adjustment Lines</span>
                    {!showAddOneOff && !editingOneOffId && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs gap-1 text-primary hover:text-primary"
                        onClick={() => setShowAddOneOff(true)}
                      >
                        <Plus className="h-3 w-3" />
                        Add Adjustment
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {oneOffAdjustments.length > 0 ? (
                    <div className="space-y-1.5">
                      {oneOffAdjustments.map((adj) => (
                        <AdjustmentRow 
                          key={adj.id}
                          adjustment={adj}
                          isRecurring={false}
                          onEdit={() => handleEditOneOff(adj)}
                          onRemove={() => handleRemoveOneOff(adj.id)}
                        />
                      ))}
                    </div>
                  ) : !showAddOneOff && (
                    <p className="text-xs text-muted-foreground">No one-off adjustments for this cycle.</p>
                  )}

                  {(showAddOneOff || editingOneOffId) && (
                    <AdjustmentFormCard
                      isRecurring={false}
                      onCancel={resetOneOffForm}
                      onSave={handleAddOneOffAdjustment}
                    />
                  )}

                  {oneOffAdjustments.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs font-medium">Adjustments Total</span>
                      <span className={cn("text-sm font-semibold", oneOffTotal >= 0 ? "text-green-600" : "text-red-600")}>
                        {oneOffTotal >= 0 ? "+" : ""}{formatCurrency(oneOffTotal, worker.currency)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deductions (employees only) */}
              {worker.employmentType === "employee" && mockDeductions.length > 0 && (
                <Card className="border-border/20 bg-card/30">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Deductions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {mockDeductions.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20">
                        <div className="flex items-center gap-2">
                          {item.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          -{formatCurrency(item.amount, worker.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs font-medium">Total Deductions</span>
                      <span className="text-sm font-semibold text-red-600">-{formatCurrency(totalDeductions, worker.currency)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Employer Contributions (employees only) */}
              {worker.employmentType === "employee" && mockEmployerContributions.length > 0 && (
                <Card className="border-border/20 bg-card/30">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Employer / Government Contributions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {mockEmployerContributions.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20">
                        <div className="flex items-center gap-2">
                          {item.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatCurrency(item.amount, worker.currency)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Fronted Fees */}
              <Card className="border-border/20 bg-card/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Est. Fronted Fees</span>
                    <span className="text-sm font-medium text-amber-600">+{formatCurrency(worker.estFees, worker.currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Net Pay & Total */}
              <Card className="border-primary/20 bg-primary/[0.02]">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Net Pay</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(calculatedNetPay, worker.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">Total Payable</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(totalPayable, worker.currency)}</span>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-2" />

          {/* 4. Cycle-specific overrides (admin only) */}
          <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Cycle-specific overrides (admin only)
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", overridesOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3">
              {/* Currency & FX Details */}
              <Card className="border-border/20 bg-card/30">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Currency & FX Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Currency</p>
                      <p className="font-medium">{worker.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">FX Rate</p>
                      <p className="font-medium">{fxDetails.rate} {fxDetails.baseCurrency} → {worker.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <p className="font-medium">{fxDetails.eta}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Base Fee Override */}
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium text-amber-700 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Admin Override – {worker.employmentType === "contractor" ? "Base Consultancy Fee" : "Base Salary"} Override
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Enable override for this cycle</Label>
                    <Switch checked={overrideBaseFee} onCheckedChange={setOverrideBaseFee} />
                  </div>
                  {overrideBaseFee && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Override Amount ({worker.currency})</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-muted-foreground">{worker.currency}</span>
                        <Input 
                          type="number"
                          value={overrideBaseFeeAmount}
                          onChange={(e) => setOverrideBaseFeeAmount(e.target.value)}
                          placeholder={worker.baseSalary.toString()}
                          className="h-8 text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Override {worker.employmentType === "contractor" ? "base consultancy fee" : "base salary"} for this payroll cycle
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deductions Override (employees only) */}
              {worker.employmentType === "employee" && (
                <Card className="border-border/20 bg-card/30">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Deductions Override</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Override withholding tax for this cycle</Label>
                        <p className="text-xs text-muted-foreground">Calculated from company tax rules</p>
                      </div>
                      <Switch checked={overrideDeductions} onCheckedChange={setOverrideDeductions} />
                    </div>
                    {overrideDeductions && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Override Withholding Tax ({worker.currency})</Label>
                        <Input 
                          type="number"
                          value={overrideDeductionsAmount}
                          onChange={(e) => setOverrideDeductionsAmount(e.target.value)}
                          placeholder="0"
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recurring Adjustment Lines */}
              <Card className="border-border/20 bg-card/30">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Recurring Adjustment Lines
                    </span>
                    {!showAddRecurring && !editingRecurringId && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs gap-1 text-primary hover:text-primary"
                        onClick={() => setShowAddRecurring(true)}
                      >
                        <Plus className="h-3 w-3" />
                        Add Adjustment
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {recurringAdjustments.length > 0 ? (
                    <div className="space-y-1.5">
                      {recurringAdjustments.map((adj) => (
                        <AdjustmentRow 
                          key={adj.id}
                          adjustment={adj}
                          isRecurring={true}
                          onEdit={() => handleEditRecurring(adj)}
                          onRemove={() => handleRemoveRecurring(adj.id)}
                        />
                      ))}
                    </div>
                  ) : !showAddRecurring && (
                    <p className="text-xs text-muted-foreground">No recurring adjustments configured for this worker.</p>
                  )}

                  {(showAddRecurring || editingRecurringId) && (
                    <AdjustmentFormCard
                      isRecurring={true}
                      onCancel={resetRecurringForm}
                      onSave={handleAddRecurringAdjustment}
                    />
                  )}

                  {recurringAdjustments.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs font-medium">Recurring Total (this cycle)</span>
                      <span className={cn("text-sm font-semibold", recurringTotal >= 0 ? "text-green-600" : "text-red-600")}>
                        {recurringTotal >= 0 ? "+" : ""}{formatCurrency(recurringTotal, worker.currency)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-2" />

          {/* 5. Leave & adjustments for this cycle (read-only) */}
          <Collapsible open={leaveAdjustmentsOpen} onOpenChange={setLeaveAdjustmentsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Leave & adjustments for this cycle
                  <Badge variant="outline" className="text-[10px] ml-1">Read-only</Badge>
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", leaveAdjustmentsOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="border-border/20 bg-card/30">
                <CardContent className="p-3 space-y-2">
                  {mockLeaveAdjustments.length > 0 ? (
                    mockLeaveAdjustments.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            item.type === "leave" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-green-500/10 text-green-600 border-green-500/30"
                          )}>
                            {item.type === "leave" ? "Leave" : "Adjustment"}
                          </Badge>
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            item.amount < 0 ? "text-red-600" : "text-green-600"
                          )}>
                            {item.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(item.amount), item.currency)}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">No leave or adjustments for this cycle</p>
                  )}
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                    These approvals have already been processed. This summary shows what's baked into the calculation.
                  </p>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-2" />

          {/* 6. Preview (read-only) */}
          <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  Preview – {worker.employmentType === "contractor" ? "Invoice" : "Payslip"} Summary
                  <Badge variant="outline" className="text-[10px] ml-1">Read-only</Badge>
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", previewOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="border-border/20 bg-gradient-to-br from-card/50 to-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/30">
                    <div>
                      <p className="text-xs text-muted-foreground">{worker.employmentType === "contractor" ? "Invoice" : "Payslip"} Period</p>
                      <p className="text-sm font-medium">{payrollPeriod}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross {worker.employmentType === "contractor" ? "Fee" : "Salary"}</span>
                      <span>{formatCurrency(totalEarnings, worker.currency)}</span>
                    </div>
                    {worker.employmentType === "employee" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deductions</span>
                        <span className="text-red-600">-{formatCurrency(totalDeductions, worker.currency)}</span>
                      </div>
                    )}
                    {adjustmentsTotal !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Approved Adjustments</span>
                        <span className={adjustmentsTotal < 0 ? "text-red-600" : "text-green-600"}>
                          {adjustmentsTotal < 0 ? "-" : "+"}{formatCurrency(Math.abs(adjustmentsTotal), worker.currency)}
                        </span>
                      </div>
                    )}
                    {oneOffTotal !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">One-off Adjustments</span>
                        <span className={oneOffTotal < 0 ? "text-red-600" : "text-green-600"}>
                          {oneOffTotal < 0 ? "-" : "+"}{formatCurrency(Math.abs(oneOffTotal), worker.currency)}
                        </span>
                      </div>
                    )}
                    {recurringTotal !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recurring Adjustments</span>
                        <span className={recurringTotal < 0 ? "text-red-600" : "text-green-600"}>
                          {recurringTotal < 0 ? "-" : "+"}{formatCurrency(Math.abs(recurringTotal), worker.currency)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Net Pay</span>
                      <span>{formatCurrency(calculatedNetPay, worker.currency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-shrink-0 pt-4 border-t border-border mt-4">
          <div className="flex items-center justify-between w-full gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-primary hover:opacity-90 gap-2">
              <Calculator className="h-4 w-4" />
              Save & Recalculate
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
