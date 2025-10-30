import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PayrollIssue } from "@/hooks/usePayrollSync";

interface PayrollIssueCardProps {
  issue: PayrollIssue;
  onResolve: (issueId: string) => void;
}

const severityConfig = {
  red: {
    color: "border-red-500/30 bg-red-500/5",
    badge: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: AlertTriangle,
    glow: "shadow-lg shadow-red-500/20",
  },
  yellow: {
    color: "border-yellow-500/30 bg-yellow-500/5",
    badge: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    icon: Clock,
    glow: "shadow-lg shadow-yellow-500/20",
  },
  blue: {
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: CheckCircle2,
    glow: "shadow-lg shadow-blue-500/20",
  },
};

export const PayrollIssueCard: React.FC<PayrollIssueCardProps> = ({
  issue,
  onResolve,
}) => {
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "transition-all duration-300",
        !issue.resolved && config.glow
      )}
    >
      <Card className={cn(config.color, "transition-all")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">{issue.contractorName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(issue.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge className={config.badge}>
              {issue.type.replace('_', ' ')}
            </Badge>
          </div>

          <p className="text-sm mb-4">{issue.description}</p>

          {!issue.resolved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(issue.id)}
              className="w-full"
            >
              Mark Resolved
            </Button>
          )}

          {issue.resolved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Resolved</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
