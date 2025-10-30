import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot, Users, DollarSign, FileCheck, TrendingUp, AlertCircle, Clock, ArrowLeft, X, BarChart3, GitBranch } from "lucide-react";
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
import { ContractSignedMessage } from "@/components/contract-flow/ContractSignedMessage";
import { AgentChatBox } from "@/components/contract-flow/AgentChatBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { KurtContextualTags } from "@/components/kurt";

const ContractFlowDemo = () => {
  const { speak, currentWordIndex: ttsWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const contractFlow = useContractFlow(version === "v3" || version === "v5" ? version : "v3");
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { setOpen, addMessage, setLoading } = useAgentState();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [promptText, setPromptText] = React.useState("");
  const [isTypingPrompt, setIsTypingPrompt] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [hasSpokenPhase, setHasSpokenPhase] = React.useState<Record<string, boolean>>({});
  const [showContractSignedMessage, setShowContractSignedMessage] = useState(false);
  const [contractMessageMode, setContractMessageMode] = useState<"sent" | "signed">("signed");
  const [isKurtMuted, setIsKurtMuted] = React.useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const handleKurtAction = async (action: string) => {
    // Add user message
    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    });

    // Open the agent panel
    setOpen(true);
    
    // Set loading state
    setLoading(true);

    // Simulate processing with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate contextual response based on action
    let response = '';
    
    switch(action) {
      case 'quick-summary':
        response = `📄 Contract Summary\n\nCandidate: Maria Santos\nRole: UX Designer\nLocation: Philippines 🇵🇭\n\nKey Terms:\n• Salary: $4,500/month\n• Start Date: March 1, 2024\n• Notice Period: 30 days\n• PTO: 15 days/year\n\n✅ All clauses comply with local labor law`;
        break;
      case 'check-fields':
        response = `✅ Field Validation Complete\n\nAll required fields are properly filled:\n• Personal Information ✓\n• Employment Terms ✓\n• Compensation Details ✓\n• Legal Clauses ✓\n\nNo issues detected. Contract is ready for review.`;
        break;
      case 'fix-clauses':
        response = `🔧 Clause Analysis\n\nI've reviewed the contract clauses and found:\n\n✓ Termination clause - compliant\n✓ IP rights clause - standard\n⚠️ Non-compete clause - May need adjustment for Philippines law\n\nRecommendation: Consider softening non-compete radius to align with local regulations.`;
        break;
      case 'explain-term':
        response = `📚 Legal Term Explained\n\n"Probation Period"\n\nThis refers to the initial employment period (typically 3-6 months) where:\n• Performance is closely evaluated\n• Either party can terminate with shorter notice\n• Full benefits may be prorated\n\nIn Philippines, max probation is 6 months under Labor Code.`;
        break;
      case 'pull-data':
        response = `📊 Data Retrieved from ATS\n\nSuccessfully pulled candidate information:\n\n👤 Maria Santos\n📧 maria.santos@email.com\n📱 +63 912 345 6789\n🎓 Bachelor in Design, UP Diliman\n💼 5 years experience in UX/UI\n\nAll data has been pre-filled into the contract template.`;
        break;
      case 'compare-drafts':
        response = `🔄 Draft Comparison\n\nComparing current draft with template:\n\nChanges made:\n• Salary increased from $4,000 to $4,500\n• PTO increased from 10 to 15 days\n• Added remote work clause\n• Modified notice period from 15 to 30 days\n\nAll changes are within approved parameters.`;
        break;
      case 'track-progress':
        response = `📈 Onboarding Progress\n\nMaria Santos - 75% Complete\n\n✅ Personal details submitted\n✅ Tax forms completed\n✅ Bank information verified\n⏳ Compliance documents pending\n⏳ Emergency contact needed\n\nEstimated completion: 2 days`;
        break;
      case 'resend-link':
        response = `📧 Link Resent\n\nOnboarding link has been resent to:\nmaria.santos@email.com\n\nThe link will expire in 48 hours.\n\nLast opened: 2 hours ago\nCompletion status: 75%`;
        break;
      case 'mark-complete':
        response = `✅ Marked as Complete\n\nThe checklist item has been marked as complete.\n\nNext action required:\nSend welcome email and schedule first day orientation.\n\nWould you like me to draft the welcome email?`;
        break;
      default:
        response = `I'll help you with "${action}". Let me process that for you.`;
    }

    addMessage({
      role: 'kurt',
      text: response,
    });

    setLoading(false);
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
    const movedParam = searchParams.get("moved") === "true";
    const allSignedParam = searchParams.get("allSigned") === "true";
    
    // Create a unique key that includes the moved/signed state for data-collection phase
    let uniquePhaseKey: string = phaseKey;
    if (phaseKey === "data-collection" || phaseKey === "offer-accepted") {
      if (allSignedParam) {
        uniquePhaseKey = `${phaseKey}-all-signed`;
      } else if (movedParam) {
        uniquePhaseKey = `${phaseKey}-moved`;
      }
    }
    
    if (!hasSpokenPhase[uniquePhaseKey]) {
      let message = "";
      
      if (phaseKey === "offer-accepted" || phaseKey === "data-collection") {
        if (allSignedParam) {
          message = "Both candidates have signed! Let's trigger their onboarding checklists.";
        } else if (movedParam) {
          message = "Great, contracts sent to candidates via their preferred signing portals.";
        } else {
          message = "Let's finalize contracts and complete onboarding.";
        }
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
          setHasSpokenPhase(prev => ({ ...prev, [uniquePhaseKey]: true }));
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [contractFlow.phase, hasSpokenPhase, speak, contractFlow.currentDraftIndex, contractFlow.selectedCandidates, searchParams]);

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
    const signedParam = searchParams.get("signed");
    
    if (phaseParam === "bundle-creation") {
      contractFlow.goToBundleCreation();
      // Clear the query param
      navigate("/flows/contract-flow", { replace: true });
    }
    
    if (signedParam === "true") {
      setShowContractSignedMessage(true);
    }
  }, [searchParams, contractFlow, navigate]);

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Topbar */}
      <Topbar 
        userName={`${userData.firstName} ${userData.lastName}`}
        isDrawerOpen={isDrawerOpen}
        onDrawerToggle={toggleDrawer}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Dashboard Drawer */}
        <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Contract Flow Main Area with Agent Layout */}
          <AgentLayout context="Contract Flow">
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
                    <div className="max-w-7xl mx-auto p-8 pb-32 space-y-8">
                      {/* Agent Header or Contract Status Message */}
                      {showContractSignedMessage ? (
                        <ContractSignedMessage 
                          mode="signed"
                          onReadingComplete={() => {
                            setTimeout(() => {
                              setShowContractSignedMessage(false);
                            }, 2000);
                          }}
                        />
                      ) : (
                        <AgentHeader
                          title="Welcome Joe, get to work!"
                          subtitle={
                            searchParams.get("allSigned") === "true"
                              ? "Both candidates have signed! Let's trigger their onboarding checklists."
                              : searchParams.get("moved") === "true" 
                                ? "Great, contracts sent to candidates via their preferred signing portals."
                                : "Let's finalize contracts and complete onboarding."
                          }
                          showPulse={true}
                          hasChanges={searchParams.get("moved") === "true" || searchParams.get("allSigned") === "true"}
                          isActive={
                            searchParams.get("allSigned") === "true"
                              ? !hasSpokenPhase["data-collection-all-signed"]
                              : searchParams.get("moved") === "true" 
                                ? !hasSpokenPhase["data-collection-moved"]
                                : !hasSpokenPhase["offer-accepted"]
                          }
                          isMuted={isKurtMuted}
                          onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                          tags={
                            <KurtContextualTags
                              flowContext="checklist"
                              onTagClick={handleKurtAction}
                              disabled={false}
                            />
                          }
                        />
                      )}

                    {/* Pipeline Tracking - Full Width */}
                    <div className="space-y-4">
                  <Tabs defaultValue="pipeline" className="w-full">
                    <TabsList className="grid w-64 mx-auto grid-cols-2 mb-6">
                      <TabsTrigger value="list" className="flex items-center gap-2" data-testid="tab-metrics">
                        <BarChart3 className="h-4 w-4" />
                        Metrics
                      </TabsTrigger>
                      <TabsTrigger value="pipeline" className="flex items-center gap-2" data-testid="tab-pipeline">
                        <GitBranch className="h-4 w-4" />
                        Pipeline View
                      </TabsTrigger>
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
                                 status: (searchParams.get("phase") === "data-collection" && searchParams.get("moved") === "true") 
                                   ? "awaiting-signature" as const 
                                   : (searchParams.get("onboarding") === "true")
                                     ? "trigger-onboarding" as const
                                     : index === 0 ? "data-pending" as const 
                                     : index === 1 ? "offer-accepted" as const 
                                     : "drafting" as const,
                                formSent: index === 0 || index === 1,
                                dataReceived: index === 0,
                                employmentType: candidate.employmentType || "contractor",
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
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-2",
                                name: "Luis Hernandez",
                                country: "Spain",
                                countryFlag: "🇪🇸",
                                role: "Product Manager",
                                salary: "€5,200/mo",
                                status: "certified" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-3",
                                name: "Yuki Tanaka",
                                country: "Japan",
                                countryFlag: "🇯🇵",
                                role: "UI/UX Designer",
                                salary: "¥650,000/mo",
                                status: "certified" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-4",
                                name: "Sophie Dubois",
                                country: "France",
                                countryFlag: "🇫🇷",
                                role: "Data Scientist",
                                salary: "€5,800/mo",
                                status: "certified" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-5",
                                name: "Ahmed Hassan",
                                country: "Egypt",
                                countryFlag: "🇪🇬",
                                role: "Mobile Developer",
                                salary: "EGP 45,000/mo",
                                status: "certified" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-6",
                                name: "Anna Kowalski",
                                country: "Poland",
                                countryFlag: "🇵🇱",
                                role: "QA Engineer",
                                salary: "PLN 15,000/mo",
                                status: "certified" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-7",
                                name: "Marcus Silva",
                                country: "Brazil",
                                countryFlag: "🇧🇷",
                                role: "Full Stack Developer",
                                salary: "R$ 18,000/mo",
                                status: "certified" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-8",
                                name: "Priya Sharma",
                                country: "India",
                                countryFlag: "🇮🇳",
                                role: "DevOps Engineer",
                                salary: "₹2,50,000/mo",
                                status: "certified" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-9",
                                name: "Lars Anderson",
                                country: "Sweden",
                                countryFlag: "🇸🇪",
                                role: "Security Engineer",
                                salary: "SEK 58,000/mo",
                                status: "certified" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-10",
                                name: "Isabella Costa",
                                country: "Portugal",
                                countryFlag: "🇵🇹",
                                role: "Content Strategist",
                                salary: "€3,200/mo",
                                status: "certified" as const,
                                employmentType: "employee" as const,
                              },
                            ]}
                            onDraftContract={(ids) => {
                              // Navigate to dedicated contract creation page with selected ids
                              const params = new URLSearchParams({ ids: ids.join(',') }).toString();
                              navigate(`/flows/contract-creation?${params}`);
                            }}
                            onSignatureComplete={() => {
                              // Navigate with allSigned param to show new heading/subtext
                              navigate("/flows/contract-flow?phase=data-collection&allSigned=true");
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
                  {/* Navigation - Back and Close buttons */}
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow?phase=data-collection"); }}
                      aria-label="Close and return to pipeline"
                    >
                      <X className="h-4 w-4" />
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
                      
                      {/* Agent Chat Box */}
                      <div className="mb-8">
                        <AgentChatBox
                          onSendMessage={async (message) => {
                            // Add user message
                            addMessage({
                              role: 'user',
                              text: message,
                            });
                            
                            // Open the agent panel
                            setOpen(true);
                            
                            // Respond with a generic message
                            setLoading(true);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            addMessage({
                              role: 'kurt',
                              text: `I understand you're asking about "${message}". Let me help you with that.`,
                            });
                            setLoading(false);
                          }}
                          placeholder="Ask Kurt anything..."
                        />
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
                          onClose={() => navigate("/flows/contract-flow")}
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
                  {/* Navigation - Back and Close buttons */}
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow?phase=data-collection"); }}
                      aria-label="Close and return to pipeline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col items-center p-8">
                    <div className="w-full max-w-7xl space-y-8">
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
                <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full">
                  {/* Navigation - Back and Close buttons */}
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => contractFlow.backToDrafting()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow?phase=data-collection"); }}
                      aria-label="Close and return to pipeline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 p-8">
                    <ContractReviewBoard 
                      candidates={contractFlow.selectedCandidates} 
                      onStartSigning={() => { 
                        // Update phase and navigate back to pipeline
                        contractFlow.proceedToDataCollection();
                        toast({ title: "Contracts sent for signature", description: "Candidates moved to awaiting signature column" });
                        navigate("/flows/contract-flow?phase=data-collection&moved=true");
                      }}
                    />
                  </div>
                </motion.div>
              ) : contractFlow.phase === "document-bundle-signature" ? (
                <motion.div key="document-bundle-signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DocumentBundleSignature 
                    candidates={contractFlow.selectedCandidates} 
                    onSendBundle={() => { 
                      contractFlow.startSigning(); 
                      // speak("Sending bundles for signature."); 
                    }}
                    onClose={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow?phase=data-collection"); }}
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
        </AgentLayout>
      </main>
    </div>
  </RoleLensProvider>
  );
};

export default ContractFlowDemo;
