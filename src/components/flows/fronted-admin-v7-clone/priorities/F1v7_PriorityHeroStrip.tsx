/**
 * Hero Priority Strip — top-level urgent items at a glance
 */
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, FileSignature, DollarSign, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityItem {
  id: string;
  icon: React.ElementType;
  label: string;
  count: number;
  severity: "critical" | "warning" | "info";
  action: string;
}

const PRIORITY_ITEMS: PriorityItem[] = [
  { id: "approvals", icon: Clock, label: "Approvals blocking payroll", count: 4, severity: "critical", action: "Review" },
  { id: "compliance", icon: AlertTriangle, label: "Missing compliant documents", count: 3, severity: "warning", action: "Resolve" },
  { id: "signatures", icon: FileSignature, label: "Contracts overdue for signature", count: 2, severity: "warning", action: "Follow up" },
  { id: "fx", icon: DollarSign, label: "FX movement affecting EUR payouts", count: 1, severity: "info", action: "Investigate" },
  { id: "cutoff", icon: Users, label: "Client nearing payroll cutoff", count: 1, severity: "critical", action: "Escalate" },
];

const severityStyles = {
  critical: "border-red-400/30 bg-red-500/6",
  warning: "border-amber-400/30 bg-amber-500/6",
  info: "border-primary/20 bg-primary/5",
};

const severityDot = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-primary",
};

const severityCountBg = {
  critical: "bg-red-500/12 text-red-700",
  warning: "bg-amber-500/12 text-amber-700",
  info: "bg-primary/12 text-primary",
};

export const F1v7_PriorityHeroStrip: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(210 8% 15%)" }}>
          Requires immediate attention
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
        {PRIORITY_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "v7-glass-card group relative flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left cursor-pointer transition-shadow hover:shadow-lg",
                severityStyles[item.severity]
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", severityDot[item.severity])} />
                <span className={cn("text-xs font-bold rounded-full px-2 py-0.5", severityCountBg[item.severity])}>
                  {item.count}
                </span>
              </div>
              <p className="text-[13px] font-medium leading-tight" style={{ color: "hsl(210 8% 15%)" }}>
                {item.label}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.action}
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
