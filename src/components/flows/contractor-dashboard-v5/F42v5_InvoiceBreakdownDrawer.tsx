/**
 * Flow 4.2 — Contractor Dashboard v5
 * Invoice Breakdown Drawer - Read-only historical breakdown for last invoice
 * INDEPENDENT: Changes here do NOT affect v4 or any other flow.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { F42v5_LineItem } from '@/stores/F42v5_DashboardStore';
import { cn } from '@/lib/utils';

interface InvoiceBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: F42v5_LineItem[];
  currency: string;
  invoiceTotal: number;
  periodLabel: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(Math.abs(amount));
};

const BreakdownRow = ({ 
  label, 
  meta,
  amount, 
  currency, 
  isPositive = true,
  isTotal = false,
}: { 
  label: string;
  meta?: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isTotal?: boolean;
}) => (
  <div className="py-2 -mx-2 px-2 rounded-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "truncate",
            isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"
          )}>
            {label}
          </span>
          {meta && (
            <span className="text-xs text-muted-foreground/70 truncate">
              {meta}
            </span>
          )}
        </div>
      </div>
      <div className="relative flex items-center justify-end shrink-0 ml-4 min-w-[9rem]">
        <span className={cn(
          "whitespace-nowrap tabular-nums text-right font-mono",
          isTotal ? "text-sm font-semibold" : "text-sm",
          isPositive ? "text-foreground" : "text-muted-foreground"
        )}>
          {isPositive ? '+' : '−'}{formatCurrency(amount, currency)}
        </span>
      </div>
    </div>
  </div>
);

export const F42v5_InvoiceBreakdownDrawer = ({
  open,
  onOpenChange,
  lineItems,
  currency,
  invoiceTotal,
  periodLabel,
}: InvoiceBreakdownDrawerProps) => {
  
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg font-semibold">Invoice breakdown</SheetTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {periodLabel}
            </Badge>
          </div>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Earnings
            </h3>
            <div className="space-y-0">
              {earnings.map((item, idx) => (
                <BreakdownRow
                  key={idx}
                  label={item.label}
                  meta={item.meta}
                  amount={item.amount}
                  currency={currency}
                  isPositive
                />
              ))}
              <BreakdownRow
                label="Total earnings"
                amount={totalEarnings}
                currency={currency}
                isPositive
                isTotal
              />
            </div>
          </section>
        </div>

        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-foreground">Invoice total</p>
            <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
              {formatCurrency(invoiceTotal, currency)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
