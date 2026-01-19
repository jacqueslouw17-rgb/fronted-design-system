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

interface EmployerCost {
  label: string;
  amount: number;
  locked?: boolean;
}

interface PayBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: LineItem[];
  employerCosts: EmployerCost[];
  currency: string;
  estimatedNet: number;
  periodLabel: string;
}
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};
export const F41v4_PayBreakdownDrawer = ({
  open,
  onOpenChange,
  lineItems,
  employerCosts = [],
  currency,
  estimatedNet,
  periodLabel
}: PayBreakdownDrawerProps) => {
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const deductions = lineItems.filter(item => item.type === 'Deduction');
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
  const totalEmployerCosts = employerCosts.reduce((sum, cost) => sum + cost.amount, 0);
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {periodLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Earnings Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Earnings
              </h3>
              
            </div>
            <div className="space-y-2">
              {earnings.map((item, idx) => <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    {item.locked && <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set by your company</p>
                        </TooltipContent>
                      </Tooltip>}
                  </div>
                  <span className="text-sm font-medium text-accent-green-text">
                    +{formatCurrency(item.amount, currency)}
                  </span>
                </div>)}
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Deductions
              </h3>
              <span className="text-sm font-medium text-destructive">
                -{formatCurrency(totalDeductions, currency)}
              </span>
            </div>
            <div className="space-y-2">
              {deductions.map((item, idx) => <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    {item.locked && <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set by your company</p>
                        </TooltipContent>
                      </Tooltip>}
                  </div>
                  <span className="text-sm font-medium text-destructive">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>)}
            </div>
          </div>

          <Separator />

          {/* Net Pay Summary */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gradient-to-br from-primary/[0.05] to-secondary/[0.03] border border-border/30">
            <span className="text-sm font-medium text-foreground">Estimated net pay</span>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(estimatedNet, currency)}
            </span>
          </div>

          {/* Employer Contributions Section */}
          {employerCosts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Employer contributions
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">These are paid by your employer on top of your salary</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(totalEmployerCosts, currency)}
                  </span>
                </div>
                <div className="space-y-2">
                  {employerCosts.map((cost, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{cost.label}</span>
                        {cost.locked && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Lock className="h-3 w-3 text-muted-foreground/60" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Set by country rules</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(cost.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Employer contributions don't affect your take-home pay.
                </p>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground text-center pt-2">
            This is an estimate. Final pay may vary based on adjustments and approvals.
          </p>
        </div>
      </SheetContent>
    </Sheet>;
};