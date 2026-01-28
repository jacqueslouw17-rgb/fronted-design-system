import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, FileText, Receipt, Timer, Award, ChevronRight, Check, X, Users, Briefcase, Lock, Calendar, Palmtree, Filter, Eye, EyeOff } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
import { format } from "date-fns";
import { CA3_ApproveDialog, CA3_RejectDialog, CA3_BulkApproveDialog, CA3_BulkRejectDialog } from "./CA3_ConfirmationDialogs";
import { CollapsibleSection } from "./CA3_CollapsibleSection";

// Note: Leave is handled separately in the Leaves tab, but pending leaves in this pay period 
// can also be reviewed here if admin missed them
export type SubmissionType = "timesheet" | "expenses" | "bonus" | "overtime" | "adjustment" | "correction";
// Worker-level status: pending = has adjustments needing review, ready = all reviewed
export type SubmissionStatus = "pending" | "ready";
export type AdjustmentItemStatus = "pending" | "approved" | "rejected";
// Re-use LeaveType from LeavesTab (not exported here to avoid conflict)
type LeaveTypeLocal = "Annual" | "Sick" | "Unpaid" | "Compassionate" | "Maternity" | "Other";

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
  status?: AdjustmentItemStatus;
  rejectionReason?: string;
}

// Leave request that falls within this pay period
export interface PendingLeaveItem {
  id: string;
  leaveType: LeaveTypeLocal;
  startDate: string;
  endDate: string;
  totalDays: number;
  daysInThisPeriod: number; // Days affecting this pay period
  reason?: string;
  status: AdjustmentItemStatus;
  rejectionReason?: string;
  dailyRate?: number; // For calculating unpaid leave deduction
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
  // Pending leave requests in this pay period
  pendingLeaves?: PendingLeaveItem[];
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
  onClose?: () => void;
  pendingCount?: number; // If provided, blocks continue when > 0
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

const leaveTypeConfig: Record<LeaveTypeLocal, { icon: React.ElementType; label: string; color: string; affectsPay: boolean }> = {
  Annual: { icon: Palmtree, label: "Annual Leave", color: "bg-primary/10 text-primary border-primary/20", affectsPay: false },
  Sick: { icon: Calendar, label: "Sick Leave", color: "bg-accent-amber-fill/10 text-accent-amber-text border-accent-amber-outline/20", affectsPay: false },
  Unpaid: { icon: Calendar, label: "Unpaid Leave", color: "bg-muted text-muted-foreground border-border", affectsPay: true },
  Compassionate: { icon: Calendar, label: "Compassionate Leave", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", affectsPay: false },
  Maternity: { icon: Calendar, label: "Maternity Leave", color: "bg-pink-500/10 text-pink-600 border-pink-500/20", affectsPay: false },
  Other: { icon: Calendar, label: "Other Leave", color: "bg-muted text-muted-foreground border-border", affectsPay: false },
};

const statusConfig: Record<SubmissionStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-orange-600" },
  ready: { icon: CheckCircle2, label: "Ready", color: "text-accent-green-text" },
};

// Interactive adjustment row with expandable approve/reject UI and state management
const AdjustmentRow = ({ 
  label, 
  amount, 
  currency, 
  status,
  rejectionReason,
  onApprove,
  onReject,
  isExpanded = false,
  onToggleExpand,
}: { 
  label: string;
  amount: number;
  currency: string;
  status: AdjustmentItemStatus;
  rejectionReason?: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  
  // Confirmation dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = () => {
    onApprove();
    toggleExpand(); // Close on approve
  };

  const handleRejectClick = () => {
    if (rejectReasonInput.trim()) {
      setShowRejectDialog(true);
    }
  };

  const handleRejectConfirm = () => {
    onReject(rejectReasonInput);
    toggleExpand(); // Close on reject
    setShowRejectForm(false);
    setRejectReasonInput("");
  };

  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const isApproved = status === 'approved';

  // Approved state - becomes part of the list with no badge
  if (isApproved) {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm tabular-nums font-mono text-foreground">
          +{formatAmount(amount, currency)}
        </span>
      </div>
    );
  }

