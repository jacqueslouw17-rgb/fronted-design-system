/**
 * Hero Priority Strip — fluid organic urgency orbs
 * Each priority is a living, breathing shape — not a static card
 */
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, FileSignature, DollarSign, Users, ArrowRight } from "lucide-react";

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

const severityGradient = {
  critical: {
    bg: "linear-gradient(135deg, hsl(0 72% 51% / 0.06), hsl(340 70% 55% / 0.04), hsl(0 0% 100% / 0.5))",
    border: "hsl(0 72% 51% / 0.12)",
    glow: "hsl(0 72% 51%)",
    pulse: "hsl(0 72% 51% / 0.08)",
  },
  warning: {
    bg: "linear-gradient(135deg, hsl(38 92% 50% / 0.05), hsl(25 90% 55% / 0.03), hsl(0 0% 100% / 0.5))",
    border: "hsl(38 92% 50% / 0.12)",
    glow: "hsl(38 92% 50%)",
    pulse: "hsl(38 92% 50% / 0.06)",
  },
  info: {
    bg: "linear-gradient(135deg, hsl(172 28% 42% / 0.05), hsl(200 50% 50% / 0.03), hsl(0 0% 100% / 0.5))",
    border: "hsl(172 28% 42% / 0.12)",
    glow: "hsl(172 28% 42%)",
    pulse: "hsl(172 28% 42% / 0.06)",
  },
};

export const F1v7_PriorityHeroStrip: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Living header with breathing indicator */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "hsl(0 72% 51% / 0.3)" }}
          />
          <div className="relative h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(0 72% 51%)" }} />
        </div>
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 40%)" }}>
          Requires attention
        </h3>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(210 8% 80%), transparent)" }} />
        <span className="text-[10px] font-medium" style={{ color: "hsl(210 8% 55%)" }}>
          {PRIORITY_ITEMS.reduce((sum, i) => sum + i.count, 0)} total
        </span>
      </div>

      {/* Fluid priority orbs — horizontally scrollable on mobile, grid on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {PRIORITY_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const sev = severityGradient[item.severity];
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex flex-col items-start gap-2.5 p-5 text-left cursor-pointer overflow-hidden"
              style={{
                background: sev.bg,
                backdropFilter: "blur(40px) saturate(1.5)",
                borderRadius: "24px",
                border: `1px solid ${sev.border}`,
                boxShadow: `0 1px 3px hsl(0 0% 0% / 0.02), inset 0 1px 0 hsl(0 0% 100% / 0.6)`,
              }}
            >
              {/* Ambient glow on hover */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(circle, ${sev.pulse}, transparent 70%)`,
                  filter: "blur(20px)",
                }}
              />

              {/* Iridescent edge accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${sev.glow}40, hsl(260 60% 65% / 0.2), ${sev.glow}20, transparent)`,
                }}
              />

              {/* Count — massive, fluid typography */}
              <div className="flex items-start justify-between w-full relative z-10">
                <motion.span
                  className="text-[38px] font-extralight leading-none tracking-[-0.04em]"
                  style={{ color: sev.glow }}
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                >
                  {item.count}
                </motion.span>
                <div className="p-1.5 rounded-xl opacity-30 group-hover:opacity-60 transition-all duration-500"
                  style={{ backgroundColor: `${sev.glow}08` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: sev.glow }} />
                </div>
              </div>

              {/* Label */}
              <p className="text-[11.5px] font-medium leading-snug tracking-[-0.01em] relative z-10" style={{ color: "hsl(210 8% 28%)" }}>
                {item.label}
              </p>

              {/* Action — slides up on hover */}
              <div className="flex items-center gap-1 text-[10.5px] font-semibold tracking-[0.02em] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 relative z-10" style={{ color: sev.glow }}>
                {item.action}
                <ArrowRight className="h-3 w-3" />
              </div>

              {/* Bottom morphing accent */}
              <div
                className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-60 transition-all duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${sev.glow}, transparent)` }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
