/**
 * Unified priority data model
 * Each priority is a complete actionable unit with its own context.
 */
import { Clock, AlertTriangle, FileSignature, DollarSign, Users, Shield, Ban, FileQuestion } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ActionDetail {
  id: string;
  title: string;
  client: string;
  affected?: number;
  deadline?: string;
  reason: string;
  cta: string;
}

export interface MetricSnapshot {
  label: string;
  value: string;
  trend?: string;
  positive?: boolean;
}

export interface InsightItem {
  text: string;
  category: "pattern" | "risk" | "optimization";
}

export interface PriorityItem {
  id: string;
  icon: LucideIcon;
  label: string;
  count: number;
  severity: "critical" | "warning" | "info";
  accentColor: string;
  tagline: string;
  actions: ActionDetail[];
  metrics: MetricSnapshot[];
  insight?: InsightItem;
}

export const PRIORITY_STREAM: PriorityItem[] = [
  {
    id: "approvals",
    icon: Clock,
    label: "Approvals blocking payroll",
    count: 4,
    severity: "critical",
    accentColor: "hsl(0, 72%, 51%)",
    tagline: "4 approvals are holding up payroll for 23 workers across 2 clients",
    actions: [
      { id: "a1", title: "Approve December payroll batch", client: "Acme Corp", affected: 12, deadline: "Due today", reason: "Payroll cutoff in 6 hours", cta: "Approve" },
      { id: "a2", title: "Review contractor agreement amendment", client: "Globex Inc", affected: 1, deadline: "Due today", reason: "Contract expires Friday", cta: "Review" },
      { id: "a7", title: "Approve onboarding documents", client: "Acme Corp", affected: 4, deadline: "Due tomorrow", reason: "Workers awaiting start date", cta: "Approve" },
      { id: "a9", title: "Sign off expenses report", client: "Globex Inc", affected: 6, deadline: "Due today", reason: "Month-end close", cta: "Approve" },
    ],
    metrics: [
      { label: "Workers affected", value: "23", trend: "Across 2 clients" },
      { label: "Hours to cutoff", value: "6h", trend: "Critical window", positive: false },
      { label: "Avg approval time", value: "1.2d", trend: "−0.3d this week", positive: true },
      { label: "Auto-approved", value: "67%", trend: "+12% vs last month", positive: true },
    ],
    insight: { text: "Acme Corp approvals consistently delay payroll by 2 days. Consider enabling auto-approval for batches under €10k.", category: "optimization" },
  },
  {
    id: "compliance",
    icon: AlertTriangle,
    label: "Missing compliance documents",
    count: 3,
    severity: "warning",
    accentColor: "hsl(38, 92%, 50%)",
    tagline: "3 workers are missing documents required to remain compliant in EU jurisdictions",
    actions: [
      { id: "a4", title: "Collect missing work permits", client: "Acme Corp", affected: 3, reason: "Required for compliance in DE, FR", cta: "Follow up" },
      { id: "a6", title: "Worker visa expiring next month", client: "Waystar Royco", affected: 1, deadline: "28 days", reason: "Renewal process not started", cta: "Investigate" },
    ],
    metrics: [
      { label: "Compliance rate", value: "91%", trend: "−3% this month", positive: false },
      { label: "Documents pending", value: "7", trend: "5 uploaded, 2 missing" },
      { label: "Avg resolution", value: "4.1d", trend: "+1.2d vs target", positive: false },
      { label: "Auto-reminders sent", value: "12", trend: "Last 7 days" },
    ],
    insight: { text: "3 compliance tasks across Globex and Acme involve DE-based workers missing proof of address. Can be resolved together.", category: "optimization" },
  },
  {
    id: "signatures",
    icon: FileSignature,
    label: "Contracts overdue for signature",
    count: 2,
    severity: "warning",
    accentColor: "hsl(25, 95%, 53%)",
    tagline: "2 contracts have been waiting for signatures beyond the expected turnaround",
    actions: [
      { id: "a5", title: "Contract signature pending from worker", client: "Globex Inc", affected: 1, deadline: "3 days overdue", reason: "Reminder sent 2 days ago", cta: "Nudge" },
      { id: "a10", title: "Amendment signature required", client: "Acme Corp", affected: 1, deadline: "5 days overdue", reason: "Salary adjustment effective Jan 1", cta: "Escalate" },
    ],
    metrics: [
      { label: "Avg sign time", value: "3.2d", trend: "−0.8d improvement", positive: true },
      { label: "Overdue", value: "2", trend: "Both 3+ days" },
      { label: "Signed this week", value: "8", trend: "+3 vs last week", positive: true },
      { label: "Completion rate", value: "89%", trend: "Within SLA" },
    ],
    insight: { text: "Acme Corp has repeated delays in contract signing from contractor roles. Average 8.3d vs 3.1d for employees.", category: "pattern" },
  },
  {
    id: "payroll-blockers",
    icon: Ban,
    label: "Payroll processing blocked",
    count: 2,
    severity: "critical",
    accentColor: "hsl(0, 65%, 48%)",
    tagline: "Tax ID mismatches are blocking payroll for 2 workers at Waystar Royco",
    actions: [
      { id: "a3", title: "Resolve tax ID mismatch", client: "Waystar Royco", affected: 2, deadline: "Overdue", reason: "Blocking payroll processing", cta: "Resolve" },
    ],
    metrics: [
      { label: "Workers blocked", value: "2", trend: "Since 3 days ago" },
      { label: "Payroll impact", value: "€8.4k", trend: "Delayed disbursement" },
      { label: "Resolution ETA", value: "—", trend: "Not started", positive: false },
      { label: "Similar past issues", value: "1", trend: "Resolved in 2d" },
    ],
    insight: { text: "Waystar Royco may miss payroll cutoff if pending items are not completed today. Escalation recommended.", category: "risk" },
  },
  {
    id: "fx",
    icon: DollarSign,
    label: "FX movement affecting payouts",
    count: 1,
    severity: "info",
    accentColor: "hsl(172, 28%, 42%)",
    tagline: "GBP/EUR volatility is above normal this cycle — rate lock expiring for Globex Inc",
    actions: [
      { id: "a8", title: "FX rate lock expiring for GBP payouts", client: "Globex Inc", deadline: "2 days", reason: "Rate locked at 1.27, current 1.24", cta: "Review" },
    ],
    metrics: [
      { label: "Volatility", value: "+2.1%", trend: "Above normal", positive: false },
      { label: "Exposure", value: "€4.2k", trend: "Across 3 clients" },
      { label: "Rate locked", value: "1.27", trend: "Current: 1.24" },
      { label: "Lock expires", value: "2d", trend: "Auto-renew off" },
    ],
    insight: { text: "FX movement this cycle is above normal for EUR payouts — +2.1% volatility could affect payout totals by up to €4,200.", category: "risk" },
  },
];
