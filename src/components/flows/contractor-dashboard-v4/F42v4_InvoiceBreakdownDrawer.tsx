/**
 * Flow 4.2 — Contractor Dashboard v4
 * Invoice Breakdown Drawer - Premium receipt-style with rejection handling
 * Aligned with F41v4_PayBreakdownDrawer patterns
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Lock, Plus, Clock, X, AlertTriangle, RotateCcw } from 'lucide-react';
import type { F42v4_Adjustment, F42v4_LineItem, F42v4_InvoiceStatus, F42v4_WindowState } from '@/stores/F42v4_DashboardStore';
import { cn } from '@/lib/utils';

interface InvoiceBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: F42v4_LineItem[];
  currency: string;
  invoiceTotal: number;
  periodLabel: string;
  adjustments?: F42v4_Adjustment[];
  invoiceStatus?: F42v4_InvoiceStatus;
  windowState?: F42v4_WindowState;
  resubmittedRejectionIds?: string[];
  onMakeAdjustment?: () => void;
  onWithdrawAdjustment?: (id: string) => void;
  onResubmitAdjustment?: (id: string, category?: string, amount?: string) => void;
  onContactManager?: () => void;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(Math.abs(amount));
};

// Line item row component for consistent styling
const BreakdownRow = ({ 
  label, 
  meta,
  amount, 
  currency, 
  isPositive = true,
  isLocked = false,
  badge,
  isTotal = false,
  onRemove,
  canRemove = false,
}: { 
  label: string;
  meta?: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isLocked?: boolean;
  badge?: { label: string; variant: 'pending' | 'approved' | 'rejected' };
  isTotal?: boolean;
  onRemove?: () => void;
  canRemove?: boolean;
}) => (
  <div className="py-2 -mx-2 px-2 rounded-md">
    <div className={cn(
      "group flex items-center justify-between transition-colors",
      canRemove && "hover:bg-destructive/5 cursor-pointer rounded-md -mx-2 px-2"
    )}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "truncate",
            isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground",
            canRemove && "group-hover:text-destructive/80 transition-colors"
          )}>
            {label}
          </span>
          {meta && (
            <span className={cn(
              "text-xs text-muted-foreground/70 truncate transition-colors",
              canRemove && "group-hover:text-destructive/60"
            )}>
              {meta}
            </span>
          )}
        </div>
        {isLocked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Defined by contract</p>
            </TooltipContent>
          </Tooltip>
        )}
        {badge && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0 shrink-0 transition-opacity",
              badge.variant === 'pending' 
                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                : badge.variant === 'approved'
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
              canRemove && "group-hover:opacity-0"
            )}
          >
            {badge.label}
          </Badge>
        )}
      </div>
      <div className="relative flex items-center justify-end shrink-0 ml-4 min-w-[9rem]">
        <span className={cn(
          "whitespace-nowrap tabular-nums text-right font-mono transition-transform duration-200",
          isTotal ? "text-sm font-semibold" : "text-sm",
          isPositive ? "text-foreground" : "text-muted-foreground",
          canRemove && "group-hover:-translate-x-6"
        )}>
          {isPositive ? '+' : '−'}{formatCurrency(amount, currency)}
        </span>
        {canRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute right-0 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            aria-label="Withdraw request"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

// Inline rejected item row - aligned with list but visually distinct
const RejectedRow = ({
  type,
  label,
  amount,
  currency,
  reason,
  onResubmit,
  onContact,
}: {
  type: string;
  label?: string;
  amount: number;
  currency: string;
  reason: string;
  onResubmit?: () => void;
  onContact?: () => void;
}) => (
  <div className="my-2 py-3 px-3 -mx-2 rounded-lg bg-amber-50/60 dark:bg-amber-500/[0.05] border-l-2 border-amber-400">
    {/* Main row - aligned with other items */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm text-foreground">{type}</span>
        {label && (
          <span className="text-xs text-muted-foreground/70">· {label}</span>
        )}
      </div>
      <div className="shrink-0 ml-4 min-w-[9rem] text-right">
        <span className="text-sm text-muted-foreground/50 line-through tabular-nums font-mono">
          +{formatCurrency(amount, currency)}
        </span>
      </div>
    </div>
    {/* Reason */}
    <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-2 leading-relaxed">
      {reason}
    </p>
    {/* Actions - below reason */}
    <div className="flex items-center gap-3 mt-2.5">
      {onResubmit && (
        <button 
          onClick={onResubmit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Resubmit
        </button>
      )}
      {onContact && (
        <button 
          onClick={onContact}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact manager
        </button>
      )}
    </div>
  </div>
);

