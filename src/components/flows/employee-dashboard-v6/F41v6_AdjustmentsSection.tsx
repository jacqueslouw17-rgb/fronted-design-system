/**
 * Flow 4.1 — Employee Dashboard v6
 * Adjustments Section - Shows pending & rejected adjustments only
 * INDEPENDENT: Changes here do NOT affect v5 or any other flow.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { X, RotateCcw, Receipt } from 'lucide-react';
import { useF41v6_DashboardStore, type F41v6_Adjustment } from '@/stores/F41v6_DashboardStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { F41v6_WithdrawDialog } from './F41v6_WithdrawDialog';
import { toast } from 'sonner';

interface F41v6_AdjustmentsSectionProps {
  onRequestAdjustment: (type?: string, category?: string, amount?: string, rejectedId?: string, hours?: number, date?: string, startTime?: string, endTime?: string, days?: number) => void;
}

export const F41v6_AdjustmentsSection = ({ onRequestAdjustment }: F41v6_AdjustmentsSectionProps) => {
  const { adjustments, payrollStatus, withdrawAdjustment, resubmittedRejectionIds } = useF41v6_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  
  const canWithdraw = payrollStatus === 'draft';

  // Filter to only show pending and rejected (excluding resubmitted rejections)
  const visibleAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      if (adj.status === 'Admin approved') return false;
      if (adj.status === 'Admin rejected' && resubmittedRejectionIds.includes(adj.id)) return false;
      return adj.status === 'Pending' || adj.status === 'Admin rejected';
    });
  }, [adjustments, resubmittedRejectionIds]);

  const pendingCount = visibleAdjustments.filter(a => a.status === 'Pending').length;
  const rejectedCount = visibleAdjustments.filter(a => a.status === 'Admin rejected').length;

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d');
  };

  const handleWithdrawClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWithdrawTargetId(id);
    setWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = () => {
    if (withdrawTargetId) {
      withdrawAdjustment(withdrawTargetId);
      toast.success('Adjustment withdrawn');
      setWithdrawTargetId(null);
    }
  };

  const handleResubmit = (adj: F41v6_Adjustment) => {
    // Open adjustment modal with pre-filled data including rejected ID
    const typeMap: Record<string, string> = {
      'Expense': 'expense',
      'Overtime': 'overtime',
      'Bonus': 'bonus-correction',
      'Unpaid Leave': 'unpaid-leave'
    };
    onRequestAdjustment(
      typeMap[adj.type] || 'expense',
      adj.category || '',
      adj.amount?.toString() || '',
      adj.id,
      adj.hours,
      adj.date,
      adj.startTime,
      adj.endTime,
      adj.days
    );
  };

  const getStatusBadge = (status: F41v6_Adjustment['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 text-[11px] px-2 py-0.5 font-medium pointer-events-none">
            Pending approval
          </Badge>
        );
      case 'Admin rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] px-2 py-0.5 font-medium pointer-events-none">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: F41v6_Adjustment['type']) => {
    switch (type) {
      case 'Expense': return 'Expense';
      case 'Overtime': return 'Overtime';
      case 'Bonus': return 'Bonus';
      case 'Correction': return 'Correction';
      case 'Unpaid Leave': return 'Unpaid Leave';
      default: return type;
    }
  };

  const getDisplayValue = (adj: F41v6_Adjustment) => {
    if (adj.type === 'Overtime' && adj.hours) return `${adj.hours}h`;
    if (adj.type === 'Unpaid Leave' && adj.days) return `${adj.days}d`;
    return formatAmount(adj.amount);
  };

  const renderAdjustmentRow = (adj: F41v6_Adjustment) => {
    const isPending = adj.status === 'Pending';
    const isRejected = adj.status === 'Admin rejected';
    
    return (
      <div 
        key={adj.id}
        className={cn(
          "group rounded-lg border transition-all duration-200",
          isPending 
            ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20" 
            : isRejected
              ? "bg-destructive/5 dark:bg-destructive/5 border-destructive/20"
              : "bg-muted/30 dark:bg-muted/10 border-border/20"
        )}
      >
        <div className="flex items-center gap-2 px-2.5 py-2">
          <span className="text-xs font-medium text-foreground">
            {getTypeLabel(adj.type)}
          </span>
          
          <span className="text-muted-foreground/40 text-xs">·</span>
          
          <span className="text-xs text-foreground font-medium tabular-nums">
            {getDisplayValue(adj)}
          </span>
          
          {getStatusBadge(adj.status)}
          
          <div className="flex-1" />
          
          {/* Pending: show withdraw on hover */}
          {canWithdraw && isPending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => handleWithdrawClick(e, adj.id)}
                  className={cn(
                    "p-1 rounded opacity-0 group-hover:opacity-100 transition-all",
                    "hover:bg-amber-100 dark:hover:bg-amber-500/20"
                  )}
                  aria-label="Withdraw request"
                >
                  <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Withdraw request
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Rejected: show resubmit button */}
          {isRejected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResubmit(adj)}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-destructive dark:hover:text-destructive dark:hover:bg-destructive/20"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Resubmit
            </Button>
          )}
        </div>
        
        {/* Rejection reason - hidden by default, shown on hover/focus */}
        {isRejected && adj.rejectionReason && (
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] transition-[grid-template-rows] duration-200">
            <div className="overflow-hidden">
              <div className="px-2.5 pb-2 pt-0.5">
                <p className="text-xs text-destructive/80 dark:text-destructive/90 bg-destructive/5 dark:bg-destructive/10 rounded px-2 py-1.5 border-l-2 border-destructive/30">
                  {adj.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-5">
          <div className={`flex items-start justify-between ${visibleAdjustments.length > 0 ? 'mb-4' : ''}`}>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Adjustments</h2>
              <p className="text-sm text-muted-foreground">
                {visibleAdjustments.length === 0 
                  ? 'No pending adjustments'
                  : `${pendingCount > 0 ? `${pendingCount} pending` : ''}${pendingCount > 0 && rejectedCount > 0 ? ' · ' : ''}${rejectedCount > 0 ? `${rejectedCount} rejected` : ''}`
                }
              </p>
            </div>
            
            <Button 
              onClick={() => onRequestAdjustment()}
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              Request adjustment
            </Button>
          </div>
          
          {visibleAdjustments.length > 0 && (
            <div className="space-y-2">
              {visibleAdjustments.map(adj => renderAdjustmentRow(adj))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <F41v6_WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleConfirmWithdraw}
        requestType="adjustment"
      />
    </>
  );
};
