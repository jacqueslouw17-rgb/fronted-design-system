/**
 * F1v4_ApproveStep - Final approval step with sign-off confirmation
 * 
 * Dense glass-container layout matching Flow 6 v3 patterns
 */

import React, { useState } from "react";
import { 
  CheckCircle2,
  ShieldCheck,
  Users,
  Briefcase,
  Globe,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Receipt,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { CompanyPayrollData } from "./F1v4_PayrollTab";

interface F1v4_ApproveStepProps {
  company: CompanyPayrollData;
  onApprove: () => void;
  hideHeader?: boolean;
}

export const F1v4_ApproveStep: React.FC<F1v4_ApproveStepProps> = ({
  company,
  onApprove,
  hideHeader = false,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  // Content without card wrappers for when hideHeader is true
  const renderContent = () => (
    <>
      {/* Validation Banner */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-accent-green-outline/30 bg-accent-green-fill/5">
        <ShieldCheck className="h-4 w-4 text-accent-green-text" />
        <div>
          <p className="text-sm font-medium text-foreground">Ready for approval</p>
          <p className="text-xs text-muted-foreground">All exceptions resolved, validation complete</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-primary/[0.04] rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">Gross Pay</span>
          </div>
          <p className="text-xl font-semibold text-foreground">$124.8K</p>
        </div>

        <div className="bg-primary/[0.04] rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">Adjustments</span>
          </div>
          <p className="text-xl font-semibold text-foreground">$8.2K</p>
        </div>

        <div className="bg-primary/[0.04] rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">Fronted Fees</span>
          </div>
          <p className="text-xl font-semibold text-foreground">$3.8K</p>
        </div>

        <div className="bg-primary/[0.06] rounded-xl p-4 border border-primary/10">
          <div className="flex items-center gap-1.5 text-primary/70 mb-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Total Payout</span>
          </div>
          <p className="text-xl font-semibold text-primary">{formatCurrency(company.totalCost)}</p>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground py-2.5 border-t border-border/30">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Employees: <strong className="text-foreground">{company.employeeCount}</strong>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          Contractors: <strong className="text-foreground">{company.contractorCount}</strong>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          Currencies: <strong className="text-foreground">{company.currencyCount}</strong>
        </span>
      </div>

      {/* What Happens Next */}
      <div className="pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">What happens next</p>
        <div className="relative pl-5">
          <div className="absolute left-[6px] top-1.5 bottom-1.5 w-px bg-border" />
          
          <div className="relative pb-3">
            <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary">
              <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Approve & lock run</p>
            <p className="text-[11px] text-muted-foreground">Sign off on payroll numbers</p>
          </div>

          <div className="relative pb-3">
            <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Generate payment summary</p>
            <p className="text-[11px] text-muted-foreground">Bank list and payslips ready</p>
          </div>

          <div className="relative pb-3">
            <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">External payment</p>
            <p className="text-[11px] text-muted-foreground">Processed outside Fronted</p>
          </div>

          <div className="relative">
            <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Track & reconcile</p>
            <p className="text-[11px] text-muted-foreground">Mark as paid/not paid</p>
          </div>
        </div>
      </div>
    </>
  );

  // Confirmation dialog (used in both modes)
  const confirmDialog = (
    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Payroll Numbers?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Approving payroll for <strong>{company.name}</strong> totaling{" "}
              <strong>{formatCurrency(company.totalCost)}</strong>.
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-foreground text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Payments are handled outside Fronted. This locks the run 
                and generates the payment summary.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onApprove}>Confirm & Lock</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // When hideHeader is true, render content without card wrappers
  if (hideHeader) {
    return (
      <div className="space-y-5">
        {renderContent()}
        {confirmDialog}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Validation Banner */}
      <Card className="border-accent-green-outline/30 bg-accent-green-fill/5">
        <CardContent className="py-4 px-5 flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-accent-green-text" />
          <div>
            <p className="text-sm font-medium text-foreground">Ready for approval</p>
            <p className="text-xs text-muted-foreground">All exceptions resolved, validation complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Payout Summary Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardContent className="py-5 px-5">
          {/* KPI Grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Gross Pay</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$124.8K</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Adjustments</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$8.2K</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Fronted Fees</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$3.8K</p>
            </div>

            <div className="bg-primary/[0.06] rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-1.5 text-primary/70 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Total Payout</span>
              </div>
              <p className="text-xl font-semibold text-primary">{formatCurrency(company.totalCost)}</p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground py-2.5 border-t border-border/30">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Employees: <strong className="text-foreground">{company.employeeCount}</strong>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Contractors: <strong className="text-foreground">{company.contractorCount}</strong>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Currencies: <strong className="text-foreground">{company.currencyCount}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardContent className="py-4 px-5">
          <p className="text-xs font-medium text-muted-foreground mb-3">What happens next</p>
          <div className="relative pl-5">
            <div className="absolute left-[6px] top-1.5 bottom-1.5 w-px bg-border" />
            
            <div className="relative pb-3">
              <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary">
                <div className="w-1 h-1 rounded-full bg-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Approve & lock run</p>
              <p className="text-[11px] text-muted-foreground">Sign off on payroll numbers</p>
            </div>

            <div className="relative pb-3">
              <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Generate payment summary</p>
              <p className="text-[11px] text-muted-foreground">Bank list and payslips ready</p>
            </div>

            <div className="relative pb-3">
              <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">External payment</p>
              <p className="text-[11px] text-muted-foreground">Processed outside Fronted</p>
            </div>

            <div className="relative">
              <div className="absolute left-[-20px] w-3 h-3 rounded-full flex items-center justify-center bg-muted border-2 border-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Track & reconcile</p>
              <p className="text-[11px] text-muted-foreground">Mark as paid/not paid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA - Moved to card header pattern for consistency */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="py-4 px-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ready to finalize payroll</p>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <FileCheck className="h-3.5 w-3.5" />
                  Approve & Lock
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Payroll Numbers?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Approving payroll for <strong>{company.name}</strong> totaling{" "}
                      <strong>{formatCurrency(company.totalCost)}</strong>.
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-foreground text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p>
                        Payments are handled outside Fronted. This locks the run 
                        and generates the payment summary.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onApprove}>Confirm & Lock</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default F1v4_ApproveStep;
