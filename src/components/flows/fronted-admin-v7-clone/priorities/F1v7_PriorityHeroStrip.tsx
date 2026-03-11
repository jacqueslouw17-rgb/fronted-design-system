/**
 * Hero Priority Strip — editorial urgency cards with architectural precision
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

const severityAccent = {
  critical: "hsl(0 72% 51%)",
  warning: "hsl(38 92% 50%)",
  info: "hsl(172 28% 42%)",
};

export const F1v7_PriorityHeroStrip: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Section header with decorative line */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'hsl(0 72% 51% / 0.6)' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'hsl(0 72% 51%)' }} />
          </span>
          <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(210 8% 45%)" }}>
            Requires attention
          </h3>
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(210 8% 85%) 0%, transparent 100%)' }} />
      </div>

      {/* Priority cards — large numbers, editorial layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {PRIORITY_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const accent = severityAccent[item.severity];
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className="v7-glass-card group relative flex flex-col items-start gap-3 p-4 rounded-2xl border text-left cursor-pointer"
              style={{ borderColor: `${accent}20` }}
            >
              {/* Large count number */}
              <div className="flex items-start justify-between w-full">
                <span
                  className="text-[32px] font-light leading-none tracking-tight"
                  style={{ color: accent }}
                >
                  {item.count}
                </span>
                <div
                  className="p-1.5 rounded-lg opacity-40 group-hover:opacity-70 transition-opacity"
                  style={{ backgroundColor: `${accent}10` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
                </div>
              </div>

              {/* Label */}
              <p className="text-[12px] font-medium leading-snug tracking-[-0.01em]" style={{ color: "hsl(210 8% 30%)" }}>
                {item.label}
              </p>

              {/* Action link — revealed on hover */}
              <div className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0" style={{ color: accent }}>
                {item.action}
                <ArrowRight className="h-3 w-3" />
              </div>

              {/* Subtle bottom accent line */}
              <div
                className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
