/**
 * Flow 4.1 — Employee Dashboard v6
 * Payout breakdown side panel showing earnings, deductions, and net pay
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface F41v7_PayoutBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: string;
  period?: string;
  paidDate?: string;
  earnings?: { label: string; amount: number }[];
  deductions?: { label: string; amount: number }[];
  netPay?: number;
}

export const F41v7_PayoutBreakdownDrawer = ({
  open,
  onOpenChange,
  currency = "PHP",
  period = "Dec 2025",
  paidDate = "Dec 15, 2025",
  earnings = [
    { label: "Base Salary", amount: 50000 },
    { label: "Overtime (8 hrs)", amount: 2500 },
    { label: "Performance Bonus", amount: 5000 },
  ],
  deductions = [
    { label: "SSS Contribution", amount: 1125 },
    { label: "PhilHealth", amount: 500 },
    { label: "Pag-IBIG", amount: 100 },
    { label: "Withholding Tax", amount: 8608.33 },
    { label: "Company Benefits", amount: 5000 },
  ],
  netPay,
}: F41v7_PayoutBreakdownDrawerProps) => {
  const currencySymbol = currency === "PHP" ? "₱" : "$";

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const finalNetPay = netPay ?? (totalEarnings - totalDeductions);

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg font-semibold">What's included</SheetTitle>
            <Badge variant="secondary" className="text-xs">{period}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Payout breakdown for {paidDate}</p>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">
          {/* Earnings Section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Earnings</h3>
            <div className="space-y-0">
              {earnings.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium tabular-nums">+{formatAmount(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-sm font-medium text-foreground">Total Earnings</span>
                <span className="text-sm font-semibold tabular-nums">{formatAmount(totalEarnings)}</span>
              </div>
            </div>
          </section>

          {/* Deductions Section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Deductions</h3>
            <div className="space-y-0">
              {deductions.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium tabular-nums text-destructive">−{formatAmount(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-sm font-medium text-foreground">Total Deductions</span>
                <span className="text-sm font-semibold tabular-nums text-destructive">−{formatAmount(totalDeductions)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Net Pay Footer */}
        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Net Pay</p>
              <p className="text-xs text-muted-foreground mt-0.5">Paid on {paidDate}</p>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
              {formatAmount(finalNetPay)}
            </p>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download payslip
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
