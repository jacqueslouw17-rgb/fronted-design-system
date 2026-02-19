/**
 * Flow 4.2 — Contractor Dashboard v6
 * Adjustment Detail Drawer (read-only view with cancel option, right-side)
 * 
 * INDEPENDENT: Changes here do NOT affect v5 or any other flow.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type F42v6_Adjustment } from '@/stores/F42v6_DashboardStore';
import { FileText, Clock, AlertTriangle } from 'lucide-react';
import { TagChips } from '@/components/flows/shared/TagInput';

interface F42v6_AdjustmentDetailDrawerProps {
  adjustment: F42v6_Adjustment | null;
  onClose: () => void;
  onCancelRequest?: (id: string) => void;
  currency: string;
  isWindowOpen: boolean;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
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

const getStatusBadge = (status: F42v6_Adjustment['status']) => {
  switch (status) {
    case 'Pending':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">Pending</Badge>;
    case 'Admin approved':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30">Admin approved</Badge>;
    case 'Admin rejected':
      return <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30">Admin rejected</Badge>;
    case 'Queued for next cycle':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">Queued for next cycle</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const F42v6_AdjustmentDetailDrawer = ({ 
  adjustment, 
  onClose, 
  onCancelRequest,
  currency,
  isWindowOpen,
}: F42v6_AdjustmentDetailDrawerProps) => {
  if (!adjustment) return null;

  const isImage = adjustment.receiptUrl?.match(/\.(jpg|jpeg|png)$/i);
  const canCancel = adjustment.status === 'Pending' && isWindowOpen && onCancelRequest;
  const isRejected = adjustment.status === 'Admin rejected';

  return (
    <Sheet open={!!adjustment} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto flex flex-col">
        <SheetHeader className="pb-4 border-b border-border/40">
          <SheetTitle className="flex items-center gap-3">
            <span>{adjustment.type} Request</span>
            {getStatusBadge(adjustment.status)}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 py-6 overflow-y-auto">
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

          {/* Hours (for Additional hours) */}
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

          {/* Tags */}
          {adjustment.tags && adjustment.tags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tags</p>
              <TagChips tags={adjustment.tags} max={10} />
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

        {/* Cancel Request Button (only for pending + open window) */}
        {canCancel && (
          <div className="pt-4 border-t border-border/40 mt-auto">
            <Button 
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onCancelRequest(adjustment.id)}
            >
              Cancel request
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
