import React, { useMemo, useState } from "react";
import { ArrowLeft, CalendarOff, Clock, Receipt, X, Upload, FileText, Image, Gift, Coins, Plus, Minus, MoreHorizontal, AlertTriangle, Info } from "lucide-react";
import { validateFiles, FILE_UPLOAD_ACCEPT, FILE_UPLOAD_MAX_COUNT, FILE_UPLOAD_HELPER_RECEIPT } from "../shared/fileUploadValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { F41v7_TimeInput } from "@/components/flows/employee-dashboard-v7/F41v7_TimeInput";
import { TagInput } from "@/components/flows/shared/TagInput";

// Types for admin-added adjustments
export type AdminAdjustmentType = "unpaid_leave" | "overtime" | "expense" | "bonus" | "commission" | "other";
export type TaxTiming = "before_tax" | "after_tax";
export type TaxabilityMode = "taxable" | "non_taxable" | "partially_taxable";
export type AdjustmentDirection = "add" | "deduct";

export interface AdminAddedAdjustment {
  id: string;
  type: AdminAdjustmentType;
  amount?: number;
  days?: number;
  hours?: number;
  description?: string;
  currency: string;
  addedAt: string;
  direction: AdjustmentDirection;
  taxTiming?: TaxTiming;
  isTaxable?: boolean;
  taxabilityMode?: TaxabilityMode;
  exemptAmount?: number;
}

interface F1v6_AdminAddAdjustmentProps {
  workerType: "employee" | "contractor";
  workerName: string;
  currency: string;
  dailyRate?: number;
  hourlyRate?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAdjustment: (adjustment: AdminAddedAdjustment) => void;
}

const expenseCategories = ["Travel", "Meals", "Equipment", "Software", "Other"];

interface ExpenseLineItem {
  id: string;
  category: string;
  otherCategory: string;
  amount: string;
  receipt: File[];
}

interface BonusLineItem {
  id: string;
  amount: string;
  attachment: File[];
}

interface CommissionLineItem {
  id: string;
  amount: string;
  attachment: File[];
}

type RequestType = AdminAdjustmentType | null;

type RequestOption = {
  id: AdminAdjustmentType;
  label: string;
  description: string;
  icon: React.ElementType;
};

/* ─── Direction Picker ─── */
const DirectionPicker = ({
  direction,
  onChange,
}: {
  direction: AdjustmentDirection;
  onChange: (d: AdjustmentDirection) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs">Adjustment direction</Label>
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange("add")}
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-xs font-medium",
          direction === "add"
            ? "border-primary bg-primary/5 text-primary"
            : "border-border/60 text-muted-foreground hover:border-primary/30"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Add to payout
      </button>
      <button
        type="button"
        onClick={() => onChange("deduct")}
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-xs font-medium",
          direction === "deduct"
            ? "border-destructive bg-destructive/5 text-destructive"
            : "border-border/60 text-muted-foreground hover:border-destructive/30"
        )}
      >
        <Minus className="h-3.5 w-3.5" />
        Deduct from payout
      </button>
    </div>
  </div>
);

