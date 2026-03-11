/**
 * Action Queue — fluid stream of actionable items
 * Not buckets. A living feed that surfaces what matters.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, FileQuestion, CalendarClock, ExternalLink, Shield, Ban, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

const BUCKET_CONFIG: Record<BucketKey, { label: string; icon: React.ElementType; accent: string; gradient: string }> = {
  "approval": { label: "Needs approval", icon: Clock, accent: "hsl(38 92% 50%)", gradient: "linear-gradient(135deg, hsl(38 92% 50% / 0.06), hsl(25 90% 55% / 0.03))" },
  "at-risk": { label: "At risk", icon: AlertTriangle, accent: "hsl(0 72% 51%)", gradient: "linear-gradient(135deg, hsl(0 72% 51% / 0.05), hsl(340 60% 55% / 0.03))" },
  "missing": { label: "Missing info", icon: FileQuestion, accent: "hsl(25 95% 53%)", gradient: "linear-gradient(135deg, hsl(25 95% 53% / 0.05), hsl(38 80% 55% / 0.03))" },
  "due-soon": { label: "Due soon", icon: CalendarClock, accent: "hsl(172 28% 42%)", gradient: "linear-gradient(135deg, hsl(172 28% 42% / 0.05), hsl(200 40% 50% / 0.03))" },
  "waiting": { label: "Waiting on external", icon: ExternalLink, accent: "hsl(210 8% 50%)", gradient: "linear-gradient(135deg, hsl(210 8% 50% / 0.05), hsl(220 10% 55% / 0.03))" },
  "compliance": { label: "Compliance issue", icon: Shield, accent: "hsl(0 65% 48%)", gradient: "linear-gradient(135deg, hsl(0 65% 48% / 0.05), hsl(340 50% 50% / 0.03))" },
  "payroll-blocker": { label: "Payroll blocker", icon: Ban, accent: "hsl(0 72% 45%)", gradient: "linear-gradient(135deg, hsl(0 72% 45% / 0.06), hsl(0 60% 50% / 0.03))" },
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

  const grouped = MOCK_ACTIONS.reduce((acc, item) => {
    if (!acc[item.bucket]) acc[item.bucket] = [];
    acc[item.bucket].push(item);
    return acc;
  }, {} as Record<BucketKey, ActionItem[]>);

  const bucketOrder: BucketKey[] = ["approval", "payroll-blocker", "at-risk", "missing", "compliance", "waiting", "due-soon"];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 40%)" }}>
          Action stream
        </h3>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(210 8% 80%), transparent)" }} />
        <span className="text-[10px] font-medium tabular-nums" style={{ color: "hsl(210 8% 55%)" }}>
          {MOCK_ACTIONS.length} items
        </span>
      </div>

      <div className="space-y-2">
        {bucketOrder.filter(b => grouped[b]).map((bucketKey, bIdx) => {
          const config = BUCKET_CONFIG[bucketKey];
          const items = grouped[bucketKey];
          const Icon = config.icon;
          const isExpanded = expandedBucket === bucketKey;

          return (
            <motion.div
              key={bucketKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: bIdx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden"
              style={{
                background: isExpanded ? config.gradient : "hsl(0 0% 100% / 0.4)",
                backdropFilter: "blur(40px) saturate(1.4)",
                borderRadius: "20px",
                border: `1px solid ${isExpanded ? config.accent + "18" : "hsl(0 0% 100% / 0.5)"}`,
                boxShadow: isExpanded
                  ? `0 8px 32px ${config.accent}06, inset 0 1px 0 hsl(0 0% 100% / 0.6)`
                  : "inset 0 1px 0 hsl(0 0% 100% / 0.5)",
                transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Iridescent top edge on expanded */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-0 left-0 right-0 h-[1.5px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${config.accent}30, hsl(260 50% 65% / 0.15), ${config.accent}15, transparent)`,
                  }}
                />
              )}

              <button
                onClick={() => setExpandedBucket(isExpanded ? null : bucketKey)}
                className="w-full flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl" style={{ backgroundColor: `${config.accent}08` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: config.accent }} />
                  </div>
                  <span className="text-[12.5px] font-semibold" style={{ color: "hsl(210 8% 18%)" }}>{config.label}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${config.accent}0A`, color: config.accent }}
                  >
                    {items.length}
                  </span>
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-400", isExpanded && "rotate-180")}
                  style={{ color: "hsl(210 8% 60%)" }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-3 pb-3 space-y-1">
                      {items.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="group flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer transition-all duration-300"
                          style={{
                            borderRadius: "14px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "hsl(0 0% 100% / 0.5)";
                            e.currentTarget.style.boxShadow = `0 2px 12px ${config.accent}06`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-[12.5px] font-medium tracking-[-0.01em]" style={{ color: "hsl(210 8% 14%)" }}>
                                {item.title}
                              </span>
                              {item.deadline && (
                                <span
                                  className="text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: item.deadline === "Overdue" ? "hsl(0 72% 51% / 0.08)" :
                                      item.deadline === "Due today" ? "hsl(38 92% 50% / 0.08)" : "hsl(210 8% 88%)",
                                    color: item.deadline === "Overdue" ? "hsl(0 65% 42%)" :
                                      item.deadline === "Due today" ? "hsl(38 80% 38%)" : "hsl(210 8% 42%)",
                                  }}
                                >
                                  {item.deadline}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10.5px] font-medium" style={{ color: "hsl(210 8% 45%)" }}>{item.client}</span>
                              {item.affected && (
                                <span className="text-[10.5px]" style={{ color: "hsl(210 8% 58%)" }}>
                                  · {item.affected} {item.affected === 1 ? "worker" : "workers"}
                                </span>
                              )}
                              <span className="text-[10.5px]" style={{ color: "hsl(210 8% 65%)" }}>· {item.reason}</span>
                            </div>
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 h-7 px-3.5 text-[10.5px] font-semibold"
                            style={{
                              color: config.accent,
                              backgroundColor: `${config.accent}08`,
                              borderRadius: "10px",
                            }}
                          >
                            {item.cta}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
