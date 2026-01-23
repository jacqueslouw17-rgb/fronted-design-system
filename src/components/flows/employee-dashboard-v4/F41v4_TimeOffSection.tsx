/**
 * Flow 4.1 — Employee Dashboard v4
 * Time Off Section - Simplified, globally-correct leave display
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sun, Clock, X } from 'lucide-react';
import { useF41v4_DashboardStore, type LeaveRequest } from '@/stores/F41v4_DashboardStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { F41v4_WithdrawDialog } from './F41v4_WithdrawDialog';
import { toast } from 'sonner';

interface F41v4_TimeOffSectionProps {
  onRequestTimeOff: () => void;
}

// Pay period bounds (mock - in real app would come from store)
const payPeriodStart = new Date(2026, 0, 1); // Jan 1, 2026
const payPeriodEnd = new Date(2026, 0, 31); // Jan 31, 2026

interface ProcessedLeave {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: LeaveRequest['status'];
  spansPeriods: boolean;
  isInCurrentPeriod: boolean;
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  
  const canWithdraw = payrollStatus === 'draft';
  
  // Process leave into two groups: This pay period & Upcoming
  const { thisPeriodLeave, upcomingLeave, summaryStats } = useMemo(() => {
    const thisPeriod: ProcessedLeave[] = [];
    const upcoming: ProcessedLeave[] = [];
    
    leaveRequests.forEach((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const totalDays = leave.totalDays;
      
      // Check if any part overlaps with current period
      const overlapsCurrentPeriod = leaveStart <= payPeriodEnd && leaveEnd >= payPeriodStart;
      const spansPeriods = overlapsCurrentPeriod && (leaveStart < payPeriodStart || leaveEnd > payPeriodEnd);
      const isFuture = leaveStart > payPeriodEnd;
      
      const processedLeave: ProcessedLeave = {
        id: leave.id,
        leaveType: leave.leaveType,
        startDate: leaveStart,
        endDate: leaveEnd,
        totalDays,
        status: leave.status,
        spansPeriods,
        isInCurrentPeriod: overlapsCurrentPeriod,
      };
      
      // Items in current period go to "This pay period"
      if (overlapsCurrentPeriod) {
        thisPeriod.push(processedLeave);
      } else if (isFuture) {
        // Future items go to "Upcoming"
        upcoming.push(processedLeave);
      }
    });
    
    // Sort by start date
    thisPeriod.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    upcoming.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    // Calculate summary stats
    const thisPeriodCount = thisPeriod.length;
    const upcomingCount = upcoming.length;
    const pendingCount = [...thisPeriod, ...upcoming].filter(l => l.status === 'Pending').length;
    
    return {
      thisPeriodLeave: thisPeriod,
      upcomingLeave: upcoming,
      summaryStats: { thisPeriodCount, upcomingCount, pendingCount },
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
    
    const bgClass = isPending
      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10'
      : isRejected
        ? 'bg-destructive/5 dark:bg-destructive/5 border-destructive/10 dark:border-destructive/10'
        : 'bg-muted/20 dark:bg-muted/5 border-border/30';
    
    return (
      <div 
        key={leave.id}
        className={cn(
          "group flex items-start gap-3 p-3 rounded-lg border transition-colors",
          bgClass
        )}
      >
        <div className="flex-1 min-w-0">
          {/* Main row: Type · Date range · Days · Status (if needed) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {leave.leaveType}
            </span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatDateRange(leave.startDate, leave.endDate)}
            </span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatDays(leave.totalDays)}
            </span>
            {getStatusBadge(leave.status)}
          </div>
          
          {/* Sublabel for spans - simplified message */}
          {leave.spansPeriods && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Only this period's days affect payroll.
            </p>
          )}
        </div>
        
        {/* Withdraw button for pending items */}
        {canWithdraw && leave.status === 'Pending' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => handleWithdrawClick(e, leave.id)}
                className={cn(
                  "p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all",
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
      </div>
    );
  };

  const hasAnyLeave = thisPeriodLeave.length > 0 || upcomingLeave.length > 0;

  // Build summary text
  const buildSummaryText = () => {
    const parts: string[] = [];
    if (summaryStats.thisPeriodCount > 0) {
      parts.push(`This period: ${summaryStats.thisPeriodCount}`);
    }
    if (summaryStats.upcomingCount > 0) {
      parts.push(`Upcoming: ${summaryStats.upcomingCount}`);
    }
    if (summaryStats.pendingCount > 0) {
      parts.push(`Pending: ${summaryStats.pendingCount}`);
    }
    return parts.join(' · ');
  };

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
                <Sun className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Time off</h3>
                {hasAnyLeave ? (
                  <p className="text-xs text-muted-foreground">{buildSummaryText()}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Your approved and pending leave</p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={onRequestTimeOff}
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              Request time off
            </Button>
          </div>
          
          {/* Content */}
          <div className="px-4 pb-4 space-y-4">
            {hasAnyLeave ? (
              <>
                {/* This pay period */}
                {thisPeriodLeave.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      This pay period
                    </p>
                    <div className="space-y-2">
                      {thisPeriodLeave.map(leave => renderLeaveRow(leave))}
                    </div>
                  </div>
                )}
                
                {/* Upcoming */}
                {upcomingLeave.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Upcoming
                    </p>
                    <div className="space-y-2">
                      {upcomingLeave.map(leave => renderLeaveRow(leave))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-foreground/80">No time off yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Request time off anytime and we'll track it here.
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