export const F1v6_AdminAddAdjustment: React.FC<F1v6_AdminAddAdjustmentProps> = ({
  workerType,
  workerName,
  currency,
  dailyRate = 0,
  hourlyRate = 0,
  isOpen,
  onOpenChange,
  onAddAdjustment,
}) => {
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  const [direction, setDirection] = useState<AdjustmentDirection>("add");

  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState("");
  const [unpaidLeaveDescription, setUnpaidLeaveDescription] = useState("");
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: "", otherCategory: "", amount: "", receipt: [] },
  ]);
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  
  const [overtimeDate, setOvertimeDate] = useState<Date | undefined>(undefined);
  const [overtimeStartTime, setOvertimeStartTime] = useState("");
  const [overtimeEndTime, setOvertimeEndTime] = useState("");
  const [openDatePopover, setOpenDatePopover] = useState(false);

  const [bonusItems, setBonusItems] = useState<BonusLineItem[]>([
    { id: crypto.randomUUID(), amount: "", attachment: [] },
  ]);
  const [commissionItems, setCommissionItems] = useState<CommissionLineItem[]>([
    { id: crypto.randomUUID(), amount: "", attachment: [] },
  ]);

  // Other adjustment state
  const [otherDescription, setOtherDescription] = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [otherTaxTiming, setOtherTaxTiming] = useState<TaxTiming>("before_tax");
  const [otherIsTaxable, setOtherIsTaxable] = useState(true);
  const [otherTaxabilityMode, setOtherTaxabilityMode] = useState<TaxabilityMode>("taxable");
  const [otherExemptAmount, setOtherExemptAmount] = useState("");
  const [otherAttachment, setOtherAttachment] = useState<File[]>([]);

  const requestTypeOptions: RequestOption[] = useMemo(() => {
    const base: RequestOption[] = [
      {
        id: "expense",
        label: "Expense Reimbursement",
        description: "Submit a reimbursement",
        icon: Receipt,
      },
      {
        id: "overtime",
        label: workerType === "contractor" ? "Additional Hours" : "Overtime",
        description: workerType === "contractor" ? "Log extra time" : "Log extra hours",
        icon: Clock,
      },
    ];

    if (workerType === "employee") {
      base.push({
        id: "bonus",
        label: "Bonus",
        description: "Add a bonus payment",
        icon: Gift,
      });
      base.push({
        id: "unpaid_leave",
        label: "Leave Adjustment",
        description: "Adjust pay for leave days",
        icon: CalendarOff,
      });
    }

    if (workerType === "contractor") {
      base.push({
        id: "commission",
        label: "Commission",
        description: "Add a commission payment",
        icon: Coins,
      });
    }

    // "Other" is always available for both worker types — placed last
    base.push({
      id: "other",
      label: "Other",
      description: "Custom earning or deduction",
      icon: MoreHorizontal,
    });

    return base;
  }, [workerType]);

  const handleSelectType = (type: AdminAdjustmentType) => {
    setSelectedType(type);
    if (type === "unpaid_leave") {
      setDirection("deduct");
    } else {
      setDirection("add");
    }
  };

  const formatMoney = (amt: number) =>
    `${currency} ${Math.abs(amt).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    return Math.round((endMinutes - startMinutes) / 60 * 100) / 100;
  };

  const calculatedOvertimeHours = calculateHours(overtimeStartTime, overtimeEndTime);

  const resetForm = () => {
    setSelectedType(null);
    setDirection("add");
    setUnpaidLeaveDays("");
    setUnpaidLeaveDescription("");
    setExpenseItems([{ id: crypto.randomUUID(), category: "", otherCategory: "", amount: "", receipt: [] }]);
    setExpenseTags([]);
    setOvertimeDate(undefined);
    setOvertimeStartTime("");
    setOvertimeEndTime("");
    setBonusItems([{ id: crypto.randomUUID(), amount: "", attachment: [] }]);
    setCommissionItems([{ id: crypto.randomUUID(), amount: "", attachment: [] }]);
    setOtherDescription("");
    setOtherAmount("");
    setOtherTaxTiming("before_tax");
    setOtherIsTaxable(true);
    setOtherTaxabilityMode("taxable");
    setOtherExemptAmount("");
    setOtherAttachment([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      handleClose();
    }
  };

  const addExpenseItem = () => {
    setExpenseItems((prev) => [...prev, { id: crypto.randomUUID(), category: "", otherCategory: "", amount: "", receipt: [] }]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) return;
    setExpenseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseLineItem, value: string | File[]) => {
    setExpenseItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [field]: value } as ExpenseLineItem;
        if (field === "category" && value !== "Other") {
          next.otherCategory = "";
        }
        return next;
      }),
    );
  };

  const expenseSessionTotal = expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const submitExpense = () => {
    const validItems = expenseItems
      .map((item) => {
        const amt = parseFloat(item.amount);
        const categoryLabel = item.category === "Other" ? item.otherCategory.trim() : item.category;
        return { ...item, amountValue: amt, categoryLabel };
      })
      .filter((item) => {
        if (!item.category) return false;
        if (item.category === "Other" && !item.otherCategory.trim()) return false;
        return !Number.isNaN(item.amountValue) && item.amountValue > 0;
      });

    if (validItems.length === 0) {
      toast.error("Please enter valid expense details");
      return;
    }

    validItems.forEach((item) => {
      onAddAdjustment({
        id: `admin-${Date.now()}-${item.id}`,
        type: "expense",
        amount: item.amountValue,
        description: `${item.categoryLabel} expense`,
        currency,
        addedAt: new Date().toISOString(),
        direction,
      });
    });

    toast.success(`Added ${validItems.length} expense${validItems.length > 1 ? "s" : ""} for ${workerName}`);
    handleClose();
  };

  const submitOvertime = () => {
    if (!overtimeDate) {
      toast.error("Please select a date");
      return;
    }
    if (!overtimeStartTime || !overtimeEndTime) {
      toast.error("Please enter start and end times");
      return;
    }
    if (calculatedOvertimeHours <= 0) {
      toast.error("End time must be after start time");
      return;
    }

    const dateStr = format(overtimeDate, 'MMM d');
    const timeStr = `${overtimeStartTime}–${overtimeEndTime}`;
    const label = `${calculatedOvertimeHours}h · ${dateStr} · ${timeStr}`;

    onAddAdjustment({
      id: `admin-${Date.now()}`,
      type: "overtime",
      hours: calculatedOvertimeHours,
      amount: calculatedOvertimeHours * hourlyRate,
      description: workerType === "contractor" ? `${label} additional hours` : `${label} overtime`,
      currency,
      addedAt: new Date().toISOString(),
      direction,
    });

    toast.success(`Added ${workerType === "contractor" ? "additional hours" : "overtime"} for ${workerName}`);
    handleClose();
  };

  const submitUnpaidLeave = () => {
    const daysValue = parseFloat(unpaidLeaveDays);
    if (Number.isNaN(daysValue) || daysValue <= 0) {
      toast.error("Please enter valid days");
      return;
    }

    const descPart = unpaidLeaveDescription.trim() ? ` · ${unpaidLeaveDescription.trim()}` : '';

    onAddAdjustment({
      id: `admin-${Date.now()}`,
      type: "unpaid_leave",
      days: daysValue,
      amount: daysValue * dailyRate,
      description: `${daysValue} day${daysValue !== 1 ? "s" : ""} leave adjustment${descPart}`,
      currency,
      addedAt: new Date().toISOString(),
      direction,
    });

    toast.success(`Added leave adjustment for ${workerName}`);
    handleClose();
  };

  const updateBonusItem = (id: string, field: keyof BonusLineItem, value: string | File[]) => {
    setBonusItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const submitBonus = () => {
    const validItems = bonusItems.filter((item) => {
      const amt = parseFloat(item.amount);
      return !Number.isNaN(amt) && amt > 0;
    });
    if (validItems.length === 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const totalAmount = validItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    onAddAdjustment({
      id: `admin-${Date.now()}`,
      type: "bonus",
      amount: totalAmount,
      description: `Bonus · ${formatMoney(totalAmount)}`,
      currency,
      addedAt: new Date().toISOString(),
      direction,
    });
    toast.success(`Added bonus for ${workerName}`);
    handleClose();
  };

  const updateCommissionItem = (id: string, field: keyof CommissionLineItem, value: string | File[]) => {
    setCommissionItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const submitCommission = () => {
    const validItems = commissionItems.filter((item) => {
      const amt = parseFloat(item.amount);
      return !Number.isNaN(amt) && amt > 0;
    });
    if (validItems.length === 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const totalAmount = validItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    onAddAdjustment({
      id: `admin-${Date.now()}`,
      type: "commission",
      amount: totalAmount,
      description: `Commission · ${formatMoney(totalAmount)}`,
      currency,
      addedAt: new Date().toISOString(),
      direction,
    });
    toast.success(`Added commission for ${workerName}`);
    handleClose();
  };

  const submitOther = () => {
    const desc = otherDescription.trim();
    if (!desc) {
      toast.error("Please enter a description");
      return;
    }
    if (desc.length < 3) {
      toast.error("Description must be at least 3 characters");
      return;
    }
    const amt = parseFloat(otherAmount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt > 1_000_000) {
      toast.error("Amount exceeds maximum limit (₱1,000,000)");
      return;
    }

    // PH rule: after-tax items cannot be taxable or partially taxable
    if (otherTaxTiming === "after_tax" && otherTaxabilityMode !== "non_taxable") {
      toast.error("After-tax adjustments must be non-taxable. Change taxability or switch to 'Before tax'.");
      return;
    }

    // Partially taxable: validate exempt amount
    let exemptAmt: number | undefined;
    if (otherTaxabilityMode === "partially_taxable") {
      exemptAmt = parseFloat(otherExemptAmount);
      if (Number.isNaN(exemptAmt) || exemptAmt <= 0) {
        toast.error("Please enter a valid tax-exempt threshold");
        return;
      }
      if (exemptAmt >= amt) {
        toast.error("Exempt threshold must be less than total amount. Use 'Non-taxable' instead.");
        return;
      }
    }

    const taxLabel = otherTaxabilityMode === "taxable" 
      ? "Taxable" 
      : otherTaxabilityMode === "non_taxable" 
        ? "Non-taxable" 
        : `Partially taxable (₱${exemptAmt!.toLocaleString()} exempt)`;
    const timingLabel = otherTaxTiming === "before_tax" ? "Before tax" : "After tax";

    onAddAdjustment({
      id: `admin-${Date.now()}`,
      type: "other",
      amount: amt,
      description: `${desc} · ${timingLabel} · ${taxLabel}`,
      currency,
      addedAt: new Date().toISOString(),
      direction,
      taxTiming: otherTaxTiming,
      isTaxable: otherTaxabilityMode !== "non_taxable",
      taxabilityMode: otherTaxabilityMode,
      exemptAmount: exemptAmt,
    });

    toast.success(`Added adjustment for ${workerName}`);
    handleClose();
  };

  if (!isOpen) return null;

  const headerTitle =
    selectedType === null
      ? `Add on behalf of ${workerName}`
      : selectedType === "expense"
        ? "Expense reimbursement"
        : selectedType === "overtime"
          ? workerType === "contractor"
            ? "Additional hours"
            : "Overtime"
          : selectedType === "bonus"
            ? "Bonus"
            : selectedType === "commission"
              ? "Commission"
              : selectedType === "other"
                ? "Other adjustment"
                : "Leave adjustment";

  const directionSign = direction === "add" ? "+" : "−";

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{headerTitle}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Type Selection */}
        {selectedType === null && (
          <div className="grid grid-cols-1 gap-3">
            {requestTypeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectType(option.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]",
                )}
              >
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <option.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Expense Form */}
        {selectedType === "expense" && (
          <div className="space-y-5">
            <DirectionPicker direction={direction} onChange={setDirection} />

            <div className="space-y-3">
              {expenseItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                >
                  {expenseItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpenseItem(item.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}

                  {expenseItems.length > 1 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Expense {index + 1}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category</Label>
                      <Select value={item.category} onValueChange={(val) => updateExpenseItem(item.id, "category", val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {expenseCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Amount ({currency})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => updateExpenseItem(item.id, "amount", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {item.category === "Other" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Specify category</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Office supplies"
                        value={item.otherCategory}
                        onChange={(e) => updateExpenseItem(item.id, "otherCategory", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  )}

                  {/* Attachments */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Attachments</Label>
                    {item.receipt.length > 0 && (
                      <div className="space-y-1.5">
                        {item.receipt.map((file, fileIdx) => (
                          <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                            {file.type.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <span className="text-xs flex-1 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = item.receipt.filter((_, i) => i !== fileIdx);
                                updateExpenseItem(item.id, "receipt", updated);
                              }}
                              className="p-0.5 hover:bg-muted rounded shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.receipt.length < FILE_UPLOAD_MAX_COUNT && (
                      <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.receipt.length === 0 ? 'Upload documents' : 'Add more'}
                        </span>
                        <input
                          type="file"
                          accept={FILE_UPLOAD_ACCEPT}
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const { valid, error } = validateFiles(files, item.receipt.length);
                              if (error) {
                                toast.error(error);
                              } else if (valid.length > 0) {
                                updateExpenseItem(item.id, "receipt", [...item.receipt, ...valid]);
                              }
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                    <p className="text-[11px] text-muted-foreground/70">{FILE_UPLOAD_HELPER_RECEIPT}</p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExpenseItem}
                className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                Add another expense
              </button>
            </div>

            {/* Tags */}
            <TagInput tags={expenseTags} onChange={setExpenseTags} maxTags={1} />

            {expenseItems.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session total</span>
                  <span className="text-sm font-semibold tabular-nums">{directionSign}{formatMoney(expenseSessionTotal)}</span>
                </div>
              </div>
            )}

            <Button onClick={submitExpense} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Overtime / Additional hours */}
        {selectedType === "overtime" && (
          <div className="space-y-5">
            <DirectionPicker direction={direction} onChange={setDirection} />

            <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-9 justify-start text-left font-normal",
                        !overtimeDate && "text-muted-foreground"
                      )}
                    >
                      {overtimeDate ? format(overtimeDate, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[200]" align="start">
                    <Calendar
                      mode="single"
                      selected={overtimeDate}
                      onSelect={(date) => {
                        setOvertimeDate(date);
                        setOpenDatePopover(false);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start time</Label>
                    <F41v7_TimeInput
                      value={overtimeStartTime}
                      onChange={setOvertimeStartTime}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">End time</Label>
                    <F41v7_TimeInput
                      value={overtimeEndTime}
                      onChange={setOvertimeEndTime}
                    />
                  </div>
                </div>
              </div>

              {calculatedOvertimeHours > 0 && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Calculated hours</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {calculatedOvertimeHours}h
                  </span>
                </div>
              )}
            </div>

            {calculatedOvertimeHours > 0 && hourlyRate > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session total</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {calculatedOvertimeHours}h · {directionSign}{formatMoney(calculatedOvertimeHours * hourlyRate)}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={submitOvertime} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Leave Adjustment */}
        {selectedType === "unpaid_leave" && (
          <div className="space-y-5">
            <DirectionPicker direction={direction} onChange={setDirection} />

            <div className="space-y-1.5">
              <Label className="text-xs">Days</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="e.g., 2 or 0.5"
                value={unpaidLeaveDays}
                onChange={(e) => setUnpaidLeaveDays(e.target.value)}
                className="h-9"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Date details</Label>
              <Input
                type="text"
                placeholder="e.g. 22 Feb – 27 Feb 2025"
                value={unpaidLeaveDescription}
                onChange={(e) => setUnpaidLeaveDescription(e.target.value)}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Help specify dates, e.g. <span className="font-medium text-foreground/70">"22–27 Feb"</span> or <span className="font-medium text-foreground/70">"Mon 24 – Fri 28 Feb"</span>.
              </p>
            </div>

            {parseFloat(unpaidLeaveDays) > 0 && dailyRate > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session total</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {directionSign}{formatMoney(parseFloat(unpaidLeaveDays) * dailyRate)}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={submitUnpaidLeave} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Bonus form (employee only) */}
        {selectedType === "bonus" && (
          <div className="space-y-5">
            <DirectionPicker direction={direction} onChange={setDirection} />

            <div className="space-y-3">
              {bonusItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs">Amount ({currency})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updateBonusItem(item.id, "amount", e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Attachment (optional)</Label>
                    {item.attachment.length > 0 && (
                      <div className="space-y-1.5">
                        {item.attachment.map((file, fileIdx) => (
                          <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                            {file.type.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <span className="text-xs flex-1 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = item.attachment.filter((_, i) => i !== fileIdx);
                                updateBonusItem(item.id, "attachment", updated);
                              }}
                              className="p-0.5 hover:bg-muted rounded shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.attachment.length < FILE_UPLOAD_MAX_COUNT && (
                      <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.attachment.length === 0 ? 'Upload documents' : 'Add more'}
                        </span>
                        <input
                          type="file"
                          accept={FILE_UPLOAD_ACCEPT}
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const { valid, error } = validateFiles(files, item.attachment.length);
                              if (error) {
                                toast.error(error);
                              } else if (valid.length > 0) {
                                updateBonusItem(item.id, "attachment", [...item.attachment, ...valid]);
                              }
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={submitBonus} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Commission form (contractor only) */}
        {selectedType === "commission" && (
          <div className="space-y-5">
            <DirectionPicker direction={direction} onChange={setDirection} />

            <div className="space-y-3">
              {commissionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs">Amount ({currency})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updateCommissionItem(item.id, "amount", e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Attachment (optional)</Label>
                    {item.attachment.length > 0 && (
                      <div className="space-y-1.5">
                        {item.attachment.map((file, fileIdx) => (
                          <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                            {file.type.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <span className="text-xs flex-1 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = item.attachment.filter((_, i) => i !== fileIdx);
                                updateCommissionItem(item.id, "attachment", updated);
                              }}
                              className="p-0.5 hover:bg-muted rounded shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.attachment.length < FILE_UPLOAD_MAX_COUNT && (
                      <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.attachment.length === 0 ? 'Upload documents' : 'Add more'}
                        </span>
                        <input
                          type="file"
                          accept={FILE_UPLOAD_ACCEPT}
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const { valid, error } = validateFiles(files, item.attachment.length);
                              if (error) {
                                toast.error(error);
                              } else if (valid.length > 0) {
                                updateCommissionItem(item.id, "attachment", [...item.attachment, ...valid]);
                              }
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={submitCommission} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Other adjustment form */}
        {selectedType === "other" && (
          <div className="space-y-5">
            <DirectionPicker direction={direction} onChange={setDirection} />

            {/* Before/After Tax */}
            <div className="space-y-1.5">
              <Label className="text-xs">Apply before or after tax?</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtherTaxTiming("before_tax");
                  }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left text-xs font-medium",
                    otherTaxTiming === "before_tax"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  Before tax
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtherTaxTiming("after_tax");
                    // After-tax items cannot be taxable — auto-correct
                    setOtherIsTaxable(false);
                    setOtherTaxabilityMode("non_taxable");
                    setOtherExemptAmount("");
                  }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left text-xs font-medium",
                    otherTaxTiming === "after_tax"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  After tax
                </button>
              </div>
            </div>

            {/* Taxability — 3-way selector for PH compliance */}
            <div className={cn(
              "space-y-3 p-3 rounded-lg border transition-all",
              otherTaxTiming === "after_tax"
                ? "border-border/30 bg-muted/20 opacity-50 pointer-events-none"
                : "border-border/60 bg-card/50"
            )}>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Tax treatment</Label>
                {otherTaxTiming === "after_tax" && (
                  <p className="text-[11px] text-muted-foreground">After-tax items are always non-taxable</p>
                )}
              </div>

              {otherTaxTiming !== "after_tax" && (
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: "taxable" as TaxabilityMode, label: "Taxable", desc: "Subject to BIR withholding" },
                    { id: "non_taxable" as TaxabilityMode, label: "Non-taxable", desc: "Fully exempt" },
                    { id: "partially_taxable" as TaxabilityMode, label: "Partial", desc: "Has exempt threshold" },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setOtherTaxabilityMode(opt.id);
                        setOtherIsTaxable(opt.id !== "non_taxable");
                        if (opt.id !== "partially_taxable") setOtherExemptAmount("");
                      }}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all text-center",
                        otherTaxabilityMode === opt.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/30"
                      )}
                    >
                      <p className={cn(
                        "text-xs font-medium",
                        otherTaxabilityMode === opt.id ? "text-primary" : "text-muted-foreground"
                      )}>{opt.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Partially taxable: exempt threshold input */}
              {otherTaxTiming !== "after_tax" && otherTaxabilityMode === "partially_taxable" && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs">Tax-exempt threshold ({currency})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 8000 (clothing allowance limit)"
                    value={otherExemptAmount}
                    onChange={(e) => setOtherExemptAmount(e.target.value)}
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Amount up to this threshold is tax-free. Only the excess is subject to withholding tax per BIR rules.
                  </p>
                </div>
              )}
            </div>

            {/* PH context hints based on taxability */}
            {otherTaxTiming === "before_tax" && otherTaxabilityMode === "non_taxable" && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Fully non-taxable benefits must fall within BIR de minimis limits (RR 29-2025). E.g. clothing allowance ≤ ₱8,000/yr, rice subsidy ≤ ₱2,500/mo, medical ≤ ₱12,000/yr. Exceeding thresholds triggers withholding tax on the excess.
                </p>
              </div>
            )}

            {otherTaxTiming === "before_tax" && otherTaxabilityMode === "partially_taxable" && (
              <div className="flex gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Per BIR RR 29-2025, only the portion exceeding the de minimis threshold is taxable. Common thresholds: Clothing ₱8,000/yr · Rice ₱2,500/mo · Medical ₱12,000/yr · Achievement awards ₱12,000/yr · Christmas gifts ₱6,000/yr.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="e.g. Clothing allowance, Loan repayment, Salary advance recovery..."
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
                className="min-h-[72px] text-sm resize-none"
                maxLength={200}
              />
              <p className="text-[11px] text-muted-foreground text-right">{otherDescription.length}/200</p>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs">Amount ({currency})</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={otherAmount}
                onChange={(e) => setOtherAmount(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Attachment (optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs">Attachment (optional)</Label>
              {otherAttachment.length > 0 && (
                <div className="space-y-1.5">
                  {otherAttachment.map((file, fileIdx) => (
                    <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <span className="text-xs flex-1 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setOtherAttachment(prev => prev.filter((_, i) => i !== fileIdx))}
                        className="p-0.5 hover:bg-muted rounded shrink-0"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {otherAttachment.length < FILE_UPLOAD_MAX_COUNT && (
                <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {otherAttachment.length === 0 ? 'Upload documents' : 'Add more'}
                  </span>
                  <input
                    type="file"
                    accept={FILE_UPLOAD_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        const { valid, error } = validateFiles(files, otherAttachment.length);
                        if (error) {
                          toast.error(error);
                        } else if (valid.length > 0) {
                          setOtherAttachment(prev => [...prev, ...valid]);
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <p className="text-[11px] text-muted-foreground/70">{FILE_UPLOAD_HELPER_RECEIPT}</p>
            </div>

            {/* Summary */}
            {parseFloat(otherAmount) > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {directionSign}{formatMoney(parseFloat(otherAmount))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tax treatment</span>
                  <span className="text-xs text-muted-foreground">
                    {otherTaxTiming === "before_tax" ? "Before tax" : "After tax"} · {
                      otherTaxabilityMode === "taxable" ? "Taxable" 
                      : otherTaxabilityMode === "non_taxable" ? "Non-taxable" 
                      : "Partially taxable"
                    }
                  </span>
                </div>
                {otherTaxabilityMode === "partially_taxable" && parseFloat(otherExemptAmount) > 0 && (
                  <>
                    <div className="border-t border-border/30 pt-1.5 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Tax-exempt portion</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                          {formatMoney(Math.min(parseFloat(otherExemptAmount), parseFloat(otherAmount)))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Taxable excess</span>
                        <span className="text-[11px] text-foreground font-medium tabular-nums">
                          {formatMoney(Math.max(0, parseFloat(otherAmount) - parseFloat(otherExemptAmount)))}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Large amount warning */}
            {parseFloat(otherAmount) > 100_000 && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  This is a large adjustment (over ₱100,000). Please double-check the amount and ensure proper documentation.
                </p>
              </div>
            )}

            <Button onClick={submitOther} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default F1v6_AdminAddAdjustment;
