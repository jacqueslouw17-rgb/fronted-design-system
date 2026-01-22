/**
 * Flow 4.1 — Employee Dashboard v4
 * Time Off Section - Dedicated dashboard block for time off management
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, ChevronRight, Plane, Check, Clock, X, Sun } from 'lucide-react';
import { useF41v4_DashboardStore } from '@/stores/F41v4_DashboardStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { F41v4_WithdrawDialog } from './F41v4_WithdrawDialog';
import { toast } from 'sonner';

interface F41v4_TimeOffSectionProps {
  onRequestTimeOff: () => void;
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, withdrawLeaveRequest, payrollStatus } = useF41v4_DashboardStore();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  
  // Filter leave by status
  const approvedLeave = leaveRequests.filter(l => l.status === 'Admin approved');
  const pendingLeave = leaveRequests.filter(l => l.status === 'Pending');
  
  // Calculate totals
  const totalApprovedDays = approvedLeave.reduce((sum, l) => sum + l.totalDays, 0);
  const totalPendingDays = pendingLeave.reduce((sum, l) => sum + l.totalDays, 0);
  
  const canWithdraw = payrollStatus === 'draft';
  
  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return format(start, 'EEE, MMM d');
    }
    
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'EEE, MMM d')} – ${format(end, 'd')}`;
    }
    
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
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

  const hasAnyLeave = approvedLeave.length > 0 || pendingLeave.length > 0;

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
                <p className="text-xs text-muted-foreground">All time off requests</p>
              </div>
            </div>
            
            <Button 
              onClick={onRequestTimeOff}
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              <Plane className="h-3.5 w-3.5" />
              Request
            </Button>
          </div>
          
          {/* Content */}
          {hasAnyLeave ? (
            <div className="px-4 pb-4 space-y-2">
              {/* Approved Leave */}
              {approvedLeave.map((leave) => (
                <div 
                  key={leave.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10"
                >
                  <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{leave.leaveType}</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] px-1.5 py-0">
                        Approved
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'} · {formatDateRange(leave.startDate, leave.endDate)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Pending Leave */}
              {pendingLeave.map((leave) => (
                <div 
                  key={leave.id}
                  className="group flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10"
                >
                  <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-500/20">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{leave.leaveType}</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[10px] px-1.5 py-0">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'} · {formatDateRange(leave.startDate, leave.endDate)}
                    </p>
                  </div>
                  
                  {/* Withdraw button */}
                  {canWithdraw && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleWithdrawClick(e, leave.id)}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
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
              ))}
              
              {/* Summary note */}
              {totalApprovedDays > 0 && (
                <p className="text-[11px] text-muted-foreground/70 text-center pt-1">
                  Approved time off will be reflected in payroll
                </p>
              )}
            </div>
          ) : null}
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
