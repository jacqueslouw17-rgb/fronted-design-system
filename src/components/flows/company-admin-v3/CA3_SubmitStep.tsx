import React from "react";
import { Send, Users, Briefcase, CheckCircle2, Lock, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  onSubmit,
}) => {
  return (
    <div className="space-y-6">
      {/* Ready state - subtle inline */}
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
        <span className="font-medium text-accent-green-text">All checks resolved — ready to submit</span>
      </div>

      {/* Main content - two column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Batch summary (3/5) */}
        <div className="lg:col-span-3">
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <h3 className="text-base font-medium text-foreground">Batch Overview</h3>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Total payout card */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-xs text-primary/70 mb-1">Total payout</p>
                <p className="text-3xl font-semibold text-primary tracking-tight">{totalCost}</p>
              </div>
              
              {/* Stats row as individual cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Employees</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{employeeCount}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Contractors</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{contractorCount}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Currencies</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{currencyCount}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 flex items-center gap-4">
                <Button onClick={onSubmit} size="lg" className="h-11 px-6 gap-2">
                  <Send className="h-4 w-4" />
                  Submit to Fronted
                </Button>
                <span className="text-xs text-muted-foreground">
                  Processed within 2-3 business days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: What happens next (2/5) */}
        <div className="lg:col-span-2">
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                What happens next
              </h3>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-green-fill/10 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Fronted processes payments</p>
                  <p className="text-xs text-muted-foreground">All workers paid automatically</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center mt-0.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">FX rates locked</p>
                  <p className="text-xs text-muted-foreground">No changes until completion</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center mt-0.5">
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Track progress</p>
                  <p className="text-xs text-muted-foreground">Real-time updates on next screen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CA3_SubmitStep;