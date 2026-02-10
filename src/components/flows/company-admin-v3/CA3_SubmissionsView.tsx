import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, FileText, Receipt, Timer, Award, ChevronRight, ChevronLeft, Check, X, Users, Briefcase, Lock, Calendar, Filter, Eye, EyeOff, ArrowLeft, Download, Plus, Undo2, XCircle, AlertTriangle, TrendingUp } from "lucide-react";
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
import { CA3_ApproveDialog, CA3_RejectDialog, CA3_BulkApproveDialog, CA3_BulkRejectDialog, CA3_MarkAsReadyDialog } from "./CA3_ConfirmationDialogs";
import { CollapsibleSection } from "./CA3_CollapsibleSection";
import { CA3_AdminAddAdjustment, AdminAddedAdjustment } from "./CA3_AdminAddAdjustment";

// Country flag map for consistent display
const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", USA: "🇺🇸",
  "United States": "🇺🇸", UK: "🇬🇧", "United Kingdom": "🇬🇧"
};

// Note: Leave is handled separately in the Leaves tab, but pending leaves in this pay period 
// can also be reviewed here if admin missed them
export type SubmissionType = "timesheet" | "expenses" | "bonus" | "overtime" | "adjustment" | "correction";
// Worker-level status: pending = has items needing review, reviewed = all approved/rejected awaiting finalization, ready = finalized
export type SubmissionStatus = "pending" | "reviewed" | "ready";
export type AdjustmentItemStatus = "pending" | "approved" | "rejected";
// Only unpaid leave flows through payroll submissions - other leave types handled in Leaves tab
type LeaveTypeLocal = "Unpaid";

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

// Flag types for "Heads up" indicators
export interface WorkerFlag {
  type: "end_date" | "pay_change";
  endDate?: string; // For Flag 1
  endReason?: "Termination" | "Resignation" | "End contract"; // For Flag 1
  payChangePercent?: number; // For Flag 2 (positive = increase, negative = decrease)
  payChangeDelta?: number; // For Flag 2 absolute amount difference
}

// Status change decision for Flag 1
export type StatusDecision = "include" | "exclude";

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
  flags?: WorkerFlag[];
}

import { CA3_PayrollStepper, CA3_PayrollStep } from "./CA3_PayrollStepper";

interface CA3_SubmissionsViewProps {
  submissions: WorkerSubmission[];
  onApprove: (submission: WorkerSubmission) => void;
  onFlag: (submission: WorkerSubmission, reason: string) => void;
  onApproveAll: () => void;
  onContinue: () => void;
  onClose?: () => void;
  onBack?: () => void;
  pendingCount?: number; // If provided, blocks continue when > 0
  // Stepper props
  currentStep?: CA3_PayrollStep;
  completedSteps?: CA3_PayrollStep[];
  onStepClick?: (step: CA3_PayrollStep) => void;
  pendingSubmissions?: number;
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

// Only unpaid leave flows through payroll - it affects pay directly
const leaveTypeConfig: Record<LeaveTypeLocal, { icon: React.ElementType; label: string; color: string; affectsPay: boolean }> = {
  Unpaid: { icon: Calendar, label: "Unpaid Leave", color: "bg-muted text-muted-foreground border-border", affectsPay: true },
};

const statusConfig: Record<SubmissionStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-orange-600" },
  reviewed: { icon: Eye, label: "Reviewed", color: "text-blue-600" },
  ready: { icon: CheckCircle2, label: "Ready", color: "text-accent-green-text" },
};

