/**
 * Flow 4.2 — Contractor Dashboard v6
 * Upcoming Invoice Card with 5-status UX
 * Aligned with Flow 4.1 Employee Dashboard v2 patterns
 * 
 * Features: Partial rejection + full rejection demo states
 * INDEPENDENT: Changes here do NOT affect v5 or any other flow.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, FileText, X, Calendar, Wallet, Clock, AlertCircle, Check } from 'lucide-react';
import { useF42v6_DashboardStore, type F42v6_InvoiceStatus, type F42v6_Adjustment } from '@/stores/F42v6_DashboardStore';
import { F42v6_AdjustmentDrawer, type ContractorRequestType } from './F42v6_AdjustmentDrawer';
import { F42v6_ConfirmInvoiceDialog } from './F42v6_ConfirmInvoiceDialog';
import { F42v6_AdjustmentDetailDrawer } from './F42v6_AdjustmentDetailDrawer';
import { F42v6_WithdrawDialog } from './F42v6_WithdrawDialog';
import { F42v6_WithdrawSubmissionDialog } from './F42v6_WithdrawSubmissionDialog';
import { F42v6_InvoiceHistoryDrawer } from './F42v6_InvoiceHistoryDrawer';
import { F42v6_InvoiceBreakdownDrawer } from './F42v6_InvoiceBreakdownDrawer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
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

// Status configuration matching employee patterns
const getStatusConfig = (status: F42v6_InvoiceStatus): {
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
        helperText: 'Please review and confirm your invoice details before the cut-off.',
        primaryAction: 'Confirm invoice',
        secondaryAction: 'Request adjustment'
      };
    case 'submitted':
      return {
        label: 'In review',
        className: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        explanation: 'Submitted for review',
        helperText: 'Your company will review this before the invoice is finalised.',
        primaryAction: 'Submitted',
        secondaryAction: 'Request adjustment'
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
        explanation: 'Action needed: Your invoice needs an update',
        primaryAction: 'Review & resubmit',
        secondaryAction: ''
      };
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
        explanation: 'Invoice approved',
        helperText: 'Your invoice is finalised for this period.',
        primaryAction: 'Approved',
        secondaryAction: 'Request adjustment'
      };
    case 'finalised':
      return {
        label: 'Finalised',
        className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
        explanation: 'Invoice approved. Payment will be processed.',
        primaryAction: 'View invoice',
        secondaryAction: 'View documents'
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

const getAdjustmentStatusColor = (status: F42v6_Adjustment['status']) => {
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

export const F42v6_UpcomingInvoiceCard = () => {
  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false);
  const [adjustmentDrawerInitialType, setAdjustmentDrawerInitialType] = useState<ContractorRequestType>(null);
  const [adjustmentDrawerInitialCategory, setAdjustmentDrawerInitialCategory] = useState('');
  const [adjustmentDrawerInitialAmount, setAdjustmentDrawerInitialAmount] = useState('');
  const [adjustmentDrawerFromBreakdown, setAdjustmentDrawerFromBreakdown] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [invoiceHistoryOpen, setInvoiceHistoryOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<F42v6_Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [withdrawSubmissionDialogOpen, setWithdrawSubmissionDialogOpen] = useState(false);

  // Helper to open adjustment drawer with specific type and optional pre-fill data
  const openAdjustmentDrawer = (type: ContractorRequestType = null, fromBreakdown: boolean = false, category: string = '', amount: string = '') => {
    setAdjustmentDrawerInitialType(type);
    setAdjustmentDrawerInitialCategory(category);
    setAdjustmentDrawerInitialAmount(amount);
    setAdjustmentDrawerFromBreakdown(fromBreakdown);
    setAdjustmentDrawerOpen(true);
  };

  const handleAdjustmentDrawerClose = (open: boolean) => {
    setAdjustmentDrawerOpen(open);
    if (!open) {
      setAdjustmentDrawerInitialType(null);
      setAdjustmentDrawerInitialCategory('');
      setAdjustmentDrawerInitialAmount('');
      setAdjustmentDrawerFromBreakdown(false);
    }
  };

  const {
    nextInvoiceDate,
    periodLabel,
    periodMonth,
    invoiceTotal,
    currency,
    contractType,
    lineItems,
    windowState,
    invoiceStatus,
    returnedReason,
    resubmitDeadline,
    adjustments,
    cutoffDate,
    isCutoffSoon,
    daysUntilClose,
    submittedAt,
    approvedAt,
    resubmittedRejectionIds,
    withdrawAdjustment,
    withdrawSubmission,
    setInvoiceStatus,
    markRejectionResubmitted
  } = useF42v6_DashboardStore();

  // Auto-transition from 'submitted' to 'approved' after 3 seconds
  useEffect(() => {
    if (invoiceStatus === 'submitted') {
      const timer = setTimeout(() => {
        setInvoiceStatus('approved');
        toast.success('Approved. Your invoice is finalised.');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [invoiceStatus, setInvoiceStatus]);

  const effectiveStatus = invoiceStatus;
  const statusConfig = getStatusConfig(effectiveStatus);
  const isWindowOpen = windowState === 'OPEN';
  const isNone = windowState === 'NONE';
  const pendingCount = adjustments.filter(a => a.status === 'Pending').length;

  // Check if a tag is removable (pending + window open + draft status)
  const isRemovable = (status: string) => status === 'Pending' && isWindowOpen && effectiveStatus === 'draft';

  // Handle withdraw click from chip
  const handleWithdrawClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWithdrawTargetId(id);
    setWithdrawDialogOpen(true);
  };

  // Cancel request from detail drawer
  const handleCancelFromDrawer = (id: string) => {
    setSelectedAdjustment(null);
    setWithdrawTargetId(id);
    setWithdrawDialogOpen(true);
  };

  // Confirm withdraw
  const handleConfirmWithdraw = () => {
    if (!withdrawTargetId) return;
    withdrawAdjustment(withdrawTargetId);
    toast.success('Request withdrawn.');
    setWithdrawTargetId(null);
  };

  // Handle primary action
  const handlePrimaryAction = () => {
    switch (invoiceStatus) {
      case 'draft':
      case 'returned':
        setConfirmDialogOpen(true);
        break;
      case 'submitted':
        setBreakdownDrawerOpen(true);
        break;
      case 'approved':
      case 'finalised':
        setInvoiceHistoryOpen(true);
        break;
    }
  };

  // Handle secondary action
  const handleSecondaryAction = () => {
    switch (invoiceStatus) {
      case 'draft':
        openAdjustmentDrawer();
        break;
      case 'submitted':
        setWithdrawSubmissionDialogOpen(true);
        break;
      case 'approved':
        openAdjustmentDrawer();
        break;
      case 'returned':
        setBreakdownDrawerOpen(true);
        break;
      case 'finalised':
        toast.info('Opening documents...');
        break;
    }
  };

  // Empty state
  if (isNone) {
    return <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming invoice yet. Complete onboarding to proceed.</p>
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
            {/* Invoice Total Tile - Static historical amount */}
            <div onClick={() => setBreakdownDrawerOpen(true)} className="p-5 rounded-xl border cursor-pointer transition-all duration-200 bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border-border/40 hover:from-primary/[0.12] hover:to-secondary/[0.08] hover:border-border/60">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Invoice total</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/70 transition-colors hover:text-foreground hover:underline">
                  What's included
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                {formatCurrency(invoiceTotal, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">This was your invoice total for December 2025</p>
            </div>

            {/* Paid Date Tile */}
            <div onClick={() => setInvoiceHistoryOpen(true)} className="p-5 rounded-xl bg-muted/30 border border-border/40 cursor-pointer transition-all duration-200 hover:bg-muted/70 hover:border-border/60">
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
              <p className="text-xs text-muted-foreground mt-1.5">Next invoice: Jan 15</p>
            </div>
          </div>

          {/* Tax Responsibility Note */}
          

          {/* Action buttons removed - adjustments handled by separate section */}
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <F42v6_AdjustmentDrawer open={adjustmentDrawerOpen} onOpenChange={handleAdjustmentDrawerClose} currency={currency} contractType={contractType} initialType={adjustmentDrawerInitialType} initialExpenseCategory={adjustmentDrawerInitialCategory} initialExpenseAmount={adjustmentDrawerInitialAmount} onBack={adjustmentDrawerFromBreakdown ? () => setBreakdownDrawerOpen(true) : undefined} />

      <F42v6_ConfirmInvoiceDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} periodLabel={periodLabel} />

      <F42v6_AdjustmentDetailDrawer adjustment={selectedAdjustment} onClose={() => setSelectedAdjustment(null)} onCancelRequest={handleCancelFromDrawer} currency={currency} isWindowOpen={isWindowOpen && invoiceStatus === 'draft'} />

      <F42v6_InvoiceBreakdownDrawer open={breakdownDrawerOpen} onOpenChange={setBreakdownDrawerOpen} lineItems={lineItems} currency={currency} invoiceTotal={invoiceTotal} periodLabel={periodLabel} />

      <F42v6_InvoiceHistoryDrawer open={invoiceHistoryOpen} onOpenChange={setInvoiceHistoryOpen} />

      <F42v6_WithdrawDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen} onConfirm={handleConfirmWithdraw} />

      <F42v6_WithdrawSubmissionDialog open={withdrawSubmissionDialogOpen} onOpenChange={setWithdrawSubmissionDialogOpen} onConfirm={withdrawSubmission} />
    </>;
};
