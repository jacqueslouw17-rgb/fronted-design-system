import React from "react";
import { Users, Briefcase, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PayrollStatus = "in-review" | "checks-pending" | "ready" | "submitted" | "processing" | "completed";

interface CA4_TopSummaryProps {
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
  "in-review": { label: "In Review", className: "bg-primary/10 text-primary border-primary/20" },
  "checks-pending": { label: "Checks Pending", className: "bg-accent-amber-fill/10 text-accent-amber-text border-accent-amber-outline/20" },
  "ready": { label: "Ready", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  "submitted": { label: "Submitted", className: "bg-primary/10 text-primary border-primary/20" },
  "processing": { label: "Processing", className: "bg-accent-amber-fill/10 text-accent-amber-text border-accent-amber-outline/20" },
  "completed": { label: "Completed", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
};

export const CA4_TopSummary: React.FC<CA4_TopSummaryProps> = ({
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
      return `€${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(1)}K`;
    }
    return `€${amount.toLocaleString()}`;
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="v7-glass-card rounded-2xl overflow-hidden">
      <div className="border-b border-white/10 py-3 px-3 sm:py-4 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-medium text-foreground">{payPeriod}</h2>
            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-medium v7-glass-badge", statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
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
      <div className="p-3 sm:p-5">
        {/* KPI Cards - individual cards with glass treatment */}
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible pb-1">
          <div className="flex sm:grid sm:grid-cols-4 gap-2 sm:gap-3 w-max sm:w-auto">
          <div className="w-28 sm:w-auto p-2.5 sm:p-4 rounded-xl v7-glass-item">
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1">Gross Pay</p>
            <p className="text-sm sm:text-lg font-semibold text-foreground">≈ {formatCurrency(grossPay)}</p>
          </div>
          <div className="w-28 sm:w-auto p-2.5 sm:p-4 rounded-xl v7-glass-item">
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1">Net Pay</p>
            <p className="text-sm sm:text-lg font-semibold text-foreground">{formatCurrency(netPay)}</p>
          </div>
          <div className="w-28 sm:w-auto p-2.5 sm:p-4 rounded-xl v7-glass-item">
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1">Fronted Fees</p>
            <p className="text-sm sm:text-lg font-semibold text-foreground">{formatCurrency(frontedFees)}</p>
          </div>
          <div className="w-28 sm:w-auto p-2.5 sm:p-4 rounded-xl v7-glass-item border-primary/20">
            <p className="text-[10px] sm:text-[11px] text-primary/70 mb-1">Total Cost</p>
            <p className="text-sm sm:text-lg font-semibold text-primary">{formatCurrency(totalCost)}</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CA4_TopSummary;
