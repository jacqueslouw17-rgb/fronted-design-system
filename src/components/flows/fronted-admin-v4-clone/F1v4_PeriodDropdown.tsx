/**
 * F1v4_PeriodDropdown - Period selector dropdown
 * 
 * Matches Flow 6 v3 CA3_PeriodDropdown pattern
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PayrollPeriod {
  id: string;
  label: string;
  status: "current" | "processing" | "paid";
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
        {selectedPeriod?.label} Payroll
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[200px] bg-card border border-border/40 rounded-lg shadow-lg py-1 backdrop-blur-sm">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => handleSelect(period.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left text-sm",
                "hover:bg-muted/50 transition-colors",
                period.id === selectedPeriodId && "bg-muted/30"
              )}
            >
              <span className={cn(
                "font-medium",
                period.id === selectedPeriodId ? "text-foreground" : "text-muted-foreground"
              )}>
                {period.label}
              </span>
              {period.status === "paid" ? (
                <span className="flex items-center gap-1 text-[11px] text-accent-green-text">
                  <CheckCircle2 className="h-3 w-3" />
                  Paid
                </span>
              ) : period.status === "processing" ? (
                <span className="flex items-center gap-1 text-[11px] text-primary">
                  <Clock className="h-3 w-3" />
                  Processing
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-600">
                  <Clock className="h-3 w-3" />
                  In review
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default F1v4_PeriodDropdown;
