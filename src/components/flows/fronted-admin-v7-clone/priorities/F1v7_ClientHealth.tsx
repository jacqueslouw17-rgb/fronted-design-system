/**
 * Client Health / Portfolio Snapshot
 */
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Users, Briefcase } from "lucide-react";
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

const statusConfig: Record<HealthStatus, { label: string; icon: React.ElementType; dot: string; border: string }> = {
  "on-track": { label: "On track", icon: CheckCircle2, dot: "bg-green-500", border: "border-green-400/20" },
  "attention": { label: "Needs attention", icon: AlertCircle, dot: "bg-amber-500", border: "border-amber-400/20" },
  "at-risk": { label: "At risk", icon: AlertTriangle, dot: "bg-red-500", border: "border-red-400/25" },
};

export const F1v7_ClientHealth: React.FC = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "hsl(210 8% 15%)" }}>
        Client health
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CLIENTS.map((client, idx) => {
          const config = statusConfig[client.status];
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              whileHover={{ y: -1, transition: { duration: 0.15 } }}
              className={cn(
                "v7-glass-card rounded-2xl border p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow",
                config.border
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold" style={{ color: "hsl(210 8% 15%)" }}>{client.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                  <span className="text-[11px] font-medium text-muted-foreground">{config.label}</span>
                </div>
              </div>

              {/* Metrics row */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {client.employees} emp
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {client.contractors} ctr
                </span>
                {client.openBlockers > 0 && (
                  <span className="text-red-500 font-semibold">{client.openBlockers} blockers</span>
                )}
                {client.pendingActions > 0 && (
                  <span className="text-amber-600 font-semibold">{client.pendingActions} pending</span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{client.payrollState}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        client.compliancePercent >= 95 ? "bg-green-400" : client.compliancePercent >= 85 ? "bg-amber-400" : "bg-red-400"
                      )}
                      style={{ width: `${client.compliancePercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{client.compliancePercent}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
