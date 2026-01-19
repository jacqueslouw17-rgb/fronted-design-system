/**
 * Flow 4.1 — Employee Dashboard v4
 * Upcoming Pay Card with T-5 confirmation
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Lock, Info, FileText, X, Calendar, Wallet, ChevronRight } from 'lucide-react';
import { useF41v4_DashboardStore, type WindowState, type Adjustment, type LeaveRequest } from '@/stores/F41v4_DashboardStore';
import { F41v4_AdjustmentModal } from './F41v4_AdjustmentModal';
import { F41v4_ConfirmPayDialog } from './F41v4_ConfirmPayDialog';
import { F41v4_AdjustmentDetailModal } from './F41v4_AdjustmentDetailModal';
import { F41v4_PayslipHistoryDrawer } from './F41v4_PayslipHistoryDrawer';
import { F41v4_WithdrawDialog } from './F41v4_WithdrawDialog';
import { F41v4_PayBreakdownDrawer } from './F41v4_PayBreakdownDrawer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getStatusBadge = (windowState: WindowState, confirmed: boolean) => {
  if (windowState === 'PAID') {
    return <Badge className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30">Paid</Badge>;
  }
  if (windowState === 'CLOSED') {
    return <Badge variant="secondary" className="bg-muted text-muted-foreground">Locked</Badge>;
  }
  if (windowState === 'NONE') {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (confirmed) {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30">Submitted</Badge>;
  }
  return <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">Action needed</Badge>;
};

const getAdjustmentStatusColor = (status: Adjustment['status']) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-500 dark:border-amber-500/30';
    case 'Admin approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30';
    case 'Admin rejected':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30';
    case 'Queued for next cycle':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getLeaveStatusColor = (status: LeaveRequest['status']) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-500 dark:border-amber-500/30';
    case 'Admin approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30';
    case 'Admin rejected':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30';
    case 'Queued for next cycle':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Helper to generate summary chips text
const getChangeSummaryChips = (adjustments: Adjustment[], leaveRequests: LeaveRequest[], currency: string) => {
  const chips: { label: string; type: 'adjustment' | 'leave'; id: string }[] = [];
  
  // Group adjustments by type
  const expenseCount = adjustments.filter(a => a.type === 'Expense').length;
  const overtimeCount = adjustments.filter(a => a.type === 'Overtime').length;
  const bonusCount = adjustments.filter(a => a.type === 'Bonus').length;
  const correctionCount = adjustments.filter(a => a.type === 'Correction').length;
  
  if (expenseCount > 0) chips.push({ label: `${expenseCount} expense${expenseCount > 1 ? 's' : ''} submitted`, type: 'adjustment', id: 'expense' });
  if (overtimeCount > 0) chips.push({ label: `${overtimeCount} overtime request${overtimeCount > 1 ? 's' : ''}`, type: 'adjustment', id: 'overtime' });
  if (bonusCount > 0) chips.push({ label: `${bonusCount} bonus request${bonusCount > 1 ? 's' : ''}`, type: 'adjustment', id: 'bonus' });
  if (correctionCount > 0) chips.push({ label: `${correctionCount} correction${correctionCount > 1 ? 's' : ''}`, type: 'adjustment', id: 'correction' });
  
  // Leave requests
  if (leaveRequests.length > 0) {
    chips.push({ label: `Leave request${leaveRequests.length > 1 ? 's' : ''} added`, type: 'leave', id: 'leave' });
  }
  
  return chips;
};

export const F41v4_UpcomingPayCard = () => {
  const [employerCostsOpen, setEmployerCostsOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [payslipDrawerOpen, setPayslipDrawerOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<{ type: 'adjustment' | 'leave'; id: string } | null>(null);

  const {
    nextPayoutDate,
    periodLabel,
    estimatedNet,
    currency,
    lineItems,
    employerCosts,
    windowState,
    confirmed,
    adjustments,
    leaveRequests,
    daysUntilClose,
    withdrawAdjustment,
    withdrawLeaveRequest,
  } = useF41v4_DashboardStore();

  const isWindowOpen = windowState === 'OPEN';
  const isWindowClosed = windowState === 'CLOSED';
  const isPaid = windowState === 'PAID';
  const isNone = windowState === 'NONE';

  const totalEmployerCosts = employerCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const changeSummaryChips = getChangeSummaryChips(adjustments, leaveRequests, currency);

  // Check if a tag is removable (pending + window open)
  const isRemovable = (status: string) => status === 'Pending' && isWindowOpen;

  // Handle withdraw click
  const handleWithdrawClick = (e: React.MouseEvent, type: 'adjustment' | 'leave', id: string) => {
    e.stopPropagation();
    setWithdrawTarget({ type, id });
    setWithdrawDialogOpen(true);
  };

  // Confirm withdraw
  const handleConfirmWithdraw = () => {
    if (!withdrawTarget) return;
    
    if (withdrawTarget.type === 'adjustment') {
      withdrawAdjustment(withdrawTarget.id);
    } else {
      withdrawLeaveRequest(withdrawTarget.id);
    }
    
    toast.success('Request withdrawn.');
    setWithdrawTarget(null);
  };

  // Empty state
  if (isNone) {
    return (
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming pay yet. Complete onboarding to proceed.</p>
          </div>
          <Button variant="outline" size="sm">
            Complete Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        {/* Header: Status + Urgency Row */}
        <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-semibold">
                {isPaid ? 'Last payment' : 'Upcoming pay'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{periodLabel}</p>
              {isWindowOpen && !confirmed && (
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Submission closes in {daysUntilClose} days
                  <span className="inline-flex">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                  </span>
                </p>
              )}
            </div>
            {getStatusBadge(windowState, confirmed)}
          </div>
          {isWindowOpen && !confirmed && (
            <p className="text-xs text-muted-foreground mt-3">
              Submit your details for this pay period. Your company will review before payroll is finalised.
            </p>
          )}
          {confirmed && (
            <p className="text-xs text-muted-foreground mt-3">
              Submitted to your company for review.
            </p>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Window Closed Banner */}
          {isWindowClosed && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/40 text-sm text-muted-foreground">
              The confirmation window is closed. New requests will roll into the next cycle.
            </div>
          )}

          {/* Key Numbers Row - 2 Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estimated Net Pay Tile */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Estimated net pay</p>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {formatCurrency(estimatedNet, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">After taxes & deductions</p>
            </div>

            {/* Pay Date Tile */}
            <div className="p-5 rounded-xl bg-muted/30 border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Pay date</p>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {formatDate(nextPayoutDate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">Expected deposit date</p>
            </div>
          </div>

          {/* View Pay Breakdown - Secondary Action */}
          <Button
            variant="outline"
            onClick={() => setBreakdownDrawerOpen(true)}
            className="w-full justify-between text-sm font-medium h-11"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View pay breakdown
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Employer Contributions - Collapsible (de-emphasized) */}
          <Collapsible open={employerCostsOpen} onOpenChange={setEmployerCostsOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <span>View employer contributions</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Some items are controlled by country rules</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(totalEmployerCosts, currency)}</span>
                  {employerCostsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 pb-1 space-y-2">
              <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                {employerCosts.map((cost, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{cost.label}</span>
                    <span className="text-foreground">{formatCurrency(cost.amount, currency)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-border/30 flex items-center justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(totalEmployerCosts, currency)}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Changes Summary - Chips Style */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your changes (this cycle)
            </p>
            {adjustments.length === 0 && leaveRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">No changes yet</p>
            ) : (
              <div className="space-y-3">
                {/* Summary Chips */}
                <div className="flex flex-wrap gap-2">
                  {changeSummaryChips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>

                {/* Detailed Tags with Status */}
                <div className="flex flex-wrap gap-2" role="list" aria-label="Your changes this cycle">
                  {/* Adjustment chips */}
                  {adjustments.map((adj) => (
                    <div
                      key={adj.id}
                      className={cn(
                        'group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                        getAdjustmentStatusColor(adj.status),
                        isRemovable(adj.status) ? 'pr-1.5' : ''
                      )}
                      role="listitem"
                    >
                      <button
                        onClick={() => setSelectedAdjustment(adj)}
                        aria-label={`${adj.type}${adj.amount !== null ? `, ${formatCurrency(adj.amount, currency)}` : ''}${adj.type === 'Overtime' && adj.hours ? `, ${adj.hours} hours` : ''}, status: ${adj.status}. Click to view details.`}
                        className="inline-flex items-center gap-1.5 focus:outline-none"
                      >
                        <span>{adj.type}</span>
                        {adj.amount !== null && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{formatCurrency(adj.amount, currency)}</span>
                          </>
                        )}
                        {adj.type === 'Overtime' && adj.hours && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{adj.hours}h</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="opacity-70">{adj.status}</span>
                      </button>
                      {isRemovable(adj.status) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => handleWithdrawClick(e, 'adjustment', adj.id)}
                              className="ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-current"
                              aria-label="Withdraw request"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Withdraw request
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}

                  {/* Leave chips */}
                  {leaveRequests.map((leave) => (
                    <div
                      key={leave.id}
                      className={cn(
                        'group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                        getLeaveStatusColor(leave.status),
                        isRemovable(leave.status) ? 'pr-1.5' : ''
                      )}
                      role="listitem"
                    >
                      <span
                        aria-label={`${leave.leaveType}, ${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}, status: ${leave.status}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span>{leave.leaveType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{leave.totalDays}d</span>
                        <span aria-hidden="true">·</span>
                        <span className="opacity-70">{leave.status}</span>
                      </span>
                      {isRemovable(leave.status) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => handleWithdrawClick(e, 'leave', leave.id)}
                              className="ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-current"
                              aria-label="Withdraw request"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Withdraw request
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!isWindowOpen || confirmed}
              className="flex-1"
            >
              {confirmed ? 'Submitted' : 'Submit for payroll'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdjustmentModalOpen(true)}
              disabled={isWindowClosed || isPaid}
              className="flex-1"
            >
              Request adjustment
            </Button>
          </div>

          {/* View previous payslips link */}
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => setPayslipDrawerOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View previous payslips
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <F41v4_AdjustmentModal
        open={adjustmentModalOpen}
        onOpenChange={setAdjustmentModalOpen}
        currency={currency}
      />

      <F41v4_ConfirmPayDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        periodLabel={periodLabel}
      />

      <F41v4_AdjustmentDetailModal
        adjustment={selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        currency={currency}
      />

      <F41v4_PayslipHistoryDrawer
        open={payslipDrawerOpen}
        onOpenChange={setPayslipDrawerOpen}
      />

      <F41v4_PayBreakdownDrawer
        open={breakdownDrawerOpen}
        onOpenChange={setBreakdownDrawerOpen}
        lineItems={lineItems}
        currency={currency}
        estimatedNet={estimatedNet}
        periodLabel={periodLabel}
      />

      <F41v4_WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleConfirmWithdraw}
        requestType={withdrawTarget?.type || 'adjustment'}
      />
    </>
  );
};
