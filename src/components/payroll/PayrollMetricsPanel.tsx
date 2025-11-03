import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface PayrollMetricsPanelProps {
  payrollIssues: number;
  complianceGaps: number;
  avgResolutionTime: string;
}

export const PayrollMetricsPanel: React.FC<PayrollMetricsPanelProps> = ({
  payrollIssues,
  complianceGaps,
  avgResolutionTime,
}) => {
  const allClear = payrollIssues === 0 && complianceGaps === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-4"
    >
      <Card className={payrollIssues > 0 ? "border-red-500/30" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${payrollIssues > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            <p className="text-xs font-medium text-muted-foreground">Payroll Issues</p>
          </div>
          <p className="text-2xl font-bold">{payrollIssues}</p>
        </CardContent>
      </Card>

      <Card className={complianceGaps > 0 ? "border-yellow-500/30" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className={`h-4 w-4 ${complianceGaps > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
            <p className="text-xs font-medium text-muted-foreground">Compliance Gaps</p>
          </div>
          <p className="text-2xl font-bold">{complianceGaps}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Avg Resolution</p>
          </div>
          <p className="text-2xl font-bold">{avgResolutionTime}</p>
        </CardContent>
      </Card>

      {allClear && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-3"
        >
          <Card className="border-accent-green-outline/30 bg-accent-green-fill/10">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-accent-green-text">
                ✅ All clear! Payroll and compliance healthy.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
