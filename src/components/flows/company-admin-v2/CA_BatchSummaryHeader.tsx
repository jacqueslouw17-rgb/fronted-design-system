import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, X, Clock, Settings, Check, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export type BatchStatus = "draft" | "in_review" | "client_approved" | "processing" | "paid";

interface CA_BatchSummaryHeaderProps {
  batchId: string;
  payoutDate: string;
  status: BatchStatus;
  employeeCount: number;
  contractorCount: number;
  currencies: { code: string; total: number }[];
  createdAt?: string;
  onDeleteBatch: () => void;
  onCloseBatch: () => void;
  onCountryRules: () => void;
}

export const CA_BatchSummaryHeader: React.FC<CA_BatchSummaryHeaderProps> = ({
  batchId,
  payoutDate,
  status,
  employeeCount,
  contractorCount,
  currencies,
  createdAt,
  onDeleteBatch,
  onCloseBatch,
  onCountryRules,
}) => {
  const getStatusLabel = () => {
    switch (status) {
      case "draft": return "Draft";
      case "in_review": return "In Review";
      case "client_approved": return "Approved";
      case "processing": return "Processing";
      case "paid": return "Paid";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "in_review": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "client_approved": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "processing": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "paid": return "bg-primary/10 text-primary border-primary/30";
    }
  };

  const formatCurrency = (amount: number, code: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", PHP: "₱", NOK: "kr", SGD: "S$"
    };
    return `${symbols[code] || code}${(amount / 1000).toFixed(1)}K`;
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between">
          {/* Left: Batch Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className={cn("text-xs", getStatusColor())}>
                {getStatusLabel()}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground">
                Payment Batch – {payoutDate}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono text-xs">ID: {batchId}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{employeeCount} EOR</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{contractorCount} COR</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                {currencies.map((c) => (
                  <Badge key={c.code} variant="outline" className="text-xs">
                    {formatCurrency(c.total, c.code)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={onCountryRules}
            >
              <Settings className="h-3.5 w-3.5" />
              Country Rules
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={onCloseBatch}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            
            {status === "draft" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-red-600 hover:bg-red-500/10"
                onClick={onDeleteBatch}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        {createdAt && (
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Created {createdAt}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
