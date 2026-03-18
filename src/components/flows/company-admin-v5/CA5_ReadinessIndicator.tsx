import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CA4_ReadinessIndicatorProps {
  blockingCount: number;
  warningCount: number;
  infoCount: number;
  isReady: boolean;
}

export const CA4_ReadinessIndicator: React.FC<CA4_ReadinessIndicatorProps> = ({
  blockingCount,
  warningCount,
  isReady,
}) => {
  if (isReady) {
    return (
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-accent-green-text" />
        <span className="text-sm font-medium text-accent-green-text">All checks cleared</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-amber-500" />
      <span className="text-sm text-foreground">
        {blockingCount > 0 
          ? <><span className="font-medium">{blockingCount} blocking</span> check{blockingCount !== 1 ? 's' : ''}</>
          : <><span className="font-medium">{warningCount}</span> warning{warningCount !== 1 ? 's' : ''}</>
        }
      </span>
    </div>
  );
};

export default CA4_ReadinessIndicator;
