/**
 * F1v4_PeriodDropdown - Period selector dropdown
 * 
 * Matches Flow 6 v3 CA3_PeriodDropdown pattern
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type PayrollFrequency = "monthly" | "fortnightly";
export type PayrollRunStatus = "in-review" | "processing" | "paid";

export interface PayrollPeriod {
  id: string;
  frequency: PayrollFrequency;
  periodLabel: string; // e.g., "Jan 1–14", "Jan 2026"
  payDate: string; // e.g., "15th", "30th"
  status: PayrollRunStatus;
  // Legacy compatibility
  label?: string;
}

interface F1v4_PeriodDropdownProps {
  periods: PayrollPeriod[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export const F1v4_PeriodDropdown: React.FC<F1v4_PeriodDropdownProps> = ({
  periods,
  selectedPeriodId,
  onPeriodChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (periodId: string) => {
    onPeriodChange(periodId);
    setIsOpen(false);
  };

  // Build trigger label
  const triggerLabel = selectedPeriod 
    ? `${selectedPeriod.frequency === "monthly" ? "Monthly" : "Fortnightly"} · ${selectedPeriod.periodLabel}`
    : "Select Run";

  // Get status badge styles
  const getStatusBadge = (status: PayrollRunStatus) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-accent-green/10 text-accent-green-text border-accent-green/20 text-[11px] px-2 py-0.5 font-medium whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] px-2 py-0.5 font-medium whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "in-review":
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[11px] px-2 py-0.5 font-medium whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            In review
          </Badge>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 text-lg font-semibold text-foreground",
          "hover:text-foreground/80 transition-colors",
          "focus:outline-none"
        )}
      >
        <span>{triggerLabel}</span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[400px] bg-popover border border-border rounded-xl shadow-xl py-2 overflow-hidden">
          {/* Header */}
          <div className="px-4 pb-2 mb-1 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Payroll Runs
            </span>
          </div>
          
          {/* Period list */}
          <div className="max-h-[320px] overflow-y-auto">
            {periods.map((period, index) => {
              const isSelected = period.id === selectedPeriodId;
              const isPreviousInReview = index > 0 && periods[index - 1].status !== "paid" && period.status === "paid";
              
              return (
                <React.Fragment key={period.id}>
                  {/* Divider between active and historical */}
                  {isPreviousInReview && (
                    <div className="mx-4 my-2 border-t border-border/50" />
                  )}
                  <button
                    onClick={() => handleSelect(period.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-left",
                      "hover:bg-muted/50 transition-colors",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    {/* Left: Run details */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          isSelected ? "text-foreground" : "text-foreground/90"
                        )}>
                          {period.frequency === "monthly" ? "Monthly" : "Fortnightly"}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-foreground" : "text-foreground/80"
                        )}>
                          {period.periodLabel}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Pay date: {period.payDate}
                      </span>
                    </div>
                    
                    {/* Right: Status badge */}
                    <div className="flex-shrink-0 ml-4">
                      {getStatusBadge(period.status)}
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default F1v4_PeriodDropdown;
