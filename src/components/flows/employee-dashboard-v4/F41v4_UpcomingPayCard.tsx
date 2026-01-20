/**
 * Flow 4.1 — Employee Dashboard v4
 * Current Pay Period Hero Card with 5-status UX
 * INDEPENDENT from v3 - changes here do not affect other flows.
 * Updated: trigger rebuild
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, FileText, X, Calendar, Wallet, Clock, AlertCircle, Check } from 'lucide-react';
import { useF41v4_DashboardStore, type PayrollStatus, type Adjustment, type LeaveRequest } from '@/stores/F41v4_DashboardStore';
import { F41v4_AdjustmentModal, type RequestType } from './F41v4_AdjustmentModal';
import { F41v4_ConfirmPayDialog } from './F41v4_ConfirmPayDialog';
import { F41v4_SubmitNoChangesDialog } from './F41v4_SubmitNoChangesDialog';
import { F41v4_AdjustmentDetailModal } from './F41v4_AdjustmentDetailModal';
import { F41v4_PayslipHistoryDrawer } from './F41v4_PayslipHistoryDrawer';
import { F41v4_WithdrawDialog } from './F41v4_WithdrawDialog';
import { F41v4_WithdrawSubmissionDialog } from './F41v4_WithdrawSubmissionDialog';
import { F41v4_PayBreakdownDrawer } from './F41v4_PayBreakdownDrawer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};
const formatSubmittedTimestamp = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) + ', ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Status badge configuration
const getStatusConfig = (status: PayrollStatus): {
  label: string;
  className: string;
  explanation: string;
  helperText?: string;
  primaryAction: string;
  secondaryAction: string;
} => {
  switch (status) {
    case 'draft':
      return {
        label: 'Action needed',
        className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
        explanation: 'Review your details and submit for approval.',
        helperText: 'Please review and confirm your pay details before the cut-off.',
        primaryAction: 'Review & submit',
        secondaryAction: 'Make adjustments'
      };
    case 'submitted':
      return {
        label: 'In review',
        className: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        explanation: 'Submitted for review',
        helperText: 'Your company will review this before payroll is finalised.',
        primaryAction: 'Submitted',
        secondaryAction: 'Make adjustments'
      };
    case 'returned':
      return {
        label: 'Returned to you',
        className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
        explanation: 'Your company needs changes before they can approve.',
        primaryAction: 'Fix & resubmit',
        secondaryAction: 'View previous submission'
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
        explanation: 'Action needed: Your pay needs an update',
        primaryAction: 'Review & resubmit',
        secondaryAction: ''
      };
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
        explanation: 'Payroll approved',
        helperText: 'Your pay is finalised for this period.',
        primaryAction: 'Approved',
        secondaryAction: 'Make adjustments'
      };
    case 'finalised':
      return {
        label: 'Finalised',
        className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
        explanation: 'Payroll approved. Payment will be processed externally.',
        primaryAction: 'View payslip',
        secondaryAction: 'View documents in profile'
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-muted text-muted-foreground',
        explanation: '',
        primaryAction: 'View details',
        secondaryAction: ''
      };
  }
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
export const F41v4_UpcomingPayCard = () => {
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentModalInitialType, setAdjustmentModalInitialType] = useState<RequestType>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [noChangesDialogOpen, setNoChangesDialogOpen] = useState(false);
  const [payslipDrawerOpen, setPayslipDrawerOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<{
    type: 'adjustment' | 'leave';
    id: string;
  } | null>(null);
  const [withdrawSubmissionDialogOpen, setWithdrawSubmissionDialogOpen] = useState(false);

  // Demo state toggle - for simulating rejected state
  const [demoRejected, setDemoRejected] = useState(false);

  // Helper to open adjustment modal with specific type
  const openAdjustmentModal = (type: RequestType = null) => {
    setAdjustmentModalInitialType(type);
    setAdjustmentModalOpen(true);
  };
  const handleAdjustmentModalClose = (open: boolean) => {
    setAdjustmentModalOpen(open);
    if (!open) {
      setAdjustmentModalInitialType(null);
    }
  };
  const {
    nextPayoutDate,
    periodLabel,
    periodMonth,
    estimatedNet,
    currency,
    lineItems,
    employerCosts,
    windowState,
    payrollStatus,
    returnedReason,
    resubmitDeadline,
    submittedAt,
    approvedAt,
    adjustments,
    leaveRequests,
    cutoffDate,
    isCutoffSoon,
    withdrawAdjustment,
    withdrawLeaveRequest,
    withdrawSubmission,
    setPayrollStatus
  } = useF41v4_DashboardStore();

  // Auto-transition from 'submitted' to 'approved' after 3 seconds
  useEffect(() => {
    if (payrollStatus === 'submitted') {
      const timer = setTimeout(() => {
        setPayrollStatus('approved');
        toast.success('Approved. Your payroll is finalised.');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [payrollStatus, setPayrollStatus]);

  // Calculate effective status (demo override for rejected)
  const effectiveStatus = demoRejected ? 'rejected' as const : payrollStatus;
  const statusConfig = getStatusConfig(effectiveStatus);
  const isWindowOpen = windowState === 'OPEN';
  const isNone = windowState === 'NONE';
  const pendingCount = adjustments.filter(a => a.status === 'Pending').length + leaveRequests.filter(l => l.status === 'Pending').length;

  // Check if a tag is removable (pending + window open + draft status)
  const isRemovable = (status: string) => status === 'Pending' && isWindowOpen && effectiveStatus === 'draft';

  // Handle withdraw click
  const handleWithdrawClick = (e: React.MouseEvent, type: 'adjustment' | 'leave', id: string) => {
    e.stopPropagation();
    setWithdrawTarget({
      type,
      id
    });
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

  // Handle primary action
  const handlePrimaryAction = () => {
    if (effectiveStatus === 'rejected') {
      // For rejected, primary action is "Review & resubmit"
      setConfirmDialogOpen(true);
      return;
    }
    switch (payrollStatus) {
      case 'draft':
      case 'returned':
        setConfirmDialogOpen(true);
        break;
      case 'submitted':
        setBreakdownDrawerOpen(true);
        break;
      case 'approved':
      case 'finalised':
        setPayslipDrawerOpen(true);
        break;
    }
  };

  // Handle secondary action
  const handleSecondaryAction = () => {
    switch (payrollStatus) {
      case 'draft':
        openAdjustmentModal();
        break;
      case 'submitted':
        setWithdrawSubmissionDialogOpen(true);
        break;
      case 'approved':
        openAdjustmentModal();
        break;
      case 'returned':
        setBreakdownDrawerOpen(true);
        break;
      case 'finalised':
        // Navigate to profile docs - would be a router action
        toast.info('Opening documents in profile...');
        break;
    }
  };

  // Empty state
  if (isNone) {
    return <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming pay yet. Complete onboarding to proceed.</p>
          </div>
          <Button variant="outline" size="sm">
            Complete Onboarding
          </Button>
        </CardContent>
      </Card>;
  }
  return <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        {/* Hero Header - Clean & Compact */}
        <CardHeader className="bg-gradient-to-r from-primary/[0.04] to-secondary/[0.03] border-b border-border/40 pb-4">
          {/* Header with badge aligned to vertical center of content block */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-semibold">Current pay period</CardTitle>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm font-medium text-foreground/70">{periodMonth}</span>
              </div>
              {/* Helper text with timestamps - hide for rejected state */}
              <div className="flex flex-col gap-0.5">
                {!demoRejected && payrollStatus === 'draft' && statusConfig.helperText && (
                  <p className="text-sm text-muted-foreground">
                    {statusConfig.helperText}
                  </p>
                )}
                {!demoRejected && payrollStatus === 'submitted' && submittedAt && (
                  <p className="text-sm text-muted-foreground">
                    Submitted on {formatSubmittedTimestamp(submittedAt)}
                  </p>
                )}
                {!demoRejected && payrollStatus === 'approved' && approvedAt && (
                  <p className="text-sm text-muted-foreground">
                    Approved on {formatSubmittedTimestamp(approvedAt)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {/* Demo state toggle - only show after submission (submitted/approved states) */}
              {(payrollStatus === 'submitted' || payrollStatus === 'approved') && <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 border border-border/40">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Preview</span>
                  <div className="flex rounded-md overflow-hidden border border-border/50">
                    <button onClick={() => setDemoRejected(false)} className={cn('px-2 py-0.5 text-[10px] font-medium transition-colors', !demoRejected ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted-foreground hover:text-foreground')}>
                      Approved
                    </button>
                    <button onClick={() => setDemoRejected(true)} className={cn('px-2 py-0.5 text-[10px] font-medium transition-colors', demoRejected ? 'bg-destructive/10 text-destructive' : 'bg-transparent text-muted-foreground hover:text-foreground')}>
                      Rejected
                    </button>
                  </div>
                </div>}
              <Badge className={cn('text-sm px-3 py-1', statusConfig.className)}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Returned reason block - only when applicable */}
          {payrollStatus === 'returned' && returnedReason && !demoRejected && <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <span className="font-medium">Admin note:</span> {returnedReason}
              </p>
              {resubmitDeadline && <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Resubmit by: {resubmitDeadline}
                </p>}
            </div>}
          
          {/* Rejection panel - only when demo rejected is active */}
          {demoRejected && <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/40">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">This pay period was not approved</p>
                  <p className="text-sm text-muted-foreground">
                    Please speak with your manager to resolve any issues. You can resubmit for the next payroll run.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Submit before Feb 15 to be included in the February payroll.
                  </p>
                </div>
              </div>
            </div>}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Numbers Row - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estimated Net Pay Tile */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Estimated net pay</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {formatCurrency(estimatedNet, currency)}
                  </p>
                  {demoRejected ? <p className="text-xs text-muted-foreground/70 mt-1.5">
                      Estimated net pay will update once changes are approved.
                    </p> : <p className="text-xs text-muted-foreground mt-1.5">After taxes & deductions</p>}
                </div>
                <button onClick={() => setBreakdownDrawerOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                  <FileText className="h-3.5 w-3.5" />
                  {effectiveStatus === 'approved' ? 'Preview' : 'Breakdown'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
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



          {/* Changes Summary - Only show if there are changes */}
          {(adjustments.length > 0 || leaveRequests.length > 0) && <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your changes (this cycle)
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Your changes this cycle">
                {/* Adjustment chips */}
                {adjustments.map(adj => <div key={adj.id} className={cn('group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all', getAdjustmentStatusColor(adj.status), isRemovable(adj.status) ? 'pr-1.5 group-hover:pr-2' : '')} role="listitem">
                    <button onClick={() => setSelectedAdjustment(adj)} aria-label={`${adj.type}${adj.amount !== null ? `, ${formatCurrency(adj.amount, currency)}` : ''}${adj.type === 'Overtime' && adj.hours ? `, ${adj.hours} hours` : ''}, status: ${adj.status}. Click to view details.`} className="inline-flex items-center gap-1.5 focus:outline-none">
                      <span>{adj.type}</span>
                      {adj.amount !== null && <>
                          <span aria-hidden="true">·</span>
                          <span>{formatCurrency(adj.amount, currency)}</span>
                        </>}
                      {adj.type === 'Overtime' && adj.hours && <>
                          <span aria-hidden="true">·</span>
                          <span>{adj.hours}h</span>
                        </>}
                      <span aria-hidden="true">·</span>
                      <span className="opacity-70">{adj.status}</span>
                    </button>
                    {isRemovable(adj.status) && <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={e => handleWithdrawClick(e, 'adjustment', adj.id)} className="ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-current" aria-label="Withdraw request">
                            <X className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Withdraw request
                        </TooltipContent>
                      </Tooltip>}
                  </div>)}

                {/* Leave chips */}
                {leaveRequests.map(leave => <div key={leave.id} className={cn('group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all', getLeaveStatusColor(leave.status), isRemovable(leave.status) ? 'pr-1.5' : '')} role="listitem">
                    <span aria-label={`${leave.leaveType}, ${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'}, status: ${leave.status}`} className="inline-flex items-center gap-1.5">
                      <span>{leave.leaveType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{leave.totalDays}d</span>
                      <span aria-hidden="true">·</span>
                      <span className="opacity-70">{leave.status}</span>
                    </span>
                    {isRemovable(leave.status) && <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={e => handleWithdrawClick(e, 'leave', leave.id)} className="ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-current" aria-label="Withdraw request">
                            <X className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Withdraw request
                        </TooltipContent>
                      </Tooltip>}
                  </div>)}
              </div>
            </div>}

          {/* Primary + Secondary Actions - only show for draft state */}
          {!demoRejected && payrollStatus === 'draft' && <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handlePrimaryAction} className="flex-1">
                  {statusConfig.primaryAction}
                </Button>
                
                {statusConfig.secondaryAction && (
                  <Button variant="outline" onClick={handleSecondaryAction} className="flex-1">
                    {statusConfig.secondaryAction}
                  </Button>
                )}
              </div>
            </div>}

          {/* View previous payslips link */}
          <div className="text-center">
            <Button variant="link" onClick={() => setPayslipDrawerOpen(true)} className="text-sm text-muted-foreground hover:text-foreground">
              View previous payslips
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <F41v4_AdjustmentModal open={adjustmentModalOpen} onOpenChange={handleAdjustmentModalClose} currency={currency} initialType={adjustmentModalInitialType} />

      <F41v4_ConfirmPayDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} periodLabel={periodLabel} />

      <F41v4_SubmitNoChangesDialog open={noChangesDialogOpen} onOpenChange={setNoChangesDialogOpen} periodLabel={periodLabel} />

      <F41v4_AdjustmentDetailModal adjustment={selectedAdjustment} onClose={() => setSelectedAdjustment(null)} currency={currency} />

      <F41v4_PayslipHistoryDrawer open={payslipDrawerOpen} onOpenChange={setPayslipDrawerOpen} />

      <F41v4_PayBreakdownDrawer 
        open={breakdownDrawerOpen} 
        onOpenChange={setBreakdownDrawerOpen} 
        lineItems={lineItems} 
        currency={currency} 
        estimatedNet={estimatedNet} 
        periodLabel={periodLabel} 
        adjustments={adjustments} 
        leaveRequests={leaveRequests}
        payrollStatus={payrollStatus}
        onMakeAdjustment={() => openAdjustmentModal()}
      />

      <F41v4_WithdrawDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen} onConfirm={handleConfirmWithdraw} requestType={withdrawTarget?.type || 'adjustment'} />

      <F41v4_WithdrawSubmissionDialog open={withdrawSubmissionDialogOpen} onOpenChange={setWithdrawSubmissionDialogOpen} onConfirm={withdrawSubmission} />
    </>;
};