import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Timer, Receipt, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  
  // Form values
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [amount, setAmount] = useState("");
  
  const formatCurrency = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const resetForm = () => {
    setSelectedType(null);
    setDays("");
    setHours("");
    setAmount("");
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

  const handleSubmit = () => {
    if (!selectedType) return;
    
    let adjustmentData: AdminAddedAdjustment = {
      id: `admin-${Date.now()}`,
      type: selectedType,
      currency,
      addedAt: new Date().toISOString(),
    };

    switch (selectedType) {
      case "unpaid_leave": {
        const daysValue = parseFloat(days);
        if (isNaN(daysValue) || daysValue <= 0) {
          toast.error("Please enter valid days");
          return;
        }
        adjustmentData.days = daysValue;
        adjustmentData.amount = daysValue * dailyRate;
        adjustmentData.description = `${daysValue} day${daysValue !== 1 ? 's' : ''} unpaid leave`;
        break;
      }
      case "overtime": {
        const hoursValue = parseFloat(hours);
        if (isNaN(hoursValue) || hoursValue <= 0) {
          toast.error("Please enter valid hours");
          return;
        }
        adjustmentData.hours = hoursValue;
        adjustmentData.amount = hoursValue * hourlyRate;
        adjustmentData.description = `${hoursValue}h overtime`;
        break;
      }
      case "expense": {
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
          toast.error("Please enter valid amount");
          return;
        }
        adjustmentData.amount = amountValue;
        adjustmentData.description = "Expense reimbursement";
        break;
      }
    }

    onAddAdjustment(adjustmentData);
    
    const config = adjustmentTypeConfig[selectedType];
    toast.success(`Added ${config.label.toLowerCase()} for ${workerName}`);
    handleClose();
  };

  // Filter adjustment types based on worker type
  const availableTypes = Object.entries(adjustmentTypeConfig).filter(([_, config]) => {
    return workerType === "employee" ? config.forEmployee : config.forContractor;
  }) as [AdminAdjustmentType, typeof adjustmentTypeConfig[AdminAdjustmentType]][];

  // Calculate preview amount based on current input
  const getPreviewAmount = (): number | null => {
    if (!selectedType) return null;
    
    switch (selectedType) {
      case "unpaid_leave": {
        const daysValue = parseFloat(days);
        return !isNaN(daysValue) && daysValue > 0 ? daysValue * dailyRate : null;
      }
      case "overtime": {
        const hoursValue = parseFloat(hours);
        return !isNaN(hoursValue) && hoursValue > 0 ? hoursValue * hourlyRate : null;
      }
      case "expense": {
        const amountValue = parseFloat(amount);
        return !isNaN(amountValue) && amountValue > 0 ? amountValue : null;
      }
      default:
        return null;
    }
  };

  const previewAmount = getPreviewAmount();
  const isDeduction = selectedType === "unpaid_leave";

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-4"
    >
      {/* Header with back arrow */}
      <div className="flex items-center gap-2 -mt-1">
        <button
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {selectedType === null 
              ? "Add on behalf of worker" 
              : `Add ${adjustmentTypeConfig[selectedType].label.toLowerCase()}`
            }
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {selectedType === null 
              ? "Select adjustment type"
              : `For ${workerName.split(" ")[0]}`
            }
          </p>
        </div>
      </div>

      {/* Type selection - Card grid */}
      {selectedType === null && (
        <div className="grid grid-cols-1 gap-2.5 pt-2">
          {availableTypes.map(([type, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left",
                  "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]"
                )}
              >
                <div className="p-2 rounded-lg bg-muted/50">
                  <Icon className="h-4 w-4 text-muted-foreground" />
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

      {/* Form for selected type */}
      {selectedType && (
        <div className="space-y-4 pt-2">
          {/* Type-specific inputs */}
          {selectedType === "unpaid_leave" && (
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
              {previewAmount !== null && dailyRate > 0 && (
                <p className="text-sm text-muted-foreground">
                  Deduction: <span className="font-mono tabular-nums">−{formatCurrency(previewAmount, currency)}</span>
                  <span className="text-xs text-muted-foreground/70 ml-1.5">
                    ({formatCurrency(dailyRate, currency)}/day)
                  </span>
                </p>
              )}
            </div>
          )}

          {selectedType === "overtime" && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Hours</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="e.g., 8"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="h-10 text-sm"
                autoFocus
              />
              {previewAmount !== null && hourlyRate > 0 && (
                <p className="text-sm text-muted-foreground">
                  Addition: <span className="font-mono tabular-nums">+{formatCurrency(previewAmount, currency)}</span>
                  <span className="text-xs text-muted-foreground/70 ml-1.5">
                    ({formatCurrency(hourlyRate, currency)}/hr)
                  </span>
                </p>
              )}
            </div>
          )}

          {selectedType === "expense" && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Amount ({currency})</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-sm"
                autoFocus
              />
              {previewAmount !== null && (
                <p className="text-sm text-muted-foreground">
                  Addition: <span className="font-mono tabular-nums">+{formatCurrency(previewAmount, currency)}</span>
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3">
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
              disabled={previewAmount === null}
              className="flex-1 h-9 text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Add {isDeduction ? "deduction" : "adjustment"}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CA3_AdminAddAdjustment;
