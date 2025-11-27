import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, AlertCircle, Info, CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LeaveEntry {
  id: string;
  leaveType: string;
  dateRange: string;
  daysCount: number;
  status: "Approved" | "Pending" | "Declined" | "Recorded only";
  approvedBy?: string;
  notes?: string;
}

interface LeaveAttendanceExceptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exception: {
    id: string;
    contractorId: string;
    contractorName: string;
    contractorCountry?: string;
    type: string;
    description: string;
  } | null;
  worker?: {
    country: string;
    countryCode: string;
    employmentType: "employee" | "contractor";
    ftePercent?: number;
  };
  onResolve: (exceptionId: string, resolution: "unpaid-leave" | "worked-days" | "snooze") => void;
}

export function LeaveAttendanceExceptionDrawer({
  open,
  onOpenChange,
  exception,
  worker,
  onResolve
}: LeaveAttendanceExceptionDrawerProps) {
  const [selectedResolution, setSelectedResolution] = useState<"unpaid-leave" | "worked-days" | "snooze" | null>(null);

  if (!exception) return null;

  // Mock data - in production, fetch from backend based on exception.contractorId
  const periodStart = "Nov 1, 2025";
  const periodEnd = "Nov 15, 2025";
  const expectedDays = 11; // Working days in period
  const recordedWorkedDays = 8;
  const recordedLeaveDays = 2;
  const missingDays = expectedDays - recordedWorkedDays - recordedLeaveDays;

  const leaveEntries: LeaveEntry[] = [
    {
      id: "leave-1",
      leaveType: "Annual",
      dateRange: "Nov 5-6, 2025",
      daysCount: 2,
      status: "Approved",
      approvedBy: "Jane Smith (HR)",
      notes: "Pre-approved family vacation"
    },
    {
      id: "leave-2",
      leaveType: "Sick",
      dateRange: "Nov 12, 2025",
      daysCount: 1,
      status: "Recorded only",
      notes: "Reported by worker, not yet confirmed by company"
    }
  ];

  // Determine proration method based on country
  const getProrationInfo = () => {
    const countryCode = worker?.countryCode || "PH";
    const prorationMethods: Record<string, { method: string; description: string }> = {
      PH: {
        method: "Working days",
        description: "This country uses working days for proration. Expected 22 working days this period."
      },
      NO: {
        method: "Calendar days",
        description: "This country uses calendar days for proration. Expected 31 days this period."
      },
      DEFAULT: {
        method: "Working days",
        description: "This country uses working days for proration. Expected 22 working days this period."
      }
    };
    return prorationMethods[countryCode] || prorationMethods.DEFAULT;
  };

  const prorationInfo = getProrationInfo();

  const handleApplyResolution = () => {
    if (!selectedResolution) return;
    onResolve(exception.id, selectedResolution);
    onOpenChange(false);
    setSelectedResolution(null);
  };

  const statusConfig = {
    "Approved": { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/30" },
    "Pending": { icon: CircleDashed, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    "Declined": { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30" },
    "Recorded only": { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/30" }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Leave & Attendance Details
          </SheetTitle>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-foreground">{exception.contractorName}</span>
            {exception.contractorCountry && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{exception.contractorCountry}</span>
              </>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Exception Summary */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{exception.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Period & Days Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Period & Days Overview
            </h4>
            <Card className="border-border/20 bg-card/30">
              <CardContent className="p-4 space-y-4">
                {/* Period dates */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payroll Period</span>
                  <span className="text-sm font-medium text-foreground">{periodStart} – {periodEnd}</span>
                </div>

                <Separator />

                {/* Days breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expected Days</span>
                    <span className="text-sm font-semibold text-foreground">{expectedDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recorded Worked Days</span>
                    <span className="text-sm font-medium text-green-600">{recordedWorkedDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recorded Leave Days</span>
                    <span className="text-sm font-medium text-blue-600">{recordedLeaveDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Missing / Unclassified</span>
                    <span className="text-sm font-semibold text-amber-600">{missingDays} days</span>
                  </div>
                </div>

                {/* FTE info if applicable */}
                {worker?.ftePercent && worker.ftePercent < 100 && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        This worker is {worker.ftePercent}% FTE. Expected days already adjusted.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Linked Leave Requests */}
          {leaveEntries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Linked Leave Requests</h4>
              <div className="space-y-2">
                {leaveEntries.map((entry) => {
                  const StatusIcon = statusConfig[entry.status].icon;
                  return (
                    <Card key={entry.id} className="border-border/20 bg-card/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.leaveType}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {entry.daysCount} {entry.daysCount === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs flex items-center gap-1",
                              statusConfig[entry.status].bg,
                              statusConfig[entry.status].border,
                              statusConfig[entry.status].color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{entry.dateRange}</p>
                        {entry.approvedBy && (
                          <p className="text-xs text-muted-foreground">Approved by: {entry.approvedBy}</p>
                        )}
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{entry.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Proration Method Explanation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Proration Method</h4>
            <Card className="border-border/20 bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{prorationInfo.method}</p>
                    <p className="text-xs text-muted-foreground">{prorationInfo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Resolution Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">How to Treat This for Payroll?</h4>
            <Card className="border-border/20 bg-card/30">
              <CardContent className="p-4">
                <RadioGroup value={selectedResolution || ""} onValueChange={(v) => setSelectedResolution(v as typeof selectedResolution)}>
                  <div className="space-y-3">
                    {/* Option 1: Unpaid leave */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="unpaid-leave" id="unpaid-leave" className="mt-1" />
                      <Label htmlFor="unpaid-leave" className="flex-1 cursor-pointer space-y-1">
                        <p className="text-sm font-medium text-foreground">Treat missing days as unpaid leave</p>
                        <p className="text-xs text-muted-foreground">
                          Missing/unclassified days will not be paid. Earnings will be prorated accordingly.
                        </p>
                      </Label>
                    </div>

                    {/* Option 2: Worked days */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="worked-days" id="worked-days" className="mt-1" />
                      <Label htmlFor="worked-days" className="flex-1 cursor-pointer space-y-1">
                        <p className="text-sm font-medium text-foreground">Treat as worked days</p>
                        <p className="text-xs text-muted-foreground">
                          Worker will be paid for the full expected days despite missing data. No proration applied.
                        </p>
                      </Label>
                    </div>

                    {/* Option 3: Snooze */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="snooze" id="snooze" className="mt-1" />
                      <Label htmlFor="snooze" className="flex-1 cursor-pointer space-y-1">
                        <p className="text-sm font-medium text-foreground">Move this worker to next payroll run</p>
                        <p className="text-xs text-muted-foreground">
                          Data is too uncertain. Defer this worker's payroll to the next cycle.
                        </p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {selectedResolution && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-foreground">
                      <strong>Note:</strong> This decision only affects this payroll run. It does not change leave balances or HR approval status.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleApplyResolution}
            disabled={!selectedResolution}
          >
            Apply Resolution
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
