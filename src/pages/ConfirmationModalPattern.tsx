import { useState } from "react";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, DollarSign, FileText, Shield, Info, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

type ModalState = "ready" | "warning" | "error" | "processing" | "success";

interface TimelineEvent {
  actor: string;
  action: string;
  timestamp: string;
}

interface ApprovalData {
  type: "payroll" | "contract" | "compliance";
  title: string;
  description: string;
  details: Array<{ label: string; value: string; tooltip?: string }>;
  status: ModalState;
  timeline?: TimelineEvent[];
  warningMessage?: string;
  errorMessage?: string;
}

const mockApprovals: ApprovalData[] = [
  {
    type: "payroll",
    title: "Approve Payroll Batch #37",
    description: "Process payment for 12 contractors across 4 countries",
    status: "ready",
    details: [
      { label: "Total Amount", value: "$24,120 USD", tooltip: "Includes all contractor payments and fees" },
      { label: "FX Rate", value: "1.28 USD/EUR", tooltip: "Includes 1.2% Wise processing fee" },
      { label: "Recipients", value: "12 contractors" },
      { label: "Countries", value: "PH, RO, NO, DE" },
      { label: "Payment Date", value: "Nov 15, 2025" },
    ],
    timeline: [
      { actor: "Genie", action: "Calculated payroll amounts", timestamp: "2 min ago" },
      { actor: "Sarah Kim", action: "Reviewed overtime adjustments", timestamp: "15 min ago" },
    ],
  },
  {
    type: "contract",
    title: "Sign Contract for Ioana Popescu",
    description: "PHP Developer - Full-time contractor agreement",
    status: "warning",
    warningMessage: "Tax documentation pending renewal in 45 days",
    details: [
      { label: "Contractor", value: "Ioana Popescu" },
      { label: "Role", value: "PHP Developer" },
      { label: "Country", value: "Romania 🇷🇴" },
      { label: "Start Date", value: "Nov 1, 2025" },
      { label: "Monthly Rate", value: "€2,840 EUR", tooltip: "Net amount after deductions" },
    ],
    timeline: [
      { actor: "Genie", action: "Generated contract v3", timestamp: "10 min ago" },
      { actor: "Howard Chen", action: "Reviewed terms", timestamp: "1 h ago" },
    ],
  },
  {
    type: "compliance",
    title: "Submit Compliance Documentation",
    description: "Tax ID renewal for Philippines contractor",
    status: "error",
    errorMessage: "Document expired on Oct 1, 2025. Please upload renewed version first.",
    details: [
      { label: "Contractor", value: "Jacques Morel" },
      { label: "Document Type", value: "PH Tax ID" },
      { label: "Expiry Date", value: "Dec 31, 2026" },
      { label: "Submission Deadline", value: "Nov 20, 2025" },
    ],
  },
];

const getStateIcon = (state: ModalState) => {
  switch (state) {
    case "ready": return CheckCircle2;
    case "warning": return AlertTriangle;
    case "error": return XCircle;
    case "processing": return Clock;
    case "success": return CheckCircle2;
  }
};

const getStateColor = (state: ModalState) => {
  switch (state) {
    case "ready": return "text-green-500";
    case "warning": return "text-amber-500";
    case "error": return "text-red-500";
    case "processing": return "text-blue-500";
    case "success": return "text-green-500";
  }
};

const getStateBadge = (state: ModalState): "default" | "destructive" | "secondary" => {
  switch (state) {
    case "ready": return "default";
    case "warning": return "secondary";
    case "error": return "destructive";
    case "processing": return "secondary";
    case "success": return "default";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "payroll": return DollarSign;
    case "contract": return FileText;
    case "compliance": return Shield;
    default: return FileText;
  }
};

const ConfirmationModalPattern = () => {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalData | null>(null);
  const [modalState, setModalState] = useState<ModalState>("ready");
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (approval: ApprovalData) => {
    setSelectedApproval(approval);
    setModalState(approval.status);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedApproval) return;

    setModalState("processing");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setModalState("success");
    setIsOpen(false);

    toast({
      title: "Action completed successfully",
      description: `${selectedApproval.title} has been processed.`,
    });

    // Reset after closing
    setTimeout(() => {
      setModalState("ready");
      setSelectedApproval(null);
    }, 300);
  };

  const handleCancel = () => {
    setIsOpen(false);
    toast({
      title: "Action canceled",
      description: "No changes were made.",
      variant: "default",
    });
    setTimeout(() => {
      setModalState("ready");
      setSelectedApproval(null);
    }, 300);
  };

  const StateIcon = selectedApproval ? getStateIcon(modalState) : CheckCircle2;
  const TypeIcon = selectedApproval ? getTypeIcon(selectedApproval.type) : FileText;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background relative">
        <div className="max-w-5xl mx-auto space-y-6 p-6">
          {/* Back Button */}
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </Link>

          {/* Header */}
          <header className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-2xl font-bold text-foreground">
              Confirmation Prompt + Smart Approval Modal
            </h1>
            <p className="text-muted-foreground mt-1">
              Clear summaries and confirmation prompts before critical actions — balancing speed with confidence
            </p>
          </header>

          {/* Trigger Examples */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockApprovals.map((approval, index) => {
              const Icon = getTypeIcon(approval.type);
              const statusColor = getStateColor(approval.status);
              
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => openModal(approval)}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant={getStateBadge(approval.status)} className="capitalize">
                        {approval.status}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base">{approval.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {approval.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Review & {approval.status === "ready" ? "Approve" : "View"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* States Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modal States</CardTitle>
              <CardDescription>
                Different states provide appropriate visual feedback and controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { state: "ready", label: "Ready", desc: "All checks passed" },
                  { state: "warning", label: "Warning", desc: "Action possible with caution" },
                  { state: "error", label: "Error", desc: "Cannot proceed" },
                  { state: "processing", label: "Processing", desc: "Action in progress" },
                  { state: "success", label: "Success", desc: "Completed successfully" },
                ].map((item) => {
                  const Icon = getStateIcon(item.state as ModalState);
                  return (
                    <div key={item.state} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Icon className={`h-5 w-5 shrink-0 ${getStateColor(item.state as ModalState)}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <TypeIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-xl">{selectedApproval?.title}</DialogTitle>
                    <Badge variant={getStateBadge(modalState)} className="capitalize shrink-0">
                      {modalState}
                    </Badge>
                  </div>
                  <DialogDescription>
                    {selectedApproval?.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Warning/Error Messages */}
              {(selectedApproval?.warningMessage || selectedApproval?.errorMessage) && (
                <div
                  className={`p-3 rounded-lg border ${
                    selectedApproval.errorMessage
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-amber-500/10 border-amber-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {selectedApproval.errorMessage ? (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">
                      {selectedApproval.errorMessage || selectedApproval.warningMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Action Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedApproval?.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{detail.label}</span>
                        {detail.tooltip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{detail.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="text-sm font-medium">{detail.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Timeline Preview */}
              {selectedApproval?.timeline && selectedApproval.timeline.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedApproval.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {event.actor === "Genie" ? "G" : event.actor.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">{event.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.actor} · {event.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={modalState === "processing"}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={modalState === "error" || modalState === "processing"}
              >
                {modalState === "processing" ? "Processing..." : "Confirm & Execute"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ConfirmationModalPattern;