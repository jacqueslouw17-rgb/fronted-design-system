import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Timer, Receipt, Check, ArrowLeft, X, Plus } from "lucide-react";
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

const adjustmentTypeConfig: Record<AdminAdjustmentType, { 
  icon: React.ElementType; 
  label: string; 
  description: string;
  forEmployee: boolean;
  forContractor: boolean;
}> = {
  unpaid_leave: { 
    icon: Calendar, 
    label: "Unpaid Leave", 
    description: "Deduct pay for days not worked",
    forEmployee: true,
    forContractor: false,
  },
  overtime: { 
    icon: Timer, 
    label: "Overtime", 
    description: "Additional hours worked",
    forEmployee: true,
    forContractor: true,
  },
  expense: { 
    icon: Receipt, 
    label: "Expense", 
    description: "Reimbursement for costs incurred",
    forEmployee: true,
    forContractor: true,
  },
};

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

// Line item types for multi-entry support
interface ExpenseLineItem {
  id: string;
  category: string;
  amount: string;
}

interface OvertimeLineItem {
  id: string;
  hours: string;
}

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
  const [selectedType, setSelectedType] = useState<AdminAdjustmentType | null>(null);
  
  // Unpaid leave
  const [days, setDays] = useState("");
  
  // Multi-item expense support
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: '', amount: '' }
  ]);
  
  // Multi-item overtime support
  const [overtimeItems, setOvertimeItems] = useState<OvertimeLineItem[]>([
    { id: crypto.randomUUID(), hours: '' }
  ]);
  
  const formatCurrency = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const resetForm = () => {
    setSelectedType(null);
    setDays("");
    setExpenseItems([{ id: crypto.randomUUID(), category: '', amount: '' }]);
    setOvertimeItems([{ id: crypto.randomUUID(), hours: '' }]);
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
    setExpenseItems(prev => [...prev, { id: crypto.randomUUID(), category: '', amount: '' }]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) return;
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseLineItem, value: string) => {
    setExpenseItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Overtime helpers
  const addOvertimeItem = () => {
    setOvertimeItems(prev => [...prev, { id: crypto.randomUUID(), hours: '' }]);
  };

  const removeOvertimeItem = (id: string) => {
    if (overtimeItems.length === 1) return;
    setOvertimeItems(prev => prev.filter(item => item.id !== id));
  };

  const updateOvertimeItem = (id: string, hours: string) => {
    setOvertimeItems(prev => prev.map(item => 
      item.id === id ? { ...item, hours } : item
    ));
  };

  // Calculate totals
  const expenseTotal = expenseItems.reduce((sum, item) => {
    const amt = parseFloat(item.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const overtimeTotalHours = overtimeItems.reduce((sum, item) => {
    const hrs = parseFloat(item.hours);
    return sum + (isNaN(hrs) ? 0 : hrs);
  }, 0);

  const handleSubmit = () => {
    if (!selectedType) return;

    switch (selectedType) {
      case "unpaid_leave": {
        const daysValue = parseFloat(days);
        if (isNaN(daysValue) || daysValue <= 0) {
          toast.error("Please enter valid days");
          return;
        }
        onAddAdjustment({
          id: `admin-${Date.now()}`,
          type: selectedType,
          days: daysValue,
          amount: daysValue * dailyRate,
          description: `${daysValue} day${daysValue !== 1 ? 's' : ''} unpaid leave`,
          currency,
          addedAt: new Date().toISOString(),
        });
        toast.success(`Added unpaid leave for ${workerName}`);
        break;
      }
      case "overtime": {
        const validItems = overtimeItems.filter(item => {
          const hrs = parseFloat(item.hours);
          return !isNaN(hrs) && hrs > 0;
        });
        if (validItems.length === 0) {
          toast.error("Please enter valid hours");
          return;
        }
        validItems.forEach(item => {
          const hrs = parseFloat(item.hours);
          onAddAdjustment({
            id: `admin-${Date.now()}-${item.id}`,
            type: selectedType,
            hours: hrs,
            amount: hrs * hourlyRate,
            description: `${hrs}h overtime`,
            currency,
            addedAt: new Date().toISOString(),
          });
        });
        toast.success(`Added ${validItems.length} overtime entr${validItems.length > 1 ? 'ies' : 'y'} for ${workerName}`);
        break;
      }
      case "expense": {
        const validItems = expenseItems.filter(item => {
          const amt = parseFloat(item.amount);
          return item.category && !isNaN(amt) && amt > 0;
        });
        if (validItems.length === 0) {
          toast.error("Please enter valid expense details");
          return;
        }
        validItems.forEach(item => {
          const amt = parseFloat(item.amount);
          onAddAdjustment({
            id: `admin-${Date.now()}-${item.id}`,
            type: selectedType,
            amount: amt,
            description: `${item.category} expense`,
            currency,
            addedAt: new Date().toISOString(),
          });
        });
        toast.success(`Added ${validItems.length} expense${validItems.length > 1 ? 's' : ''} for ${workerName}`);
        break;
      }
    }

    handleClose();
  };

  // Filter adjustment types based on worker type
  const availableTypes = Object.entries(adjustmentTypeConfig).filter(([_, config]) => {
    return workerType === "employee" ? config.forEmployee : config.forContractor;
  }) as [AdminAdjustmentType, typeof adjustmentTypeConfig[AdminAdjustmentType]][];

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header with back arrow */}
      <div className="px-5 pt-5 pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {selectedType === null 
                ? `Add on behalf of ${workerName}` 
                : adjustmentTypeConfig[selectedType].label
              }
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedType === null 
                ? "Select adjustment type"
                : adjustmentTypeConfig[selectedType].description
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Type selection - Card grid */}
        {selectedType === null && (
          <div className="grid grid-cols-1 gap-3">
            {availableTypes.map(([type, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]"
                  )}
                >
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Unpaid Leave Form */}
        {selectedType === "unpaid_leave" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Days</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="e.g., 2 or 0.5 for half day"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="h-10 text-sm"
                autoFocus
              />
            </div>
            {parseFloat(days) > 0 && dailyRate > 0 && (
              <p className="text-sm text-muted-foreground">
                Deduction: <span className="font-mono tabular-nums">−{formatCurrency(parseFloat(days) * dailyRate, currency)}</span>
                <span className="text-xs text-muted-foreground/70 ml-1.5">
                  ({formatCurrency(dailyRate, currency)}/day)
                </span>
              </p>
            )}
          </div>
        )}

        {/* Overtime Form - Multi-item */}
        {selectedType === "overtime" && (
          <div className="space-y-4">
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
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Hours {overtimeItems.length > 1 && `#${index + 1}`}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    placeholder="e.g., 8"
                    value={item.hours}
                    onChange={(e) => updateOvertimeItem(item.id, e.target.value)}
                    className="h-10 text-sm"
                    autoFocus={index === 0}
                  />
                </div>
              </div>
            ))}

            {/* Add another overtime entry */}
            <button
              type="button"
              onClick={addOvertimeItem}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-border/60 rounded-lg text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another entry
            </button>

            {/* Total summary */}
            {overtimeTotalHours > 0 && (
              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total overtime</span>
                  <span className="font-mono tabular-nums font-medium">
                    {overtimeTotalHours}h · +{formatCurrency(overtimeTotalHours * hourlyRate, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expense Form - Multi-item */}
        {selectedType === "expense" && (
          <div className="space-y-4">
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

                {/* Side-by-side category and amount */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select
                      value={item.category}
                      onValueChange={(val) => updateExpenseItem(item.id, 'category', val)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updateExpenseItem(item.id, 'amount', e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add another expense */}
            <button
              type="button"
              onClick={addExpenseItem}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-border/60 rounded-lg text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another expense
            </button>

            {/* Total summary */}
            {expenseTotal > 0 && (
              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total expenses</span>
                  <span className="font-mono tabular-nums font-medium">
                    +{formatCurrency(expenseTotal, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - only show when type is selected */}
      {selectedType && (
        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="flex-1 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="flex-1 h-9 text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Add {selectedType === "unpaid_leave" ? "deduction" : selectedType === "overtime" ? `${overtimeTotalHours}h` : `${expenseItems.filter(i => i.category && i.amount).length} expense${expenseItems.filter(i => i.category && i.amount).length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CA3_AdminAddAdjustment;
