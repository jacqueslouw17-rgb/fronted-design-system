import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Clock, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveRecord {
  id: string;
  name: string;
  country: string;
  currency: string;
  leaveDays: number;
  workingDays: number;
  unpaidAmount: number;
  paymentDue: number;
  clientConfirmed: boolean;
  hasPendingLeave?: boolean;
  hasMissingAttendance?: boolean;
  leaveBreakdown?: {
    Annual?: number;
    Sick?: number;
    Unpaid?: number;
    Parental?: number;
    Other?: number;
  };
}

interface CA_LeaveAttendanceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRecords: LeaveRecord[];
  onConfirmLeave: (workerId: string) => void;
  onAddWorker: () => void;
  onViewWorkerDetails: (workerId: string) => void;
  payrollMonth: string;
}

export const CA_LeaveAttendanceDrawer: React.FC<CA_LeaveAttendanceDrawerProps> = ({
  open,
  onOpenChange,
  leaveRecords,
  onConfirmLeave,
  onAddWorker,
  onViewWorkerDetails,
  payrollMonth,
}) => {
  const trackedCount = leaveRecords.length;
  const confirmedCount = leaveRecords.filter(r => r.clientConfirmed).length;
  const pendingCount = trackedCount - confirmedCount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Leave & Attendance
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Manage leave records for {payrollMonth}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Summary Stats */}
          <div className="flex items-center gap-4 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {trackedCount} tracked
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
              <span>{confirmedCount} confirmed</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{pendingCount} pending</span>
              </div>
            )}
          </div>

          {/* Empty State */}
          {trackedCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              <div className="text-center space-y-2 mb-6">
                <h4 className="text-base font-medium text-foreground">No Leave Tracked</h4>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Add employees or contractors who took leave this cycle. Their salaries will be automatically pro-rated.
                </p>
              </div>
              <Button onClick={onAddWorker} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Workers with Leave
              </Button>
            </div>
          ) : (
            <>
              {/* Leave Table */}
              <ScrollArea className="flex-1">
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      <span>Pro-rated: Base Pay ÷ Days Per Month × (Working Days - Leave Days)</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={onAddWorker} className="h-7 text-xs gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add More
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Worker</TableHead>
                        <TableHead className="text-xs text-right">Leave Days</TableHead>
                        <TableHead className="text-xs text-right">Unpaid Amount</TableHead>
                        <TableHead className="text-xs text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRecords.map((record) => (
                        <TableRow 
                          key={record.id}
                          className={cn(
                            "cursor-pointer hover:bg-primary/5 transition-colors",
                            !record.clientConfirmed && "bg-amber-500/5"
                          )}
                          onClick={() => onViewWorkerDetails(record.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{record.name}</span>
                              {record.hasPendingLeave && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Pending leave approval</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {record.hasMissingAttendance && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Missing timesheet data</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{record.country}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-medium">{record.leaveDays}d</span>
                            {record.leaveBreakdown && (
                              <p className="text-xs text-muted-foreground">
                                {Object.entries(record.leaveBreakdown)
                                  .filter(([_, days]) => days && days > 0)
                                  .map(([type, days]) => `${type}: ${days}d`)
                                  .join(", ")}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-medium text-amber-600">
                              -{record.currency} {Math.round(record.unpaidAmount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {record.clientConfirmed ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                                <span className="text-xs text-accent-green-text">Confirmed</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onConfirmLeave(record.id);
                                }}
                              >
                                Confirm
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Attendance locked for this batch
                </p>
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
