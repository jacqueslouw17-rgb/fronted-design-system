/**
 * F1v4_ApproveStep - Final approval step with sign-off confirmation
 * 
 * v1 terminology: "Approve payroll numbers" not "Execute"
 */

import React, { useState } from "react";
import { 
  CheckCircle2,
  ShieldCheck,
  Users,
  Briefcase,
  Globe,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";

interface F1v4_ApproveStepProps {
  company: CompanyPayrollData;
  onApprove: () => void;
}

export const F1v4_ApproveStep: React.FC<F1v4_ApproveStepProps> = ({
  company,
  onApprove,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-[calc(100vh-350px)] relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-secondary/[0.02] pointer-events-none rounded-xl" />

      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Approval Summary */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="border-b border-border/40 py-4 px-5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-accent-green-text" />
                <h3 className="text-sm font-medium text-foreground">Ready for Approval</h3>
              </div>
              <p className="text-xs text-muted-foreground">All exceptions resolved. Review summary and approve.</p>
            </div>

            <div className="p-5 space-y-5">
              {/* Pre-flight validation */}
              <div className="flex items-center gap-2.5 py-3 px-4 rounded-lg bg-accent-green-fill/5 border border-accent-green-outline/20">
                <CheckCircle2 className="h-4 w-4 text-accent-green-text flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground">Validation complete</p>
                  <p className="text-xs text-muted-foreground">All workers verified. No blocking exceptions.</p>
                </div>
              </div>

              {/* Total Payout Hero */}
              <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <p className="text-xs text-primary/70 mb-1">Total payout</p>
                <p className="text-3xl font-semibold text-primary tracking-tight">
                  {formatCurrency(company.totalCost)}
                </p>

                {/* Receipt-style breakdown */}
                <div className="mt-4 pt-3 border-t border-primary/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Gross pay</span>
                    <span className="text-foreground tabular-nums">$124,800</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fronted fees (est.)</span>
                    <span className="text-foreground tabular-nums">$3,792</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-primary/10">
                    <span className="text-primary/80 font-medium">Net payout</span>
                    <span className="text-primary font-medium tabular-nums">{formatCurrency(company.totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg border border-border/60 bg-card/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Employees</span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">{company.employeeCount}</p>
                </div>
                <div className="p-4 rounded-lg border border-border/60 bg-card/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Contractors</span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">{company.contractorCount}</p>
                </div>
                <div className="p-4 rounded-lg border border-border/60 bg-card/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Currencies</span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">{company.currencyCount}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button size="lg" className="h-11 px-6 gap-2">
                      <FileCheck className="h-4 w-4" />
                      Approve Numbers & Lock Run
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Payroll Numbers?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          You're approving payroll numbers for <strong>{company.name}</strong> totaling{" "}
                          <strong>{formatCurrency(company.totalCost)}</strong>.
                        </p>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-foreground text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p>
                            Payments are handled outside Fronted. This approval locks the payroll run 
                            and generates the payment summary for external execution.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onApprove}>
                        Confirm & Lock Run
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: What happens next */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="border-b border-border/40 py-4 px-5">
              <h3 className="text-sm font-medium text-foreground">What happens next</h3>
            </div>

            <div className="p-5">
              {/* Vertical timeline */}
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                {/* Step 1 */}
                <div className="relative pb-6">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-0.5">Approve numbers</p>
                  <p className="text-xs text-muted-foreground">Lock the payroll run with your sign-off</p>
                </div>

                {/* Step 2 */}
                <div className="relative pb-6">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground mb-0.5">Generate payment summary</p>
                  <p className="text-xs text-muted-foreground">Bank list and payslips prepared for download</p>
                </div>

                {/* Step 3 */}
                <div className="relative pb-6">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground mb-0.5">External payment execution</p>
                  <p className="text-xs text-muted-foreground">Payments processed outside Fronted platform</p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground mb-0.5">Track & reconcile</p>
                  <p className="text-xs text-muted-foreground">Mark payments as paid/not paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default F1v4_ApproveStep;
