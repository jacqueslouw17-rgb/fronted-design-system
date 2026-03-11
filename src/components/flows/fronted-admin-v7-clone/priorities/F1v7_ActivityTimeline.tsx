/**
 * Activity Timeline — fluid stream of recent events
 * Each event is a ripple in the operational membrane.
 */
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileSignature, FileCheck, AlertTriangle, DollarSign, UserCheck } from "lucide-react";

interface TimelineEvent {
  id: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  time: string;
  accent: string;
}

const EVENTS: TimelineEvent[] = [
  { id: "e1", icon: FileCheck, label: "Payroll file approved", detail: "Globex Inc · December batch", time: "12m", accent: "hsl(152 60% 42%)" },
  { id: "e2", icon: UserCheck, label: "Worker verified", detail: "Maria García · Acme Corp", time: "34m", accent: "hsl(152 60% 42%)" },
  { id: "e3", icon: FileSignature, label: "Contract signed", detail: "James Wilson · Waystar Royco", time: "1h", accent: "hsl(172 28% 42%)" },
  { id: "e4", icon: AlertTriangle, label: "Compliance issue flagged", detail: "Missing work permit · Acme Corp", time: "2h", accent: "hsl(38 92% 50%)" },
  { id: "e5", icon: DollarSign, label: "Payout exception resolved", detail: "Currency conversion · Globex Inc", time: "3h", accent: "hsl(152 60% 42%)" },
  { id: "e6", icon: CheckCircle2, label: "Onboarding completed", detail: "Sarah Chen · Initech", time: "4h", accent: "hsl(152 60% 42%)" },
];

export const F1v7_ActivityTimeline: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 40%)" }}>
          Recent activity
        </h3>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(210 8% 80%), transparent)" }} />
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(0 0% 100% / 0.45), hsl(0 0% 100% / 0.25))",
          backdropFilter: "blur(40px) saturate(1.4)",
          borderRadius: "22px",
          border: "1px solid hsl(0 0% 100% / 0.5)",
          boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6)",
        }}
      >
        {EVENTS.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-all duration-300 relative"
            style={{
              borderBottom: idx < EVENTS.length - 1 ? "1px solid hsl(210 8% 92% / 0.4)" : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(0 0% 100% / 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Organic status dot with subtle glow */}
            <div className="relative shrink-0">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: event.accent,
                  boxShadow: `0 0 6px ${event.accent}30`,
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-medium block" style={{ color: "hsl(210 8% 13%)" }}>
                {event.label}
              </span>
              <span className="text-[10.5px] block mt-0.5" style={{ color: "hsl(210 8% 50%)" }}>
                {event.detail}
              </span>
            </div>

            <span className="text-[10px] font-medium tabular-nums shrink-0" style={{ color: "hsl(210 8% 62%)" }}>
              {event.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
