// Flow 6 v2 - Company Admin Dashboard - Batch Review Header (Local to this flow only)

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Download, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_BatchStatus, CA_ExecutionMode } from "./CA_BatchTypes";

interface CA_BatchReviewHeaderProps {
  period: string;
  payoutDate: string;
  status: CA_BatchStatus;
  executionMode: CA_ExecutionMode;
  autoApproveTime?: string;
  clientReviewCount: number;
  hasBlockers: boolean;
  onApproveBatch: () => void;
  onRequestChanges: () => void;
  onExport: () => void;
  onCountryRules: () => void;
}

export const CA_BatchReviewHeader: React.FC<CA_BatchReviewHeaderProps> = ({
  period,
  payoutDate,
  status,
  executionMode,
  autoApproveTime,
  clientReviewCount,
  hasBlockers,
  onApproveBatch,
  onRequestChanges,
  onExport,
  onCountryRules
}) => {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!autoApproveTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(autoApproveTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [autoApproveTime]);

  const getStatusBadge = () => {
    switch (status) {
      case "client_approved":
        return (
          <Badge variant="outline" className="bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Client Approved
          </Badge>
        );
      case "auto_approved":
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-500/40">
            Auto-Approved
          </Badge>
        );
      case "requires_changes":
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/40">
            Requires Changes
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
            Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">
            Awaiting Approval
          </Badge>
        );
    }
  };

  const canApprove = clientReviewCount === 0 && !hasBlockers && status === "awaiting_approval";
  const approveLabel = executionMode === "client" ? "Approve & Execute" : "Approve Batch";

  return (
    <div className="space-y-4">
      {/* Title Row */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-foreground">Review payment batch</h2>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            {executionMode === "client" 
              ? "You can approve & execute bank files from here."
              : "Fronted will execute payments after you approve."
            }
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{payoutDate}</span>
          </div>
          {autoApproveTime && countdown && status === "awaiting_approval" && (
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Auto-approve in: {countdown}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={onCountryRules} className="h-8 gap-2">
            <FileText className="h-4 w-4" />
            Country Rules
          </Button>
        </div>
      </div>

      {/* Action Buttons - Sticky */}
      <div className="flex items-center justify-end gap-3 py-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onExport} className="h-9 gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={onRequestChanges} className="h-9 gap-2">
          <MessageSquare className="h-4 w-4" />
          Request Changes
        </Button>
        <Button 
          size="sm" 
          onClick={onApproveBatch} 
          disabled={!canApprove}
          className={cn(
            "h-9 gap-2",
            canApprove && "bg-accent-green-fill hover:bg-accent-green-fill/90 text-accent-green-text"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          {approveLabel}
        </Button>
      </div>
    </div>
  );
};
