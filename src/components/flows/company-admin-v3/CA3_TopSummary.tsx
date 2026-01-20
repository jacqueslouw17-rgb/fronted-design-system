import React from "react";
import { Users, Briefcase, Globe } from "lucide-react";
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
  "ready": { label: "Ready", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
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
    <div className="space-y-4">
      {/* Header Row - Full width with counts on right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">{payPeriod}</h2>
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium", statusInfo.className)}>
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">{employeeCount}</span>
            <span>Employees</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            <span className="font-medium text-foreground">{contractorCount}</span>
            <span>Contractors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            <span className="font-medium text-foreground">{currencyCount}</span>
            <span>Currencies</span>
          </div>
        </div>
      </div>

      {/* KPI Row - Horizontal batch summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Gross Pay */}
        <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-5 border border-border/10">
          <p className="text-xs text-muted-foreground mb-1.5">Gross Pay</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{formatCurrency(grossPay)}</p>
        </div>

        {/* Net Pay */}
        <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-5 border border-border/10">
          <p className="text-xs text-muted-foreground mb-1.5">Net Pay</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{formatCurrency(netPay)}</p>
        </div>

        {/* Fronted Fees */}
        <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-5 border border-border/10">
          <p className="text-xs text-muted-foreground mb-1.5">Fronted Fees</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{formatCurrency(frontedFees)}</p>
        </div>

        {/* Total Cost - highlighted */}
        <div className="bg-primary/[0.05] backdrop-blur-sm rounded-xl p-5 border border-primary/10">
          <p className="text-xs text-primary/70 mb-1.5">Total Cost</p>
          <p className="text-2xl font-semibold text-primary tracking-tight">{formatCurrency(totalCost)}</p>
        </div>
      </div>
    </div>
  );
};

export default CA3_TopSummary;
