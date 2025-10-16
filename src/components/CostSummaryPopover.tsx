import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CostBreakdown {
  baseSalary: number;
  taxes: number;
  benefits: number;
  platformFee?: number;
  total: number;
  currency: string;
  fxRate?: {
    from: string;
    to: string;
    rate: number;
  };
}

interface CostSummaryPopoverProps {
  costs: CostBreakdown;
  className?: string;
  children?: React.ReactNode;
}

export const CostSummaryPopover: React.FC<CostSummaryPopoverProps> = ({
  costs,
  className,
  children,
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: costs.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <DollarSign className="h-4 w-4" />
            View Cost Breakdown
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-1">Total Employment Cost</h4>
            <p className="text-xs text-muted-foreground">
              Complete breakdown of employer costs
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Base Salary</span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(costs.baseSalary)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taxes & Social Security</span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(costs.taxes)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Benefits & Insurance</span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(costs.benefits)}
              </span>
            </div>
            {costs.platformFee && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Platform Fee</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(costs.platformFee)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Total Cost</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(costs.total)}
            </span>
          </div>

          {costs.fxRate && (
            <>
              <Separator />
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">FX Rate Applied</p>
                  <p className="text-xs text-muted-foreground">
                    {costs.fxRate.from} → {costs.fxRate.to}: {costs.fxRate.rate.toFixed(4)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
