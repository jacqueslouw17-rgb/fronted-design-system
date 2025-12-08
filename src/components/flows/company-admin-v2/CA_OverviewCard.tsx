// Flow 6 v2 - Company Admin Dashboard - Overview Card (Pre-Batch) with Pending Counters

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Download, HelpCircle, Users, Briefcase, DollarSign, Calendar, TrendingUp, Receipt, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CA_OverviewCardProps {
  payPeriod: string;
  countries: string;
  employeeCount: number;
  contractorCount: number;
  primaryCurrency: string;
  salaryCost: number;
  frontedFees: number;
  totalPayrollCost: number;
  nextPayrollRun: string;
  status: "draft" | "in_progress" | "ready";
  pendingAdjustments: number;
  pendingLeave: number;
  autoApproved: number;
  hasPendingItems: boolean;
  onCountryRules: () => void;
  onDownloadSummary: () => void;
  onResolveItems: () => void;
  onCreateBatch: () => void;
  onKurtHelp: () => void;
}

export const CA_OverviewCard: React.FC<CA_OverviewCardProps> = ({
  payPeriod,
  countries,
  employeeCount,
  contractorCount,
  primaryCurrency,
  salaryCost,
  frontedFees,
  totalPayrollCost,
  nextPayrollRun,
  status,
  pendingAdjustments,
  pendingLeave,
  autoApproved,
  hasPendingItems,
  onCountryRules,
  onDownloadSummary,
  onResolveItems,
  onCreateBatch,
  onKurtHelp
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: primaryCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusLabel = () => {
    switch (status) {
      case "draft": return "Draft";
      case "in_progress": return "In Progress";
      case "ready": return "Ready";
      default: return "Draft";
    }
  };

  const totalPending = pendingAdjustments + pendingLeave;

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-secondary/[0.02] border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                status === "ready" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
                status === "in_progress" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
                status === "draft" && "bg-muted text-muted-foreground"
              )}
            >
              {getStatusLabel()}
            </Badge>
            <h3 className="text-lg font-semibold text-foreground">Payroll Overview</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Pending Counters */}
            <div className="flex items-center gap-3 mr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Adjustments:</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    pendingAdjustments > 0 
                      ? "bg-red-500/10 text-red-600 border-red-500/30" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {pendingAdjustments} pending
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Leave:</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    pendingLeave > 0 
                      ? "bg-red-500/10 text-red-600 border-red-500/30" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {pendingLeave} pending
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Auto-approved:</span>
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                  {autoApproved}
                </Badge>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCountryRules}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Country Rules</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownloadSummary}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Summary</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={onKurtHelp}>
              <HelpCircle className="h-3 w-3 mr-1" />
              Kurt can help...
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Period Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Pay Period</p>
                <p className="text-base font-semibold text-foreground">{payPeriod}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Countries</p>
                <p className="text-sm text-foreground">{countries}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Workers Included</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-sm font-medium">{employeeCount} Employees</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-sm font-medium">{contractorCount} Contractors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Salary Cost</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(salaryCost)}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Fronted Fees (Est.)</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(frontedFees)}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Payroll Cost</p>
              </div>
              <p className="text-lg font-bold text-primary">{formatCurrency(totalPayrollCost)}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Next Payroll Run</p>
              </div>
              <p className="text-lg font-bold text-foreground">{nextPayrollRun}</p>
            </div>
          </div>
        </div>

        {/* Footer with CTAs */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
          <div>
            {hasPendingItems && (
              <Button variant="default" onClick={onResolveItems}>
                <AlertCircle className="h-4 w-4 mr-1.5" />
                Resolve items ({totalPending})
              </Button>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    variant="outline"
                    onClick={onCreateBatch} 
                    disabled={hasPendingItems}
                    className="h-10 px-6"
                  >
                    Create payment batch
                  </Button>
                </div>
              </TooltipTrigger>
              {hasPendingItems && (
                <TooltipContent>
                  Resolve pending items first
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
