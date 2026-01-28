/**
 * Flow 4.1 — Employee Dashboard v6
 * Payslips list section
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";

interface Payslip {
  id: string;
  periodStart: string;
  periodEnd: string;
  paidDate: string;
  amount: number;
  status: 'paid' | 'pending';
}

interface F41v6_PayslipsSectionProps {
  currency?: string;
  onDownload?: (payslipId: string) => void;
  onDownloadAll?: () => void;
}

export const F41v6_PayslipsSection = ({ 
  currency = "PHP",
  onDownload,
  onDownloadAll
}: F41v6_PayslipsSectionProps) => {
  const currencySymbol = currency === "PHP" ? "₱" : "$";
  
  // Mock data
  const payslips: Payslip[] = [
    {
      id: "1",
      periodStart: "Nov 1",
      periodEnd: "Nov 30, 2025",
      paidDate: "Dec 5, 2025",
      amount: 42166.67,
      status: 'paid'
    },
    {
      id: "2",
      periodStart: "Oct 1",
      periodEnd: "Oct 31, 2025",
      paidDate: "Nov 5, 2025",
      amount: 41500.00,
      status: 'paid'
    },
    {
      id: "3",
      periodStart: "Sep 1",
      periodEnd: "Sep 30, 2025",
      paidDate: "Oct 5, 2025",
      amount: 42166.67,
      status: 'paid'
    }
  ];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Payslips</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownloadAll}
            className="text-sm"
          >
            Download all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {payslips.map((payslip) => (
          <div
            key={payslip.id}
            className="bg-background rounded-xl p-4 border border-border/30 flex items-center gap-4 hover:bg-muted/30 transition-colors"
          >
            {/* Document Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Period Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {payslip.periodStart} – {payslip.periodEnd}
              </p>
              <p className="text-sm text-muted-foreground">
                Paid on {payslip.paidDate}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {currencySymbol}{formatAmount(payslip.amount)}
              </p>
            </div>

            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 flex-shrink-0"
            >
              Paid
            </Badge>

            {/* Download Button */}
            <button
              onClick={() => onDownload?.(payslip.id)}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Download payslip"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
