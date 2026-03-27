/**
 * Shared – Worker Empty State: Payroll Tab
 * 
 * Shown when a worker arrives for the first time with no payroll history.
 * Used by both Flow 4.1 (Employee) and Flow 4.2 (Contractor).
 */

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Calendar, FileText } from "lucide-react";

export const WorkerEmptyPayroll = () => {
  return (
    <div className="space-y-4">
      {/* Payout tiles - empty */}
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last payout - empty */}
            <div className="p-4 sm:p-5 rounded-xl border border-border/30 bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-medium text-muted-foreground/80">Last payout</span>
              </div>
              <p className="text-lg font-medium text-muted-foreground/50">
                No payouts yet
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1.5">
                Your first payout will appear here after payroll runs
              </p>
            </div>

            {/* Next payout - empty */}
            <div className="p-4 sm:p-5 rounded-xl border border-border/30 bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-medium text-muted-foreground/80">Next payout</span>
              </div>
              <p className="text-lg font-medium text-muted-foreground/50">
                Pending setup
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1.5">
                Your pay schedule will be confirmed by your employer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslips - empty */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">Payslips</h2>
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-10 h-10 rounded-lg bg-muted/40 border border-border/30 flex items-center justify-center mb-3">
              <FileText className="h-4.5 w-4.5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground/60">
              No payslips available yet
            </p>
            <p className="text-xs text-muted-foreground/40 mt-1 max-w-[240px]">
              Payslips are generated after each pay cycle and will show up here automatically
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
