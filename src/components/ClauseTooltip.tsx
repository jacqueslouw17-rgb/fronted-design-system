import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClauseTooltipProps {
  clauseNumber: string;
  title: string;
  explanation: string;
  whyThisClause?: string;
  children?: React.ReactNode;
  className?: string;
}

export const ClauseTooltip: React.FC<ClauseTooltipProps> = ({
  clauseNumber,
  title,
  explanation,
  whyThisClause,
  children,
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children || (
            <button
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors underline decoration-dotted underline-offset-2",
                className
              )}
            >
              Clause {clauseNumber}
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="max-w-sm p-4 space-y-3 bg-popover border-border"
        >
          <div>
            <div className="flex items-start gap-2 mb-2">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
          </div>
          {whyThisClause && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-foreground mb-1">Why this clause?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{whyThisClause}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
