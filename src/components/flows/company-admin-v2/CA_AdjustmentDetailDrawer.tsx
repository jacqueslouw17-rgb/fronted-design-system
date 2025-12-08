// Flow 6 v2 - Company Admin Dashboard - Adjustment Detail Drawer

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, FileText, Receipt, Check, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_PayAdjustment } from "./CA_InPlaceTypes";

interface CA_AdjustmentDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustment: CA_PayAdjustment | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const CA_AdjustmentDetailDrawer: React.FC<CA_AdjustmentDetailDrawerProps> = ({
  open,
  onOpenChange,
  adjustment,
  onApprove,
  onReject
}) => {
  if (!adjustment) return null;

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "overtime": return "Overtime";
      case "expense": return "Expense";
      case "bonus": return "Bonus";
      case "correction": return "Correction";
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-xs bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const prefix = amount >= 0 ? "+" : "";
    return `${prefix}${currency} ${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">Adjustment Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Worker Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(adjustment.workerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{adjustment.workerName}</p>
              <p className="text-sm text-muted-foreground">
                {adjustment.workerCountryFlag} {adjustment.workerCountry}
              </p>
            </div>
            <div className="ml-auto">
              {getStatusBadge(adjustment.status)}
            </div>
          </div>

          <Separator />

          {/* Adjustment Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-base font-medium text-foreground">{getTypeLabel(adjustment.type)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className={cn(
                  "text-xl font-bold",
                  adjustment.amount >= 0 ? "text-green-600" : "text-amber-600"
                )}>
                  {formatAmount(adjustment.amount, adjustment.currency)}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground">{adjustment.description}</p>
            </div>

            {/* Receipt */}
            {adjustment.hasReceipt && (
              <Card className="border border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Receipt Attached</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                  {/* Placeholder for receipt preview */}
                  <div className="mt-3 aspect-[4/3] rounded-lg bg-muted/50 border border-dashed border-border flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Receipt preview</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {adjustment.status === "pending" && (
          <SheetFooter className="mt-6 gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-red-600 border-red-500/30 hover:bg-red-500/10"
              onClick={() => onReject(adjustment.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              className="flex-1"
              onClick={() => onApprove(adjustment.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
