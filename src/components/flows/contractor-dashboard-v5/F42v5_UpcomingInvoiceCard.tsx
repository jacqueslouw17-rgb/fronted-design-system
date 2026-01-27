/**
 * Flow 4.2 — Contractor Dashboard v5
 * Upcoming Invoice Card with 5-status UX
 * Aligned with Flow 4.1 Employee Dashboard v2 patterns
 * 
 * Features: Partial rejection + full rejection demo states
 * INDEPENDENT: Changes here do NOT affect v4 or any other flow.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronRight,
  FileText, 
  X, 
  Calendar, 
  Wallet, 
  Clock,
  AlertCircle,
  Check
} from 'lucide-react';
import { useF42v5_DashboardStore, type F42v5_InvoiceStatus, type F42v5_Adjustment } from '@/stores/F42v5_DashboardStore';
import { F42v5_AdjustmentDrawer, type ContractorRequestType } from './F42v5_AdjustmentDrawer';
import { F42v5_ConfirmInvoiceDialog } from './F42v5_ConfirmInvoiceDialog';
import { F42v5_AdjustmentDetailDrawer } from './F42v5_AdjustmentDetailDrawer';
import { F42v5_WithdrawDialog } from './F42v5_WithdrawDialog';
import { F42v5_WithdrawSubmissionDialog } from './F42v5_WithdrawSubmissionDialog';
import { F42v5_InvoiceHistoryDrawer } from './F42v5_InvoiceHistoryDrawer';
import { F42v5_InvoiceBreakdownDrawer } from './F42v5_InvoiceBreakdownDrawer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
const getStatusConfig = (status: F42v5_InvoiceStatus): {
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
        secondaryAction: 'Request adjustment',
      };
    case 'submitted':
      return {
        label: 'In review',
        className: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        explanation: 'Submitted for review',
        helperText: 'Your company will review this before the invoice is finalised.',
        primaryAction: 'Submitted',
        secondaryAction: 'Request adjustment',
      };
    case 'returned':
      return {
        label: 'Returned to you',
        className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
        explanation: 'Your company needs changes before they can approve.',
        primaryAction: 'Fix & resubmit',
        secondaryAction: 'View previous submission',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
        explanation: 'Action needed: Your invoice needs an update',
        primaryAction: 'Review & resubmit',
        secondaryAction: '',
      };
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
        explanation: 'Invoice approved',
        helperText: 'Your invoice is finalised for this period.',
        primaryAction: 'Approved',
        secondaryAction: 'Request adjustment',
      };
    case 'finalised':
      return {
        label: 'Finalised',
        className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
        explanation: 'Invoice approved. Payment will be processed.',
        primaryAction: 'View invoice',
        secondaryAction: 'View documents',
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

const getAdjustmentStatusColor = (status: F42v5_Adjustment['status']) => {
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

export const F42v5_UpcomingInvoiceCard = () => {
  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false);
  const [adjustmentDrawerInitialType, setAdjustmentDrawerInitialType] = useState<ContractorRequestType>(null);
  const [adjustmentDrawerInitialCategory, setAdjustmentDrawerInitialCategory] = useState('');
  const [adjustmentDrawerInitialAmount, setAdjustmentDrawerInitialAmount] = useState('');
  const [adjustmentDrawerFromBreakdown, setAdjustmentDrawerFromBreakdown] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [invoiceHistoryOpen, setInvoiceHistoryOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<F42v5_Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [withdrawSubmissionDialogOpen, setWithdrawSubmissionDialogOpen] = useState(false);

  // Demo state toggle - for simulating partial rejection (individual adjustments rejected)
  const [demoPartialRejection, setDemoPartialRejection] = useState(false);

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
    markRejectionResubmitted,
  } = useF42v5_DashboardStore();

  // Demo: add mock rejected adjustments when partial rejection is enabled
  const mockRejectedAdjustments: F42v5_Adjustment[] = demoPartialRejection ? [
    {
      id: 'mock-rejected-1',
      type: 'Expense',
      label: 'Client lunch receipt',
      amount: 120,
      status: 'Admin rejected',
      category: 'Meals',
      submittedAt: new Date().toISOString(),
      rejectionReason: 'Receipt is not legible. Please upload a clearer copy.'
    }
  ] : [];

  // Combine real adjustments with mock rejected ones for demo
  const allAdjustments = [...adjustments, ...mockRejectedAdjustments];
  
  // Calculate rejected adjustments (excluding already resubmitted ones)
  const rejectedAdjustmentsCount = allAdjustments.filter(
    adj => adj.status === 'Admin rejected' && !resubmittedRejectionIds.includes(adj.id)
  ).length;
  const hasPartialRejections = rejectedAdjustmentsCount > 0;

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
    return (
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming invoice yet. Complete onboarding to proceed.</p>
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
        {/* Hero Header - Clean & Minimal */}
        <CardHeader className="py-5 px-6">
          <h2 className="text-lg font-semibold text-foreground">The last invoice (December 2025)</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Key Numbers Row - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Invoice Total Tile - Enhanced with adjustments comparison */}
            {(() => {
              // Calculate pending adjustment total (only approved or pending, exclude rejected)
              const pendingAdjustmentTotal = adjustments
                .filter(adj => adj.status === 'Pending' || adj.status === 'Admin approved')
                .reduce((sum, adj) => sum + (adj.amount || 0), 0);
              
              const hasAdjustments = pendingAdjustmentTotal !== 0;
              const adjustedTotal = invoiceTotal + pendingAdjustmentTotal;
              const isPositiveAdjustment = pendingAdjustmentTotal > 0;

              return (
                <div className={cn(
                  "p-5 rounded-xl border",
                  hasPartialRejections 
                    ? "bg-amber-50/60 dark:bg-amber-500/[0.06] border-amber-200/60 dark:border-amber-500/20" 
                    : "bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border-border/40"
                )}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Invoice preview</p>
                    </div>
                    <button
                      onClick={() => setBreakdownDrawerOpen(true)}
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium transition-colors shrink-0",
                        hasPartialRejections 
                          ? "text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                          : "text-muted-foreground/70 hover:text-foreground"
                      )}
                    >
                      {hasPartialRejections ? `${rejectedAdjustmentsCount} rejected` : "What's included"}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {hasAdjustments ? (
                    <div className="space-y-2">
                      {/* Adjusted Total - Primary display */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                          {formatCurrency(adjustedTotal, currency)}
                        </p>
                        <Badge className={cn(
                          "text-[10px] px-1.5 py-0.5 shrink-0",
                          isPositiveAdjustment 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                            : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
                        )}>
                          {isPositiveAdjustment ? '+' : ''}{formatCurrency(pendingAdjustmentTotal, currency)}
                        </Badge>
                      </div>
                      
                      {/* Original System Total - Secondary display */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="line-through opacity-70 tabular-nums">{formatCurrency(invoiceTotal, currency)}</span>
                        <span>·</span>
                        <span>Base amount</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                        {formatCurrency(invoiceTotal, currency)}
                      </p>
                      <div className="space-y-0.5 mt-1.5">
                        <p className="text-xs text-muted-foreground">Final amount confirmed on invoice</p>
                        <p className="text-[10px] text-muted-foreground/60">May change if edits are made before approval</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Invoice Date Tile */}
            <div className="p-5 rounded-xl bg-muted/30 border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Invoice date</p>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {formatDate(nextInvoiceDate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">Expected invoice date</p>
              <p className="text-[10px] text-muted-foreground/50 mt-2">Last paid: $4,120 (Dec 2025)</p>
            </div>
          </div>

          {/* Tax Responsibility Note */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Taxes are your responsibility</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                As a contractor, you are responsible for managing and paying applicable taxes.
              </p>
            </div>
          </div>

          {/* Changes Summary removed - all pending/approved items visible in breakdown drawer */}

          {/* Primary + Secondary Actions - only show for draft state */}
          {invoiceStatus === 'draft' && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handlePrimaryAction} className="flex-1">
                  {statusConfig.primaryAction}
                </Button>
                
                {statusConfig.secondaryAction && (
                  <Button
                    variant="outline"
                    onClick={handleSecondaryAction}
                    className="flex-1"
                  >
                    {statusConfig.secondaryAction}
                  </Button>
                )}
              </div>
            </div>
          )}
          {/* View previous invoices link */}
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => setInvoiceHistoryOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View previous invoices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <F42v5_AdjustmentDrawer
        open={adjustmentDrawerOpen}
        onOpenChange={handleAdjustmentDrawerClose}
        currency={currency}
        contractType={contractType}
        initialType={adjustmentDrawerInitialType}
        initialExpenseCategory={adjustmentDrawerInitialCategory}
        initialExpenseAmount={adjustmentDrawerInitialAmount}
        onBack={adjustmentDrawerFromBreakdown ? () => setBreakdownDrawerOpen(true) : undefined}
      />

      <F42v5_ConfirmInvoiceDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        periodLabel={periodLabel}
      />

      <F42v5_AdjustmentDetailDrawer
        adjustment={selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        onCancelRequest={handleCancelFromDrawer}
        currency={currency}
        isWindowOpen={isWindowOpen && invoiceStatus === 'draft'}
      />

      <F42v5_InvoiceBreakdownDrawer
        open={breakdownDrawerOpen}
        onOpenChange={setBreakdownDrawerOpen}
        lineItems={lineItems}
        currency={currency}
        invoiceTotal={invoiceTotal}
        periodLabel={periodLabel}
        adjustments={allAdjustments}
        invoiceStatus={effectiveStatus}
        windowState={windowState}
        resubmittedRejectionIds={resubmittedRejectionIds}
        onMakeAdjustment={() => openAdjustmentDrawer(null, true)}
        onWithdrawAdjustment={(id) => {
          setWithdrawTargetId(id);
          setWithdrawDialogOpen(true);
        }}
        onResubmitAdjustment={(id, category, amount) => {
          // Mark this rejection as resubmitted so it hides from "Needs attention"
          markRejectionResubmitted(id);
          // Close breakdown drawer and open expense form with all fields pre-filled
          setBreakdownDrawerOpen(false);
          // Open adjustment drawer with expense type pre-selected, category and amount pre-filled
          openAdjustmentDrawer('expense', true, category || '', amount || '');
        }}
      />

      <F42v5_InvoiceHistoryDrawer
        open={invoiceHistoryOpen}
        onOpenChange={setInvoiceHistoryOpen}
      />

      <F42v5_WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleConfirmWithdraw}
      />

      <F42v5_WithdrawSubmissionDialog
        open={withdrawSubmissionDialogOpen}
        onOpenChange={setWithdrawSubmissionDialogOpen}
        onConfirm={withdrawSubmission}
      />
    </>
  );
};
