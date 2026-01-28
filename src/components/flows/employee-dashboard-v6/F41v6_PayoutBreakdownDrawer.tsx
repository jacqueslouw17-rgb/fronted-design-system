/**
 * Flow 4.1 — Employee Dashboard v6
 * Payout breakdown drawer showing earnings, deductions, and net pay
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface F41v6_PayoutBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: string;
}

export const F41v6_PayoutBreakdownDrawer = ({
  open,
  onOpenChange,
  currency = "PHP"
}: F41v6_PayoutBreakdownDrawerProps) => {
  const currencySymbol = currency === "PHP" ? "₱" : "$";

  const earnings = [
    { label: "Base Salary", amount: 50000 },
    { label: "Overtime (8 hrs)", amount: 2500 },
    { label: "Performance Bonus", amount: 5000 },
  ];

  const deductions = [
    { label: "SSS Contribution", amount: 1125 },
    { label: "PhilHealth", amount: 500 },
    { label: "Pag-IBIG", amount: 100 },
    { label: "Withholding Tax", amount: 8608.33 },
    { label: "Company Benefits", amount: 5000 },
  ];

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold">What's included</DialogTitle>
            <Badge variant="secondary" className="text-xs">Dec 2025</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Payout breakdown for December 15, 2025</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Earnings Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Earnings</h3>
            <div className="space-y-2">
              {earnings.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-medium tabular-nums">{formatAmount(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-sm font-medium text-foreground">Total Earnings</span>
                <span className="text-sm font-semibold tabular-nums">{formatAmount(totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Deductions</h3>
            <div className="space-y-2">
              {deductions.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-medium tabular-nums text-destructive">-{formatAmount(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-sm font-medium text-foreground">Total Deductions</span>
                <span className="text-sm font-semibold tabular-nums text-destructive">-{formatAmount(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-foreground">Net Pay</span>
              <span className="text-xl font-bold tabular-nums text-foreground">{formatAmount(netPay)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download payslip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
