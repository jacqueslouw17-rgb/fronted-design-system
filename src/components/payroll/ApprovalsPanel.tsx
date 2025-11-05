import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, Send, Bell } from "lucide-react";
import type { ApprovalEvent, PayrollBatch } from "@/types/payroll";

interface ApprovalsPanelProps {
  batch: PayrollBatch;
  onSendToCFO?: () => void;
  onRemind?: () => void;
  onWithdraw?: () => void;
  onApprove?: (note: string) => void;
  onDecline?: (note: string) => void;
}

export const ApprovalsPanel: React.FC<ApprovalsPanelProps> = ({
  batch,
  onSendToCFO,
  onRemind,
  onWithdraw,
  onApprove,
  onDecline,
}) => {
  const [note, setNote] = React.useState("");

  const lastApproval = batch.approvals[batch.approvals.length - 1];
  const isPending = batch.status === "AwaitingApproval";
  const isApproved = batch.status === "Approved";

  const getApprovalIcon = (action: ApprovalEvent["action"]) => {
    switch (action) {
      case "Approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "Declined":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Requested":
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getApprovalBadge = (action: ApprovalEvent["action"]) => {
    switch (action) {
      case "Approved":
        return <Badge variant="default">Approved</Badge>;
      case "Declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "Requested":
        return <Badge variant="outline">Requested</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Dual-Control Approval</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Admin prepares the batch, then CFO must approve before execution.
        </p>

        {batch.approvals.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No approval requests yet</p>
            {onSendToCFO && batch.status === "Draft" && (
              <Button onClick={onSendToCFO} className="mt-4">
                <Send className="h-4 w-4 mr-2" />
                Send to CFO for Approval
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-foreground">Current Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isPending && "Awaiting CFO approval"}
                  {isApproved && "Approved and ready for execution"}
                  {batch.status === "Draft" && "Draft - not yet submitted"}
                </p>
              </div>
              {lastApproval && getApprovalBadge(lastApproval.action)}
            </div>

            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Approval Timeline</h4>
              <div className="space-y-2">
                {batch.approvals.map((approval, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20"
                  >
                    {getApprovalIcon(approval.action)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{approval.role}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(approval.at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {approval.action} {approval.note && `- ${approval.note}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {isPending && (
        <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-foreground mb-3">CFO Actions</h4>
          <Textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-3">
            {onApprove && (
              <Button onClick={() => onApprove(note)} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {onDecline && (
              <Button onClick={() => onDecline(note)} variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            )}
          </div>
          <div className="flex gap-3 mt-3">
            {onRemind && (
              <Button onClick={onRemind} variant="outline" className="flex-1">
                <Bell className="h-4 w-4 mr-2" />
                Remind CFO
              </Button>
            )}
            {onWithdraw && (
              <Button onClick={onWithdraw} variant="outline" className="flex-1">
                Withdraw Request
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
