/**
 * Client Health / Portfolio Snapshot — refined editorial cards with visual hierarchy
 */
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthStatus = "on-track" | "attention" | "at-risk";

interface ClientSnapshot {
  id: string;
  name: string;
  status: HealthStatus;
  employees: number;
  contractors: number;
  openBlockers: number;
  pendingActions: number;
  payrollState: string;
  compliancePercent: number;
}

const CLIENTS: ClientSnapshot[] = [
  { id: "c1", name: "Acme Corp", status: "attention", employees: 8, contractors: 4, openBlockers: 2, pendingActions: 5, payrollState: "Pending approval", compliancePercent: 91 },
  { id: "c2", name: "Globex Inc", status: "on-track", employees: 6, contractors: 2, openBlockers: 0, pendingActions: 1, payrollState: "Ready to run", compliancePercent: 98 },
  { id: "c3", name: "Waystar Royco", status: "at-risk", employees: 3, contractors: 5, openBlockers: 3, pendingActions: 4, payrollState: "Blocked", compliancePercent: 82 },
  { id: "c4", name: "Initech", status: "on-track", employees: 4, contractors: 1, openBlockers: 0, pendingActions: 0, payrollState: "Complete", compliancePercent: 100 },
];

const statusConfig: Record<HealthStatus, { label: string; accent: string }> = {
  "on-track": { label: "On track", accent: "hsl(152 60% 42%)" },
  "attention": { label: "Needs attention", accent: "hsl(38 92% 50%)" },
  "at-risk": { label: "At risk", accent: "hsl(0 72% 51%)" },
};

export const F1v7_ClientHealth: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(210 8% 45%)" }}>
          Client health
        </h3>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(210 8% 85%) 0%, transparent 100%)' }} />
        <span className="text-[11px] font-medium" style={{ color: "hsl(210 8% 55%)" }}>
          {CLIENTS.length} clients
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CLIENTS.map((client, idx) => {
          const config = statusConfig[client.status];
          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="v7-glass-card group rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden"
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${config.accent}, transparent 80%)` }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[14px] font-semibold tracking-[-0.01em] block" style={{ color: "hsl(210 8% 12%)" }}>
                    {client.name}
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.05em] uppercase mt-1 block" style={{ color: config.accent }}>
                    {config.label}
                  </span>
                </div>
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                  style={{ backgroundColor: "hsl(210 8% 95%)" }}
                >
                  <ArrowRight className="h-3 w-3" style={{ color: "hsl(210 8% 40%)" }} />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: "hsl(210 8% 60%)" }}>Workers</span>
                  <span className="text-[15px] font-semibold" style={{ color: "hsl(210 8% 18%)" }}>
                    {client.employees + client.contractors}
                  </span>
                  <span className="text-[10px] ml-1" style={{ color: "hsl(210 8% 55%)" }}>
                    ({client.employees}e · {client.contractors}c)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: "hsl(210 8% 60%)" }}>Payroll</span>
                  <span className="text-[11px] font-medium" style={{ color: "hsl(210 8% 30%)" }}>{client.payrollState}</span>
                </div>
                {client.openBlockers > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: "hsl(210 8% 60%)" }}>Blockers</span>
                    <span className="text-[15px] font-semibold" style={{ color: "hsl(0 65% 48%)" }}>{client.openBlockers}</span>
                  </div>
                )}
                {client.pendingActions > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: "hsl(210 8% 60%)" }}>Pending</span>
                    <span className="text-[15px] font-semibold" style={{ color: "hsl(38 80% 42%)" }}>{client.pendingActions}</span>
                  </div>
                )}
              </div>

              {/* Compliance bar */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium shrink-0" style={{ color: "hsl(210 8% 55%)" }}>Compliance</span>
                <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "hsl(210 8% 92%)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${client.compliancePercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.07 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: client.compliancePercent >= 95 ? "hsl(152 60% 42%)" :
                        client.compliancePercent >= 85 ? "hsl(38 92% 50%)" : "hsl(0 72% 51%)",
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: "hsl(210 8% 40%)" }}>
                  {client.compliancePercent}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
