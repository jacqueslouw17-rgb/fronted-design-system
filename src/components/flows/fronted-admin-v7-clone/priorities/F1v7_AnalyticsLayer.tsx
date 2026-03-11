/**
 * Birds-Eye Analytics Layer — large editorial metric tiles with subtle visualizations
 */
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(210 8% 45%)" }}>
          Operational overview
        </h3>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(210 8% 85%) 0%, transparent 100%)' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((metric, idx) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="v7-glass-card rounded-2xl p-4 space-y-3 group cursor-pointer"
          >
            {/* Label */}
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: "hsl(210 8% 55%)" }}>
              {metric.label}
            </span>

            {/* Large value */}
            <div className="flex items-end justify-between gap-2">
              <span
                className="text-[28px] font-light leading-none tracking-tight"
                style={{ color: "hsl(210 8% 12%)" }}
              >
                {metric.value}
              </span>
            </div>

            {/* Trend text */}
            <span
              className="text-[10px] font-medium block"
              style={{ color: metric.positive ? "hsl(152 50% 38%)" : "hsl(0 60% 48%)" }}
            >
              {metric.subtitle}
            </span>

            {/* Progress bar — thin elegant line */}
            {metric.progress !== undefined && (
              <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(210 8% 92%)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.accent }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
