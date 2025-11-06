import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";

interface PayrollBatchPreviewCardProps {
  month: string;
  countrySplit: { code: string, count: number }[];
  totalPayout: number;
  fxVariance: number;
  onReviewFX?: () => void;
  onSendForApproval?: () => void;
}

export const PayrollBatchPreviewCard: React.FC<PayrollBatchPreviewCardProps> = ({
  month,
  countrySplit,
  totalPayout,
  fxVariance,
  onReviewFX,
  onSendForApproval,
}) => {
  const countryFlags: Record<string, string> = {
    NO: "🇳🇴",
    PH: "🇵🇭",
    US: "🇺🇸",
    GB: "🇬🇧",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-3"
    >
      <Card className="p-4 border-primary/40 bg-primary/5 shadow-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-primary/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">💸 Payroll Batch: {month}</h3>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Country Split:</p>
              <p className="text-sm font-medium text-foreground">
                {countrySplit.map((c, i) => (
                  <span key={c.code}>
                    {countryFlags[c.code] || "🌍"} {c.code} ({c.count})
                    {i < countrySplit.length - 1 ? " | " : ""}
                  </span>
                ))}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Payout:</p>
              <p className="text-xl font-bold text-foreground">
                ${totalPayout.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Estimated FX Variance:</p>
              <p className="text-sm font-medium text-success flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +{fxVariance}%
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="pt-3 border-t border-primary/20">
            <p className="text-xs text-muted-foreground mb-3">
              Next Step: Review FX Rates or Send for CFO Approval
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onReviewFX}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                🔍 Review FX
              </Button>
              <Button
                onClick={onSendForApproval}
                variant="default"
                size="sm"
                className="flex-1 gap-2"
              >
                📤 Send for Approval
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
