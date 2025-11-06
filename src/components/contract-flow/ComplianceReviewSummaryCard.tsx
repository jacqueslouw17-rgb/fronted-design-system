import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, BarChart3, CheckCircle2 } from "lucide-react";

interface ComplianceReviewSummaryCardProps {
  totalBundles: number;
  issuesFound: number;
  issuesResolved: number;
  reviewedBy?: string;
  onDownloadReport?: () => void;
  onViewDashboard?: () => void;
}

export const ComplianceReviewSummaryCard: React.FC<ComplianceReviewSummaryCardProps> = ({
  totalBundles,
  issuesFound,
  issuesResolved,
  reviewedBy = "You",
  onDownloadReport,
  onViewDashboard,
}) => {
  const slaMet = issuesResolved === issuesFound ? 100 : Math.round((issuesResolved / issuesFound) * 100);
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-3"
    >
      <Card className="p-4 border-success/40 bg-success/5 shadow-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-success/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
              <span className="text-lg">🧾</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Compliance Review Summary</h3>
              <p className="text-xs text-muted-foreground">
                {currentDate} · Reviewed by: {reviewedBy}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Bundles Reviewed</p>
              <p className="text-2xl font-bold text-foreground">{totalBundles}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Issues Found</p>
              <p className="text-2xl font-bold text-warning">{issuesFound}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Issues Resolved</p>
              <p className="text-2xl font-bold text-success">{issuesResolved}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">SLA Met</p>
              <p className="text-2xl font-bold text-success flex items-center gap-1">
                {slaMet}%
                {slaMet === 100 && <CheckCircle2 className="h-5 w-5" />}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-success/20">
            <Button
              onClick={onDownloadReport}
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download Audit Report
            </Button>
            <Button
              onClick={onViewDashboard}
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View in Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
