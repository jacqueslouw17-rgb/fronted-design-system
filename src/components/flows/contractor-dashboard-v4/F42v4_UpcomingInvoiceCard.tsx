/**
 * Flow 4.2 — Contractor Dashboard v4
 * Upcoming Invoice Card with 5-status UX
 * Aligned with Flow 4.1 Employee Dashboard v2 patterns
 * 
 * ISOLATED: Changes here do NOT affect v3 or any other flow.
 */

import { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useF42v4_DashboardStore, type F42v4_InvoiceStatus, type F42v4_Adjustment } from '@/stores/F42v4_DashboardStore';
import { F42v4_AdjustmentDrawer } from './F42v4_AdjustmentDrawer';
import { F42v4_ConfirmInvoiceDialog } from './F42v4_ConfirmInvoiceDialog';
import { F42v4_AdjustmentDetailDrawer } from './F42v4_AdjustmentDetailDrawer';
import { F42v4_WithdrawDialog } from './F42v4_WithdrawDialog';
import { F42v4_WithdrawSubmissionDialog } from './F42v4_WithdrawSubmissionDialog';
import { F42v4_InvoiceHistoryDrawer } from './F42v4_InvoiceHistoryDrawer';
import { F42v4_InvoiceBreakdownDrawer } from './F42v4_InvoiceBreakdownDrawer';
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

// Status configuration matching employee patterns
const getStatusConfig = (status: F42v4_InvoiceStatus) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Action needed',
        className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
        explanation: 'Review your details and submit for approval.',
        primaryAction: 'Confirm invoice',
        secondaryAction: 'Request adjustment',
      };
    case 'submitted':
      return {
        label: 'Submitted',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-accent-green/20 dark:text-accent-green-text dark:border-accent-green/30',
        explanation: 'Submitted to your company for review.',
        primaryAction: 'View submission',
        secondaryAction: 'Withdraw submission',
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
        explanation: 'Approved by your company and sent for processing.',
        primaryAction: 'View draft invoice',
        secondaryAction: 'Request a correction',
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

const getAdjustmentStatusColor = (status: F42v4_Adjustment['status']) => {
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

export const F42v4_UpcomingInvoiceCard = () => {
  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [breakdownDrawerOpen, setBreakdownDrawerOpen] = useState(false);
  const [invoiceHistoryOpen, setInvoiceHistoryOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<F42v4_Adjustment | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [withdrawSubmissionDialogOpen, setWithdrawSubmissionDialogOpen] = useState(false);

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
    withdrawAdjustment,
    withdrawSubmission,
  } = useF42v4_DashboardStore();

  const statusConfig = getStatusConfig(invoiceStatus);
  const isWindowOpen = windowState === 'OPEN';
  const isNone = windowState === 'NONE';
  const pendingCount = adjustments.filter(a => a.status === 'Pending').length;

  // Check if a tag is removable (pending + window open + draft status)
  const isRemovable = (status: string) => status === 'Pending' && isWindowOpen && invoiceStatus === 'draft';

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
        setAdjustmentDrawerOpen(true);
        break;
      case 'submitted':
        setWithdrawSubmissionDialogOpen(true);
        break;
      case 'approved':
        setAdjustmentDrawerOpen(true);
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
        {/* Hero Header - Clean & Compact */}
        <CardHeader className="bg-gradient-to-r from-primary/[0.04] to-secondary/[0.03] border-b border-border/40 pb-4">
          {/* Header with badge aligned to vertical center of content block */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-semibold">Upcoming invoice</CardTitle>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm font-medium text-foreground/70">{periodMonth}</span>
              </div>
              {/* Single helper line with cut-off inline */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{statusConfig.explanation}</span>
                {(invoiceStatus === 'draft' || invoiceStatus === 'returned') && (
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
            </div>
            <Badge className={cn('text-sm px-3 py-1 mt-2', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Returned reason block - only when applicable */}
          {invoiceStatus === 'returned' && returnedReason && (
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
            {/* Invoice Total Tile */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/[0.06] to-secondary/[0.04] border border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Invoice total</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {formatCurrency(invoiceTotal, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">Based on your contract and approved time</p>
                </div>
                <button
                  onClick={() => setBreakdownDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Breakdown
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

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

          {/* Changes Summary - Only show if there are changes */}
          {adjustments.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your changes (this cycle)
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Your changes this cycle">
                {adjustments.map((adj) => (
                  <div
                    key={adj.id}
                    className={cn(
                      'group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                      getAdjustmentStatusColor(adj.status),
                      isRemovable(adj.status) ? 'pr-1.5 group-hover:pr-2' : ''
                    )}
                    role="listitem"
                  >
                    <button
                      onClick={() => setSelectedAdjustment(adj)}
                      aria-label={`${adj.type}${adj.amount !== null ? `, ${formatCurrency(adj.amount, currency)}` : ''}${adj.type === 'Additional hours' && adj.hours ? `, ${adj.hours} hours` : ''}, status: ${adj.status}. Click to view details.`}
                      className="inline-flex items-center gap-1.5 focus:outline-none"
                    >
                      <span>{adj.type}</span>
                      {adj.category && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{adj.category}</span>
                        </>
                      )}
                      {adj.amount !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{formatCurrency(adj.amount, currency)}</span>
                        </>
                      )}
                      {adj.type === 'Additional hours' && adj.hours && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>+{adj.hours}h</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="opacity-70">{adj.status}</span>
                    </button>
                    {isRemovable(adj.status) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleWithdrawClick(e, adj.id)}
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePrimaryAction}
                className="flex-1"
              >
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

            {/* "What happens next" line */}
            {invoiceStatus === 'draft' && (
              <p className="text-xs text-muted-foreground text-center">
                Your company will review before the invoice is finalised.
              </p>
            )}
          </div>

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
      <F42v4_AdjustmentDrawer
        open={adjustmentDrawerOpen}
        onOpenChange={setAdjustmentDrawerOpen}
        currency={currency}
        contractType={contractType}
      />

      <F42v4_ConfirmInvoiceDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        periodLabel={periodLabel}
      />

      <F42v4_AdjustmentDetailDrawer
        adjustment={selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        onCancelRequest={handleCancelFromDrawer}
        currency={currency}
        isWindowOpen={isWindowOpen && invoiceStatus === 'draft'}
      />

      <F42v4_InvoiceBreakdownDrawer
        open={breakdownDrawerOpen}
        onOpenChange={setBreakdownDrawerOpen}
        lineItems={lineItems}
        currency={currency}
        invoiceTotal={invoiceTotal}
        periodLabel={periodLabel}
        adjustments={adjustments}
      />

      <F42v4_InvoiceHistoryDrawer
        open={invoiceHistoryOpen}
        onOpenChange={setInvoiceHistoryOpen}
      />

      <F42v4_WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleConfirmWithdraw}
      />

      <F42v4_WithdrawSubmissionDialog
        open={withdrawSubmissionDialogOpen}
        onOpenChange={setWithdrawSubmissionDialogOpen}
        onConfirm={withdrawSubmission}
      />
    </>
  );
};
