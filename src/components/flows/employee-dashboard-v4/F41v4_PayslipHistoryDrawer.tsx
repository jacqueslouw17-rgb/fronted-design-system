/**
 * Flow 4.1 — Employee Dashboard v4
 * Previous Payslips History Drawer (right-side panel)
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Payslip {
  id: string;
  period: string;
  payDate: string;
  netPay: number;
  currency: string;
  status: 'available' | 'processing';
}

interface F41v4_PayslipHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockPayslips: Payslip[] = [
  { id: 'ps-001', period: 'Nov 1 – Nov 30, 2025', payDate: 'Dec 5, 2025', netPay: 42166.67, currency: 'PHP', status: 'available' },
  { id: 'ps-002', period: 'Oct 1 – Oct 31, 2025', payDate: 'Nov 5, 2025', netPay: 41500.00, currency: 'PHP', status: 'available' },
  { id: 'ps-003', period: 'Sep 1 – Sep 30, 2025', payDate: 'Oct 5, 2025', netPay: 42166.67, currency: 'PHP', status: 'available' },
];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
};

export const F41v4_PayslipHistoryDrawer = ({ open, onOpenChange }: F41v4_PayslipHistoryDrawerProps) => {
  const handleDownload = (payslip: Payslip) => { toast.success(`Downloading payslip for ${payslip.period}...`); };
  const handleClose = () => { onOpenChange(false); };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40">
          <SheetTitle>Previous payslips</SheetTitle>
          <SheetDescription>View and download your past payslips.</SheetDescription>
        </SheetHeader>
        <div className="py-6">
          {mockPayslips.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base font-medium text-foreground mb-2">No payslips yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">You don't have any payslips yet. Once your first payroll is processed, you'll see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockPayslips.map((payslip) => (
                <div key={payslip.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/50"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{payslip.period}</p>
                      <p className="text-xs text-muted-foreground">Paid on {payslip.payDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatCurrency(payslip.netPay, payslip.currency)}</p>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">Paid</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleDownload(payslip)} aria-label={`Download payslip for ${payslip.period}`}><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-border/40"><p className="text-xs text-muted-foreground text-center">Payslips are available for download within 12 months.</p></div>
      </SheetContent>
    </Sheet>
  );
};
