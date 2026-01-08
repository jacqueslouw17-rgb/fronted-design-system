import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileSignature, FileText, ExternalLink, Info, Circle, FileCheck, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Candidate } from "@/hooks/useContractFlow";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SignatureWorkflowDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onComplete?: () => void;
  onSendForSignatures?: () => void;
}

type SigningStatus = 
  | "awaiting_admin" // Waiting for admin to sign
  | "sent_to_candidate" // Auto-sent to candidate after admin signed, awaiting signature
  | "candidate_signed"; // Candidate signed, ready for next steps

interface ContractItem {
  id: string;
  label: string;
  description: string;
  status: "complete" | "active" | "pending";
  timestamp?: string;
}

interface Document {
  name: string;
  type: string;
  included: boolean;
}

const getDocumentsForCandidate = (candidate: Candidate | null): Document[] => {
  if (!candidate) return [];
  const baseDocuments: Document[] = [{
    name: "NDA",
    type: "Company Policy",
    included: true
  }, {
    name: "Compliance Docs",
    type: "Auto-generated",
    included: true
  }];

  // Add country-specific documents
  if (candidate.countryCode === "PH") {
    baseDocuments.push({
      name: "Data Privacy Form",
      type: "Gov-required",
      included: true
    });
  }
  return baseDocuments;
};

// Helper functions for status labels and descriptions
const getStatusLabel = (status: SigningStatus): string => {
  switch (status) {
    case "awaiting_admin":
      return "Ready to Send";
    case "sent_to_candidate":
      return "Awaiting Candidate Signature";
    case "candidate_signed":
      return "Candidate Signed";
  }
};

const getStatusDescription = (status: SigningStatus, candidateName: string): string => {
  switch (status) {
    case "awaiting_admin":
      return `Ready to send to ${candidateName} for electronic signature.`;
    case "sent_to_candidate":
      return `Contract sent to ${candidateName}. Waiting for their signature.`;
    case "candidate_signed":
      return `${candidateName} has signed the contract. Ready for next steps.`;
  }
};

const getStatusBadge = (status: SigningStatus) => {
  switch (status) {
    case "awaiting_admin":
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">🔵 Ready</Badge>;
    case "sent_to_candidate":
      return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">🟡 Pending</Badge>;
    case "candidate_signed":
      return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">🟢 Signed</Badge>;
  }
};

