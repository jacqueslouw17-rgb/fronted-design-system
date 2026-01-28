/**
 * Flow 4.1 — Employee Dashboard v6
 * Adjustment Detail Modal (read-only view)
 * INDEPENDENT from v5 and all other flows.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { type F41v6_Adjustment } from '@/stores/F41v6_DashboardStore';
import { FileText, Clock, AlertTriangle } from 'lucide-react';

interface F41v6_AdjustmentDetailModalProps {
  adjustment: F41v6_Adjustment | null;
  onClose: () => void;
  currency: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: F41v6_Adjustment['status']) => {
  switch (status) {
    case 'Pending':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
    case 'Admin approved':
      return <Badge className="bg-accent-green/20 text-accent-green-text border-accent-green/30">Admin approved</Badge>;
    case 'Admin rejected':
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Admin rejected</Badge>;
    case 'Queued for next cycle':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Queued for next cycle</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const F41v6_AdjustmentDetailModal = ({ adjustment, onClose, currency }: F41v6_AdjustmentDetailModalProps) => {
  if (!adjustment) return null;

  const isImage = adjustment.receiptUrl?.match(/\.(jpg|jpeg|png)$/i);
  const isRejected = adjustment.status === 'Admin rejected';

  return (
    <Dialog open={!!adjustment} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{adjustment.type} Request</span>
            {getStatusBadge(adjustment.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rejection Reason Notice */}
          {isRejected && adjustment.rejectionReason && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 dark:bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-destructive">Rejected by admin</p>
                <p className="text-sm text-destructive/80 dark:text-destructive/90">{adjustment.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Amount */}
          {adjustment.amount !== null && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(adjustment.amount, currency)}</p>
            </div>
          )}

          {/* Hours (for Overtime) */}
          {adjustment.hours && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Hours</p>
              <p className="text-lg font-semibold">{adjustment.hours}h</p>
            </div>
          )}

          {/* Category (for Expense) */}
          {adjustment.category && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
              <p className="text-foreground">{adjustment.category}</p>
            </div>
          )}

          {/* Description */}
          {adjustment.description && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Description</p>
              <p className="text-foreground text-sm">{adjustment.description}</p>
            </div>
          )}

          {/* Receipt */}
          {adjustment.receiptUrl && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Receipt</p>
              {isImage ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={adjustment.receiptUrl} 
                    alt="Receipt" 
                    className="w-full max-h-48 object-cover"
                  />
                </div>
              ) : (
                <a 
                  href={adjustment.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">View PDF receipt</span>
                </a>
              )}
            </div>
          )}

          {/* Submitted At */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
            <Clock className="h-4 w-4" />
            <span>Submitted {formatDate(adjustment.submittedAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
