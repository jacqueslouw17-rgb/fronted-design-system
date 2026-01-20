import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, FileText, Receipt, Calendar, Timer, Award, ChevronRight, Check, X, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
  rejectionReason?: string;
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
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [customReason, setCustomReason] = useState("");

  // Computed counts
  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;

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

  const handleRowClick = (submission: WorkerSubmission) => {
    setSelectedSubmission(submission);
    setDrawerOpen(true);
    setRejectReason("");
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
      onFlag(selectedSubmission, rejectReason);
      setDrawerOpen(false);
      toast.info(`Rejected submission for ${selectedSubmission.workerName}`);
    }
  };

  const renderSubmissionRow = (submission: WorkerSubmission) => {
    const status = statusConfig[submission.status];
    const StatusIcon = status.icon;
    const TypeIcon = submission.workerType === "employee" ? Users : Briefcase;

    return (
      <motion.div
        key={submission.id}
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
        onClick={() => handleRowClick(submission)}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(submission.workerName)}
            </AvatarFallback>
          </Avatar>

          {/* Worker Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {submission.workerName}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TypeIcon className="h-3 w-3" />
                {submission.workerType === "employee" ? "Employee" : "Contractor"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{submission.workerCountry}</span>
              {/* Submission type chips */}
              <div className="flex items-center gap-1">
                {submission.submissions.slice(0, 2).map((sub, idx) => {
                  const config = submissionTypeConfig[sub.type];
                  const Icon = config.icon;
                  return (
                    <Badge key={idx} variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  );
                })}
                {submission.submissions.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{submission.submissions.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Amount + Status */}
        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
          {/* Impact Amount */}
          {submission.totalImpact ? (
            <p className="text-sm font-medium text-foreground min-w-[70px] text-right">
              {formatCurrency(submission.totalImpact, submission.currency)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground min-w-[70px] text-right">—</p>
          )}

          {/* Status */}
          <div className={cn("flex items-center gap-1 text-xs min-w-[70px]", 
            submission.status === "approved" && "text-accent-green-text",
            submission.status === "pending" && "text-amber-600",
            submission.status === "rejected" && "text-red-600"
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-foreground">Submissions</h3>
              <p className="text-sm text-muted-foreground">
                {submissions.length} submission{submissions.length !== 1 ? "s" : ""} this cycle
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-56 bg-background/60"
                />
              </div>
              {pendingCount > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onApproveAll}
                  className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve all safe
                </Button>
              )}
              <Button 
                size="sm"
                onClick={onContinue}
                className="h-9 text-xs gap-1.5"
              >
                Continue to Submit
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {/* Tabbed view */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="h-9 bg-muted/30 p-1 mb-4">
              <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                All ({submissions.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                Approved ({approvedCount})
              </TabsTrigger>
              {rejectedCount > 0 && (
                <TabsTrigger value="rejected" className="text-xs h-7 px-3 data-[state=active]:bg-background text-red-600">
                  Rejected ({rejectedCount})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="mt-0 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.map(renderSubmissionRow)}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="pending" className="mt-0 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.filter(s => s.status === "pending").map(renderSubmissionRow)}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="approved" className="mt-0 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.filter(s => s.status === "approved").map(renderSubmissionRow)}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="rejected" className="mt-0 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.filter(s => s.status === "rejected").map(renderSubmissionRow)}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submission Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selectedSubmission && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs bg-muted/40">
                      {getInitials(selectedSubmission.workerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-base">{selectedSubmission.workerName}</span>
                    <p className="text-xs text-muted-foreground font-normal">
                      {selectedSubmission.workerCountry} · {selectedSubmission.workerType === "employee" ? "Employee" : "Contractor"}
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Submissions this cycle
                  </h4>
                  
                  <div className="space-y-2">
                    {selectedSubmission.submissions.map((sub, idx) => {
                      const config = submissionTypeConfig[sub.type];
                      const Icon = config.icon;
                      return (
                        <div 
                          key={idx} 
                          className="p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className={cn("text-xs gap-1.5", config.color)}>
                              <Icon className="h-3.5 w-3.5" />
                              {config.label}
                            </Badge>
                            {sub.amount && (
                              <span className="text-sm font-semibold">
                                {formatCurrency(sub.amount, sub.currency || selectedSubmission.currency)}
                              </span>
                            )}
                          </div>
                          {sub.description && (
                            <p className="text-sm text-muted-foreground">{sub.description}</p>
                          )}
                          {sub.hours && (
                            <p className="text-sm text-muted-foreground">{sub.hours} hours</p>
                          )}
                          {sub.days && (
                            <p className="text-sm text-muted-foreground">{sub.days} days</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedSubmission.totalImpact && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-sm text-muted-foreground">Total impact</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(selectedSubmission.totalImpact, selectedSubmission.currency)}
                      </span>
                    </div>
                  </>
                )}

                {/* Show rejection reason for rejected submissions */}
                {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                  <>
                    <Separator />
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-destructive/10">
                          <X className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-destructive">Rejected</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {selectedSubmission.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              <SheetFooter className="mt-6 flex-col gap-4">
                {selectedSubmission.status === "pending" && (
                  <div className="space-y-4 w-full">
                    {/* Two clear action buttons side by side */}
                    {!showCustomReason ? (
                      <>
                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 gap-2 h-11"
                            onClick={handleApproveFromDrawer}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex-1 gap-2 h-11 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                            onClick={() => setShowCustomReason(true)}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </>
                    ) : (
                      /* Expanded rejection flow */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">Select rejection reason</p>
                          <button
                            onClick={() => {
                              setShowCustomReason(false);
                              setCustomReason("");
                              setRejectReason("");
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        
                        {/* Quick select pills */}
                        <div className="flex flex-wrap gap-2">
                          {rejectReasons.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => setRejectReason(reason)}
                              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                                rejectReason === reason
                                  ? "border-destructive/60 bg-destructive/10 text-destructive"
                                  : "border-border/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                              }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>

                        {/* Custom reason input */}
                        <div className="space-y-2">
                          <Input
                            placeholder="Or type a custom reason..."
                            value={customReason}
                            onChange={(e) => {
                              setCustomReason(e.target.value);
                              if (e.target.value) setRejectReason("");
                            }}
                            className="h-10 text-sm"
                          />
                        </div>

                        {/* Confirm rejection button */}
                        <Button
                          variant="destructive"
                          className="w-full gap-2 h-11"
                          disabled={!rejectReason && !customReason.trim()}
                          onClick={() => {
                            if (customReason.trim()) {
                              setRejectReason(customReason.trim());
                            }
                            handleRejectFromDrawer();
                            setShowCustomReason(false);
                            setCustomReason("");
                          }}
                        >
                          <X className="h-4 w-4" />
                          Confirm Rejection
                        </Button>
                      </div>
                    )}
                  </div>
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
    </>
  );
};

export default CA3_SubmissionsView;