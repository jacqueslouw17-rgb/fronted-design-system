import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CandidateOnboardingCard } from "@/components/contract-flow/CandidateOnboardingCard";
import { OnboardingFormDrawer } from "@/components/contract-flow/OnboardingFormDrawer";
import { SendFormModal } from "@/components/contract-flow/SendFormModal";
import { GenieValidation } from "@/components/contract-flow/GenieValidation";
import { useCandidateOnboarding } from "@/hooks/useCandidateOnboarding";

const CandidateDashboard = () => {
  const {
    candidates,
    selectedCandidate,
    isDrawerOpen,
    isSendModalOpen,
    validatingCandidateId,
    allCandidatesReady,
    openDrawer,
    closeDrawer,
    openSendModal,
    closeSendModal,
    sendForm,
    submitCandidateData,
  } = useCandidateOnboarding();

  const [showValidation, setShowValidation] = useState(false);
  const [validatingCandidate, setValidatingCandidate] = useState<any>(null);

  const handleSendFormConfirm = () => {
    if (!selectedCandidate) return;

    sendForm(selectedCandidate.id);
    closeSendModal();

    toast.success(
      `Form sent to ${selectedCandidate.name}. Awaiting completion.`,
      {
        duration: 5000,
        icon: "📧",
      }
    );

    // Simulate candidate submitting form after 3 seconds (for demo)
    setTimeout(() => {
      if (selectedCandidate) {
        handleCandidateSubmit(selectedCandidate.id);
      }
    }, 3000);
  };

  const handleCandidateSubmit = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    setValidatingCandidate(candidate);
    setShowValidation(true);
  };

  const handleValidationComplete = () => {
    setShowValidation(false);
    if (validatingCandidate) {
      submitCandidateData(validatingCandidate.id);

      toast.success(
        `✅ ${validatingCandidate.name} completed onboarding. Ready to generate contract!`,
        {
          duration: 5000,
        }
      );

      // Simulate ATS notification
      setTimeout(() => {
        toast.success("🔗 ATS notified of completed onboarding data.", {
          duration: 3000,
        });
      }, 1000);

      setValidatingCandidate(null);
    }
  };

  const handleGenerateContracts = () => {
    toast.success("Generating localized contracts for all candidates...", {
      duration: 3000,
      icon: "📝",
    });
    // Navigate to contract generation flow
    setTimeout(() => {
      window.location.href = "/flows/contract-flow";
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Candidate Onboarding Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage candidates from offer acceptance to contract-ready status.
          </p>
        </div>
        {allCandidatesReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              size="lg"
              onClick={handleGenerateContracts}
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Generate Contracts
            </Button>
          </motion.div>
        )}
      </div>

      {/* Genie Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
      >
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              Genie will handle the details
            </p>
            <p className="text-sm text-muted-foreground">
              Once candidates submit their forms, I'll validate all compliance
              requirements and notify your ATS automatically. No manual steps
              needed.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CandidateOnboardingCard
                candidate={candidate}
                onConfigure={() => openDrawer(candidate)}
                onSendForm={() => openSendModal(candidate)}
                isValidating={validatingCandidateId === candidate.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Drawers and Modals */}
      {selectedCandidate && (
        <OnboardingFormDrawer
          open={isDrawerOpen}
          onOpenChange={closeDrawer}
          candidate={{
            id: selectedCandidate.id,
            name: selectedCandidate.name,
            email: selectedCandidate.email,
            role: selectedCandidate.role,
            country: selectedCandidate.country,
            countryCode: selectedCandidate.country.slice(0, 2).toUpperCase(),
            flag: selectedCandidate.flag,
            salary: selectedCandidate.salary,
            startDate: selectedCandidate.startDate,
            status: selectedCandidate.status === "ready_for_contract" ? "Hired" : "Shortlisted",
            noticePeriod: "30 days",
            pto: "20 days",
            currency: selectedCandidate.salary.match(/[^\d\s,.]+/)?.[0] || "USD",
            signingPortal: "DocuSign",
          }}
          onComplete={() => {}}
          onSent={() => {
            toast.success("Form configuration saved.", { duration: 2000 });
          }}
        />
      )}

      <SendFormModal
        open={isSendModalOpen}
        onOpenChange={closeSendModal}
        candidate={selectedCandidate}
        onConfirm={handleSendFormConfirm}
      />

      {showValidation && validatingCandidate && (
        <GenieValidation
          candidate={validatingCandidate}
          onComplete={handleValidationComplete}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;
