/**
 * Flow 4.1 — Employee Dashboard v5
 * Current Pay Period Hero Card with 5-status UX
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v4 or any other flow.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, FileText, X, Calendar, Wallet, Clock, AlertCircle, Check } from 'lucide-react';
import { useF41v5_DashboardStore, type F41v5_PayrollStatus, type F41v5_Adjustment, type F41v5_LeaveRequest } from '@/stores/F41v5_DashboardStore';
import { F41v5_AdjustmentModal, type RequestType } from './F41v5_AdjustmentModal';
import { F41v5_ConfirmPayDialog } from './F41v5_ConfirmPayDialog';
import { F41v5_SubmitNoChangesDialog } from './F41v5_SubmitNoChangesDialog';
import { F41v5_AdjustmentDetailModal } from './F41v5_AdjustmentDetailModal';
import { F41v5_PayslipHistoryDrawer } from './F41v5_PayslipHistoryDrawer';
import { F41v5_WithdrawDialog } from './F41v5_WithdrawDialog';
import { F41v5_WithdrawSubmissionDialog } from './F41v5_WithdrawSubmissionDialog';
import { F41v5_PayBreakdownDrawer } from './F41v5_PayBreakdownDrawer';
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
const getStatusConfig = (status: F41v5_PayrollStatus): {
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
        secondaryAction: 'Request adjustments'
      };
    case 'submitted':
      return {
        label: 'In review',
        className: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        explanation: 'Submitted for review',
        helperText: 'Your company will review this before payroll is finalised.',
        primaryAction: 'Submitted',
        secondaryAction: 'Request adjustments'
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
        secondaryAction: 'Request adjustments'
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
const getAdjustmentStatusColor = (status: F41v5_Adjustment['status']) => {
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
const getLeaveStatusColor = (status: F41v5_LeaveRequest['status']) => {
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
export const F41v5_UpcomingPayCard = () => {
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentModalInitialType, setAdjustmentModalInitialType] = useState<RequestType>(null);
  const [adjustmentModalInitialCategory, setAdjustmentModalInitialCategory] = useState('');
  const [adjustmentModalInitialAmount, setAdjustmentModalInitialAmount] = useState('');
  const [adjustmentModalFromBreakdown, setAdjustmentModalFromBreakdown] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [noChangesDialogOpen, setNoChangesDialogOpen] = useState(false);
  const [payslipDrawerOpen, setPayslipDrawerOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<F41v5_Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<{
    type: 'adjustment' | 'leave';
    id: string;
  } | null>(null);
  const [withdrawSubmissionDialogOpen, setWithdrawSubmissionDialogOpen] = useState(false);

  // Helper to open adjustment modal with specific type and optional pre-fill data
  const openAdjustmentModal = (type: RequestType = null, fromBreakdown: boolean = false, category: string = '', amount: string = '') => {
    setAdjustmentModalInitialType(type);
    setAdjustmentModalInitialCategory(category);
    setAdjustmentModalInitialAmount(amount);
    setAdjustmentModalFromBreakdown(fromBreakdown);
    setAdjustmentModalOpen(true);
  };
  const handleAdjustmentModalClose = (open: boolean) => {
    setAdjustmentModalOpen(open);
    if (!open) {
      setAdjustmentModalInitialType(null);
      setAdjustmentModalInitialCategory('');
      setAdjustmentModalInitialAmount('');
      setAdjustmentModalFromBreakdown(false);
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
    daysUntilClose,
    isCutoffSoon,
    resubmittedRejectionIds,
    withdrawAdjustment,
    withdrawLeaveRequest,
    withdrawSubmission,
    setPayrollStatus,
    markRejectionResubmitted,
    addAdjustment
  } = useF41v5_DashboardStore();

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
  const effectiveStatus = payrollStatus;
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
        <CardContent className="px-6 py-6 space-y-6">
          {/* Key Numbers Row - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Net Pay Tile - Static historical amount */}
            <div 
              onClick={() => setBreakdownDrawerOpen(true)} 
              className="p-5 rounded-xl border cursor-pointer transition-all duration-200 bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border-border/40 hover:from-primary/[0.12] hover:to-secondary/[0.08] hover:border-border/60"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Net pay</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/70 transition-colors hover:text-foreground hover:underline">
                  What's included
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                {formatCurrency(estimatedNet, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">This was your net pay for December 2025</p>
            </div>

            {/* Paid Date Tile */}
            <div onClick={() => setPayslipDrawerOpen(true)} className="p-5 rounded-xl bg-muted/30 border border-border/40 cursor-pointer transition-all duration-200 hover:bg-muted/70 hover:border-border/60">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Paid on</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/70 transition-colors hover:text-foreground hover:underline">
                  View previous
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                Dec 15, 2025
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">Next pay: Jan 15</p>
            </div>
          </div>

          {/* Action buttons removed - adjustments handled by separate section */}

        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <F41v5_AdjustmentModal open={adjustmentModalOpen} onOpenChange={handleAdjustmentModalClose} currency={currency} initialType={adjustmentModalInitialType} initialExpenseCategory={adjustmentModalInitialCategory} initialExpenseAmount={adjustmentModalInitialAmount} onBack={adjustmentModalFromBreakdown ? () => setBreakdownDrawerOpen(true) : undefined} />

      <F41v5_ConfirmPayDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} periodLabel={periodLabel} />

      <F41v5_SubmitNoChangesDialog open={noChangesDialogOpen} onOpenChange={setNoChangesDialogOpen} periodLabel={periodLabel} />

      <F41v5_AdjustmentDetailModal adjustment={selectedAdjustment} onClose={() => setSelectedAdjustment(null)} currency={currency} />

      <F41v5_PayslipHistoryDrawer open={payslipDrawerOpen} onOpenChange={setPayslipDrawerOpen} />

      <F41v5_PayBreakdownDrawer open={breakdownDrawerOpen} onOpenChange={setBreakdownDrawerOpen} lineItems={lineItems} currency={currency} estimatedNet={estimatedNet} periodLabel={periodLabel} />

      <F41v5_WithdrawDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen} onConfirm={handleConfirmWithdraw} requestType={withdrawTarget?.type || 'adjustment'} />

      <F41v5_WithdrawSubmissionDialog open={withdrawSubmissionDialogOpen} onOpenChange={setWithdrawSubmissionDialogOpen} onConfirm={withdrawSubmission} />
    </>;
};