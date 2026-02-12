/**
 * Flow 4.1 — Employee Dashboard v6
 * Payslips list section - dense, premium design with view details
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ChevronRight } from "lucide-react";

interface Payslip {
  id: string;
  period: string;
  paidDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'expired';
}

interface F41v6_PayslipsSectionProps {
  currency?: string;
  onDownload?: (payslipId: string) => void;
  onViewDetails?: (payslipId: string) => void;
}

export const F41v6_PayslipsSection = ({ 
  currency = "PHP",
  onDownload,
  onViewDetails
}: F41v6_PayslipsSectionProps) => {
  const currencySymbol = currency === "PHP" ? "₱" : "$";
  
  // Mock data
  const payslips: Payslip[] = [
    { id: "expired-nov", period: "November 2025", paidDate: "", amount: 41500.00, status: 'expired' },
    { id: "1", period: "November 2025", paidDate: "Dec 5", amount: 42166.67, status: 'paid' },
    { id: "2", period: "October 2025", paidDate: "Nov 5", amount: 41500.00, status: 'paid' },
    { id: "3", period: "September 2025", paidDate: "Oct 5", amount: 42166.67, status: 'paid' },
  ];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm">
      <CardHeader className="px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">Payslips</h2>
      </CardHeader>
      <CardContent className="px-5 pt-0 pb-4">
        <div className="divide-y divide-border/30">
          {payslips.map((payslip) => (
            <div
              key={payslip.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/[0.06] border border-primary/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary/70" />
              </div>

              {/* Period & Date */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{payslip.period}</p>
                <p className="text-xs text-muted-foreground">Paid {payslip.paidDate}</p>
              </div>

              {/* Amount */}
              <p className="text-sm font-semibold text-foreground tabular-nums flex-shrink-0">
                {currencySymbol}{formatAmount(payslip.amount)}
              </p>

              {/* Status */}
              <Badge 
                variant="outline" 
                className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs px-2 py-0.5 flex-shrink-0"
              >
                Paid
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onViewDetails?.(payslip.id)}
                  className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/[0.06]"
                >
                  Details
                  <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDownload?.(payslip.id)}
                  className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Download payslip"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