export const F42v4_InvoiceBreakdownDrawer = ({
  open,
  onOpenChange,
  lineItems,
  currency,
  invoiceTotal,
  periodLabel,
  adjustments = [],
  invoiceStatus = 'draft',
  windowState = 'OPEN',
  resubmittedRejectionIds = [],
  onMakeAdjustment,
  onWithdrawAdjustment,
  onResubmitAdjustment,
  onContactManager
}: InvoiceBreakdownDrawerProps) => {
  
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  
  // Get all adjustments that should show (approved or pending), excluding resubmitted rejections
  const activeAdjustments = adjustments.filter(
    adj => (adj.status === 'Pending' || adj.status === 'Admin approved') 
  );
  const rejectedAdjustments = adjustments.filter(
    adj => adj.status === 'Admin rejected' && !resubmittedRejectionIds.includes(adj.id)
  );
  
  // Separate by type
  const earningsAdjustments = activeAdjustments.filter(adj => adj.type === 'Expense' || adj.type === 'Bonus');
  const hoursAdjustments = activeAdjustments.filter(adj => adj.type === 'Additional hours');
  const rejectedEarningsAdjustments = rejectedAdjustments.filter(adj => adj.type === 'Expense' || adj.type === 'Bonus');
  const rejectedHoursAdjustments = rejectedAdjustments.filter(adj => adj.type === 'Additional hours');
  
  // Calculate totals (only from active, not rejected)
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const activeAdjustmentTotal = activeAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const hasAdjustments = activeAdjustments.length > 0;
  const hasRejections = rejectedAdjustments.length > 0;
  const adjustedTotal = invoiceTotal + activeAdjustmentTotal;
  
  const canMakeAdjustments = invoiceStatus === 'draft' && onMakeAdjustment;
  const canRemoveAdjustments = invoiceStatus === 'draft' && onWithdrawAdjustment;

  const handleContactManager = () => {
    if (onContactManager) {
      onContactManager();
    } else {
      window.open('mailto:manager@company.com?subject=Question about my invoice');
    }
  };

  // Helper to get badge for adjustment
  // Only show "Pending" if invoice is still in draft/submitted state (not yet approved)
  const isInvoiceApprovedOrLater = invoiceStatus === 'approved' || invoiceStatus === 'finalised';
  
  const getAdjustmentBadge = (adj: F42v4_Adjustment) => {
    // Once invoice is approved, all items are effectively approved - no badge needed
    if (isInvoiceApprovedOrLater) {
      return undefined;
    }
    if (adj.status === 'Pending') {
      return { label: 'Pending', variant: 'pending' as const };
    }
    // Admin approved items don't need a badge - they're finalized
    return undefined;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg font-semibold">Invoice breakdown</SheetTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {periodLabel}
            </Badge>
          </div>
          {/* Minimal rejection notice */}
          {hasRejections && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              {rejectedAdjustments.length} {rejectedAdjustments.length === 1 ? 'item needs' : 'items need'} your attention below
            </p>
          )}
        </SheetHeader>

        {/* Receipt-style breakdown */}
        <div className="px-6 py-5 space-y-6">
          {/* Earnings Section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Earnings
            </h3>
            <div className="space-y-0">
              {earnings.map((item, idx) => (
                <BreakdownRow
                  key={idx}
                  label={item.label}
                  meta={item.meta}
                  amount={item.amount}
                  currency={currency}
                  isLocked={item.locked}
                  isPositive
                />
              ))}
              {/* Active earnings adjustments (pending or approved) */}
              {earningsAdjustments.map((adj) => (
                <BreakdownRow
                  key={adj.id}
                  label={adj.type}
                  meta={adj.label}
                  amount={adj.amount || 0}
                  currency={currency}
                  isPositive
                  badge={getAdjustmentBadge(adj)}
                  canRemove={canRemoveAdjustments && adj.status === 'Pending'}
                  onRemove={() => onWithdrawAdjustment?.(adj.id)}
                />
              ))}
              {/* Rejected earnings adjustments inline */}
              {rejectedEarningsAdjustments.map((adj) => (
                <RejectedRow
                  key={adj.id}
                  type={adj.type}
                  label={adj.label}
                  amount={adj.amount || 0}
                  currency={currency}
                  reason={adj.rejectionReason || 'Please check and resubmit.'}
                  onResubmit={() => onResubmitAdjustment?.(adj.id, adj.category || adj.label, String(adj.amount || ''))}
                  onContact={handleContactManager}
                />
              ))}
              <BreakdownRow
                label="Total earnings"
                amount={totalEarnings + earningsAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0)}
                currency={currency}
                isPositive
                isTotal
              />
            </div>
          </section>

          {/* Additional Hours Section */}
          {(hoursAdjustments.length > 0 || rejectedHoursAdjustments.length > 0) && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Additional hours
              </h3>
              <div className="space-y-0">
                {hoursAdjustments.map((adj) => (
                  <BreakdownRow
                    key={adj.id}
                    label={`${adj.hours}h logged`}
                    amount={adj.amount || 0}
                    currency={currency}
                    isPositive
                    badge={getAdjustmentBadge(adj)}
                    canRemove={canRemoveAdjustments && adj.status === 'Pending'}
                    onRemove={() => onWithdrawAdjustment?.(adj.id)}
                  />
                ))}
                {/* Rejected hours inline */}
                {rejectedHoursAdjustments.map((adj) => (
                  <RejectedRow
                    key={adj.id}
                    type="Additional hours"
                    label={`${adj.hours}h logged`}
                    amount={adj.amount || 0}
                    currency={currency}
                    reason={adj.rejectionReason || 'Please check and resubmit.'}
                    onResubmit={() => onResubmitAdjustment?.(adj.id, adj.category || adj.label, String(adj.amount || ''))}
                    onContact={handleContactManager}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Invoice Total Footer - Sticky feel */}
        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          {/* Main invoice total */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-medium text-foreground">Estimated invoice total</p>
              {hasAdjustments && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Includes {activeAdjustments.filter(a => a.status === 'Pending').length > 0 ? `${activeAdjustments.filter(a => a.status === 'Pending').length} pending` : ''}{activeAdjustments.filter(a => a.status === 'Admin approved').length > 0 ? `${activeAdjustments.filter(a => a.status === 'Pending').length > 0 ? ' + ' : ''}${activeAdjustments.filter(a => a.status === 'Admin approved').length} approved` : ''} {activeAdjustments.length === 1 ? 'adjustment' : 'adjustments'}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
                {formatCurrency(hasAdjustments ? adjustedTotal : invoiceTotal, currency)}
              </p>
              {hasAdjustments && (
                <p className="text-xs text-muted-foreground mt-1 tabular-nums font-mono">
                  Base: {formatCurrency(invoiceTotal, currency)}
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          {canMakeAdjustments && (
            <button
              onClick={() => {
                onMakeAdjustment();
                onOpenChange(false);
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-dashed border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Request a change
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
