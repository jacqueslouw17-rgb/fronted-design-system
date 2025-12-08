// Flow 6 v2 - Company Admin Dashboard - Batch Summary Sidebar (Local to this flow only)

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Users, Briefcase, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_BatchSummary, CA_BatchBlocker, CA_AuditEntry } from "./CA_BatchTypes";

interface CA_BatchSidebarProps {
  summaryByCurrency: CA_BatchSummary[];
  employeeCount: number;
  contractorCount: number;
  blockers: CA_BatchBlocker[];
  auditLog: CA_AuditEntry[];
  autoApproveLabel?: string;
  onBlockerClick?: (blockerId: string) => void;
}

export const CA_BatchSidebar: React.FC<CA_BatchSidebarProps> = ({
  summaryByCurrency,
  employeeCount,
  contractorCount,
  blockers,
  auditLog,
  autoApproveLabel,
  onBlockerClick
}) => {
  const totalWorkers = employeeCount + contractorCount;
  
  return (
    <div className="space-y-4 sticky top-0">
      {/* Batch Summary Card */}
      <Card className="border-border/20 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-foreground">Batch Summary</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Totals by Currency */}
          <div className="space-y-2">
            {summaryByCurrency.map(summary => (
              <div key={summary.currency} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{summary.currency}</span>
                  <Badge variant="outline" className="text-[10px]">{summary.workers} workers</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Adjustments</span>
                  <span className="text-right font-medium">{summary.adjustmentsTotal.toLocaleString()}</span>
                  <span className="text-muted-foreground">Employer cost</span>
                  <span className="text-right font-medium">{summary.employerCost.toLocaleString()}</span>
                  <span className="text-muted-foreground">Net to pay</span>
                  <span className="text-right font-semibold text-foreground">{summary.netToPay.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-border/30" />

          {/* Worker Counts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Employees</span>
              </div>
              <span className="font-semibold text-foreground">{employeeCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="text-muted-foreground">Contractors</span>
              </div>
              <span className="font-semibold text-foreground">{contractorCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-1 border-t border-border/30">
              <span className="text-muted-foreground">Total workers</span>
              <span className="font-bold text-foreground">{totalWorkers}</span>
            </div>
          </div>

          {/* Blockers */}
          {blockers.length > 0 && (
            <>
              <Separator className="bg-border/30" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-semibold">Blockers ({blockers.length})</span>
                </div>
                {blockers.map(blocker => (
                  <div 
                    key={blocker.id}
                    className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/15 transition-colors"
                    onClick={() => onBlockerClick?.(blocker.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{blocker.workerName}</span>
                      <ExternalLink className="h-3 w-3 text-destructive" />
                    </div>
                    <p className="text-[10px] text-destructive/80 mt-0.5">{blocker.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Auto-approve */}
          {autoApproveLabel && (
            <>
              <Separator className="bg-border/30" />
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs text-amber-600">{autoApproveLabel}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Audit Preview Card */}
      <Card className="border-border/20 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLog.slice(0, 3).map(entry => (
              <div key={entry.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{entry.action}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.user} · {entry.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
