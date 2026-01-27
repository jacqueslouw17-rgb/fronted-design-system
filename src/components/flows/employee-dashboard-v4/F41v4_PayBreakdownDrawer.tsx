/**
 * Flow 4.1 — Employee Dashboard v4
 * Pay Breakdown Drawer - Premium receipt-style breakdown
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Lock, Plus, Clock, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import type { Adjustment, LeaveRequest, PayrollStatus, WindowState } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';

interface LineItem {
  label: string;
  amount: number;
  type: 'Earnings' | 'Deduction';
  locked?: boolean;
}

interface PayBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: LineItem[];
  currency: string;
  estimatedNet: number;
  periodLabel: string;
  adjustments?: Adjustment[];
  leaveRequests?: LeaveRequest[];
  payrollStatus?: PayrollStatus;
  windowState?: WindowState;
  resubmittedRejectionIds?: string[];
  onMakeAdjustment?: () => void;
  onWithdrawAdjustment?: (id: string) => void;
  onResubmitAdjustment?: (id: string, category?: string, amount?: string) => void;
  onContactManager?: () => void;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(Math.abs(amount));
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.toDateString() === end.toDateString()) {
    return format(start, 'MMM d');
  }
  
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'MMM d')}–${format(end, 'd')}`;
  }
  
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
};

// Line item row component for consistent styling
const BreakdownRow = ({ 
  label, 
  amount, 
  currency, 
  isPositive = true,
  isLocked = false,
  badge,
  sublabel,
  isTotal = false,
  onRemove,
  canRemove = false,
}: { 
  label: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isLocked?: boolean;
  badge?: { label: string; variant: 'pending' | 'approved' | 'rejected' };
  sublabel?: string;
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
        <span className={cn(
          "truncate",
          isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground",
          canRemove && "group-hover:text-destructive/80 transition-colors"
        )}>
          {label}
        </span>
        {sublabel && (
          <span className={cn(
            "text-xs text-muted-foreground/70 truncate transition-colors",
            canRemove && "group-hover:text-destructive/60"
          )}>
            · {sublabel}
          </span>
        )}
        {isLocked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Set by your company</p>
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
          {isPositive ? '' : '−'}{formatCurrency(amount, currency)}
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
      {isTotal && <div className="border-t border-dashed border-border/50 absolute left-0 right-0 top-0" />}
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
          {formatCurrency(amount, currency)}
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

export const F41v4_PayBreakdownDrawer = ({
  open,
  onOpenChange,
  lineItems,
  currency,
  estimatedNet,
  periodLabel,
  adjustments = [],
  leaveRequests = [],
  payrollStatus = 'draft',
  windowState = 'OPEN',
  resubmittedRejectionIds = [],
  onMakeAdjustment,
  onWithdrawAdjustment,
  onResubmitAdjustment,
  onContactManager
}: PayBreakdownDrawerProps) => {
  
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const deductions = lineItems.filter(item => item.type === 'Deduction');
  
  // Get all adjustments that should show (approved or pending), excluding resubmitted rejections
  const activeAdjustments = adjustments.filter(
    adj => (adj.status === 'Pending' || adj.status === 'Admin approved') 
  );
  const rejectedAdjustments = adjustments.filter(
    adj => adj.status === 'Admin rejected' && !resubmittedRejectionIds.includes(adj.id)
  );
  
  // Separate by type
  const overtimeAdjustments = activeAdjustments.filter(adj => adj.type === 'Overtime');
  const otherAdjustments = activeAdjustments.filter(adj => adj.type !== 'Overtime');
  const rejectedOtherAdjustments = rejectedAdjustments.filter(adj => adj.type !== 'Overtime');
  const rejectedOvertimeAdjustments = rejectedAdjustments.filter(adj => adj.type === 'Overtime');
  
  // Calculate totals (only from active, not rejected)
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalOtherAdjustments = otherAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const totalOvertimeAdjustments = overtimeAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
  
  const activeAdjustmentTotal = activeAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const hasAdjustments = activeAdjustments.length > 0;
  const hasRejections = rejectedAdjustments.length > 0;
  const adjustedNet = estimatedNet + activeAdjustmentTotal;
  
  const canMakeAdjustments = payrollStatus === 'draft' && onMakeAdjustment;
  const canRemoveAdjustments = payrollStatus === 'draft' && onWithdrawAdjustment;

  const handleContactManager = () => {
    if (onContactManager) {
      onContactManager();
    } else {
      window.open('mailto:manager@company.com?subject=Question about my pay');
    }
  };

  // Helper to get badge for adjustment
  // Show "Pending" badge when:
  // 1. Item is pending AND payroll is not yet approved (normal flow)
  // 2. Item is pending AND there are rejections (partial rejection scenario - resubmitted items)
  // Hide badges when payroll is approved/finalised AND all items are approved (no pending, no rejections)
  const isPayrollApprovedOrLater = payrollStatus === 'approved' || payrollStatus === 'finalised';
  const hasPendingAdjustments = activeAdjustments.some(adj => adj.status === 'Pending');
  
  const getAdjustmentBadge = (adj: Adjustment) => {
    // If payroll is approved AND no rejections AND no pending items → all finalized, hide badges
    if (isPayrollApprovedOrLater && !hasRejections && !hasPendingAdjustments) {
      return undefined;
    }
    // Show pending badge for pending items
    if (adj.status === 'Pending') {
      return { label: 'Pending', variant: 'pending' as const };
    }
    // Show approved badge for approved items (when there are still pending items or rejections)
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
            <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
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
                  amount={item.amount}
                  currency={currency}
                  isLocked={item.locked}
                  isPositive
                />
              ))}
              {/* Active adjustments (pending or approved) */}
              {otherAdjustments.map((adj) => (
                <BreakdownRow
                  key={adj.id}
                  label={adj.type}
                  sublabel={adj.label}
                  amount={adj.amount || 0}
                  currency={currency}
                  isPositive
                  badge={getAdjustmentBadge(adj)}
                  canRemove={canRemoveAdjustments && adj.status === 'Pending'}
                  onRemove={() => onWithdrawAdjustment?.(adj.id)}
                />
              ))}
              {/* Rejected adjustments inline */}
              {rejectedOtherAdjustments.length > 0 && (
                <div className="mt-3 space-y-3">
                  {rejectedOtherAdjustments.map((adj) => (
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
                amount={totalEarnings + totalOtherAdjustments}
                currency={currency}
                isPositive
                isTotal
              />
            </div>
          </section>

          {/* Deductions Section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Deductions
            </h3>
            <div className="space-y-0">
              {deductions.map((item, idx) => (
                <BreakdownRow
                  key={idx}
                  label={item.label}
                  amount={Math.abs(item.amount)}
                  currency={currency}
                  isLocked={item.locked}
                  isPositive={false}
                />
              ))}
              <BreakdownRow
                label="Total deductions"
                amount={totalDeductions}
                currency={currency}
                isPositive={false}
                isTotal
              />
            </div>
          </section>

          {/* Overtime Section */}
          {(overtimeAdjustments.length > 0 || rejectedOvertimeAdjustments.length > 0) && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Overtime
              </h3>
              <div className="space-y-0">
                {overtimeAdjustments.map((adj) => (
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
                {/* Rejected overtime inline */}
                {rejectedOvertimeAdjustments.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {rejectedOvertimeAdjustments.map((adj) => (
                      <RejectedRow
                        key={adj.id}
                        type="Overtime"
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
                {overtimeAdjustments.length > 1 && (
                  <BreakdownRow
                    label="Total overtime"
                    amount={totalOvertimeAdjustments}
                    currency={currency}
                    isPositive
                    isTotal
                  />
                )}
              </div>
            </section>
          )}
        </div>

        {/* Net Pay Footer - Sticky feel */}
        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          {/* Main net pay */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-medium text-foreground">Estimated net pay</p>
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
                {formatCurrency(hasAdjustments ? adjustedNet : estimatedNet, currency)}
              </p>
              {hasAdjustments && (
                <p className="text-xs text-muted-foreground mt-1 tabular-nums font-mono">
                  Base: {formatCurrency(estimatedNet, currency)}
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
              Request adjustment
            </button>
          )}

          {adjustments && adjustments.length > 0 && (
            <p className="text-[11px] text-muted-foreground/70 text-center mt-4">
              This is an estimate. Final pay may vary.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};