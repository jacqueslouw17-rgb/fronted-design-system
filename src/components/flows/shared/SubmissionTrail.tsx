import React, { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AttachmentsList, type AttachmentItem } from "./AttachmentsList";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface TrailSubmission {
  submissionId: string;
  threadId: string;
  versionNumber?: number;
  submittedAt: string;
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  decision?: {
    decidedAt: string;
    decidedBy: string;
    reason?: string;
  };
  payload: {
    amount: number;
    currency: string;
    label: string;
    type: string;
    dateRange?: string;
  };
  attachments: AttachmentItem[];
}

interface SubmissionTrailProps {
  currentSubmission: TrailSubmission;
  previousSubmission?: TrailSubmission;
  className?: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium bg-orange-500/10 text-orange-600 border-orange-500/20">
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium bg-destructive/10 text-destructive border-destructive/30">
          Rejected
        </Badge>
      );
    default:
      return null;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
  return `${symbols[currency] || currency}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SubmissionCard: React.FC<{
  submission: TrailSubmission;
  isCurrent: boolean;
  showDelta?: boolean;
  previousAmount?: number;
}> = ({ submission, isCurrent, showDelta, previousAmount }) => {
  const amountChanged = showDelta && previousAmount !== undefined && previousAmount !== submission.payload.amount;

  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2",
      isCurrent ? "border-border/50 bg-background" : "border-border/30 bg-muted/20"
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusBadge(submission.status)}
          {isCurrent && (
            <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Current</span>
          )}
          {!isCurrent && (
            <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Previous</span>
          )}
        </div>
        {amountChanged && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-medium bg-blue-500/10 text-blue-600 border-blue-500/20">
            Updated
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{submission.payload.label}</span>
          <span className={cn(
            "text-sm font-mono tabular-nums font-medium",
            submission.status === "rejected" ? "text-muted-foreground/60 line-through" : "text-foreground"
          )}>
            +{formatCurrency(submission.payload.amount, submission.payload.currency)}
          </span>
        </div>
        {submission.payload.dateRange && (
          <p className="text-[10px] text-muted-foreground/60">{submission.payload.dateRange}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <Clock className="h-2.5 w-2.5" />
        <span>{submission.submittedAt}</span>
        <span>·</span>
        <span>{submission.submittedBy}</span>
        {submission.attachments.length > 0 && (
          <>
            <span>·</span>
            <Paperclip className="h-2.5 w-2.5" />
            <span>{submission.attachments.length}</span>
          </>
        )}
      </div>

      {/* Rejection reason */}
      {submission.status === "rejected" && submission.decision?.reason && (
        <div className="rounded-md bg-destructive/5 border border-destructive/20 px-2.5 py-1.5">
          <p className="text-[10px] text-destructive/80">
            <span className="font-medium">Rejected:</span> {submission.decision.reason}
          </p>
          <p className="text-[9px] text-destructive/50 mt-0.5">
            {submission.decision.decidedAt} · {submission.decision.decidedBy}
          </p>
        </div>
      )}

      {/* Compact attachments */}
      {submission.attachments.length > 0 && (
        <AttachmentsList attachments={submission.attachments} compact />
      )}
    </div>
  );
};

export const SubmissionTrail: React.FC<SubmissionTrailProps> = ({
  currentSubmission,
  previousSubmission,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Hide trail if no previous submission
  if (!previousSubmission) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 w-full py-2 px-3 -mx-3 rounded-md hover:bg-muted/30 transition-colors group cursor-pointer"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
        )}
        <span className="text-xs font-medium text-muted-foreground">Submission trail</span>
        <span className="text-[10px] text-muted-foreground/50">(last 2)</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pt-1 pb-2">
          {/* Current (newest) first */}
          <SubmissionCard
            submission={currentSubmission}
            isCurrent
            showDelta
            previousAmount={previousSubmission.payload.amount}
          />
          {/* Previous */}
          <SubmissionCard
            submission={previousSubmission}
            isCurrent={false}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
