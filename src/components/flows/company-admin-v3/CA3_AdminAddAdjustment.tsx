import React, { useMemo, useState } from "react";
import { ArrowLeft, CalendarOff, Clock, Receipt, X, Upload, FileText, Image, Gift, Coins } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { F41v7_TimeInput } from "@/components/flows/employee-dashboard-v7/F41v7_TimeInput";
import { TagInput } from "@/components/flows/shared/TagInput";

// Types for admin-added adjustments
export type AdminAdjustmentType = "unpaid_leave" | "overtime" | "expense" | "bonus" | "commission";

export interface AdminAddedAdjustment {
  id: string;
  type: AdminAdjustmentType;
  amount?: number;
  days?: number;
  hours?: number;
  description?: string;
  currency: string;
  addedAt: string;
}

interface CA3_AdminAddAdjustmentProps {
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

// Line item types for multi-entry support
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

export const CA3_AdminAddAdjustment: React.FC<CA3_AdminAddAdjustmentProps> = ({
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

  // Forms
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState("");
  const [unpaidLeaveDescription, setUnpaidLeaveDescription] = useState("");
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: "", otherCategory: "", amount: "", receipt: [] },
  ]);
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  
  // Overtime - single entry with date + start/end time (matching worker v7)
  const [overtimeDate, setOvertimeDate] = useState<Date | undefined>(undefined);
  const [overtimeStartTime, setOvertimeStartTime] = useState("");
  const [overtimeEndTime, setOvertimeEndTime] = useState("");
  const [openDatePopover, setOpenDatePopover] = useState(false);

  // Bonus (employee) / Commission (contractor)
  const [bonusItems, setBonusItems] = useState<BonusLineItem[]>([
    { id: crypto.randomUUID(), amount: "", attachment: [] },
  ]);
  const [commissionItems, setCommissionItems] = useState<CommissionLineItem[]>([
    { id: crypto.randomUUID(), amount: "", attachment: [] },
  ]);

  const requestTypeOptions: RequestOption[] = useMemo(() => {
    const base: RequestOption[] = [
      {
        id: "expense",
        label: "Expense Reimbursements",
        description: "Submit a reimbursement",
        icon: Receipt,
      },
      {
        id: "overtime",
        label: workerType === "contractor" ? "Additional hours" : "Overtime",
        description: workerType === "contractor" ? "Log extra time" : "Log extra hours",
        icon: Clock,
      },
    ];

    if (workerType === "employee") {
      base.push({
        id: "bonus",
        label: "Bonus",
        description: "Request a bonus payment",
        icon: Gift,
      });
      base.push({
        id: "unpaid_leave",
        label: "Unpaid Leave",
        description: "Deduct pay for days not worked",
        icon: CalendarOff,
      });
    }

    if (workerType === "contractor") {
      base.push({
        id: "commission",
        label: "Commission",
        description: "Request additional pay",
        icon: Coins,
      });
    }

    return base;
  }, [workerType]);

  const formatMoney = (amt: number) =>
    `${currency} ${Math.abs(amt).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Calculate hours from start/end time
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
    setUnpaidLeaveDays("");
    setUnpaidLeaveDescription("");
    setExpenseItems([{ id: crypto.randomUUID(), category: "", otherCategory: "", amount: "", receipt: [] }]);
    setExpenseTags([]);
    setOvertimeDate(undefined);
    setOvertimeStartTime("");
    setOvertimeEndTime("");
    setBonusItems([{ id: crypto.randomUUID(), amount: "", attachment: [] }]);
    setCommissionItems([{ id: crypto.randomUUID(), amount: "", attachment: [] }]);
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

  // Expense helpers
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

  // Totals
  const expenseSessionTotal = expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const submitExpense = () => {
    const validItems = expenseItems
      .map((item) => {
        const amt = parseFloat(item.amount);
        const categoryLabel = item.category === "Other" ? item.otherCategory.trim() : item.category;
        return {
          ...item,
          amountValue: amt,
          categoryLabel,
        };
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
      description: `${daysValue} day${daysValue !== 1 ? "s" : ""} unpaid leave${descPart}`,
      currency,
      addedAt: new Date().toISOString(),
    });

    toast.success(`Added unpaid leave for ${workerName}`);
    handleClose();
  };

  // Bonus helpers (employee)
  const updateBonusItem = (id: string, field: keyof BonusLineItem, value: string | File[]) => {
    setBonusItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const submitBonus = () => {
    const validItems = bonusItems.filter((item) => {
      const amt = parseFloat(item.amount);
      return !Number.isNaN(amt) && amt > 0;
    });
    if (validItems.length === 0) {
      toast.error("Please enter a valid bonus amount");
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
    });
    toast.success(`Added bonus for ${workerName}`);
    handleClose();
  };

  // Commission helpers (contractor)
  const updateCommissionItem = (id: string, field: keyof CommissionLineItem, value: string | File[]) => {
    setCommissionItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const submitCommission = () => {
    const validItems = commissionItems.filter((item) => {
      const amt = parseFloat(item.amount);
      return !Number.isNaN(amt) && amt > 0;
    });
    if (validItems.length === 0) {
      toast.error("Please enter a valid commission amount");
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
    });
    toast.success(`Added commission for ${workerName}`);
    handleClose();
  };

  if (!isOpen) return null;

  const headerTitle =
    selectedType === null
      ? `Add on behalf of ${workerName}`
      : selectedType === "expense"
        ? "Expense request"
        : selectedType === "overtime"
          ? workerType === "contractor"
            ? "Additional hours"
            : "Overtime request"
          : selectedType === "bonus"
            ? "Bonus request"
            : selectedType === "commission"
              ? "Commission request"
              : "Unpaid leave";

  return (
    <div className="flex flex-col h-full">
      {/* Minimal header */}
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
                onClick={() => setSelectedType(option.id)}
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
                        <SelectContent>
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
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(expenseSessionTotal)}</span>
                </div>
              </div>
            )}

            <Button onClick={submitExpense} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Overtime / Additional hours — single entry with date + start/end time */}
        {selectedType === "overtime" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3">
              {/* Date picker */}
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={overtimeDate}
                      onSelect={(date) => {
                        setOvertimeDate(date);
                        setOpenDatePopover(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Start & End Time */}
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

              {/* Auto-calculated hours */}
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
                    {calculatedOvertimeHours}h · +{formatMoney(calculatedOvertimeHours * hourlyRate)}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={submitOvertime} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Unpaid leave (single-entry with date details) */}
        {selectedType === "unpaid_leave" && (
          <div className="space-y-5">
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
                    −{formatMoney(parseFloat(unpaidLeaveDays) * dailyRate)}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={submitUnpaidLeave} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Bonus form (employee only) — matches v7 employee bonus */}
        {selectedType === "bonus" && (
          <div className="space-y-5">
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

                  {/* Attachment upload - optional, multi */}
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
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {item.attachment.length === 0 ? 'Upload documents' : 'Add more'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            updateBonusItem(item.id, "attachment", [...item.attachment, ...files]);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={submitBonus} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Commission form (contractor only) — matches v7 contractor commission */}
        {selectedType === "commission" && (
          <div className="space-y-5">
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

                  {/* Attachment upload - optional, multi */}
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
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {item.attachment.length === 0 ? 'Upload documents' : 'Add more'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            updateCommissionItem(item.id, "attachment", [...item.attachment, ...files]);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={submitCommission} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CA3_AdminAddAdjustment;
