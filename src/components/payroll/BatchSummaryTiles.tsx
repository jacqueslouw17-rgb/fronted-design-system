import React from "react";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock, Shield, AlertTriangle } from "lucide-react";
import type { PayrollBatch } from "@/types/payroll";

interface BatchSummaryTilesProps {
  batch: PayrollBatch;
}

export const BatchSummaryTiles: React.FC<BatchSummaryTilesProps> = ({ batch }) => {
  const slaHealth = batch.status === "Completed" ? 100 : batch.status === "Executing" ? 75 : 90;
  const slaColor = slaHealth >= 90 ? "text-green-600" : slaHealth >= 70 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payees</p>
            <p className="text-2xl font-semibold text-foreground">{batch.payees.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gross</p>
            <p className="text-2xl font-semibold text-foreground">
              ${batch.totals.gross.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employer Costs</p>
            <p className="text-2xl font-semibold text-foreground">
              ${batch.totals.employerCosts.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">FX Fees</p>
            <p className="text-2xl font-semibold text-foreground">
              ${batch.totals.fxFees.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ETA</p>
            <p className="text-lg font-semibold text-foreground">
              {batch.payees[0]?.eta ? new Date(batch.payees[0].eta).toLocaleDateString() : "TBD"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">SLA Health</p>
            <p className={`text-2xl font-semibold ${slaColor}`}>{slaHealth}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
