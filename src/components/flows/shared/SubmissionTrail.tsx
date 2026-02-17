import React, { useState } from "react";
import { ChevronDown, ChevronRight, Clock, RotateCcw } from "lucide-react";
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

const formatCurrency = (amount: number, currency: string) => {
  const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
  return `${symbols[currency] || currency}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const SubmissionTrail: React.FC<SubmissionTrailProps> = ({
  currentSubmission,
  previousSubmission,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!previousSubmission) return null;

  const wasRejected = previousSubmission.status === "rejected";
  const amountChanged = previousSubmission.payload.amount !== currentSubmission.payload.amount;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 w-full py-1 rounded-md hover:bg-muted/30 transition-colors group cursor-pointer"
      >
        <RotateCcw className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        <span className="text-[10px] text-muted-foreground/70">
          Resubmitted
        </span>
        <span className="text-[10px] text-muted-foreground/40">·</span>
        <span className="text-[10px] text-muted-foreground/50">
          was {wasRejected ? "rejected" : "v" + (previousSubmission.versionNumber || 1)}
          {amountChanged && ` at ${formatCurrency(previousSubmission.payload.amount, previousSubmission.payload.currency)}`}
        </span>
        {isOpen ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground/40 shrink-0 ml-auto" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0 ml-auto" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1.5 rounded-md border border-border/30 bg-muted/15 px-2.5 py-2 space-y-1.5">
          {/* Previous amount & status */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs font-mono tabular-nums",
              wasRejected ? "text-muted-foreground/50 line-through" : "text-muted-foreground/70"
            )}>
              +{formatCurrency(previousSubmission.payload.amount, previousSubmission.payload.currency)}
            </span>
            {wasRejected ? (
              <span className="text-[10px] font-medium text-destructive/60">Rejected</span>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground/50">Superseded</span>
            )}
          </div>

          {/* Rejection reason */}
          {wasRejected && previousSubmission.decision?.reason && (
            <p className="text-[10px] text-destructive/50 leading-relaxed italic">
              "{previousSubmission.decision.reason}"
            </p>
          )}

          {/* Meta line */}
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/40">
            <Clock className="h-2.5 w-2.5" />
            <span>{previousSubmission.submittedAt}</span>
            <span>·</span>
            <span>{previousSubmission.submittedBy}</span>
            {previousSubmission.decision && (
              <>
                <span>·</span>
                <span>{wasRejected ? "by" : "reviewed by"} {previousSubmission.decision.decidedBy}</span>
              </>
            )}
          </div>

          {/* Attachments from previous */}
          {previousSubmission.attachments.length > 0 && (
            <AttachmentsList attachments={previousSubmission.attachments} compact />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
