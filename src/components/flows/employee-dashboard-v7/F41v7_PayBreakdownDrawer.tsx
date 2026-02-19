/**
 * Flow 4.1 — Employee Dashboard v6
 * Pay Breakdown Drawer - Read-only historical breakdown for last payment
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v5 or any other flow.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    minimumFractionDigits: 2
  }).format(Math.abs(amount));
};

const BreakdownRow = ({ 
  label, 
  amount, 
  currency, 
  isPositive = true,
  sublabel,
  isTotal = false,
}: { 
  label: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  sublabel?: string;
  isTotal?: boolean;
}) => (
  <div className="py-2 -mx-2 px-2 rounded-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={cn(
          "truncate",
          isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"
        )}>
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-muted-foreground/70 truncate">
            · {sublabel}
          </span>
        )}
      </div>
      <div className="relative flex items-center justify-end shrink-0 ml-4 min-w-[9rem]">
        <span className={cn(
          "whitespace-nowrap tabular-nums text-right font-mono",
          isTotal ? "text-sm font-semibold" : "text-sm",
          isPositive ? "text-foreground" : "text-muted-foreground"
        )}>
          {isPositive ? '' : '−'}{formatCurrency(amount, currency)}
        </span>
      </div>
      {isTotal && <div className="border-t border-dashed border-border/50 absolute left-0 right-0 top-0" />}
    </div>
  </div>
);

export const F41v7_PayBreakdownDrawer = ({
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

  const handleDownload = () => {
    toast.success('Downloading payslip...');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
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

          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Deductions
            </h3>
            <div className="space-y-0">
              {deductions.map((item, idx) => (
                <BreakdownRow
                  key={idx}
                  label={item.label}
                  amount={Math.abs(item.amount)}
                  currency={currency}
                  isPositive={false}
                />
              ))}
              <BreakdownRow
                label="Total deductions"
                amount={totalDeductions}
                currency={currency}
                isPositive={false}
                isTotal
              />
            </div>
          </section>
        </div>

        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Net pay</p>
              <p className="text-xs text-muted-foreground mt-0.5">Paid on Dec 31, 2025</p>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
              {formatCurrency(estimatedNet, currency)}
            </p>
          </div>
          <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <Download className="h-4 w-4" />
            Download payslip
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