export const SignatureWorkflowDrawer: React.FC<SignatureWorkflowDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSendForSignatures
}) => {
  const [signingStatus, setSigningStatus] = useState<SigningStatus>("awaiting_admin");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);
  const [hasSentToCandidate, setHasSentToCandidate] = useState(false);

  // Update documents when candidate changes
  useEffect(() => {
    if (candidate) {
      setDocuments(getDocumentsForCandidate(candidate));
      setSigningStatus("awaiting_admin");
      setHasSentToCandidate(false);

      // Initialize contract items - Admin signature is the first step (active/waiting)
      setContractItems([{
        id: "admin_signature",
        label: "Admin Signature",
        description: "Waiting for admin to sign the contract.",
        status: "active"
      }, {
        id: "send_to_candidate",
        label: "Send to Candidate",
        description: "Cannot send until admin signs the contract.",
        status: "pending"
      }, {
        id: "candidate_signed",
        label: "Candidate Signed",
        description: "Pending candidate signature.",
        status: "pending"
      }]);
    }
  }, [candidate]);

  // Handle admin signing - this automatically sends to candidate
  const handleAdminSign = () => {
    // First mark admin signature complete
    setContractItems(prev => prev.map(item => {
      if (item.id === "admin_signature") {
        return {
          ...item,
          status: "complete" as const,
          timestamp: new Date().toLocaleString(),
          description: "Admin has signed the contract."
        };
      }
      if (item.id === "send_to_candidate") {
        return {
          ...item,
          status: "complete" as const,
          timestamp: new Date().toLocaleString(),
          description: "Contract automatically sent to candidate after admin signature."
        };
      }
      if (item.id === "candidate_signed") {
        return {
          ...item,
          status: "active" as const,
          description: "Waiting for candidate to sign the contract."
        };
      }
      return item;
    }));
    
    setSigningStatus("sent_to_candidate");
    setHasSentToCandidate(true);
    toast.success(`Admin signed! Contract automatically sent to ${candidate?.name}.`);
  };

  // Handle resend to candidate
  const handleResendToCandidate = () => {
    toast.success(`Contract resent to ${candidate?.name}.`);
  };

  // Simulate candidate signing
  const handleSimulateCandidateSigned = () => {
    setSigningStatus("candidate_signed");
    setContractItems(prev => prev.map(item => {
      if (item.id === "candidate_signed") {
        return {
          ...item,
          status: "complete" as const,
          timestamp: new Date().toLocaleString(),
          description: "Candidate has signed the contract."
        };
      }
      return item;
    }));
    toast.success(`${candidate?.name} has signed the contract.`);

    // Move to onboarding column after brief delay
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.6
        }
      });
      toast.success("Contract signed! Moving candidate to Onboard Candidate column.");
      onComplete?.();
    }, 1000);
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const completed = contractItems.filter(item => item.status === "complete").length;
    return (completed / contractItems.length) * 100;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle>Contract Progress for {candidate?.name}</SheetTitle>
          {candidate && (
            <p className="text-sm text-muted-foreground">
              {candidate.role} · {candidate.country} · {candidate.salary}
            </p>
          )}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Track signing progress, document readiness, and certification status in one place.
            </p>
          </div>
        </SheetHeader>

        {candidate && (
          <div className="space-y-6 mt-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Signing Progress</span>
                <span className="font-semibold">{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-primary" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${getProgressPercentage()}%` }} 
                  transition={{ duration: 0.5 }} 
                />
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                <p className="text-lg font-semibold mt-1">{getStatusLabel(signingStatus)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getStatusDescription(signingStatus, candidate.name)}
                </p>
              </div>
              {getStatusBadge(signingStatus)}
            </div>

            <Separator />

            {/* Admin Signature Required Notice */}
            {signingStatus === "awaiting_admin" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Admin Signature Required</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The contract must be signed by an admin before it can be sent to the candidate for signature.
                  </p>
                </div>
              </div>
            )}

            {/* Contract Progress Tracker */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Signature Workflow</h3>
              
              <div className="space-y-2">
                {contractItems.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }} 
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border transition-all", 
                      item.status === "complete" && "bg-success/5 border-success/20", 
                      item.status === "active" && "bg-primary/5 border-primary/20", 
                      item.status === "pending" && "bg-muted/30 border-border opacity-60"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {item.status === "complete" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : item.status === "active" ? (
                        <Clock className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm", 
                        item.status === "complete" && "line-through opacity-60"
                      )}>
                        {item.label}
                      </p>
                      <p className={cn(
                        "text-xs text-muted-foreground mt-1", 
                        item.status === "complete" && "line-through opacity-50"
                      )}>
                        {item.description}
                      </p>
                      {item.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.timestamp}
                        </p>
                      )}
                    </div>
                    
                    {/* Admin signature button */}
                    {item.id === "admin_signature" && item.status === "active" && (
                      <Button size="sm" onClick={handleAdminSign} className="flex-shrink-0">
                        <FileSignature className="h-3 w-3 mr-1.5" />
                        Sign
                      </Button>
                    )}
                    
                    {/* Resend button after sent */}
                    {item.id === "send_to_candidate" && item.status === "complete" && (
                      <Button size="sm" variant="outline" onClick={handleResendToCandidate} className="flex-shrink-0">
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Resend
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2">
              {signingStatus === "sent_to_candidate" && (
                <Button variant="outline" size="sm" className="w-full" onClick={handleSimulateCandidateSigned}>
                  Simulate Candidate Signed
                </Button>
              )}

              {signingStatus === "candidate_signed" && (
                <motion.div 
                  initial={{ scale: 0.95 }} 
                  animate={{ scale: 1 }} 
                  className="p-4 rounded-lg bg-success/10 border border-success/20 text-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-success">Contract Signed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Candidate has completed signing. Moving to onboarding phase.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
