/**
 * F1v4_SubmissionsView - Exact clone of CA3_SubmissionsView for Fronted Admin
 * 
 * Reuses all patterns from Flow 6 v3:
 * - 2-Step Review Flow: Approve/Reject (reversible with Undo) -> Mark as Ready (finalization)
 * - Worker rows with pending/reviewed/ready status
 * - Full drawer with pay breakdown, AdjustmentRow, LeaveRow
 * - Direct approve/reject actions (no confirmation dialogs, reversible)
 * - Bulk approve/reject with footer actions
 * - Mark as Ready dialog for finalization
 * - CA3_AdminAddAdjustment for adding adjustments
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle2, Clock, FileText, Receipt, Timer, Award,
  ChevronRight, Check, X, Users, Briefcase, Lock, Calendar,
  ChevronLeft, Download, Plus, Undo2, XCircle, Eye, ArrowLeft,
  AlertTriangle, TrendingUp } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { CA3_BulkApproveDialog, CA3_BulkRejectDialog, CA3_MarkAsReadyDialog, CA3_ExcludeWorkerDialog } from "@/components/flows/company-admin-v3/CA3_ConfirmationDialogs";
import { CollapsibleSection } from "@/components/flows/company-admin-v3/CA3_CollapsibleSection";
import { CA3_AdminAddAdjustment, AdminAddedAdjustment } from "@/components/flows/company-admin-v3/CA3_AdminAddAdjustment";
import { F1v4_PayrollStepper } from "./F1v4_PayrollStepper";

// Country flag map for consistent display
const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", USA: "🇺🇸",
  "United States": "🇺🇸", UK: "🇬🇧", "United Kingdom": "🇬🇧"
};

// Types - matching CA3_SubmissionsView exactly
export type SubmissionType = "timesheet" | "expenses" | "bonus" | "overtime" | "adjustment" | "correction";
// Worker-level status: pending = has items needing review, reviewed = all approved/rejected awaiting finalization, ready = finalized, expired = not ready by cutoff
export type SubmissionStatus = "pending" | "reviewed" | "ready" | "expired";
export type AdjustmentItemStatus = "pending" | "approved" | "rejected";
type LeaveTypeLocal = "Unpaid";

interface PayLineItem {
  label: string;
  amount: number;
  type: 'Earnings' | 'Deduction';
  locked?: boolean;
}

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

export interface PendingLeaveItem {
  id: string;
  leaveType: LeaveTypeLocal;
  startDate: string;
  endDate: string;
  totalDays: number;
  daysInThisPeriod: number;
  reason?: string;
  status: AdjustmentItemStatus;
  rejectionReason?: string;
  dailyRate?: number;
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
  lineItems?: PayLineItem[];
  basePay?: number;
  estimatedNet?: number;
  periodLabel?: string;
  submissions: SubmittedAdjustment[];
  pendingLeaves?: PendingLeaveItem[];
  status: SubmissionStatus;
  totalImpact?: number;
  currency?: string;
  flags?: WorkerFlag[];
  invoiceNumber?: string;
  carryOverFrom?: {period: string;amount: number;invoiceNumber?: string;};
  expiredAdjustments?: SubmittedAdjustment[];
}

interface F1v4_SubmissionsViewProps {
  submissions: WorkerSubmission[];
  onContinue: () => void;
  onClose?: () => void;
}

const submissionTypeConfig: Record<SubmissionType, {icon: React.ElementType;label: string;color: string;}> = {
  timesheet: { icon: Clock, label: "Timesheet", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  expenses: { icon: Receipt, label: "Expense", color: "bg-primary/10 text-primary border-primary/20" },
  bonus: { icon: Award, label: "Bonus", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  overtime: { icon: Timer, label: "Overtime", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  adjustment: { icon: FileText, label: "Adjustment", color: "bg-muted text-muted-foreground border-border/50" },
  correction: { icon: FileText, label: "Correction", color: "bg-muted text-muted-foreground border-border/50" }
};

const leaveTypeConfig: Record<LeaveTypeLocal, {icon: React.ElementType;label: string;color: string;affectsPay: boolean;}> = {
  Unpaid: { icon: Calendar, label: "Unpaid Leave", color: "bg-muted text-muted-foreground border-border", affectsPay: true }
};

const statusConfig: Record<SubmissionStatus, {icon: React.ElementType;label: string;color: string;}> = {
  pending: { icon: Clock, label: "Pending", color: "text-orange-600" },
  reviewed: { icon: Eye, label: "Reviewed", color: "text-blue-600" },
  ready: { icon: CheckCircle2, label: "Ready", color: "text-accent-green-text" },
  expired: { icon: XCircle, label: "Expired", color: "text-muted-foreground" }
};

// AdjustmentRow - Interactive adjustment with 2-step review flow (direct approve/reject, reversible with Undo)
const AdjustmentRow = ({
  label, amount, currency, status, rejectionReason,
  onApprove, onReject, onUndo, isExpanded = false, onToggleExpand, isFinalized = false












}: {label: string;amount: number;currency: string;status: AdjustmentItemStatus;rejectionReason?: string;onApprove: () => void;onReject: (reason: string) => void;onUndo?: () => void;isExpanded?: boolean;onToggleExpand?: () => void;isFinalized?: boolean;}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
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

  // Approved state - show with Undo option (unless finalized)
  if (status === 'approved') {
    return (
      <div
        className="flex items-center justify-between py-2 -mx-3 px-3 rounded group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>

        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text shrink-0" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isFinalized && onUndo && isHovered &&
          <button
            onClick={(e) => {e.stopPropagation();onUndo();}}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">

              <Undo2 className="h-3 w-3" />
              Undo
            </button>
          }
          <span className="text-sm tabular-nums font-mono text-foreground">+{formatAmount(amount, currency)}</span>
        </div>
      </div>);

  }

  // Rejected state - show with Undo option (unless finalized)
  if (status === 'rejected') {
    return (
      <div
        className="mb-1.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>

        <div className="rounded-md overflow-hidden border border-destructive/40 bg-destructive/5">
          <div className="flex items-center justify-between py-2.5 px-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <span className="text-sm text-muted-foreground line-through">{label}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold bg-destructive/10 text-destructive border-destructive/40">
                Rejected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {!isFinalized && onUndo && isHovered &&
              <button
                onClick={(e) => {e.stopPropagation();onUndo();}}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">

                  <Undo2 className="h-3 w-3" />
                  Undo
                </button>
              }
              <span className="text-sm tabular-nums font-mono text-muted-foreground/60 line-through">+{formatAmount(amount, currency)}</span>
            </div>
          </div>
          <AnimatePresence>
            {isHovered && rejectionReason &&
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/30">
                  <p className="text-xs text-destructive/90"><span className="font-medium">Reason:</span> {rejectionReason}</p>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>);

  }

  // Pending state
  return (
    <div className={cn("-mx-3 px-3 rounded transition-colors", expanded ? "bg-orange-50/80 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20" : "hover:bg-orange-100/70 dark:hover:bg-orange-500/15")}>
      <div className="flex items-center justify-between py-2 cursor-pointer" onClick={(e) => {e.stopPropagation();toggleExpand();}}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-foreground">{label}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">pending</span>
        </div>
        <span className="text-sm tabular-nums font-mono text-foreground ml-3">+{formatAmount(amount, currency)}</span>
      </div>
      <AnimatePresence>
        {expanded &&
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
            <div className="pb-3">
              {!showRejectForm ?
            <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => {e.stopPropagation();setShowRejectForm(true);}} className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-none">
                    <X className="h-3.5 w-3.5" />Reject
                  </Button>
                  <Button size="sm" onClick={(e) => {e.stopPropagation();handleApproveClick();}} className="flex-1 h-8 text-xs gap-1.5 shadow-none">
                    <Check className="h-3.5 w-3.5" />Approve
                  </Button>
                </div> :

            <div className="space-y-2 p-3 rounded-md border border-border/50 bg-background/80" onClick={(e) => e.stopPropagation()}>
                  <Textarea placeholder="Reason for rejection..." value={rejectReasonInput} onChange={(e) => setRejectReasonInput(e.target.value)} className="min-h-[60px] resize-none text-sm bg-background" autoFocus />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => {setShowRejectForm(false);setRejectReasonInput("");}} className="flex-1 h-8 text-xs shadow-none">Cancel</Button>
                    <Button size="sm" onClick={handleRejectClick} disabled={!rejectReasonInput.trim()} className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white shadow-none">Reject</Button>
                  </div>
                </div>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

};

// BreakdownRow - Static row for base earnings/deductions
const BreakdownRow = ({ label, amount, currency, isPositive = true, isLocked = false, isTotal = false, className

}: {label: string;amount: number;currency: string;isPositive?: boolean;isLocked?: boolean;isTotal?: boolean;className?: string;}) => {
  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  return (
    <div className={cn("flex items-center justify-between py-2", isTotal && "pt-3 mt-1 border-t border-dashed border-border/50", className)}>
      <span className={cn("truncate", isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground")}>{label}</span>
      <span className={cn("whitespace-nowrap tabular-nums text-right font-mono shrink-0 ml-4", isTotal ? "text-sm font-semibold text-foreground" : "text-sm", isPositive ? "text-foreground" : "text-muted-foreground")}>
        {isPositive ? '' : '−'}{formatAmount(amount, currency)}
      </span>
    </div>);

};

// LeaveRow - Interactive leave with 2-step review flow (direct approve/reject, reversible with Undo)
const LeaveRow = ({ leave, currency, onApprove, onReject, onUndo, isExpanded = false, onToggleExpand, isFinalized = false

}: {leave: PendingLeaveItem;currency: string;onApprove: () => void;onReject: (reason: string) => void;onUndo?: () => void;isExpanded?: boolean;onToggleExpand?: () => void;isFinalized?: boolean;}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded(!localExpanded));
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const config = leaveTypeConfig[leave.leaveType as keyof typeof leaveTypeConfig];
  if (!config) return null;

  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const deductionAmount = config.affectsPay && leave.dailyRate ? leave.daysInThisPeriod * leave.dailyRate : 0;

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
  if (leave.status === 'approved') {
    return (
      <div
        className="flex items-center justify-between py-2 -mx-3 px-3 rounded group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>

        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text shrink-0" />
          <span className="text-sm text-muted-foreground">{config.label} ({leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod}d`})</span>
        </div>
        <div className="flex items-center gap-2">
          {!isFinalized && onUndo && isHovered &&
          <button
            onClick={(e) => {e.stopPropagation();onUndo();}}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">

              <Undo2 className="h-3 w-3" />
              Undo
            </button>
          }
          <span className="text-sm tabular-nums font-mono text-muted-foreground">{deductionAmount > 0 ? `−${formatAmount(deductionAmount, currency)}` : '—'}</span>
        </div>
      </div>);

  }

  // Rejected state - show with Undo option (unless finalized)
  if (leave.status === 'rejected') {
    return (
      <div
        className="mb-1.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>

        <div className="rounded-md overflow-hidden border border-destructive/40 bg-destructive/5">
          <div className="flex items-center justify-between py-2.5 px-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <span className="text-sm text-muted-foreground line-through">{config.label} ({leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod}d`})</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold bg-destructive/10 text-destructive border-destructive/40">Rejected</Badge>
            </div>
            <div className="flex items-center gap-2">
              {!isFinalized && onUndo && isHovered &&
              <button
                onClick={(e) => {e.stopPropagation();onUndo();}}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">

                  <Undo2 className="h-3 w-3" />
                  Undo
                </button>
              }
              <span className="text-sm tabular-nums font-mono text-muted-foreground/60 line-through">{deductionAmount > 0 ? `−${formatAmount(deductionAmount, currency)}` : '—'}</span>
            </div>
          </div>
          <AnimatePresence>
            {isHovered && leave.rejectionReason &&
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/30">
                  <p className="text-xs text-destructive/90"><span className="font-medium">Reason:</span> {leave.rejectionReason}</p>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>);

  }

  // Pending state
  return (
    <div className={cn("-mx-3 px-3 rounded transition-colors", expanded ? "bg-orange-50/80 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20" : "hover:bg-orange-100/70 dark:hover:bg-orange-500/15")}>
      <div className="flex items-center justify-between py-2 cursor-pointer" onClick={(e) => {e.stopPropagation();toggleExpand();}}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-foreground">{config.label} ({leave.daysInThisPeriod === 0.5 ? '½ day' : `${leave.daysInThisPeriod}d`})</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">pending</span>
        </div>
        <span className="text-sm tabular-nums font-mono text-foreground ml-3">{deductionAmount > 0 ? `−${formatAmount(deductionAmount, currency)}` : '—'}</span>
      </div>
      <AnimatePresence>
        {expanded &&
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
            <div className="pb-3">
              {!showRejectForm ?
            <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => {e.stopPropagation();setShowRejectForm(true);}} className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-none">
                    <X className="h-3.5 w-3.5" />Reject
                  </Button>
                  <Button size="sm" onClick={(e) => {e.stopPropagation();handleApproveClick();}} className="flex-1 h-8 text-xs gap-1.5 shadow-none">
                    <Check className="h-3.5 w-3.5" />Approve
                  </Button>
                </div> :

            <div className="space-y-2 p-3 rounded-md border border-border/50 bg-background/80" onClick={(e) => e.stopPropagation()}>
                  <Textarea placeholder="Reason for rejection..." value={rejectReasonInput} onChange={(e) => setRejectReasonInput(e.target.value)} className="min-h-[60px] resize-none text-sm bg-background" autoFocus />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => {setShowRejectForm(false);setRejectReasonInput("");}} className="flex-1 h-8 text-xs shadow-none">Cancel</Button>
                    <Button size="sm" onClick={handleRejectClick} disabled={!rejectReasonInput.trim()} className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white shadow-none">Reject</Button>
                  </div>
                </div>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

};

// State tracking
interface AdjustmentState {status: AdjustmentItemStatus;rejectionReason?: string;}

export const F1v4_SubmissionsView: React.FC<F1v4_SubmissionsViewProps> = ({
  submissions,
  onContinue,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<WorkerSubmission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [adjustmentStates, setAdjustmentStates] = useState<Record<string, AdjustmentState>>({});
  const [leaveStates, setLeaveStates] = useState<Record<string, AdjustmentState>>({});
  const [adminAdjustments, setAdminAdjustments] = useState<Record<string, AdminAddedAdjustment[]>>({});
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [showMarkAsReadyDialog, setShowMarkAsReadyDialog] = useState(false);
  const [showExcludeDialog, setShowExcludeDialog] = useState(false);
  const [showReceiptView, setShowReceiptView] = useState(false);
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  const [newlyAddedSection, setNewlyAddedSection] = useState<'earnings' | 'overtime' | 'leave' | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  // Finalized workers - once finalized, their items are locked
  const [finalizedWorkers, setFinalizedWorkers] = useState<Set<string>>(new Set());
  // Status change decisions (Flag 1) - keyed by worker submission id
  const [statusDecisions, setStatusDecisions] = useState<Record<string, StatusDecision>>({});

  const handleAdminAddAdjustment = (submissionId: string, adjustment: AdminAddedAdjustment) => {
    setAdminAdjustments((prev) => ({ ...prev, [submissionId]: [...(prev[submissionId] || []), adjustment] }));
    setIsAddingAdjustment(false);
    toast.success(`${adjustment.type === 'expense' ? 'Expense' : adjustment.type === 'overtime' ? 'Overtime' : 'Unpaid leave'} added`);
    const section = adjustment.type === 'expense' ? 'earnings' : adjustment.type === 'overtime' ? 'overtime' : 'leave';
    setNewlyAddedSection(section);
    setNewlyAddedId(adjustment.id);
    setTimeout(() => {setNewlyAddedId(null);setNewlyAddedSection(null);}, 2000);
  };

  const handleRemoveAdminAdjustment = (submissionId: string, adjustmentId: string) => {
    setAdminAdjustments((prev) => ({ ...prev, [submissionId]: (prev[submissionId] || []).filter((a) => a.id !== adjustmentId) }));
    toast.info("Adjustment removed");
  };

  // Dynamic pending count
  const dynamicPendingCount = useMemo(() => {
    return submissions.reduce((count, submission) => {
      if (submission.status === "expired") return count;
      const pendingAdjustments = submission.submissions.filter((adj, idx) => {
        const key = `${submission.id}-${idx}`;
        const localState = adjustmentStates[key];
        const effectiveStatus = localState?.status || adj.status || 'pending';
        return effectiveStatus === 'pending' && typeof adj.amount === 'number';
      }).length;
      const rejectedAdjustments = submission.submissions.filter((adj, idx) => {
        const key = `${submission.id}-${idx}`;
        const localState = adjustmentStates[key];
        const effectiveStatus = localState?.status || adj.status || 'pending';
        return effectiveStatus === 'rejected' && typeof adj.amount === 'number';
      }).length;
      const pendingLeaves = (submission.pendingLeaves || []).filter((leave) => {
        const key = `${submission.id}-leave-${leave.id}`;
        const localState = leaveStates[key];
        const effectiveStatus = localState?.status || leave.status || 'pending';
        return effectiveStatus === 'pending';
      }).length;
      const rejectedLeaves = (submission.pendingLeaves || []).filter((leave) => {
        const key = `${submission.id}-leave-${leave.id}`;
        const localState = leaveStates[key];
        const effectiveStatus = localState?.status || leave.status || 'pending';
        return effectiveStatus === 'rejected';
      }).length;
      return count + (pendingAdjustments + pendingLeaves + rejectedAdjustments + rejectedLeaves > 0 ? 1 : 0);
    }, 0);
  }, [submissions, adjustmentStates, leaveStates]);

  const expiredCount = submissions.filter((s) => s.status === "expired").length;
  const readyCount = finalizedWorkers.size + expiredCount;
  const canContinue = readyCount >= submissions.length && submissions.length > 0;

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter((s) => s.workerName.toLowerCase().includes(query) || s.workerCountry.toLowerCase().includes(query));
  }, [submissions, searchQuery]);

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const formatCurrency = (amount: number, currency: string = "USD") => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const getAdjustmentStatus = (submissionId: string, adjIndex: number, originalStatus?: AdjustmentItemStatus): AdjustmentState => {
    const key = `${submissionId}-${adjIndex}`;
    return adjustmentStates[key] || { status: originalStatus || 'pending' };
  };

  const updateAdjustmentStatus = (submissionId: string, adjIndex: number, newState: AdjustmentState) => {
    const key = `${submissionId}-${adjIndex}`;
    setAdjustmentStates((prev) => ({ ...prev, [key]: newState }));
  };

  const getLeaveStatus = (submissionId: string, leaveId: string, originalStatus?: AdjustmentItemStatus): AdjustmentState => {
    const key = `${submissionId}-leave-${leaveId}`;
    return leaveStates[key] || { status: originalStatus || 'pending' };
  };

  const updateLeaveStatus = (submissionId: string, leaveId: string, newState: AdjustmentState) => {
    const key = `${submissionId}-leave-${leaveId}`;
    setLeaveStates((prev) => ({ ...prev, [key]: newState }));
  };

  const handleRowClick = (submission: WorkerSubmission) => {
    setSelectedSubmission(submission);
    setDrawerOpen(true);
    setExpandedItemId(null);
  };

  // Bulk actions
  const handleBulkApprove = () => {
    if (!selectedSubmission) return;
    selectedSubmission.submissions.forEach((adj, idx) => {
      const currentState = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
      if (currentState.status === 'pending') updateAdjustmentStatus(selectedSubmission.id, idx, { status: 'approved' });
    });
    (selectedSubmission.pendingLeaves || []).forEach((leave) => {
      const currentState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
      if (currentState.status === 'pending') updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'approved' });
    });
    toast.success(`Approved all pending items for ${selectedSubmission.workerName}`);
  };

  const handleBulkReject = (reason: string) => {
    if (!selectedSubmission) return;
    selectedSubmission.submissions.forEach((adj, idx) => {
      const currentState = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus);
      if (currentState.status === 'pending') updateAdjustmentStatus(selectedSubmission.id, idx, { status: 'rejected', rejectionReason: reason });
    });
    (selectedSubmission.pendingLeaves || []).forEach((leave) => {
      const currentState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
      if (currentState.status === 'pending') updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'rejected', rejectionReason: reason });
    });
    toast.info(`Rejected all pending items for ${selectedSubmission.workerName}`);
  };

  // Undo adjustment status (revert to pending)
  const undoAdjustmentStatus = (submissionId: string, adjIndex: number) => {
    const key = `${submissionId}-${adjIndex}`;
    setAdjustmentStates((prev) => ({ ...prev, [key]: { status: 'pending' } }));
    toast.info('Action undone');
  };

  // Undo leave status (revert to pending)
  const undoLeaveStatus = (submissionId: string, leaveId: string) => {
    const key = `${submissionId}-leave-${leaveId}`;
    setLeaveStates((prev) => ({ ...prev, [key]: { status: 'pending' } }));
    toast.info('Action undone');
  };

  // Mark worker as ready (finalize all reviews)
  const handleMarkAsReady = () => {
    if (!selectedSubmission) return;
    setFinalizedWorkers((prev) => new Set(prev).add(selectedSubmission.id));
    setDrawerOpen(false);
    toast.success(`${selectedSubmission.workerName} marked as ready`);
  };

  // Check if current worker is finalized
  const isWorkerFinalized = (workerId: string) => finalizedWorkers.has(workerId);

  const renderSubmissionRow = (submission: WorkerSubmission) => {
    const TypeIcon = submission.workerType === "employee" ? Users : Briefcase;

    const pendingAdjustmentCount = submission.submissions.filter((adj, idx) => {
      const key = `${submission.id}-${idx}`;
      const localState = adjustmentStates[key];
      const effectiveStatus = localState?.status || adj.status || 'pending';
      return effectiveStatus === 'pending' && typeof adj.amount === 'number';
    }).length;

    const rejectedAdjustmentCount = submission.submissions.filter((adj, idx) => {
      const key = `${submission.id}-${idx}`;
      const localState = adjustmentStates[key];
      const effectiveStatus = localState?.status || adj.status || 'pending';
      return effectiveStatus === 'rejected' && typeof adj.amount === 'number';
    }).length;

    const pendingLeaveCount = (submission.pendingLeaves || []).filter((leave) => {
      const leaveState = getLeaveStatus(submission.id, leave.id, leave.status);
      return leaveState.status === 'pending';
    }).length;

    const rejectedLeaveCount = (submission.pendingLeaves || []).filter((leave) => {
      const leaveState = getLeaveStatus(submission.id, leave.id, leave.status);
      return leaveState.status === 'rejected';
    }).length;

    const workerPendingCount = pendingAdjustmentCount + pendingLeaveCount;
    const workerRejectedCount = rejectedAdjustmentCount + rejectedLeaveCount;

    // Check if worker is finalized
    const isFinalized = isWorkerFinalized(submission.id);

    const isExpired = submission.status === "expired";
    const isExcluded = statusDecisions[submission.id] === "exclude";
    let effectiveWorkerStatus: SubmissionStatus;
    if (isExpired) {
      effectiveWorkerStatus = "expired";
    } else if (isExcluded) {
      effectiveWorkerStatus = "ready";
    } else if (isFinalized) {
      effectiveWorkerStatus = "ready";
    } else if (workerPendingCount > 0) {
      effectiveWorkerStatus = "pending";
    } else {
      effectiveWorkerStatus = "reviewed";
    }
    const status = isExpired ? statusConfig["expired"] : isExcluded ? { label: "Excluded", color: "text-muted-foreground", icon: X } : statusConfig[effectiveWorkerStatus];
    const StatusIcon = status.icon;

    return (
      <motion.div
        key={submission.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group", isExcluded && "opacity-50")}
        onClick={() => handleRowClick(submission)}>

        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">{getInitials(submission.workerName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium text-foreground truncate", isExcluded && "line-through")}>{submission.workerName}</span>
            <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground leading-tight">{countryFlags[submission.workerCountry] || ""} {submission.workerCountry}</span>
            {isExpired && (() => {
              const expiredCount = submission.expiredAdjustments?.length || 0;
              const expiredTotal = submission.expiredAdjustments?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
              return (
                <span className="text-[10px] text-muted-foreground/70">
                  · Base pay: Included{expiredCount > 0 && ` · ${expiredCount} adjustment${expiredCount !== 1 ? 's' : ''} expired`}
                </span>
              );
            })()
            }
            {!isExpired && workerRejectedCount > 0 && workerPendingCount === 0 &&
            <span className="text-[10px] text-destructive/80">· 1 day to resubmit</span>
            }
            {!isFinalized && submission.flags?.map((flag, fi) =>
            <Badge key={fi} variant="outline" className={cn(
              "text-[9px] px-1.5 py-0 h-4 pointer-events-none font-medium",
              flag.type === "end_date" ?
              "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
              "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
            )}>
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                {flag.type === "end_date" ?
              flag.endReason === "Termination" ? "Terminated" : flag.endReason === "Resignation" ? "Resigned" : "Contract ended" :
              "Pay change"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {submission.totalImpact ?
          <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(submission.totalImpact, submission.currency)}</p> :

          <p className="text-xs text-muted-foreground">—</p>
          }

          {/* Status with pending count, reviewed indicator, or ready */}
          <div className={cn("flex items-center gap-1.5 text-xs", status.color)}>
            {workerPendingCount > 0 ?
            <>
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-orange-500/15 text-orange-600 text-[10px] font-semibold">{workerPendingCount}</span>
                <span className="hidden sm:inline">{status.label}</span>
              </> :
            effectiveWorkerStatus === 'reviewed' ?
            <>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{status.label}</span>
                {workerRejectedCount > 0 &&
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-destructive/15 text-destructive text-[10px] font-semibold ml-0.5">{workerRejectedCount}</span>
              }
              </> :

            <>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{status.label}</span>
              </>
            }
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </motion.div>);

  };

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onClose &&
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1">

                  <ChevronLeft className="h-4 w-4" />
                </Button>
              }
              <F1v4_PayrollStepper
                currentStep="submissions"
                completedSteps={[]}
                pendingCount={dynamicPendingCount} />

            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button size="sm" onClick={onContinue} disabled={!canContinue} className="h-9 text-xs">
                      Continue to Approve
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canContinue &&
                <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Mark all {submissions.length - readyCount} remaining worker{submissions.length - readyCount !== 1 ? 's' : ''} as ready before continuing</p>
                  </TooltipContent>
                }
              </Tooltip>
              {onClose &&
              <Button size="sm" variant="secondary" onClick={onClose} className="h-9 text-xs">Close</Button>
              }
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-5 pt-4 pb-3 border-b border-border/40 flex items-center justify-between">
              <TabsList className="h-8 bg-muted/30 p-0.5">
                <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background">All ({submissions.length})</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs h-7 px-3 data-[state=active]:bg-background">Pending ({dynamicPendingCount})</TabsTrigger>
                <TabsTrigger value="ready" className="text-xs h-7 px-3 data-[state=active]:bg-background">Ready ({readyCount})</TabsTrigger>
              </TabsList>
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-background/50 border-border/30" />
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-4 space-y-1.5">
              <TabsContent value="all" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">{filteredSubmissions.map((s) => renderSubmissionRow(s))}</AnimatePresence>
              </TabsContent>
              <TabsContent value="pending" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">{filteredSubmissions.filter((s) => {
                    const pendingAdj = s.submissions.filter((adj, idx) => {
                      const key = `${s.id}-${idx}`;
                      const localState = adjustmentStates[key];
                      return (localState?.status || adj.status || 'pending') !== 'approved';
                    }).length;
                    const pendingLeave = (s.pendingLeaves || []).filter((l) => {
                      const key = `${s.id}-leave-${l.id}`;
                      const localState = leaveStates[key];
                      return (localState?.status || l.status || 'pending') !== 'approved';
                    }).length;
                    return pendingAdj > 0 || pendingLeave > 0;
                  }).map((s) => renderSubmissionRow(s))}</AnimatePresence>
              </TabsContent>
              <TabsContent value="ready" className="mt-0 space-y-1.5">
                <AnimatePresence mode="popLayout">{filteredSubmissions.filter((s) => {
                    const pendingAdj = s.submissions.filter((adj, idx) => {
                      const key = `${s.id}-${idx}`;
                      const localState = adjustmentStates[key];
                      return (localState?.status || adj.status || 'pending') !== 'approved';
                    }).length;
                    const pendingLeave = (s.pendingLeaves || []).filter((l) => {
                      const key = `${s.id}-leave-${l.id}`;
                      const localState = leaveStates[key];
                      return (localState?.status || l.status || 'pending') !== 'approved';
                    }).length;
                    return pendingAdj === 0 && pendingLeave === 0;
                  }).map((s) => renderSubmissionRow(s))}</AnimatePresence>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Drawer - matching CA3 exactly */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] overflow-y-auto p-0" hideClose={isAddingAdjustment}>
          {selectedSubmission && (() => {
            const earnings = selectedSubmission.lineItems?.filter((item) => item.type === 'Earnings') || [];
            const deductions = selectedSubmission.lineItems?.filter((item) => item.type === 'Deduction') || [];
            const allAdjustments = selectedSubmission.submissions;
            const currency = selectedSubmission.currency || 'USD';
            const moneyAdjustments = allAdjustments.map((adj, idx) => ({ adj, originalIdx: idx })).filter(({ adj }) => typeof adj.amount === 'number');
            const pendingLeaves = selectedSubmission.pendingLeaves || [];

            const getEffectiveStatus = (originalIdx: number, originalStatus?: AdjustmentItemStatus): AdjustmentItemStatus => {
              return getAdjustmentStatus(selectedSubmission.id, originalIdx, originalStatus).status;
            };

            const pendingAdjustmentCount = moneyAdjustments.filter(({ adj, originalIdx }) => getEffectiveStatus(originalIdx, adj.status as AdjustmentItemStatus) === 'pending').length;
            const pendingLeaveCount = pendingLeaves.filter((l) => getLeaveStatus(selectedSubmission.id, l.id, l.status).status === 'pending').length;
            const currentPendingCount = pendingAdjustmentCount + pendingLeaveCount;

            const approvedAdjustmentTotal = moneyAdjustments.reduce((sum, { adj, originalIdx }) => {
              return getEffectiveStatus(originalIdx, adj.status as AdjustmentItemStatus) === 'approved' ? sum + (adj.amount || 0) : sum;
            }, 0);

            const approvedLeaveDeduction = pendingLeaves.reduce((sum, leave) => {
              const leaveState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
              if (leaveState.status === 'approved' && leaveTypeConfig[leave.leaveType]?.affectsPay && leave.dailyRate) {
                return sum + leave.daysInThisPeriod * leave.dailyRate;
              }
              return sum;
            }, 0);

            const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
            const totalDeductions = Math.abs(deductions.reduce((sum, item) => sum + item.amount, 0));
            const workerAdminAdjustments = adminAdjustments[selectedSubmission.id] || [];
            const adminExpenseTotal = workerAdminAdjustments.filter((a) => a.type === 'expense').reduce((sum, a) => sum + (a.amount || 0), 0);
            const adminOvertimeTotal = workerAdminAdjustments.filter((a) => a.type === 'overtime').reduce((sum, a) => sum + (a.amount || 0), 0);
            const adminUnpaidLeaveTotal = workerAdminAdjustments.filter((a) => a.type === 'unpaid_leave').reduce((sum, a) => sum + (a.amount || 0), 0);
            const adminAdditionsTotal = adminExpenseTotal + adminOvertimeTotal;
            const adminDeductionsTotal = adminUnpaidLeaveTotal;
            const baseNet = selectedSubmission.estimatedNet || selectedSubmission.basePay || 0;
            const adjustedNet = baseNet + approvedAdjustmentTotal + adminAdditionsTotal - approvedLeaveDeduction - adminDeductionsTotal;
            const hasAdminAdjustments = workerAdminAdjustments.length > 0;

            const shouldShowItem = (status: AdjustmentItemStatus) => !showPendingOnly || status === 'pending';

            const earningAdjCounts = (() => {
              const filtered = allAdjustments.map((adj, idx) => ({ adj, idx })).filter(({ adj }) => adj.type === 'expenses' || adj.type === 'bonus');
              let pending = 0,approved = 0;
              filtered.forEach(({ adj, idx }) => {
                const status = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus).status;
                if (status === 'pending') pending++;else
                if (status === 'approved') approved++;
              });
              return { pending, approved, total: filtered.length };
            })();

            const overtimeCounts = (() => {
              const filtered = allAdjustments.map((adj, idx) => ({ adj, idx })).filter(({ adj }) => adj.type === 'overtime');
              let pending = 0,approved = 0;
              filtered.forEach(({ adj, idx }) => {
                const status = getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus).status;
                if (status === 'pending') pending++;else
                if (status === 'approved') approved++;
              });
              return { pending, approved, total: filtered.length };
            })();

            const leaveCounts = {
              pending: pendingLeaveCount,
              approved: pendingLeaves.filter((l) => getLeaveStatus(selectedSubmission.id, l.id, l.status).status === 'approved').length,
              total: pendingLeaves.length
            };

            return (
              <>
                {isAddingAdjustment ?
                <CA3_AdminAddAdjustment
                  workerType={selectedSubmission.workerType}
                  workerName={selectedSubmission.workerName}
                  currency={currency}
                  dailyRate={selectedSubmission.basePay ? selectedSubmission.basePay / 22 : 100}
                  hourlyRate={selectedSubmission.basePay ? selectedSubmission.basePay / 176 : 15}
                  isOpen={isAddingAdjustment}
                  onOpenChange={setIsAddingAdjustment}
                  onAddAdjustment={(adjustment) => handleAdminAddAdjustment(selectedSubmission.id, adjustment)} /> :


                <>
                    <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/20">
                      <SheetDescription className="sr-only">Pay breakdown details</SheetDescription>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{getInitials(selectedSubmission.workerName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <SheetTitle className="text-sm font-semibold text-foreground leading-tight">{selectedSubmission.workerName}</SheetTitle>
                            {!showPendingOnly && selectedSubmission.status !== "expired" &&
                          <button onClick={() => setIsAddingAdjustment(true)} className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50 rounded-full hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors">
                                <Plus className="h-2.5 w-2.5" /><span>Add</span>
                              </button>
                          }
                            {currentPendingCount > 0 &&
                          <Tooltip>
                                <TooltipTrigger asChild>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <Switch checked={showPendingOnly} onCheckedChange={setShowPendingOnly} className="h-3 w-6 data-[state=checked]:bg-primary [&>span]:h-2 [&>span]:w-2 [&>span]:data-[state=checked]:translate-x-3" />
                                    <span className="text-[10px] text-muted-foreground">Pending</span>
                                  </label>
                                </TooltipTrigger>
                                <TooltipContent side="bottom"><p className="text-xs">Show only pending items</p></TooltipContent>
                              </Tooltip>
                          }
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[11px] text-muted-foreground/70">{selectedSubmission.workerCountry} · {selectedSubmission.periodLabel || "Jan 1 – Jan 31"}</p>
                            {(() => {
                            const endFlag = selectedSubmission.flags?.find((f) => f.type === "end_date");
                            if (!endFlag) return null;
                            const label = endFlag.endReason === "Termination" ? "Terminated" : endFlag.endReason === "Resignation" ? "Resigned" : "Contract ended";
                            return (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 pointer-events-none font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                  {label}
                                </Badge>);

                          })()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/20">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium">{selectedSubmission.workerType === "employee" ? "Estimated net" : "Invoice total"}</p>
                            <button onClick={() => setShowReceiptView(true)} className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors mt-0.5">View receipt →</button>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(adjustedNet, currency)}</p>
                            {(approvedAdjustmentTotal !== 0 || approvedLeaveDeduction !== 0 || hasAdminAdjustments) &&
                          <p className="text-[10px] text-muted-foreground/60 tabular-nums">was {formatCurrency(baseNet, currency)}</p>
                          }
                          </div>
                        </div>
                      </div>
                    </SheetHeader>

                    {/* Expired adjustments info banner */}
                    {selectedSubmission.status === "expired" &&
                  <div className="mx-5 mt-4 rounded-xl border border-border/30 bg-muted/10 px-5 py-4">
                        <p className="text-[15px] font-medium text-muted-foreground/80">Adjustments expired (not approved by cutoff)</p>
                        <p className="text-[13px] text-muted-foreground/60 mt-1 leading-relaxed">
                          Base pay will be processed this period. Unapproved adjustments were not included because they missed the cutoff.
                        </p>
                      </div>
                  }

                    {/* Carry-over note */}
                    {selectedSubmission.carryOverFrom &&
                  <div className="mx-5 mt-3 rounded-lg border border-border/30 bg-primary/[0.03] px-3.5 py-2.5">
                        <p className="text-[11px] text-muted-foreground">
                          Includes carry-over from previous payroll ({selectedSubmission.carryOverFrom.period}).
                        </p>
                      </div>
                  }

                    {/* Excluded state toggle */}
                    {statusDecisions[selectedSubmission.id] === "exclude" &&
                  <div className="px-5 py-2.5 border-b border-border/20">
                        <div
                      className="group/toggle inline-flex cursor-pointer relative"
                      onClick={() => {
                        setStatusDecisions((prev) => {
                          const next = { ...prev };
                          delete next[selectedSubmission.id];
                          return next;
                        });
                        setFinalizedWorkers((prev) => {const next = new Set(prev);next.delete(selectedSubmission.id);return next;});
                        toast.info(`${selectedSubmission.workerName} re-included in this run`);
                      }}>

                          <Badge variant="outline" className="gap-1.5 text-xs transition-opacity group-hover/toggle:opacity-0 border-muted-foreground/20 bg-muted/30 text-muted-foreground">
                            <X className="h-3 w-3" />
                            Excluded from this run
                          </Badge>
                          <Badge variant="outline" className="gap-1.5 text-xs absolute inset-0 opacity-0 group-hover/toggle:opacity-100 transition-opacity border-primary/30 bg-primary/5 text-primary cursor-pointer">
                            Undo exclusion
                          </Badge>
                        </div>
                      </div>
                  }

                    {/* Expired worker: show base pay + expired adjustments breakdown */}
                    {selectedSubmission.status === "expired" && (
                    <div className="px-5 py-4 space-y-0.5" onClick={() => setExpandedItemId(null)}>
                      {/* Base Pay Section - Included */}
                      <CollapsibleSection title="Base Pay (Included in this batch)" defaultOpen={true} approvedCount={earnings.length}>
                        {earnings.map((item, idx) =>
                          <BreakdownRow key={idx} label={item.label} amount={item.amount} currency={currency} isLocked={item.locked} isPositive />
                        )}
                        {deductions.length > 0 && deductions.map((item, idx) =>
                          <BreakdownRow key={`ded-${idx}`} label={item.label} amount={Math.abs(item.amount)} currency={currency} isLocked={item.locked} isPositive={false} />
                        )}
                        <BreakdownRow label="Included in this batch" amount={selectedSubmission.estimatedNet || selectedSubmission.basePay || 0} currency={currency} isPositive isTotal />
                      </CollapsibleSection>

                      {/* Expired Adjustments Section */}
                      {(selectedSubmission.expiredAdjustments?.length || 0) > 0 && (
                        <CollapsibleSection title="Adjustments (Expired for this period)" defaultOpen={true} approvedCount={0}>
                          {selectedSubmission.expiredAdjustments?.map((adj, idx) => {
                            const config = submissionTypeConfig[adj.type as SubmissionType];
                            return (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-between py-2 opacity-60">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <span className="text-sm text-muted-foreground">{adj.description || config?.label || 'Adjustment'}</span>
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-medium bg-muted/50 text-muted-foreground border-border/40">
                                        Expired
                                      </Badge>
                                    </div>
                                    <span className="text-sm tabular-nums font-mono text-muted-foreground/60 line-through ml-3">
                                      +{formatCurrency(adj.amount || 0, currency)}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[220px]">
                                  <p className="text-xs">Missed approval cutoff. Not included in this payroll.</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                          <div className="flex items-center justify-between py-2 pt-3 mt-1 border-t border-dashed border-border/50">
                            <span className="text-sm font-medium text-muted-foreground">Not included</span>
                            <span className="text-sm tabular-nums font-mono text-muted-foreground/60 line-through">
                              +{formatCurrency(selectedSubmission.expiredAdjustments?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0, currency)}
                            </span>
                          </div>
                        </CollapsibleSection>
                      )}
                    </div>
                    )}

                    {selectedSubmission.status !== "expired" && (
                    <div className={cn("px-5 py-4 space-y-0.5", statusDecisions[selectedSubmission.id] === "exclude" && "opacity-40 pointer-events-none line-through")} onClick={() => setExpandedItemId(null)}>
                           <>
                      {/* EARNINGS Section */}
                      {(() => {
                        const payChangeFlag = selectedSubmission.flags?.find((f) => f.type === "pay_change");
                        return !showPendingOnly || earningAdjCounts.pending > 0 ?
                        <CollapsibleSection title="Earnings" defaultOpen={!!payChangeFlag} forceOpen={showPendingOnly ? earningAdjCounts.pending > 0 : newlyAddedSection === 'earnings' || !!payChangeFlag} pendingCount={earningAdjCounts.pending} approvedCount={earnings.length + earningAdjCounts.approved}>
                          {!showPendingOnly && earnings.map((item, idx) =>
                          <BreakdownRow key={idx} label={item.label} amount={item.amount} currency={currency} isLocked={item.locked} isPositive />
                          )}
                          {/* Carry-over adjustment from expired previous period */}
                          {!showPendingOnly && selectedSubmission.carryOverFrom &&
                          <div className="flex items-center justify-between py-2 -mx-3 px-3 rounded bg-primary/[0.04] border border-primary/10">
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-foreground">Carry-over adjustment</span>
                                <span className="text-[10px] text-muted-foreground/70">From {selectedSubmission.carryOverFrom.period}{selectedSubmission.carryOverFrom.invoiceNumber ? ` · ${selectedSubmission.carryOverFrom.invoiceNumber}` : ''}</span>
                              </div>
                              <span className="text-sm tabular-nums font-mono text-foreground">+{formatCurrency(selectedSubmission.carryOverFrom.amount, currency)}</span>
                            </div>
                          }
                          {allAdjustments.map((adj, originalIdx) => ({ adj, originalIdx })).filter(({ adj }) => adj.type === 'expenses' || adj.type === 'bonus').filter(({ adj, originalIdx }) => shouldShowItem(getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus).status)).map(({ adj, originalIdx }) => {
                            const adjState = getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus);
                            const itemId = `adj-${originalIdx}`;
                            const workerIsFinalized = isWorkerFinalized(selectedSubmission.id);
                            return (
                              <AdjustmentRow key={itemId} label={adj.description || submissionTypeConfig[adj.type]?.label || 'Adjustment'} amount={adj.amount || 0} currency={currency} status={adjState.status} rejectionReason={adjState.rejectionReason || adj.rejectionReason} isExpanded={expandedItemId === itemId} onToggleExpand={() => setExpandedItemId(expandedItemId === itemId ? null : itemId)} onApprove={() => {updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'approved' });toast.success('Approved');}} onReject={(reason) => {updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'rejected', rejectionReason: reason });toast.info('Rejected');}} onUndo={() => undoAdjustmentStatus(selectedSubmission.id, originalIdx)} isFinalized={workerIsFinalized} />);
                          })}
                          {/* Admin-added expenses */}
                          {!showPendingOnly && workerAdminAdjustments.filter((a) => a.type === 'expense').map((adj) =>
                          <motion.div key={adj.id} initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }} className={cn("rounded transition-all duration-500 group", newlyAddedId === adj.id ? "bg-primary/5 ring-1 ring-primary/20" : "-mx-3 px-3 hover:bg-muted/50")}>
                              <div className="flex items-center justify-between py-2">
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-sm text-foreground">{adj.description}</span>
                                  <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm tabular-nums font-mono text-foreground text-right transition-all group-hover:mr-1">+{formatCurrency(adj.amount || 0, currency)}</span>
                                  <button onClick={(e) => {e.stopPropagation();handleRemoveAdminAdjustment(selectedSubmission.id, adj.id);}} className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150">
                                    <X className="h-3.5 w-3.5 text-destructive" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          <BreakdownRow label="Total earnings" amount={totalEarnings + approvedAdjustmentTotal + adminExpenseTotal} currency={currency} isPositive isTotal />
                          {payChangeFlag && !showPendingOnly &&
                          <p className="text-[10px] text-muted-foreground/60 text-right tabular-nums">
                              {(payChangeFlag.payChangePercent || 0) > 0 ? "Up" : "Down"} {Math.abs(payChangeFlag.payChangePercent || 0)}% vs last period{payChangeFlag.payChangeDelta != null && ` (${(payChangeFlag.payChangeDelta || 0) >= 0 ? "+" : "−"}${formatCurrency(Math.abs(payChangeFlag.payChangeDelta || 0), currency)})`}
                            </p>
                          }
                        </CollapsibleSection> :
                        null;
                      })()}

                      {/* DEDUCTIONS Section */}
                      {deductions.length > 0 && !showPendingOnly &&
                      <CollapsibleSection title="Deductions" defaultOpen={false} approvedCount={deductions.length}>
                          {deductions.map((item, idx) =>
                        <BreakdownRow key={idx} label={item.label} amount={Math.abs(item.amount)} currency={currency} isLocked={item.locked} isPositive={false} />
                        )}
                          <BreakdownRow label="Total deductions" amount={totalDeductions} currency={currency} isPositive={false} isTotal />
                        </CollapsibleSection>
                      }

                      {/* OVERTIME Section */}
                      {(overtimeCounts.total > 0 || workerAdminAdjustments.some((a) => a.type === 'overtime')) && (!showPendingOnly || overtimeCounts.pending > 0) &&
                      <CollapsibleSection title="Overtime" defaultOpen={false} forceOpen={showPendingOnly ? overtimeCounts.pending > 0 : newlyAddedSection === 'overtime'} pendingCount={overtimeCounts.pending} approvedCount={overtimeCounts.approved + workerAdminAdjustments.filter((a) => a.type === 'overtime').length}>
                          {allAdjustments.map((adj, originalIdx) => ({ adj, originalIdx })).filter(({ adj }) => adj.type === 'overtime').filter(({ adj, originalIdx }) => shouldShowItem(getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus).status)).map(({ adj, originalIdx }) => {
                          const adjState = getAdjustmentStatus(selectedSubmission.id, originalIdx, adj.status as AdjustmentItemStatus);
                          const itemId = `overtime-${originalIdx}`;
                          const workerIsFinalized = isWorkerFinalized(selectedSubmission.id);
                          return (
                            <AdjustmentRow key={itemId} label={`${adj.hours || 0}h logged`} amount={adj.amount || 0} currency={currency} status={adjState.status} rejectionReason={adjState.rejectionReason || adj.rejectionReason} isExpanded={expandedItemId === itemId} onToggleExpand={() => setExpandedItemId(expandedItemId === itemId ? null : itemId)} onApprove={() => {updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'approved' });toast.success('Approved overtime');}} onReject={(reason) => {updateAdjustmentStatus(selectedSubmission.id, originalIdx, { status: 'rejected', rejectionReason: reason });toast.info('Rejected overtime');}} onUndo={() => undoAdjustmentStatus(selectedSubmission.id, originalIdx)} isFinalized={workerIsFinalized} />);
                        })}
                          {/* Admin-added overtime */}
                          {!showPendingOnly && workerAdminAdjustments.filter((a) => a.type === 'overtime').map((adj) =>
                        <motion.div key={adj.id} initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }} className={cn("rounded transition-all duration-500 group", newlyAddedId === adj.id ? "bg-primary/5 ring-1 ring-primary/20" : "-mx-3 px-3 hover:bg-muted/50")}>
                              <div className="flex items-center justify-between py-2">
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-sm text-foreground">{adj.description || `${adj.hours}h overtime`}</span>
                                  <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm tabular-nums font-mono text-foreground text-right transition-all group-hover:mr-1">+{formatCurrency(adj.amount || 0, currency)}</span>
                                  <button onClick={(e) => {e.stopPropagation();handleRemoveAdminAdjustment(selectedSubmission.id, adj.id);}} className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150">
                                    <X className="h-3.5 w-3.5 text-destructive" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                        )}
                        </CollapsibleSection>
                      }

                      {/* LEAVE Section */}
                      {(pendingLeaves.length > 0 || workerAdminAdjustments.some((a) => a.type === 'unpaid_leave')) && (!showPendingOnly || leaveCounts.pending > 0) &&
                      <CollapsibleSection title="Leave" defaultOpen={false} forceOpen={showPendingOnly ? leaveCounts.pending > 0 : newlyAddedSection === 'leave'} pendingCount={leaveCounts.pending} approvedCount={leaveCounts.approved + workerAdminAdjustments.filter((a) => a.type === 'unpaid_leave').length}>
                          {pendingLeaves.filter((leave) => shouldShowItem(getLeaveStatus(selectedSubmission.id, leave.id, leave.status).status)).map((leave) => {
                          const leaveState = getLeaveStatus(selectedSubmission.id, leave.id, leave.status);
                          const itemId = `leave-${leave.id}`;
                          const workerIsFinalized = isWorkerFinalized(selectedSubmission.id);
                          return (
                            <LeaveRow key={itemId} leave={{ ...leave, status: leaveState.status, rejectionReason: leaveState.rejectionReason || leave.rejectionReason }} currency={currency} isExpanded={expandedItemId === itemId} onToggleExpand={() => setExpandedItemId(expandedItemId === itemId ? null : itemId)} onApprove={() => {updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'approved' });toast.success('Approved leave');}} onReject={(reason) => {updateLeaveStatus(selectedSubmission.id, leave.id, { status: 'rejected', rejectionReason: reason });toast.info('Rejected leave');}} onUndo={() => undoLeaveStatus(selectedSubmission.id, leave.id)} isFinalized={workerIsFinalized} />);
                        })}
                          {/* Admin-added unpaid leave */}
                          {!showPendingOnly && workerAdminAdjustments.filter((a) => a.type === 'unpaid_leave').map((adj) =>
                        <motion.div key={adj.id} initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }} className={cn("rounded transition-all duration-500 group", newlyAddedId === adj.id ? "bg-primary/5 ring-1 ring-primary/20" : "-mx-3 px-3 hover:bg-muted/50")}>
                              <div className="flex items-center justify-between py-2">
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-sm text-foreground">{adj.description || `${adj.days}d unpaid leave`}</span>
                                  <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm tabular-nums font-mono text-muted-foreground text-right transition-all group-hover:mr-1">−{formatCurrency(adj.amount || 0, currency)}</span>
                                  <button onClick={(e) => {e.stopPropagation();handleRemoveAdminAdjustment(selectedSubmission.id, adj.id);}} className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150">
                                    <X className="h-3.5 w-3.5 text-destructive" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                        )}
                        </CollapsibleSection>
                      }
                           </>

                    </div>
                    )}

                    {/* Footer */}
                    {!expandedItemId && (() => {
                    // Expired workers - read-only, no actions
                    if (selectedSubmission.status === "expired") {
                      return;








                    }

                    // Excluded workers - no footer needed, tag shows status
                    if (statusDecisions[selectedSubmission.id] === "exclude") return null;

                    const isFinalized = isWorkerFinalized(selectedSubmission.id);

                    // Show bulk actions when pending items exist
                    if (currentPendingCount > 0) {
                      return (
                        <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setShowBulkRejectDialog(true)}>
                                Reject all ({currentPendingCount})
                              </Button>
                              <Button size="sm" className="flex-1 h-9 text-xs" onClick={() => setShowBulkApproveDialog(true)}>
                                Approve all ({currentPendingCount})
                              </Button>
                            </div>
                          </div>);

                    }

                    // For flagged workers: show minimal status change action
                    const endDateFlag = selectedSubmission.flags?.find((f) => f.type === "end_date");
                    if (endDateFlag && !isFinalized) {
                      return (
                        <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4 space-y-3">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              <span className="font-medium text-foreground">{endDateFlag.endReason}</span> effective <span className="font-medium text-foreground">{endDateFlag.endDate}</span>
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-9 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setShowExcludeDialog(true)}>

                                Exclude this
                              </Button>
                              <Button
                              size="sm"
                              className="flex-1 h-9 text-xs gap-2"
                              onClick={() => setShowMarkAsReadyDialog(true)}>

                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark as ready
                              </Button>
                            </div>
                          </div>);

                    }

                    // Regular workers: Show "Mark as Ready" when no pending items and not yet finalized
                    if (!isFinalized) {
                      return (
                        <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4">
                            <Button size="sm" className="w-full h-10 text-sm gap-2" onClick={() => setShowMarkAsReadyDialog(true)}>
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as Ready
                            </Button>
                            <p className="text-[11px] text-muted-foreground text-center mt-2">
                              This will finalize the review and lock all decisions
                            </p>
                          </div>);

                    }

                    // Show finalized state
                    return (
                      <div className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-4">
                          <div className="flex items-center justify-center gap-2 text-accent-green-text">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">Ready for payroll</span>
                          </div>
                        </div>);

                  })()}
                  </>
                }

                <CA3_BulkApproveDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog} onConfirm={handleBulkApprove} pendingCount={currentPendingCount} />
                <CA3_BulkRejectDialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog} onConfirm={handleBulkReject} pendingCount={currentPendingCount} />
                
                {/* Mark as Ready dialog */}
                {selectedSubmission && (() => {
                  const approvedCount = selectedSubmission.submissions.filter((adj, idx) => getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus).status === 'approved' && typeof adj.amount === 'number').length + (selectedSubmission.pendingLeaves || []).filter((l) => getLeaveStatus(selectedSubmission.id, l.id, l.status).status === 'approved').length + (adminAdjustments[selectedSubmission.id] || []).length;
                  const rejectedCount = selectedSubmission.submissions.filter((adj, idx) => getAdjustmentStatus(selectedSubmission.id, idx, adj.status as AdjustmentItemStatus).status === 'rejected' && typeof adj.amount === 'number').length + (selectedSubmission.pendingLeaves || []).filter((l) => getLeaveStatus(selectedSubmission.id, l.id, l.status).status === 'rejected').length;
                  return (
                    <CA3_MarkAsReadyDialog open={showMarkAsReadyDialog} onOpenChange={setShowMarkAsReadyDialog} onConfirm={handleMarkAsReady} workerName={selectedSubmission.workerName} approvedCount={approvedCount} rejectedCount={rejectedCount} />);

                })()}

                {/* Exclude Worker dialog */}
                {selectedSubmission && (() => {
                  const endDateFlag = selectedSubmission.flags?.find((f) => f.type === "end_date");
                  return (
                    <CA3_ExcludeWorkerDialog
                      open={showExcludeDialog}
                      onOpenChange={setShowExcludeDialog}
                      onConfirm={() => {
                        setStatusDecisions((prev) => ({ ...prev, [selectedSubmission.id]: "exclude" }));
                        setFinalizedWorkers((prev) => new Set(prev).add(selectedSubmission.id));
                        toast.info(`${selectedSubmission.workerName} excluded from this run`);
                      }}
                      workerName={selectedSubmission.workerName}
                      endReason={endDateFlag?.endReason} />);


                })()}

                <AnimatePresence>
                  {showReceiptView &&
                  <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute inset-0 bg-background z-50 flex flex-col">
                      <div className="px-5 pt-5 pb-4 border-b border-border/30">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setShowReceiptView(false)} className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors">
                            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <div className="flex-1">
                            <h2 className="text-base font-semibold text-foreground">{selectedSubmission.workerType === "employee" ? "Payslip" : "Invoice"} Preview</h2>
                            <p className="text-xs text-muted-foreground">{selectedSubmission.periodLabel || "January 2026"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto px-5 py-4">
                        <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border/30">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">{getInitials(selectedSubmission.workerName)}</AvatarFallback></Avatar>
                            <div>
                              <p className="font-medium text-foreground">{selectedSubmission.workerName}</p>
                              <p className="text-xs text-muted-foreground">{selectedSubmission.workerCountry} · {selectedSubmission.workerType === "employee" ? "Employee" : "Contractor"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Earnings</h3>
                          <div className="space-y-1.5">
                            {earnings.map((item, idx) => <BreakdownRow key={idx} label={item.label} amount={item.amount} currency={currency} isPositive />)}
                            <BreakdownRow label="Total earnings" amount={totalEarnings + approvedAdjustmentTotal + adminAdditionsTotal} currency={currency} isPositive isTotal />
                          </div>
                        </div>
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deductions</h3>
                          <div className="space-y-1.5">
                            {deductions.map((item, idx) => <BreakdownRow key={idx} label={item.label} amount={Math.abs(item.amount)} currency={currency} isPositive={false} />)}
                            <BreakdownRow label="Total deductions" amount={totalDeductions + approvedLeaveDeduction + adminDeductionsTotal} currency={currency} isPositive={false} isTotal />
                          </div>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{selectedSubmission.workerType === "employee" ? "Net Pay" : "Invoice Total"}</span>
                            <span className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(adjustedNet, currency)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border/30 px-5 py-4">
                        <Button className="w-full gap-2"><Download className="h-4 w-4" />Download {selectedSubmission.workerType === "employee" ? "Payslip" : "Invoice"}</Button>
                      </div>
                    </motion.div>
                  }
                </AnimatePresence>
              </>);

          })()}
        </SheetContent>
      </Sheet>
    </>);

};

export default F1v4_SubmissionsView;