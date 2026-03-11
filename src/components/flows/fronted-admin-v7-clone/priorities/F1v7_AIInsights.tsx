/**
 * AI Operational Insights — intelligent system-generated observations
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

const categoryStyles: Record<string, string> = {
  pattern: "border-primary/20",
  risk: "border-amber-400/30",
  optimization: "border-green-400/30",
  anomaly: "border-red-400/20",
};

export const F1v7_AIInsights: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(210 8% 15%)" }}>
          AI insights
        </h3>
      </div>
      <div className="space-y-2">
        {INSIGHTS.map((insight, idx) => {
          const Icon = insight.icon;
          const isExpanded = expanded === insight.id;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className={cn(
                "v7-glass-card rounded-2xl border p-3.5 cursor-pointer transition-all hover:shadow-md",
                categoryStyles[insight.category]
              )}
              onClick={() => setExpanded(isExpanded ? null : insight.id)}
            >
              <div className="flex items-start gap-2.5">
                <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium leading-snug" style={{ color: "hsl(210 8% 15%)" }}>
                    {insight.text}
                  </p>
                  <AnimatePresence>
                    {isExpanded && insight.detail && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed"
                      >
                        {insight.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
