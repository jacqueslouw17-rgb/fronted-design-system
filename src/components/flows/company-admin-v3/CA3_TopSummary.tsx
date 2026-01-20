import React from "react";
import { DollarSign, Users, Briefcase, Globe, Receipt, TrendingUp, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CA3_TopSummaryProps {
  payPeriod: string;
  companyName?: string;
  grossPay: number;
  netPay: number;
  frontedFees: number;
  totalCost: number;
  employeeCount: number;
  contractorCount: number;
  currencyCount: number;
}

export const CA3_TopSummary: React.FC<CA3_TopSummaryProps> = ({
  payPeriod,
  companyName = "Your Company",
  grossPay,
  netPay,
  frontedFees,
  totalCost,
  employeeCount,
  contractorCount,
  currencyCount,
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
      <CardContent className="py-5 px-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">{payPeriod}</h2>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              In Review
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{employeeCount} employees</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span>{contractorCount} contractors</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>{currencyCount} currencies</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Gross Pay */}
          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm">Gross Pay</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(grossPay)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total base salaries</p>
          </div>

          {/* Net Pay */}
          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="text-sm">Net Pay</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(netPay)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">After adjustments</p>
          </div>

          {/* Fronted Fees */}
          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Fronted Fees</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(frontedFees)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Processing + service</p>
          </div>

          {/* Total Cost */}
          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm">Total Cost</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(totalCost)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pay + all fees</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CA3_TopSummary;
