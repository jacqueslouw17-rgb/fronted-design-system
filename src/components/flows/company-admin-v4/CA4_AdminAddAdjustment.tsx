import React, { useMemo, useState } from "react";
import { ArrowLeft, CalendarOff, Clock, Receipt, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types for admin-added adjustments
export type AdminAdjustmentType = "unpaid_leave" | "overtime" | "expense";

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
}

interface OvertimeLineItem {
  id: string;
  hours: string;
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
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: "", otherCategory: "", amount: "" },
  ]);
  const [overtimeItems, setOvertimeItems] = useState<OvertimeLineItem[]>([
    { id: crypto.randomUUID(), hours: "" },
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
        id: "unpaid_leave",
        label: "Unpaid Leave",
        description: "Deduct pay for days not worked",
        icon: CalendarOff,
      });
    }

    return base;
  }, [workerType]);

  const formatMoney = (amt: number) =>
    `${currency} ${Math.abs(amt).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const resetForm = () => {
    setSelectedType(null);
    setUnpaidLeaveDays("");
    setExpenseItems([{ id: crypto.randomUUID(), category: "", otherCategory: "", amount: "" }]);
    setOvertimeItems([{ id: crypto.randomUUID(), hours: "" }]);
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
    setExpenseItems((prev) => [...prev, { id: crypto.randomUUID(), category: "", otherCategory: "", amount: "" }]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) return;
    setExpenseItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseLineItem, value: string) => {
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

  // Overtime helpers
  const addOvertimeItem = () => {
    setOvertimeItems((prev) => [...prev, { id: crypto.randomUUID(), hours: "" }]);
  };

  const removeOvertimeItem = (id: string) => {
    if (overtimeItems.length === 1) return;
    setOvertimeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateOvertimeItem = (id: string, hours: string) => {
    setOvertimeItems((prev) => prev.map((item) => (item.id === id ? { ...item, hours } : item)));
  };

  // Totals (used for the v6-style session summary)
  const expenseSessionTotal = expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const overtimeSessionTotalHours = overtimeItems.reduce((sum, item) => sum + (parseFloat(item.hours) || 0), 0);

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
    const validItems = overtimeItems
      .map((item) => ({ ...item, hoursValue: parseFloat(item.hours) }))
      .filter((item) => !Number.isNaN(item.hoursValue) && item.hoursValue > 0);

    if (validItems.length === 0) {
      toast.error("Please enter valid hours");
      return;
    }

    validItems.forEach((item) => {
      const hrs = item.hoursValue;
      onAddAdjustment({
        id: `admin-${Date.now()}-${item.id}`,
        type: "overtime",
        hours: hrs,
        amount: hrs * hourlyRate,
        description: workerType === "contractor" ? `${hrs}h additional hours` : `${hrs}h overtime`,
        currency,
        addedAt: new Date().toISOString(),
      });
    });

    toast.success(
      `Added ${validItems.length} entr${validItems.length > 1 ? "ies" : "y"} for ${workerName}`,
    );
    handleClose();
  };

  const submitUnpaidLeave = () => {
    const daysValue = parseFloat(unpaidLeaveDays);
    if (Number.isNaN(daysValue) || daysValue <= 0) {
      toast.error("Please enter valid days");
      return;
    }

    onAddAdjustment({
      id: `admin-${Date.now()}`,
      type: "unpaid_leave",
      days: daysValue,
      amount: daysValue * dailyRate,
      description: `${daysValue} day${daysValue !== 1 ? "s" : ""} unpaid leave`,
      currency,
      addedAt: new Date().toISOString(),
    });

    toast.success(`Added unpaid leave for ${workerName}`);
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
          : "Unpaid leave";

  return (
    <div className="flex flex-col h-full">
      {/* Minimal header (v6-style) */}
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
        {/* Type Selection (v6 tile cards) */}
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

        {/* Expense Form (multi-line, v6 spacing + buttons) */}
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
                        Entry {index + 1}
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

        {/* Overtime / Additional hours (multi-entry) */}
        {selectedType === "overtime" && (
          <div className="space-y-5">
            <div className="space-y-3">
              {overtimeItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                >
                  {overtimeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOvertimeItem(item.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}

                  {overtimeItems.length > 1 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Entry {index + 1}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="0.0"
                      value={item.hours}
                      onChange={(e) => updateOvertimeItem(item.id, e.target.value)}
                      className="h-9"
                      autoFocus={index === 0}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addOvertimeItem}
                className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                Add another entry
              </button>
            </div>

            {overtimeItems.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session total</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {overtimeSessionTotalHours.toLocaleString(undefined, { maximumFractionDigits: 2 })}h · +
                    {formatMoney(overtimeSessionTotalHours * hourlyRate)}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={submitOvertime} className="w-full">
              Add adjustment
            </Button>
          </div>
        )}

        {/* Unpaid leave (single-entry) */}
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
      </div>
    </div>
  );
};

export default CA3_AdminAddAdjustment;
