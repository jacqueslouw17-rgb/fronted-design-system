// Flow 6 v2 - Company Admin Dashboard - Payroll Overview Card (Local to this flow only)

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, Settings, Calendar, Globe, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_Adjustment, CA_LeaveChange, CA_BlockingAlert } from "./CA_PayrollTypes";
import { CA_PayPeriodDropdown, PeriodType } from "./CA_PayPeriodDropdown";

interface CA_PayrollOverviewCardProps {
  payPeriod: string;
  primaryCurrency: string;
  countries: string;
  employeeCount: number;
  contractorCount: number;
  status: "draft" | "in_review" | "ready" | "completed";
  adjustments: CA_Adjustment[];
  leaveChanges: CA_LeaveChange[];
  autoApprovedCount: number;
  blockingAlerts: CA_BlockingAlert[];
  onResolveItems: () => void;
  onCreateBatch: () => void;
  onCountryRules: () => void;
  onPeriodChange: (period: PeriodType) => void;
  selectedPeriod: PeriodType;
  periods: {
    previous: { label: string };
    current: { label: string };
    next: { label: string };
  };
}
export const CA_PayrollOverviewCard: React.FC<CA_PayrollOverviewCardProps> = ({
  payPeriod,
  primaryCurrency,
  countries,
  employeeCount,
  contractorCount,
  status,
  adjustments,
  leaveChanges,
  autoApprovedCount,
  blockingAlerts,
  onResolveItems,
  onCreateBatch,
  onCountryRules,
  onPeriodChange,
  selectedPeriod,
  periods
}) => {
  const pendingAdjustments = adjustments.filter(a => a.status === "pending").length;
  const pendingLeave = leaveChanges.filter(l => l.status === "pending").length;
  const totalPending = pendingAdjustments + pendingLeave;
  const hasBlockers = blockingAlerts.length > 0;
  const canCreateBatch = totalPending === 0 && !hasBlockers;
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline">Completed</Badge>;
      case "ready":
        return <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">Ready to Execute</Badge>;
      case "in_review":
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-500/40">In Review</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/40">Draft</Badge>;
    }
  };
  return <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          {/* Left: Title and Status Badge */}
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Payroll Overview</h3>
            {getStatusBadge()}
          </div>

          {/* Right: Dropdown and Country Rules */}
          <div className="flex items-center gap-2">
            <CA_PayPeriodDropdown value={selectedPeriod} onValueChange={onPeriodChange} periods={periods} />
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={onCountryRules}>
              <Settings className="h-3.5 w-3.5" />
              Country Rules
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between mb-6">
          {/* Left: Key Facts */}
          <div className="space-y-4 flex-1">

            {/* Key Facts Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pay Period</p>
                  <p className="text-sm font-medium text-foreground">{payPeriod}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Primary Currency</p>
                  <p className="text-sm font-medium text-foreground">{primaryCurrency}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Countries</p>
                  <p className="text-sm font-medium text-foreground">{countries}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Workers Included</p>
                  <p className="text-sm font-medium text-foreground">
                    {employeeCount} Employees, {contractorCount} Contractors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status Pills */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-xs text-muted-foreground">Adjustments</span>
              <Badge variant={pendingAdjustments > 0 ? "destructive" : "secondary"} className={cn("text-[10px]", pendingAdjustments === 0 && "bg-accent-green-fill/20 text-accent-green-text")}>
                {pendingAdjustments > 0 ? `${pendingAdjustments} pending` : "All clear"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-xs text-muted-foreground">Leave changes</span>
              <Badge variant={pendingLeave > 0 ? "destructive" : "secondary"} className={cn("text-[10px]", pendingLeave === 0 && "bg-accent-green-fill/20 text-accent-green-text")}>
                {pendingLeave > 0 ? `${pendingLeave} pending` : "All clear"}
              </Badge>
            </div>
            {autoApprovedCount > 0 && <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-xs text-muted-foreground">Auto-approved</span>
                <Badge variant="outline" className="text-[10px] bg-muted/50">
                  {autoApprovedCount}
                </Badge>
              </div>}
          </div>
        </div>

        {/* Blocking Alerts */}
        {hasBlockers && <div className="mb-4 space-y-2">
            {blockingAlerts.map(alert => <div key={alert.id} className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-sm text-foreground flex-1">{alert.description}</span>
                <Badge variant="destructive" className="text-[10px]">Blocking</Badge>
              </div>)}
          </div>}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          {/* Admin-only helper text */}
          <p className="text-xs text-muted-foreground">
            Admin approvals only — no manager workflow yet.
          </p>
          
          <div className="flex items-center gap-3">
            {totalPending > 0 && <Button onClick={onResolveItems} className="h-9 gap-2">
                <Clock className="h-4 w-4" />
                Resolve items ({totalPending})
              </Button>}
            <Button variant={canCreateBatch ? "default" : "secondary"} onClick={onCreateBatch} disabled={!canCreateBatch} className={cn("h-9 gap-2", canCreateBatch && "bg-primary")}>
              {canCreateBatch ? <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Payment Batch
                </> : <>
                  <Clock className="h-4 w-4" />
                  Create Payment Batch
                </>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
};