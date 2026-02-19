/**
 * Flow 4.1 — Employee Dashboard v6
 * Previous Payslips History Drawer (right-side panel)
 * Now with detail view when clicking a payslip
 * INDEPENDENT from v5 and all other flows.
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PayslipLineItem {
  label: string;
  amount: number;
  type: 'Earnings' | 'Deduction';
}

interface Payslip {
  id: string;
  period: string;
  payDate: string;
  netPay: number;
  currency: string;
  status: 'available' | 'processing';
  // Detailed breakdown data
  lineItems?: PayslipLineItem[];
  overtimeHours?: number;
  overtimeAmount?: number;
}

interface F41v7_PayslipHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock payslips data with breakdown details
const mockPayslips: Payslip[] = [
  {
    id: 'ps-001',
    period: 'Nov 1 – Nov 30, 2025',
    payDate: 'Dec 5, 2025',
    netPay: 42166.67,
    currency: 'PHP',
    status: 'available',
    lineItems: [
      { label: 'Base Salary', amount: 50000, type: 'Earnings' },
      { label: 'Housing Allowance', amount: 5000, type: 'Earnings' },
      { label: 'SSS', amount: 1125, type: 'Deduction' },
      { label: 'PhilHealth', amount: 900, type: 'Deduction' },
      { label: 'Pag-IBIG', amount: 100, type: 'Deduction' },
      { label: 'Withholding Tax', amount: 10708.33, type: 'Deduction' },
    ],
    overtimeHours: 0,
    overtimeAmount: 0,
  },
  {
    id: 'ps-002',
    period: 'Oct 1 – Oct 31, 2025',
    payDate: 'Nov 5, 2025',
    netPay: 41500.00,
    currency: 'PHP',
    status: 'available',
    lineItems: [
      { label: 'Base Salary', amount: 50000, type: 'Earnings' },
      { label: 'Housing Allowance', amount: 5000, type: 'Earnings' },
      { label: 'SSS', amount: 1125, type: 'Deduction' },
      { label: 'PhilHealth', amount: 900, type: 'Deduction' },
      { label: 'Pag-IBIG', amount: 100, type: 'Deduction' },
      { label: 'Withholding Tax', amount: 11375, type: 'Deduction' },
    ],
    overtimeHours: 0,
    overtimeAmount: 0,
  },
  {
    id: 'ps-003',
    period: 'Sep 1 – Sep 30, 2025',
    payDate: 'Oct 5, 2025',
    netPay: 42166.67,
    currency: 'PHP',
    status: 'available',
    lineItems: [
      { label: 'Base Salary', amount: 50000, type: 'Earnings' },
      { label: 'Housing Allowance', amount: 5000, type: 'Earnings' },
      { label: 'Performance Bonus', amount: 3000, type: 'Earnings' },
      { label: 'SSS', amount: 1125, type: 'Deduction' },
      { label: 'PhilHealth', amount: 900, type: 'Deduction' },
      { label: 'Pag-IBIG', amount: 100, type: 'Deduction' },
      { label: 'Withholding Tax', amount: 13708.33, type: 'Deduction' },
    ],
    overtimeHours: 4,
    overtimeAmount: 1500,
  },
];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

// Breakdown row component matching the main breakdown drawer style
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
      <div className="flex items-center justify-end shrink-0 ml-4 min-w-[9rem]">
        <span className={cn(
          "whitespace-nowrap tabular-nums text-right font-mono",
          isTotal ? "text-sm font-semibold" : "text-sm",
          isPositive ? "text-foreground" : "text-muted-foreground"
        )}>
          {isPositive ? '' : '−'}{formatCurrency(amount, currency)}
        </span>
      </div>
    </div>
  </div>
);

export const F41v7_PayslipHistoryDrawer = ({
  open,
  onOpenChange,
}: F41v7_PayslipHistoryDrawerProps) => {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const handleDownload = (payslip: Payslip, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toast.success(`Downloading payslip for ${payslip.period}...`);
  };

  const handleClose = () => {
    setSelectedPayslip(null);
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedPayslip(null);
  };

  const handleSelectPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
  };

  // Reset selection when drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedPayslip(null);
    }
    onOpenChange(isOpen);
  };

  // Detail View
  if (selectedPayslip) {
    const earnings = selectedPayslip.lineItems?.filter(item => item.type === 'Earnings') || [];
    const deductions = selectedPayslip.lineItems?.filter(item => item.type === 'Deduction') || [];
    const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0) + (selectedPayslip.overtimeAmount || 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
          {/* Header with back button */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label="Back to payslips list"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {selectedPayslip.period}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Receipt-style breakdown */}
          <div className="px-6 py-5 space-y-6">
            {/* Earnings Section */}
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
                    currency={selectedPayslip.currency}
                    isPositive
                  />
                ))}
                <BreakdownRow
                  label="Total earnings"
                  amount={totalEarnings}
                  currency={selectedPayslip.currency}
                  isPositive
                  isTotal
                />
              </div>
            </section>

            {/* Deductions Section */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Deductions
              </h3>
              <div className="space-y-0">
                {deductions.map((item, idx) => (
                  <BreakdownRow
                    key={idx}
                    label={item.label}
                    amount={item.amount}
                    currency={selectedPayslip.currency}
                    isPositive={false}
                  />
                ))}
                <BreakdownRow
                  label="Total deductions"
                  amount={totalDeductions}
                  currency={selectedPayslip.currency}
                  isPositive={false}
                  isTotal
                />
              </div>
            </section>

            {/* Overtime Section */}
            {selectedPayslip.overtimeHours && selectedPayslip.overtimeHours > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Overtime
                </h3>
                <div className="space-y-0">
                  <BreakdownRow
                    label={`${selectedPayslip.overtimeHours}h logged`}
                    amount={selectedPayslip.overtimeAmount || 0}
                    currency={selectedPayslip.currency}
                    isPositive
                  />
                </div>
              </section>
            )}
          </div>

          {/* Net Pay Footer */}
          <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Net pay</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paid on {selectedPayslip.payDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
                  {formatCurrency(selectedPayslip.netPay, selectedPayslip.currency)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => handleDownload(selectedPayslip)}
            >
              <Download className="h-4 w-4" />
              Download payslip
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // List View
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40">
          <SheetTitle>Previous payslips</SheetTitle>
          <SheetDescription>
            View and download your past payslips.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          {mockPayslips.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base font-medium text-foreground mb-2">
                No payslips yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                You don't have any payslips yet. Once your first payroll is processed,
                you'll see them here.
              </p>
            </div>
          ) : (
            /* Payslips list */
            <div className="space-y-3">
              {mockPayslips.map((payslip) => (
                <div
                  key={payslip.id}
                  onClick={() => handleSelectPayslip(payslip)}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {payslip.period}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Paid on {payslip.payDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        {formatCurrency(payslip.netPay, payslip.currency)}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                      >
                        Paid
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            Payslips are available for download within 12 months.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
