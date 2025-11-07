import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileSignature, User, FileText, AlertTriangle, File, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate } from "@/hooks/useContractFlow";
import { SendForSigningConfirmation } from "./SendForSigningConfirmation";

interface SignatureWorkflowDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onComplete?: () => void;
  onSendForSignatures?: () => void;
}

interface SignatureStep {
  id: string;
  role: string;
  name: string;
  status: "pending" | "signed" | "current";
  signedAt?: string;
}

interface Document {
  name: string;
  type: string;
  status: "drafted" | "not-sent" | "missing" | "ready" | "pending" | "sent" | "signed";
  action: string;
}

const getDocumentsForCandidate = (candidate: Candidate | null): Document[] => {
  if (!candidate) return [];

  const baseDocuments: Document[] = [
    {
      name: "Main Contract",
      type: `${candidate.countryCode} Contractor`,
      status: "drafted",
      action: "Review Document",
    },
  ];

  // Add country-specific documents
  if (candidate.countryCode === "PH") {
    baseDocuments.push(
      {
        name: "NDA",
        type: "Company Policy",
        status: "not-sent",
        action: "Include",
      },
      {
        name: "Data Privacy Form",
        type: "Gov-required",
        status: "missing",
        action: "Add",
      },
      {
        name: "Compliance Docs",
        type: "Auto-generated",
        status: "ready",
        action: "Preview",
      }
    );
  } else {
    baseDocuments.push(
      {
        name: "NDA",
        type: "Company Policy",
        status: "ready",
        action: "Include",
      },
      {
        name: "Compliance Docs",
        type: "Auto-generated",
        status: "ready",
        action: "Preview",
      }
    );
  }

  return baseDocuments;
};

const getSignatureSteps = (candidate: Candidate | null): SignatureStep[] => {
  if (!candidate) return [];

  return [
    {
      id: "candidate",
      role: "Candidate",
      name: candidate.name,
      status: "signed",
      signedAt: new Date().toLocaleString(),
    },
    {
      id: "admin",
      role: "Admin",
      name: "Joe User",
      status: "current",
    },
  ];
};

const getDocStatusBadge = (status: Document["status"]) => {
  switch (status) {
    case "drafted":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">Drafted</span>
        </div>
      );
    case "ready":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">Ready</span>
        </div>
      );
    case "sent":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
          <FileSignature className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Sent</span>
        </div>
      );
    case "pending":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/20">
          <Clock className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-warning">Awaiting Signature</span>
        </div>
      );
    case "signed":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">Signed</span>
        </div>
      );
    case "missing":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Missing</span>
        </div>
      );
    case "not-sent":
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Not Sent</span>
        </div>
      );
  }
};

