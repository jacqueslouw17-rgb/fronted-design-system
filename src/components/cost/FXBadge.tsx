import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FXBadgeProps {
  spot: number;
  spread?: number;
  effectiveRate: number;
}

export const FXBadge = ({ spot, spread = 0, effectiveRate }: FXBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1.5 cursor-default">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">
              FX: {effectiveRate.toFixed(4)}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <p>Spot Rate: {spot.toFixed(4)}</p>
            <p>Spread: {(spread * 100).toFixed(2)}%</p>
            <p className="font-medium">Effective: {effectiveRate.toFixed(4)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
