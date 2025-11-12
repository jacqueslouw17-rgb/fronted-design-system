import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileSignature, FileText, AlertTriangle, Upload, ExternalLink, CheckCheck, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate } from "@/hooks/useContractFlow";
import { SendForSigningConfirmation } from "./SendForSigningConfirmation";
import StandardProgress from "@/components/shared/StandardProgress";
import { Badge } from "@/components/ui/badge";

interface SignatureWorkflowDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onComplete?: () => void;
  onSendForSignatures?: () => void;
}

type ContractStage = 
  | "draft_review"           // Step 1: Reviewing draft and documents
  | "pending_candidate"      // Step 2: Waiting for candidate signature
  | "candidate_signed"       // Step 2: Candidate signed, admin can now sign
  | "fully_signed"           // Step 2: Both signed
  | "certified";             // Step 3: Contract certified

interface SignatureParty {
  id: string;
  role: string;
  name: string;
  status: "pending" | "signed";
  signedAt?: string;
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

export const SignatureWorkflowDrawer: React.FC<SignatureWorkflowDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSendForSignatures,
}) => {
  const [stage, setStage] = useState<ContractStage>("draft_review");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signatureParties, setSignatureParties] = useState<SignatureParty[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Update documents and signature parties when candidate changes
  useEffect(() => {
    if (candidate) {
      setDocuments(getDocumentsForCandidate(candidate));
      setSignatureParties([
        {
          id: "candidate",
          role: "Candidate",
          name: candidate.name,
          status: "pending",
        },
        {
          id: "admin",
          role: "Admin",
          name: "Joe User",
          status: "pending",
        },
      ]);
      setStage("draft_review");
    }
  }, [candidate]);

  const handleSendForSignatures = () => {
    setConfirmationOpen(true);
  };

  const handleConfirmSend = () => {
    setConfirmationOpen(false);
    setStage("pending_candidate");
    
    toast({
      title: "✓ Contract sent for signature",
      description: `Sent to ${candidate?.name}. Awaiting candidate signature.`,
    });
    onSendForSignatures?.();
  };

  const handleCandidateSigned = () => {
    setSignatureParties(prev => 
      prev.map(p => 
        p.id === "candidate" 
          ? { ...p, status: "signed" as const, signedAt: new Date().toLocaleString() }
          : p
      )
    );
    setStage("candidate_signed");
    
    toast({
      title: "Candidate signed",
      description: `${candidate?.name} has signed the contract.`,
    });
  };

  const handleAdminSign = () => {
    setSignatureParties(prev => 
      prev.map(p => 
        p.id === "admin" 
          ? { ...p, status: "signed" as const, signedAt: new Date().toLocaleString() }
          : p
      )
    );
    setStage("fully_signed");
    
    toast({
      title: "Contract fully signed",
      description: "All parties have signed. Ready for certification.",
    });
  };

  const handleCertify = () => {
    setStage("certified");
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast({
      title: "✓ Contract certified",
      description: "Fully signed and verified. Certified copy sent to candidate.",
    });
    
    onComplete?.();
  };

  // Calculate progress
  const getProgressStep = () => {
    switch (stage) {
      case "draft_review": return 1;
      case "pending_candidate": return 2;
      case "candidate_signed": return 2;
      case "fully_signed": return 2;
      case "certified": return 3;
      default: return 1;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle>Contract Progress for {candidate?.name}</SheetTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Contract Bundle
            </Button>
          </div>
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
            {/* Progress Tracker */}
            <div className="space-y-2">
              <StandardProgress
                currentStep={getProgressStep()}
                totalSteps={3}
                showLabel={true}
              />
            </div>

            <Separator />

            {/* Step 1: Contract Preparation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Step 1 — Contract Preparation</h3>
                {stage !== "draft_review" && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>

              {/* Draft Generated */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">Draft Generated</p>
                  <p className="text-xs text-muted-foreground">
                    The candidate's draft contract has been created.
                  </p>
                </div>
              </div>

              {/* Review Details */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm">Review Details</p>
                  <p className="text-xs text-muted-foreground">
                    Check all details before sending for signature.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    View Contract
                  </Button>
                </div>
              </div>

              {/* Attach Supporting Docs */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm">Attach Supporting Docs</p>
                  <div className="space-y-1.5">
                    {documents.map((doc) => (
                      <div key={doc.name} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-muted-foreground">{doc.name} included</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Send for Signatures Button */}
              {stage === "draft_review" && (
                <Button
                  className="w-full"
                  onClick={handleSendForSignatures}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Send for Signatures
                </Button>
              )}
            </motion.div>

            {stage !== "draft_review" && (
              <>
                <Separator />

                {/* Step 2: Signatures in Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Step 2 — Signatures in Progress</h3>
                    {stage === "fully_signed" && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                  </div>

                  {/* Signature Status */}
                  <div className="p-4 rounded-lg border bg-card space-y-3">
                    {stage === "pending_candidate" && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-warning flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">🟡 Pending Candidate</p>
                          <p className="text-xs text-muted-foreground">
                            Waiting for signature from {candidate?.name}.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCandidateSigned}
                        >
                          Simulate Sign
                        </Button>
                      </div>
                    )}

                    {stage === "candidate_signed" && (
                      <div className="flex items-center gap-3">
                        <FileSignature className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">🔵 Candidate Signed</p>
                          <p className="text-xs text-muted-foreground">
                            Candidate has signed via DocuSign.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleAdminSign}
                        >
                          Sign & Counter-Sign
                        </Button>
                      </div>
                    )}

                    {stage === "fully_signed" && (
                      <div className="flex items-center gap-3">
                        <CheckCheck className="h-5 w-5 text-success flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">🟢 Fully Signed</p>
                          <p className="text-xs text-muted-foreground">
                            All signatures collected and verified.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Signature Avatars */}
                    <div className="pt-2 space-y-2 border-t">
                      {signatureParties.map((party) => (
                        <div key={party.id} className="flex items-center gap-2 text-xs">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-primary">
                              {party.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{party.name}</span>
                          <span className="text-muted-foreground">—</span>
                          {party.status === "signed" ? (
                            <>
                              <Badge variant="secondary" className="h-5 text-[10px]">Signed</Badge>
                              <span className="text-muted-foreground">{party.signedAt}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Awaiting Signature</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {stage === "fully_signed" && (
                    <Button
                      className="w-full"
                      onClick={handleCertify}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Certify Contract
                    </Button>
                  )}
                </motion.div>
              </>
            )}

            {stage === "certified" && (
              <>
                <Separator />

                {/* Step 3: Certification & Completion */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Step 3 — Certification & Completion</h3>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-4 rounded-lg bg-success/10 border border-success/20 text-center space-y-3"
                  >
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                    <div>
                      <p className="font-medium text-success">Contract Certified</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fully signed and verified. The contract has been returned to the candidate.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Send Certified Copy to Candidate
                    </Button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>
        )}
      </SheetContent>

      {/* Send for Signing Confirmation */}
      <SendForSigningConfirmation
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        candidate={candidate}
        onConfirm={handleConfirmSend}
        onReview={() => {
          setConfirmationOpen(false);
        }}
      />
    </Sheet>
  );
};
