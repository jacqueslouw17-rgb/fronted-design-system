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
    <div className="rounded-xl border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-medium text-foreground">{payPeriod}</h2>
            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-medium", statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{employeeCount}</span>
              <span>employees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{contractorCount}</span>
              <span>contractors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{currencyCount}</span>
              <span>currencies</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row - inline, not oversized */}
      <div className="px-5 py-4 flex items-center gap-6">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground mb-0.5">Gross Pay</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(grossPay)}</p>
        </div>
        <div className="w-px h-8 bg-border/20" />
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground mb-0.5">Net Pay</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(netPay)}</p>
        </div>
        <div className="w-px h-8 bg-border/20" />
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground mb-0.5">Fronted Fees</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(frontedFees)}</p>
        </div>
        <div className="w-px h-8 bg-border/20" />
        <div className="flex-1">
          <p className="text-[10px] text-primary/70 mb-0.5">Total Cost</p>
          <p className="text-lg font-semibold text-primary">{formatCurrency(totalCost)}</p>
        </div>
      </div>
    </div>
  );
};

export default CA3_TopSummary;
