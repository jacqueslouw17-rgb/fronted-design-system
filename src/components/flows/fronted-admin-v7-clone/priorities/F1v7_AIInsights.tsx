/**
 * AI Operational Insights — sophisticated, distinct Fronted intelligence layer
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

const categoryAccent: Record<string, string> = {
  pattern: "hsl(172 28% 42%)",
  risk: "hsl(38 92% 50%)",
  optimization: "hsl(152 60% 42%)",
  anomaly: "hsl(0 72% 51%)",
};

export const F1v7_AIInsights: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(172 28% 42%)" }} />
          <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(210 8% 45%)" }}>
            Insights
          </h3>
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(210 8% 85%) 0%, transparent 100%)' }} />
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "hsl(172 28% 42% / 0.08)", color: "hsl(172 28% 42%)" }}
        >
          AI
        </span>
      </div>

      <div className="space-y-2">
        {INSIGHTS.map((insight, idx) => {
          const Icon = insight.icon;
          const isExpanded = expanded === insight.id;
          const accent = categoryAccent[insight.category];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="v7-glass-card rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
              style={{ borderColor: isExpanded ? `${accent}25` : undefined }}
              onClick={() => setExpanded(isExpanded ? null : insight.id)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Accent line instead of icon background */}
                  <div className="w-[3px] rounded-full self-stretch mt-0.5 shrink-0" style={{ backgroundColor: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium leading-relaxed tracking-[-0.01em]" style={{ color: "hsl(210 8% 18%)" }}>
                      {insight.text}
                    </p>
                    <AnimatePresence>
                      {isExpanded && insight.detail && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <p className="text-[11.5px] leading-relaxed mt-2 pt-2" style={{ color: "hsl(210 8% 50%)", borderTop: '1px solid hsl(210 8% 92%)' }}>
                            {insight.detail}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 shrink-0 mt-0.5 transition-transform duration-300", isExpanded && "rotate-90")}
                    style={{ color: "hsl(210 8% 70%)" }}
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
