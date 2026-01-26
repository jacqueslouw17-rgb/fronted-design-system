/**
 * Flow 4.2 — Contractor Dashboard v4
 * Invoice Breakdown Drawer - Premium receipt-style with rejection handling
 * Aligned with F41v4_PayBreakdownDrawer patterns
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Lock, Plus, Clock, X, ChevronDown, AlertCircle, MessageCircle } from 'lucide-react';
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
  isFullRejection?: boolean;
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
  isRejected = false,
  rejectionReason,
  onResubmit,
  onContact,
  isCutoffPassed,
  className
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
  isRejected?: boolean;
  rejectionReason?: string;
  onResubmit?: () => void;
  onContact?: () => void;
  isCutoffPassed?: boolean;
  className?: string;
}) => (
  <div className={cn("py-2 -mx-2 px-2 rounded-md", className)}>
    <div className={cn(
      "group flex items-center justify-between transition-colors",
      canRemove && "hover:bg-destructive/5 cursor-pointer rounded-md -mx-2 px-2"
    )}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "truncate",
            isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground",
            canRemove && "group-hover:text-destructive/80 transition-colors",
            isRejected && "line-through opacity-60"
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
          canRemove && "group-hover:-translate-x-6",
          isRejected && "line-through opacity-60"
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
    {/* Inline rejection details */}
    {isRejected && rejectionReason && (
      <div className="mt-1.5 pl-0 space-y-1.5">
        <p className="text-xs text-muted-foreground/80 italic">"{rejectionReason}"</p>
        <div className="flex items-center gap-2">
          {onResubmit && (
            <button 
              onClick={onResubmit}
              className="text-xs font-medium text-primary hover:underline"
            >
              Resubmit
            </button>
          )}
          {onResubmit && onContact && <span className="text-muted-foreground/50">·</span>}
          {onContact && (
            <button 
              onClick={onContact}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Contact manager
            </button>
          )}
        </div>
        {isCutoffPassed && (
          <p className="text-[10px] text-muted-foreground/60">Resubmission queued for next cycle</p>
        )}
      </div>
    )}
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
  isFullRejection = false,
  onMakeAdjustment,
  onWithdrawAdjustment,
  onResubmitAdjustment,
  onContactManager
}: InvoiceBreakdownDrawerProps) => {
  const [breakdownExpanded, setBreakdownExpanded] = useState(!isFullRejection);
  
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  
  // Separate adjustments by status, filtering out resubmitted rejections
  const pendingAdjustments = adjustments.filter(adj => adj.status === 'Pending' || adj.status === 'Admin approved');
  const rejectedAdjustments = adjustments.filter(
    adj => adj.status === 'Admin rejected' && !resubmittedRejectionIds.includes(adj.id)
  );
  const isCutoffPassed = windowState === 'CLOSED';
  
  // Calculate totals
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const pendingAdjustmentTotal = pendingAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  const hasAdjustments = pendingAdjustments.length > 0;
  const hasRejections = rejectedAdjustments.length > 0;
  const adjustedTotal = invoiceTotal + pendingAdjustmentTotal;
  
  const canMakeAdjustments = invoiceStatus === 'draft' && onMakeAdjustment;
  const canRemoveAdjustments = invoiceStatus === 'draft' && onWithdrawAdjustment;

  const handleContactManager = () => {
    if (onContactManager) {
      onContactManager();
    } else {
      window.open('mailto:manager@company.com?subject=Question about my invoice');
    }
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
        </SheetHeader>

        {/* Full Rejection Message - Prominent when fully rejected */}
        {isFullRejection && (
          <div className="px-6 py-5 border-b border-border/40">
            <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-500/[0.08] border border-red-200/60 dark:border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">This invoice was not approved</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Contact your manager to resolve this. You can resubmit for the next cycle.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Submit before Feb 15 to be included in the February invoice cycle.
                  </p>
                  <button 
                    onClick={handleContactManager}
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact manager
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Breakdown */}
        <Collapsible open={breakdownExpanded} onOpenChange={setBreakdownExpanded}>
          <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors border-b border-border/40">
            <span className="text-sm font-medium text-foreground">
              {isFullRejection ? 'View breakdown' : 'Breakdown'}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              breakdownExpanded && "rotate-180"
            )} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            {/* Receipt-style content */}
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
              {pendingAdjustments.filter(adj => adj.type === 'Expense' || adj.type === 'Bonus').map((adj) => (
                <BreakdownRow
                  key={adj.id}
                  label={adj.type}
                  meta={adj.label}
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
              {/* Rejected adjustments inline */}
              {rejectedAdjustments.map((adj) => (
                <BreakdownRow
                  key={adj.id}
                  label={adj.type}
                  meta={adj.label}
                  amount={adj.amount || 0}
                  currency={currency}
                  isPositive
                  isRejected
                  badge={{ label: 'Rejected', variant: 'rejected' }}
                  rejectionReason={adj.rejectionReason || "Please check and resubmit."}
                  isCutoffPassed={isCutoffPassed}
                  onResubmit={onResubmitAdjustment ? () => onResubmitAdjustment(adj.id, adj.category || adj.label, String(adj.amount || '')) : undefined}
                  onContact={handleContactManager}
                />
              ))}
              <BreakdownRow
                label="Total earnings"
                amount={totalEarnings + pendingAdjustments.filter(adj => adj.type === 'Expense' || adj.type === 'Bonus').reduce((sum, adj) => sum + (adj.amount || 0), 0)}
                currency={currency}
                isPositive
                isTotal
              />
            </div>
          </section>

          {/* Additional Hours Section */}
          {pendingAdjustments.filter(adj => adj.type === 'Additional hours').length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Additional hours
              </h3>
              <div className="space-y-0">
                {pendingAdjustments.filter(adj => adj.type === 'Additional hours').map((adj) => (
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
              </div>
            </section>
          )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Invoice Total Footer - Sticky feel */}
        <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
          {/* Main invoice total */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-medium text-foreground">Estimated invoice total</p>
              {hasAdjustments && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Includes {pendingAdjustments.length} pending {pendingAdjustments.length === 1 ? 'adjustment' : 'adjustments'}
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
