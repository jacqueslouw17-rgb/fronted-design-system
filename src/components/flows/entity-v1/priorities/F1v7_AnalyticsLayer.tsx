/**
 * Analytics Layer — fluid metric orbs with organic visualizations
 * Each metric breathes with subtle animation, not static tiles.
 */
import React from "react";
import { motion } from "framer-motion";

interface MetricTile {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  progress?: number;
  accent: string;
  positive?: boolean;
}

const METRICS: MetricTile[] = [
  { id: "issues", label: "Active issues", value: "9", subtitle: "−3 this week", progress: 35, accent: "hsl(38 92% 50%)", positive: true },
  { id: "resolved", label: "Resolved", value: "14", subtitle: "+6 vs last week", progress: 70, accent: "hsl(152 60% 42%)", positive: true },
  { id: "payroll-ready", label: "Payroll readiness", value: "87%", subtitle: "4 clients ready", progress: 87, accent: "hsl(172 28% 42%)", positive: true },
  { id: "compliance", label: "Doc compliance", value: "94%", subtitle: "Stable", progress: 94, accent: "hsl(152 60% 42%)", positive: true },
  { id: "contract-tat", label: "Contract turnaround", value: "3.2d", subtitle: "−0.8d improvement", progress: 40, accent: "hsl(172 28% 42%)", positive: true },
  { id: "cutoff", label: "Cutoff exposure", value: "2", subtitle: "Action needed", progress: 20, accent: "hsl(0 72% 51%)", positive: false },
];

export const F1v7_AnalyticsLayer: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 40%)" }}>
          Operational pulse
        </h3>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(210 8% 80%), transparent)" }} />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {METRICS.map((metric, idx) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.25 } }}
            className="group relative overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(145deg, hsl(0 0% 100% / 0.55), hsl(0 0% 100% / 0.3))",
              backdropFilter: "blur(40px) saturate(1.4)",
              borderRadius: "20px",
              border: "1px solid hsl(0 0% 100% / 0.5)",
              boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6), 0 1px 3px hsl(0 0% 0% / 0.02)",
              padding: "18px",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `radial-gradient(circle, ${metric.accent}12, transparent 70%)`,
                filter: "blur(15px)",
              }}
            />

            {/* Label */}
            <span className="text-[9.5px] font-semibold tracking-[0.14em] uppercase block relative z-10" style={{ color: "hsl(210 8% 50%)" }}>
              {metric.label}
            </span>

            {/* Value — large fluid type */}
            <div className="mt-2 mb-1.5 relative z-10">
              <span className="text-[30px] font-extralight leading-none tracking-[-0.03em]" style={{ color: "hsl(210 8% 10%)" }}>
                {metric.value}
              </span>
            </div>

            {/* Trend */}
            <span className="text-[10px] font-medium block relative z-10" style={{ color: metric.positive ? "hsl(152 50% 36%)" : "hsl(0 60% 45%)" }}>
              {metric.subtitle}
            </span>

            {/* Fluid progress — organic curved bar */}
            {metric.progress !== undefined && (
              <div className="mt-3 relative z-10">
                <div className="h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: "hsl(210 8% 90% / 0.6)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${metric.accent}, ${metric.accent}90)`,
                      boxShadow: `0 0 8px ${metric.accent}30`,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
