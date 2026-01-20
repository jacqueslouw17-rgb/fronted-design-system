import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, AlertCircle, Clock, FileText, Receipt, Calendar, Timer, Award, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type SubmissionType = "timesheet" | "expenses" | "bonus" | "leave" | "overtime" | "adjustment";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface WorkerSubmission {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerType: "employee" | "contractor";
  submissions: {
    type: SubmissionType;
    amount?: number;
    currency?: string;
    description?: string;
    hours?: number;
    days?: number;
  }[];
  status: SubmissionStatus;
  totalImpact?: number;
  currency?: string;
  flagged?: boolean;
  flagReason?: string;
}

interface CA3_SubmissionsViewProps {
  submissions: WorkerSubmission[];
  onApprove: (submission: WorkerSubmission) => void;
  onFlag: (submission: WorkerSubmission, reason: string) => void;
  onApproveAll: () => void;
  onContinue: () => void;
}

const submissionTypeConfig: Record<SubmissionType, { icon: React.ElementType; label: string; color: string }> = {
  timesheet: { icon: Clock, label: "Timesheet", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  expenses: { icon: Receipt, label: "Expenses", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  bonus: { icon: Award, label: "Bonus", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  leave: { icon: Calendar, label: "Leave", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  overtime: { icon: Timer, label: "Overtime", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  adjustment: { icon: FileText, label: "Adjustment", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
};

const statusConfig: Record<SubmissionStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  approved: { icon: CheckCircle2, label: "Approved", color: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  rejected: { icon: X, label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const rejectReasons = [
  "Missing documentation",
  "Amount exceeds policy limit",
  "Duplicate submission",
  "Incorrect category",
  "Other",
];

export const CA3_SubmissionsView: React.FC<CA3_SubmissionsViewProps> = ({
  submissions,
  onApprove,
  onFlag,
  onApproveAll,
  onContinue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<WorkerSubmission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  // Computed counts
  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;
  const flaggedCount = submissions.filter(s => s.flagged).length;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter(s => 
      s.workerName.toLowerCase().includes(query) ||
      s.workerCountry.toLowerCase().includes(query)
    );
  }, [submissions, searchQuery]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const handleViewSubmission = (submission: WorkerSubmission) => {
    setSelectedSubmission(submission);
    setDrawerOpen(true);
    setRejectReason("");
    setRejectNote("");
  };

  const handleApproveFromDrawer = () => {
    if (selectedSubmission) {
      onApprove(selectedSubmission);
      setDrawerOpen(false);
      toast.success(`Approved submission for ${selectedSubmission.workerName}`);
    }
  };

  const handleRejectFromDrawer = () => {
    if (selectedSubmission && rejectReason) {
      const reason = rejectReason === "Other" && rejectNote ? rejectNote : rejectReason;
      onFlag(selectedSubmission, reason);
      setDrawerOpen(false);
      toast.info(`Rejected submission for ${selectedSubmission.workerName}`);
    }
  };

  const renderSubmissionRow = (submission: WorkerSubmission) => {
    const status = statusConfig[submission.status];
    const StatusIcon = status.icon;

    return (
      <motion.div
        key={submission.id}
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all duration-150 cursor-pointer",
          "border-border/10 bg-muted/5",
          "hover:bg-muted/20 hover:shadow-sm"
        )}
        onClick={() => handleViewSubmission(submission)}
      >
        {/* Avatar */}
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="text-[10px] font-medium bg-muted/50">
            {getInitials(submission.workerName)}
          </AvatarFallback>
        </Avatar>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {submission.workerName}
            </span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
              {submission.workerType === "employee" ? "EE" : "C"}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {submission.workerCountry}
            </span>
          </div>
          
          {/* Submission type chips */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {submission.submissions.slice(0, 3).map((sub, idx) => {
              const config = submissionTypeConfig[sub.type];
              const Icon = config.icon;
              return (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className={cn("text-[9px] px-1.5 py-0 h-4 gap-0.5", config.color)}
                >
                  <Icon className="h-2.5 w-2.5" />
                  {config.label}
                </Badge>
              );
            })}
            {submission.submissions.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{submission.submissions.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Impact Amount */}
        {submission.totalImpact && (
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(submission.totalImpact, submission.currency)}
            </p>
          </div>
        )}

        {/* Status */}
        <Badge variant="outline" className={cn("text-[10px] gap-1 flex-shrink-0", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>

        <ChevronRight className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onApproveAll}
              className="h-8 text-xs gap-1.5"
            >
              <Check className="h-3 w-3" />
              Approve all safe
            </Button>
          )}
          <Button 
            size="sm"
            onClick={onContinue}
            className="h-8 text-xs gap-1.5"
          >
            Continue to Checks
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Tabbed view */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="h-8 bg-muted/20">
          <TabsTrigger value="all" className="text-[11px] h-6 px-3">
            All ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-[11px] h-6 px-3">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-[11px] h-6 px-3">
            Approved ({approvedCount})
          </TabsTrigger>
          {rejectedCount > 0 && (
            <TabsTrigger value="rejected" className="text-[11px] h-6 px-3 text-red-600">
              Rejected ({rejectedCount})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map(renderSubmissionRow)}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="pending" className="mt-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.filter(s => s.status === "pending").map(renderSubmissionRow)}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="approved" className="mt-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.filter(s => s.status === "approved").map(renderSubmissionRow)}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="rejected" className="mt-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.filter(s => s.status === "rejected").map(renderSubmissionRow)}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selectedSubmission && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(selectedSubmission.workerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-base">{selectedSubmission.workerName}</span>
                    <p className="text-xs text-muted-foreground font-normal">
                      {selectedSubmission.workerCountry} · {selectedSubmission.workerType}
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Submissions this cycle
                </h4>
                
                <div className="space-y-2">
                  {selectedSubmission.submissions.map((sub, idx) => {
                    const config = submissionTypeConfig[sub.type];
                    const Icon = config.icon;
                    return (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg bg-muted/20 border border-border/10"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="outline" className={cn("text-xs gap-1", config.color)}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                          {sub.amount && (
                            <span className="text-sm font-medium">
                              {formatCurrency(sub.amount, sub.currency || selectedSubmission.currency)}
                            </span>
                          )}
                        </div>
                        {sub.description && (
                          <p className="text-xs text-muted-foreground">{sub.description}</p>
                        )}
                        {sub.hours && (
                          <p className="text-xs text-muted-foreground">{sub.hours} hours</p>
                        )}
                        {sub.days && (
                          <p className="text-xs text-muted-foreground">{sub.days} days</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {selectedSubmission.totalImpact && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-sm text-muted-foreground">Total impact</span>
                    <span className="text-base font-semibold text-primary">
                      {formatCurrency(selectedSubmission.totalImpact, selectedSubmission.currency)}
                    </span>
                  </div>
                )}

                {/* Reject reason (only shown for pending) */}
                {selectedSubmission.status === "pending" && (
                  <div className="space-y-3 pt-2">
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Reject reason (required if rejecting)
                      </label>
                      <Select value={rejectReason} onValueChange={setRejectReason}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select a reason..." />
                        </SelectTrigger>
                        <SelectContent>
                          {rejectReasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rejectReason === "Other" && (
                        <Textarea 
                          placeholder="Add a note..."
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          className="text-sm min-h-[60px]"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="mt-8 gap-2">
                {selectedSubmission.status === "pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={handleRejectFromDrawer}
                      disabled={!rejectReason}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      className="flex-1 gap-1.5"
                      onClick={handleApproveFromDrawer}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedSubmission.status !== "pending" && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Close
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CA3_SubmissionsView;
