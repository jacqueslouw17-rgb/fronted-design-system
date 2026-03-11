/**
 * Priorities Tab — visionary action-first command center
 * Editorial layout with architectural precision
 */
import React from "react";
import { motion } from "framer-motion";
import { F1v7_PriorityHeroStrip } from "./F1v7_PriorityHeroStrip";
import { F1v7_ActionQueue } from "./F1v7_ActionQueue";
import { F1v7_AnalyticsLayer } from "./F1v7_AnalyticsLayer";
import { F1v7_AIInsights } from "./F1v7_AIInsights";
import { F1v7_ClientHealth } from "./F1v7_ClientHealth";
import { F1v7_ActivityTimeline } from "./F1v7_ActivityTimeline";

export const F1v7_PrioritiesTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16 relative"
    >
      {/* Subtle decorative grid lines — architectural feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[200px] left-0 right-0 h-px opacity-[0.04]" style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(210 8% 15%) 20%, hsl(210 8% 15%) 80%, transparent 100%)' }} />
        <div className="absolute top-[600px] left-0 right-0 h-px opacity-[0.04]" style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(210 8% 15%) 30%, hsl(210 8% 15%) 70%, transparent 100%)' }} />
      </div>

      <div className="relative space-y-10">
        {/* A. Hero Priority Strip */}
        <F1v7_PriorityHeroStrip />

        {/* Two-column layout: actions left, insights right */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: action-oriented (wider) */}
          <div className="xl:col-span-7 space-y-10">
            <F1v7_ActionQueue />
            <F1v7_ClientHealth />
          </div>

          {/* Right: insight / analytics oriented */}
          <div className="xl:col-span-5 space-y-10">
            <F1v7_AnalyticsLayer />
            <F1v7_AIInsights />
            <F1v7_ActivityTimeline />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
