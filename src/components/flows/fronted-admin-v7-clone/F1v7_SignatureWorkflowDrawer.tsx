/**
 * Flow 1 — Fronted Admin Dashboard v5
 * Signature Workflow Drawer — Track signing progress
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileSignature, Circle, RotateCcw } from "lucide-react";
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
  | "awaiting_admin"
  | "sent_to_candidate"
  | "candidate_signed";

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

  if (candidate.countryCode === "PH") {
    baseDocuments.push({
      name: "Data Privacy Form",
      type: "Gov-required",
      included: true
    });
  }
  return baseDocuments;
};

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
      return <Badge variant="outline" className="text-xs font-medium bg-primary/8 text-primary border-primary/20">Ready</Badge>;
    case "sent_to_candidate":
      return <Badge variant="outline" className="text-xs font-medium bg-warning/8 text-warning border-warning/20">Pending</Badge>;
    case "candidate_signed":
      return <Badge variant="outline" className="text-xs font-medium bg-success/8 text-success border-success/20">Signed</Badge>;
  }
};

export const F1v4_SignatureWorkflowDrawer: React.FC<SignatureWorkflowDrawerProps> = ({
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

  useEffect(() => {
    if (candidate) {
      setDocuments(getDocumentsForCandidate(candidate));
      setSigningStatus("awaiting_admin");
      setHasSentToCandidate(false);

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

  const handleAdminSign = () => {
    setContractItems(prev => prev.map(item => {
      if (item.id === "admin_signature") {
        return { ...item, status: "complete" as const, timestamp: new Date().toLocaleString(), description: "Admin has signed the contract." };
      }
      if (item.id === "send_to_candidate") {
        return { ...item, status: "complete" as const, timestamp: new Date().toLocaleString(), description: "Contract automatically sent to candidate." };
      }
      if (item.id === "candidate_signed") {
        return { ...item, status: "active" as const, description: "Waiting for candidate to sign." };
      }
      return item;
    }));
    
    setSigningStatus("sent_to_candidate");
    setHasSentToCandidate(true);
    toast.success(`Admin signed! Contract sent to ${candidate?.name}.`);
  };

  const handleResendToCandidate = () => {
    toast.success(`Contract resent to ${candidate?.name}.`);
  };

  const handleSimulateCandidateSigned = () => {
    setSigningStatus("candidate_signed");
    setContractItems(prev => prev.map(item => {
      if (item.id === "candidate_signed") {
        return { ...item, status: "complete" as const, timestamp: new Date().toLocaleString(), description: "Candidate has signed the contract." };
      }
      return item;
    }));
    toast.success(`${candidate?.name} has signed the contract.`);

    setTimeout(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("Contract signed! Moving to Onboard Candidate.");
      onComplete?.();
    }, 1000);
  };

  const getProgressPercentage = () => {
    const completed = contractItems.filter(item => item.status === "complete").length;
    return (completed / contractItems.length) * 100;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[85%] sm:w-full sm:max-w-xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-border/30 shrink-0">
          <SheetDescription className="sr-only">Contract progress</SheetDescription>
          {candidate && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-semibold text-foreground leading-tight truncate">{candidate.name}</SheetTitle>
                <span className="text-base shrink-0">{candidate.flag}</span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{candidate.role} · {candidate.country}</p>
            </div>
          )}
        </SheetHeader>

        {candidate && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Signing Progress</span>
                <span className="text-xs font-medium text-foreground">{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary rounded-full" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${getProgressPercentage()}%` }} 
                  transition={{ duration: 0.5 }} 
                />
              </div>
            </div>

            {/* Current Status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">{getStatusLabel(signingStatus)}</p>
                <p className="text-xs text-muted-foreground">
                  {getStatusDescription(signingStatus, candidate.name)}
                </p>
              </div>
              {getStatusBadge(signingStatus)}
            </div>

            {/* Signature Workflow Steps */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workflow</h3>
              
              <div className="space-y-1.5">
                {contractItems.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -8 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.08 }} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-all", 
                      item.status === "complete" && "bg-success/5 border-success/15", 
                      item.status === "active" && "bg-primary/5 border-primary/15", 
                      item.status === "pending" && "bg-muted/20 border-border/40 opacity-50"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {item.status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : item.status === "active" ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium text-foreground", 
                        item.status === "complete" && "line-through text-muted-foreground"
                      )}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                      {item.timestamp && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {item.timestamp}
                        </p>
                      )}
                    </div>
                    
                    {item.id === "admin_signature" && item.status === "active" && (
                      <Button size="sm" onClick={handleAdminSign} className="flex-shrink-0 h-7 text-xs px-3">
                        <FileSignature className="h-3 w-3 mr-1.5" />
                        Sign
                      </Button>
                    )}
                    
                    {item.id === "send_to_candidate" && item.status === "complete" && (
                      <Button size="sm" variant="ghost" onClick={handleResendToCandidate} className="flex-shrink-0 h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {signingStatus === "sent_to_candidate" && (
              <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleSimulateCandidateSigned}>
                Simulate Candidate Signed
              </Button>
            )}

            {signingStatus === "candidate_signed" && (
              <motion.div 
                initial={{ scale: 0.97, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="p-4 rounded-xl bg-success/5 border border-success/15 text-center"
              >
                <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-1.5" />
                <p className="text-sm font-medium text-foreground">Contract Signed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Moving to onboarding phase.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};