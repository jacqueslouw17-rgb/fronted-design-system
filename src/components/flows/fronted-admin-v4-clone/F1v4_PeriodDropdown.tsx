/**
 * F1v4_PeriodDropdown — Premium period selector with off-cycle batch support
 * Grouped sections, animated status dots, accent bars, glassmorphism
 */

import React, { useMemo, useState } from "react";
import { ChevronDown, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
}

interface F1v4_PeriodDropdownProps {
  periods: PayrollPeriod[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
  allowCustomBatch?: boolean;
  onCreateCustomBatch?: (payDate: string) => void;
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

export const F1v4_PeriodDropdown: React.FC<F1v4_PeriodDropdownProps> = ({
  periods,
  selectedPeriodId,
  onPeriodChange,
  allowCustomBatch = false,
  onCreateCustomBatch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPayDate, setNewPayDate] = useState<Date | undefined>();
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
    setShowCreateForm(false);
  };

  const handleCreateBatch = () => {
    if (newPayDate && onCreateCustomBatch) {
      onCreateCustomBatch(newPayDate.toISOString().split('T')[0]);
      setNewPayDate(undefined);
      setShowCreateForm(false);
      setIsOpen(false);
    }
  };

  const triggerLabel = selectedPeriod
    ? selectedPeriod.isCustomBatch
      ? `Off-cycle · ${selectedPeriod.periodLabel}`
      : `${selectedPeriod.frequency === "monthly" ? "Monthly" : "Fortnightly"} · ${selectedPeriod.periodLabel}`
    : "Select Run";

  return (
    <Popover open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setShowCreateForm(false); }}>
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
        className="w-[360px] p-0 bg-popover/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-black/10 overflow-hidden"
      >
        {/* Focused create form — hides everything else */}
        {showCreateForm && allowCustomBatch ? (
          <div className="px-3 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">New Off-Cycle Batch</span>
              </div>
              <button onClick={() => { setShowCreateForm(false); setNewPayDate(undefined); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Pay out pending adjustments before the next scheduled cycle. Only workers with pending items will be included.
            </p>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Pay date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal text-sm",
                      !newPayDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {newPayDate ? format(newPayDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newPayDate}
                    onSelect={(date) => { setNewPayDate(date); }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowCreateForm(false); setNewPayDate(undefined); }}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateBatch}
                disabled={!newPayDate}
                className="flex-1 h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white"
              >
                Create Batch
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                            <CalendarIcon className="h-3 w-3 text-muted-foreground/50" />
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
                                Off-cycle
                              </span>
                              <span className="text-muted-foreground/40">·</span>
                              <span className={cn("text-[13px] font-medium", isSelected ? "text-foreground" : "text-foreground/70")}>
                                {period.periodLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="h-3 w-3 text-muted-foreground/50" />
                              <span className="text-[11px] text-muted-foreground/70">Pay date: {period.payDate}</span>
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

            {/* Create Custom Batch Button */}
            {allowCustomBatch && (
              <>
                <div className="mx-4 border-t border-border/40" />
                <div className="px-3 py-2.5">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg",
                      "text-[13px] font-medium text-violet-600 dark:text-violet-400",
                      "border border-dashed border-violet-300/50 dark:border-violet-500/30",
                      "hover:bg-violet-50/60 dark:hover:bg-violet-500/10",
                      "transition-all duration-150"
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Off-Cycle Batch
                  </button>
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
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default F1v4_PeriodDropdown;
