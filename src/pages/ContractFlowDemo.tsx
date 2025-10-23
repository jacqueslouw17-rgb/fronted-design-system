import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { useContractFlow } from "@/hooks/useContractFlow";
import { ContractFlowNotification } from "@/components/contract-flow/ContractFlowNotification";
import { CandidateConfirmationScreen } from "@/components/contract-flow/CandidateConfirmationScreen";
import { DocumentBundleCarousel } from "@/components/contract-flow/DocumentBundleCarousel";
import { ContractDraftWorkspace } from "@/components/contract-flow/ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";
import { ContractSignaturePhase } from "@/components/contract-flow/ContractSignaturePhase";
import { ContractFlowSummary } from "@/components/contract-flow/ContractFlowSummary";
import { ComplianceTransitionNote } from "@/components/contract-flow/ComplianceTransitionNote";
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";

const ContractFlowDemo = () => {
  // const { speak } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const contractFlow = useContractFlow(version === "v3" || version === "v5" ? version : "v3");
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [promptText, setPromptText] = React.useState("");
  const [isTypingPrompt, setIsTypingPrompt] = React.useState(false);

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const idleMessage = version === "v5" 
    ? "I've prepared contract drafts for all three candidates based on your requirements."
    : "Hey Joe, looks like three shortlisted candidates are ready for contract drafting. Would you like me to prepare their drafts?";
  const idleWords = idleMessage.split(' ');

  const mockPrompt = "Generate contracts for Maria Santos, Oskar Nilsen, and Arta Krasniqi";
  
  useEffect(() => {
    if (contractFlow.phase === "prompt") {
      setIsTypingPrompt(false);
      setPromptText("");
      setCurrentWordIndex(0);
      
      // Start typing after a brief delay
      const startDelay = setTimeout(() => {
        setIsTypingPrompt(true);
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex < mockPrompt.length) {
            setPromptText(mockPrompt.substring(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 50);
      }, 300);
      
      return () => clearTimeout(startDelay);
    }
  }, [contractFlow.phase]);

  useEffect(() => {
    if (currentWordIndex < idleWords.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, idleWords.length]);

  // Auto-transition from initial landing to candidates view
  useEffect(() => {
    if (contractFlow.phase === "idle" && (version === "v3" || version === "v5")) {
      const timer = setTimeout(() => {
        // Show toast notification
        toast({
          title: "🎉 New hire detected",
          description: "Genie is preparing onboarding for your candidates...",
          duration: 3000,
        });
        
        // Transition to candidates view
        setTimeout(() => {
          contractFlow.startFlow();
        }, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [contractFlow.phase, version, toast]);

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
          version={version}
          onVersionChange={setVersion}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={toggleDrawer}
        />

        <main className="flex-1 flex overflow-hidden">
          {/* Dashboard Drawer */}
          <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Contract Flow Main Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.03] via-background to-secondary/[0.02]">
            <AnimatePresence mode="wait">
              {contractFlow.phase === "prompt" ? (
                <motion.div key="prompt" className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-2xl space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-foreground mb-2">Contract Flow Assistant</h2>
                      <p className="text-muted-foreground">What would you like me to help you with?</p>
                    </div>
                    <div className="relative">
                      <div className="border border-border rounded-lg bg-background p-4 shadow-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={promptText}
                            readOnly
                            placeholder="Type your request..."
                            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                          />
                          {promptText.length === mockPrompt.length && (
                            <Button 
                              onClick={() => contractFlow.startPromptFlow()}
                              className="whitespace-nowrap"
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : contractFlow.phase === "generating" ? (
                <motion.div key="generating" className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <AudioWaveVisualizer isActive={true} />
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <span className="animate-pulse">Preparing contracts</span>
                      <span className="flex gap-1">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : contractFlow.phase === "idle" || contractFlow.phase === "notification" ? (
                <motion.div key="notification" className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-3xl space-y-6">
                    <div className="text-center flex flex-col items-center space-y-4">
                      <AudioWaveVisualizer isActive={false} />
                      <h2 className="text-4xl font-bold text-foreground mt-6">Hi Joe, what would you like to know?</h2>
                      <p className="text-base text-muted-foreground">
                        Ask me anything or use voice input to get started
                      </p>
                    </div>

                    {/* Large chat input area */}
                    <div className="mt-8">
                      <div className="relative">
                        <textarea
                          placeholder="Type your message or click the mic to speak..."
                          rows={6}
                          className="w-full rounded-lg border border-border bg-background p-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                          disabled
                        />
                        <button
                          className="absolute bottom-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>

                      {/* Speak button */}
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" size="lg" className="gap-2" disabled>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          Speak
                        </Button>
                      </div>

                      {/* Helper text */}
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Press Enter to send • Shift+Enter for new line
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (contractFlow.phase === "offer-accepted" || contractFlow.phase === "data-collection") ? (
                <motion.div 
                  key="data-collection" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="p-8"
                >
                  <div className="max-w-7xl mx-auto space-y-6">
                    {/* AudioWaveVisualizer stays at top */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center"
                    >
                      <AudioWaveVisualizer isActive={false} />
                    </motion.div>

                    {/* Main heading */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center space-y-2"
                    >
                      <h1 className="text-3xl font-bold">
                        Great news — these candidates have accepted their offers!
                      </h1>
                      <p className="text-muted-foreground max-w-3xl mx-auto">
                        Let's finalize contracts and complete onboarding.
                      </p>
                    </motion.div>

                    {/* Genie Message Bubble */}
                     <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="mt-0.5">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm text-foreground/80">
                          Review the details below and send onboarding forms to collect any missing information. I'll validate everything and notify you when they're ready for contract generation.
                        </p>
                      </div>
                    </motion.div>

                    {/* Candidate Cards */}
                    <CandidateConfirmationScreen
                      candidates={contractFlow.selectedCandidates}
                      onProceed={() => contractFlow.prepareDrafts()}
                    />
                  </div>
                </motion.div>
              ) : contractFlow.phase === "contract-creation" ? (
                <motion.div key="contract-creation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ContractCreationScreen
                    candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]}
                    onNext={() => contractFlow.proceedToBundle()}
                  />
                </motion.div>
              ) : contractFlow.phase === "bundle-creation" ? (
                <motion.div key="bundle-creation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-4xl space-y-8">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-foreground">Contract Bundle</h1>
                      <p className="text-base text-muted-foreground">Select documents to include in the signing package</p>
                    </div>
                    {contractFlow.selectedCandidates.map((candidate) => (
                      <div key={candidate.id} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{candidate.flag}</span>
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">{candidate.name}</h2>
                            <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.country}</p>
                          </div>
                        </div>
                        <DocumentBundleCarousel
                          candidate={candidate}
                          onGenerateBundle={(docs) => {
                            toast({ title: `Bundle created with ${docs.length} documents` });
                            contractFlow.proceedFromBundle();
                          }}
                        />
                      </div>
                    ))}
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
                  <div className="w-full max-w-3xl space-y-8">
                    {/* Contract Flow Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <ContractFlowSummary 
                        candidates={contractFlow.selectedCandidates} 
                        onSendWelcomePacks={() => toast({ title: "📦 Welcome Packs Sent" })} 
                        onSyncLogs={() => toast({ title: "📋 Logs Synced" })} 
                        onOpenDashboard={() => toast({ title: "✅ Dashboard Updated" })} 
                      />
                    </motion.div>
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
