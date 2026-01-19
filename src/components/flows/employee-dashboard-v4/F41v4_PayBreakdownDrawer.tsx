/**
 * Flow 4.1 — Employee Dashboard v4
 * Pay Breakdown Drawer - shows earnings and deductions in a clean side drawer
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LineItem {
  label: string;
  amount: number;
  type: 'Earnings' | 'Deduction';
  locked?: boolean;
}

interface PayBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: LineItem[];
  currency: string;
  estimatedNet: number;
  periodLabel: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const F41v4_PayBreakdownDrawer = ({
  open,
  onOpenChange,
  lineItems,
  currency,
  estimatedNet,
  periodLabel,
}: PayBreakdownDrawerProps) => {
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const deductions = lineItems.filter(item => item.type === 'Deduction');
  
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {periodLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Earnings Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Earnings
              </h3>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </span>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/20 divide-y divide-border/30">
              {earnings.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-3 px-4"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm text-foreground truncate">{item.label}</span>
                    {item.locked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set by your company</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-sm font-medium text-accent-green-text tabular-nums text-right min-w-[100px]">
                    +{formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
              {/* Subtotal */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
                <span className="text-sm font-medium text-foreground">Total earnings</span>
                <span className="text-sm font-semibold text-accent-green-text tabular-nums text-right min-w-[100px]">
                  {formatCurrency(totalEarnings, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Deductions
              </h3>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </span>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/20 divide-y divide-border/30">
              {deductions.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-3 px-4"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm text-foreground truncate">{item.label}</span>
                    {item.locked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set by your company</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-sm font-medium text-destructive tabular-nums text-right min-w-[100px]">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
              {/* Subtotal */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
                <span className="text-sm font-medium text-foreground">Total deductions</span>
                <span className="text-sm font-semibold text-destructive tabular-nums text-right min-w-[100px]">
                  -{formatCurrency(totalDeductions, currency)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Pay Summary */}
          <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border border-border/40">
            <span className="text-sm font-medium text-foreground">Estimated net pay</span>
            <span className="text-xl font-bold text-foreground tabular-nums">
              {formatCurrency(estimatedNet, currency)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This is an estimate. Final pay may vary based on adjustments and approvals.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
