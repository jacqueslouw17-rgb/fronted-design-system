import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileSignature, User } from "lucide-react";
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
    {
      id: "hr",
      role: "HR Manager",
      name: "Sarah Johnson",
      status: "pending",
    },
  ];
};

export const SignatureWorkflowDrawer: React.FC<SignatureWorkflowDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
}) => {
  const [steps, setSteps] = useState(getSignatureSteps(candidate));

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
        toast({
          title: "Contract finalized",
          description: "All signatures collected. Contract is now active.",
        });
      }, 1000);
    }
  };

  const getStatusIcon = (status: SignatureStep["status"]) => {
    switch (status) {
      case "signed":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "current":
        return <FileSignature className="h-5 w-5 text-primary" />;
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: SignatureStep["status"]) => {
    switch (status) {
      case "signed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">Signed</span>
          </div>
        );
      case "current":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
            <FileSignature className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Awaiting Signature</span>
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
          </div>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
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

            {/* Signature Steps */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Signature Progress</h4>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(step.status)}
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
                      {getStatusBadge(step.status)}
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
                {steps.filter(s => s.status === "signed").length} of {steps.length} signatures collected
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
