import React from "react";
import { Send, Users, Briefcase, CheckCircle2, Lock, ArrowRight, Globe, Sparkles } from "lucide-react";
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
      {/* Ready state - subtle inline */}
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
        <span className="font-medium text-accent-green-text">All checks resolved — ready to submit</span>
      </div>

      {/* Main content - two column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Batch summary (3/5) - crisp container style */}
        <div className="lg:col-span-3 rounded-xl border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
            <h3 className="text-sm font-medium text-foreground">Batch Overview</h3>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total payout</p>
                <p className="text-3xl font-semibold text-foreground tracking-tight">{totalCost}</p>
              </div>
            </div>
            
            {/* Stats row */}
            <div className="flex items-center gap-5 pt-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{employeeCount}</span>
                <span className="text-xs text-muted-foreground">employees</span>
              </div>
              <div className="w-px h-4 bg-border/50" />
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{contractorCount}</span>
                <span className="text-xs text-muted-foreground">contractors</span>
              </div>
              <div className="w-px h-4 bg-border/50" />
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{currencyCount}</span>
                <span className="text-xs text-muted-foreground">currencies</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 flex items-center gap-4">
              <Button onClick={onSubmit} size="lg" className="h-11 px-6 gap-2">
                <Send className="h-4 w-4" />
                Submit to Fronted
              </Button>
              <span className="text-xs text-muted-foreground">
                Processed within 2-3 business days
              </span>
            </div>
          </div>
        </div>

        {/* Right: What happens next (2/5) - crisp container style */}
        <div className="lg:col-span-2 rounded-xl border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              What happens next
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-green-fill/10 flex items-center justify-center mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
              </div>
              <div>
                <p className="text-sm text-foreground">Fronted processes payments</p>
                <p className="text-xs text-muted-foreground">All workers paid automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center mt-0.5">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground">FX rates locked</p>
                <p className="text-xs text-muted-foreground">No changes until completion</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center mt-0.5">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground">Track progress</p>
                <p className="text-xs text-muted-foreground">Real-time updates on next screen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CA3_SubmitStep;
