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
import { KurtIntroTooltip } from "@/components/contract-flow/KurtIntroTooltip";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";

const ContractFlowDemo = () => {
  const { speak, currentWordIndex: ttsWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const contractFlow = useContractFlow(version === "v3" || version === "v5" ? version : "v3");
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { setOpen, addMessage, setLoading, isSpeaking: isAgentSpeaking } = useAgentState();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [promptText, setPromptText] = React.useState("");
  const [isTypingPrompt, setIsTypingPrompt] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [hasSpokenPhase, setHasSpokenPhase] = React.useState<Record<string, boolean>>({});
  const [showContractSignedMessage, setShowContractSignedMessage] = useState(false);
  const [contractMessageMode, setContractMessageMode] = useState<"sent" | "signed">("signed");
  const [isKurtMuted, setIsKurtMuted] = React.useState(false);
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
    // Don't add user message for send-reminder actions (they're triggered from buttons)
    if (!action.startsWith('send-reminder-')) {
      addMessage({
        role: 'user',
        text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      });
    }

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
        response = `✅ Contract Summary Complete\n\nI checked all required fields — looks good!\n\nKey Terms:\n• Salary: [to be filled]\n• Start Date: [to be filled]\n• Notice Period: [to be filled]\n• PTO: [to be filled]\n\nWant me to auto-fill missing data from the candidate record?`;
        break;
      case 'check-fields':
        response = `✅ Field Review Complete\n\nI checked all mandatory contract fields. Everything's complete except:\n• Start Date (required)\n• Salary Currency (required)\n\nWant me to set Salary Currency automatically based on the candidate's country?`;
        break;
      case 'fix-clauses':
        response = `🔧 Clause Analysis Complete\n\nI reviewed all contract clauses:\n\n✓ Termination clause - compliant with local labor law\n✓ IP rights clause - standard language looks good\n✓ Non-compete clause - aligned with local regulations\n\nAll clauses are watertight. Ready to generate the bundle?`;
        break;
      case 'explain-term':
        response = `📚 Term Explanation\n\n"Probation Period"\n\nThis is the initial employment period (typically 3-6 months) where:\n• Performance is closely evaluated\n• Either party can terminate with shorter notice\n• Full benefits may be prorated\n\nThe standard probation period is aligned with local labor regulations. Want me to adjust it?`;
        break;
      case 'pull-data':
        response = `📊 Candidate Data Retrieved\n\nI pulled the latest info from your ATS:\n\n✓ Contact information verified\n✓ Role and experience confirmed\n✓ Qualifications validated\n\nAll data is pre-filled into the contract template. Should I generate the bundle now?`;
        break;
      case 'compare-drafts':
        response = `🔄 Draft Comparison Complete\n\nComparing current draft with standard template:\n\nChanges detected:\n• Salary structure customized for local market\n• PTO adjusted to local standards\n• Added remote work provisions\n• Modified notice period per regional requirements\n\nAll changes are within approved parameters. Ready to proceed?`;
        break;
      case 'track-progress':
        response = `📈 Onboarding Progress\n\n👤 Maria Santos - 75% Complete\n✅ Personal details submitted\n✅ Tax forms completed\n✅ Bank information verified\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 2 days\n\n👤 John Smith - 40% Complete\n✅ Personal details submitted\n⏳ Tax forms pending\n⏳ Bank information needed\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 5 days\n\n👤 Sarah Chen - 90% Complete\n✅ Personal details submitted\n✅ Tax forms completed\n✅ Bank information verified\n✅ Compliance documents approved\n⏳ Emergency contact needed\nEstimated completion: 1 day\n\n👤 Ahmed Hassan - 25% Complete\n✅ Personal details submitted\n⏳ Tax forms pending\n⏳ Bank information needed\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 7 days`;
        
        addMessage({
          role: 'kurt',
          text: response,
          actionButtons: [
            { label: 'Send Reminder to Maria', action: 'send-reminder-maria', variant: 'default' },
            { label: 'Send Reminder to John', action: 'send-reminder-john', variant: 'outline' },
            { label: 'Send Reminder to Sarah', action: 'send-reminder-sarah', variant: 'outline' },
            { label: 'Send Reminder to Ahmed', action: 'send-reminder-ahmed', variant: 'outline' },
          ]
        });
        
        setLoading(false);
        return;
      case 'resend-link':
        setLoading(true);
        setOpen(true);
        
        setTimeout(() => {
          setLoading(false);
          addMessage({
            role: 'kurt',
            text: "Got it — who should I resend this to?\n\n📧 Pre-filled candidates ready for resend:\n• Maria Santos\n• John Smith\n• Sarah Chen\n• Ahmed Hassan",
            actionButtons: [
              { label: 'Resend to All', action: 'resend-all', variant: 'default' },
              { label: 'Select Individual', action: 'resend-individual', variant: 'outline' },
            ]
          });
        }, 1500);
        return;
        
      case 'resend-all':
        addMessage({
          role: 'user',
          text: 'Resend to all candidates'
        });
        setLoading(true);
        
        setTimeout(() => {
          setLoading(false);
          addMessage({
            role: 'kurt',
            text: "All set! ✅\n\nOnboarding links resent to all 4 candidates. They'll receive the email shortly.",
          });
          
          toast({
            title: "Links Sent",
            description: "4 onboarding links have been resent successfully.",
          });
        }, 1200);
        return;
      case 'mark-complete':
        setLoading(true);
        setOpen(true);
        
        setTimeout(() => {
          setLoading(false);
          
          // Trigger confetti
          const duration = 2 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
          }, 250);
          
          addMessage({
            role: 'kurt',
            text: "Done ✅ Everything's up to date.\n\nMaria's onboarding is now marked as complete. All systems synced successfully!",
          });
        }, 1800);
        return;
      default:
        response = `I'll help you with "${action}". Let me process that for you.`;
    }

    // Handle other actions
    if (action.startsWith('send-reminder-')) {
      const name = action.replace('send-reminder-', '').replace('-', ' ');
      const capitalizedName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      addMessage({
        role: 'kurt',
        text: `📧 Reminder Sent\n\nOnboarding reminder has been emailed to ${capitalizedName}.\n\n✓ Link to continue onboarding included\n✓ List of pending items attached\n✓ Support contact information provided\n\nThey should receive it within a few minutes.`,
      });
      setLoading(false);
      return;
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
  
  // Expose handleKurtAction globally for action buttons
  useEffect(() => {
    (window as any).handleKurtAction = handleKurtAction;
    return () => {
      delete (window as any).handleKurtAction;
    };
  }, []);

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
      
      if (message && !isKurtMuted) {
        const timer = setTimeout(() => {
          setIsSpeaking(true);
          speak(message, () => {
            setIsSpeaking(false);
          });
          setHasSpokenPhase(prev => ({ ...prev, [uniquePhaseKey]: true }));
        }, 1000);
        
        return () => clearTimeout(timer);
      } else if (message && isKurtMuted) {
        // Mark as spoken even if muted so it doesn't replay
        setHasSpokenPhase(prev => ({ ...prev, [uniquePhaseKey]: true }));
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
            <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative">
              {/* Static background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                     style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                     style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
              </div>
              <div className="relative z-10">
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
                                : "Kurt can help with: tracking progress, resending links, or marking tasks complete."
                          }
                          showPulse={true}
                          hasChanges={searchParams.get("moved") === "true" || searchParams.get("allSigned") === "true"}
                          isActive={(isSpeaking || isAgentSpeaking) || (
                            searchParams.get("allSigned") === "true"
                              ? !hasSpokenPhase["data-collection-all-signed"]
                              : searchParams.get("moved") === "true" 
                                ? !hasSpokenPhase["data-collection-moved"]
                                : !hasSpokenPhase["offer-accepted"]
                          )}
                          isMuted={isKurtMuted}
                          onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                          tags={
                            <AgentSuggestionChips
                              chips={[
                                {
                                  label: "Track Progress",
                                  variant: "primary",
                                  onAction: () => handleKurtAction("track-progress"),
                                },
                                {
                                  label: "Resend Link",
                                  variant: "default",
                                  onAction: () => handleKurtAction("resend-link"),
                                },
                                {
                                  label: "Mark Complete",
                                  variant: "default",
                                  onAction: () => handleKurtAction("mark-complete"),
                                },
                              ]}
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
                                 <Card className={`hover:shadow-lg transition-all h-full border border-border/40 bg-card/50 backdrop-blur-sm ${
                                   idx === 0 ? 'bg-gradient-to-br from-primary/[0.02] to-primary/[0.01]' : ''
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
                              // Display-only candidates (not in contract flow)
                              {
                                id: "display-1",
                                name: "Liam Chen",
                                country: "Singapore",
                                countryFlag: "🇸🇬",
                                role: "Frontend Developer",
                                salary: "SGD 7,500/mo",
                                status: "offer-accepted" as const,
                                formSent: false,
                                dataReceived: false,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "display-2",
                                name: "Sofia Rodriguez",
                                country: "Mexico",
                                countryFlag: "🇲🇽",
                                role: "Marketing Manager",
                                salary: "MXN 45,000/mo",
                                status: "data-pending" as const,
                                formSent: true,
                                dataReceived: false,
                                employmentType: "employee" as const,
                              },
                              // Actual candidates in the contract flow
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
                                     : "drafting" as const,
                                formSent: false,
                                dataReceived: true,
                                employmentType: candidate.employmentType || "contractor",
                              })),
                              // Payroll Ready candidates
                              {
                                id: "cert-1",
                                name: "Emma Wilson",
                                country: "United Kingdom",
                                countryFlag: "🇬🇧",
                                role: "Senior Backend Developer",
                                salary: "£6,500/mo",
                                status: "payroll-ready" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-2",
                                name: "Luis Hernandez",
                                country: "Spain",
                                countryFlag: "🇪🇸",
                                role: "Product Manager",
                                salary: "€5,200/mo",
                                status: "payroll-ready" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-3",
                                name: "Yuki Tanaka",
                                country: "Japan",
                                countryFlag: "🇯🇵",
                                role: "UI/UX Designer",
                                salary: "¥650,000/mo",
                                status: "payroll-ready" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-4",
                                name: "Sophie Dubois",
                                country: "France",
                                countryFlag: "🇫🇷",
                                role: "Data Scientist",
                                salary: "€5,800/mo",
                                status: "payroll-ready" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-5",
                                name: "Ahmed Hassan",
                                country: "Egypt",
                                countryFlag: "🇪🇬",
                                role: "Mobile Developer",
                                salary: "EGP 45,000/mo",
                                status: "payroll-ready" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-6",
                                name: "Anna Kowalski",
                                country: "Poland",
                                countryFlag: "🇵🇱",
                                role: "QA Engineer",
                                salary: "PLN 15,000/mo",
                                status: "payroll-ready" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-7",
                                name: "Marcus Silva",
                                country: "Brazil",
                                countryFlag: "🇧🇷",
                                role: "Full Stack Developer",
                                salary: "R$ 18,000/mo",
                                status: "payroll-ready" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-8",
                                name: "Priya Sharma",
                                country: "India",
                                countryFlag: "🇮🇳",
                                role: "DevOps Engineer",
                                salary: "₹2,50,000/mo",
                                status: "payroll-ready" as const,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "cert-9",
                                name: "Lars Anderson",
                                country: "Sweden",
                                countryFlag: "🇸🇪",
                                role: "Security Engineer",
                                salary: "SEK 58,000/mo",
                                status: "payroll-ready" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-10",
                                name: "Isabella Costa",
                                country: "Portugal",
                                countryFlag: "🇵🇹",
                                role: "Content Strategist",
                                salary: "€3,200/mo",
                                status: "payroll-ready" as const,
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
                      
                      {/* Agent Header with Tags */}
                      <div className="mb-8">
                        <AgentHeader
                          title="Contract Bundle"
                          subtitle="Kurt can help with: adding documents, reviewing bundles, or checking compliance."
                          showPulse={true}
                          isActive={(isSpeaking || isAgentSpeaking) || !hasSpokenPhase["bundle-creation"]}
                          isMuted={isKurtMuted}
                          onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                          tags={
                            <div className="relative">
                              <KurtContextualTags
                                flowContext="contract-bundle"
                                onTagClick={handleKurtAction}
                                disabled={false}
                              />
                              <KurtIntroTooltip context="contract-bundle" />
                            </div>
                          }
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
          </div>
        </AgentLayout>
      </main>
    </div>
  </RoleLensProvider>
  );
};

export default ContractFlowDemo;
