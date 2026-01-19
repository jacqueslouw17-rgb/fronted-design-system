/**
 * Flow 4.1 — Employee Dashboard v4
 * Current Pay Period Hero Card with 5-status UX
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronUp, 
  Info, 
  FileText, 
  X, 
  Calendar, 
  Wallet, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useF41v4_DashboardStore, type PayrollStatus, type Adjustment, type LeaveRequest } from '@/stores/F41v4_DashboardStore';
import { F41v4_AdjustmentModal, type RequestType } from './F41v4_AdjustmentModal';
import { F41v4_ConfirmPayDialog } from './F41v4_ConfirmPayDialog';
import { F41v4_SubmitNoChangesDialog } from './F41v4_SubmitNoChangesDialog';
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

// Status badge configuration
const getStatusConfig = (status: PayrollStatus) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Action needed',
        className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
        explanation: 'Review your details and submit for approval.',
        primaryAction: 'Review & submit',
        secondaryAction: 'No changes this month',
      };
    case 'submitted':
      return {
        label: 'Submitted',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30',
        explanation: 'Submitted to your company for review.',
        primaryAction: 'View submission',
        secondaryAction: 'Request a change',
      };
    case 'returned':
      return {
        label: 'Returned to you',
        className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
        explanation: 'Your company needs changes before they can approve.',
        primaryAction: 'Fix & resubmit',
        secondaryAction: 'View previous submission',
      };
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
        explanation: 'Approved by your company and sent to Fronted for processing.',
        primaryAction: 'View draft payslip',
        secondaryAction: 'Request a correction',
      };
    case 'finalised':
      return {
        label: 'Finalised',
        className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
        explanation: 'Payroll approved. Payment will be processed externally.',
        primaryAction: 'View payslip',
        secondaryAction: 'View documents in profile',
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-muted text-muted-foreground',
        explanation: '',
        primaryAction: 'View details',
        secondaryAction: '',
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
  const [employerCostsOpen, setEmployerCostsOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentModalInitialType, setAdjustmentModalInitialType] = useState<RequestType>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [noChangesDialogOpen, setNoChangesDialogOpen] = useState(false);
  const [payslipDrawerOpen, setPayslipDrawerOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<{ type: 'adjustment' | 'leave'; id: string } | null>(null);

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
    adjustments,
    leaveRequests,
    cutoffDate,
    isCutoffSoon,
    withdrawAdjustment,
    withdrawLeaveRequest,
  } = useF41v4_DashboardStore();

  const statusConfig = getStatusConfig(payrollStatus);
  const isWindowOpen = windowState === 'OPEN';
  const isNone = windowState === 'NONE';
  const totalEmployerCosts = employerCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const pendingCount = adjustments.filter(a => a.status === 'Pending').length + leaveRequests.filter(l => l.status === 'Pending').length;

  // Check if a tag is removable (pending + window open + draft status)
  const isRemovable = (status: string) => status === 'Pending' && isWindowOpen && payrollStatus === 'draft';

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

  // Handle primary action
  const handlePrimaryAction = () => {
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
        setNoChangesDialogOpen(true);
        break;
      case 'submitted':
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

  // Checklist items for Draft/Returned states - matches side panel headings exactly
  const checklistItems: { 
    id: string; 
    label: string; 
    description: string; 
    completed: boolean; 
    optional?: boolean;
    requestType: RequestType;
  }[] = [
    {
      id: 'leave',
      label: 'Leave',
      description: leaveRequests.length > 0 
        ? `${leaveRequests.length} request${leaveRequests.length > 1 ? 's' : ''} added` 
        : 'Request time off',
      completed: leaveRequests.length > 0,
      optional: true,
      requestType: 'leave',
    },
    {
      id: 'expense',
      label: 'Expense',
      description: adjustments.filter(a => a.type === 'Expense').length > 0 
        ? `${adjustments.filter(a => a.type === 'Expense').length} submitted` 
        : 'Submit a reimbursement',
      completed: adjustments.filter(a => a.type === 'Expense').length > 0,
      optional: true,
      requestType: 'expense',
    },
    {
      id: 'overtime',
      label: 'Overtime',
      description: adjustments.filter(a => a.type === 'Overtime').length > 0 
        ? `${adjustments.filter(a => a.type === 'Overtime').reduce((sum, a) => sum + (a.hours || 0), 0)}h logged` 
        : 'Log extra hours',
      completed: adjustments.filter(a => a.type === 'Overtime').length > 0,
      optional: true,
      requestType: 'overtime',
    },
    {
      id: 'bonus-correction',
      label: 'Bonus / Correction',
      description: adjustments.filter(a => a.type === 'Bonus' || a.type === 'Correction').length > 0 
        ? `${adjustments.filter(a => a.type === 'Bonus' || a.type === 'Correction').length} request${adjustments.filter(a => a.type === 'Bonus' || a.type === 'Correction').length > 1 ? 's' : ''}` 
        : 'Request adjustment',
      completed: adjustments.filter(a => a.type === 'Bonus' || a.type === 'Correction').length > 0,
      optional: true,
      requestType: 'bonus-correction',
    },
  ];

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
        {/* Hero Header - Clean & Compact */}
        <CardHeader className="bg-gradient-to-r from-primary/[0.04] to-secondary/[0.03] border-b border-border/40 pb-4">
          {/* Top Row: Title + Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <CardTitle className="text-xl font-semibold">Current pay period</CardTitle>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm font-medium text-foreground/70">{periodMonth}</span>
            </div>
            <Badge className={cn('text-sm px-3 py-1', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Single helper line with cut-off inline */}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>{statusConfig.explanation}</span>
            {(payrollStatus === 'draft' || payrollStatus === 'returned') && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Cut-off {cutoffDate}
                </span>
                {isCutoffSoon && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
                    Soon
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Returned reason block - only when applicable */}
          {payrollStatus === 'returned' && returnedReason && (
            <div className="mt-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                <span className="font-medium">Admin note:</span> {returnedReason}
              </p>
              {resubmitDeadline && (
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                  Resubmit by: {resubmitDeadline}
                </p>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Numbers Row - Always visible */}
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

          {/* Checklist - Only in Draft/Returned states */}
          {(payrollStatus === 'draft' || payrollStatus === 'returned') && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Add or update
              </p>
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openAdjustmentModal(item.requestType)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/30 transition-colors text-left group"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-accent-green dark:text-accent-green-text flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View Pay Breakdown - Secondary Action */}
          <Button
            variant="outline"
            onClick={() => setBreakdownDrawerOpen(true)}
            className="w-full justify-between text-sm font-medium h-11"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {payrollStatus === 'approved' ? 'View draft payslip preview' : 'View pay breakdown'}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Employer Contributions - Collapsible */}
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

          {/* Changes Summary - Only show if there are changes */}
          {(adjustments.length > 0 || leaveRequests.length > 0) && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your changes (this cycle)
              </p>
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

          {/* Primary + Secondary Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handlePrimaryAction}
              className="w-full"
            >
              {statusConfig.primaryAction}
            </Button>
            
            {statusConfig.secondaryAction && (
              <Button
                variant="outline"
                onClick={handleSecondaryAction}
                className="w-full relative"
              >
                {statusConfig.secondaryAction}
                {payrollStatus === 'submitted' && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium dark:bg-amber-500/20 dark:text-amber-400">
                    {pendingCount}
                  </span>
                )}
              </Button>
            )}

            {/* "What happens next" line */}
            {payrollStatus === 'draft' && (
              <p className="text-xs text-muted-foreground text-center">
                Your company will review before payroll is finalised.
              </p>
            )}
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
        onOpenChange={handleAdjustmentModalClose}
        currency={currency}
        initialType={adjustmentModalInitialType}
      />

      <F41v4_ConfirmPayDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        periodLabel={periodLabel}
      />

      <F41v4_SubmitNoChangesDialog
        open={noChangesDialogOpen}
        onOpenChange={setNoChangesDialogOpen}
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
