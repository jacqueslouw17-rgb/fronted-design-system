/**
 * Flow 4.1 — Employee Dashboard v4
 * Leave Requests Section - Clean, minimal design with emoji balance display
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, X } from 'lucide-react';
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

// Leave types now use direct labels (Vacation, Sick, Compassionate, Maternity)

interface ProcessedLeave {
  id: string;
  leaveType: string;
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
  
  // Mock balance data with emoji icons
  const balances = [
    { emoji: '🌴', label: 'vacation', value: 10 },
    { emoji: '🤒', label: 'sick', value: 5 },
    { emoji: '💜', label: 'compassionate', value: 3 },
    { emoji: '🏝️', label: 'maternity', value: 90 },
  ];
  
  // Process leave into list
  const { allLeave, pendingCount } = useMemo(() => {
    const leaveList: ProcessedLeave[] = [];
    let pending = 0;
    
    leaveRequests.forEach((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      
      // Check overlaps with each period
      const overlapsCurrentPeriod = leaveStart <= currentPeriodEnd && leaveEnd >= currentPeriodStart;
      const overlapsNextPeriod = leaveStart <= nextPeriodEnd && leaveEnd >= nextPeriodStart;
      
      if (leave.status === 'Pending') pending++;
      
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
      
      leaveList.push({
        id: leave.id,
        leaveType: leave.leaveType,
        startDate: leaveStart,
        endDate: leaveEnd,
        totalDays: leave.totalDays,
        daysInCurrentPeriod,
        daysInNextPeriod,
        status: leave.status,
        spansPeriods: overlapsCurrentPeriod && overlapsNextPeriod,
        isInCurrentPeriod: overlapsCurrentPeriod,
        isInLater: !overlapsCurrentPeriod && (overlapsNextPeriod || leaveStart > currentPeriodEnd),
      });
    });
    
    // Sort by start date
    leaveList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    return {
      allLeave: leaveList,
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
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 text-[11px] px-2 py-0.5 font-medium">
            Pending approval
          </Badge>
        );
      case 'Admin rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] px-2 py-0.5 font-medium">
            Rejected
          </Badge>
        );
      case 'Admin approved':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[11px] px-2 py-0.5 font-medium">
            Approved
          </Badge>
        );
      default:
        return null;
    }
  };

  // Render a dense, bordered leave row (matching CA3 tracking view pattern)
  const renderLeaveRow = (leave: ProcessedLeave) => {
    const isPending = leave.status === 'Pending';
    
    return (
      <div 
        key={leave.id}
        className={cn(
          "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-colors",
          isPending 
            ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20" 
            : "bg-muted/30 dark:bg-muted/10 border-border/20"
        )}
      >
        {/* Leave type */}
        <span className="text-xs font-medium text-foreground min-w-[90px]">
          {leave.leaveType}
        </span>
        
        {/* Separator */}
        <span className="text-muted-foreground/40 text-xs">·</span>
        
        {/* Date range */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDateRange(leave.startDate, leave.endDate)}
        </span>
        
        {/* Separator */}
        <span className="text-muted-foreground/40 text-xs">·</span>
        
        {/* Duration */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDays(leave.totalDays)}
        </span>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Status badge */}
        {getStatusBadge(leave.status)}
        
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

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-5">
          {/* Header with title + balance + button */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Leave Requests</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
                <span className="text-muted-foreground/70">Balance:</span>
                {balances.map((item, idx) => (
                  <span key={item.label} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-muted-foreground/40 mx-0.5">·</span>}
                    <span>{item.emoji}</span>
                    <span className="text-foreground/80 font-medium">{item.value}</span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </span>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={onRequestTimeOff}
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              Request leave
            </Button>
          </div>
          
          {/* Info banner */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 mb-4">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Leaves align with pay periods and get split on payslips when crossing periods.
            </p>
          </div>
          
          {/* Leave list */}
          <div className="space-y-2">
            {allLeave.length > 0 ? (
              allLeave.map(leave => renderLeaveRow(leave))
            ) : (
              <div className="py-8 text-center">
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
