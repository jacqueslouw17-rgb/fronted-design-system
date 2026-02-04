import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Helper to build display label
const buildRunLabel = (period: PayrollPeriod): string => {
  const freqLabel = period.frequency === "monthly" ? "Monthly" : "Fortnightly";
  return `${freqLabel} · ${period.periodLabel} · Pay date ${period.payDate}`;
};

// Helper to get status display
const getStatusDisplay = (status: PayrollRunStatus): { label: string; className: string } => {
  switch (status) {
    case "paid":
      return { label: "Paid", className: "text-accent-green-text" };
    case "processing":
      return { label: "Processing", className: "text-primary" };
    case "in-review":
    default:
      return { label: "In review", className: "text-amber-600" };
  }
};

interface CA3_PeriodDropdownProps {
  periods: PayrollPeriod[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export const CA3_PeriodDropdown: React.FC<CA3_PeriodDropdownProps> = ({
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

  // Build trigger label - shorter for selected
  const triggerLabel = selectedPeriod 
    ? `${selectedPeriod.frequency === "monthly" ? "Monthly" : "Fortnightly"} · ${selectedPeriod.periodLabel}`
    : "Select Run";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 text-lg font-semibold text-foreground",
          "hover:text-foreground/80 transition-colors",
          "focus:outline-none"
        )}
      >
        {triggerLabel}
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[320px] bg-card border border-border/40 rounded-lg shadow-lg py-1 backdrop-blur-sm">
          {periods.map((period) => {
            const statusDisplay = getStatusDisplay(period.status);
            return (
              <button
                key={period.id}
                onClick={() => handleSelect(period.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-left text-sm",
                  "hover:bg-muted/50 transition-colors",
                  period.id === selectedPeriodId && "bg-muted/30"
                )}
              >
                <span className={cn(
                  "font-medium",
                  period.id === selectedPeriodId ? "text-foreground" : "text-muted-foreground"
                )}>
                  {buildRunLabel(period)}
                </span>
                <span className={cn("flex items-center gap-1 text-[11px]", statusDisplay.className)}>
                  {period.status === "paid" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {statusDisplay.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CA3_PeriodDropdown;
