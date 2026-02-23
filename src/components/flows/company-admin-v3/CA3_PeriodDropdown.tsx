/**
 * CA3_PeriodDropdown — Premium period selector with off-cycle batch support
 * Matches F1v4_PeriodDropdown layout: Active Runs, Off-Cycle Batches, History
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
  isCustomBatch?: boolean;
  startDate?: string;
  endDate?: string;
}

interface CA3_PeriodDropdownProps {
  periods: PayrollPeriod[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

const StatusDot = ({ status, size = "sm", isCustom = false }: { status: PayrollRunStatus; size?: "sm" | "md"; isCustom?: boolean }) => {
  const dotSize = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  const pulseSize = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";

  if (isCustom) {
    return (
      <span className="relative inline-flex">
        {status === "in-review" && (
          <span className={cn("absolute inline-flex rounded-full opacity-40 animate-ping", pulseSize, "bg-violet-500")} />
        )}
        <span className={cn(
          "relative inline-flex rounded-full", dotSize,
          status === "paid" ? "bg-emerald-500" : "bg-violet-500"
        )} />
      </span>
    );
  }

  return (
    <span className="relative inline-flex">
      {status === "in-review" && (
        <span className={cn("absolute inline-flex rounded-full opacity-40 animate-ping", pulseSize, "bg-amber-500")} />
      )}
      <span className={cn(
        "relative inline-flex rounded-full", dotSize,
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

  const { active, custom, history } = useMemo(() => {
    const active: PayrollPeriod[] = [];
    const custom: PayrollPeriod[] = [];
    const history: PayrollPeriod[] = [];
    periods.forEach(p => {
      if (p.status === "paid") history.push(p);
      else if (p.isCustomBatch) custom.push(p);
      else active.push(p);
    });
    return { active, custom, history };
  }, [periods]);

  const handleSelect = (periodId: string) => {
    onPeriodChange(periodId);
    setIsOpen(false);
  };

  const triggerLabel = selectedPeriod
    ? selectedPeriod.isCustomBatch
      ? `Custom · ${selectedPeriod.periodLabel}`
      : `${selectedPeriod.frequency === "monthly" ? "Monthly" : "Fortnightly"} · ${selectedPeriod.periodLabel}`
    : "Select Run";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          "group flex items-center gap-2 px-1 py-1 rounded-md",
          "bg-transparent hover:bg-muted/40",
          "transition-colors duration-150 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        )}>
          {selectedPeriod && <StatusDot status={selectedPeriod.status} size="md" isCustom={selectedPeriod.isCustomBatch} />}
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
        className="w-[360px] p-0 bg-popover/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-black/10 overflow-hidden max-h-[420px] overflow-y-auto overscroll-contain"
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
                      isSelected && period.status === "in-review" && "bg-amber-500/[0.06] ring-1 ring-amber-500/15",
                      isSelected && period.status === "processing" && "bg-primary/[0.06] ring-1 ring-primary/15",
                    )}
                  >
                    <div className={cn(
                      "w-[3px] self-stretch rounded-full shrink-0 transition-colors",
                      isSelected
                        ? period.status === "in-review" ? "bg-amber-500" : "bg-primary"
                        : "bg-transparent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[13px] font-semibold", isSelected ? "text-foreground" : "text-foreground/85")}>
                          {period.frequency === "monthly" ? "Monthly" : "Fortnightly"}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className={cn("text-[13px] font-medium", isSelected ? "text-foreground" : "text-foreground/70")}>
                          {period.periodLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground/70">Pay date: {period.payDate}</span>
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

        {/* Off-Cycle Batches */}
        {custom.length > 0 && (
          <>
            <div className="mx-4 border-t border-border/40" />
            <div>
              <div className="px-4 pt-2.5 pb-1.5">
                <span className="text-[10px] font-semibold text-violet-500/70 uppercase tracking-[0.08em]">
                  Off-Cycle Batches
                </span>
              </div>
              <div className="px-2 pb-2 space-y-0.5">
                {custom.map(period => {
                  const isSelected = period.id === selectedPeriodId;
                  return (
                    <button
                      key={period.id}
                      onClick={() => handleSelect(period.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                        "transition-all duration-150 ease-out",
                        "hover:bg-violet-50/60 dark:hover:bg-violet-500/10",
                        isSelected && "bg-violet-500/[0.08] ring-1 ring-violet-500/20"
                      )}
                    >
                      <div className={cn(
                        "w-[3px] self-stretch rounded-full shrink-0 transition-colors",
                        isSelected ? "bg-violet-500" : "bg-transparent"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[13px] font-semibold", isSelected ? "text-foreground" : "text-foreground/85")}>
                            Custom
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className={cn("text-[13px] font-medium", isSelected ? "text-foreground" : "text-foreground/70")}>
                            {period.periodLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 mt-0.5">
                          {period.startDate && period.endDate && (
                            <span className="text-[10px] text-muted-foreground/60">{period.startDate} – {period.endDate}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-[11px] text-muted-foreground/70">Pay: {period.payDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusDot status={period.status} isCustom />
                        <span className={cn(
                          "text-[11px] font-medium",
                          period.status === "in-review" && "text-violet-600 dark:text-violet-400",
                          period.status === "processing" && "text-violet-500",
                        )}>
                          {statusLabel(period.status)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Divider before history */}
        {history.length > 0 && (
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
                        <span className={cn("text-[13px] font-medium", isSelected ? "text-foreground" : "text-foreground/70")}>
                          {period.isCustomBatch ? "Off-cycle" : period.frequency === "monthly" ? "Monthly" : "Fortnightly"}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className={cn("text-[13px]", isSelected ? "text-foreground/90" : "text-muted-foreground")}>
                          {period.periodLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusDot status="paid" />
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Paid</span>
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
