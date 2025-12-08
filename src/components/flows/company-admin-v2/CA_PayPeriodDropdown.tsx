// Flow 6 v2 - Company Admin Dashboard - Enhanced Pay Period Dropdown (Local to this flow only)

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type PeriodType = "previous" | "current" | "next";

interface PeriodOption {
  value: PeriodType;
  label: string;
  subLabel: string;
}

interface CA_PayPeriodDropdownProps {
  value: PeriodType;
  onValueChange: (value: PeriodType) => void;
  periods: {
    previous: { label: string };
    current: { label: string };
    next: { label: string };
  };
}

export const CA_PayPeriodDropdown: React.FC<CA_PayPeriodDropdownProps> = ({
  value,
  onValueChange,
  periods,
}) => {
  const periodOptions: PeriodOption[] = [
    {
      value: "previous",
      label: periods.previous.label,
      subLabel: "Paid",
    },
    {
      value: "current",
      label: periods.current.label,
      subLabel: "In review",
    },
    {
      value: "next",
      label: periods.next.label,
      subLabel: "Scheduled",
    },
  ];

  const selectedOption = periodOptions.find((p) => p.value === value);

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as PeriodType)}>
      <SelectTrigger className="w-[180px] bg-background border-border">
        <SelectValue>
          <span>{selectedOption?.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border min-w-[200px]">
        {periodOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              "py-2.5 px-3 cursor-pointer",
              "focus:bg-primary/10 data-[highlighted]:bg-primary/10",
              value === option.value && "bg-primary/5"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-4 h-4 mt-0.5 flex items-center justify-center flex-shrink-0",
                value === option.value ? "text-primary" : "text-transparent"
              )}>
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.subLabel}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
