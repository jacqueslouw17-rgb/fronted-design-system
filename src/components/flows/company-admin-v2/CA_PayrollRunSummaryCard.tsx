import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Settings } from "lucide-react";
import { CA_PayPeriodDropdown, PeriodType } from "./CA_PayPeriodDropdown";

interface CA_PayrollRunSummaryCardProps {
  grossPay: string;
  netPay: string;
  frontedFees: string;
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount: number;
  paidPercentage?: number;
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  periods: {
    previous: { label: string };
    current: { label: string };
    next: { label: string };
  };
  onCountryRules: () => void;
}

export const CA_PayrollRunSummaryCard: React.FC<CA_PayrollRunSummaryCardProps> = ({
  grossPay,
  netPay,
  frontedFees,
  totalCost,
  employeeCount,
  contractorCount,
  currencyCount,
  paidPercentage = 100,
  selectedPeriod,
  onPeriodChange,
  periods,
  onCountryRules,
}) => {
  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
      <CardContent className="py-5 px-6">
        {/* Header with title, badge, and actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Payroll Run Totals</h3>
            <Badge className="bg-muted text-muted-foreground border-transparent">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <CA_PayPeriodDropdown value={selectedPeriod} onValueChange={onPeriodChange} periods={periods} />
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={onCountryRules}>
              <Settings className="h-3.5 w-3.5" />
              Country Rules
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          This cycle is read-only. Use Track & Reconcile to inspect payments.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-primary/[0.04]">
            <p className="text-xs text-muted-foreground mb-1">Gross Pay</p>
            <p className="text-2xl font-bold text-foreground">{grossPay}</p>
            <p className="text-xs text-muted-foreground mt-1">Total base salaries</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/[0.04]">
            <p className="text-xs text-muted-foreground mb-1">Net Pay</p>
            <p className="text-2xl font-bold text-foreground">{netPay}</p>
            <p className="text-xs text-muted-foreground mt-1">After adjustments</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/[0.04]">
            <p className="text-xs text-muted-foreground mb-1">Fronted Fees (Est.)</p>
            <p className="text-2xl font-bold text-foreground">{frontedFees}</p>
            <p className="text-xs text-muted-foreground mt-1">Transaction + Service</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/[0.04]">
            <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-foreground">{totalCost}</p>
            <p className="text-xs text-muted-foreground mt-1">Pay + All Fees</p>
          </div>
        </div>

        {/* Summary line */}
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Employees: <span className="font-semibold text-foreground">{employeeCount}</span></span>
            <span className="text-muted-foreground/50">·</span>
            <span>Contractors: <span className="font-semibold text-foreground">{contractorCount}</span></span>
            <span className="text-muted-foreground/50">·</span>
            <span>Currencies: <span className="font-semibold text-foreground">{currencyCount}</span></span>
            <span className="text-muted-foreground/50">·</span>
            <span>Paid: <span className="font-semibold text-foreground">{paidPercentage}%</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CA_PayrollRunSummaryCard;
