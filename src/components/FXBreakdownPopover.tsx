import { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type FXStatus = "default" | "locked" | "pending" | "error";

interface FXBreakdownData {
  timestamp: string;
  spotRate: {
    from: string;
    to: string;
    rate: number;
    tooltip?: string;
  };
  spread: {
    percentage: number;
    tooltip?: string;
  };
  bankFee: {
    amount: number;
    currency: string;
    tooltip?: string;
  };
  totalRate: {
    rate: number;
    tooltip?: string;
  };
  conversion: {
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
  };
  status?: FXStatus;
  genieHint?: string;
}

interface FXBreakdownPopoverProps {
  children: ReactNode;
  data: FXBreakdownData;
}

const statusConfig = {
  locked: { label: "Locked", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
  error: { label: "Error", variant: "destructive" as const },
  default: { label: "", variant: "outline" as const },
};

const FXBreakdownPopover = ({ children, data }: FXBreakdownPopoverProps) => {
  const status = data.status || "default";
  const statusInfo = statusConfig[status];

  const InfoTooltip = ({ content }: { content?: string }) => {
    if (!content) return null;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0 animate-fade-in" align="start">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm">FX Breakdown</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.timestamp}
              </p>
            </div>
            {status !== "default" && (
              <Badge variant={statusInfo.variant} className="text-xs">
                {statusInfo.label}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Breakdown Table */}
        <div className="p-4 space-y-3">
          {/* Spot Rate */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="text-muted-foreground">Spot Rate</span>
              <InfoTooltip content={data.spotRate.tooltip} />
            </div>
            <span className="font-medium">
              1 {data.spotRate.from} → {data.spotRate.rate} {data.spotRate.to}
            </span>
          </div>

          {/* Spread */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="text-muted-foreground">Spread</span>
              <InfoTooltip content={data.spread.tooltip} />
            </div>
            <span className="font-medium">+{data.spread.percentage}%</span>
          </div>

          {/* Bank Fee */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="text-muted-foreground">Bank Fee</span>
              <InfoTooltip content={data.bankFee.tooltip} />
            </div>
            <span className="font-medium">
              {data.bankFee.currency}
              {data.bankFee.amount.toFixed(2)}
            </span>
          </div>

          <Separator />

          {/* Total Rate Applied */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="text-muted-foreground font-medium">
                Total Rate Applied
              </span>
              <InfoTooltip content={data.totalRate.tooltip} />
            </div>
            <span className="font-semibold">
              {data.totalRate.rate} {data.spotRate.to}/{data.spotRate.from}
            </span>
          </div>

          {/* Converted Amount */}
          <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-lg">
            <span className="text-muted-foreground">Converted Amount</span>
            <div className="text-right">
              <div className="font-semibold">
                {data.conversion.fromCurrency}
                {data.conversion.fromAmount.toLocaleString()} →{" "}
                {data.conversion.toAmount.toLocaleString()}{" "}
                {data.conversion.toCurrency}
              </div>
            </div>
          </div>
        </div>

        {/* Genie Hint */}
        {data.genieHint && (
          <>
            <Separator />
            <div className="p-4 pt-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium mb-1">Genie Insight</p>
                  <p className="text-xs text-muted-foreground">
                    {data.genieHint}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default FXBreakdownPopover;
