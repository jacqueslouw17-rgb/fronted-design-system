/**
 * CA3_LeavesTab - Leave approvals experience for Company Admin Dashboard v3
 * Global, multi-country leave management with elegant list view
 */

import React, { useState, useMemo } from "react";
import { Search, Filter, Check, X, Clock, AlertCircle, Calendar, Globe, Users, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Country flag mapping
const countryFlags: Record<string, string> = {
  "Norway": "🇳🇴",
  "Philippines": "🇵🇭",
  "India": "🇮🇳",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Portugal": "🇵🇹",
  "Italy": "🇮🇹",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
};

// Timezone hints
const countryTimezones: Record<string, string> = {
  "Norway": "CET",
  "Philippines": "PHT",
  "India": "IST",
  "Germany": "CET",
  "France": "CET",
  "Portugal": "WET",
  "Italy": "CET",
  "United Kingdom": "GMT",
  "United States": "EST",
};

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "Annual" | "Sick" | "Unpaid" | "Other";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCountry: string;
  employeeType: "employee" | "contractor";
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  spansPeriods?: boolean;
  submittedAt: string;
  rejectionReason?: string;
}

// Mock data
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    employeeId: "emp-1",
    employeeName: "Maria Santos",
    employeeCountry: "Philippines",
    employeeType: "employee",
    leaveType: "Annual",
    startDate: "2026-01-28",
    endDate: "2026-02-02",
    totalDays: 4,
    reason: "Family vacation",
    status: "pending",
    spansPeriods: true,
    submittedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "leave-2",
    employeeId: "emp-2",
    employeeName: "Alex Hansen",
    employeeCountry: "Norway",
    employeeType: "employee",
    leaveType: "Sick",
    startDate: "2026-01-20",
    endDate: "2026-01-21",
    totalDays: 2,
    reason: "Medical appointment",
    status: "pending",
    submittedAt: "2026-01-18T08:30:00.000Z",
  },
  {
    id: "leave-3",
    employeeId: "emp-3",
    employeeName: "Sophie Laurent",
    employeeCountry: "France",
    employeeType: "employee",
    leaveType: "Annual",
    startDate: "2026-02-15",
    endDate: "2026-02-20",
    totalDays: 4,
    status: "approved",
    submittedAt: "2026-01-10T14:00:00.000Z",
  },
  {
    id: "leave-4",
    employeeId: "emp-4",
    employeeName: "Priya Sharma",
    employeeCountry: "India",
    employeeType: "employee",
    leaveType: "Unpaid",
    startDate: "2026-01-25",
    endDate: "2026-01-25",
    totalDays: 1,
    reason: "Personal matter",
    status: "pending",
    submittedAt: "2026-01-20T09:00:00.000Z",
  },
  {
    id: "leave-5",
    employeeId: "emp-5",
    employeeName: "Jonas Schmidt",
    employeeCountry: "Germany",
    employeeType: "employee",
    leaveType: "Annual",
    startDate: "2026-01-10",
    endDate: "2026-01-12",
    totalDays: 3,
    status: "rejected",
    rejectionReason: "Conflicts with project deadline",
    submittedAt: "2026-01-05T11:00:00.000Z",
  },
];

