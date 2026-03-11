/**
 * Recent Activity / Operational Timeline — minimal, editorial feed
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
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(210 8% 45%)" }}>
          Recent activity
        </h3>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(210 8% 85%) 0%, transparent 100%)' }} />
      </div>

      <div className="v7-glass-card rounded-2xl overflow-hidden divide-y" style={{ borderColor: "hsl(210 8% 92%)" }}>
        {EVENTS.map((event, idx) => {
          const Icon = event.icon;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-white/30"
              style={{ borderColor: "hsl(210 8% 94% / 0.6)" }}
            >
              {/* Minimal accent dot instead of icon box */}
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: event.accent }} />
                {idx < EVENTS.length - 1 && (
                  <div className="w-px h-3 opacity-0" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[12.5px] font-medium block" style={{ color: "hsl(210 8% 15%)" }}>
                  {event.label}
                </span>
                <span className="text-[11px] block mt-0.5" style={{ color: "hsl(210 8% 55%)" }}>
                  {event.detail}
                </span>
              </div>

              <span className="text-[10px] font-medium shrink-0" style={{ color: "hsl(210 8% 68%)" }}>
                {event.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
