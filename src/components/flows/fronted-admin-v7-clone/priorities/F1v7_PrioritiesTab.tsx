/**
 * Priorities Tab — the hero default tab for v7 Future dashboard
 * Action-first AI-powered command center layout
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
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* A. Hero Priority Strip */}
      <F1v7_PriorityHeroStrip />

      {/* Two-column layout: actions left, insights right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: action-oriented (wider) */}
        <div className="xl:col-span-7 space-y-6">
          {/* B. Action Queue */}
          <F1v7_ActionQueue />
          
          {/* E. Client Health */}
          <F1v7_ClientHealth />
        </div>

        {/* Right: insight / analytics oriented */}
        <div className="xl:col-span-5 space-y-6">
          {/* C. Analytics */}
          <F1v7_AnalyticsLayer />

          {/* D. AI Insights */}
          <F1v7_AIInsights />

          {/* F. Activity Timeline */}
          <F1v7_ActivityTimeline />
        </div>
      </div>
    </motion.div>
  );
};
