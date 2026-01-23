/**
 * Flow 4.1 — Employee Dashboard v4
 * Time Off Section - Dedicated dashboard block for time off management
 * Shows approved leave for THIS pay period with splitting logic
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plane, Check, Clock, X, Sun, Info } from 'lucide-react';
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
  originalStartDate: string;
  originalEndDate: string;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  daysInPeriod: number;
  spansPeriods: boolean;
  hasRemainingDays: boolean;
  status: LeaveRequest['status'];
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const canWithdraw = payrollStatus === 'draft';
  
  // Process leave to split by pay period and calculate days within current period
  const processLeaveForPeriod = (leave: LeaveRequest): ProcessedLeave | null => {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);
    
    // Check if leave overlaps with current pay period at all
    if (leaveEnd < payPeriodStart || leaveStart > payPeriodEnd) {
      return null; // No overlap
    }
    
    // Calculate the portion within this pay period
    const effectiveStart = leaveStart < payPeriodStart ? payPeriodStart : leaveStart;
    const effectiveEnd = leaveEnd > payPeriodEnd ? payPeriodEnd : leaveEnd;
    
    // Calculate days within this period (inclusive)
    const daysInPeriod = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if it spans multiple periods
    const spansPeriods = leaveStart < payPeriodStart || leaveEnd > payPeriodEnd;
    const hasRemainingDays = leaveEnd > payPeriodEnd;
    
    return {
      id: leave.id,
      leaveType: leave.leaveType,
      originalStartDate: leave.startDate,
      originalEndDate: leave.endDate,
      effectiveStartDate: effectiveStart,
      effectiveEndDate: effectiveEnd,
      daysInPeriod,
      spansPeriods,
      hasRemainingDays,
      status: leave.status,
    };
  };
  
  // Process approved and pending leave separately
  const processedApproved = useMemo(() => {
    return leaveRequests
      .filter(l => l.status === 'Admin approved')
      .map(processLeaveForPeriod)
      .filter((l): l is ProcessedLeave => l !== null);
  }, [leaveRequests]);
  
  const processedPending = useMemo(() => {
    return leaveRequests
      .filter(l => l.status === 'Pending')
      .map(processLeaveForPeriod)
      .filter((l): l is ProcessedLeave => l !== null);
  }, [leaveRequests]);
  
  // Calculate totals
  const totalApprovedDays = processedApproved.reduce((sum, l) => sum + l.daysInPeriod, 0);
  const hasRemainingNextPeriod = processedApproved.some(l => l.hasRemainingDays) || processedPending.some(l => l.hasRemainingDays);
  
  // Format date range for display (compact format like "Jan 12–13")
  const formatDateRange = (startDate: Date, endDate: Date) => {
    if (startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, 'MMM d');
    }
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${format(startDate, 'MMM d')}–${format(endDate, 'd')}`;
    }
    return `${format(startDate, 'MMM d')}–${format(endDate, 'MMM d')}`;
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

  const hasAnyLeave = processedApproved.length > 0 || processedPending.length > 0;
  
  // Limit display to 2 items unless "View all" is clicked
  const displayLimit = 2;
  const visibleApproved = showAll ? processedApproved : processedApproved.slice(0, displayLimit);
  const remainingCount = processedApproved.length + processedPending.length - displayLimit;

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
                <p className="text-xs text-muted-foreground">This pay period</p>
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
          <div className="px-4 pb-4">
            {hasAnyLeave ? (
              <div className="space-y-2">
                {/* Approved summary badge */}
                {totalApprovedDays > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs px-2 py-0.5"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {totalApprovedDays} {totalApprovedDays === 1 ? 'day' : 'days'} approved
                    </Badge>
                  </div>
                )}
                
                {/* Approved Leave List */}
                {visibleApproved.map((leave) => (
                  <div 
                    key={leave.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10"
                  >
                    <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{leave.leaveType}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {formatDateRange(leave.effectiveStartDate, leave.effectiveEndDate)}
                      </span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {leave.daysInPeriod}d
                      </span>
                      {leave.spansPeriods && (
                        <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[9px] px-1 py-0 shrink-0">
                          Spans pay periods
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Pending Leave List */}
                {(showAll ? processedPending : processedPending.slice(0, Math.max(0, displayLimit - processedApproved.length))).map((leave) => (
                  <div 
                    key={leave.id}
                    className="group flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10"
                  >
                    <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-500/20">
                      <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{leave.leaveType}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {formatDateRange(leave.effectiveStartDate, leave.effectiveEndDate)}
                      </span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Pending
                      </span>
                    </div>
                    
                    {/* Withdraw button */}
                    {canWithdraw && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleWithdrawClick(e, leave.id)}
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
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
                ))}
                
                {/* View all / Show less */}
                {!showAll && remainingCount > 0 && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors pt-1"
                  >
                    View all ({processedApproved.length + processedPending.length} total)
                  </button>
                )}
                {showAll && (processedApproved.length + processedPending.length) > displayLimit && (
                  <button
                    onClick={() => setShowAll(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                  >
                    Show less
                  </button>
                )}
                
                {/* Spanning pay periods helper text */}
                {hasRemainingNextPeriod && (
                  <div className="flex items-start gap-2 pt-2 mt-2 border-t border-border/30">
                    <Info className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      Some approved leave continues into the next pay period. Remaining days will appear next month.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="py-2">
                <p className="text-sm text-foreground">No approved time off this period</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Approved leave will appear here once confirmed and will be included in payroll.
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
