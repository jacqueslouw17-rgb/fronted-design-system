/**
 * Flow 4.2 — Contractor Dashboard v5
 * Invoice Breakdown Drawer - Premium receipt-style with rejection handling
 * Aligned with F41v5_PayBreakdownDrawer patterns
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, X, AlertTriangle, RotateCcw } from 'lucide-react';
import type { F42v5_Adjustment, F42v5_LineItem, F42v5_InvoiceStatus, F42v5_WindowState } from '@/stores/F42v5_DashboardStore';
import { cn } from '@/lib/utils';

interface InvoiceBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: F42v5_LineItem[];
  currency: string;
  invoiceTotal: number;
  periodLabel: string;
  adjustments?: F42v5_Adjustment[];
  invoiceStatus?: F42v5_InvoiceStatus;
  windowState?: F42v5_WindowState;
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
  <div className={cn(
    "py-2 -mx-2 px-2 rounded-md transition-colors",
    canRemove && "hover:bg-muted/50"
  )}>
    <div className={cn(
      "group flex items-center justify-between transition-colors",
      canRemove && "cursor-pointer"
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
  <div className="py-3 px-3 -mx-2 rounded-lg bg-amber-50/60 dark:bg-amber-500/[0.05] border-l-2 border-amber-400">
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
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Resubmit
        </button>
      )}
      {onContact && (
        <button 
          onClick={onContact}
          className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
        >
          Contact manager
        </button>
      )}
    </div>
  </div>
);

export const F42v5_InvoiceBreakdownDrawer = ({
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
  const isInvoiceApprovedOrLater = invoiceStatus === 'approved' || invoiceStatus === 'finalised';
  const hasPendingAdjustments = activeAdjustments.some(adj => adj.status === 'Pending');
  
  const getAdjustmentBadge = (adj: F42v5_Adjustment) => {
    if (isInvoiceApprovedOrLater && !hasRejections && !hasPendingAdjustments) {
      return undefined;
    }
    if (adj.status === 'Pending') {
      return { label: 'Pending', variant: 'pending' as const };
    }
    if (adj.status === 'Admin approved') {
      return { label: 'Approved', variant: 'approved' as const };
    }
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
              {rejectedEarningsAdjustments.length > 0 && (
                <div className="mt-3 space-y-3">
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
                </div>
              )}
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
                {rejectedHoursAdjustments.length > 0 && (
                  <div className="mt-3 space-y-3">
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
                )}
              </div>
            </section>
          )}
        </div>

        {/* Invoice Total Footer - Sticky feel */}
        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          {/* Main invoice total */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-medium text-foreground">Invoice total</p>
              {hasAdjustments && (() => {
                const pendingCount = activeAdjustments.filter(a => a.status === 'Pending').length;
                const approvedCount = activeAdjustments.filter(a => a.status === 'Admin approved').length;
                const parts: string[] = [];
                if (pendingCount > 0) parts.push(`${pendingCount} pending`);
                if (approvedCount > 0) parts.push(`${approvedCount} approved`);
                const totalCount = pendingCount + approvedCount;
                return (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Includes {parts.join(' + ')} {totalCount === 1 ? 'adjustment' : 'adjustments'}
                  </p>
                );
              })()}
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

          {adjustments && adjustments.length > 0 && (
            <p className="text-[11px] text-muted-foreground/70 text-center mt-4">
              This is an estimate. Final invoice may vary.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
