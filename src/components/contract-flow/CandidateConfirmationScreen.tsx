import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, FileText, Send } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { OnboardingFormDrawer } from "./OnboardingFormDrawer";
import { toast } from "sonner";

interface CandidateConfirmationScreenProps {
  candidates: Candidate[];
  onProceed: () => void;
}

interface CandidateData {
  id: string;
  dataComplete: boolean;
  missingFields: string[];
}

export const CandidateConfirmationScreen: React.FC<CandidateConfirmationScreenProps> = ({
  candidates,
  onProceed,
}) => {
  const [candidateDataStatus, setCandidateDataStatus] = useState<CandidateData[]>(
    candidates.map((c, idx) => ({
      id: c.id,
      dataComplete: idx === 0, // First candidate has complete data
      missingFields: idx === 0 ? [] : ["National ID", "Tax Residence", "Bank Details"],
    }))
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSendForm = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setDrawerOpen(true);
  };

  const handleFormComplete = (candidateId: string) => {
    setCandidateDataStatus((prev) => {
      const updated = prev.map((status) =>
        status.id === candidateId
          ? { ...status, dataComplete: true, missingFields: [] }
          : status
      );
      
      // Check if all data is now complete
      const allComplete = updated.every((status) => status.dataComplete);
      if (allComplete) {
        setTimeout(() => {
          toast.success("✅ All required information received from all candidates. Contract drafts are prefilled and ready for your review!", {
            duration: 5000,
          });
        }, 500);
      }
      
      return updated;
    });
    setDrawerOpen(false);
  };

  const allDataComplete = candidateDataStatus.every((status) => status.dataComplete);
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto space-y-6"
      >
        {/* Header message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl font-bold text-foreground">
            🎉 Great news — these candidates have accepted their offers!
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Are you ready to finalize the formalities, sign their contracts, and start onboarding?
          </p>
        </motion.div>

        {/* Genie message */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
          className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
        >
          <p className="text-sm text-foreground">
            Before we create their contracts, let's make sure we have all required personal details.
          </p>
        </motion.div>

        {/* Candidate cards */}
        <div className="space-y-4">
          {candidates.map((candidate, index) => {
            const dataStatus = candidateDataStatus.find((s) => s.id === candidate.id);
            const isComplete = dataStatus?.dataComplete || false;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.15, duration: 0.3 }}
              >
                <Card className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{candidate.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.role} • {candidate.country}
                          </p>
                        </div>
                        {isComplete ? (
                          <Badge variant="default" className="flex items-center gap-1 bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Data Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 border-warning text-warning">
                            <AlertCircle className="h-3 w-3" />
                            Missing Info
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Salary</p>
                          <p className="font-medium text-foreground">{candidate.salary}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Start Date</p>
                          <p className="font-medium text-foreground">{candidate.startDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Notice Period</p>
                          <p className="font-medium text-foreground">{candidate.noticePeriod}</p>
                        </div>
                      </div>

                      {!isComplete && dataStatus && (
                        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <p className="text-xs font-medium text-foreground mb-2">⚠️ Missing Details:</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {dataStatus.missingFields.map((field) => (
                              <Badge key={field} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Would you like me to send a secure onboarding form to the candidate to complete these details?
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {!isComplete ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSendForm(candidate.id)}
                              className="flex items-center gap-2"
                            >
                              <Send className="h-3 w-3" />
                              Send Form
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              Edit Manually
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            disabled
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Ready for Contract
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Compliance notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="rounded-lg border border-border bg-muted/30 p-4"
        >
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Data Protection</p>
              <p className="text-xs text-muted-foreground">
                All data collected under GDPR and local employment laws. Personal information is stored securely and shared only with authorized HR and payroll admins.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.3 }}
        >
          <Button
            onClick={onProceed}
            disabled={!allDataComplete}
            className="w-full"
            size="lg"
          >
            {allDataComplete
              ? "Generate Contracts"
              : "Waiting for candidate data..."}
          </Button>
        </motion.div>
      </motion.div>

      {/* Onboarding form drawer */}
      {selectedCandidate && (
        <OnboardingFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          candidate={selectedCandidate}
          onComplete={() => handleFormComplete(selectedCandidate.id)}
        />
      )}
    </>
  );
};