// Interactive adjustment row with 2-step review flow:
// Step 1: Approve/Reject (reversible with Undo)
// Step 2: Mark as Ready (finalization happens at worker level)
const AdjustmentRow = ({ 
  label, 
  amount, 
  currency, 
  status,
  rejectionReason,
  onApprove,
  onReject,
  onUndo,
  isExpanded = false,
  onToggleExpand,
  isFinalized = false,
}: { 
  label: string;
  amount: number;
  currency: string;
  status: AdjustmentItemStatus;
  rejectionReason?: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onUndo?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isFinalized?: boolean;
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Direct approve - no confirmation dialog (reversible)
  const handleApproveClick = () => {
    onApprove();
    toggleExpand();
  };

  // Direct reject - no confirmation dialog (reversible)
  const handleRejectClick = () => {
    if (rejectReasonInput.trim()) {
      onReject(rejectReasonInput);
      toggleExpand();
      setShowRejectForm(false);
      setRejectReasonInput("");
    }
  };

  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const isApproved = status === 'approved';

  // Approved state - show with Undo option (unless finalized)
  if (isApproved) {
    return (
      <div 
        className="flex items-center justify-between py-2 -mx-3 px-3 rounded group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text shrink-0" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isFinalized && onUndo && isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); onUndo(); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </button>
          )}
          <span className="text-sm tabular-nums font-mono text-foreground">
            +{formatAmount(amount, currency)}
          </span>
        </div>
      </div>
    );
  }

  // Rejected state - show with Undo option (unless finalized) and hover-reveal reason
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
              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <span className="text-sm text-muted-foreground line-through">{label}</span>
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold bg-destructive/10 text-destructive border-destructive/40"
              >
                Rejected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {!isFinalized && onUndo && isHovered && (
                <button
                  onClick={(e) => { e.stopPropagation(); onUndo(); }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Undo2 className="h-3 w-3" />
                  Undo
                </button>
              )}
              <span className="text-sm tabular-nums font-mono text-muted-foreground/60 line-through">
                +{formatAmount(amount, currency)}
              </span>
            </div>
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

  // Pending state - wrapped container for unified expanded state
  return (
    <div 
      className={cn(
        "-mx-3 px-3 rounded transition-colors",
        expanded 
          ? "bg-orange-50/80 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20" 
          : "hover:bg-orange-100/70 dark:hover:bg-orange-500/15"
      )}
    >
      {/* Header row */}
      <div 
        className="flex items-center justify-between py-2 cursor-pointer"
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
      
      {/* Expanded action panel - No confirmation dialogs, direct actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-3">
              {!showRejectForm ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRejectForm(true);
                    }}
                    className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-none hover:shadow-none hover:translate-y-0"
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
                    className="flex-1 h-8 text-xs gap-1.5 shadow-none hover:shadow-none hover:translate-y-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-md border border-border/50 bg-background/80" onClick={(e) => e.stopPropagation()}>
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
                      className="flex-1 h-8 text-xs shadow-none hover:shadow-none hover:translate-y-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRejectClick}
                      disabled={!rejectReasonInput.trim()}
                      className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white shadow-none hover:shadow-none hover:translate-y-0"
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

// Interactive leave row with 2-step review flow:
// Step 1: Approve/Reject (reversible with Undo)
// Step 2: Mark as Ready (finalization happens at worker level)
const LeaveRow = ({ 
  leave,
  currency,
  onApprove,
  onReject,
  onUndo,
  isExpanded = false,
  onToggleExpand,
  isFinalized = false,
}: { 
  leave: PendingLeaveItem;
  currency: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onUndo?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isFinalized?: boolean;
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  
  const config = leaveTypeConfig[leave.leaveType as keyof typeof leaveTypeConfig];
  
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

  // Calculate deduction for unpaid leave (only if config exists)
  const deductionAmount = config?.affectsPay && leave.dailyRate 
    ? leave.daysInThisPeriod * leave.dailyRate 
    : 0;
    
  // Return null if leave type is not supported (only Unpaid is in payroll submissions)
  if (!config) {
    return null;
  }

  const isPending = leave.status === 'pending';
  const isRejected = leave.status === 'rejected';
  const isApproved = leave.status === 'approved';

  // Direct approve - no confirmation dialog (reversible)
  const handleApproveClick = () => {
    onApprove();
    toggleExpand();
  };

  // Direct reject - no confirmation dialog (reversible)
  const handleRejectClick = () => {
    if (rejectReasonInput.trim()) {
      onReject(rejectReasonInput);
      toggleExpand();
      setShowRejectForm(false);
      setRejectReasonInput("");
    }
  };

  // Approved state - show with Undo option (unless finalized)
  if (isApproved) {
    return (
      <div 
        className="flex items-center justify-between py-2.5 -mx-3 px-3 rounded group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm text-muted-foreground">{config.label}</span>
            <span className="text-xs text-muted-foreground/70">
              {leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`} · {formatDateRange(leave.startDate, leave.endDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {!isFinalized && onUndo && isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); onUndo(); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </button>
          )}
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

  // Rejected state - show with Undo option (unless finalized) and hover-reveal reason
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
                <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-sm text-muted-foreground line-through">{config.label}</span>
                <Badge 
                  variant="outline" 
                  className="text-[11px] px-2 py-0.5 shrink-0 font-medium bg-destructive/10 text-destructive border-destructive/30 pointer-events-none"
                >
                  Rejected
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground/50 line-through pl-5">
                {leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod} day${leave.daysInThisPeriod > 1 ? 's' : ''}`} · {formatDateRange(leave.startDate, leave.endDate)}
              </span>
            </div>
            {!isFinalized && onUndo && isHovered && (
              <button
                onClick={(e) => { e.stopPropagation(); onUndo(); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors shrink-0"
              >
                <Undo2 className="h-3 w-3" />
                Undo
              </button>
            )}
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

  // Pending state - wrapped container for unified expanded state
  return (
    <div 
      className={cn(
        "-mx-3 px-3 rounded transition-colors",
        expanded 
          ? "bg-orange-50/80 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20" 
          : "hover:bg-orange-100/70 dark:hover:bg-orange-500/15"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header row */}
      <div 
        className="flex items-center justify-between py-2 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
      >
        <div className="flex flex-col gap-0 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{config.label}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
              pending
            </span>
          </div>
          {/* Dates revealed on hover (when not expanded) */}
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

      {/* Expanded action panel - No confirmation dialogs, direct actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-3">
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
                    className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-none hover:shadow-none hover:translate-y-0"
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
                    className="flex-1 h-8 text-xs gap-1.5 shadow-none hover:shadow-none hover:translate-y-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-md border border-border/50 bg-background/80" onClick={(e) => e.stopPropagation()}>
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
                      className="flex-1 h-8 text-xs shadow-none hover:shadow-none hover:translate-y-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRejectClick}
                      disabled={!rejectReasonInput.trim()}
                      className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white shadow-none hover:shadow-none hover:translate-y-0"
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
  onBack,
  pendingCount: externalPendingCount,
  // Stepper props
  currentStep = "submissions",
  completedSteps = [],
  onStepClick,
  pendingSubmissions = 0,
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
  
  // Admin-added adjustments (keyed by submissionId)
  const [adminAdjustments, setAdminAdjustments] = useState<Record<string, AdminAddedAdjustment[]>>({});
  
  // Finalized workers - once finalized, their items are locked
  const [finalizedWorkers, setFinalizedWorkers] = useState<Set<string>>(new Set());
  // Status change decisions (Flag 1) - keyed by worker submission id
  const [statusDecisions, setStatusDecisions] = useState<Record<string, StatusDecision>>({});
  
  // Bulk action dialogs
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  
  // Mark as Ready dialog
  const [showMarkAsReadyDialog, setShowMarkAsReadyDialog] = useState(false);
  
  // Receipt view state
  const [showReceiptView, setShowReceiptView] = useState(false);
  
  // Admin add adjustment mode
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  
  // Track newly added adjustment for animation + auto-expand
  const [newlyAddedSection, setNewlyAddedSection] = useState<'earnings' | 'overtime' | 'leave' | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  
  // Handle admin adding adjustment on behalf of worker
  const handleAdminAddAdjustment = (submissionId: string, adjustment: AdminAddedAdjustment) => {
    setAdminAdjustments(prev => ({
      ...prev,
      [submissionId]: [...(prev[submissionId] || []), adjustment]
    }));
    setIsAddingAdjustment(false);
    toast.success(`${adjustment.type === 'expense' ? 'Expense' : adjustment.type === 'overtime' ? 'Overtime' : 'Unpaid leave'} added successfully`);
    
    // Set which section to auto-expand and which item to highlight
    const section = adjustment.type === 'expense' ? 'earnings' : adjustment.type === 'overtime' ? 'overtime' : 'leave';
    setNewlyAddedSection(section);
    setNewlyAddedId(adjustment.id);
    
    // Clear highlight and collapse after animation
    setTimeout(() => {
      setNewlyAddedId(null);
      setNewlyAddedSection(null);
    }, 2000);
  };
  
  // Remove admin-added adjustment
  const handleRemoveAdminAdjustment = (submissionId: string, adjustmentId: string) => {
    setAdminAdjustments(prev => ({
      ...prev,
      [submissionId]: (prev[submissionId] || []).filter(a => a.id !== adjustmentId),
    }));
    toast.info("Adjustment removed");
  };

  // Computed counts - dynamically calculate based on local state overrides
  const dynamicPendingCount = useMemo(() => {
    return submissions.reduce((count, submission) => {
      // Count pending adjustments considering local overrides
      // Only count adjustments with amounts (timesheets without amounts are informational only)
      const pendingAdjustments = submission.submissions.filter((adj, idx) => {
        const key = `${submission.id}-${idx}`;
        const localState = adjustmentStates[key];
        const effectiveStatus = localState?.status || adj.status || 'pending';
        return effectiveStatus === 'pending' && typeof adj.amount === 'number';
      }).length;
      
      // Count rejected adjustments - worker needs to resubmit
      const rejectedAdjustments = submission.submissions.filter((adj, idx) => {
        const key = `${submission.id}-${idx}`;
        const localState = adjustmentStates[key];
        const effectiveStatus = localState?.status || adj.status || 'pending';
        return effectiveStatus === 'rejected' && typeof adj.amount === 'number';
      }).length;
      
      // Count pending leaves considering local overrides
      const pendingLeaves = (submission.pendingLeaves || []).filter((leave) => {
        const key = `${submission.id}-leave-${leave.id}`;
        const localState = leaveStates[key];
        const effectiveStatus = localState?.status || leave.status || 'pending';
        return effectiveStatus === 'pending';
      }).length;
      
      // Count rejected leaves - worker needs to resubmit
      const rejectedLeaves = (submission.pendingLeaves || []).filter((leave) => {
        const key = `${submission.id}-leave-${leave.id}`;
        const localState = leaveStates[key];
        const effectiveStatus = localState?.status || leave.status || 'pending';
        return effectiveStatus === 'rejected';
      }).length;
      
      // If worker has any pending OR rejected items, count as pending worker
      return count + ((pendingAdjustments + pendingLeaves + rejectedAdjustments + rejectedLeaves) > 0 ? 1 : 0);
    }, 0);
  }, [submissions, adjustmentStates, leaveStates]);
  
  const internalPendingCount = submissions.filter(s => s.status === "pending").length;
  const pendingCount = externalPendingCount ?? dynamicPendingCount;
  // Ready count = workers that have been finalized (marked as ready)
  const readyCount = finalizedWorkers.size;
  
  // Can continue only when ALL workers have been marked as ready
  const canContinue = finalizedWorkers.size === submissions.length && submissions.length > 0;

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

  // Undo adjustment status (revert to pending)
  const undoAdjustmentStatus = (submissionId: string, adjIndex: number) => {
    const key = `${submissionId}-${adjIndex}`;
    setAdjustmentStates(prev => ({
      ...prev,
      [key]: { status: 'pending' }
    }));
    toast.info('Action undone');
  };

  // Undo leave status (revert to pending)
  const undoLeaveStatus = (submissionId: string, leaveId: string) => {
    const key = `${submissionId}-leave-${leaveId}`;
    setLeaveStates(prev => ({
      ...prev,
      [key]: { status: 'pending' }
    }));
    toast.info('Action undone');
  };

  // Mark worker as ready (finalize all reviews)
  const handleMarkAsReady = () => {
    if (!selectedSubmission) return;
    
    setFinalizedWorkers(prev => new Set(prev).add(selectedSubmission.id));
    setDrawerOpen(false);
    toast.success(`${selectedSubmission.workerName} marked as ready`);
  };

  // Check if current worker is finalized
  const isWorkerFinalized = (workerId: string) => finalizedWorkers.has(workerId);

  const renderSubmissionRow = (submission: WorkerSubmission) => {
    const TypeIcon = submission.workerType === "employee" ? Users : Briefcase;
    
    // Count pending adjustments for this worker (considering local state overrides)
    const pendingAdjustmentCount = submission.submissions.filter((adj, idx) => {
      const key = `${submission.id}-${idx}`;
      const localState = adjustmentStates[key];
      const effectiveStatus = localState?.status || adj.status || 'pending';
      return effectiveStatus === 'pending' && typeof adj.amount === 'number';
    }).length;
    
    // Count rejected adjustments for this worker
    const rejectedAdjustmentCount = submission.submissions.filter((adj, idx) => {
      const key = `${submission.id}-${idx}`;
      const localState = adjustmentStates[key];
      const effectiveStatus = localState?.status || adj.status || 'pending';
      return effectiveStatus === 'rejected' && typeof adj.amount === 'number';
    }).length;
    
    // Count pending leaves for this worker
    const pendingLeaveCount = (submission.pendingLeaves || []).filter((leave) => {
      const leaveState = getLeaveStatus(submission.id, leave.id, leave.status);
      return leaveState.status === 'pending';
    }).length;
    
    // Count rejected leaves for this worker
    const rejectedLeaveCount = (submission.pendingLeaves || []).filter((leave) => {
      const leaveState = getLeaveStatus(submission.id, leave.id, leave.status);
      return leaveState.status === 'rejected';
    }).length;
    
    // Total pending items (adjustments + leaves)
    const workerPendingCount = pendingAdjustmentCount + pendingLeaveCount;
    
    // Total rejected items - worker needs to resubmit
    const workerRejectedCount = rejectedAdjustmentCount + rejectedLeaveCount;
    
    // Check if worker is finalized
    const isFinalized = isWorkerFinalized(submission.id);
    
    // Derive effective worker status: 
    // - pending = has items needing review
    // - reviewed = all items approved/rejected, awaiting "Mark as Ready"
    // - ready = admin has clicked "Mark as Ready" (finalized)
    let effectiveWorkerStatus: SubmissionStatus;
    if (isFinalized) {
      effectiveWorkerStatus = "ready";
    } else if (workerPendingCount > 0) {
      effectiveWorkerStatus = "pending";
    } else {
      // All items reviewed but not yet finalized
      effectiveWorkerStatus = "reviewed";
    }
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground leading-tight">
              {countryFlags[submission.workerCountry] || ""} {submission.workerCountry}
            </span>
            {workerRejectedCount > 0 && workerPendingCount === 0 && (
              <span className="text-[10px] text-destructive/80">
                · 1 day to resubmit
              </span>
            )}
            {!isFinalized && submission.flags?.map((flag, fi) => (
              <Badge key={fi} variant="outline" className={cn(
                "text-[9px] px-1.5 py-0 h-4 pointer-events-none font-medium",
                flag.type === "end_date" 
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" 
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
              )}>
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                {flag.type === "end_date" ? "Heads up: Status change" : "Heads up: Pay change"}
              </Badge>
            ))}
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

          {/* Status with pending count, reviewed indicator, or ready */}
          <div className={cn("flex items-center gap-1.5 text-xs", status.color)}>
            {workerPendingCount > 0 ? (
              <>
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-orange-500/15 text-orange-600 text-[10px] font-semibold">
                  {workerPendingCount}
                </span>
                <span className="hidden sm:inline">{status.label}</span>
              </>
            ) : effectiveWorkerStatus === 'reviewed' ? (
              <>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{status.label}</span>
                {workerRejectedCount > 0 && (
                  <span className="flex items-center justify-center h-4 w-4 rounded-full bg-destructive/15 text-destructive text-[10px] font-semibold ml-0.5">
                    {workerRejectedCount}
                  </span>
                )}
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
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <CA3_PayrollStepper
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={onStepClick}
                pendingSubmissions={pendingSubmissions || dynamicPendingCount}
              />
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      size="sm"
                      onClick={onContinue}
                      disabled={!canContinue}
                      className="h-9 text-xs"
                    >
                      Continue to Submit
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canContinue && (
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Mark all {submissions.length - readyCount} remaining worker{submissions.length - readyCount !== 1 ? 's' : ''} as ready before continuing</p>
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
        <SheetContent
          side="right"
          className="w-full sm:max-w-[420px] overflow-y-auto p-0"
          hideClose={isAddingAdjustment}
        >
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
            
            // Get admin-added adjustments for this worker
            const workerAdminAdjustments = adminAdjustments[selectedSubmission.id] || [];
            
            // Calculate admin-added adjustment totals
            const adminExpenseTotal = workerAdminAdjustments
              .filter(a => a.type === 'expense')
              .reduce((sum, a) => sum + (a.amount || 0), 0);
            const adminOvertimeTotal = workerAdminAdjustments
              .filter(a => a.type === 'overtime')
              .reduce((sum, a) => sum + (a.amount || 0), 0);
            const adminUnpaidLeaveTotal = workerAdminAdjustments
              .filter(a => a.type === 'unpaid_leave')
              .reduce((sum, a) => sum + (a.amount || 0), 0);
            
            const adminAdditionsTotal = adminExpenseTotal + adminOvertimeTotal;
            const adminDeductionsTotal = adminUnpaidLeaveTotal;
            
            const baseNet = selectedSubmission.estimatedNet || selectedSubmission.basePay || 0;
            // Net pay updates only when items are approved (or admin-added).
            const adjustedNet = baseNet + approvedAdjustmentTotal + adminAdditionsTotal - approvedLeaveDeduction - adminDeductionsTotal;
            const hasAdjustments = allAdjustments.length > 0;
            const hasLeaves = pendingLeaves.length > 0;
            const hasAdminAdjustments = workerAdminAdjustments.length > 0;
            
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
                {/* Add Adjustment takes over entire drawer when active */}
                {isAddingAdjustment ? (
                  <CA3_AdminAddAdjustment
                    workerType={selectedSubmission.workerType}
                    workerName={selectedSubmission.workerName}
                    currency={currency}
                    dailyRate={selectedSubmission.basePay ? selectedSubmission.basePay / 22 : 100}
                    hourlyRate={selectedSubmission.basePay ? selectedSubmission.basePay / 176 : 15}
                    isOpen={isAddingAdjustment}
                    onOpenChange={setIsAddingAdjustment}
                    onAddAdjustment={(adjustment) => handleAdminAddAdjustment(selectedSubmission.id, adjustment)}
                  />
                ) : (
                <>
                {/* Clean minimal header */}
                <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/20">
                  <SheetDescription className="sr-only">Pay breakdown details</SheetDescription>
                  
                  {/* Worker row - name + inline actions */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials(selectedSubmission.workerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <SheetTitle className="text-sm font-semibold text-foreground leading-tight">
                          {selectedSubmission.workerName}
                        </SheetTitle>
                        {/* Inline actions - next to name */}
                        {!showPendingOnly && (
                          <button
                            onClick={() => setIsAddingAdjustment(true)}
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50 rounded-full hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>Add</span>
                          </button>
                        )}
                        {currentPendingCount > 0 && (
                          <label className="flex items-center gap-1 cursor-pointer">
                            <Switch
                              checked={showPendingOnly}
                              onCheckedChange={setShowPendingOnly}
                              className="h-3 w-6 data-[state=checked]:bg-primary [&>span]:h-2 [&>span]:w-2 [&>span]:data-[state=checked]:translate-x-3"
                            />
                            <span className="text-[10px] text-muted-foreground">Pending</span>
                          </label>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        {selectedSubmission.workerCountry} · {selectedSubmission.periodLabel || "Jan 1 – Jan 31"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Net pay hero */}
                  {!isAddingAdjustment && (
                    <div className="mt-4 pt-4 border-t border-border/20">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                            {selectedSubmission.workerType === "employee" ? "Estimated net" : "Invoice total"}
                          </p>
                          <button 
                            onClick={() => setShowReceiptView(true)}
                            className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors mt-0.5"
                          >
                            View receipt →
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                            {formatCurrency(adjustedNet, currency)}
                          </p>
                          {(approvedAdjustmentTotal !== 0 || approvedLeaveDeduction !== 0 || hasAdminAdjustments) && (
                            <p className="text-[10px] text-muted-foreground/60 tabular-nums">
                              was {formatCurrency(baseNet, currency)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </SheetHeader>

                {/* Flag 1: Status change decision gate */}
                {(() => {
                  const endDateFlag = selectedSubmission.flags?.find(f => f.type === "end_date");
                  const decision = statusDecisions[selectedSubmission.id];
                  if (!endDateFlag) return null;

                  // Show confirmation pill if decision already made
                  if (decision) {
                    const opposite = decision === "include" ? "exclude" : "include";
                    return (
                      <div className="px-5 py-2.5 border-b border-border/20">
                        <div
                          className="group/toggle inline-flex cursor-pointer relative"
                          onClick={() => {
                            setStatusDecisions(prev => ({ ...prev, [selectedSubmission.id]: opposite }));
                            if (opposite === "exclude") {
                              setFinalizedWorkers(prev => new Set(prev).add(selectedSubmission.id));
                            } else {
                              setFinalizedWorkers(prev => { const next = new Set(prev); next.delete(selectedSubmission.id); return next; });
                            }
                            toast.info(`${selectedSubmission.workerName} ${opposite === "include" ? "included in" : "excluded from"} this run`);
                          }}
                        >
                          <Badge variant="outline" className={cn(
                            "gap-1.5 text-xs transition-opacity group-hover/toggle:opacity-0",
                            decision === "include"
                              ? "border-accent-green/20 bg-accent-green/5 text-accent-green-text"
                              : "border-muted-foreground/20 bg-muted/30 text-muted-foreground"
                          )}>
                            <CheckCircle2 className="h-3 w-3" />
                            {decision === "include" ? "Included in this run" : "Excluded from this run"}
                          </Badge>
                          <Badge variant="outline" className="gap-1.5 text-xs absolute inset-0 opacity-0 group-hover/toggle:opacity-100 transition-opacity border-primary/30 bg-primary/5 text-primary cursor-pointer">
                            {opposite === "include" ? "Include in this run" : "Exclude from this run"}
                          </Badge>
                        </div>
                      </div>
                    );
                  }

                  // Decision card - gates all other actions
                  return (
                    <div className="px-5 py-3 border-b border-border/20">
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                        <div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground">Status change affects payroll</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              This worker was marked <span className="font-medium text-foreground">{endDateFlag.endReason || "status change"}</span> on <span className="font-medium text-foreground">{endDateFlag.endDate || "TBD"}</span>. Confirm whether they should be included in this payroll run.
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 space-y-0.5">
                          {endDateFlag.endReason && <p>Status: {endDateFlag.endReason}</p>}
                          {endDateFlag.endDate && <p>Effective date: {endDateFlag.endDate}</p>}
                          {selectedSubmission.periodLabel && <p>Payroll period: {selectedSubmission.periodLabel}</p>}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs shadow-none hover:shadow-none hover:translate-y-0"
                            onClick={() => {
                              setStatusDecisions(prev => ({ ...prev, [selectedSubmission.id]: "exclude" }));
                              setFinalizedWorkers(prev => new Set(prev).add(selectedSubmission.id));
                              toast.info(`${selectedSubmission.workerName} excluded from this run`);
                            }}
                          >
                            Exclude from this run
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs shadow-none hover:shadow-none hover:translate-y-0"
                            onClick={() => {
                              setStatusDecisions(prev => ({ ...prev, [selectedSubmission.id]: "include" }));
                              toast.success(`${selectedSubmission.workerName} included in this run`);
                            }}
                          >
                            Include in this run
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Content with collapsible sections */}
                <div className="px-5 py-4 space-y-0.5" onClick={() => setExpandedItemId(null)}>
                  
                  {/* Breakdown sections - hidden when adding adjustment */}
                  {!isAddingAdjustment && (
                    <>
                  
                  {/* Gate content behind status decision when Flag 1 is present */}
                  {(() => {
                    const hasEndDateFlag = selectedSubmission.flags?.some(f => f.type === "end_date");
                    const hasDecision = !!statusDecisions[selectedSubmission.id];
                    if (hasEndDateFlag && !hasDecision) return null;
                    return (
                      <>
                  {(() => {
                    const payChangeFlag = selectedSubmission.flags?.find(f => f.type === "pay_change");
                    return (!showPendingOnly || earningAdjCounts.pending > 0) ? (
                    <CollapsibleSection
                      title="Earnings"
                      defaultOpen={!!payChangeFlag}
                      forceOpen={showPendingOnly ? earningAdjCounts.pending > 0 : (newlyAddedSection === 'earnings' || !!payChangeFlag)}
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
                            onUndo={() => undoAdjustmentStatus(selectedSubmission.id, originalIdx)}
                            isFinalized={isWorkerFinalized(selectedSubmission.id)}
                          />
                        );
                      })}
                    {/* Admin-added expenses */}
                    {!showPendingOnly && workerAdminAdjustments
                      .filter(a => a.type === 'expense')
                      .map((adj) => (
                        <motion.div 
                          key={adj.id} 
                          initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={cn(
                            "rounded transition-all duration-500 group",
                            newlyAddedId === adj.id 
                              ? "bg-primary/5 ring-1 ring-primary/20" 
                              : "-mx-3 px-3 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center justify-between py-2">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm text-foreground">{adj.description || 'Expense'}</span>
                              <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm tabular-nums font-mono text-foreground text-right transition-all group-hover:mr-1">
                                +{formatCurrency(adj.amount || 0, currency)}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveAdminAdjustment(selectedSubmission.id, adj.id); }}
                                className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150"
                              >
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
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
                    {payChangeFlag && !showPendingOnly && (
                      <p className="text-[10px] text-muted-foreground/60 text-right tabular-nums">
                        {(payChangeFlag.payChangePercent || 0) > 0 ? "Up" : "Down"} {Math.abs(payChangeFlag.payChangePercent || 0)}% vs last period{payChangeFlag.payChangeDelta != null && ` (${(payChangeFlag.payChangeDelta || 0) >= 0 ? "+" : "−"}${formatCurrency(Math.abs(payChangeFlag.payChangeDelta || 0), currency)})`}
                      </p>
                    )}
                  </CollapsibleSection>
                  ) : null;
                  })()}
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

                  {/* OVERTIME Section - Collapsed by default, only force open when pending filter or newly added */}
                  {((overtimeCounts.total > 0 || workerAdminAdjustments.some(a => a.type === 'overtime')) && (!showPendingOnly || overtimeCounts.pending > 0)) && (
                    <CollapsibleSection
                      title="Overtime"
                      defaultOpen={false}
                      forceOpen={showPendingOnly ? overtimeCounts.pending > 0 : newlyAddedSection === 'overtime'}
                      pendingCount={overtimeCounts.pending}
                      approvedCount={overtimeCounts.approved + workerAdminAdjustments.filter(a => a.type === 'overtime').length}
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
                              onUndo={() => undoAdjustmentStatus(selectedSubmission.id, originalIdx)}
                              isFinalized={isWorkerFinalized(selectedSubmission.id)}
                            />
                          );
                        })}
                    {/* Admin-added overtime */}
                    {!showPendingOnly && workerAdminAdjustments
                      .filter(a => a.type === 'overtime')
                      .map((adj) => (
                        <motion.div 
                          key={adj.id} 
                          initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={cn(
                            "rounded transition-all duration-500 group",
                            newlyAddedId === adj.id 
                              ? "bg-primary/5 ring-1 ring-primary/20" 
                              : "-mx-3 px-3 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center justify-between py-2">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm text-foreground">{adj.description || `${adj.hours}h overtime`}</span>
                              <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm tabular-nums font-mono text-foreground text-right transition-all group-hover:mr-1">
                                +{formatCurrency(adj.amount || 0, currency)}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveAdminAdjustment(selectedSubmission.id, adj.id); }}
                                className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150"
                              >
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* LEAVE Section - Collapsed by default, only force open when pending filter or newly added */}
                  {((hasLeaves || workerAdminAdjustments.some(a => a.type === 'unpaid_leave')) && (!showPendingOnly || leaveCounts.pending > 0)) && (
                    <CollapsibleSection
                      title="Leave"
                      defaultOpen={false}
                      forceOpen={showPendingOnly ? leaveCounts.pending > 0 : newlyAddedSection === 'leave'}
                      pendingCount={leaveCounts.pending}
                      approvedCount={leaveCounts.approved + workerAdminAdjustments.filter(a => a.type === 'unpaid_leave').length}
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
                              onUndo={() => undoLeaveStatus(selectedSubmission.id, leave.id)}
                              isFinalized={isWorkerFinalized(selectedSubmission.id)}
                            />
                          );
                        })}
                    {/* Admin-added unpaid leave */}
                    {!showPendingOnly && workerAdminAdjustments
                      .filter(a => a.type === 'unpaid_leave')
                      .map((adj) => (
                        <motion.div 
                          key={adj.id} 
                          initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className={cn(
                            "rounded transition-all duration-500 group",
                            newlyAddedId === adj.id 
                              ? "bg-primary/5 ring-1 ring-primary/20" 
                              : "-mx-3 px-3 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center justify-between py-2">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm text-foreground">{adj.description || `${adj.days}d unpaid leave`}</span>
                              <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm tabular-nums font-mono text-muted-foreground text-right transition-all group-hover:mr-1">
                                −{formatCurrency(adj.amount || 0, currency)}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveAdminAdjustment(selectedSubmission.id, adj.id); }}
                                className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150"
                              >
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CollapsibleSection>
                  )}
                    </>
                    );
                  })()}
                  </>
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

                {/* Footer - Show bulk actions when pending items exist, or "Mark as Ready" when all reviewed */}
                {!isAddingAdjustment && !expandedItemId && (() => {
                  const hasEndDateFlag = selectedSubmission.flags?.some(f => f.type === "end_date");
                  const hasDecision = !!statusDecisions[selectedSubmission.id];
                  // Hide footer until decision is made for Flag 1 workers
                  if (hasEndDateFlag && !hasDecision) return null;

                  const isFinalized = isWorkerFinalized(selectedSubmission.id);
                  
                  // Show bulk actions when pending items exist
                  if (currentPendingCount > 0) {
                    return (
                      <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 h-9 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
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
                      </div>
                    );
                  }
                  
                  // Show "Mark as Ready" when no pending items and not yet finalized
                  if (!isFinalized) {
                    return (
                      <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4">
                        <Button 
                          size="sm"
                          className="w-full h-10 text-sm gap-2"
                          onClick={() => setShowMarkAsReadyDialog(true)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as Ready
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center mt-2">
                          This will finalize the review and lock all decisions
                        </p>
                      </div>
                    );
                  }
                  
                  // Show finalized state
                  return (
                    <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4">
                      <div className="flex items-center justify-center gap-2 text-accent-green-text">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Ready for payroll</span>
                      </div>
                    </div>
                  );
                })()}
                </>
                )}
                
                {/* Mark as Ready dialog */}
                {selectedSubmission && (() => {
                  // Calculate counts for the dialog
                  const approvedCount = selectedSubmission.submissions.filter((adj, idx) => {
                    const state = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
                    return state.status === 'approved' && typeof adj.amount === 'number';
                  }).length + (selectedSubmission.pendingLeaves || []).filter((leave) => {
                    const state = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
                    return state.status === 'approved';
                  }).length + (adminAdjustments[selectedSubmission.id] || []).length;
                  
                  const rejectedCount = selectedSubmission.submissions.filter((adj, idx) => {
                    const state = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
                    return state.status === 'rejected' && typeof adj.amount === 'number';
                  }).length + (selectedSubmission.pendingLeaves || []).filter((leave) => {
                    const state = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
                    return state.status === 'rejected';
                  }).length;
                  
                  return (
                    <CA3_MarkAsReadyDialog
                      open={showMarkAsReadyDialog}
                      onOpenChange={setShowMarkAsReadyDialog}
                      onConfirm={handleMarkAsReady}
                      workerName={selectedSubmission.workerName}
                      approvedCount={approvedCount}
                      rejectedCount={rejectedCount}
                    />
                  );
                })()}
                
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
                
                {/* Receipt Overlay View */}
                <AnimatePresence>
                  {showReceiptView && (
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="absolute inset-0 bg-background z-50 flex flex-col"
                    >
                      {/* Receipt Header */}
                      <div className="px-5 pt-5 pb-4 border-b border-border/30">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowReceiptView(false)}
                            className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
                          >
                            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <div className="flex-1">
                            <h2 className="text-base font-semibold text-foreground">
                              {selectedSubmission.workerType === "employee" ? "Payslip" : "Invoice"} Preview
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              {selectedSubmission.periodLabel || "January 2025"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Receipt Content - Scrollable */}
                      <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Worker info card */}
                        <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border/30">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {getInitials(selectedSubmission.workerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{selectedSubmission.workerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedSubmission.workerCountry} · {selectedSubmission.workerType === "employee" ? "Employee" : "Contractor"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Earnings Section */}
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Earnings</h3>
                          <div className="space-y-1.5">
                            {earnings.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="tabular-nums font-mono">{formatCurrency(item.amount, currency)}</span>
                              </div>
                            ))}
                            {/* Approved adjustments */}
                            {allAdjustments
                              .filter(adj => adj.type === 'expenses' || adj.type === 'bonus')
                              .map((adj, idx) => {
                                const adjState = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
                                if (adjState.status !== 'approved') return null;
                                const config = submissionTypeConfig[adj.type as SubmissionType];
                                return (
                                  <div key={`adj-${idx}`} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{config?.label || adj.type}</span>
                                    <span className="tabular-nums font-mono text-accent-green-text">+{formatCurrency(adj.amount || 0, currency)}</span>
                                  </div>
                                );
                              })}
                            <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed border-border/50">
                              <span>Total Earnings</span>
                              <span className="tabular-nums font-mono">{formatCurrency(totalEarnings + approvedAdjustmentTotal, currency)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Deductions Section */}
                        {deductions.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deductions</h3>
                            <div className="space-y-1.5">
                              {deductions.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{item.label}</span>
                                  <span className="tabular-nums font-mono text-muted-foreground">−{formatCurrency(Math.abs(item.amount), currency)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed border-border/50">
                                <span>Total Deductions</span>
                                <span className="tabular-nums font-mono text-muted-foreground">−{formatCurrency(totalDeductions, currency)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Net Pay */}
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">
                              {selectedSubmission.workerType === "employee" ? "Net Pay" : "Invoice Total"}
                            </span>
                            <span className="text-xl font-bold tabular-nums font-mono text-foreground">
                              {formatCurrency(adjustedNet, currency)}
                            </span>
                          </div>
                          {(approvedAdjustmentTotal !== 0 || approvedLeaveDeduction !== 0) && (
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                              Base: {formatCurrency(baseNet, currency)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Receipt Footer */}
                      <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-5 py-4">
                        <Button
                          className="w-full gap-2"
                          onClick={() => {
                            toast.success("Receipt downloaded");
                            setShowReceiptView(false);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download {selectedSubmission.workerType === "employee" ? "Payslip" : "Invoice"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CA3_SubmissionsView;

