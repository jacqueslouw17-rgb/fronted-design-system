import React from "react";
import { Send, Users, Briefcase, CheckCircle2, Lock, Info, AlertTriangle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CA3_SubmitStepProps {
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount?: number;
  warningCount?: number;
  onSubmit: () => void;
}

export const CA3_SubmitStep: React.FC<CA3_SubmitStepProps> = ({
  totalCost,
  employeeCount,
  contractorCount,
  currencyCount = 3,
  warningCount = 0,
  onSubmit,
}) => {
  const totalWorkers = employeeCount + contractorCount;

  return (
    <div className="space-y-6">
      {/* Ready state banner */}
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
        <span className="font-medium text-accent-green-text">All checks resolved — ready to submit</span>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Batch Overview */}
        <div className="p-6 rounded-xl bg-muted/10 border border-border/10 space-y-5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Batch Overview
          </h3>
          
          {/* Total Cost - hero stat */}
          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
            <p className="text-xs text-primary/60 mb-1">Total Payout</p>
            <p className="text-3xl font-semibold text-primary tracking-tight">{totalCost}</p>
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold text-foreground">{employeeCount}</p>
              <p className="text-xs text-muted-foreground">Employees</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold text-foreground">{contractorCount}</p>
              <p className="text-xs text-muted-foreground">Contractors</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold text-foreground">{currencyCount}</p>
              <p className="text-xs text-muted-foreground">Currencies</p>
            </div>
          </div>

          {/* Warnings if any - calmer inline banner */}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{warningCount} warning{warningCount !== 1 ? 's' : ''} acknowledged</span>
            </div>
          )}
        </div>

        {/* Right: What happens next */}
        <div className="p-6 rounded-xl bg-muted/5 border border-border/5 space-y-5 h-fit">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            What happens next
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-green-fill/10 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Fronted processes payments</p>
                <p className="text-xs text-muted-foreground">All workers paid within 2-3 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">FX rates locked</p>
                <p className="text-xs text-muted-foreground">Approvals frozen until completion</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Track in real-time</p>
                <p className="text-xs text-muted-foreground">Monitor status on the next screen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit CTA - left aligned */}
      <div className="pt-2">
        <Button onClick={onSubmit} size="lg" className="gap-2 h-11 px-6">
          <Send className="h-4 w-4" />
          Submit to Fronted
        </Button>
      </div>
    </div>
  );
};

export default CA3_SubmitStep;
