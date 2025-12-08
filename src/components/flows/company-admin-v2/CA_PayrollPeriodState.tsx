import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BatchStep } from "./CA_BatchProgressPills";

export type PayrollPeriodType = "previous" | "current" | "next";

interface CA_PayrollPeriodStateProps {
  period: PayrollPeriodType;
  periodLabel: string;
  batchActive: boolean;
  batchStep?: BatchStep;
  batchStatus?: "draft" | "in_review" | "client_approved" | "processing" | "paid";
  onPeriodChange: (period: PayrollPeriodType) => void;
}

export const CA_PayrollPeriodState: React.FC<CA_PayrollPeriodStateProps> = ({
  period,
  periodLabel,
  batchActive,
  batchStep,
  batchStatus,
  onPeriodChange,
}) => {
  const getStatusLabel = () => {
    if (period === "previous") return "Completed";
    if (period === "next") return "Upcoming";
    if (batchActive) {
      switch (batchStatus) {
        case "draft": return "Draft";
        case "in_review": return "In Batch";
        case "client_approved": return "Approved";
        case "processing": return "Processing";
        case "paid": return "Paid";
        default: return "In Review";
      }
    }
    return "In Review";
  };

  const getStatusColor = () => {
    if (period === "previous") return "bg-muted text-muted-foreground";
    if (period === "next") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    if (batchActive) {
      switch (batchStatus) {
        case "client_approved": return "bg-green-500/10 text-green-600 border-green-500/30";
        case "processing": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
        case "paid": return "bg-primary/10 text-primary border-primary/30";
        default: return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      }
    }
    return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge className={cn("text-xs", getStatusColor())}>
          {getStatusLabel()}
        </Badge>
        <span className="text-sm font-medium text-foreground">{periodLabel}</span>
      </div>
    </div>
  );
};
