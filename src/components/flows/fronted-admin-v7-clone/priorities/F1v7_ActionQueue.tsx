/**
 * "What Needs Attention" Action Queue — the heart of Priorities
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, FileQuestion, CalendarClock, ExternalLink, Shield, Ban, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BucketKey = "approval" | "at-risk" | "missing" | "due-soon" | "waiting" | "compliance" | "payroll-blocker";

interface ActionItem {
  id: string;
  title: string;
  client: string;
  affected?: number;
  deadline?: string;
  reason: string;
  cta: string;
  bucket: BucketKey;
}

const BUCKET_CONFIG: Record<BucketKey, { label: string; icon: React.ElementType; color: string }> = {
  "approval": { label: "Needs approval", icon: Clock, color: "text-amber-600" },
  "at-risk": { label: "At risk", icon: AlertTriangle, color: "text-red-500" },
  "missing": { label: "Missing info", icon: FileQuestion, color: "text-orange-500" },
  "due-soon": { label: "Due soon", icon: CalendarClock, color: "text-primary" },
  "waiting": { label: "Waiting on external", icon: ExternalLink, color: "text-muted-foreground" },
  "compliance": { label: "Compliance issue", icon: Shield, color: "text-red-600" },
  "payroll-blocker": { label: "Payroll blocker", icon: Ban, color: "text-red-500" },
};

const MOCK_ACTIONS: ActionItem[] = [
  { id: "a1", title: "Approve December payroll batch", client: "Acme Corp", affected: 12, deadline: "Due today", reason: "Payroll cutoff in 6 hours", cta: "Approve", bucket: "approval" },
  { id: "a2", title: "Review contractor agreement amendment", client: "Globex Inc", affected: 1, deadline: "Due today", reason: "Contract expires Friday", cta: "Review", bucket: "approval" },
  { id: "a3", title: "Resolve tax ID mismatch", client: "Waystar Royco", affected: 2, deadline: "Overdue", reason: "Blocking payroll processing", cta: "Resolve", bucket: "payroll-blocker" },
  { id: "a4", title: "Collect missing work permits", client: "Acme Corp", affected: 3, reason: "Required for compliance in DE, FR", cta: "Follow up", bucket: "missing" },
  { id: "a5", title: "Contract signature pending from worker", client: "Globex Inc", affected: 1, deadline: "3 days", reason: "Reminder sent 2 days ago", cta: "Nudge", bucket: "waiting" },
  { id: "a6", title: "Worker visa expiring next month", client: "Waystar Royco", affected: 1, deadline: "28 days", reason: "Renewal process not started", cta: "Investigate", bucket: "compliance" },
  { id: "a7", title: "Approve onboarding documents", client: "Acme Corp", affected: 4, deadline: "Due tomorrow", reason: "Workers awaiting start date confirmation", cta: "Approve", bucket: "approval" },
  { id: "a8", title: "FX rate lock expiring for GBP payouts", client: "Globex Inc", deadline: "2 days", reason: "Rate locked at 1.27, current 1.24", cta: "Review", bucket: "at-risk" },
];

export const F1v7_ActionQueue: React.FC = () => {
  const [expandedBucket, setExpandedBucket] = useState<BucketKey | null>("approval");

  // Group actions by bucket
  const grouped = MOCK_ACTIONS.reduce((acc, item) => {
    if (!acc[item.bucket]) acc[item.bucket] = [];
    acc[item.bucket].push(item);
    return acc;
  }, {} as Record<BucketKey, ActionItem[]>);

  const bucketOrder: BucketKey[] = ["approval", "payroll-blocker", "at-risk", "missing", "compliance", "waiting", "due-soon"];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(210 8% 15%)" }}>
        What needs attention
      </h3>
      <div className="space-y-2">
        {bucketOrder.filter(b => grouped[b]).map((bucketKey) => {
          const config = BUCKET_CONFIG[bucketKey];
          const items = grouped[bucketKey];
          const Icon = config.icon;
          const isExpanded = expandedBucket === bucketKey;

          return (
            <div key={bucketKey} className="v7-glass-card rounded-2xl border border-border/30 overflow-hidden">
              <button
                onClick={() => setExpandedBucket(isExpanded ? null : bucketKey)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="text-sm font-semibold" style={{ color: "hsl(210 8% 15%)" }}>{config.label}</span>
                  <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 bg-muted/60 font-bold">
                    {items.length}
                  </Badge>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-2 pb-2 space-y-1">
                      {items.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-white/30 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-medium" style={{ color: "hsl(210 8% 15%)" }}>{item.title}</span>
                              {item.deadline && (
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                  item.deadline === "Overdue" ? "bg-red-500/12 text-red-600" :
                                  item.deadline === "Due today" ? "bg-amber-500/12 text-amber-700" :
                                  "bg-muted/60 text-muted-foreground"
                                )}>
                                  {item.deadline}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-muted-foreground">{item.client}</span>
                              {item.affected && (
                                <span className="text-[11px] text-muted-foreground">· {item.affected} {item.affected === 1 ? "worker" : "workers"}</span>
                              )}
                              <span className="text-[11px] text-muted-foreground/70">· {item.reason}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
                          >
                            {item.cta}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
