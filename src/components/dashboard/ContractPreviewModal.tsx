import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Check, X, FileText, Info, Sparkles, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ContractClause {
  id: string;
  text: string;
  verified: boolean;
  genieInsight?: string;
}

interface ContractPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractTitle: string;
  contractVersion?: string;
  country?: string;
  status: "draft" | "reviewing" | "approved" | "signed" | "rejected" | "expired";
  clauses?: ContractClause[];
  onApprove?: (comment?: string) => void;
  onReject?: (reason: string) => void;
  timestamp?: string;
  user?: string;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-500" },
  reviewing: { label: "Reviewing", color: "bg-blue-500" },
  approved: { label: "Approved", color: "bg-green-500" },
  signed: { label: "Signed", color: "bg-green-600" },
  rejected: { label: "Rejected", color: "bg-red-500" },
  expired: { label: "Expired", color: "bg-amber-500" },
};

export function ContractPreviewModal({
  open,
  onOpenChange,
  contractTitle,
  contractVersion = "v1.0",
  country,
  status,
  clauses = [],
  onApprove,
  onReject,
  timestamp,
  user,
}: ContractPreviewModalProps) {
  const [comment, setComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove?.(comment);
      toast({
        title: "Contract signed successfully",
        description: "Genie recorded audit entry.",
      });
      setComment("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve contract.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    setIsRejecting(true);
    try {
      await onReject?.(comment);
      toast({
        title: "Contract rejected",
        description: "The reason has been logged.",
      });
      setComment("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject contract.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const statusInfo = statusConfig[status];
  const isLocked = status === "signed" || status === "expired";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <DialogTitle className="text-xl">
                  {contractTitle} {contractVersion}
                  {country && <span className="text-muted-foreground"> ({country})</span>}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Review and sign contract document with compliance verification
                </DialogDescription>
                {timestamp && user && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {timestamp} • {user}
                  </p>
                )}
              </div>
            </div>
            <Badge className={cn("text-white", statusInfo.color)}>{statusInfo.label}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Main PDF/Document Viewer */}
          <div className="lg:col-span-2 min-h-0">
            <ScrollArea className="h-full border rounded-md bg-muted/20">
              <div className="p-6 space-y-4">
                <div className="bg-background p-6 rounded-md shadow-sm">
                  <h3 className="font-semibold text-lg mb-4">Employment Agreement</h3>
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p>
                      This Employment Agreement ("Agreement") is entered into between Fronted Global
                      Payroll AS ("Employer") and the individual identified below ("Employee").
                    </p>
                    <h4 className="font-semibold mt-4">1. Position and Duties</h4>
                    <p>
                      The Employee agrees to serve in the capacity of Senior Software Engineer,
                      reporting to the Engineering Manager. Duties include software development,
                      code reviews, and technical documentation.
                    </p>
                    <h4 className="font-semibold mt-4">2. Compensation</h4>
                    <p>
                      The Employee shall receive an annual salary of NOK 750,000, payable in monthly
                      installments. Payment shall be processed through Fronted's payroll system with
                      full tax compliance.
                    </p>
                    <h4 className="font-semibold mt-4">3. Working Hours</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help underline decoration-dotted">
                            Standard working hours are 37.5 hours per week, as regulated under
                            Norwegian Working Environment Act.
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Clause 3 verified under Norwegian working-hours law.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <h4 className="font-semibold mt-4">4. Benefits</h4>
                    <p>
                      The Employee shall be entitled to statutory benefits including pension,
                      insurance, and vacation days as per Norwegian labor regulations.
                    </p>
                    <h4 className="font-semibold mt-4">5. Confidentiality</h4>
                    <p>
                      The Employee agrees to maintain confidentiality of all proprietary information
                      and trade secrets during and after employment.
                    </p>
                    <h4 className="font-semibold mt-4">6. Termination</h4>
                    <p>
                      Either party may terminate this Agreement with 3 months' written notice. Early
                      termination requires mutual agreement or just cause as defined by law.
                    </p>
                    <div className="mt-8 pt-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Employer Signature</p>
                          <p className="h-16 border-b mt-2"></p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Employee Signature</p>
                          <p className="h-16 border-b mt-2"></p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Date: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar with Checklist & Genie Insights */}
          <div className="min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-card">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Genie Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-md text-sm">
                      <p className="text-muted-foreground">
                        All clauses verified for Norwegian compliance.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Clause 12 covers tax withholding — verified against current tax tables.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {clauses.length > 0 && (
                  <div className="border rounded-md p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-3">Compliance Checklist</h4>
                    <div className="space-y-2">
                      {clauses.map((clause) => (
                        <div key={clause.id} className="flex items-start gap-2 text-sm">
                          <Check
                            className={cn(
                              "h-4 w-4 mt-0.5 flex-shrink-0",
                              clause.verified ? "text-green-500" : "text-muted-foreground"
                            )}
                          />
                          <div>
                            <p>{clause.text}</p>
                            {clause.genieInsight && (
                              <p className="text-xs text-muted-foreground mt-1">{clause.genieInsight}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Textarea
              placeholder={
                isLocked ? "Document is locked" : "Add a comment or reason (optional)..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={isLocked}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleReject()}
              disabled={isRejecting || isApproving || isLocked}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={isApproving || isRejecting || isLocked}>
              <Check className="h-4 w-4 mr-2" />
              {status === "draft" || status === "reviewing" ? "Approve & Sign" : "Confirm"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
