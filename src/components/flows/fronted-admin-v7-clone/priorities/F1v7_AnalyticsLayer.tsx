/**
 * Birds-Eye Analytics Layer — compact, useful operational metrics
 */
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricTile {
  id: string;
  label: string;
  value: string;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  bar?: number; // 0-100 fill percentage
  barColor?: string;
}

const METRICS: MetricTile[] = [
  { id: "issues", label: "Active issues", value: "9", trend: { direction: "down", label: "−3 this week" }, bar: 35, barColor: "bg-amber-400" },
  { id: "resolved", label: "Resolved this week", value: "14", trend: { direction: "up", label: "+6 vs last week" }, bar: 70, barColor: "bg-green-400" },
  { id: "payroll-ready", label: "Payroll readiness", value: "87%", trend: { direction: "up", label: "4 clients ready" }, bar: 87, barColor: "bg-primary" },
  { id: "compliance", label: "Document compliance", value: "94%", trend: { direction: "flat", label: "Stable" }, bar: 94, barColor: "bg-green-400" },
  { id: "contract-tat", label: "Avg contract turnaround", value: "3.2d", trend: { direction: "down", label: "−0.8d improvement" }, bar: 40, barColor: "bg-primary" },
  { id: "cutoff", label: "Upcoming cutoff exposure", value: "2", trend: { direction: "up", label: "Action needed" }, bar: 20, barColor: "bg-red-400" },
];

const TrendIcon: React.FC<{ direction: "up" | "down" | "flat" }> = ({ direction }) => {
  if (direction === "up") return <TrendingUp className="h-3 w-3" />;
  if (direction === "down") return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

export const F1v7_AnalyticsLayer: React.FC = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(210 8% 15%)" }}>
        Operational overview
      </h3>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
        {METRICS.map((metric, idx) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="v7-glass-card rounded-2xl border border-border/30 p-3.5 space-y-2"
          >
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</span>
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl font-bold leading-none" style={{ color: "hsl(210 8% 15%)" }}>{metric.value}</span>
              {metric.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-semibold pb-0.5",
                  metric.trend.direction === "up" && metric.id !== "cutoff" ? "text-green-600" :
                  metric.trend.direction === "down" && metric.id === "issues" ? "text-green-600" :
                  metric.trend.direction === "down" ? "text-green-600" :
                  metric.trend.direction === "up" && metric.id === "cutoff" ? "text-red-500" :
                  "text-muted-foreground"
                )}>
                  <TrendIcon direction={metric.trend.direction} />
                  {metric.trend.label}
                </div>
              )}
            </div>
            {metric.bar !== undefined && (
              <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.bar}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("h-full rounded-full", metric.barColor)}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
