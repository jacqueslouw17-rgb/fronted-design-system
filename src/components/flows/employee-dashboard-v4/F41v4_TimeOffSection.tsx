/**
 * Flow 4.1 — Employee Dashboard v4
 * Time Off Section - Dedicated dashboard block for time off management
 * Shows leave organized by time context: current pay period, upcoming, past
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plane, Check, Clock, X, Sun, Info, Calendar, ArrowRight } from 'lucide-react';
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

type TimeContext = 'current' | 'upcoming' | 'continuation';

interface ProcessedLeave {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  displayStartDate: Date;
  displayEndDate: Date;
  displayDays: number;
  totalDays: number;
  spansPeriods: boolean;
  remainingDays: number;
  status: LeaveRequest['status'];
  timeContext: TimeContext;
  periodLabel?: string; // e.g., "February", "March"
}

// Get month label for a date
const getMonthLabel = (date: Date): string => {
  return format(date, 'MMMM');
};

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus, windowState } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [showAllCurrent, setShowAllCurrent] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  
  const canWithdraw = payrollStatus === 'draft';
  const isWindowOpen = windowState === 'OPEN';
  
  // Process and categorize all leave
  const { currentPeriodLeave, upcomingLeave, totalApprovedDays, upcomingByMonth } = useMemo(() => {
    const currentItems: ProcessedLeave[] = [];
    const upcomingItems: ProcessedLeave[] = [];
    
    leaveRequests.forEach((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const totalDays = Math.floor((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Check if any part overlaps with current period
      const overlapsCurrentPeriod = leaveStart <= payPeriodEnd && leaveEnd >= payPeriodStart;
      const isFullyFuture = leaveStart > payPeriodEnd;
      
      if (overlapsCurrentPeriod) {
        // Calculate portion in this period
        const effectiveStart = leaveStart < payPeriodStart ? payPeriodStart : leaveStart;
        const effectiveEnd = leaveEnd > payPeriodEnd ? payPeriodEnd : leaveEnd;
        const daysInPeriod = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const spansPeriods = leaveEnd > payPeriodEnd;
        const remainingDays = spansPeriods ? totalDays - daysInPeriod : 0;
        
        currentItems.push({
          id: leave.id,
          leaveType: leave.leaveType,
          startDate: leaveStart,
          endDate: leaveEnd,
          displayStartDate: effectiveStart,
          displayEndDate: effectiveEnd,
          displayDays: daysInPeriod,
          totalDays,
          spansPeriods,
          remainingDays,
          status: leave.status,
          timeContext: 'current',
        });
        
        // If spans into future, also add continuation to upcoming
        if (spansPeriods) {
          const continuationStart = new Date(payPeriodEnd);
          continuationStart.setDate(continuationStart.getDate() + 1);
          
          upcomingItems.push({
            id: `${leave.id}-continuation`,
            leaveType: leave.leaveType,
            startDate: continuationStart,
            endDate: leaveEnd,
            displayStartDate: continuationStart,
            displayEndDate: leaveEnd,
            displayDays: remainingDays,
            totalDays: remainingDays,
            spansPeriods: false,
            remainingDays: 0,
            status: leave.status,
            timeContext: 'continuation',
            periodLabel: getMonthLabel(continuationStart),
          });
        }
      } else if (isFullyFuture) {
        // Check if it spans multiple future months
        const startMonth = leaveStart.getMonth();
        const endMonth = leaveEnd.getMonth();
        const spansFutureMonths = startMonth !== endMonth || leaveStart.getFullYear() !== leaveEnd.getFullYear();
        
        upcomingItems.push({
          id: leave.id,
          leaveType: leave.leaveType,
          startDate: leaveStart,
          endDate: leaveEnd,
          displayStartDate: leaveStart,
          displayEndDate: leaveEnd,
          displayDays: totalDays,
          totalDays,
          spansPeriods: spansFutureMonths,
          remainingDays: 0,
          status: leave.status,
          timeContext: 'upcoming',
          periodLabel: getMonthLabel(leaveStart),
        });
      }
      // Note: Past leave (before current period) is not shown - it's already processed
    });
    
    // Sort items
    currentItems.sort((a, b) => a.displayStartDate.getTime() - b.displayStartDate.getTime());
    upcomingItems.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    // Group upcoming by month for display
    const byMonth = upcomingItems.reduce((acc, leave) => {
      const month = leave.periodLabel || 'Unknown';
      if (!acc[month]) acc[month] = [];
      acc[month].push(leave);
      return acc;
    }, {} as Record<string, ProcessedLeave[]>);
    
    // Calculate approved days in current period
    const approvedDays = currentItems
      .filter(l => l.status === 'Admin approved')
      .reduce((sum, l) => sum + l.displayDays, 0);
    
    return {
      currentPeriodLeave: currentItems,
      upcomingLeave: upcomingItems,
      totalApprovedDays: approvedDays,
      upcomingByMonth: byMonth,
    };
  }, [leaveRequests]);
  
  // Separate current by status
  const currentApproved = currentPeriodLeave.filter(l => l.status === 'Admin approved');
  const currentPending = currentPeriodLeave.filter(l => l.status === 'Pending');
  
  // Display limits
  const approvedLimit = 2;
  const visibleApproved = showAllCurrent ? currentApproved : currentApproved.slice(0, approvedLimit);
  const hasMoreApproved = currentApproved.length > approvedLimit;
  
  const hasCurrentLeave = currentApproved.length > 0 || currentPending.length > 0;
  const hasUpcomingLeave = upcomingLeave.length > 0;
  const hasSpanningLeave = currentPeriodLeave.some(l => l.spansPeriods);
  const hasAnyLeave = hasCurrentLeave || hasUpcomingLeave;
  
  // Format date range for display
  const formatDateRange = (startDate: Date, endDate: Date, includeYear = false) => {
    const yearFormat = includeYear ? ', yyyy' : '';
    if (startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, `MMM d${yearFormat}`);
    }
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${format(startDate, 'MMM d')}–${format(endDate, `d${yearFormat}`)}`;
    }
    return `${format(startDate, 'MMM d')}–${format(endDate, `MMM d${yearFormat}`)}`;
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

  // Render a leave row
  const renderLeaveRow = (leave: ProcessedLeave, variant: 'approved' | 'pending' | 'muted') => {
    const isApproved = variant === 'approved';
    const isPending = variant === 'pending';
    const isMuted = variant === 'muted';
    
    // Approved = neutral row with subtle green indicator
    // Pending = amber to draw attention
    const bgClass = isPending
      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10'
      : 'bg-muted/20 dark:bg-muted/5 border-border/30';
    
    const iconBgClass = isApproved
      ? 'bg-emerald-100/70 dark:bg-emerald-500/15'
      : isPending
        ? 'bg-amber-100 dark:bg-amber-500/20'
        : 'bg-muted/50 dark:bg-muted/20';
    
    const iconColorClass = isApproved
      ? 'text-emerald-600 dark:text-emerald-400'
      : isPending
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-muted-foreground';
    
    const Icon = isApproved ? Check : isPending ? Clock : Calendar;
    
    // Use the processed display dates
    const displayStart = leave.displayStartDate;
    const displayEnd = leave.displayEndDate;
    const displayDays = leave.displayDays;
    const showYear = leave.timeContext !== 'current';
    
    return (
      <div 
        key={leave.id}
        className={cn(
          "group flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
          bgClass
        )}
      >
        <div className={cn("p-1 rounded-md", iconBgClass)}>
          <Icon className={cn("h-3 w-3", iconColorClass)} />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs", isMuted ? "text-muted-foreground/70" : "text-muted-foreground")}>
            {leave.leaveType}
          </span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className={cn("text-xs font-medium tabular-nums", isMuted ? "text-muted-foreground" : "text-foreground")}>
            {formatDateRange(displayStart, displayEnd, showYear)}
          </span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className={cn("text-xs tabular-nums", isMuted ? "text-muted-foreground" : "font-medium text-foreground")}>
            {displayDays}d
          </span>
          
          {/* Status/context badges */}
          {leave.spansPeriods && leave.timeContext === 'current' && (
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50 text-[9px] px-1 py-0 shrink-0">
              +{leave.remainingDays}d next period
            </Badge>
          )}
          {isPending && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[9px] px-1 py-0 shrink-0">
              Awaiting approval
            </Badge>
          )}
          {leave.timeContext === 'continuation' && (
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50 text-[9px] px-1 py-0 shrink-0">
              Continues from Jan
            </Badge>
          )}
          {leave.timeContext === 'upcoming' && leave.spansPeriods && (
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50 text-[9px] px-1 py-0 shrink-0">
              Spans months
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
                  "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all",
                  isPending ? "hover:bg-amber-100 dark:hover:bg-amber-500/20" : "hover:bg-muted"
                )}
                aria-label="Withdraw request"
              >
                <X className={cn("h-3 w-3", isPending ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
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

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10">
                <Sun className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Time off</h3>
                <p className="text-xs text-muted-foreground">Manage your leave requests</p>
              </div>
            </div>
            
            <Button 
              onClick={onRequestTimeOff}
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              <Plane className="h-3.5 w-3.5" />
              Request time off
            </Button>
          </div>
          
          {/* Content */}
          <div className="px-4 pb-4 space-y-4">
            {/* THIS PAY PERIOD Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  This pay period
                </p>
                {totalApprovedDays > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] px-1.5 py-0"
                  >
                    <Check className="h-2.5 w-2.5 mr-0.5" />
                    {totalApprovedDays}d approved
                  </Badge>
                )}
              </div>
              
              {hasCurrentLeave ? (
                <div className="space-y-1.5">
                  {/* Approved items */}
                  {visibleApproved.map(leave => renderLeaveRow(leave, 'approved'))}
                  
                  {/* Pending items */}
                  {currentPending.map(leave => renderLeaveRow(leave, 'pending'))}
                  
                  {/* View all / Show less */}
                  {hasMoreApproved && (
                    <button
                      onClick={() => setShowAllCurrent(!showAllCurrent)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors pt-0.5"
                    >
                      {showAllCurrent ? 'Show less' : `View all (${currentApproved.length} approved)`}
                    </button>
                  )}
                  
                  {/* Spanning pay periods helper */}
                  {hasSpanningLeave && (
                    <div className="flex items-start gap-2 pt-2 mt-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground">
                        See continuation below in upcoming leave
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-1">
                  No time off scheduled this period
                </p>
              )}
            </div>
            
            {/* UPCOMING LEAVE Section */}
            {hasUpcomingLeave && (
              <div className="pt-3 border-t border-border/30">
                <button
                  onClick={() => setShowUpcoming(!showUpcoming)}
                  className="flex items-center justify-between w-full group"
                >
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Upcoming leave
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background">
                      {upcomingLeave.length} {upcomingLeave.length === 1 ? 'scheduled' : 'scheduled'}
                    </Badge>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {showUpcoming ? '−' : '+'}
                    </span>
                  </div>
                </button>
                
                {showUpcoming && (
                  <div className="space-y-3 mt-3">
                    {/* Group by month */}
                    {Object.entries(upcomingByMonth).map(([month, leaves]) => (
                      <div key={month} className="space-y-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                          {month}
                        </p>
                        {leaves.map(leave => 
                          renderLeaveRow(
                            leave, 
                            leave.status === 'Pending' ? 'pending' : 'approved'
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Empty state - no leave at all */}
            {!hasAnyLeave && (
              <div className="py-2">
                <p className="text-sm text-foreground">No time off requests</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Request leave and it will appear here for tracking.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Withdraw Dialog */}
      <F41v4_WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleConfirmWithdraw}
        requestType="leave"
      />
    </>
  );
};
