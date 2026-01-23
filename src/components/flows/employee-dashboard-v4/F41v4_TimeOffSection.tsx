/**
 * Flow 4.1 — Employee Dashboard v4
 * Leave Requests Section - Simplified, globally-correct display
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, X } from 'lucide-react';
import { useF41v4_DashboardStore, type LeaveRequest } from '@/stores/F41v4_DashboardStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { F41v4_WithdrawDialog } from './F41v4_WithdrawDialog';
import { toast } from 'sonner';

interface F41v4_TimeOffSectionProps {
  onRequestTimeOff: () => void;
}

// Pay period bounds (mock - in real app would come from store)
const currentPeriodStart = new Date(2026, 0, 1); // Jan 1, 2026
const currentPeriodEnd = new Date(2026, 0, 31); // Jan 31, 2026
const nextPeriodStart = new Date(2026, 1, 1); // Feb 1, 2026
const nextPeriodEnd = new Date(2026, 1, 28); // Feb 28, 2026

// Map leave types to global-friendly labels
const getGlobalLeaveLabel = (leaveType: string): string => {
  switch (leaveType) {
    case 'Annual leave':
      return 'Vacation';
    case 'Sick leave':
      return 'Sick';
    case 'Unpaid leave':
      return 'Unpaid';
    default:
      return 'Leave';
  }
};

interface ProcessedLeave {
  id: string;
  leaveType: string;
  displayLabel: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  daysInCurrentPeriod: number;
  daysInNextPeriod: number;
  status: LeaveRequest['status'];
  spansPeriods: boolean;
  isInCurrentPeriod: boolean;
  isInLater: boolean;
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  
  const canWithdraw = payrollStatus === 'draft';
  
  // Mock balance data (would come from store/API in real app)
  const balance = {
    vacation: 12,
    sick: 6,
  };
  
  // Process leave into two groups: In this pay period & Later
  // Keep spanning leave as single rows with full range
  const { inThisPeriod, later, pendingCount } = useMemo(() => {
    const thisPeriodList: ProcessedLeave[] = [];
    const laterList: ProcessedLeave[] = [];
    let pending = 0;
    
    leaveRequests.forEach((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      
      // Check overlaps with each period
      const overlapsCurrentPeriod = leaveStart <= currentPeriodEnd && leaveEnd >= currentPeriodStart;
      const overlapsNextPeriod = leaveStart <= nextPeriodEnd && leaveEnd >= nextPeriodStart;
      const spansPeriods = overlapsCurrentPeriod && overlapsNextPeriod;
      
      if (leave.status === 'Pending') pending++;
      
      const displayLabel = getGlobalLeaveLabel(leave.leaveType);
      
      // Calculate days in each period for spanning leave
      let daysInCurrentPeriod = 0;
      let daysInNextPeriod = 0;
      
      if (overlapsCurrentPeriod) {
        const effectiveStart = new Date(Math.max(leaveStart.getTime(), currentPeriodStart.getTime()));
        const effectiveEnd = new Date(Math.min(leaveEnd.getTime(), currentPeriodEnd.getTime()));
        daysInCurrentPeriod = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      if (overlapsNextPeriod) {
        const effectiveStart = new Date(Math.max(leaveStart.getTime(), nextPeriodStart.getTime()));
        const effectiveEnd = new Date(Math.min(leaveEnd.getTime(), nextPeriodEnd.getTime()));
        daysInNextPeriod = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      const processedLeave: ProcessedLeave = {
        id: leave.id,
        leaveType: leave.leaveType,
        displayLabel,
        startDate: leaveStart,
        endDate: leaveEnd,
        totalDays: leave.totalDays,
        daysInCurrentPeriod,
        daysInNextPeriod,
        status: leave.status,
        spansPeriods,
        isInCurrentPeriod: overlapsCurrentPeriod,
        isInLater: !overlapsCurrentPeriod && (overlapsNextPeriod || leaveStart > currentPeriodEnd),
      };
      
      // Place in appropriate group (show spanning in current period)
      if (overlapsCurrentPeriod) {
        thisPeriodList.push(processedLeave);
      } else if (overlapsNextPeriod || leaveStart > currentPeriodEnd) {
        laterList.push(processedLeave);
      }
    });
    
    // Sort by start date
    thisPeriodList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    laterList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    return {
      inThisPeriod: thisPeriodList,
      later: laterList,
      pendingCount: pending,
    };
  }, [leaveRequests]);
  
  // Format date range for display
  const formatDateRange = (startDate: Date, endDate: Date) => {
    if (startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, 'MMM d');
    }
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${format(startDate, 'MMM d')}–${format(endDate, 'd')}`;
    }
    return `${format(startDate, 'MMM d')}–${format(endDate, 'MMM d')}`;
  };

  // Format days display (supports half days)
  const formatDays = (days: number) => {
    if (days === 0.5) return '0.5 day';
    if (days === 1) return '1 day';
    if (days === 1.5) return '1.5 days';
    return `${days} days`;
  };

  const handleWithdrawClick = (e: React.MouseEvent, leaveId: string) => {
    e.stopPropagation();
    setWithdrawTargetId(leaveId);
    setWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = () => {
    if (withdrawTargetId) {
      withdrawLeaveRequest(withdrawTargetId);
      toast.success('Leave request withdrawn');
      setWithdrawTargetId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[10px] px-1.5 py-0">
            Pending approval
          </Badge>
        );
      case 'Admin rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-1.5 py-0">
            Rejected
          </Badge>
        );
      case 'Admin approved':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] px-1.5 py-0">
            Approved
          </Badge>
        );
      default:
        return null;
    }
  };

  // Render a leave row - single row with full range, no splitting
  const renderLeaveRow = (leave: ProcessedLeave) => {
    const isPending = leave.status === 'Pending';
    const isRejected = leave.status === 'Admin rejected';
    
    const bgClass = isPending
      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10'
      : isRejected
        ? 'bg-destructive/5 dark:bg-destructive/5 border-destructive/10 dark:border-destructive/10'
        : 'bg-muted/20 dark:bg-muted/5 border-border/30';
    
    return (
      <div 
        key={leave.id}
        className={cn(
          "group flex flex-col gap-1 px-2.5 py-2 rounded-md border transition-colors",
          bgClass
        )}
      >
        {/* Main row: Type · Date range · Days · Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
            <span className="text-xs font-medium text-foreground">
              {leave.displayLabel}
            </span>
            <span className="text-[10px] text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDateRange(leave.startDate, leave.endDate)}
            </span>
            <span className="text-[10px] text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDays(leave.totalDays)}
            </span>
            {getStatusBadge(leave.status)}
            {leave.spansPeriods && (
              <Badge variant="outline" className="bg-primary/5 text-primary/80 border-primary/20 text-[9px] px-1.5 py-0">
                Spans pay periods
              </Badge>
            )}
          </div>
          
          {/* Withdraw button for pending items */}
          {canWithdraw && leave.status === 'Pending' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => handleWithdrawClick(e, leave.id)}
                  className={cn(
                    "p-1 rounded opacity-0 group-hover:opacity-100 transition-all",
                    "hover:bg-amber-100 dark:hover:bg-amber-500/20"
                  )}
                  aria-label="Withdraw request"
                >
                  <X className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Withdraw request
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Helper text for spanning periods */}
        {leave.spansPeriods && leave.daysInCurrentPeriod > 0 && leave.daysInNextPeriod > 0 && (
          <p className="text-[10px] text-muted-foreground/70 pl-0.5">
            {leave.daysInCurrentPeriod}d in this period · {leave.daysInNextPeriod}d next period
          </p>
        )}
      </div>
    );
  };

  const hasAnyLeave = inThisPeriod.length > 0 || later.length > 0;

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Leave requests</h3>
                <p className="text-xs text-muted-foreground">
                  Your submitted and approved leave
                </p>
              </div>
            </div>
            
            <Button 
              onClick={onRequestTimeOff}
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              Request leave
            </Button>
          </div>
          
          {/* Balance line - subtle */}
          <div className="px-4 pb-2">
            <p className="text-[11px] text-muted-foreground/70">
              Balance: <span className="text-foreground/70">{balance.vacation} Vacation</span> · <span className="text-foreground/70">{balance.sick} Sick</span>
            </p>
          </div>
          
          {/* Content */}
          <div className="px-4 pb-4 space-y-3">
            {hasAnyLeave ? (
              <>
                {/* In this pay period */}
                {inThisPeriod.length > 0 && (
                  <div className="space-y-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-default inline-flex items-center gap-1">
                          In this pay period
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Jan 1 – Jan 31
                      </TooltipContent>
                    </Tooltip>
                    <div className="space-y-1.5">
                      {inThisPeriod.map(leave => renderLeaveRow(leave))}
                    </div>
                  </div>
                )}
                
                {/* Later / Upcoming */}
                {later.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Later
                    </p>
                    <div className="space-y-1.5">
                      {later.map(leave => renderLeaveRow(leave))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-foreground/80">No leave requests</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit a request anytime — we'll track it here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Withdraw Confirmation Dialog */}
      <F41v4_WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleConfirmWithdraw}
        requestType="leave"
      />
    </>
  );
};
