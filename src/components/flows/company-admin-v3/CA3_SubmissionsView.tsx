import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, FileText, Receipt, Timer, Award, ChevronRight, Check, X, Users, Briefcase, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

// Note: Leave is handled separately in the Leaves tab, not here
export type SubmissionType = "timesheet" | "expenses" | "bonus" | "overtime" | "adjustment" | "correction";
export type SubmissionStatus = "pending" | "approved" | "rejected";

// Line item for pay breakdown
interface PayLineItem {
  label: string;
  amount: number;
  type: 'Earnings' | 'Deduction';
  locked?: boolean;
}

// Submitted adjustment from worker
interface SubmittedAdjustment {
  type: SubmissionType;
  amount?: number;
  currency?: string;
  description?: string;
  hours?: number;
  days?: number;
  status?: 'pending' | 'approved';
}

export interface WorkerSubmission {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerType: "employee" | "contractor";
  // Full pay context
  lineItems?: PayLineItem[];
  basePay?: number;
  estimatedNet?: number;
  periodLabel?: string;
  // Submitted adjustments
  submissions: SubmittedAdjustment[];
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

// Note: Leave is not included here - it's managed in the separate Leaves tab
const submissionTypeConfig: Record<SubmissionType, { icon: React.ElementType; label: string; color: string }> = {
  timesheet: { icon: Clock, label: "Timesheet", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  expenses: { icon: Receipt, label: "Expense", color: "bg-primary/10 text-primary border-primary/20" },
  bonus: { icon: Award, label: "Bonus", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  overtime: { icon: Timer, label: "Overtime", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  adjustment: { icon: FileText, label: "Adjustment", color: "bg-muted text-muted-foreground border-border/50" },
  correction: { icon: FileText, label: "Correction", color: "bg-muted text-muted-foreground border-border/50" },
};

const statusConfig: Record<SubmissionStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  approved: { icon: CheckCircle2, label: "Approved", color: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  rejected: { icon: X, label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20" },
};


// Receipt-style breakdown row
const BreakdownRow = ({ 
  label, 
  amount, 
  currency, 
  isPositive = true,
  isLocked = false,
  badge,
  sublabel,
  isTotal = false,
  className
}: { 
  label: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isLocked?: boolean;
  badge?: { label: string; variant: 'pending' | 'approved' };
  sublabel?: string;
  isTotal?: boolean;
  className?: string;
}) => {
  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-2 -mx-2 px-2 rounded-md transition-colors",
      isTotal && "pt-3 mt-1 border-t border-dashed border-border/50 mx-0 px-0",
      className
    )}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={cn(
          "truncate",
          isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"
        )}>
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-muted-foreground/70 truncate">
            · {sublabel}
          </span>
        )}
        {isLocked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Statutory deduction</p>
            </TooltipContent>
          </Tooltip>
        )}
        {badge && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0 shrink-0",
              badge.variant === 'pending' 
                ? "bg-accent-amber-fill/10 text-accent-amber-text border-accent-amber-outline/20"
                : "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20"
            )}
          >
            {badge.label}
          </Badge>
        )}
      </div>
      <span className={cn(
        "whitespace-nowrap tabular-nums text-right font-mono shrink-0 ml-4",
        isTotal ? "text-sm font-semibold text-foreground" : "text-sm",
        isPositive ? "text-foreground" : "text-muted-foreground"
      )}>
        {isPositive ? '' : '−'}{formatAmount(amount, currency)}
      </span>
    </div>
  );
};

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
          "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group",
          submission.status === "rejected" && "border-destructive/20 bg-destructive/5"
        )}
        onClick={() => handleRowClick(submission)}
      >
        {/* Avatar */}
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
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
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground leading-tight">
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
        <div className="flex items-center gap-3 flex-shrink-0">
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
            submission.status === "pending" && "text-accent-amber-text",
            submission.status === "rejected" && "text-destructive"
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{status.label}</span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                  <TabsTrigger value="rejected" className="text-xs h-7 px-3 data-[state=active]:bg-background text-destructive">
                    Rejected ({rejectedCount})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-4 space-y-1.5">
              <TabsContent value="all" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.map((s, i) => renderSubmissionRow(s, i === filteredSubmissions.length - 1))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="pending" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "pending").map((s, i, arr) => renderSubmissionRow(s, i === arr.length - 1))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="approved" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "approved").map((s, i, arr) => renderSubmissionRow(s, i === arr.length - 1))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="rejected" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "rejected").map((s, i, arr) => renderSubmissionRow(s, i === arr.length - 1))}
                </AnimatePresence>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Worker Pay Breakdown Drawer - Full receipt style */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] overflow-y-auto p-0">
          {selectedSubmission && (() => {
            // Calculate breakdown data
            const earnings = selectedSubmission.lineItems?.filter(item => item.type === 'Earnings') || [];
            const deductions = selectedSubmission.lineItems?.filter(item => item.type === 'Deduction') || [];
            const pendingAdjustments = selectedSubmission.submissions.filter(s => s.status === 'pending' || !s.status);
            const currency = selectedSubmission.currency || 'USD';
            
            const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
            const adjustmentTotal = pendingAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
            const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
            
            const baseNet = selectedSubmission.estimatedNet || selectedSubmission.basePay || 0;
            const adjustedNet = baseNet + adjustmentTotal;
            const hasAdjustments = pendingAdjustments.length > 0;
            
            return (
              <>
                {/* Header with period badge */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <SheetTitle className="text-lg font-semibold">Pay breakdown</SheetTitle>
                    <Badge variant="outline" className="text-xs font-normal">
                      {selectedSubmission.periodLabel || "Jan 1 – Jan 31"}
                    </Badge>
                  </div>
                  <SheetDescription className="sr-only">Pay breakdown details</SheetDescription>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials(selectedSubmission.workerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{selectedSubmission.workerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedSubmission.workerCountry} · {selectedSubmission.workerType === "employee" ? "Employee" : "Contractor"}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs shrink-0",
                        statusConfig[selectedSubmission.status].color
                      )}
                    >
                      {statusConfig[selectedSubmission.status].label}
                    </Badge>
                  </div>
                </SheetHeader>

                {/* Receipt-style content */}
                <div className="px-6 py-5 space-y-6">
                  
                  {/* EARNINGS Section */}
                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      Earnings
                    </h3>
                    <div className="space-y-0">
                      {/* Base earnings */}
                      {earnings.map((item, idx) => (
                        <BreakdownRow
                          key={idx}
                          label={item.label}
                          amount={item.amount}
                          currency={currency}
                          isLocked={item.locked}
                          isPositive
                        />
                      ))}
                      {/* Pending adjustments (Expenses, Bonus) that add to earnings */}
                      {pendingAdjustments
                        .filter(adj => adj.type === 'expenses' || adj.type === 'bonus')
                        .map((adj, idx) => {
                          const config = submissionTypeConfig[adj.type as SubmissionType];
                          if (!config) return null;
                          return (
                            <BreakdownRow
                              key={`adj-${idx}`}
                              label={config.label}
                              sublabel={adj.description}
                              amount={adj.amount || 0}
                              currency={adj.currency || currency}
                              isPositive
                              badge={{
                                label: adj.status === 'approved' ? 'Approved' : 'Pending',
                                variant: adj.status === 'approved' ? 'approved' : 'pending'
                              }}
                            />
                          );
                        })}
                      {/* Total Earnings */}
                      <BreakdownRow
                        label="Total earnings"
                        amount={totalEarnings + adjustmentTotal}
                        currency={currency}
                        isPositive
                        isTotal
                      />
                    </div>
                  </section>

                  {/* DEDUCTIONS Section */}
                  {deductions.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                        Deductions
                      </h3>
                      <div className="space-y-0">
                        {deductions.map((item, idx) => (
                          <BreakdownRow
                            key={idx}
                            label={item.label}
                            amount={Math.abs(item.amount)}
                            currency={currency}
                            isLocked={item.locked}
                            isPositive={false}
                          />
                        ))}
                        <BreakdownRow
                          label="Total deductions"
                          amount={totalDeductions}
                          currency={currency}
                          isPositive={false}
                          isTotal
                        />
                      </div>
                    </section>
                  )}

                  {/* OVERTIME Section (if any) */}
                  {pendingAdjustments.filter(adj => adj.type === 'overtime').length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Timer className="h-3.5 w-3.5" />
                        Overtime
                      </h3>
                      <div className="space-y-0">
                        {pendingAdjustments
                          .filter(adj => adj.type === 'overtime')
                          .map((adj, idx) => (
                            <BreakdownRow
                              key={idx}
                              label={`${adj.hours || 0}h logged`}
                              sublabel={adj.description}
                              amount={adj.amount || 0}
                              currency={currency}
                              isPositive
                              badge={{
                                label: adj.status === 'approved' ? 'Approved' : 'Pending',
                                variant: adj.status === 'approved' ? 'approved' : 'pending'
                              }}
                            />
                          ))}
                      </div>
                    </section>
                  )}

                  {/* Estimated net pay - above rejection section */}
                  <section className="pt-2 border-t border-border/40">
                    <div className="flex items-start justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Estimated net pay</p>
                        {hasAdjustments && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Includes {pendingAdjustments.length} pending adjustment{pendingAdjustments.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
                          {formatCurrency(adjustedNet, currency)}
                        </p>
                        {hasAdjustments && (
                          <p className="text-xs text-muted-foreground mt-1 tabular-nums font-mono">
                            Base: {formatCurrency(baseNet, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Rejection reason display if rejected */}
                  {selectedSubmission.status === "rejected" && selectedSubmission.rejectionReason && (
                    <section>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                        Rejection reason
                      </h3>
                      <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                        <p className="text-sm text-destructive">{selectedSubmission.rejectionReason}</p>
                      </div>
                    </section>
                  )}

                  {/* Rejection form - matching leave pattern */}
                  {showCustomReason && (
                    <section className="space-y-3 pt-2 border-t border-border/40">
                      <h3 className="text-sm font-medium text-foreground pt-3">Reject request?</h3>
                      <div className="space-y-2">
                        <Label htmlFor="rejection-reason" className="text-xs text-muted-foreground">
                          Reason for rejection
                        </Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Add a short reason (visible to employee)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowCustomReason(false);
                            setRejectReason("");
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            handleRejectFromDrawer();
                            setShowCustomReason(false);
                          }}
                          disabled={!rejectReason.trim()}
                          className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Reject request
                        </Button>
                      </div>
                    </section>
                  )}
                </div>

                {/* Net Pay Footer + Actions */}
                <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-5">

                  {/* Action buttons - hidden when rejecting, matching leave pattern */}
                  {selectedSubmission.status === "pending" && !showCustomReason && (
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        onClick={() => setShowCustomReason(true)}
                      >
                        Reject
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleApproveFromDrawer}
                      >
                        Approve
                      </Button>
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
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CA3_SubmissionsView;