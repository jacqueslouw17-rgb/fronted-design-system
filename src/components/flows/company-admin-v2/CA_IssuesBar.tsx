// Flow 6 v2 - Company Admin Dashboard - Issues Bar (Local to this flow only)

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CA_IssuesBarProps {
  pendingAdjustments: number;
  pendingLeave: number;
  autoApproved: number;
  onResolveClick: () => void;
}

export const CA_IssuesBar: React.FC<CA_IssuesBarProps> = ({
  pendingAdjustments,
  pendingLeave,
  autoApproved,
  onResolveClick
}) => {
  const hasIssues = pendingAdjustments > 0 || pendingLeave > 0;

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 rounded-lg border",
      hasIssues 
        ? "bg-amber-500/5 border-amber-500/20" 
        : "bg-card/30 border-border/30"
    )}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Issues this period:</span>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs pointer-events-none select-none",
              pendingAdjustments > 0 
                ? "bg-destructive/10 text-destructive border-destructive/30" 
                : "bg-muted/30 text-muted-foreground border-border/30"
            )}
          >
            Adjustments · {pendingAdjustments}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs pointer-events-none select-none",
              pendingLeave > 0 
                ? "bg-destructive/10 text-destructive border-destructive/30" 
                : "bg-muted/30 text-muted-foreground border-border/30"
            )}
          >
            Leave · {pendingLeave}
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs pointer-events-none select-none bg-muted/30 text-muted-foreground border-border/30"
          >
            Auto-approved · {autoApproved}
          </Badge>
        </div>
      </div>

      <Button 
        variant="link" 
        size="sm" 
        className="text-xs h-auto p-0 gap-1 text-primary"
        onClick={onResolveClick}
      >
        Resolve
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
