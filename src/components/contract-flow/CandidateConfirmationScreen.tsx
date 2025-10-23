import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { OnboardingFormDrawer } from "./OnboardingFormDrawer";
import { CandidateOnboardingCard } from "./CandidateOnboardingCard";
import type { OnboardingCandidate, OnboardingStatus } from "@/hooks/useCandidateOnboarding";
import { toast } from "sonner";

interface CandidateConfirmationScreenProps {
  candidates: Candidate[];
  onProceed: () => void;
}

interface CandidateData {
  id: string;
  status: OnboardingStatus;
}

export const CandidateConfirmationScreen: React.FC<CandidateConfirmationScreenProps> = ({
  candidates,
  onProceed,
}) => {
  const [candidateDataStatus, setCandidateDataStatus] = useState<CandidateData[]>(
    candidates.map((c) => ({
      id: c.id,
      status: "waiting_for_candidate" as OnboardingStatus,
    }))
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [validatingCandidateId, setValidatingCandidateId] = useState<string | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Auto-start Maria Santos status progression on mount
  useEffect(() => {
    if (!hasAutoStarted && candidates.length > 0) {
      setHasAutoStarted(true);
      const mariaId = "1"; // Maria Santos
      
      // Start the automatic progression after a brief delay
      setTimeout(() => {
        handleSendForm(mariaId);
      }, 1000);
    }
  }, [hasAutoStarted, candidates.length]);

  // Convert Candidate to OnboardingCandidate format
  const getOnboardingCandidate = (candidate: Candidate): OnboardingCandidate => {
    const dataStatus = candidateDataStatus.find((s) => s.id === candidate.id);
    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      role: candidate.role,
      country: candidate.country,
      flag: candidate.flag,
      salary: candidate.salary,
      startDate: candidate.startDate || "TBD",
      status: dataStatus?.status || "not_sent",
    };
  };

  const handleConfigure = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setDrawerOpen(true);
  };

  const handleSendForm = (candidateId: string) => {
    // Special demo flow for Maria Santos (id "1") - auto-progress through statuses
    const isMaria = candidateId === "1";
    
    if (isMaria) {
      // Step 1: Form sent
      setCandidateDataStatus((prev) =>
        prev.map((status) =>
          status.id === candidateId
            ? { ...status, status: "awaiting_info" as OnboardingStatus }
            : status
        )
      );

      toast.success("Form sent to Maria Santos. Watch the status change...", {
        duration: 2000,
        icon: "📧",
      });

      // Step 2: Form viewed (after 2.5 seconds)
      setTimeout(() => {
        setCandidateDataStatus((prev) =>
          prev.map((status) =>
            status.id === candidateId
              ? { ...status, status: "awaiting_info" as OnboardingStatus }
              : status
          )
        );
        toast.info("Maria viewed the form", {
          duration: 2000,
          icon: "👀",
        });
      }, 2500);

      // Step 3: Data submitted - start validating (after 5 seconds)
      setTimeout(() => {
        setCandidateDataStatus((prev) =>
          prev.map((status) =>
            status.id === candidateId
              ? { ...status, status: "validating" as OnboardingStatus }
              : status
          )
        );
        setValidatingCandidateId(candidateId);
        toast.info("Maria submitted the form. Validating...", {
          duration: 2000,
          icon: "✍️",
        });
      }, 5000);

      // Step 4: Validation complete (after 7.5 seconds)
      setTimeout(() => {
        setCandidateDataStatus((prev) => {
          const updated = prev.map((status) =>
            status.id === candidateId
              ? { ...status, status: "ready_for_contract" as OnboardingStatus }
              : status
          );

          // Check if all complete
          const allComplete = updated.every((s) => s.status === "ready_for_contract");
          if (allComplete) {
            setTimeout(() => {
              toast.success(
                "✅ All required information received from all candidates. Contract drafts are prefilled and ready for your review!",
                { duration: 5000 }
              );
            }, 500);
          }

          return updated;
        });
        setValidatingCandidateId(null);
        toast.success("Maria's data validated successfully!", {
          duration: 2000,
          icon: "✅",
        });
      }, 7500);
    } else {
      // Regular flow for other candidates
      setCandidateDataStatus((prev) =>
        prev.map((status) =>
          status.id === candidateId
            ? { ...status, status: "awaiting_info" as OnboardingStatus }
            : status
        )
      );

      toast.success("Form sent to candidate. Awaiting completion.", {
        duration: 3000,
        icon: "📧",
      });

      // Simulate candidate submission after 3 seconds
      setTimeout(() => {
        handleCandidateSubmit(candidateId);
      }, 3000);
    }
  };

  const handleCandidateSubmit = (candidateId: string) => {
    // Set to validating
    setValidatingCandidateId(candidateId);
    setCandidateDataStatus((prev) =>
      prev.map((status) =>
        status.id === candidateId
          ? { ...status, status: "validating" as OnboardingStatus }
          : status
      )
    );

    // Simulate validation for 2 seconds
    setTimeout(() => {
      setCandidateDataStatus((prev) => {
        const updated = prev.map((status) =>
          status.id === candidateId
            ? { ...status, status: "ready_for_contract" as OnboardingStatus }
            : status
        );

        // Check if all complete
        const allComplete = updated.every((s) => s.status === "ready_for_contract");
        if (allComplete) {
          setTimeout(() => {
            toast.success(
              "✅ All required information received from all candidates. Contract drafts are prefilled and ready for your review!",
              { duration: 5000 }
            );
          }, 1000);
        }

        return updated;
      });
      setValidatingCandidateId(null);
    }, 2000);
  };

  const allDataComplete = candidateDataStatus.every((s) => s.status === "ready_for_contract");
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);
  const selectedCandidateStatus = candidateDataStatus.find((s) => s.id === selectedCandidateId)?.status;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-6"
      >

        {/* Candidate cards grid */}
        <div className={`grid gap-4 ${
          candidates.length === 2 
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {candidates.map((candidate, index) => {
            const onboardingCandidate = getOnboardingCandidate(candidate);
            
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                <CandidateOnboardingCard
                  candidate={onboardingCandidate}
                  onConfigure={() => handleConfigure(candidate.id)}
                  onSendForm={() => handleSendForm(candidate.id)}
                  isValidating={validatingCandidateId === candidate.id}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Generate Contracts button */}
        {allDataComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <Button
              onClick={onProceed}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Generate Contracts
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Onboarding form drawer */}
      {selectedCandidate && (
        <OnboardingFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          candidate={selectedCandidate}
          onComplete={() => {
            setDrawerOpen(false);
            toast.success("Form configuration saved.", { duration: 2000 });
          }}
          onSent={() => {
            handleSendForm(selectedCandidate.id);
            setDrawerOpen(false);
          }}
          isResend={
            selectedCandidateStatus === "awaiting_info"
          }
        />
      )}
    </>
  );
};
