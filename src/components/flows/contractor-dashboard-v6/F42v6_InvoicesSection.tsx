/**
 * Flow 4.2 — Contractor Dashboard v6
 * Invoices list section - dense, premium design with view details
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ChevronRight } from "lucide-react";

interface Invoice {
  id: string;
  period: string;
  paidDate: string;
  amount: number;
  status: 'paid' | 'pending';
}

interface F42v6_InvoicesSectionProps {
  currency?: string;
  onDownload?: (invoiceId: string) => void;
  onViewDetails?: (invoiceId: string) => void;
}

export const F42v6_InvoicesSection = ({ 
  currency = "USD",
  onDownload,
  onViewDetails
}: F42v6_InvoicesSectionProps) => {
  const currencySymbol = currency === "USD" ? "$" : "₱";
  
  // Mock data
  const invoices: Invoice[] = [
    { id: "1", period: "November 2025", paidDate: "Dec 5", amount: 5250.00, status: 'paid' },
    { id: "2", period: "October 2025", paidDate: "Nov 5", amount: 5100.00, status: 'paid' },
    { id: "3", period: "September 2025", paidDate: "Oct 5", amount: 5250.00, status: 'paid' },
  ];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm">
      <CardHeader className="px-4 sm:px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pt-0 pb-4">
        <div className="divide-y divide-border/30">
          {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center gap-2 sm:gap-3 py-3 first:pt-0 last:pb-0 group cursor-pointer sm:cursor-default"
                onClick={() => {
                  // On mobile, tap row to view details
                  if (window.innerWidth < 640) onViewDetails?.(invoice.id);
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/[0.06] border border-primary/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary/70" />
                </div>

                {/* Period & Date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{invoice.period}</p>
                  <p className="text-xs text-muted-foreground">Paid {invoice.paidDate}</p>
                </div>

                {/* Amount */}
                <p className="text-sm font-semibold text-foreground tabular-nums flex-shrink-0">
                  {currencySymbol}{formatAmount(invoice.amount)}
                </p>

                {/* Status - hidden on mobile */}
                <Badge 
                  variant="outline" 
                  className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs px-2 py-0.5 flex-shrink-0"
                >
                  Paid
                </Badge>

                {/* Actions - simplified on mobile */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails?.(invoice.id); }}
                    className="hidden sm:flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/[0.06]"
                  >
                    Details
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownload?.(invoice.id); }}
                    className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Download invoice"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {/* Mobile chevron indicator */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 sm:hidden" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
