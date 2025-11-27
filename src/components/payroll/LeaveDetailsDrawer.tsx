import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Clock, Calendar, Info } from "lucide-react";

interface LeaveEntry {
  id: string;
  requestDate: string;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveType: "Annual" | "Sick" | "Unpaid" | "Parental" | "Bereavement" | "Other";
  daysCount: number;
  status: "Pending" | "Approved" | "Declined";
  approvedBy?: string;
  recordedInFronted: boolean;
  notes?: string;
}

interface AttendanceAnomaly {
  id: string;
  date: string;
  type: "Missing timesheet" | "Late submission" | "Incomplete data";
  description: string;
  severity: "high" | "medium" | "low";
}

interface LeaveDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerName: string;
  workerRole?: string;
  country: string;
  employmentType: "employee" | "contractor";
  ftePercent: number;
  scheduledDays: number;
  actualDays: number;
  leaveEntries: LeaveEntry[];
  attendanceAnomalies?: AttendanceAnomaly[];
}

export default function LeaveDetailsDrawer({
  open,
  onOpenChange,
  workerName,
  workerRole,
  country,
  employmentType,
  ftePercent,
  scheduledDays,
  actualDays,
  leaveEntries,
  attendanceAnomalies = []
}: LeaveDetailsDrawerProps) {
  const leaveByType = leaveEntries.reduce((acc, entry) => {
    if (!acc[entry.leaveType]) {
      acc[entry.leaveType] = 0;
    }
    acc[entry.leaveType] += entry.daysCount;
    return acc;
  }, {} as Record<string, number>);

  const totalLeaveDays = leaveEntries.reduce((sum, entry) => sum + entry.daysCount, 0);
  const netPayableDays = actualDays - totalLeaveDays;
  
  const pendingLeaveCount = leaveEntries.filter(e => e.status === "Pending").length;
  const hasIssues = pendingLeaveCount > 0 || attendanceAnomalies.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border/50">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-lg font-semibold">{workerName}</SheetTitle>
                {workerRole && (
                  <p className="text-sm text-muted-foreground mt-1">{workerRole}</p>
                )}
              </div>
              {hasIssues && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {pendingLeaveCount > 0 ? `${pendingLeaveCount} Pending` : "Issues"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{country}</span>
              <span>•</span>
              <span className="capitalize">{employmentType}</span>
              <span>•</span>
              <span>{ftePercent}% FTE</span>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Summary Card */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Scheduled Days</p>
                  <p className="text-lg font-semibold text-foreground">{scheduledDays}d</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Actual Attendance</p>
                  <p className="text-lg font-semibold text-foreground">{actualDays}d</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Leave Taken</p>
                  <p className="text-lg font-semibold text-amber-600">{totalLeaveDays}d</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Net Payable Days</p>
                  <p className="text-lg font-semibold text-accent-green-text">{netPayableDays}d</p>
                </div>
              </div>
            </Card>

            {/* Leave Breakdown by Type */}
            {Object.keys(leaveByType).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Leave Breakdown by Type
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(leaveByType).map(([type, days]) => (
                    <Badge 
                      key={type} 
                      variant="outline" 
                      className="bg-background border-border/50 text-foreground"
                    >
                      {type}: {days}d
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Leave Entries */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Leave Entries</h4>
              {leaveEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave entries for this payroll period.</p>
              ) : (
                <div className="space-y-3">
                  {leaveEntries.map((entry) => (
                    <Card key={entry.id} className="p-4 border-border/50">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {entry.leaveType}
                              </Badge>
                              <span className="text-sm font-medium text-foreground">
                                {entry.daysCount}d
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {entry.leaveStartDate} – {entry.leaveEndDate}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              entry.status === "Approved"
                                ? "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30"
                                : entry.status === "Pending"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                            }
                          >
                            {entry.status === "Approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {entry.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                            {entry.status === "Declined" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {entry.status}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Requested:</span>
                            <span className="text-foreground">{entry.requestDate}</span>
                          </div>
                          {entry.approvedBy && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Approved by:</span>
                              <span className="text-foreground">{entry.approvedBy}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Source:</span>
                            <span className="text-foreground">
                              {entry.recordedInFronted ? "Recorded in Fronted" : "Company approved"}
                            </span>
                          </div>
                        </div>

                        {entry.notes && (
                          <>
                            <Separator />
                            <p className="text-xs text-muted-foreground italic">{entry.notes}</p>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance Anomalies */}
            {attendanceAnomalies.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Attendance Issues
                  </h4>
                  <div className="space-y-2">
                    {attendanceAnomalies.map((anomaly) => (
                      <Card
                        key={anomaly.id}
                        className={
                          anomaly.severity === "high"
                            ? "p-3 border-amber-500/30 bg-amber-500/5"
                            : "p-3 border-border/50 bg-muted/20"
                        }
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            className={
                              anomaly.severity === "high"
                                ? "h-4 w-4 text-amber-600 mt-0.5"
                                : "h-4 w-4 text-muted-foreground mt-0.5"
                            }
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground">{anomaly.type}</p>
                              <span className="text-xs text-muted-foreground">{anomaly.date}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Read-Only Note */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Review Only</p>
                  <p className="text-xs text-muted-foreground">
                    This panel is for review and validation only. Leave approval workflows are managed separately.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