  // Rejected state - red styling with hover-to-reveal reason
  if (isRejected) {
    return (
      <div 
        className="mb-1.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="rounded-md overflow-hidden border border-destructive/40 bg-destructive/5">
          {/* Main row */}
          <div className="flex items-center justify-between py-2.5 px-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-sm text-muted-foreground line-through">{label}</span>
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold bg-destructive/10 text-destructive border-destructive/40"
              >
                Rejected
              </Badge>
            </div>
            <span className="text-sm tabular-nums font-mono text-muted-foreground/60 line-through">
              +{formatAmount(amount, currency)}
            </span>
          </div>
          
          {/* Hover-to-reveal rejection reason */}
          <AnimatePresence>
            {isHovered && rejectionReason && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/30">
                  <p className="text-xs text-destructive/90">
                    <span className="font-medium">Reason:</span> {rejectionReason}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Pending state - clean inline row, no box
  return (
    <>
      <div 
        className="flex items-center justify-between py-2 cursor-pointer hover:bg-orange-100/70 dark:hover:bg-orange-500/15 -mx-3 px-3 rounded transition-colors"
        onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-foreground">{label}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            pending
          </span>
        </div>
        
        <span className="text-sm tabular-nums font-mono text-foreground ml-3">
          +{formatAmount(amount, currency)}
        </span>
      </div>
      
      {/* Expanded action panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="py-2 -mx-3 px-3">
              {!showRejectForm ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRejectForm(true);
                    }}
                    className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveClick();
                    }}
                    className="flex-1 h-8 text-xs gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-md border border-border/50 bg-muted/30" onClick={(e) => e.stopPropagation()}>
                  <Textarea
                    placeholder="Reason for rejection..."
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    className="min-h-[60px] resize-none text-sm bg-background"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReasonInput("");
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRejectClick}
                      disabled={!rejectReasonInput.trim()}
                      className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirmation Dialogs */}
      <CA3_ApproveDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        onConfirm={handleApproveConfirm}
        adjustmentType={label}
        amount={`+${formatAmount(amount, currency)}`}
      />
      <CA3_RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleRejectConfirm}
        adjustmentType={label}
      />
    </>
  );
};

// Simple static breakdown row for non-interactive items
const BreakdownRow = ({ 
  label, 
  amount, 
  currency, 
  isPositive = true,
  isLocked = false,
  isTotal = false,
  className
}: { 
  label: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isLocked?: boolean;
  isTotal?: boolean;
  className?: string;
}) => {
  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-2",
      isTotal && "pt-3 mt-1 border-t border-dashed border-border/50",
      className
    )}>
      <span className={cn(
          "truncate",
          isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"
        )}>
          {label}
        </span>
      
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

// Interactive leave row with expandable approve/reject UI
const LeaveRow = ({ 
  leave,
  currency,
  onApprove,
  onReject,
  isExpanded = false,
  onToggleExpand,
}: { 
  leave: PendingLeaveItem;
  currency: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const config = leaveTypeConfig[leave.leaveType];
  
  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (start === end) {
      return format(startDate, "d MMM");
    }
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${format(startDate, "d")}–${format(endDate, "d MMM")}`;
    }
    return `${format(startDate, "d MMM")}–${format(endDate, "d MMM")}`;
  };

  // Calculate deduction for unpaid leave
  const deductionAmount = config.affectsPay && leave.dailyRate 
    ? leave.daysInThisPeriod * leave.dailyRate 
    : 0;

  const isPending = leave.status === 'pending';
  const isRejected = leave.status === 'rejected';
  const isApproved = leave.status === 'approved';

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = () => {
    setShowApproveDialog(false);
    onApprove();
    toggleExpand(); // Close on approve
  };

  const handleRejectClick = () => {
    if (rejectReasonInput.trim()) {
      setShowRejectDialog(true);
    }
  };

  const handleRejectConfirm = () => {
    setShowRejectDialog(false);
    onReject(rejectReasonInput);
    toggleExpand(); // Close on reject
    setShowRejectForm(false);
    setRejectReasonInput("");
  };

  // Show details when hovered or expanded
  const showDetails = isHovered || expanded;

  // Approved state - clean display with better spacing
  if (isApproved) {
    return (
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm text-muted-foreground">
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`} · {formatDateRange(leave.startDate, leave.endDate)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4">
          {deductionAmount > 0 ? (
            <span className="text-sm tabular-nums font-mono text-muted-foreground">
              −{formatAmount(deductionAmount, currency)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No pay impact</span>
          )}
        </div>
      </div>
    );
  }

  // Rejected state - with hover reveal for reason
  if (isRejected) {
    return (
      <div 
        className="-mx-2 mb-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="rounded-lg overflow-hidden border border-destructive/30 bg-destructive/5">
          <div className="flex items-center justify-between py-2.5 px-3">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {config.label}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-[11px] px-2 py-0.5 shrink-0 font-medium bg-destructive/10 text-destructive border-destructive/30 pointer-events-none"
                >
                  Rejected
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground/50 line-through">
                {leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`} · {formatDateRange(leave.startDate, leave.endDate)}
              </span>
            </div>
          </div>
          
          <AnimatePresence>
            {isHovered && leave.rejectionReason && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/20">
                  <p className="text-xs text-destructive/80">
                    <span className="font-medium">Reason:</span> {leave.rejectionReason}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Pending state - minimal inline row matching AdjustmentRow pattern
  return (
    <>
      <div 
        className="-mx-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main row - clean inline, no box */}
        <div 
          className="flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-orange-100/70 dark:hover:bg-orange-500/15 rounded transition-colors"
          onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
        >
          <div className="flex flex-col gap-0 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{config.label}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                pending
              </span>
            </div>
            {/* Dates revealed on hover */}
            <AnimatePresence>
              {isHovered && !expanded && (
                <motion.span
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs text-muted-foreground overflow-hidden"
                >
                  {leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod}d`} · {formatDateRange(leave.startDate, leave.endDate)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right side */}
          <span className="text-xs text-muted-foreground shrink-0 ml-3">
            {deductionAmount > 0 ? (
              <span className="text-sm tabular-nums font-mono text-foreground">
                −{formatAmount(deductionAmount, currency)}
              </span>
            ) : (
              'No pay impact'
            )}
          </span>
        </div>

        {/* Expanded action panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="py-2 px-3">
                {/* Show dates when expanded */}
                <div className="text-xs text-muted-foreground mb-2">
                  {leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`} · {formatDateRange(leave.startDate, leave.endDate)}
                </div>
                {!showRejectForm ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRejectForm(true);
                      }}
                      className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveClick();
                      }}
                      className="flex-1 h-8 text-xs gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 rounded-md border border-border/50 bg-muted/30" onClick={(e) => e.stopPropagation()}>
                    <Textarea
                      placeholder="Reason for rejection..."
                      value={rejectReasonInput}
                      onChange={(e) => setRejectReasonInput(e.target.value)}
                      className="min-h-[60px] resize-none text-sm bg-background"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReasonInput("");
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRejectClick}
                        disabled={!rejectReasonInput.trim()}
                        className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialogs */}
      <CA3_ApproveDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        onConfirm={handleApproveConfirm}
        adjustmentType={`${config.label} (${leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`})`}
        amount={deductionAmount > 0 ? `−${formatAmount(deductionAmount, currency)}` : "No pay impact"}
      />
      <CA3_RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleRejectConfirm}
        adjustmentType={`${config.label} (${leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`})`}
      />
    </>
  );
};

// Track adjustment and leave statuses locally within the drawer
interface AdjustmentState {
  status: AdjustmentItemStatus;
  rejectionReason?: string;
}

export const CA3_SubmissionsView: React.FC<CA3_SubmissionsViewProps> = ({
  submissions,
  onApprove,
  onFlag,
  onApproveAll,
  onContinue,
  onClose,
  pendingCount: externalPendingCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<WorkerSubmission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showCustomReason, setShowCustomReason] = useState(false);
  
  // Track which item is currently expanded (only one at a time)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  // Pending filter - when true, hide approved items
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  
  // Local state for adjustment statuses within the drawer (keyed by submissionId-adjustmentIndex)
  const [adjustmentStates, setAdjustmentStates] = useState<Record<string, AdjustmentState>>({});
  // Local state for leave statuses (keyed by submissionId-leaveId)
  const [leaveStates, setLeaveStates] = useState<Record<string, AdjustmentState>>({});
  
  // Bulk action dialogs
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);

  // Computed counts
  const internalPendingCount = submissions.filter(s => s.status === "pending").length;
  const pendingCount = externalPendingCount ?? internalPendingCount;
  const readyCount = submissions.filter(s => s.status === "ready").length;
  
  // Can continue only when no pending submissions
  const canContinue = pendingCount === 0;

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

  // Get the current status for an adjustment (local state overrides original)
  const getAdjustmentStatus = (submissionId: string, adjIndex: number, originalStatus?: AdjustmentItemStatus): AdjustmentState => {
    const key = `${submissionId}-${adjIndex}`;
    if (adjustmentStates[key]) {
      return adjustmentStates[key];
    }
    return { status: originalStatus || 'pending' };
  };

  // Update adjustment status
  const updateAdjustmentStatus = (submissionId: string, adjIndex: number, newState: AdjustmentState) => {
    const key = `${submissionId}-${adjIndex}`;
    setAdjustmentStates(prev => ({
      ...prev,
      [key]: newState
    }));
  };

  // Get the current status for a leave (local state overrides original)
  const getLeaveStatus = (submissionId: string, leaveId: string, originalStatus?: AdjustmentItemStatus): AdjustmentState => {
    const key = `${submissionId}-leave-${leaveId}`;
    if (leaveStates[key]) {
      return leaveStates[key];
    }
    return { status: originalStatus || 'pending' };
  };

  // Update leave status
  const updateLeaveStatus = (submissionId: string, leaveId: string, newState: AdjustmentState) => {
    const key = `${submissionId}-leave-${leaveId}`;
    setLeaveStates(prev => ({
      ...prev,
      [key]: newState
    }));
  };

  // Close expanded item when clicking outside
  const handleRowClick = (submission: WorkerSubmission) => {
    setSelectedSubmission(submission);
    setDrawerOpen(true);
    setRejectReason("");
    setExpandedItemId(null);
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

  // Bulk approve all pending items for the selected worker
  const handleBulkApprove = () => {
    if (!selectedSubmission) return;
    
    // Approve all pending adjustments
    selectedSubmission.submissions.forEach((adj, idx) => {
      const currentState = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
      if (currentState.status === 'pending') {
        updateAdjustmentStatus(selectedSubmission.id, idx, { status: 'approved' });
      }
    });
    
    // Approve all pending leaves
    (selectedSubmission.pendingLeaves || []).forEach((leave) => {
      const currentState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
      if (currentState.status === 'pending') {
        updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'approved' });
      }
    });
    
    toast.success(`Approved all pending items for ${selectedSubmission.workerName}`);
  };

  // Bulk reject all pending items for the selected worker
  const handleBulkReject = (reason: string) => {
    if (!selectedSubmission) return;
    
    // Reject all pending adjustments
    selectedSubmission.submissions.forEach((adj, idx) => {
      const currentState = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
      if (currentState.status === 'pending') {
        updateAdjustmentStatus(selectedSubmission.id, idx, { status: 'rejected', rejectionReason: reason });
      }
    });
    
    // Reject all pending leaves
    (selectedSubmission.pendingLeaves || []).forEach((leave) => {
      const currentState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
      if (currentState.status === 'pending') {
        updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'rejected', rejectionReason: reason });
      }
    });
    
    toast.info(`Rejected all pending items for ${selectedSubmission.workerName}`);
  };

  const renderSubmissionRow = (submission: WorkerSubmission) => {
    const TypeIcon = submission.workerType === "employee" ? Users : Briefcase;
    
    // Count pending adjustments for this worker (considering local state overrides)
    const pendingAdjustmentCount = submission.submissions.filter((adj, idx) => {
      const key = `${submission.id}-${idx}`;
      const localState = adjustmentStates[key];
      const effectiveStatus = localState?.status || adj.status || 'pending';
      return effectiveStatus === 'pending' && typeof adj.amount === 'number';
    }).length;
    
    // Count pending leaves for this worker
    const pendingLeaveCount = (submission.pendingLeaves || []).filter((leave) => {
      const leaveState = getLeaveStatus(submission.id, leave.id, leave.status);
      return leaveState.status === 'pending';
    }).length;
    
    // Total pending items (adjustments + leaves)
    const workerPendingCount = pendingAdjustmentCount + pendingLeaveCount;
    
    // Derive effective worker status: if no pending items remain, worker is "ready"
    const effectiveWorkerStatus: SubmissionStatus = workerPendingCount > 0 ? "pending" : "ready";
    const status = statusConfig[effectiveWorkerStatus];
    const StatusIcon = status.icon;

    return (
      <motion.div
        key={submission.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group"
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
            {/* Only show submission types for pending workers */}
            {effectiveWorkerStatus === "pending" && (
              <>
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
                {/* Show leave indicator if pending leaves exist */}
                {pendingLeaveCount > 0 && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-orange-600 dark:text-orange-400">{pendingLeaveCount} leave</span>
                  </>
                )}
              </>
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

          {/* Status with pending count */}
          <div className={cn("flex items-center gap-1.5 text-xs", status.color)}>
            {effectiveWorkerStatus === "pending" && workerPendingCount > 0 ? (
              <>
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-orange-500/15 text-orange-600 text-[10px] font-semibold">
                  {workerPendingCount}
                </span>
                <span className="hidden sm:inline">{status.label}</span>
              </>
            ) : (
              <>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{status.label}</span>
              </>
            )}
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      size="sm"
                      onClick={onContinue}
                      disabled={!canContinue}
                      className="h-9 text-xs gap-1.5"
                    >
                      Continue to Submit
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canContinue && (
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Resolve all {pendingCount} pending submission{pendingCount !== 1 ? 's' : ''} before continuing</p>
                  </TooltipContent>
                )}
              </Tooltip>
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
                <TabsTrigger value="ready" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  Ready ({readyCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-4 space-y-1.5">
              <TabsContent value="all" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.map((s) => renderSubmissionRow(s))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="pending" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "pending").map((s) => renderSubmissionRow(s))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="ready" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.filter(s => s.status === "ready").map((s) => renderSubmissionRow(s))}
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
            // Get all adjustments (pending, approved, rejected)
            const allAdjustments = selectedSubmission.submissions;
            const currency = selectedSubmission.currency || 'USD';
            const adjustmentEntries = allAdjustments.map((adj, originalIdx) => ({ adj, originalIdx }));
            // Only adjustments with an explicit numeric amount affect pay and should be counted/totaled.
            // (E.g., timesheets without an `amount` are informational and should not block or affect totals.)
            const moneyAdjustments = adjustmentEntries.filter(({ adj }) => typeof adj.amount === 'number' && (adj.amount ?? 0) !== 0);
            
            // Get pending leaves for this worker
            const pendingLeaves = selectedSubmission.pendingLeaves || [];
            
            // Calculate statuses based on local state
            const getEffectiveStatus = (originalIdx: number, originalStatus?: AdjustmentItemStatus): AdjustmentItemStatus => {
              return getAdjustmentStatus(selectedSubmission.id, originalIdx, originalStatus).status;
            };
            
            // Count pending adjustments based on current state
            const pendingAdjustmentCount = moneyAdjustments.filter(({ adj, originalIdx }) => {
              const effectiveStatus = getEffectiveStatus(originalIdx, adj.status as AdjustmentItemStatus);
              return effectiveStatus === 'pending';
            }).length;
            
            // Count pending leaves based on current state
            const pendingLeaveCount = pendingLeaves.filter((leave) => {
              const leaveState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
              return leaveState.status === 'pending';
            }).length;
            
            // Total pending items
            const currentPendingCount = pendingAdjustmentCount + pendingLeaveCount;
            
            // Only approved adjustments should change the displayed net pay.
            // Pending adjustments remain visible as line items + the count label.
            const approvedAdjustmentTotal = moneyAdjustments.reduce((sum, { adj, originalIdx }) => {
              const effectiveStatus = getEffectiveStatus(originalIdx, adj.status as AdjustmentItemStatus);
              return effectiveStatus === 'approved' ? sum + (adj.amount || 0) : sum;
            }, 0);
            
            // Calculate approved unpaid leave deductions
            const approvedLeaveDeduction = pendingLeaves.reduce((sum, leave) => {
              const leaveState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
              if (leaveState.status === 'approved' && leaveTypeConfig[leave.leaveType].affectsPay && leave.dailyRate) {
                return sum + (leave.daysInThisPeriod * leave.dailyRate);
              }
              return sum;
            }, 0);
            
            const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
            const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
            
            const baseNet = selectedSubmission.estimatedNet || selectedSubmission.basePay || 0;
            // Net pay updates only when items are approved.
            const adjustedNet = baseNet + approvedAdjustmentTotal - approvedLeaveDeduction;
            const hasAdjustments = allAdjustments.length > 0;
            const hasLeaves = pendingLeaves.length > 0;
            
            // Count items by status for each section
            const getAdjustmentCounts = (types: string[]) => {
              const filtered = allAdjustments
                .map((adj, idx) => ({ adj, idx }))
                .filter(({ adj }) => types.includes(adj.type));
              
              let pending = 0, approved = 0, rejected = 0;
              filtered.forEach(({ adj, idx }) => {
                const status = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus).status;
                if (status === 'pending') pending++;
                else if (status === 'approved') approved++;
                else if (status === 'rejected') rejected++;
              });
              return { pending, approved, rejected, total: filtered.length };
            };
            
            const earningAdjCounts = getAdjustmentCounts(['expenses', 'bonus']);
            const overtimeCounts = getAdjustmentCounts(['overtime']);
            
            const leaveCounts = {
              pending: pendingLeaveCount,
              approved: pendingLeaves.filter(l => getLeaveStatus(selectedSubmission.id, l.id, l.status).status === 'approved').length,
              rejected: pendingLeaves.filter(l => getLeaveStatus(selectedSubmission.id, l.id, l.status).status === 'rejected').length,
              total: pendingLeaves.length
            };
            
            // Filter items based on showPendingOnly - only pending, not rejected
            const shouldShowItem = (status: AdjustmentItemStatus) => {
              if (!showPendingOnly) return true;
              return status === 'pending';
            };
            
            return (
              <>
                {/* Compact header */}
                <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <SheetTitle className="text-base font-semibold">Pay breakdown</SheetTitle>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground">
                      {selectedSubmission.periodLabel || "Jan 1–31"}
                    </Badge>
                  </div>
                  <SheetDescription className="sr-only">Pay breakdown details</SheetDescription>
                  
                  {/* Worker info + toggle in same row */}
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                        {getInitials(selectedSubmission.workerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{selectedSubmission.workerName}</p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {selectedSubmission.workerCountry} · {selectedSubmission.workerType === "employee" ? "Employee" : "Contractor"}
                      </p>
                    </div>
                    
                    {/* Inline pending toggle */}
                    {currentPendingCount > 0 && (
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <span className="text-[10px] text-muted-foreground/60">Pending</span>
                        <Switch
                          checked={showPendingOnly}
                          onCheckedChange={setShowPendingOnly}
                          className="h-4 w-7 data-[state=checked]:bg-orange-500"
                        />
                      </label>
                    )}
                  </div>
                </SheetHeader>

                {/* Content with collapsible sections */}
                <div className="px-5 py-3 space-y-1" onClick={() => setExpandedItemId(null)}>
                  
                  {/* EARNINGS Section - Collapsed by default, auto-expand when filtering */}
                  {(!showPendingOnly || earningAdjCounts.pending > 0) && (
                    <CollapsibleSection
                      title="Earnings"
                      defaultOpen={false}
                      forceOpen={showPendingOnly && earningAdjCounts.pending > 0 ? true : undefined}
                      pendingCount={earningAdjCounts.pending}
                      approvedCount={earnings.length + earningAdjCounts.approved}
                    >
                    {/* Base earnings */}
                    {!showPendingOnly && earnings.map((item, idx) => (
                      <BreakdownRow
                        key={idx}
                        label={item.label}
                        amount={item.amount}
                        currency={currency}
                        isLocked={item.locked}
                        isPositive
                      />
                    ))}
                    {/* Adjustments (Expenses, Bonus) - no wrapper div */}
                    {allAdjustments
                      .map((adj, originalIdx) => ({ adj, originalIdx }))
                      .filter(({ adj }) => adj.type === 'expenses' || adj.type === 'bonus')
                      .filter(({ adj, originalIdx }) => {
                        const status = getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus).status;
                        return shouldShowItem(status);
                      })
                      .map(({ adj, originalIdx }) => {
                        const config = submissionTypeConfig[adj.type as SubmissionType];
                        if (!config) return null;
                        const adjState = getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus);
                        const itemId = `adj-${originalIdx}`;
                        return (
                          <AdjustmentRow
                            key={itemId}
                            label={config.label}
                            amount={adj.amount || 0}
                            currency={adj.currency || currency}
                            status={adjState.status}
                            rejectionReason={adjState.rejectionReason || adj.rejectionReason}
                            isExpanded={expandedItemId === itemId}
                            onToggleExpand={() => setExpandedItemId(expandedItemId === itemId ? null : itemId)}
                            onApprove={() => {
                              updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'approved' });
                              toast.success(`Approved ${config.label.toLowerCase()}`);
                            }}
                            onReject={(reason) => {
                              updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'rejected', rejectionReason: reason });
                              toast.info(`Rejected ${config.label.toLowerCase()}`);
                            }}
                          />
                        );
                      })}
                    {/* Total Earnings */}
                    {!showPendingOnly && (
                      <BreakdownRow
                        label="Total earnings"
                        amount={totalEarnings + approvedAdjustmentTotal}
                        currency={currency}
                        isPositive
                        isTotal
                      />
                    )}
                  </CollapsibleSection>
                  )}
                  {/* DEDUCTIONS Section - Collapsed by default */}
                  {deductions.length > 0 && !showPendingOnly && (
                    <CollapsibleSection
                      title="Deductions"
                      defaultOpen={false}
                      approvedCount={deductions.length}
                    >
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
                    </CollapsibleSection>
                  )}

                  {/* OVERTIME Section - Collapsed by default, auto-expand when filtering */}
                  {overtimeCounts.total > 0 && (!showPendingOnly || overtimeCounts.pending > 0) && (
                    <CollapsibleSection
                      title="Overtime"
                      defaultOpen={false}
                      forceOpen={showPendingOnly && overtimeCounts.pending > 0 ? true : undefined}
                      pendingCount={overtimeCounts.pending}
                      approvedCount={overtimeCounts.approved}
                    >
                      {allAdjustments
                        .map((adj, originalIdx) => ({ adj, originalIdx }))
                        .filter(({ adj }) => adj.type === 'overtime')
                        .filter(({ adj, originalIdx }) => {
                          const status = getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus).status;
                          return shouldShowItem(status);
                        })
                        .map(({ adj, originalIdx }) => {
                          const adjState = getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus);
                          const itemId = `overtime-${originalIdx}`;
                          return (
                            <AdjustmentRow
                              key={itemId}
                              label={`${adj.hours || 0}h logged`}
                              amount={adj.amount || 0}
                              currency={currency}
                              status={adjState.status}
                              rejectionReason={adjState.rejectionReason || adj.rejectionReason}
                              isExpanded={expandedItemId === itemId}
                              onToggleExpand={() => setExpandedItemId(expandedItemId === itemId ? null : itemId)}
                              onApprove={() => {
                                updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'approved' });
                                toast.success('Approved overtime');
                              }}
                              onReject={(reason) => {
                                updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'rejected', rejectionReason: reason });
                                toast.info('Rejected overtime');
                              }}
                            />
                          );
                        })}
                    </CollapsibleSection>
                  )}

                  {/* LEAVE Section - Collapsed by default, auto-expand when filtering */}
                  {hasLeaves && (!showPendingOnly || leaveCounts.pending > 0) && (
                    <CollapsibleSection
                      title="Leave"
                      defaultOpen={false}
                      forceOpen={showPendingOnly && leaveCounts.pending > 0 ? true : undefined}
                      pendingCount={leaveCounts.pending}
                      approvedCount={leaveCounts.approved}
                    >
                      {pendingLeaves
                        .filter((leave) => {
                          const status = getLeaveStatus(selectedSubmission.id, leave.id, leave.status).status;
                          return shouldShowItem(status);
                        })
                        .map((leave) => {
                          const leaveState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
                          const itemId = `leave-${leave.id}`;
                          return (
                            <LeaveRow
                              key={itemId}
                              leave={{
                                ...leave,
                                status: leaveState.status,
                                rejectionReason: leaveState.rejectionReason || leave.rejectionReason,
                              }}
                              currency={currency}
                              isExpanded={expandedItemId === itemId}
                              onToggleExpand={() => setExpandedItemId(expandedItemId === itemId ? null : itemId)}
                              onApprove={() => {
                                updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'approved' });
                                toast.success(`Approved ${leaveTypeConfig[leave.leaveType].label.toLowerCase()}`);
                              }}
                              onReject={(reason) => {
                                updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'rejected', rejectionReason: reason });
                                toast.info(`Rejected ${leaveTypeConfig[leave.leaveType].label.toLowerCase()}`);
                              }}
                            />
                          );
                        })}
                    </CollapsibleSection>
                  )}

                  {/* Estimated net pay - above rejection section */}
                  <section className="pt-2 border-t border-border/40">
                    <div className={cn(
                      "flex justify-between py-3",
                      currentPendingCount > 0 ? "items-start" : "items-center"
                    )}>
                      <div>
                        <p className="text-sm font-medium text-foreground">Estimated net pay</p>
                        {currentPendingCount > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {pendingAdjustmentCount > 0 && pendingLeaveCount > 0 
                              ? `${pendingAdjustmentCount} pending adjustment${pendingAdjustmentCount !== 1 ? 's' : ''} · ${pendingLeaveCount} pending leave${pendingLeaveCount !== 1 ? 's' : ''}`
                              : pendingLeaveCount > 0 
                                ? `${pendingLeaveCount} pending leave${pendingLeaveCount !== 1 ? 's' : ''}`
                                : `${pendingAdjustmentCount} pending adjustment${pendingAdjustmentCount !== 1 ? 's' : ''}`
                            }
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground tabular-nums font-mono tracking-tight">
                          {formatCurrency(adjustedNet, currency)}
                        </p>
                        {(approvedAdjustmentTotal !== 0 || approvedLeaveDeduction !== 0) && (
                          <p className="text-xs text-muted-foreground mt-1 tabular-nums font-mono">
                            Base: {formatCurrency(baseNet, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

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

                {/* Footer - Bulk actions when pending, otherwise close only */}
                <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-6 py-4">
                  {currentPendingCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 h-9 text-xs border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                        onClick={() => setShowBulkRejectDialog(true)}
                      >
                        Reject all ({currentPendingCount})
                      </Button>
                      <Button 
                        size="sm"
                        className="flex-1 h-9 text-xs"
                        onClick={() => setShowBulkApproveDialog(true)}
                      >
                        Approve all ({currentPendingCount})
                      </Button>
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
                
                {/* Bulk action dialogs */}
                <CA3_BulkApproveDialog
                  open={showBulkApproveDialog}
                  onOpenChange={setShowBulkApproveDialog}
                  onConfirm={handleBulkApprove}
                  pendingCount={currentPendingCount}
                />
                <CA3_BulkRejectDialog
                  open={showBulkRejectDialog}
                  onOpenChange={setShowBulkRejectDialog}
                  onConfirm={handleBulkReject}
                  pendingCount={currentPendingCount}
                />
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CA3_SubmissionsView;

