/**
 * Flow 4.2 — Contractor Dashboard v4
 * Invoice Breakdown Drawer - shows earnings, adjustments, and submitted requests
 * Matches F41v4_PayBreakdownDrawer patterns
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Lock, Receipt } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { F42v4_Adjustment, F42v4_LineItem } from '@/stores/F42v4_DashboardStore';

interface InvoiceBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: F42v4_LineItem[];
  currency: string;
  invoiceTotal: number;
  periodLabel: string;
  adjustments?: F42v4_Adjustment[];
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Admin approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
    case 'Admin rejected':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    case 'Queued for next cycle':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    case 'Pending':
    default:
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
  }
};

export const F42v4_InvoiceBreakdownDrawer = ({
  open,
  onOpenChange,
  lineItems,
  currency,
  invoiceTotal,
  periodLabel,
  adjustments = []
}: InvoiceBreakdownDrawerProps) => {
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const adjustmentItems = lineItems.filter(item => item.type === 'Adjustment');
  const hasRequests = adjustments.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">Invoice breakdown</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {periodLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Earnings Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Earnings
            </h3>
            <div className="space-y-2">
              {earnings.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{item.label}</span>
                      {item.meta && (
                        <span className="text-xs text-muted-foreground">{item.meta}</span>
                      )}
                    </div>
                    {item.locked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Defined by contract</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-sm font-medium text-accent-green-text tabular-nums">
                    +{formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Adjustments Section (from line items) */}
          {adjustmentItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Adjustments
              </h3>
              <div className="space-y-2">
                {adjustmentItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className={`text-sm font-medium tabular-nums ${item.amount < 0 ? 'text-destructive' : 'text-accent-green-text'}`}>
                      {item.amount < 0 ? '' : '+'}{formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Invoice Total Summary */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gradient-to-br from-primary/[0.05] to-secondary/[0.03] border border-border/30">
            <span className="text-sm font-medium text-foreground">Estimated invoice total</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">
              {formatCurrency(invoiceTotal, currency)}
            </span>
          </div>

          {/* Submitted Adjustments */}
          {hasRequests && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Your requests
                </h3>
                <div className="space-y-2">
                  {adjustments.map((adj) => (
                    <div key={adj.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{adj.type}</span>
                          {adj.hours && (
                            <span className="text-xs text-muted-foreground">+{adj.hours}h</span>
                          )}
                          {adj.category && (
                            <span className="text-xs text-muted-foreground">{adj.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {adj.amount !== null && (
                          <span className="text-sm font-medium tabular-nums">
                            {formatCurrency(adj.amount, currency)}
                          </span>
                        )}
                        <Badge variant="outline" className={getStatusBadgeClass(adj.status)}>
                          {adj.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tax disclaimer */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Note:</span> As a contractor, you are responsible for managing and paying applicable taxes.
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This is an estimate. Final invoice may vary based on adjustments and approvals.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
