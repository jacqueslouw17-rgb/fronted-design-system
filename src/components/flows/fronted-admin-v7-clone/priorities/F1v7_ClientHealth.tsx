/**
 * Client Health — organic fluid cards with morphing status indicators
 * Each client is a living entity with health expressed through color and motion.
 */
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

const statusConfig: Record<HealthStatus, { label: string; accent: string; gradient: string }> = {
  "on-track": { label: "On track", accent: "hsl(152 60% 42%)", gradient: "linear-gradient(135deg, hsl(152 60% 42% / 0.06), hsl(172 40% 50% / 0.03))" },
  "attention": { label: "Needs attention", accent: "hsl(38 92% 50%)", gradient: "linear-gradient(135deg, hsl(38 92% 50% / 0.06), hsl(25 80% 55% / 0.03))" },
  "at-risk": { label: "At risk", accent: "hsl(0 72% 51%)", gradient: "linear-gradient(135deg, hsl(0 72% 51% / 0.05), hsl(340 60% 55% / 0.03))" },
};

export const F1v7_ClientHealth: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "hsl(210 8% 40%)" }}>
          Client health
        </h3>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(210 8% 80%), transparent)" }} />
        <span className="text-[10px] font-medium" style={{ color: "hsl(210 8% 55%)" }}>
          {CLIENTS.length} clients
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CLIENTS.map((client, idx) => {
          const config = statusConfig[client.status];
          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.25 } }}
              className="group relative overflow-hidden cursor-pointer"
              style={{
                background: config.gradient,
                backdropFilter: "blur(40px) saturate(1.4)",
                borderRadius: "22px",
                border: `1px solid ${config.accent}12`,
                boxShadow: `inset 0 1px 0 hsl(0 0% 100% / 0.6), 0 1px 3px hsl(0 0% 0% / 0.02)`,
                padding: "20px",
              }}
            >
              {/* Ambient health glow */}
              <motion.div
                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(circle, ${config.accent}10, transparent 70%)`,
                  filter: "blur(20px)",
                }}
              />

              {/* Top accent — iridescent edge */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${config.accent}40, hsl(260 50% 65% / 0.1), ${config.accent}10, transparent)` }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-3.5 relative z-10">
                <div>
                  <span className="text-[13.5px] font-semibold tracking-[-0.02em] block" style={{ color: "hsl(210 8% 10%)" }}>
                    {client.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: config.accent }}
                      animate={client.status === "at-risk" ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-semibold tracking-[0.04em] uppercase" style={{ color: config.accent }}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-xl"
                  style={{ backgroundColor: "hsl(210 8% 92% / 0.5)" }}
                >
                  <ArrowRight className="h-3 w-3" style={{ color: "hsl(210 8% 35%)" }} />
                </div>
              </div>

              {/* Stats — fluid grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3.5 relative z-10">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.12em] block" style={{ color: "hsl(210 8% 55%)" }}>Workers</span>
                  <span className="text-[16px] font-light" style={{ color: "hsl(210 8% 15%)" }}>
                    {client.employees + client.contractors}
                  </span>
                  <span className="text-[9.5px] ml-1" style={{ color: "hsl(210 8% 50%)" }}>
                    ({client.employees}e · {client.contractors}c)
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.12em] block" style={{ color: "hsl(210 8% 55%)" }}>Payroll</span>
                  <span className="text-[10.5px] font-medium" style={{ color: "hsl(210 8% 25%)" }}>{client.payrollState}</span>
                </div>
                {client.openBlockers > 0 && (
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.12em] block" style={{ color: "hsl(210 8% 55%)" }}>Blockers</span>
                    <span className="text-[16px] font-light" style={{ color: "hsl(0 65% 45%)" }}>{client.openBlockers}</span>
                  </div>
                )}
                {client.pendingActions > 0 && (
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.12em] block" style={{ color: "hsl(210 8% 55%)" }}>Pending</span>
                    <span className="text-[16px] font-light" style={{ color: "hsl(38 80% 40%)" }}>{client.pendingActions}</span>
                  </div>
                )}
              </div>

              {/* Compliance — fluid bar with glow */}
              <div className="flex items-center gap-3 relative z-10">
                <span className="text-[9px] font-medium uppercase tracking-[0.1em] shrink-0" style={{ color: "hsl(210 8% 50%)" }}>Compliance</span>
                <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: "hsl(210 8% 90% / 0.6)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${client.compliancePercent}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${
                        client.compliancePercent >= 95 ? "hsl(152 60% 42%)" :
                        client.compliancePercent >= 85 ? "hsl(38 92% 50%)" : "hsl(0 72% 51%)"
                      }, ${
                        client.compliancePercent >= 95 ? "hsl(152 60% 42% / 0.7)" :
                        client.compliancePercent >= 85 ? "hsl(38 92% 50% / 0.7)" : "hsl(0 72% 51% / 0.7)"
                      })`,
                      boxShadow: `0 0 8px ${
                        client.compliancePercent >= 95 ? "hsl(152 60% 42% / 0.25)" :
                        client.compliancePercent >= 85 ? "hsl(38 92% 50% / 0.25)" : "hsl(0 72% 51% / 0.25)"
                      }`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: "hsl(210 8% 35%)" }}>
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
