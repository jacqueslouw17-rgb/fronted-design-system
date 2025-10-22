import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { useContractFlow } from "@/hooks/useContractFlow";
import { ContractFlowNotification } from "@/components/contract-flow/ContractFlowNotification";
import { ContractDraftWorkspace } from "@/components/contract-flow/ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";
import { ContractSignaturePhase } from "@/components/contract-flow/ContractSignaturePhase";
import { ContractFlowSummary } from "@/components/contract-flow/ContractFlowSummary";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";

const ContractFlowDemo = () => {
  // const { speak } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();
  const contractFlow = useContractFlow();
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const idleMessage = "Ask me anything or use voice input to get started";
  const idleWords = idleMessage.split(' ');

  useEffect(() => {
    if (contractFlow.phase === "idle" && currentWordIndex < idleWords.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, contractFlow.phase, idleWords.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      contractFlow.startFlow();
      setCurrentWordIndex(0); // Reset for notification phase
      // speak("Hey Joe, looks like three shortlisted candidates are ready for contract drafting.");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex w-full bg-background">
      {/* Left Sidebar */}
      <NavSidebar 
        onGenieToggle={() => {}}
        isGenieOpen={false}
        disabled={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar 
          userName={`${userData.firstName} ${userData.lastName}`}
          version="v3"
          onVersionChange={() => {}}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={toggleDrawer}
        />

        <main className="flex-1 flex overflow-hidden">
          {/* Dashboard Drawer */}
          <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Contract Flow Main Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.03] via-background to-secondary/[0.02]">
            <AnimatePresence mode="wait">
              {contractFlow.phase === "idle" || contractFlow.phase === "notification" ? (
                <motion.div key="notification" className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-2xl space-y-6">
                    <div className="text-center mb-8 flex flex-col items-center">
                      <AudioWaveVisualizer isActive={false} />
                      <h2 className="text-3xl font-bold text-foreground mt-6">Hi Joe, ready to finalize your hires?</h2>
                      <p className="text-muted-foreground mt-2">
                        {idleWords.map((word, index) => (
                          <span
                            key={index}
                            className={`transition-colors duration-150 ${
                              index < currentWordIndex
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {word}{index < idleWords.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </p>
                    </div>
                    {contractFlow.phase === "notification" && (
                      <ContractFlowNotification 
                        candidates={contractFlow.selectedCandidates} 
                        onPrepareDrafts={() => { 
                          contractFlow.prepareDrafts(); 
                          // speak("I've selected the localized contract templates."); 
                        }} 
                      />
                    )}
                  </div>
                </motion.div>
              ) : contractFlow.phase === "drafting" ? (
                <motion.div key="drafting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <ContractDraftWorkspace 
                    candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]} 
                    index={contractFlow.currentDraftIndex} 
                    total={contractFlow.selectedCandidates.length} 
                    onNext={() => { 
                      // if (contractFlow.currentDraftIndex === contractFlow.selectedCandidates.length - 1) speak("All drafts are ready."); 
                      contractFlow.nextDraft(); 
                    }}
                  />
                </motion.div>
              ) : contractFlow.phase === "reviewing" ? (
                <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <ContractReviewBoard 
                    candidates={contractFlow.selectedCandidates} 
                    onStartSigning={() => { 
                      contractFlow.startSigning(); 
                      // speak("Preparing for e-signature."); 
                    }}
                  />
                </motion.div>
              ) : contractFlow.phase === "signing" ? (
                <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <ContractSignaturePhase 
                    candidates={contractFlow.selectedCandidates} 
                    onComplete={() => { 
                      contractFlow.completeFlow(); 
                      // speak("All three contracts are finalized."); 
                    }}
                  />
                </motion.div>
              ) : contractFlow.phase === "complete" ? (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-3xl">
                    <ContractFlowSummary 
                      candidates={contractFlow.selectedCandidates} 
                      onSendWelcomePacks={() => toast({ title: "📦 Welcome Packs Sent" })} 
                      onSyncLogs={() => toast({ title: "📋 Logs Synced" })} 
                      onOpenDashboard={() => toast({ title: "✅ Dashboard Updated" })} 
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
    </RoleLensProvider>
  );
};

export default ContractFlowDemo;
