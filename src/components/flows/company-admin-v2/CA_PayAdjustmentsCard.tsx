import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, Check, X, ChevronRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayAdjustment {
  id: string;
  workerId: string;
  workerName: string;
  country: string;
  countryFlag: string;
  type: "Overtime" | "Expense" | "Bonus" | "Commission" | "Correction";
  amount: number;
  currency: string;
  description: string;
  hasReceipt: boolean;
  status: "pending" | "approved" | "rejected";
}

interface CA_PayAdjustmentsCardProps {
  adjustments: PayAdjustment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewAll: () => void;
}

export const CA_PayAdjustmentsCard: React.FC<CA_PayAdjustmentsCardProps> = ({
  adjustments,
  onApprove,
  onReject,
  onViewDetails,
  onViewAll,
}) => {
  const pendingCount = adjustments.filter(a => a.status === "pending").length;
  const displayAdjustments = adjustments.slice(0, 5);

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getTypeColor = (type: PayAdjustment["type"]) => {
    switch (type) {
      case "Overtime": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "Expense": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "Bonus": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "Commission": return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "Correction": return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", PHP: "₱", NOK: "kr", SGD: "S$"
    };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  if (pendingCount === 0) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pay adjustments</p>
              <p className="text-xs text-muted-foreground">All clear - no pending adjustments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="py-3 px-5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Pay adjustments</span>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              {pendingCount} pending
            </Badge>
          </div>
          <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={onViewAll}>
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {displayAdjustments.map((adjustment) => (
            <div 
              key={adjustment.id} 
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onViewDetails(adjustment.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(adjustment.workerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{adjustment.workerName}</span>
                    <span className="text-xs text-muted-foreground">{adjustment.countryFlag}</span>
                    {adjustment.hasReceipt && (
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getTypeColor(adjustment.type))}>
                      {adjustment.type}
                    </Badge>
                    <span className="font-medium text-foreground">
                      +{formatCurrency(adjustment.amount, adjustment.currency)}
                    </span>
                  </div>
                </div>
              </div>
              
              {adjustment.status === "pending" && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-green-600 hover:bg-green-500/10"
                    onClick={() => onApprove(adjustment.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-500/10"
                    onClick={() => onReject(adjustment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {adjustment.status !== "pending" && (
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  adjustment.status === "approved" && "bg-green-500/10 text-green-600 border-green-500/30",
                  adjustment.status === "rejected" && "bg-red-500/10 text-red-600 border-red-500/30"
                )}>
                  {adjustment.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
