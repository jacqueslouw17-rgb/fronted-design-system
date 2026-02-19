/**
 * Flow 4.2 — Contractor Dashboard v5
 * Previous Invoices History Drawer (right-side panel)
 * Now with detail view when clicking an invoice
 * 
 * INDEPENDENT: Changes here do NOT affect v4 or any other flow.
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

interface InvoiceLineItem {
  label: string;
  amount: number;
  meta?: string;
}

interface Invoice {
  id: string;
  period: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'processing' | 'pending';
  // Detailed breakdown data
  lineItems?: InvoiceLineItem[];
  additionalHours?: number;
  additionalHoursAmount?: number;
}

interface F42v5_InvoiceHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock invoices data with breakdown details
const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    period: 'Nov 1 – Nov 30, 2025',
    invoiceDate: 'Dec 5, 2025',
    amount: 4500.00,
    currency: 'USD',
    status: 'paid',
    lineItems: [
      { label: 'Monthly Retainer', amount: 4000, meta: '160 hours @ $25/hr' },
      { label: 'Expense Reimbursement', amount: 500, meta: 'Software licenses' },
    ],
    additionalHours: 0,
    additionalHoursAmount: 0,
  },
  {
    id: 'inv-002',
    period: 'Oct 1 – Oct 31, 2025',
    invoiceDate: 'Nov 5, 2025',
    amount: 4200.00,
    currency: 'USD',
    status: 'paid',
    lineItems: [
      { label: 'Monthly Retainer', amount: 4000, meta: '160 hours @ $25/hr' },
      { label: 'Commission', amount: 200, meta: 'Q3 referral bonus' },
    ],
    additionalHours: 0,
    additionalHoursAmount: 0,
  },
  {
    id: 'inv-003',
    period: 'Sep 1 – Sep 30, 2025',
    invoiceDate: 'Oct 5, 2025',
    amount: 4650.00,
    currency: 'USD',
    status: 'paid',
    lineItems: [
      { label: 'Monthly Retainer', amount: 4000, meta: '160 hours @ $25/hr' },
      { label: 'Expense Reimbursement', amount: 150, meta: 'Travel expenses' },
    ],
    additionalHours: 20,
    additionalHoursAmount: 500,
  },
];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
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
  meta,
  isTotal = false,
}: { 
  label: string;
  amount: number;
  currency: string;
  meta?: string;
  isTotal?: boolean;
}) => (
  <div className="py-2 -mx-2 px-2 rounded-md">
    <div className="flex items-center justify-between">
      <div className="flex flex-col min-w-0 flex-1">
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
      <div className="flex items-center justify-end shrink-0 ml-4 min-w-[9rem]">
        <span className={cn(
          "whitespace-nowrap tabular-nums text-right font-mono",
          isTotal ? "text-sm font-semibold" : "text-sm",
          "text-foreground"
        )}>
          +{formatCurrency(amount, currency)}
        </span>
      </div>
    </div>
  </div>
);

const getStatusBadge = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return (
        <Badge 
          variant="secondary" 
          className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
        >
          Paid
        </Badge>
      );
    case 'processing':
      return (
        <Badge 
          variant="secondary" 
          className="text-[10px] bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
        >
          Processing
        </Badge>
      );
    case 'pending':
      return (
        <Badge 
          variant="secondary" 
          className="text-[10px] bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
        >
          Pending
        </Badge>
      );
  }
};

export const F42v7_InvoiceHistoryDrawer = ({
  open,
  onOpenChange,
}: F42v5_InvoiceHistoryDrawerProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleDownload = (invoice: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toast.success(`Downloading invoice for ${invoice.period}...`);
  };

  const handleBack = () => {
    setSelectedInvoice(null);
  };

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  // Reset selection when drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedInvoice(null);
    }
    onOpenChange(isOpen);
  };

  // Detail View
  if (selectedInvoice) {
    const lineItems = selectedInvoice.lineItems || [];
    const totalEarnings = lineItems.reduce((sum, item) => sum + item.amount, 0) + (selectedInvoice.additionalHoursAmount || 0);

    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
          {/* Header with back button */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label="Back to invoices list"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-semibold">Invoice breakdown</SheetTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {selectedInvoice.period}
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
                {lineItems.map((item, idx) => (
                  <BreakdownRow
                    key={idx}
                    label={item.label}
                    meta={item.meta}
                    amount={item.amount}
                    currency={selectedInvoice.currency}
                  />
                ))}
                <BreakdownRow
                  label="Total earnings"
                  amount={totalEarnings}
                  currency={selectedInvoice.currency}
                  isTotal
                />
              </div>
            </section>

            {/* Additional Hours Section */}
            {selectedInvoice.additionalHours && selectedInvoice.additionalHours > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Additional hours
                </h3>
                <div className="space-y-0">
                  <BreakdownRow
                    label={`${selectedInvoice.additionalHours}h logged`}
                    amount={selectedInvoice.additionalHoursAmount || 0}
                    currency={selectedInvoice.currency}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Invoice Total Footer */}
          <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Invoice total</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paid on {selectedInvoice.invoiceDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => handleDownload(selectedInvoice)}
            >
              <Download className="h-4 w-4" />
              Download invoice
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
          <SheetTitle>Previous invoices</SheetTitle>
          <SheetDescription>
            View and download your past invoices.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          {mockInvoices.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base font-medium text-foreground mb-2">
                No invoices yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                You don't have any invoices yet. Once your first invoice is processed,
                you'll see them here.
              </p>
            </div>
          ) : (
            /* Invoices list */
            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => handleSelectInvoice(invoice)}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {invoice.period}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invoiced on {invoice.invoiceDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>
                      {getStatusBadge(invoice.status)}
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
            Invoices are available for download within 12 months.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
