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
  onClose?: () => void;
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
  onClose,
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

  const renderSubmissionRow = (submission: WorkerSubmission, isLast: boolean = false) => {
    const status = statusConfig[submission.status];
    const StatusIcon = status.icon;
    const TypeIcon = submission.workerType === "employee" ? Users : Briefcase;

    return (
      <motion.div
        key={submission.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer group",
          submission.status === "rejected" && "bg-red-500/5"
        )}
        onClick={() => handleRowClick(submission)}
      >
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(submission.workerName)}
          </AvatarFallback>
        </Avatar>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {submission.workerName}
            </span>
            <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{submission.workerCountry}</span>
            <span className="text-muted-foreground/40">·</span>
            {submission.submissions.slice(0, 2).map((sub, idx) => {
              const config = submissionTypeConfig[sub.type];
              return (
                <span key={idx} className="text-muted-foreground">
                  {config.label}{idx < Math.min(submission.submissions.length, 2) - 1 && ", "}
                </span>
              );
            })}
            {submission.submissions.length > 2 && (
              <span>+{submission.submissions.length - 2}</span>
            )}
          </div>
        </div>

        {/* Right side: Amount + Status */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Impact Amount */}
          {submission.totalImpact ? (
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatCurrency(submission.totalImpact, submission.currency)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}

          {/* Status */}
          <div className={cn("flex items-center gap-1 text-xs", 
            submission.status === "approved" && "text-accent-green-text",
            submission.status === "pending" && "text-amber-600",
            submission.status === "rejected" && "text-red-600"
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{status.label}</span>
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
              {onClose && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onClose}
                  className="h-9 text-xs"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tabbed view */}
          <Tabs defaultValue="all" className="w-full">
            <div className="px-5 pt-4 pb-3 border-b border-border/40">
              <TabsList className="h-8 bg-muted/30 p-0.5">
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
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-border/40">
              <TabsContent value="all" className="mt-0">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.map((s, i) => renderSubmissionRow(s, i === filteredSubmissions.length - 1))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "pending").map((s, i, arr) => renderSubmissionRow(s, i === arr.length - 1))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "approved").map((s, i, arr) => renderSubmissionRow(s, i === arr.length - 1))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "rejected").map((s, i, arr) => renderSubmissionRow(s, i === arr.length - 1))}
                </AnimatePresence>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submission Detail Drawer - Receipt style */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] overflow-y-auto p-0">
          {selectedSubmission && (
            <>
              {/* Header - matching worker dashboard style */}
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {getInitials(selectedSubmission.workerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-base font-semibold">{selectedSubmission.workerName}</SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {selectedSubmission.workerCountry} · {selectedSubmission.workerType === "employee" ? "Employee" : "Contractor"}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs shrink-0",
                      selectedSubmission.status === "approved" && "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
                      selectedSubmission.status === "pending" && "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
                      selectedSubmission.status === "rejected" && "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400"
                    )}
                  >
                    {statusConfig[selectedSubmission.status].label}
                  </Badge>
                </div>
              </SheetHeader>

              {/* Receipt-style content */}
              <div className="px-6 py-5 space-y-5">
                
                {/* Submissions breakdown - receipt style rows */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Submitted items
                  </h3>
                  <div className="space-y-1">
                    {selectedSubmission.submissions.map((sub, idx) => {
                      const config = submissionTypeConfig[sub.type];
                      const Icon = config.icon;
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between py-2.5 -mx-2 px-2 rounded-md hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={cn("p-1.5 rounded-md", config.color.replace('text-', 'bg-').split(' ')[0])}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm text-foreground">{config.label}</span>
                              {sub.description && (
                                <p className="text-xs text-muted-foreground truncate">{sub.description}</p>
                              )}
                              {sub.hours && (
                                <p className="text-xs text-muted-foreground">{sub.hours} hours</p>
                              )}
                              {sub.days && (
                                <p className="text-xs text-muted-foreground">{sub.days} days</p>
                              )}
                            </div>
                          </div>
                          {sub.amount && (
                            <span className="text-sm font-medium tabular-nums text-foreground ml-4">
                              +{formatCurrency(sub.amount, sub.currency || selectedSubmission.currency)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Impact total - receipt footer style */}
                {selectedSubmission.totalImpact && (
                  <div className="pt-3 border-t border-dashed border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Total impact</span>
                      <span className="text-lg font-semibold text-primary tabular-nums">
                        +{formatCurrency(selectedSubmission.totalImpact, selectedSubmission.currency)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Applied to {selectedSubmission.workerType === "employee" ? "net pay" : "invoice total"}
                    </p>
                  </div>
                )}

                {/* Show rejection reason for rejected submissions */}
                {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-start gap-2.5">
                      <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-destructive">Rejected</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedSubmission.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with actions - sticky feel */}
              <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">
                {selectedSubmission.status === "pending" ? (
                  <div className="space-y-4">
                    {!showCustomReason ? (
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 gap-1.5"
                          onClick={handleApproveFromDrawer}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 gap-1.5 text-destructive border-destructive/30 hover:bg-red-100 hover:text-red-700 hover:border-destructive/50"
                          onClick={() => setShowCustomReason(true)}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      /* Expanded rejection flow */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">Select reason</p>
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
                        <div className="flex flex-wrap gap-1.5">
                          {rejectReasons.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => setRejectReason(reason)}
                              className={cn(
                                "text-xs px-2.5 py-1.5 rounded-md border transition-all",
                                rejectReason === reason
                                  ? "border-destructive/60 bg-destructive/10 text-destructive"
                                  : "border-border/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                              )}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>

                        {/* Custom reason input */}
                        <Input
                          placeholder="Or type a custom reason..."
                          value={customReason}
                          onChange={(e) => {
                            setCustomReason(e.target.value);
                            if (e.target.value) setRejectReason("");
                          }}
                          className="h-9 text-sm"
                        />

                        {/* Confirm rejection button */}
                        <Button
                          variant="destructive"
                          className="w-full gap-2"
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
                          Confirm rejection
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setDrawerOpen(false)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CA3_SubmissionsView;