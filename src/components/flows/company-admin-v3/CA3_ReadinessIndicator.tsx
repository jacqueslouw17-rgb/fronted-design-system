import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CA3_ReadinessIndicatorProps {
  blockingCount: number;
  warningCount: number;
  infoCount: number;
  isReady: boolean;
}

export const CA3_ReadinessIndicator: React.FC<CA3_ReadinessIndicatorProps> = ({
  blockingCount,
  warningCount,
  infoCount,
  isReady,
}) => {
  if (isReady) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-green-fill/10 border border-accent-green-outline/30">
        <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
        <span className="text-sm font-medium text-accent-green-text">Ready to submit</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
        {blockingCount > 0 
          ? `${blockingCount} blocking check${blockingCount !== 1 ? 's' : ''} remaining`
          : warningCount > 0 
            ? `${warningCount} warning${warningCount !== 1 ? 's' : ''} to review`
            : `${infoCount} item${infoCount !== 1 ? 's' : ''} to review`
        }
      </span>
    </div>
  );
};

export default CA3_ReadinessIndicator;
