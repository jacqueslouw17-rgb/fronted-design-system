import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot, Users, DollarSign, FileCheck, TrendingUp, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { DocumentBundleSignature } from "@/components/contract-flow/DocumentBundleSignature";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const ContractFlowDemo = () => {
  const { speak, currentWordIndex: ttsWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const contractFlow = useContractFlow(version === "v3" || version === "v5" ? version : "v3");
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [promptText, setPromptText] = React.useState("");
  const [isTypingPrompt, setIsTypingPrompt] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [hasSpokenPhase, setHasSpokenPhase] = React.useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // KPI Widgets data
  const widgets = [
    {
      title: "Total Contractors",
      value: contractFlow.selectedCandidates.length.toString(),
      trend: "+100%",
      icon: Users,
    },
    {
      title: "Monthly Payroll",
      value: "Pending",
      trend: "Starts after onboarding",
      icon: DollarSign,
    },
    {
      title: "Compliance Score",
      value: "100%",
      trend: "All certified",
      icon: FileCheck,
    },
    {
      title: "Active Contracts",
      value: contractFlow.selectedCandidates.length.toString(),
      trend: "+100%",
      icon: TrendingUp,
    },
    {
      title: "Pending Actions",
      value: "2",
      trend: "Send onboarding forms",
      icon: AlertCircle,
    },
    {
      title: "Avg Response Time",
      value: "N/A",
      trend: "No data yet",
      icon: Clock,
    },
  ];
  
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

  // Auto-speak for each phase (once per phase)
  useEffect(() => {
    const phaseKey = contractFlow.phase;
    if (!hasSpokenPhase[phaseKey]) {
      let message = "";
      
      if (phaseKey === "offer-accepted" || phaseKey === "data-collection") {
        message = "Let's finalize contracts and complete onboarding.";
      } else if (phaseKey === "bundle-creation") {
        message = "Select documents to include in the signing package";
      } else if (phaseKey === "drafting" && contractFlow.selectedCandidates[contractFlow.currentDraftIndex]) {
        const candidate = contractFlow.selectedCandidates[contractFlow.currentDraftIndex];
        message = `${candidate.name} ${candidate.role} ${candidate.country}`;
      }
      
      if (message) {
        const timer = setTimeout(() => {
          setIsSpeaking(true);
          speak(message, () => {
            setIsSpeaking(false);
          });
          setHasSpokenPhase(prev => ({ ...prev, [phaseKey]: true }));
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [contractFlow.phase, hasSpokenPhase, speak, contractFlow.currentDraftIndex, contractFlow.selectedCandidates]);

  useEffect(() => {
    if (currentWordIndex < idleWords.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, idleWords.length]);

  // Check for phase query param and transition
  useEffect(() => {
    const phaseParam = searchParams.get("phase");
    if (phaseParam === "bundle-creation") {
      contractFlow.goToBundleCreation();
      // Clear the query param
      navigate("/flows/contract-flow", { replace: true });
    }
  }, [searchParams, contractFlow, navigate]);

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
              ) : (contractFlow.phase === "offer-accepted" || contractFlow.phase === "data-collection") ? (
                <motion.div 
                  key="data-collection" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="flex-1 overflow-y-auto"
                >
                  <div className="max-w-7xl mx-auto p-8 space-y-8">
                    {/* Kurt Agent - Centered at Top */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <AudioWaveVisualizer 
                        isActive={!hasSpokenPhase["offer-accepted"]} 
                        isListening={true}
                        isDetectingVoice={isSpeaking}
                      />
                      <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">
                          Great news - two more candidates accepted their offers!
                        </h1>
                        <p className="text-foreground/60 relative max-w-2xl mx-auto">
                          {"Let's finalize contracts and complete onboarding.".split(' ').map((word, index) => (
                            <span
                              key={index}
                              className={`transition-colors duration-200 ${
                                isSpeaking && ttsWordIndex === index ? 'text-foreground/90 font-medium' : ''
                              }`}
                            >
                              {word}{" "}
                            </span>
                          ))}
                        </p>
                      </div>
                    </motion.div>

                    {/* Pipeline Tracking - Full Width */}
                    <div className="space-y-4">
                      <Tabs defaultValue="pipeline" className="w-full">
                        <TabsList className="grid w-64 mx-auto grid-cols-2 mb-6">
                          <TabsTrigger value="list">Metrics</TabsTrigger>
                          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
                        </TabsList>

                        <TabsContent value="list" className="space-y-6">
                          {/* KPI Metric Widgets Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                            {widgets.map((widget, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <Card className={`hover:shadow-lg transition-all h-full border-border/40 ${
                                  idx === 0 ? 'bg-primary/[0.03]' : 'bg-card'
                                }`}>
                                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{widget.title}</CardTitle>
                                    <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                                      <widget.icon className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{widget.value}</div>
                                    <p className="text-xs mt-1 text-muted-foreground">
                                      {widget.trend}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="pipeline">
                          <PipelineView 
                            contractors={[
                              ...contractFlow.selectedCandidates.map((candidate, index) => ({
                                id: candidate.id,
                                name: candidate.name,
                                country: candidate.country,
                                countryFlag: candidate.flag,
                                role: candidate.role,
                                salary: candidate.salary,
                                status: index === 0 ? "drafting" as const : "offer-accepted" as const,
                                formSent: index === 0,
                                dataReceived: index === 0,
                              })),
                              // Certified candidates
                              {
                                id: "cert-1",
                                name: "Emma Wilson",
                                country: "United Kingdom",
                                countryFlag: "🇬🇧",
                                role: "Senior Backend Developer",
                                salary: "£6,500/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-2",
                                name: "Luis Hernandez",
                                country: "Spain",
                                countryFlag: "🇪🇸",
                                role: "Product Manager",
                                salary: "€5,200/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-3",
                                name: "Yuki Tanaka",
                                country: "Japan",
                                countryFlag: "🇯🇵",
                                role: "UI/UX Designer",
                                salary: "¥650,000/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-4",
                                name: "Sophie Dubois",
                                country: "France",
                                countryFlag: "🇫🇷",
                                role: "Data Scientist",
                                salary: "€5,800/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-5",
                                name: "Ahmed Hassan",
                                country: "Egypt",
                                countryFlag: "🇪🇬",
                                role: "Mobile Developer",
                                salary: "EGP 45,000/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-6",
                                name: "Anna Kowalski",
                                country: "Poland",
                                countryFlag: "🇵🇱",
                                role: "QA Engineer",
                                salary: "PLN 15,000/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-7",
                                name: "Marcus Silva",
                                country: "Brazil",
                                countryFlag: "🇧🇷",
                                role: "Full Stack Developer",
                                salary: "R$ 18,000/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-8",
                                name: "Priya Sharma",
                                country: "India",
                                countryFlag: "🇮🇳",
                                role: "DevOps Engineer",
                                salary: "₹2,50,000/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-9",
                                name: "Lars Anderson",
                                country: "Sweden",
                                countryFlag: "🇸🇪",
                                role: "Security Engineer",
                                salary: "SEK 58,000/mo",
                                status: "certified" as const,
                              },
                              {
                                id: "cert-10",
                                name: "Isabella Costa",
                                country: "Portugal",
                                countryFlag: "🇵🇹",
                                role: "Content Strategist",
                                salary: "€3,200/mo",
                                status: "certified" as const,
                              },
                            ]}
                            onDraftContract={(ids) => {
                              // Navigate to dedicated contract creation page with selected ids
                              const params = new URLSearchParams({ ids: ids.join(',') }).toString();
                              navigate(`/flows/contract-creation?${params}`);
                            }}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </motion.div>
              ) : contractFlow.phase === "contract-creation" ? (
                <motion.div key={`contract-creation-${contractFlow.currentDraftIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ContractCreationScreen
                    candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]}
                    currentIndex={contractFlow.currentDraftIndex}
                    totalCandidates={contractFlow.selectedCandidates.length}
                    onNext={() => contractFlow.proceedToBundle()}
                  />
                </motion.div>
              ) : contractFlow.phase === "bundle-creation" ? (
                <motion.div key="bundle-creation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full">
                  {/* Back Button - Consistent positioning */}
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        // Navigate back to contract creation
                        const ids = contractFlow.selectedCandidates.map(c => c.id).join(',');
                        navigate(`/flows/contract-creation?ids=${ids}`);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-4xl space-y-8">
                      {/* Audio Wave Visualizer - Centered */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <AudioWaveVisualizer 
                          isActive={!hasSpokenPhase["bundle-creation"]} 
                          isListening={true}
                          isDetectingVoice={isSpeaking}
                        />
                      </motion.div>

                      {/* Header - Centered */}
                      <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">Contract Bundle</h1>
                        <p className="text-base text-muted-foreground">
                          {"Select documents to include in the signing package".split(' ').map((word, index) => (
                            <span
                              key={index}
                              className={`transition-colors duration-200 ${
                                isSpeaking && ttsWordIndex === index ? 'text-foreground/90 font-medium' : ''
                              }`}
                            >
                              {word}{" "}
                            </span>
                          ))}
                        </p>
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
                            // Just store selection, don't proceed yet
                          }}
                          hideButton={true}
                        />
                      </div>
                    ))}
                    {/* Single Generate button for all candidates */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4"
                    >
                      <Button 
                        onClick={() => {
                          toast({ title: "Signing packs generated for all candidates" });
                          contractFlow.proceedFromBundle();
                        }}
                        size="lg"
                        className="w-full"
                      >
                        <FileCheck className="mr-2 h-5 w-5" />
                        Generate Signing Packs
                      </Button>
                    </motion.div>
                  </div>
                </div>
                </motion.div>
              ) : contractFlow.phase === "drafting" ? (
                <motion.div key="drafting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full">
                  {/* Back Button - Consistent positioning */}
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        // Navigate back to bundle creation
                        navigate("/flows/contract-flow?phase=bundle-creation");
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col items-center p-8">
                    <div className="w-full max-w-7xl space-y-8">
                      {/* Audio Wave Visualizer - Centered */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <AudioWaveVisualizer 
                          isActive={!hasSpokenPhase["drafting"]} 
                          isListening={true}
                          isDetectingVoice={isSpeaking}
                        />
                      </motion.div>

                      {/* Header - Centered */}
                      <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">Preparing signing packs</h1>
                        <p className="text-base text-muted-foreground">
                          {`${contractFlow.selectedCandidates[contractFlow.currentDraftIndex]?.name} • ${contractFlow.selectedCandidates[contractFlow.currentDraftIndex]?.role} • ${contractFlow.selectedCandidates[contractFlow.currentDraftIndex]?.country}`.split(' ').map((word, index) => (
                            <span
                              key={index}
                              className={`transition-colors duration-200 ${
                                isSpeaking && ttsWordIndex === index ? 'text-foreground/90 font-medium' : ''
                              }`}
                            >
                              {word}{" "}
                            </span>
                          ))}
                        </p>
                      </div>

                      {/* Contract Workspace */}
                      <ContractDraftWorkspace 
                        candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]} 
                        index={contractFlow.currentDraftIndex} 
                        total={contractFlow.selectedCandidates.length} 
                        onNext={() => { 
                          contractFlow.nextDraft(); 
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : contractFlow.phase === "reviewing" ? (
                <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <ContractReviewBoard 
                    candidates={contractFlow.selectedCandidates} 
                    onBack={() => {
                      contractFlow.backToDrafting();
                    }}
                    onStartSigning={() => { 
                      // Move candidates to awaiting signature and return to pipeline
                      contractFlow.completeFlow();
                      toast({ title: "Contracts sent for signature", description: "Candidates moved to awaiting signature column" });
                      navigate("/flows/contract-flow?phase=data-collection");
                    }}
                  />
                </motion.div>
              ) : contractFlow.phase === "document-bundle-signature" ? (
                <motion.div key="document-bundle-signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DocumentBundleSignature 
                    candidates={contractFlow.selectedCandidates} 
                    onSendBundle={() => { 
                      contractFlow.startSigning(); 
                      // speak("Sending bundles for signature."); 
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
