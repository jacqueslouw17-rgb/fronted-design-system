/**
 * Flow 4.2 — Contractor Dashboard v4
 * Previous Invoices History Drawer (right-side panel)
 * 
 * ISOLATED: Complete copy from v3 - changes here do NOT affect v3.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  period: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'processing' | 'pending';
}

interface F42v4_InvoiceHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock invoices data - can be replaced with real data later
const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    period: 'Nov 1 – Nov 30, 2025',
    invoiceDate: 'Dec 5, 2025',
    amount: 4500.00,
    currency: 'USD',
    status: 'paid',
  },
  {
    id: 'inv-002',
    period: 'Oct 1 – Oct 31, 2025',
    invoiceDate: 'Nov 5, 2025',
    amount: 4200.00,
    currency: 'USD',
    status: 'paid',
  },
  {
    id: 'inv-003',
    period: 'Sep 1 – Sep 30, 2025',
    invoiceDate: 'Oct 5, 2025',
    amount: 4650.00,
    currency: 'USD',
    status: 'paid',
  },
];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

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

export const F42v4_InvoiceHistoryDrawer = ({
  open,
  onOpenChange,
}: F42v4_InvoiceHistoryDrawerProps) => {
  const handleDownload = (invoice: Invoice) => {
    toast.success(`Downloading invoice for ${invoice.period}...`);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
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
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
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
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => handleDownload(invoice)}
                      aria-label={`Download invoice for ${invoice.period}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
