/**
 * CA3_PeriodDropdown — Premium period selector
 * Grouped sections, animated status dots, accent bars, glassmorphism
 */

import React, { useMemo } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type PayrollFrequency = "monthly" | "fortnightly";
export type PayrollRunStatus = "in-review" | "processing" | "paid";

export interface PayrollPeriod {
  id: string;
  frequency: PayrollFrequency;
  periodLabel: string;
  payDate: string;
  status: PayrollRunStatus;
  label?: string;
}

interface CA3_PeriodDropdownProps {
  periods: PayrollPeriod[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

const StatusDot = ({ status, size = "sm" }: { status: PayrollRunStatus; size?: "sm" | "md" }) => {
  const dotSize = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  const pulseSize = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <span className="relative inline-flex">
      {status === "in-review" && (
        <span className={cn(
          "absolute inline-flex rounded-full opacity-40 animate-ping",
          pulseSize,
          "bg-amber-500"
        )} />
      )}
      <span className={cn(
        "relative inline-flex rounded-full",
        dotSize,
        status === "paid" && "bg-emerald-500",
        status === "processing" && "bg-primary",
        status === "in-review" && "bg-amber-500",
      )} />
    </span>
  );
};

const statusLabel = (s: PayrollRunStatus) =>
  s === "paid" ? "Paid" : s === "processing" ? "Processing" : "In review";

export const CA3_PeriodDropdown: React.FC<CA3_PeriodDropdownProps> = ({
  periods,
  selectedPeriodId,
  onPeriodChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

  const { active, history } = useMemo(() => {
    const active: PayrollPeriod[] = [];
    const history: PayrollPeriod[] = [];
    periods.forEach(p => (p.status === "paid" ? history : active).push(p));
    return { active, history };
  }, [periods]);

  const handleSelect = (periodId: string) => {
    onPeriodChange(periodId);
    setIsOpen(false);
  };

  const triggerLabel = selectedPeriod
    ? `${selectedPeriod.frequency === "monthly" ? "Monthly" : "Fortnightly"} · ${selectedPeriod.periodLabel}`
    : "Select Run";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group flex items-center gap-2.5 px-3 py-1.5 rounded-full",
            "bg-card/80 border border-border/50 shadow-sm",
            "hover:border-border hover:shadow-md",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            isOpen && "border-primary/40 shadow-md bg-card"
          )}
        >
          {selectedPeriod && <StatusDot status={selectedPeriod.status} size="md" />}
          <span className="text-[15px] font-semibold text-foreground tracking-tight">
            {triggerLabel}
          </span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-[360px] p-0 bg-popover/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-black/10 overflow-hidden"
      >
        {/* Active Runs */}
        {active.length > 0 && (
          <div>
            <div className="px-4 pt-3 pb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.08em]">
                Active Runs
              </span>
            </div>
            <div className="px-2 pb-2 space-y-0.5">
              {active.map(period => {
                const isSelected = period.id === selectedPeriodId;
                return (
                  <button
                    key={period.id}
                    onClick={() => handleSelect(period.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                      "transition-all duration-150 ease-out",
                      "hover:bg-muted/60",
                      isSelected && "bg-primary/[0.06] ring-1 ring-primary/15"
                    )}
                  >
                    <div className={cn(
                      "w-[3px] self-stretch rounded-full shrink-0 transition-colors",
                      isSelected ? "bg-primary" : "bg-transparent"
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[13px] font-semibold",
                          isSelected ? "text-foreground" : "text-foreground/85"
                        )}>
                          {period.frequency === "monthly" ? "Monthly" : "Fortnightly"}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className={cn(
                          "text-[13px] font-medium",
                          isSelected ? "text-foreground" : "text-foreground/70"
                        )}>
                          {period.periodLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground/70">
                          Pay date: {period.payDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusDot status={period.status} />
                      <span className={cn(
                        "text-[11px] font-medium",
                        period.status === "in-review" && "text-amber-600 dark:text-amber-400",
                        period.status === "processing" && "text-primary",
                      )}>
                        {statusLabel(period.status)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        {active.length > 0 && history.length > 0 && (
          <div className="mx-4 border-t border-border/40" />
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="px-4 pt-2.5 pb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.08em]">
                History
              </span>
            </div>
            <div className="px-2 pb-2 space-y-0.5 max-h-[180px] overflow-y-auto overscroll-contain">
              {history.map(period => {
                const isSelected = period.id === selectedPeriodId;
                return (
                  <button
                    key={period.id}
                    onClick={() => handleSelect(period.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left",
                      "transition-all duration-150 ease-out",
                      "hover:bg-muted/60",
                      isSelected && "bg-primary/[0.06] ring-1 ring-primary/15"
                    )}
                  >
                    <div className={cn(
                      "w-[3px] self-stretch rounded-full shrink-0 transition-colors",
                      isSelected ? "bg-emerald-500" : "bg-transparent"
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[13px] font-medium",
                          isSelected ? "text-foreground" : "text-foreground/70"
                        )}>
                          {period.frequency === "monthly" ? "Monthly" : "Fortnightly"}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className={cn(
                          "text-[13px]",
                          isSelected ? "text-foreground/90" : "text-muted-foreground"
                        )}>
                          {period.periodLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusDot status="paid" />
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        Paid
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CA3_PeriodDropdown;
