// Flow 6 v2 - Company Admin Dashboard - Batch Summary Card (Morphed from Overview)

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, X, Send, Users, Briefcase, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_InPlaceBatchStatus, CA_CurrencyTotal } from "./CA_InPlaceTypes";

interface CA_BatchSummaryCardProps {
  batchId: string;
  payoutDate: string;
  status: CA_InPlaceBatchStatus;
  employeeCount: number;
  contractorCount: number;
  currencyTotals: CA_CurrencyTotal[];
  sentAt?: string;
  onDelete: () => void;
  onClose: () => void;
}

export const CA_BatchSummaryCard: React.FC<CA_BatchSummaryCardProps> = ({
  batchId,
  payoutDate,
  status,
  employeeCount,
  contractorCount,
  currencyTotals,
  sentAt,
  onDelete,
  onClose
}) => {
  const getStatusLabel = () => {
    switch (status) {
      case "draft": return "Draft";
      case "in_review": return "In Review";
      case "client_approved": return "Approved";
      case "auto_approved": return "Auto-Approved";
      case "requires_changes": return "Requires Changes";
      default: return "Draft";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "in_review": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "client_approved": return "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30";
      case "auto_approved": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "requires_changes": return "bg-red-500/10 text-red-600 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border border-primary/20 shadow-sm bg-primary/[0.02] backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.05] to-secondary/[0.03] border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn("text-xs", getStatusColor())}>
              {getStatusLabel()}
            </Badge>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Payment Batch – {payoutDate}</h3>
              <p className="text-xs text-muted-foreground font-mono">ID: {batchId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sentAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                <Send className="h-3 w-3" />
                Sent at {sentAt}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Workers count */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{employeeCount} Employees</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">{contractorCount} Contractors</span>
            </div>
          </div>

          {/* Currency chips */}
          <div className="flex items-center gap-2">
            {currencyTotals.map((ct) => (
              <Badge key={ct.currency} variant="outline" className="text-xs font-mono">
                {ct.currency} {ct.netToPay.toLocaleString()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
