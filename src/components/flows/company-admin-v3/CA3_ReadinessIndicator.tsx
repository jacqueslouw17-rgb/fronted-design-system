import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
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
      <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-accent-green-fill/5 border border-accent-green-outline/10">
        <ShieldCheck className="h-5 w-5 text-accent-green-text" />
        <div>
          <p className="text-sm font-medium text-accent-green-text">All checks cleared</p>
          <p className="text-xs text-muted-foreground">Ready to submit batch to Fronted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-muted/10 border border-border/10">
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      <div>
        <p className="text-sm font-medium text-foreground">
          {blockingCount > 0 
            ? `${blockingCount} blocking check${blockingCount !== 1 ? 's' : ''} remaining`
            : warningCount > 0 
              ? `${warningCount} warning${warningCount !== 1 ? 's' : ''} to review`
              : `${infoCount} item${infoCount !== 1 ? 's' : ''} to review`
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {blockingCount > 0 
            ? "Resolve to continue"
            : "Optional to acknowledge"
          }
        </p>
      </div>
    </div>
  );
};

export default CA3_ReadinessIndicator;