export const CA3_LeavesTab: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  
  // Drawer state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Counts
  const pendingCount = leaveRequests.filter(l => l.status === "pending").length;
  const approvedCount = leaveRequests.filter(l => l.status === "approved").length;
  const rejectedCount = leaveRequests.filter(l => l.status === "rejected").length;

  // Get unique countries for filter
  const countries = useMemo(() => {
    const unique = [...new Set(leaveRequests.map(l => l.employeeCountry))];
    return unique.sort();
  }, [leaveRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(leave => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!leave.employeeName.toLowerCase().includes(query) && 
            !leave.employeeCountry.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Country filter
      if (countryFilter !== "all" && leave.employeeCountry !== countryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== "all" && leave.status !== statusFilter) {
        return false;
      }
      // Leave type filter
      if (leaveTypeFilter !== "all" && leave.leaveType !== leaveTypeFilter) {
        return false;
      }
      return true;
    });
  }, [leaveRequests, searchQuery, countryFilter, statusFilter, leaveTypeFilter]);

  const handleReview = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsRejecting(false);
    setRejectionReason("");
    setDrawerOpen(true);
  };

  const handleApprove = () => {
    if (!selectedLeave) return;
    setLeaveRequests(prev => prev.map(l => 
      l.id === selectedLeave.id ? { ...l, status: "approved" as LeaveStatus } : l
    ));
    setDrawerOpen(false);
    toast.success("Leave approved");
  };

  const handleReject = () => {
    if (!selectedLeave || !rejectionReason.trim()) return;
    setLeaveRequests(prev => prev.map(l => 
      l.id === selectedLeave.id ? { ...l, status: "rejected" as LeaveStatus, rejectionReason } : l
    ));
    setDrawerOpen(false);
    setIsRejecting(false);
    setRejectionReason("");
    toast.success("Leave request rejected");
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (start === end) {
      return format(startDate, "d MMM yyyy");
    }
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${format(startDate, "d")}–${format(endDate, "d MMM yyyy")}`;
    }
    
    return `${format(startDate, "d MMM")}–${format(endDate, "d MMM yyyy")}`;
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-accent-amber-fill/10 text-accent-amber-text border-accent-amber-outline/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending approval
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    const colors: Record<LeaveType, string> = {
      "Annual": "bg-primary/10 text-primary border-primary/20",
      "Sick": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
      "Unpaid": "bg-muted text-muted-foreground border-border",
      "Other": "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={cn("text-xs", colors[type])}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={cn(
          "text-xs px-2.5 py-1",
          pendingCount > 0 ? "bg-accent-amber-fill/10 text-accent-amber-text border-accent-amber-outline/20" : "bg-muted text-muted-foreground"
        )}>
          <Clock className="h-3 w-3 mr-1" />
          Pending ({pendingCount})
        </Badge>
        <Badge variant="outline" className="text-xs px-2.5 py-1 bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20">
          <Check className="h-3 w-3 mr-1" />
          Approved ({approvedCount})
        </Badge>
        <Badge variant="outline" className="text-xs px-2.5 py-1 bg-muted text-muted-foreground">
          <X className="h-3 w-3 mr-1" />
          Rejected ({rejectedCount})
        </Badge>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <Globe className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>
                {countryFlags[country]} {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Annual">Annual</SelectItem>
            <SelectItem value="Sick">Sick</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leave Request List */}
      <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4">
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRequests.map((leave) => (
              <div 
                key={leave.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border/30 hover:bg-muted/30 transition-colors"
              >
                {/* Employee Info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {leave.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{leave.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {countryFlags[leave.employeeCountry]} {leave.employeeCountry} · {countryTimezones[leave.employeeCountry]}
                    </p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="flex-1 flex items-center gap-4">
                  {getLeaveTypeBadge(leave.leaveType)}
                  
                  <span className="text-sm text-foreground tabular-nums">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </span>
                  
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                  </span>
                  
                  {leave.spansPeriods && (
                    <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-border/50">
                      Spans pay periods
                    </Badge>
                  )}
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(leave.status)}
                  
                  {leave.status === "pending" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleReview(leave)}
                      className="gap-1 text-primary hover:text-primary"
                    >
                      Review
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] overflow-y-auto p-0">
          {selectedLeave && (
            <>
              {/* Header */}
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <SheetTitle className="text-lg font-semibold">Leave request</SheetTitle>
                  {getLeaveTypeBadge(selectedLeave.leaveType)}
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {selectedLeave.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{selectedLeave.employeeName}</p>
                    <SheetDescription className="text-xs text-muted-foreground">
                      {countryFlags[selectedLeave.employeeCountry]} {selectedLeave.employeeCountry} · {selectedLeave.employeeType === "employee" ? "Employee" : "Contractor"}
                    </SheetDescription>
                  </div>
                  {getStatusBadge(selectedLeave.status)}
                </div>
              </SheetHeader>

              {/* Content */}
              <div className="px-6 py-5 space-y-6">
                {/* Dates & Duration Section */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Dates & duration
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dates</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatDateRange(selectedLeave.startDate, selectedLeave.endDate)}
                      </span>
                    </div>
                    <Separator className="bg-border/30" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {selectedLeave.totalDays} working {selectedLeave.totalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    {selectedLeave.reason && (
                      <>
                        <Separator className="bg-border/30" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reason</span>
                          <span className="font-medium text-foreground text-right max-w-[180px]">
                            {selectedLeave.reason}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Pay Period Impact Section */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Pay period impact
                  </h3>
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <p className="text-sm text-foreground">
                      {selectedLeave.spansPeriods 
                        ? "Split across payroll cycles automatically"
                        : "Included in payroll for this pay period"
                      }
                    </p>
                    {selectedLeave.spansPeriods && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Days will be allocated to the respective pay periods based on their occurrence.
                      </p>
                    )}
                  </div>
                </section>

                {/* Global considerations note */}
                <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Public holidays and weekends are calculated based on the employee's country rules. Non-working days are excluded automatically where applicable.
                  </p>
                </div>

                {/* Rejection reason display */}
                {selectedLeave.status === "rejected" && selectedLeave.rejectionReason && (
                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      Rejection reason
                    </h3>
                    <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                      <p className="text-sm text-destructive">{selectedLeave.rejectionReason}</p>
                    </div>
                  </section>
                )}

                {/* Rejection form */}
                {isRejecting && (
                  <section className="space-y-3 pt-2 border-t border-border/40">
                    <h3 className="text-sm font-medium text-foreground pt-3">Reject request?</h3>
                    <div className="space-y-2">
                      <Label htmlFor="rejection-reason" className="text-xs text-muted-foreground">
                        Reason for rejection
                      </Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Add a short reason (visible to employee)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsRejecting(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleReject}
                        disabled={!rejectionReason.trim()}
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Reject request
                      </Button>
                    </div>
                  </section>
                )}
              </div>

              {/* Actions Footer - only for pending */}
              {selectedLeave.status === "pending" && !isRejecting && (
                <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsRejecting(true)}
                      className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={handleApprove}
                      className="flex-1"
                    >
                      Approve leave
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CA3_LeavesTab;
