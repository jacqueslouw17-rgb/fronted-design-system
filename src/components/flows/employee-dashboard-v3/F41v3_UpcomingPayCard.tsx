/**
 * Flow 4.1 — Employee Dashboard v3
 * Upcoming Pay Card with T-5 confirmation
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Lock, Info, FileText } from 'lucide-react';
import { useF41v3_DashboardStore, type WindowState, type Adjustment, type LeaveRequest } from '@/stores/F41v3_DashboardStore';
import { F41v3_AdjustmentModal } from './F41v3_AdjustmentModal';
import { F41v3_ConfirmPayDialog } from './F41v3_ConfirmPayDialog';
import { F41v3_AdjustmentDetailModal } from './F41v3_AdjustmentDetailModal';
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
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30">Confirmed</Badge>;
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

export const F41v3_UpcomingPayCard = () => {
  const [lineItemsOpen, setLineItemsOpen] = useState(false);
  const [employerCostsOpen, setEmployerCostsOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);

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
  } = useF41v3_DashboardStore();

  const isWindowOpen = windowState === 'OPEN';
  const isWindowClosed = windowState === 'CLOSED';
  const isPaid = windowState === 'PAID';
  const isNone = windowState === 'NONE';

  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const deductions = lineItems.filter(item => item.type === 'Deduction');
  const totalEmployerCosts = employerCosts.reduce((sum, cost) => sum + cost.amount, 0);

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
        <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">
              {isPaid ? 'Last payment' : 'Upcoming pay'}
            </CardTitle>
            {getStatusBadge(windowState, confirmed)}
          </div>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span>Pay date: {formatDate(nextPayoutDate)}</span>
            <span className="text-muted-foreground/60">•</span>
            <span>{periodLabel}</span>
            {isWindowOpen && !confirmed && (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Confirmation closes in {daysUntilClose} days
                  <span className="inline-flex">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                  </span>
                </span>
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Window Closed Banner */}
          {isWindowClosed && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/40 text-sm text-muted-foreground">
              The confirmation window is closed. New requests will roll into the next cycle.
            </div>
          )}

          {/* Amounts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estimated Net Pay */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/[0.05] to-secondary/[0.03] border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Estimated Net Pay</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(estimatedNet, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">After taxes & deductions</p>
            </div>

            {/* Employer Contributions */}
            <Collapsible open={employerCostsOpen} onOpenChange={setEmployerCostsOpen}>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Employer Contributions</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Some items are controlled by country rules</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      {formatCurrency(totalEmployerCosts, currency)}
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {employerCostsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  {employerCosts.map((cost, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{cost.label}</span>
                      <span className="text-foreground">{formatCurrency(cost.amount, currency)}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Line Items Preview */}
          <Collapsible open={lineItemsOpen} onOpenChange={setLineItemsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/30">
                <span className="text-sm font-medium">View earnings & deductions breakdown</span>
                {lineItemsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-3">
              {/* Earnings */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Earnings</p>
                {earnings.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{item.label}</span>
                      {item.locked && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Defined by country configuration</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="text-accent-green-text font-medium">
                      +{formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deductions</p>
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{item.label}</span>
                      {item.locked && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Defined by country configuration</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="text-destructive font-medium">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Changes Summary Strip */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your changes (this cycle)
            </p>
            {adjustments.length === 0 && leaveRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">No changes yet</p>
            ) : (
              <div className="space-y-3">
                {/* Summary text */}
                <p className="text-sm text-muted-foreground">
                  {adjustments.length > 0 && (
                    <span>
                      Pay adjustments: {adjustments.filter(a => a.status === 'Pending').length} pending
                      {adjustments.filter(a => a.status === 'Admin approved').length > 0 && 
                        ` · ${adjustments.filter(a => a.status === 'Admin approved').length} approved`}
                    </span>
                  )}
                  {adjustments.length > 0 && leaveRequests.length > 0 && ' · '}
                  {leaveRequests.length > 0 && (
                    <span>
                      Leave: {leaveRequests.filter(l => l.status === 'Pending').length} pending
                      {leaveRequests.filter(l => l.status === 'Admin approved').length > 0 && 
                        ` · ${leaveRequests.filter(l => l.status === 'Admin approved').length} approved`}
                    </span>
                  )}
                </p>

                {/* Adjustment chips */}
                {adjustments.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Pay adjustments">
                    {adjustments.map((adj) => (
                      <button
                        key={adj.id}
                        onClick={() => setSelectedAdjustment(adj)}
                        aria-label={`${adj.type}${adj.amount !== null ? `, ${formatCurrency(adj.amount, currency)}` : ''}${adj.type === 'Overtime' && adj.hours ? `, ${adj.hours} hours` : ''}, status: ${adj.status}. Click to view details.`}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1',
                          getAdjustmentStatusColor(adj.status)
                        )}
                        role="listitem"
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
                    ))}
                  </div>
                )}

                {/* Leave chips */}
                {leaveRequests.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Leave requests">
                    {leaveRequests.map((leave) => (
                      <span
                        key={leave.id}
                        aria-label={`${leave.leaveType}, ${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}, status: ${leave.status}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                          getLeaveStatusColor(leave.status)
                        )}
                        role="listitem"
                      >
                        <span>{leave.leaveType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{leave.totalDays}d</span>
                        <span aria-hidden="true">·</span>
                        <span className="opacity-70">{leave.status}</span>
                      </span>
                    ))}
                  </div>
                )}
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
              {confirmed ? 'Pay Confirmed' : 'Confirm pay'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdjustmentModalOpen(true)}
              disabled={isWindowClosed || isPaid}
              className="flex-1"
            >
              Request change
            </Button>
          </div>

          {/* View previous payslips link */}
          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground hover:text-foreground">
              View previous payslips
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <F41v3_AdjustmentModal
        open={adjustmentModalOpen}
        onOpenChange={setAdjustmentModalOpen}
        currency={currency}
      />

      <F41v3_ConfirmPayDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        periodLabel={periodLabel}
      />

      <F41v3_AdjustmentDetailModal
        adjustment={selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        currency={currency}
      />
    </>
  );
};
