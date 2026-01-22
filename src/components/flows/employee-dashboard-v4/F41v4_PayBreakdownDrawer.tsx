/**
 * Flow 4.1 — Employee Dashboard v4
 * Pay Breakdown Drawer - Premium receipt-style breakdown
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Plus, Clock, X, AlertTriangle, MessageSquare, RotateCcw, Info } from 'lucide-react';
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
  onResubmitAdjustment?: (id: string, category?: string) => void;
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
  isRejected = false,
  className
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
  isRejected?: boolean;
  className?: string;
}) => (
  <div className={cn(
    "group flex items-center justify-between py-2 -mx-2 px-2 rounded-md transition-colors",
    canRemove && "hover:bg-destructive/5 cursor-pointer",
    isTotal && "pt-3 mt-1 border-t border-dashed border-border/50 mx-0 px-0 hover:bg-transparent",
    isRejected && "opacity-60",
    className
  )}>
    <div className="flex items-center gap-2 min-w-0 flex-1">
      {isRejected && (
        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
      )}
      <span className={cn(
        "truncate",
        isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground",
        canRemove && "group-hover:text-destructive/80 transition-colors",
        isRejected && "line-through"
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
        canRemove && "group-hover:-translate-x-6",
        isRejected && "line-through"
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
  </div>
);

// Rejected item card with context and actions
const RejectedItemCard = ({
  type,
  label,
  amount,
  currency,
  reason,
  isCutoffPassed,
  onResubmit,
  onContact
}: {
  type: string;
  label?: string;
  amount: number;
  currency: string;
  reason?: string;
  isCutoffPassed?: boolean;
  onResubmit?: () => void;
  onContact?: () => void;
}) => (
  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{type}</span>
            {label && <span className="text-xs text-muted-foreground truncate">· {label}</span>}
          </div>
          <span className="text-sm font-mono tabular-nums text-muted-foreground line-through shrink-0">
            {formatCurrency(amount, currency)}
          </span>
        </div>
        {reason && (
          <p className="text-xs text-destructive/80 leading-relaxed">
            "{reason}"
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          {onResubmit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              onClick={onResubmit}
            >
              <RotateCcw className="h-3 w-3" />
              Resubmit
            </Button>
          )}
          {onContact && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1.5 text-muted-foreground"
              onClick={onContact}
            >
              <MessageSquare className="h-3 w-3" />
              Contact manager
            </Button>
          )}
        </div>
        {/* Cycle info message */}
        {isCutoffPassed && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3 shrink-0" />
            <span>Resubmission will be queued for next pay cycle</span>
          </div>
        )}
      </div>
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
  onResubmitAdjustment
}: PayBreakdownDrawerProps) => {
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const deductions = lineItems.filter(item => item.type === 'Deduction');
  
  // Separate adjustments by status, filtering out resubmitted rejections
  const pendingAdjustments = adjustments.filter(adj => adj.status === 'Pending' || adj.status === 'Admin approved');
  const rejectedAdjustments = adjustments.filter(
    adj => adj.status === 'Admin rejected' && !resubmittedRejectionIds.includes(adj.id)
  );
  const isCutoffPassed = windowState === 'CLOSED';
  const overtimeAdjustments = pendingAdjustments.filter(adj => adj.type === 'Overtime');
  const otherAdjustments = pendingAdjustments.filter(adj => adj.type !== 'Overtime');
  
  // Calculate totals
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalOtherAdjustments = otherAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const totalOvertimeAdjustments = overtimeAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
  
  const pendingAdjustmentTotal = pendingAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const hasAdjustments = pendingAdjustments.length > 0;
  const hasRejections = rejectedAdjustments.length > 0;
  const adjustedNet = estimatedNet + pendingAdjustmentTotal;
  
  const canMakeAdjustments = payrollStatus === 'draft' && onMakeAdjustment;
  const canRemoveAdjustments = payrollStatus === 'draft' && onWithdrawAdjustment;

  const handleContactManager = () => {
    // In a real app, this would open email or messaging
    window.open('mailto:manager@company.com?subject=Question about rejected adjustment');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {periodLabel}
            </Badge>
          </div>
        </SheetHeader>

        {/* Receipt-style content */}
        <div className="px-6 py-5 space-y-6">
          
          {/* Rejected Adjustments Section - Show first for visibility */}
          {hasRejections && (
            <section>
              <h3 className="text-xs font-semibold text-destructive uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Needs attention ({rejectedAdjustments.length})
              </h3>
              <div className="space-y-2">
                {rejectedAdjustments.map((adj) => (
                  <RejectedItemCard
                    key={adj.id}
                    type={adj.type}
                    label={adj.label}
                    amount={adj.amount || 0}
                    currency={currency}
                    reason={adj.rejectionReason || "This request couldn't be approved. Please check the details and resubmit."}
                    isCutoffPassed={isCutoffPassed}
                    onResubmit={onResubmitAdjustment ? () => onResubmitAdjustment(adj.id, adj.category || adj.label) : undefined}
                    onContact={handleContactManager}
                  />
                ))}
              </div>
            </section>
          )}

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
              {otherAdjustments.map((adj) => (
                <BreakdownRow
                  key={adj.id}
                  label={adj.type}
                  sublabel={adj.label}
                  amount={adj.amount || 0}
                  currency={currency}
                  isPositive
                  badge={{
                    label: adj.status === 'Pending' ? 'Pending' : 'Approved',
                    variant: adj.status === 'Pending' ? 'pending' : 'approved'
                  }}
                  canRemove={canRemoveAdjustments && adj.status === 'Pending'}
                  onRemove={() => onWithdrawAdjustment?.(adj.id)}
                />
              ))}
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
          {overtimeAdjustments.length > 0 && (
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
                    badge={{
                      label: adj.status === 'Pending' ? 'Pending' : 'Approved',
                      variant: adj.status === 'Pending' ? 'pending' : 'approved'
                    }}
                    canRemove={canRemoveAdjustments && adj.status === 'Pending'}
                    onRemove={() => onWithdrawAdjustment?.(adj.id)}
                  />
                ))}
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
              {hasAdjustments && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Includes {pendingAdjustments.length} pending {pendingAdjustments.length === 1 ? 'adjustment' : 'adjustments'}
                </p>
              )}
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
              Request a change
            </button>
          )}

          <p className="text-[11px] text-muted-foreground/70 text-center mt-4">
            This is an estimate. Final pay may vary.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};