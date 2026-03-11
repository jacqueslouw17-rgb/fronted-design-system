/**
 * Priorities Tab — fluid, organic action surface
 * Not a dashboard. A living operational membrane.
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
      transition={{ duration: 0.6 }}
      className="pb-20 relative"
    >
      {/* Floating iridescent orbs — ambient depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, hsl(172 60% 50%), hsl(260 60% 70%), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 30, -25, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[400px] -left-40 w-[400px] h-[400px] rounded-full opacity-[0.035]"
          style={{
            background: "radial-gradient(circle, hsl(38 90% 60%), hsl(340 60% 60%), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 40, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[900px] right-10 w-[350px] h-[350px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(200 70% 60%), hsl(172 50% 50%), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative space-y-8">
        {/* A. Hero Priority Strip — the pulse */}
        <F1v7_PriorityHeroStrip />

        {/* Fluid asymmetric layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: action stream */}
          <div className="xl:col-span-7 space-y-6">
            <F1v7_ActionQueue />
            <F1v7_ClientHealth />
          </div>

          {/* Right: intelligence layer */}
          <div className="xl:col-span-5 space-y-6">
            <F1v7_AnalyticsLayer />
            <F1v7_AIInsights />
            <F1v7_ActivityTimeline />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
