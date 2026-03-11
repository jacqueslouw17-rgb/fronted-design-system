/**
 * Recent Activity / Operational Timeline
 */
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileSignature, FileCheck, AlertTriangle, DollarSign, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  time: string;
  type: "success" | "info" | "warning";
}

const EVENTS: TimelineEvent[] = [
  { id: "e1", icon: FileCheck, label: "Payroll file approved", detail: "Globex Inc · December batch", time: "12 min ago", type: "success" },
  { id: "e2", icon: UserCheck, label: "Worker verified", detail: "Maria García · Acme Corp", time: "34 min ago", type: "success" },
  { id: "e3", icon: FileSignature, label: "Contract signed", detail: "James Wilson · Waystar Royco", time: "1h ago", type: "info" },
  { id: "e4", icon: AlertTriangle, label: "Compliance issue flagged", detail: "Missing work permit · Acme Corp", time: "2h ago", type: "warning" },
  { id: "e5", icon: DollarSign, label: "Payout exception resolved", detail: "Currency conversion adjusted · Globex Inc", time: "3h ago", type: "success" },
  { id: "e6", icon: CheckCircle2, label: "Onboarding completed", detail: "Sarah Chen · Initech", time: "4h ago", type: "success" },
];

const typeColors = {
  success: "text-green-500 bg-green-500/8",
  info: "text-primary bg-primary/8",
  warning: "text-amber-500 bg-amber-500/8",
};

export const F1v7_ActivityTimeline: React.FC = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(210 8% 15%)" }}>
        Recent activity
      </h3>
      <div className="v7-glass-card rounded-2xl border border-border/30 overflow-hidden">
        {EVENTS.map((event, idx) => {
          const Icon = event.icon;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 hover:bg-white/20 transition-colors cursor-pointer",
                idx < EVENTS.length - 1 && "border-b border-border/15"
              )}
            >
              <div className={cn("p-1.5 rounded-lg shrink-0", typeColors[event.type])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium" style={{ color: "hsl(210 8% 15%)" }}>{event.label}</span>
                <span className="text-[11px] text-muted-foreground ml-2">{event.detail}</span>
              </div>
              <span className="text-[10px] text-muted-foreground/60 shrink-0">{event.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
