import React from "react";
import { Send, Users, Briefcase, CheckCircle2, Lock, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CA3_SubmitStepProps {
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  warningCount?: number;
  onSubmit: () => void;
}

export const CA3_SubmitStep: React.FC<CA3_SubmitStepProps> = ({
  totalCost,
  employeeCount,
  contractorCount,
  warningCount = 0,
  onSubmit,
}) => {
  const totalWorkers = employeeCount + contractorCount;

  return (
    <div className="space-y-4 max-w-xl">
      {/* Ready badge */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
        <span className="text-sm font-medium text-accent-green-text">All checks resolved</span>
      </div>

      {/* Batch overview card */}
      <div className="p-4 rounded-lg bg-muted/20 border border-border/10 space-y-4">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Batch Overview
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Total Cost */}
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="text-[11px] text-primary/70 mb-0.5">Total Cost</p>
              <p className="text-xl font-semibold text-primary">{totalCost}</p>
            </div>

            {/* Workers breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                </div>
                <span className="text-sm font-medium text-foreground">{employeeCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>Contractors</span>
                </div>
                <span className="text-sm font-medium text-foreground">{contractorCount}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-semibold text-foreground">{totalWorkers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings if any */}
        {warningCount > 0 && (
          <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {warningCount} warning{warningCount !== 1 ? 's' : ''} acknowledged. Items will proceed as-is.
            </p>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="p-4 rounded-lg bg-muted/10 border border-border/10 space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          What happens next
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-accent-green-text mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">Fronted will process all payments</p>
          </div>
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">FX rates locked, approvals frozen</p>
          </div>
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Track status in real-time</p>
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <Button onClick={onSubmit} className="gap-2">
        <Send className="h-4 w-4" />
        Submit to Fronted
      </Button>
    </div>
  );
};

export default CA3_SubmitStep;
