import React from "react";
import { Send, Users, Briefcase, CheckCircle2, Lock, ArrowRight, Globe, Clock } from "lucide-react";
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
            <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-3 px-5">
              <h3 className="text-sm font-medium text-foreground">Batch Overview</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Total payout - compact */}
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-primary/70">Total payout</span>
                  <span className="text-2xl font-semibold text-primary tracking-tight">{totalCost}</span>
                </div>
              </div>
              
              {/* Stats row - tighter */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Employees</span>
                    </div>
                    <span className="text-base font-semibold text-foreground">{employeeCount}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Contractors</span>
                    </div>
                    <span className="text-base font-semibold text-foreground">{contractorCount}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Currencies</span>
                    </div>
                    <span className="text-base font-semibold text-foreground">{currencyCount}</span>
                  </div>
                </div>
              </div>

              {/* CTA - tighter */}
              <div className="pt-1 flex items-center gap-3">
                <Button onClick={onSubmit} className="h-10 px-5 gap-2">
                  <Send className="h-4 w-4" />
                  Submit to Fronted
                </Button>
                <span className="text-xs text-muted-foreground">
                  2-3 business days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: What happens next (2/5) - Minimal timeline */}
        <div className="lg:col-span-2">
          <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
              <h3 className="text-sm font-medium text-foreground">What happens next</h3>
            </CardHeader>
            <CardContent className="p-5">
              {/* Vertical timeline */}
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                
                {/* Step 1 */}
                <div className="relative pb-5">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full bg-accent-green-fill/20 border-2 border-accent-green-text flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Submit batch</p>
                  <p className="text-xs text-muted-foreground">Fronted receives your payroll</p>
                </div>
                
                {/* Step 2 */}
                <div className="relative pb-5">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">FX rates locked</p>
                  <p className="text-xs text-muted-foreground">Exchange rates finalized</p>
                </div>
                
                {/* Step 3 */}
                <div className="relative pb-5">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">Payments processed</p>
                  <p className="text-xs text-muted-foreground">Workers paid automatically</p>
                </div>
                
                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">Reconciliation</p>
                  <p className="text-xs text-muted-foreground">Track status in real-time</p>
                </div>
              </div>

              {/* Processing time note */}
              <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Typically 2-3 business days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CA3_SubmitStep;
