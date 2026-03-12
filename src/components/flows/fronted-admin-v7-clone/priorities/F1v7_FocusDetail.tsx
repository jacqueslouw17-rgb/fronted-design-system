/**
 * Focus Detail — actions + metrics with living glass UI
 * Iridescent edges, ambient hover glows, floating blobs.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { PriorityItem, ActionDetail, MetricSnapshot } from "./F1v7_PriorityData";

interface Props {
  priority: PriorityItem;
  direction: number;
  onActionClick?: (action: ActionDetail) => void;
}

export const F1v7_FocusDetail: React.FC<Props> = ({ priority, direction }) => {
  const [highlightedMetrics, setHighlightedMetrics] = useState<string[] | null>(null);

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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3" style={{ alignItems: "start" }}>
          <div className="xl:col-span-7 flex flex-col">
            <ActionList actions={priority.actions} accent={priority.accentColor} onHighlightMetrics={setHighlightedMetrics} />
          </div>
          <div className="xl:col-span-5 flex flex-col">
            <MetricsGrid metrics={priority.metrics} accent={priority.accentColor} highlightedMetrics={highlightedMetrics} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─────────── Action List ─────────── */
const ActionList: React.FC<{ actions: ActionDetail[]; accent: string; onHighlightMetrics: (metrics: string[] | null) => void }> = ({ actions, accent, onHighlightMetrics }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex items-center gap-2 px-1 mb-1.5">
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
        className="overflow-hidden flex-1 relative group/list"
        style={{
          background: "linear-gradient(180deg, hsl(0 0% 100% / 0.5), hsl(0 0% 100% / 0.25))",
          backdropFilter: "blur(50px) saturate(1.6)",
          borderRadius: "22px",
          border: "1px solid hsl(0 0% 100% / 0.45)",
          boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6), inset 0 -1px 0 hsl(0 0% 100% / 0.3)",
        }}
      >
        {/* Iridescent top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px] z-10"
          style={{
            background: `linear-gradient(90deg, transparent 3%, ${accent}25 20%, hsl(260 60% 70% / 0.2) 50%, ${accent}20 80%, transparent 97%)`,
          }}
        />

        {/* Floating blob — drifts inside container */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 140,
            height: 100,
            top: -20,
            right: -30,
            background: `radial-gradient(circle, ${accent}04, transparent 70%)`,
            filter: "blur(25px)",
          }}
          animate={{ x: [0, 20, -10, 0], y: [0, 10, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

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
              onHighlightMetrics(action.relatedMetrics ?? null);
              e.currentTarget.style.background = `linear-gradient(90deg, ${accent}04, hsl(0 0% 100% / 0.5))`;
            }}
            onMouseLeave={(e) => {
              setHoveredId(null);
              onHighlightMetrics(null);
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

            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{
                opacity: hoveredId === action.id ? 1 : 0,
                x: hoveredId === action.id ? 0 : 6,
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 flex items-center gap-1.5 h-8 px-4 text-[11px] font-semibold"
              style={{
                color: accent,
                background: `${accent}08`,
                borderRadius: "12px",
                border: `1px solid ${accent}15`,
                pointerEvents: hoveredId === action.id ? "auto" : "none",
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
const MetricsGrid: React.FC<{ metrics: MetricSnapshot[]; accent: string; highlightedMetrics: string[] | null }> = ({ metrics, accent, highlightedMetrics }) => {
  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase block px-1 mb-1.5" style={{ color: "hsl(210 8% 42%)" }}>
        Impact
      </span>
      <div className="grid grid-cols-2 gap-2 flex-1" style={{ minHeight: 0 }}>
        {metrics.map((m, idx) => {
          const isActive = highlightedMetrics === null || highlightedMetrics.includes(m.label);
          const isShaded = highlightedMetrics !== null && !highlightedMetrics.includes(m.label);
          return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{
              opacity: isShaded ? 0.35 : 1,
              y: 0,
              scale: isShaded ? 0.97 : (highlightedMetrics !== null && isActive ? 1.02 : 1),
            }}
            transition={{ delay: highlightedMetrics !== null ? 0 : 0.08 + idx * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden group/metric"
            style={{
              background: isActive && highlightedMetrics !== null
                ? `linear-gradient(155deg, hsl(0 0% 100% / 0.65), hsl(0 0% 100% / 0.4))`
                : "linear-gradient(155deg, hsl(0 0% 100% / 0.55), hsl(0 0% 100% / 0.3))",
              backdropFilter: "blur(40px) saturate(1.5)",
              borderRadius: "16px",
              border: isActive && highlightedMetrics !== null
                ? `1px solid ${accent}30`
                : "1px solid hsl(0 0% 100% / 0.45)",
              boxShadow: isActive && highlightedMetrics !== null
                ? `inset 0 1px 0 hsl(0 0% 100% / 0.6), inset 0 -1px 0 hsl(0 0% 100% / 0.3), 0 0 12px ${accent}10`
                : "inset 0 1px 0 hsl(0 0% 100% / 0.6), inset 0 -1px 0 hsl(0 0% 100% / 0.3)",
              padding: "14px",
              transition: "border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
              filter: isShaded ? "grayscale(0.4)" : "none",
            }}
          >
            {/* Iridescent top edge */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent 5%, ${accent}15 30%, hsl(260 60% 70% / 0.12) 55%, ${accent}10 75%, transparent 95%)`,
              }}
            />

            {/* Ambient glow on hover */}
            <div
              className="absolute inset-0 rounded-[16px] opacity-0 group-hover/metric:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${accent}06, transparent 60%)`,
              }}
            />

            {/* Floating micro-blob */}
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 60,
                height: 60,
                bottom: -15,
                right: -10,
                background: `radial-gradient(circle, ${accent}04, transparent 70%)`,
                filter: "blur(15px)",
              }}
              animate={{ x: [0, 8, -4, 0], y: [0, -5, 3, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            <span className="relative text-[9px] font-semibold tracking-[0.14em] uppercase block" style={{ color: "hsl(210 8% 50%)" }}>
              {m.label}
            </span>
            <span
              className="relative text-[26px] font-extralight leading-none tracking-[-0.03em] block mt-1"
              style={{ color: "hsl(210 8% 10%)" }}
            >
              {m.value}
            </span>
            {m.trend && (
              <span
                className="relative text-[10px] font-medium block mt-1"
                style={{
                  color: m.positive === true ? "hsl(152 50% 36%)" :
                    m.positive === false ? "hsl(0 60% 45%)" : "hsl(210 8% 50%)",
                }}
              >
                {m.trend}
              </span>
            )}
          </motion.div>
          );
        })}
      </div>
    </div>
  );
};
