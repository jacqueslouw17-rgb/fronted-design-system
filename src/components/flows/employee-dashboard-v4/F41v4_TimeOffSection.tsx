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

type TimeContext = 'current' | 'upcoming' | 'past';

interface ProcessedLeave {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  totalDays: number;
  daysInPeriod: number;
  spansPeriods: boolean;
  hasRemainingDays: boolean;
  status: LeaveRequest['status'];
  timeContext: TimeContext;
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [showAllCurrent, setShowAllCurrent] = useState(false);
  const [showOtherLeave, setShowOtherLeave] = useState(false);
  
  const canWithdraw = payrollStatus === 'draft';
  
  // Process all leave with time context
  const processLeave = (leave: LeaveRequest): ProcessedLeave => {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);
    
    // Determine time context
    let timeContext: TimeContext;
    if (leaveEnd < payPeriodStart) {
      timeContext = 'past';
    } else if (leaveStart > payPeriodEnd) {
      timeContext = 'upcoming';
    } else {
      timeContext = 'current';
    }
    
    // Calculate the portion within this pay period (for current period items)
    let effectiveStart = leaveStart;
    let effectiveEnd = leaveEnd;
    let daysInPeriod = 0;
    let spansPeriods = false;
    let hasRemainingDays = false;
    
    if (timeContext === 'current') {
      effectiveStart = leaveStart < payPeriodStart ? payPeriodStart : leaveStart;
      effectiveEnd = leaveEnd > payPeriodEnd ? payPeriodEnd : leaveEnd;
      daysInPeriod = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      spansPeriods = leaveStart < payPeriodStart || leaveEnd > payPeriodEnd;
      hasRemainingDays = leaveEnd > payPeriodEnd;
    }
    
    // Calculate total days
    const totalDays = Math.floor((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      id: leave.id,
      leaveType: leave.leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      effectiveStartDate: effectiveStart,
      effectiveEndDate: effectiveEnd,
      totalDays,
      daysInPeriod,
      spansPeriods,
      hasRemainingDays,
      status: leave.status,
      timeContext,
    };
  };
  
  // Process and categorize all leave
  const allProcessedLeave = useMemo(() => {
    return leaveRequests.map(processLeave);
  }, [leaveRequests]);
  
  // Separate by time context and status
  const currentApproved = allProcessedLeave.filter(l => l.timeContext === 'current' && l.status === 'Admin approved');
  const currentPending = allProcessedLeave.filter(l => l.timeContext === 'current' && l.status === 'Pending');
  const upcomingLeave = allProcessedLeave.filter(l => l.timeContext === 'upcoming');
  const pastLeave = allProcessedLeave.filter(l => l.timeContext === 'past');
  
  const otherLeave = [...upcomingLeave, ...pastLeave].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  // Calculate totals for current period
  const totalApprovedDays = currentApproved.reduce((sum, l) => sum + l.daysInPeriod, 0);
  const hasRemainingNextPeriod = currentApproved.some(l => l.hasRemainingDays) || currentPending.some(l => l.hasRemainingDays);
  
  // Display limits
  const approvedLimit = 2;
  const visibleApproved = showAllCurrent ? currentApproved : currentApproved.slice(0, approvedLimit);
  const hasMoreApproved = currentApproved.length > approvedLimit;
  
  const hasCurrentLeave = currentApproved.length > 0 || currentPending.length > 0;
  const hasOtherLeave = otherLeave.length > 0;
  const hasAnyLeave = hasCurrentLeave || hasOtherLeave;
  
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
    
    const bgClass = isApproved 
      ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
      : isPending
        ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10'
        : 'bg-muted/30 dark:bg-muted/10 border-border/40';
    
    const iconBgClass = isApproved
      ? 'bg-emerald-100 dark:bg-emerald-500/20'
      : isPending
        ? 'bg-amber-100 dark:bg-amber-500/20'
        : 'bg-muted dark:bg-muted/30';
    
    const iconColorClass = isApproved
      ? 'text-emerald-600 dark:text-emerald-400'
      : isPending
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-muted-foreground';
    
    const Icon = isApproved ? Check : isPending ? Clock : Calendar;
    
    // For current period, show effective dates; for other, show full dates
    const displayStart = leave.timeContext === 'current' ? leave.effectiveStartDate : leave.startDate;
    const displayEnd = leave.timeContext === 'current' ? leave.effectiveEndDate : leave.endDate;
    const displayDays = leave.timeContext === 'current' ? leave.daysInPeriod : leave.totalDays;
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
            <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[9px] px-1 py-0 shrink-0">
              Spans pay periods
            </Badge>
          )}
          {isPending && leave.timeContext === 'current' && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Pending
            </span>
          )}
          {leave.timeContext === 'upcoming' && (
            <Badge variant="outline" className="bg-primary/5 text-primary/70 border-primary/20 text-[9px] px-1 py-0 shrink-0">
              Upcoming
            </Badge>
          )}
          {leave.timeContext === 'past' && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 text-[9px] px-1 py-0 shrink-0">
              Past
            </Badge>
          )}
          {leave.status === 'Pending' && leave.timeContext !== 'current' && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              · Pending
            </span>
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
                  {hasRemainingNextPeriod && (
                    <div className="flex items-start gap-2 pt-2 mt-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground">
                        Some leave continues into the next pay period
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
            
            {/* OTHER LEAVE Section (Upcoming + Past) */}
            {hasOtherLeave && (
              <div className="pt-3 border-t border-border/30">
                <button
                  onClick={() => setShowOtherLeave(!showOtherLeave)}
                  className="flex items-center justify-between w-full group"
                >
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Other scheduled leave
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background">
                      {otherLeave.length} {otherLeave.length === 1 ? 'request' : 'requests'}
                    </Badge>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {showOtherLeave ? '−' : '+'}
                    </span>
                  </div>
                </button>
                
                {showOtherLeave && (
                  <div className="space-y-1.5 mt-2">
                    {otherLeave.map(leave => 
                      renderLeaveRow(leave, leave.status === 'Pending' ? 'pending' : 'muted')
                    )}
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
