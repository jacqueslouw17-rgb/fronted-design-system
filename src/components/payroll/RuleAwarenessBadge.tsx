import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RuleLayer {
  countryMinimum?: string | number;
  companyDefault?: string | number;
  workerOverride?: string | number;
}

interface RuleAwarenessBadgeProps {
  field: string;
  layers: RuleLayer;
  unit?: string; // e.g., "days", "%", "kr"
}

export const RuleAwarenessBadge: React.FC<RuleAwarenessBadgeProps> = ({ field, layers, unit = "" }) => {
  const hasData = layers.countryMinimum !== undefined || layers.companyDefault !== undefined;
  
  if (!hasData) return null;

  const formatValue = (value: string | number | undefined) => {
    if (value === undefined) return undefined;
    return `${value}${unit}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="h-3 w-3 text-primary" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5 text-xs">
            <p className="font-semibold text-foreground mb-2">{field}</p>
            {layers.countryMinimum !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Country minimum:</span>
                <span className="font-medium text-foreground">{formatValue(layers.countryMinimum)}</span>
              </div>
            )}
            {layers.companyDefault !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Company default:</span>
                <span className="font-medium text-foreground">{formatValue(layers.companyDefault)}</span>
              </div>
            )}
            {layers.workerOverride !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Worker override:</span>
                <span className="font-medium text-primary">{formatValue(layers.workerOverride)}</span>
              </div>
            )}
            {layers.workerOverride === undefined && layers.companyDefault !== undefined && (
              <p className="text-xs text-muted-foreground italic mt-2">No worker-specific override</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
