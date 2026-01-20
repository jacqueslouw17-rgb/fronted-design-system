import React from "react";
import { DollarSign, Users, Briefcase, Globe, Receipt, TrendingUp, Building2, Clock, Lock, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PayrollStatus = "in-review" | "checks-pending" | "ready" | "submitted" | "processing" | "completed";

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
  status?: PayrollStatus;
  fxLocked?: boolean;
  paymentRails?: string[];
  processingTime?: string;
}

const statusConfig: Record<PayrollStatus, { label: string; className: string }> = {
  "in-review": { label: "In Review", className: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  "checks-pending": { label: "Checks Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  "ready": { label: "Ready to Submit", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30" },
  "submitted": { label: "Submitted", className: "bg-primary/10 text-primary border-primary/30" },
  "processing": { label: "Processing", className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  "completed": { label: "Completed", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30" },
};

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
  status = "in-review",
  fxLocked = false,
  paymentRails = ["SEPA", "Local"],
  processingTime = "2-3 days",
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const statusInfo = statusConfig[status];

  return (
    <Card className="border-border/15 bg-card/20 backdrop-blur-sm shadow-sm">
      <CardContent className="py-4 px-5">
        {/* Header Row - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground">{payPeriod}</h2>
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{employeeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{contractorCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              <span>{currencyCount}</span>
            </div>
          </div>
        </div>

        {/* KPI Grid - 4 cards max */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {/* Gross Pay */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-[11px]">Gross Pay</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(grossPay)}
            </p>
          </div>

          {/* Net Pay */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Receipt className="h-3.5 w-3.5" />
              <span className="text-[11px]">Net Pay</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(netPay)}
            </p>
          </div>

          {/* Fronted Fees */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-[11px]">Fronted Fees</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(frontedFees)}
            </p>
          </div>

          {/* Total Cost */}
          <div className="bg-primary/[0.06] rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-1 text-primary/80 mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[11px]">Total Cost</span>
            </div>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(totalCost)}
            </p>
          </div>
        </div>

        {/* Batch Summary Row - Ultra compact */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border/20">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/70">Rails:</span>
            <span className="font-medium text-foreground">{paymentRails.join(" / ")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{processingTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {fxLocked ? (
              <>
                <Lock className="h-3 w-3 text-accent-green-text" />
                <span className="text-accent-green-text">FX Locked</span>
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" />
                <span>FX Unlocked</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CA3_TopSummary;
