// Flow 6 v2 - Company Admin Dashboard - Overview Card (matching reference design)

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Calendar, Globe, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CA_OverviewCardProps {
  payPeriod: string;
  countries: string;
  employeeCount: number;
  contractorCount: number;
  primaryCurrency: string;
  pendingAdjustments: number;
  pendingLeave: number;
  autoApproved: number;
  hasPendingItems: boolean;
  onCountryRules: () => void;
  onResolveItems: () => void;
  onCreateBatch: () => void;
}

export const CA_OverviewCard: React.FC<CA_OverviewCardProps> = ({
  payPeriod,
  countries,
  employeeCount,
  contractorCount,
  primaryCurrency,
  pendingAdjustments,
  pendingLeave,
  autoApproved,
  hasPendingItems,
  onCountryRules,
  onResolveItems,
  onCreateBatch
}) => {
  const totalPending = pendingAdjustments + pendingLeave;

  return (
    <Card className="border border-border/40 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">Payroll Overview</h3>
            <Badge 
              variant="outline" 
              className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30"
            >
              In Review
            </Badge>
          </div>
          
          {/* Counters on the right */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Adjustments</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium px-2.5",
                  pendingAdjustments > 0 
                    ? "bg-red-500/10 text-red-600 border-red-500/30" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {pendingAdjustments} pending
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Leave changes</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium px-2.5",
                  pendingLeave > 0 
                    ? "bg-red-500/10 text-red-600 border-red-500/30" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {pendingLeave} pending
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-approved</span>
              <Badge variant="outline" className="text-xs font-medium px-2.5 bg-muted text-muted-foreground">
                {autoApproved}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-6">
          {/* Left column */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pay Period</p>
              <p className="text-sm font-medium text-foreground">{payPeriod}</p>
            </div>
          </div>
          
          {/* Right column */}
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Primary Currency</p>
              <p className="text-sm font-medium text-foreground">{primaryCurrency}</p>
            </div>
          </div>
          
          {/* Left column */}
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Countries</p>
              <p className="text-sm font-medium text-foreground">{countries}</p>
            </div>
          </div>
          
          {/* Right column */}
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Workers Included</p>
              <p className="text-sm font-medium text-foreground">{employeeCount} Employees, {contractorCount} Contractors</p>
            </div>
          </div>
        </div>

        {/* Footer with CTAs */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <Button variant="outline" size="sm" className="h-9" onClick={onCountryRules}>
            <FileText className="h-4 w-4 mr-2" />
            Country Rules
          </Button>
          
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Approvals update totals below in real time.
            </p>
            {hasPendingItems && (
              <Button 
                size="sm" 
                className="h-9 bg-red-500 hover:bg-red-600 text-white"
                onClick={onResolveItems}
              >
                <Clock className="h-4 w-4 mr-2" />
                Resolve items ({totalPending})
              </Button>
            )}
            <Button 
              variant="outline"
              size="sm"
              className="h-9"
              onClick={onCreateBatch} 
              disabled={hasPendingItems}
            >
              <Clock className="h-4 w-4 mr-2" />
              Create Payment Batch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
