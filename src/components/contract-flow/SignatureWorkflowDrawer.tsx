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

interface SignatureWorkflowDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onComplete?: () => void;
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
  status: "drafted" | "not-sent" | "missing" | "ready";
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
}) => {
  const [steps, setSteps] = useState<SignatureStep[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [addDocDialogOpen, setAddDocDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Update steps and documents when candidate changes
  useEffect(() => {
    if (candidate) {
      setSteps(getSignatureSteps(candidate));
      setDocuments(getDocumentsForCandidate(candidate));
    }
  }, [candidate]);

  const handleAddDocument = (docName: string) => {
    setSelectedDoc(docName);
    setAddDocDialogOpen(true);
  };

  const handleUploadDocument = () => {
    toast({
      title: "Document uploaded",
      description: `${selectedDoc} has been added successfully.`,
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
  const hasDocIssues = documents.some(d => d.status === "missing");

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

              {hasDocIssues && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Some documents are missing or incomplete. Please resolve before sending.
                  </p>
                </div>
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
    </Sheet>
  );
};
