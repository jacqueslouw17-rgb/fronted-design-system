/**
 * Flow 4.2 — Contractor Dashboard v3
 * Upcoming Invoice Card with T-5 confirmation
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Lock, FileText } from 'lucide-react';
import { useF42v3_DashboardStore, type F42v3_WindowState, type F42v3_Adjustment } from '@/stores/F42v3_DashboardStore';
import { F42v3_AdjustmentDrawer } from './F42v3_AdjustmentDrawer';
import { F42v3_ConfirmInvoiceDialog } from './F42v3_ConfirmInvoiceDialog';
import { F42v3_AdjustmentDetailDrawer } from './F42v3_AdjustmentDetailDrawer';
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

const getStatusBadge = (windowState: F42v3_WindowState, confirmed: boolean) => {
  if (windowState === 'PAID') {
    return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Paid</Badge>;
  }
  if (windowState === 'CLOSED') {
    return <Badge variant="secondary" className="bg-muted text-muted-foreground">Locked</Badge>;
  }
  if (windowState === 'NONE') {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (confirmed) {
    return <Badge className="bg-accent-green/20 text-accent-green-text border-accent-green/30">Confirmed</Badge>;
  }
  return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Action needed</Badge>;
};

const getAdjustmentStatusColor = (status: F42v3_Adjustment['status']) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Admin approved':
      return 'bg-accent-green/20 text-accent-green-text border-accent-green/30';
    case 'Admin rejected':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'Queued for next cycle':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const F42v3_UpcomingInvoiceCard = () => {
  const [lineItemsOpen, setLineItemsOpen] = useState(false);
  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<F42v3_Adjustment | null>(null);

  const {
    nextInvoiceDate,
    periodLabel,
    invoiceTotal,
    currency,
    contractType,
    lineItems,
    windowState,
    confirmed,
    adjustments,
    daysUntilClose,
  } = useF42v3_DashboardStore();

  const isWindowOpen = windowState === 'OPEN';
  const isWindowClosed = windowState === 'CLOSED';
  const isPaid = windowState === 'PAID';
  const isNone = windowState === 'NONE';

  const earnings = lineItems.filter(item => item.type === 'Earnings');
  const adjustmentItems = lineItems.filter(item => item.type === 'Adjustment');

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
        <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">
              {isPaid ? 'Last payment' : 'Upcoming invoice'}
            </CardTitle>
            {getStatusBadge(windowState, confirmed)}
          </div>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span>Invoice date: {formatDate(nextInvoiceDate)}</span>
            <span className="text-muted-foreground/60">•</span>
            <span>{periodLabel}</span>
            {isWindowOpen && !confirmed && (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-amber-400 flex items-center gap-1">
                  Submission closes in {daysUntilClose} days
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
              The submission window is closed. New requests will roll into the next cycle.
            </div>
          )}

          {/* Amounts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Total */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/[0.05] to-secondary/[0.03] border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Invoice Total</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(invoiceTotal, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your contract and approved time/milestones
              </p>
            </div>

            {/* Tax Note */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground">
                <span className="inline-block mr-1">ℹ️</span>
                Taxes are your responsibility
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                As a contractor, you are responsible for managing and paying applicable taxes.
              </p>
            </div>
          </div>

          {/* Line Items Preview */}
          <Collapsible open={lineItemsOpen} onOpenChange={setLineItemsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/30">
                <span className="text-sm font-medium">View line-item breakdown</span>
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
                      <div className="flex flex-col">
                        <span className="text-foreground">{item.label}</span>
                        {item.meta && (
                          <span className="text-xs text-muted-foreground">{item.meta}</span>
                        )}
                      </div>
                      {item.locked && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Defined by configuration</p>
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

              {/* Adjustments in line items */}
              {adjustmentItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adjustments</p>
                  {adjustmentItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/20">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{item.label}</span>
                        {item.locked && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Defined by configuration</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className={cn(
                        "font-medium",
                        item.amount < 0 ? "text-destructive" : "text-accent-green-text"
                      )}>
                        {item.amount < 0 ? '' : '+'}{formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Show hours block only for hourly contracts */}
              {contractType === 'hourly' && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Hours are calculated based on approved timesheets for this billing period.
                  </p>
                </div>
              )}

              {/* Show retainer note for fixed contracts */}
              {contractType === 'fixed' && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Your monthly retainer amount is fixed per your contract agreement.
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Adjustments Strip */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your adjustments (this cycle)
            </p>
            {adjustments.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">No adjustments yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {adjustments.map((adj) => (
                  <button
                    key={adj.id}
                    onClick={() => setSelectedAdjustment(adj)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors hover:opacity-80',
                      getAdjustmentStatusColor(adj.status)
                    )}
                  >
                    <span>{adj.type}</span>
                    {adj.amount !== null && (
                      <span>{formatCurrency(adj.amount, currency)}</span>
                    )}
                    {adj.type === 'Additional hours' && adj.hours && (
                      <span>{adj.hours}h</span>
                    )}
                    <span className="opacity-70">({adj.status})</span>
                  </button>
                ))}
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
              {confirmed ? 'Invoice Confirmed' : 'Confirm invoice'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdjustmentDrawerOpen(true)}
              disabled={isWindowClosed || isPaid}
              className="flex-1"
            >
              Request adjustment
            </Button>
          </div>

          {/* View previous invoices link */}
          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground hover:text-foreground">
              View previous invoices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drawers/Dialogs */}
      <F42v3_AdjustmentDrawer
        open={adjustmentDrawerOpen}
        onOpenChange={setAdjustmentDrawerOpen}
        currency={currency}
        contractType={contractType}
      />

      <F42v3_ConfirmInvoiceDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        periodLabel={periodLabel}
      />

      <F42v3_AdjustmentDetailDrawer
        adjustment={selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        currency={currency}
      />
    </>
  );
};
