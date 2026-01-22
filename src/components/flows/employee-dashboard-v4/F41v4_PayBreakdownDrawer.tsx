/**
 * Flow 4.1 — Employee Dashboard v4
 * Pay Breakdown Drawer - shows earnings, deductions, and submitted adjustments/leave
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Calendar, Receipt, Plus, Check, Plane } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import type { Adjustment, LeaveRequest, PayrollStatus } from '@/stores/F41v4_DashboardStore';

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
  onMakeAdjustment?: () => void;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Admin approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
    case 'Admin rejected':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    case 'Pending':
    default:
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
  }
};

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
  onMakeAdjustment
}: PayBreakdownDrawerProps) => {
  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const deductions = lineItems.filter(item => item.type === 'Deduction');
  const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
  
  // Separate approved leave from pending
  const approvedLeave = leaveRequests.filter(l => l.status === 'Admin approved');
  const pendingLeave = leaveRequests.filter(l => l.status === 'Pending');
  const totalApprovedDays = approvedLeave.reduce((sum, l) => sum + l.totalDays, 0);
  
  const hasRequests = adjustments.length > 0 || pendingLeave.length > 0;
  const canMakeAdjustments = payrollStatus === 'draft' && onMakeAdjustment;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {periodLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Approved Time Off Summary - Read-only */}
          {approvedLeave.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20">
                  <Plane className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Approved time off
                </h3>
                <Badge variant="outline" className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {totalApprovedDays} {totalApprovedDays === 1 ? 'day' : 'days'}
                </Badge>
              </div>
              <div className="space-y-2">
                {approvedLeave.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between text-sm">
                    <span className="text-emerald-700 dark:text-emerald-300">{leave.leaveType}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatDateRange(leave.startDate, leave.endDate)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-500/20">
                This is already approved and will be included in payroll
              </p>
            </div>
          )}

          {/* Earnings Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Earnings
            </h3>
            <div className="space-y-2">
              {earnings.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    {item.locked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set by your company</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-sm font-medium text-accent-green-text tabular-nums">
                    +{formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Deductions
              </h3>
              <span className="text-sm font-medium text-destructive tabular-nums">
                -{formatCurrency(totalDeductions, currency)}
              </span>
            </div>
            <div className="space-y-2">
              {deductions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    {item.locked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set by your company</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-sm font-medium text-destructive tabular-nums">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Net Pay Summary */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gradient-to-br from-primary/[0.05] to-secondary/[0.03] border border-border/30">
            <span className="text-sm font-medium text-foreground">Estimated net pay</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">
              {formatCurrency(estimatedNet, currency)}
            </span>
          </div>

          {/* Make Adjustments CTA - below net pay for context */}
          {canMakeAdjustments && (
            <button
              onClick={() => {
                onMakeAdjustment();
                onOpenChange(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Request a change for this period
            </button>
          )}

          {/* Submitted Adjustments & Pending Leave Requests */}
          {hasRequests && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Pending requests
                </h3>
                <div className="space-y-2">
                  {adjustments.map((adj) => (
                    <div key={adj.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{adj.type}</span>
                          {adj.label && (
                            <span className="text-xs text-muted-foreground">{adj.label}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {adj.amount && (
                          <span className="text-sm font-medium tabular-nums">
                            {formatCurrency(adj.amount, currency)}
                          </span>
                        )}
                        <Badge variant="outline" className={getStatusBadgeClass(adj.status)}>
                          {adj.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {pendingLeave.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{leave.leaveType}</span>
                          <span className="text-xs text-muted-foreground">
                            {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusBadgeClass(leave.status)}>
                        {leave.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground text-center">
            This is an estimate. Final pay may vary based on adjustments and approvals.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};