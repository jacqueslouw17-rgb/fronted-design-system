import React from "react";
import { Users, Briefcase, Globe, Clock, Lock, Unlock } from "lucide-react";
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
  "in-review": { label: "In Review", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "checks-pending": { label: "Checks Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "ready": { label: "Ready to Submit", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  "submitted": { label: "Submitted", className: "bg-primary/10 text-primary border-primary/20" },
  "processing": { label: "Processing", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "completed": { label: "Completed", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
};

export const CA3_TopSummary: React.FC<CA3_TopSummaryProps> = ({
  payPeriod,
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
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">{payPeriod}</h2>
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium", statusInfo.className)}>
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{employeeCount} EE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{contractorCount} C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>{currencyCount} currencies</span>
          </div>
        </div>
      </div>

      {/* KPI Row - 4 cards in a row */}
      <div className="grid grid-cols-4 gap-3">
        {/* Gross Pay */}
        <div className="bg-card rounded-xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] text-muted-foreground mb-1">Gross Pay</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(grossPay)}</p>
        </div>

        {/* Net Pay */}
        <div className="bg-card rounded-xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] text-muted-foreground mb-1">Net Pay</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(netPay)}</p>
        </div>

        {/* Fronted Fees */}
        <div className="bg-card rounded-xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] text-muted-foreground mb-1">Fronted Fees</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(frontedFees)}</p>
        </div>

        {/* Total Cost - highlighted */}
        <div className="bg-primary/[0.04] rounded-xl p-4 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] text-primary/70 mb-1">Total Cost</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Batch meta row - ultra compact */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60">Rails:</span>
          <span className="font-medium text-foreground/80">{paymentRails.join(" / ")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{processingTime}</span>
        </div>
        <div className="flex items-center gap-1">
          {fxLocked ? (
            <>
              <Lock className="h-3 w-3 text-accent-green-text" />
              <span className="text-accent-green-text font-medium">FX Locked</span>
            </>
          ) : (
            <>
              <Unlock className="h-3 w-3" />
              <span>FX Unlocked</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CA3_TopSummary;