export const SignatureWorkflowDrawer: React.FC<SignatureWorkflowDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSendForSignatures,
}) => {
  const [steps, setSteps] = useState<SignatureStep[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [addDocDialogOpen, setAddDocDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [justResolved, setJustResolved] = useState(false);
  const [resolvedDocName, setResolvedDocName] = useState<string>("");

  // Update steps and documents when candidate changes
  useEffect(() => {
    if (candidate) {
      setSteps(getSignatureSteps(candidate));
      setDocuments(getDocumentsForCandidate(candidate));
    }
  }, [candidate]);

  const handleIncludeDocument = (docName: string) => {
    // Update the document status from "not-sent" to "ready" immediately
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.name === docName && doc.status === "not-sent"
          ? { ...doc, status: "ready" as const, action: "Preview" }
          : doc
      )
    );

    setResolvedDocName(docName);
    setJustResolved(true);
    
    // Clear resolved state after animation
    setTimeout(() => {
      setJustResolved(false);
    }, 3000);

    toast({
      title: "Document included",
      description: `${docName} is ready to send.`,
    });
  };

  const handleAddDocument = (docName: string) => {
    setSelectedDoc(docName);
    setAddDocDialogOpen(true);
  };

  const handleSendForSignaturesClick = () => {
    // Open confirmation modal instead of sending immediately
    setConfirmationOpen(true);
  };

  const handleConfirmSend = () => {
    setConfirmationOpen(false);
    setIsSending(true);
    
    // Update all documents to "sent" status immediately
    setDocuments(prevDocs =>
      prevDocs.map(doc => ({
        ...doc,
        status: "sent" as const,
        action: "View Status"
      }))
    );
    
    setTimeout(() => {
      toast({
        title: "✓ Contract successfully sent for signature",
        description: `Sent to ${candidate?.name}. Waiting for candidate signature.`,
      });
      onSendForSignatures?.();
      setIsSending(false);
      
      // After 3 seconds, simulate documents moving to pending (waiting for signature)
      setTimeout(() => {
        setDocuments(prevDocs =>
          prevDocs.map(doc => ({
            ...doc,
            status: "pending" as const
          }))
        );
      }, 3000);
    }, 800);
  };

  const handleUploadDocument = () => {
    // Update the document status from "missing" to "ready" immediately
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.name === selectedDoc
          ? { ...doc, status: "ready" as const, action: "Preview" }
          : doc
      )
    );

    setResolvedDocName(selectedDoc || "");
    setJustResolved(true);
    
    // Clear resolved state after animation
    setTimeout(() => {
      setJustResolved(false);
    }, 3000);

    toast({
      title: "Document uploaded",
      description: `${selectedDoc} is ready to send.`,
    });
    setAddDocDialogOpen(false);
    setSelectedDoc(null);
  };

  const handleSign = (stepId: string) => {
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: "signed" as const,
            signedAt: new Date().toLocaleString(),
          };
        }
        // Move to next step
        if (step.status === "pending") {
          const prevStepIndex = prevSteps.findIndex(s => s.id === stepId);
          const currentIndex = prevSteps.findIndex(s => s.id === step.id);
          if (currentIndex === prevStepIndex + 1) {
            return { ...step, status: "current" as const };
          }
        }
        return step;
      })
    );

    toast({
      title: "Signature added",
      description: "Document signed successfully.",
    });

    // Check if all steps are signed
    const allSigned = steps.every(s => s.id === stepId || s.status === "signed");
    if (allSigned) {
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  };

  const signedCount = steps.filter(s => s.status === "signed").length;
  const totalCount = steps.length;
  const hasDocIssues = documents.some(d => d.status === "missing" || d.status === "not-sent");
  const hasSentDocs = documents.some(d => d.status === "sent");
  const hasPendingDocs = documents.some(d => d.status === "pending");
  const allDocumentsSigned = documents.every(d => d.status === "signed");
  const allDocumentsReady = documents.every(d => d.status === "drafted" || d.status === "ready");
  const canSend = !hasDocIssues && !isSending && !hasSentDocs && !hasPendingDocs;
  
  // Determine alert state
  const getAlertState = () => {
    if (allDocumentsSigned && signedCount === totalCount) {
      return {
        variant: "success" as const,
        message: "All parties have signed. Contract is fully executed.",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        textColor: "text-success"
      };
    }
    if (justResolved && allDocumentsReady) {
      return {
        variant: "success" as const,
        message: `${resolvedDocName} added. All documents are now ready to send for signature.`,
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        textColor: "text-success"
      };
    }
    if (hasSentDocs) {
      return {
        variant: "success" as const,
        message: "Documents sent successfully. Transitioning to pending status...",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        textColor: "text-success"
      };
    }
    if (hasPendingDocs) {
      return {
        variant: "warning" as const,
        message: "Documents sent. Waiting for candidate signatures before admin can sign.",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        textColor: "text-warning"
      };
    }
    if (hasDocIssues) {
      return {
        variant: "destructive" as const,
        message: "Some documents are missing or incomplete. Please resolve before sending.",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
        textColor: "text-destructive"
      };
    }
    return null;
  };
  
  const alertState = getAlertState();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Signature Workflow</SheetTitle>
        </SheetHeader>

        {candidate && (
          <div className="space-y-6 mt-6">
            {/* Candidate Header */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{candidate.flag}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {candidate.role} • {candidate.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Documents</h4>
                <span className="text-sm text-muted-foreground">{documents.length} documents</span>
              </div>

              {/* Documents Table */}
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
                  <div className="col-span-4">Document</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y">
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{doc.name}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-sm text-muted-foreground">{doc.type}</span>
                      </div>
                      <div className="col-span-3">{getDocStatusBadge(doc.status)}</div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            if (doc.action === "Add") {
                              handleAddDocument(doc.name);
                            } else if (doc.action === "Include") {
                              handleIncludeDocument(doc.name);
                            } else {
                              toast({
                                title: doc.action,
                                description: `${doc.action} ${doc.name}`,
                              });
                            }
                          }}
                        >
                          {doc.action}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {alertState && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg ${alertState.bgColor} border ${alertState.borderColor}`}
                >
                  <p className={`text-sm flex items-center gap-2 ${alertState.textColor}`}>
                    {alertState.variant === "destructive" && <AlertTriangle className="h-4 w-4" />}
                    {alertState.variant === "warning" && <Clock className="h-4 w-4" />}
                    {alertState.variant === "success" && <CheckCircle2 className="h-4 w-4" />}
                    {alertState.message}
                  </p>
                </motion.div>
              )}

              {/* Send for Signatures Button */}
              {!allDocumentsSigned && (
                <motion.div
                  animate={canSend && allDocumentsReady && !hasPendingDocs && !hasSentDocs ? {
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0)",
                      "0 0 0 4px rgba(139, 92, 246, 0.2)",
                      "0 0 0 0 rgba(139, 92, 246, 0)"
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: (canSend && allDocumentsReady && !hasPendingDocs && !hasSentDocs) ? Infinity : 0, repeatDelay: 1 }}
                >
                  <Button
                    className="w-full disabled:opacity-50"
                    disabled={!canSend}
                    onClick={handleSendForSignaturesClick}
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    {isSending ? "Sending..." : hasPendingDocs ? "Waiting for Candidate Signatures" : hasSentDocs ? "Processing..." : "Send for Signatures"}
                  </Button>
                </motion.div>
              )}
              
              {allDocumentsSigned && signedCount === totalCount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-success/10 border border-success/20 text-center"
                >
                  <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium text-success">
                    Contract Fully Executed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All parties have signed. Ready to proceed.
                  </p>
                </motion.div>
              )}
            </div>

            <Separator />

            {/* Signature Progress Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Signature Progress</h4>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {step.status === "signed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : step.status === "current" ? (
                        <FileSignature className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{step.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.role}</p>
                      {step.signedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Signed: {step.signedAt}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {step.status === "signed" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium text-success">Signed</span>
                        </div>
                      ) : step.status === "current" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                          <FileSignature className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Awaiting</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Pending</span>
                        </div>
                      )}
                    </div>
                    {step.status === "current" && (
                      <Button
                        size="sm"
                        onClick={() => handleSign(step.id)}
                        className="ml-2"
                      >
                        Sign Now
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground">
                {signedCount} of {totalCount} signatures collected
              </p>
            </div>
          </div>
        )}
      </SheetContent>

      {/* Add Document Dialog */}
      <Dialog open={addDocDialogOpen} onOpenChange={setAddDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedDoc}</DialogTitle>
            <DialogDescription>
              Upload the required document to complete the bundle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-upload">Document File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX (max 10MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDocDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboard Candidate Confirmation */}
      <SendForSigningConfirmation
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        candidate={candidate}
        onConfirm={handleConfirmSend}
        onReview={() => {
          setConfirmationOpen(false);
          // Keep drawer open for review
        }}
      />
    </Sheet>
  );
};
