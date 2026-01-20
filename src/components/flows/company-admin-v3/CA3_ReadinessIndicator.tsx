import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
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
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
        <span className="font-medium text-accent-green-text">Ready to submit</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <span className="font-medium text-foreground">
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
