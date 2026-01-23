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
      return 'Paid leave';
    case 'Sick leave':
      return 'Sick leave';
    case 'Unpaid leave':
      return 'Unpaid leave';
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
  workdays: number;
  status: LeaveRequest['status'];
  spansPeriods: boolean;
  originalId?: string; // For split rows
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  
  const canWithdraw = payrollStatus === 'draft';
  
  // Process leave into two groups: This pay period & Next pay period
  // Split spanning leave into separate rows per period
  const { thisPeriodLeave, nextPeriodLeave, pendingCount } = useMemo(() => {
    const thisPeriod: ProcessedLeave[] = [];
    const nextPeriod: ProcessedLeave[] = [];
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
      
      if (spansPeriods) {
        // Split into two rows - one for each period
        // Current period portion
        const currentPeriodDays = Math.ceil(
          (Math.min(leaveEnd.getTime(), currentPeriodEnd.getTime()) - 
           Math.max(leaveStart.getTime(), currentPeriodStart.getTime())) / (1000 * 60 * 60 * 24)
        ) + 1;
        
        thisPeriod.push({
          id: `${leave.id}-current`,
          originalId: leave.id,
          leaveType: leave.leaveType,
          displayLabel,
          startDate: new Date(Math.max(leaveStart.getTime(), currentPeriodStart.getTime())),
          endDate: new Date(Math.min(leaveEnd.getTime(), currentPeriodEnd.getTime())),
          workdays: Math.min(currentPeriodDays, leave.totalDays),
          status: leave.status,
          spansPeriods: true,
        });
        
        // Next period portion
        const nextPeriodDays = leave.totalDays - currentPeriodDays;
        if (nextPeriodDays > 0) {
          nextPeriod.push({
            id: `${leave.id}-next`,
            originalId: leave.id,
            leaveType: leave.leaveType,
            displayLabel,
            startDate: nextPeriodStart,
            endDate: new Date(Math.min(leaveEnd.getTime(), nextPeriodEnd.getTime())),
            workdays: nextPeriodDays,
            status: leave.status,
            spansPeriods: true,
          });
        }
      } else if (overlapsCurrentPeriod) {
        thisPeriod.push({
          id: leave.id,
          leaveType: leave.leaveType,
          displayLabel,
          startDate: leaveStart,
          endDate: leaveEnd,
          workdays: leave.totalDays,
          status: leave.status,
          spansPeriods: false,
        });
      } else if (overlapsNextPeriod || leaveStart > currentPeriodEnd) {
        nextPeriod.push({
          id: leave.id,
          leaveType: leave.leaveType,
          displayLabel,
          startDate: leaveStart,
          endDate: leaveEnd,
          workdays: leave.totalDays,
          status: leave.status,
          spansPeriods: false,
        });
      }
    });
    
    // Sort by start date
    thisPeriod.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    nextPeriod.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    return {
      thisPeriodLeave: thisPeriod,
      nextPeriodLeave: nextPeriod,
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

  // Format days display (supports half days) - using "workdays" for global clarity
  const formatDays = (days: number) => {
    if (days === 0.5) return '0.5 workday';
    if (days === 1) return '1 workday';
    return `${days} workdays`;
  };

  const handleWithdrawClick = (e: React.MouseEvent, leaveId: string) => {
    e.stopPropagation();
    setWithdrawTargetId(leaveId);
    setWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = () => {
    if (withdrawTargetId) {
      withdrawLeaveRequest(withdrawTargetId);
      toast.success('Time off request withdrawn');
      setWithdrawTargetId(null);
    }
  };

  // Get status badge - only for non-approved states
  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[10px] px-1.5 py-0">
            Pending
          </Badge>
        );
      case 'Admin rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-1.5 py-0">
            Rejected
          </Badge>
        );
      // Approved is the default state - no badge needed
      default:
        return null;
    }
  };

  // Render a leave row
  const renderLeaveRow = (leave: ProcessedLeave) => {
    const isPending = leave.status === 'Pending';
    const isRejected = leave.status === 'Admin rejected';
    const withdrawId = leave.originalId || leave.id;
    
    const bgClass = isPending
      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10'
      : isRejected
        ? 'bg-destructive/5 dark:bg-destructive/5 border-destructive/10 dark:border-destructive/10'
        : 'bg-muted/20 dark:bg-muted/5 border-border/30';
    
    return (
      <div 
        key={leave.id}
        className={cn(
          "group flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition-colors",
          bgClass
        )}
      >
        {/* Main row: Type · Date range · Days · Status (if needed) · Spans tag */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground">
            {leave.displayLabel}
          </span>
          <span className="text-[10px] text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDateRange(leave.startDate, leave.endDate)}
          </span>
          <span className="text-[10px] text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDays(leave.workdays)}
          </span>
          {getStatusBadge(leave.status)}
          {leave.spansPeriods && (
            <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-border/40 text-[9px] px-1 py-0">
              Spans periods
            </Badge>
          )}
        </div>
        
        {/* Withdraw button for pending items */}
        {canWithdraw && leave.status === 'Pending' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => handleWithdrawClick(e, withdrawId)}
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
    );
  };

  const hasAnyLeave = thisPeriodLeave.length > 0 || nextPeriodLeave.length > 0;

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
                  {hasAnyLeave && pendingCount > 0 
                    ? `Requests that affect payroll · ${pendingCount} pending`
                    : 'Requests that affect payroll'
                  }
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
          
          {/* Content */}
          <div className="px-4 pb-4 space-y-3">
            {hasAnyLeave ? (
              <>
                {/* This pay period */}
                {thisPeriodLeave.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      This pay period
                    </p>
                    <div className="space-y-1">
                      {thisPeriodLeave.map(leave => renderLeaveRow(leave))}
                    </div>
                  </div>
                )}
                
                {/* Next pay period */}
                {nextPeriodLeave.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Next pay period
                    </p>
                    <div className="space-y-1">
                      {nextPeriodLeave.map(leave => renderLeaveRow(leave))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-foreground/80">No leave requests</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Request leave anytime and we'll track it here.
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
