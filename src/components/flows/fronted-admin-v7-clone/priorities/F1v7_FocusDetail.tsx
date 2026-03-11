/**
 * Focus Detail — actions + metrics only, tight to the wheel
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { PriorityItem, ActionDetail, MetricSnapshot } from "./F1v7_PriorityData";

interface Props {
  priority: PriorityItem;
  direction: number;
}

export const F1v7_FocusDetail: React.FC<Props> = ({ priority, direction }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={priority.id}
        initial={{ opacity: 0, y: direction >= 0 ? 30 : -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: direction >= 0 ? -15 : 30 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        {/* ── Equal-height layout: Actions + Metrics ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 xl:items-stretch">
          {/* Left: Actions */}
          <div className="xl:col-span-7 flex flex-col">
            <ActionList actions={priority.actions} accent={priority.accentColor} />
          </div>

          {/* Right: Metrics */}
          <div className="xl:col-span-5 flex flex-col">
            <MetricsGrid metrics={priority.metrics} accent={priority.accentColor} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─────────── Action List ─────────── */
const ActionList: React.FC<{ actions: ActionDetail[]; accent: string }> = ({ actions, accent }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 42%)" }}>
          Actions
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full tabular-nums"
          style={{ backgroundColor: `${accent}0A`, color: accent }}
        >
          {actions.length}
        </span>
      </div>

      <div
        className="overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(0 0% 100% / 0.5), hsl(0 0% 100% / 0.25))",
          backdropFilter: "blur(50px) saturate(1.6)",
          borderRadius: "22px",
          border: "1px solid hsl(0 0% 100% / 0.45)",
          boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6)",
        }}
      >
        {actions.map((action, idx) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex items-center justify-between gap-4 px-5 py-3.5 cursor-pointer transition-all duration-300"
            style={{
              borderBottom: idx < actions.length - 1 ? "1px solid hsl(210 8% 92% / 0.4)" : "none",
            }}
            onMouseEnter={(e) => {
              setHoveredId(action.id);
              e.currentTarget.style.background = `hsl(0 0% 100% / 0.5)`;
            }}
            onMouseLeave={(e) => {
              setHoveredId(null);
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Left accent line on hover */}
            <motion.div
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: hoveredId === action.id ? 1 : 0,
                scaleY: hoveredId === action.id ? 1 : 0,
              }}
              style={{ backgroundColor: accent, transformOrigin: "center" }}
              transition={{ duration: 0.3 }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: "hsl(210 8% 12%)" }}>
                  {action.title}
                </span>
                {action.deadline && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        action.deadline === "Overdue" ? "hsl(0 72% 51% / 0.08)" :
                        action.deadline.includes("today") ? "hsl(38 92% 50% / 0.08)" :
                        "hsl(210 8% 90%)",
                      color:
                        action.deadline === "Overdue" ? "hsl(0 65% 42%)" :
                        action.deadline.includes("today") ? "hsl(38 80% 38%)" :
                        "hsl(210 8% 42%)",
                    }}
                  >
                    {action.deadline}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-medium" style={{ color: "hsl(210 8% 40%)" }}>{action.client}</span>
                {action.affected && (
                  <span className="text-[11px]" style={{ color: "hsl(210 8% 55%)" }}>
                    · {action.affected} {action.affected === 1 ? "worker" : "workers"}
                  </span>
                )}
                <span className="text-[11px]" style={{ color: "hsl(210 8% 62%)" }}>· {action.reason}</span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{
                opacity: hoveredId === action.id ? 1 : 0,
                x: hoveredId === action.id ? 0 : 8,
              }}
              transition={{ duration: 0.25 }}
              className="shrink-0 flex items-center gap-1.5 h-8 px-4 text-[11px] font-semibold"
              style={{
                color: "hsl(0 0% 100%)",
                backgroundColor: accent,
                borderRadius: "12px",
                boxShadow: `0 4px 12px ${accent}30`,
              }}
            >
              {action.cta}
              <ArrowRight className="h-3 w-3" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Metrics Grid ─────────── */
const MetricsGrid: React.FC<{ metrics: MetricSnapshot[]; accent: string }> = ({ metrics, accent }) => {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase block px-1" style={{ color: "hsl(210 8% 42%)" }}>
        Metrics
      </span>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 + idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
            style={{
              background: "linear-gradient(155deg, hsl(0 0% 100% / 0.55), hsl(0 0% 100% / 0.3))",
              backdropFilter: "blur(40px) saturate(1.5)",
              borderRadius: "16px",
              border: "1px solid hsl(0 0% 100% / 0.45)",
              boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6)",
              padding: "14px",
            }}
          >
            <span className="text-[9px] font-semibold tracking-[0.14em] uppercase block" style={{ color: "hsl(210 8% 50%)" }}>
              {m.label}
            </span>
            <span
              className="text-[26px] font-extralight leading-none tracking-[-0.03em] block mt-1"
              style={{ color: "hsl(210 8% 10%)" }}
            >
              {m.value}
            </span>
            {m.trend && (
              <span
                className="text-[10px] font-medium block mt-1"
                style={{
                  color: m.positive === true ? "hsl(152 50% 36%)" :
                    m.positive === false ? "hsl(0 60% 45%)" : "hsl(210 8% 50%)",
                }}
              >
                {m.trend}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
