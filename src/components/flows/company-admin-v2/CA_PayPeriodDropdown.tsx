// Flow 6 v2 - Company Admin Dashboard - Enhanced Pay Period Dropdown (Local to this flow only)

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type PeriodType = "previous" | "current" | "next";

interface PeriodOption {
  value: PeriodType;
  label: string;
  status: "past" | "current" | "upcoming";
  subLabel?: string;
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
      status: "past",
      subLabel: "Paid",
    },
    {
      value: "current",
      label: periods.current.label,
      status: "current",
      subLabel: "In review",
    },
    {
      value: "next",
      label: periods.next.label,
      status: "upcoming",
      subLabel: "Scheduled",
    },
  ];

  const getStatusPillStyles = (status: PeriodOption["status"]) => {
    switch (status) {
      case "past":
        return "bg-muted text-muted-foreground border-transparent";
      case "current":
        return "bg-primary/15 text-primary border-primary/30";
      case "upcoming":
        return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30";
      default:
        return "bg-muted text-muted-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: PeriodOption["status"]) => {
    switch (status) {
      case "past":
        return "Past";
      case "current":
        return "Current";
      case "upcoming":
        return "Upcoming";
      default:
        return "";
    }
  };

  const selectedOption = periodOptions.find((p) => p.value === value);

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as PeriodType)}>
      <SelectTrigger className="w-[200px] bg-background/80 backdrop-blur-sm">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{selectedOption?.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/50 min-w-[240px]">
        {periodOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              "flex items-center py-3 px-3 cursor-pointer focus:bg-accent/50",
              value === option.value && "bg-accent/30"
            )}
          >
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  {value === option.value && (
                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    value === option.value ? "text-foreground" : "text-foreground/90"
                  )}>
                    {option.label}
                  </span>
                </div>
                {option.subLabel && (
                  <span className={cn(
                    "text-[11px] text-muted-foreground/70 ml-5",
                    value !== option.value && "ml-0"
                  )}>
                    {option.subLabel}
                  </span>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 h-5 flex-shrink-0",
                  getStatusPillStyles(option.status)
                )}
              >
                {getStatusLabel(option.status)}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
