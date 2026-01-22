/**
 * Flow 4.1 — Employee Dashboard v4
 * Time Off Section - Dedicated dashboard block for time off management
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, Plane, Check } from 'lucide-react';
import { useF41v4_DashboardStore } from '@/stores/F41v4_DashboardStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface F41v4_TimeOffSectionProps {
  onRequestTimeOff: () => void;
}

export const F41v4_TimeOffSection = ({ onRequestTimeOff }: F41v4_TimeOffSectionProps) => {
  const { leaveRequests, periodLabel } = useF41v4_DashboardStore();
  
  // Filter approved leave for this pay period
  const approvedLeave = leaveRequests.filter(l => l.status === 'Admin approved');
  const pendingLeave = leaveRequests.filter(l => l.status === 'Pending');
  
  // Calculate total approved days
  const totalApprovedDays = approvedLeave.reduce((sum, l) => sum + l.totalDays, 0);
  const totalPendingDays = pendingLeave.reduce((sum, l) => sum + l.totalDays, 0);
  
  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return format(start, 'MMM d');
    }
    
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')}–${format(end, 'd')}`;
    }
    
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  };

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Title + Summary */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plane className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Time off</h3>
                <p className="text-xs text-muted-foreground">This pay period</p>
              </div>
            </div>
            
            {/* Approved Leave Summary */}
            {totalApprovedDays > 0 || totalPendingDays > 0 ? (
              <div className="space-y-2">
                {/* Approved */}
                {totalApprovedDays > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs px-2 py-0.5">
                      <Check className="h-3 w-3 mr-1" />
                      {totalApprovedDays} {totalApprovedDays === 1 ? 'day' : 'days'} approved
                    </Badge>
                  </div>
                )}
                
                {/* Pending */}
                {totalPendingDays > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-xs px-2 py-0.5">
                      {totalPendingDays} {totalPendingDays === 1 ? 'day' : 'days'} pending
                    </Badge>
                  </div>
                )}
                
                {/* Approved leave details */}
                {approvedLeave.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {approvedLeave.map((leave) => (
                      <div key={leave.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{leave.leaveType}</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{formatDateRange(leave.startDate, leave.endDate)}</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground/70 pt-0.5">
                      These dates will reflect in payroll
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No time off logged for this period
              </p>
            )}
          </div>
          
          {/* Right: CTA */}
          <Button 
            onClick={onRequestTimeOff}
            size="sm"
            className="shrink-0"
          >
            <Plane className="h-4 w-4 mr-1.5" />
            Request time off
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
