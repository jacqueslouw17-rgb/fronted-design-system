import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileSignature, FileText, ExternalLink, Info, Circle, FileCheck } from "lucide-react";
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
  | "pending_candidate"      // Sent to candidate, awaiting signature
  | "candidate_signed"       // Candidate signed, admin must sign
  | "opening_docusign"       // Admin clicked sign, opening DocuSign
  | "admin_signing"          // Admin is signing
  | "fully_signed"           // Both signed
  | "certified";             // Certified and sent to candidate

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

  const baseDocuments: Document[] = [
    {
      name: "NDA",
      type: "Company Policy",
      included: true,
    },
    {
      name: "Compliance Docs",
      type: "Auto-generated",
      included: true,
    },
  ];

  // Add country-specific documents
  if (candidate.countryCode === "PH") {
    baseDocuments.push({
      name: "Data Privacy Form",
      type: "Gov-required",
      included: true,
    });
  }

  return baseDocuments;
};

// Helper functions for status labels and descriptions
const getStatusLabel = (status: SigningStatus): string => {
  switch (status) {
    case "pending_candidate":
      return "Awaiting Candidate Signature";
    case "candidate_signed":
      return "Ready for Admin Signature";
    case "opening_docusign":
      return "Opening DocuSign...";
    case "admin_signing":
      return "Admin Signing in Progress";
    case "fully_signed":
      return "Fully Signed";
    case "certified":
      return "Certified & Sent";
  }
};

const getStatusDescription = (status: SigningStatus, candidateName: string): string => {
  switch (status) {
    case "pending_candidate":
      return `Contract sent to ${candidateName}. Waiting for their signature via DocuSign.`;
    case "candidate_signed":
      return `${candidateName} has signed. Admin must now counter-sign to finalize.`;
    case "opening_docusign":
      return "Redirecting to DocuSign for admin signature...";
    case "admin_signing":
      return "Admin signature in progress via DocuSign.";
    case "fully_signed":
      return "Both parties have signed. Contract is fully executed.";
    case "certified":
      return "Contract certified and copy sent to candidate. Ready for onboarding.";
  }
};

const getStatusBadge = (status: SigningStatus) => {
  switch (status) {
    case "pending_candidate":
      return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">🟡 Pending</Badge>;
    case "candidate_signed":
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">🔵 Action Needed</Badge>;
    case "opening_docusign":
    case "admin_signing":
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">🔵 In Progress</Badge>;
    case "fully_signed":
      return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">🟢 Completed</Badge>;
    case "certified":
      return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">🟢 Certified</Badge>;
  }
};

export const SignatureWorkflowDrawer: React.FC<SignatureWorkflowDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSendForSignatures,
}) => {
  const [signingStatus, setSigningStatus] = useState<SigningStatus>("pending_candidate");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);

  // Update documents when candidate changes
  useEffect(() => {
    if (candidate) {
      setDocuments(getDocumentsForCandidate(candidate));
      setSigningStatus("pending_candidate");
      
      // Initialize contract items
      setContractItems([
        {
          id: "sent_to_candidate",
          label: "Contract Sent to Candidate",
          description: `Sent to ${candidate.name} for signature via DocuSign.`,
          status: "complete",
          timestamp: new Date().toLocaleString(),
        },
        {
          id: "candidate_signature",
          label: "Candidate Signature",
          description: `Waiting for ${candidate.name} to sign.`,
          status: "active",
        },
        {
          id: "admin_signature",
          label: "Admin Counter-Signature",
          description: "Admin must sign after candidate completes.",
          status: "pending",
        },
        {
          id: "certification",
          label: "Certification & Delivery",
          description: "Finalize and send certified copy to candidate.",
          status: "pending",
        },
      ]);
    }
  }, [candidate]);

  // Simulate candidate signing
  const handleSimulateCandidateSigned = () => {
    setSigningStatus("candidate_signed");
    setContractItems(prev => prev.map(item => {
      if (item.id === "candidate_signature") {
        return { ...item, status: "complete" as const, timestamp: new Date().toLocaleString() };
      }
      if (item.id === "admin_signature") {
        return { ...item, status: "active" as const };
      }
      return item;
    }));
    
    toast.success(`${candidate?.name} has signed the contract.`);
  };

  // Handle admin signing
  const handleAdminSign = () => {
    setSigningStatus("opening_docusign");
    
    toast.info("Opening DocuSign...");
    
    // Simulate DocuSign flow
    setTimeout(() => {
      setSigningStatus("admin_signing");
      
      setTimeout(() => {
        setSigningStatus("fully_signed");
        setContractItems(prev => prev.map(item => {
          if (item.id === "admin_signature") {
            return { ...item, status: "complete" as const, timestamp: new Date().toLocaleString() };
          }
          if (item.id === "certification") {
            return { ...item, status: "active" as const };
          }
          return item;
        }));
        
        toast.success("Admin signature completed. Contract is fully signed.");
      }, 1500);
    }, 1000);
  };

  // Handle certification
  const handleCertify = () => {
    setSigningStatus("certified");
    setContractItems(prev => prev.map(item => {
      if (item.id === "certification") {
        return { ...item, status: "complete" as const, timestamp: new Date().toLocaleString() };
      }
      return item;
    }));
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast.success("Contract certified and sent to candidate. Ready for onboarding!");
    
    onComplete?.();
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
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Supporting Documents */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Supporting Documents</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.name} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2">
              {signingStatus === "pending_candidate" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleSimulateCandidateSigned}
                >
                  Simulate Candidate Signed
                </Button>
              )}

              {signingStatus === "candidate_signed" && (
                <Button
                  className="w-full"
                  onClick={handleAdminSign}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Sign as Admin
                </Button>
              )}

              {signingStatus === "fully_signed" && (
                <Button
                  className="w-full"
                  onClick={handleCertify}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Certify & Send to Candidate
                </Button>
              )}

              {signingStatus === "certified" && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="p-4 rounded-lg bg-success/10 border border-success/20 text-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-success">Contract Certified</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready to move candidate to onboarding phase.
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
