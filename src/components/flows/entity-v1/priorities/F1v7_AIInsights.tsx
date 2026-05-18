/**
 * AI Insights — living intelligence membrane
 * Each insight is an organic, expandable thought — not a static card.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  icon: React.ElementType;
  category: "pattern" | "risk" | "optimization" | "anomaly";
  text: string;
  detail?: string;
}

const INSIGHTS: Insight[] = [
  { id: "i1", icon: TrendingUp, category: "pattern", text: "Acme Corp has repeated delays in contract signing, mostly from contractor roles.", detail: "Average signing time is 8.3 days vs 3.1 days for employees. Consider pre-filling contractor agreements." },
  { id: "i2", icon: AlertTriangle, category: "risk", text: "Waystar Royco may miss payroll cutoff if 2 pending approvals are not completed today.", detail: "Approvals have been pending for 3 days. Escalation recommended." },
  { id: "i3", icon: BarChart3, category: "anomaly", text: "FX movement this cycle is above normal for EUR payouts — +2.1% volatility.", detail: "This could affect payout totals by up to €4,200 across 3 clients." },
  { id: "i4", icon: Lightbulb, category: "optimization", text: "3 compliance tasks across Globex and Acme can be resolved together to reduce admin effort.", detail: "All three involve missing proof of address for DE-based workers." },
  { id: "i5", icon: TrendingUp, category: "pattern", text: "Globex Inc shows rising document re-upload rates this month — up 40%.", detail: "Most re-uploads are due to incorrect file formats. Consider adding validation guidance." },
];

const categoryStyle: Record<string, { accent: string; gradient: string }> = {
  pattern: { accent: "hsl(172 28% 42%)", gradient: "linear-gradient(135deg, hsl(172 28% 42% / 0.06), hsl(200 40% 55% / 0.03))" },
  risk: { accent: "hsl(38 92% 50%)", gradient: "linear-gradient(135deg, hsl(38 92% 50% / 0.05), hsl(25 80% 55% / 0.03))" },
  optimization: { accent: "hsl(152 60% 42%)", gradient: "linear-gradient(135deg, hsl(152 60% 42% / 0.05), hsl(172 40% 50% / 0.03))" },
  anomaly: { accent: "hsl(0 72% 51%)", gradient: "linear-gradient(135deg, hsl(0 72% 51% / 0.04), hsl(340 50% 55% / 0.02))" },
};

export const F1v7_AIInsights: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(172 28% 42%)" }} />
          </motion.div>
          <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 40%)" }}>
            Intelligence
          </h3>
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(210 8% 80%), transparent)" }} />
        <span
          className="text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full"
          style={{
            background: "linear-gradient(135deg, hsl(172 28% 42% / 0.08), hsl(260 50% 60% / 0.06))",
            color: "hsl(172 28% 42%)",
            border: "1px solid hsl(172 28% 42% / 0.1)",
          }}
        >
          AI
        </span>
      </div>

      <div className="space-y-2">
        {INSIGHTS.map((insight, idx) => {
          const isExpanded = expanded === insight.id;
          const style = categoryStyle[insight.category];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden cursor-pointer"
              style={{
                background: isExpanded ? style.gradient : "hsl(0 0% 100% / 0.38)",
                backdropFilter: "blur(40px) saturate(1.4)",
                borderRadius: "18px",
                border: `1px solid ${isExpanded ? style.accent + "18" : "hsl(0 0% 100% / 0.5)"}`,
                boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.5)",
                transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onClick={() => setExpanded(isExpanded ? null : insight.id)}
            >
              {/* Iridescent top on expand */}
              {isExpanded && (
                <div
                  className="absolute top-0 left-0 right-0 h-[1.5px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${style.accent}25, hsl(260 50% 65% / 0.12), transparent)`,
                  }}
                />
              )}

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-[3px] rounded-full self-stretch mt-0.5 shrink-0 transition-all duration-400"
                    style={{
                      backgroundColor: style.accent,
                      opacity: isExpanded ? 1 : 0.5,
                      boxShadow: isExpanded ? `0 0 6px ${style.accent}30` : "none",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium leading-relaxed tracking-[-0.01em]" style={{ color: "hsl(210 8% 16%)" }}>
                      {insight.text}
                    </p>
                    <AnimatePresence>
                      {isExpanded && insight.detail && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <p className="text-[11px] leading-relaxed mt-2.5 pt-2.5" style={{ color: "hsl(210 8% 45%)", borderTop: `1px solid hsl(210 8% 90% / 0.5)` }}>
                            {insight.detail}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 shrink-0 mt-0.5 transition-transform duration-400", isExpanded && "rotate-90")}
                    style={{ color: "hsl(210 8% 65%)" }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
