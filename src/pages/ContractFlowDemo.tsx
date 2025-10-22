import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { useContractFlow } from "@/hooks/useContractFlow";
import { ContractFlowNotification } from "@/components/contract-flow/ContractFlowNotification";
import { ContractDraftWorkspace } from "@/components/contract-flow/ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";
import { ContractSignaturePhase } from "@/components/contract-flow/ContractSignaturePhase";
import { ContractFlowSummary } from "@/components/contract-flow/ContractFlowSummary";
import { ActiveContractorsWidget } from "@/components/contract-flow/ActiveContractorsWidget";

const ContractFlowDemo = () => {
  const navigate = useNavigate();
  const { speak } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();
  const contractFlow = useContractFlow();
  const [showContractors, setShowContractors] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      contractFlow.startFlow();
      speak("Hey Joe, looks like three shortlisted candidates are ready for contract drafting.");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.03] via-background to-secondary/[0.02]">
      <div className="max-w-7xl mx-auto p-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {showContractors && (
          <div className="mb-6"><ActiveContractorsWidget contractors={contractFlow.selectedCandidates} /></div>
        )}

        <AnimatePresence mode="wait">
          {contractFlow.phase === "idle" || contractFlow.phase === "notification" ? (
            <motion.div key="notification" className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <div className="w-full max-w-2xl space-y-6">
                <div className="text-center mb-8">
                  <AudioWaveVisualizer isActive={false} />
                  <h2 className="text-3xl font-bold text-foreground mt-6">Hi Joe, ready to finalize your hires?</h2>
                </div>
                {contractFlow.phase === "notification" && (
                  <ContractFlowNotification candidates={contractFlow.selectedCandidates} onPrepareDrafts={() => { contractFlow.prepareDrafts(); speak("I've selected the localized contract templates."); }} />
                )}
              </div>
            </motion.div>
          ) : contractFlow.phase === "drafting" ? (
            <motion.div key="drafting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ContractDraftWorkspace candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]} index={contractFlow.currentDraftIndex} total={contractFlow.selectedCandidates.length} onNext={() => { if (contractFlow.currentDraftIndex === contractFlow.selectedCandidates.length - 1) speak("All drafts are ready."); contractFlow.nextDraft(); }} />
            </motion.div>
          ) : contractFlow.phase === "reviewing" ? (
            <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ContractReviewBoard candidates={contractFlow.selectedCandidates} onStartSigning={() => { contractFlow.startSigning(); speak("Preparing for e-signature."); }} />
            </motion.div>
          ) : contractFlow.phase === "signing" ? (
            <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ContractSignaturePhase candidates={contractFlow.selectedCandidates} onComplete={() => { contractFlow.completeFlow(); speak("All three contracts are finalized."); }} />
            </motion.div>
          ) : contractFlow.phase === "complete" ? (
            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <div className="w-full max-w-3xl">
                <ContractFlowSummary candidates={contractFlow.selectedCandidates} onSendWelcomePacks={() => toast({ title: "📦 Welcome Packs Sent" })} onSyncLogs={() => toast({ title: "📋 Logs Synced" })} onOpenDashboard={() => { setShowContractors(true); toast({ title: "✅ Dashboard Updated" }); }} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContractFlowDemo;
