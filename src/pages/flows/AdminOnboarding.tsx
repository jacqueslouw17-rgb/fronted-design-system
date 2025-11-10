import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import LoadingDots from "@/components/LoadingDots";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { motion } from "framer-motion";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";

// Step components
import Step1IntroTrust from "@/components/flows/onboarding/Step1IntroTrust";
import Step2OrgProfileSimplified from "@/components/flows/onboarding/Step2OrgProfileSimplified";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
// import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules"; // Hidden for now
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "intro_trust_model", title: "Welcome & Setup", stepNumber: 1 },
  { id: "org_profile", title: "Organization Profile", stepNumber: 2 },
  { id: "localization_country_blocks", title: "Localization & Countries", stepNumber: 3 },
  // { id: "mini_rules_setup", title: "Mini-Rules", stepNumber: 4 }, // Hidden for now
  { id: "finish_dashboard_transition", title: "Finish & Launch", stepNumber: 4 } // Updated step number
];

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  
  // Use bridge hook that connects to persistent store
  const { state, logEvent, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepStatus } = useAdminFlowBridge();
  
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { isListening, transcript, startListening, stopListening, resetTranscript, error: sttError, isSupported, isDetectingVoice } = useSpeechToText();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [welcomeMessage] = useState(
    "Let me guide you through setting up your global payroll system."
  );
  const [kurtMessage, setKurtMessage] = useState(
    "Let me guide you through setting up your global payroll system."
  );
  const [messageStyle, setMessageStyle] = useState("text-muted-foreground");
  const [hasFinishedReading, setHasFinishedReading] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isKurtVisible, setIsKurtVisible] = useState(false); // Hidden by default
  const [hasActivatedSpeech, setHasActivatedSpeech] = useState(false);
  const [hasWelcomeSpoken, setHasWelcomeSpoken] = useState(false);
  const hasInitialized = useRef(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Ensure first step is expanded on initial page load
  useEffect(() => {
    if (!hasInitialized.current) {
      setExpandedStep("intro_trust_model");
      hasInitialized.current = true;
    }
  }, [setExpandedStep]);

  // Scroll to step helper with accessibility
  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  // Helper function to handle speaking (visual only, no audio)
  const handleSpeak = (message: string, onEnd?: () => void) => {
    setIsSpeaking(true);
    setKurtMessage(message);
    
    // Visual indicators only - no audio playback
    setTimeout(() => {
      setIsSpeaking(false);
      onEnd?.();
    }, 2000);
  };

  // Handle speak button click
  const handleSpeakClick = () => {
    if (hasActivatedSpeech) return;
    
    setHasActivatedSpeech(true);
    const initialMessage = "Hi Joe, I'm Kurt. I'll help you set up today, can I accept the privacy policy on your behalf?";
    setKurtMessage(initialMessage);
    setMessageStyle("text-foreground/80");
    setIsSpeaking(true);
    
    // Expand step 1 during the greeting for smooth transition
    setTimeout(() => {
      setExpandedStep("intro_trust_model");
      scrollToStep("intro_trust_model");
    }, 2000);
    
    // Visual only - no audio
    setIsSpeaking(false);
    setHasFinishedReading(true);
    setHasAutoStarted(false);
  };

  // Auto-start listening after AI finishes speaking (only once per message)
  useEffect(() => {
    if (hasFinishedReading && !isListening && !isProcessing && !hasAutoStarted && isSupported && !sttError) {
      const timer = setTimeout(() => {
        setHasAutoStarted(true);
        startListening();
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFinishedReading, isListening, isProcessing, hasAutoStarted, isSupported, sttError]);

  // Handle voice input with full flow
  const handleVoiceInput = async () => {
    if (isListening) {
      // Manual stop
      stopListening();
      return;
    }
    
    // Start listening
    stop();
    await startListening();
  };

  // Watch for transcript changes and auto-process
  useEffect(() => {
    if (!isListening || !transcript || isProcessing || isSpeaking) return;
    const lowerTranscript = transcript.toLowerCase();

    // Navigate to dashboard (step 7)
    if ((lowerTranscript.includes("dashboard") || lowerTranscript.includes("let's go") || lowerTranscript.includes("lets go")) && state.currentStep === "finish_dashboard_transition") {
      stopListening();
      resetTranscript();
      handleDashboardNavigation();
    }
    // Affirmative responses
    else if (lowerTranscript.includes("yes") || lowerTranscript.includes("please") || lowerTranscript.includes("sure") || lowerTranscript.includes("good") || lowerTranscript.includes("okay") || lowerTranscript.includes("ok") || lowerTranscript.includes("ready")) {
      stopListening();
      setIsProcessing(true);
      resetTranscript();
      handleUserConfirmation();
    }
    // Save/continue commands
    else if (lowerTranscript.includes("save") || lowerTranscript.includes("continue") || lowerTranscript.includes("proceed")) {
      stopListening();
      setIsProcessing(true);
      resetTranscript();
      handleUserConfirmation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isProcessing, isSpeaking, isListening]);

  const handleUserConfirmation = async () => {
    // STEP 1 → STEP 2
    if (state.currentStep === "intro_trust_model") {
      // Auto-accept privacy checkbox first
      updateFormData({ privacyAccepted: true, defaultInputMode: "chat" });
      
      // Show loading on button
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Complete step 1 and close it
      completeStep("intro_trust_model");
      setExpandedStep(null);
      setIsProcessing(false);
      
      // Wait before speaking about org details
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Visual message only - no audio
      const loadingMessage = "Retrieving details";
      setKurtMessage(loadingMessage);
      setMessageStyle("text-foreground/80");
      
      // Auto-save policy acceptance to database
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("profiles").upsert({
            user_id: session.user.id,
            display_name: "Joe Smith"
          }, { onConflict: "user_id" });
        }
      } catch (error) {
        console.error("Error saving policy acceptance:", error);
      }
      
      // Expand Step 2
      setTimeout(() => {
        setIsLoadingFields(true);
        goToStep("org_profile");
        setExpandedStep("org_profile");
        scrollToStep("org_profile");
      }, 400);
      
      // Keep skeleton loading visible
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Populate the data
      const orgData = {
        companyName: "Fronted Inc",
        primaryContactName: "Joe Smith",
        primaryContactEmail: "joe@fronted.com",
        hqCountry: "NO",
        payrollCurrency: "NOK",
        payrollFrequency: "monthly",
        payoutDay: "25",
        dualApproval: true
      };
      updateFormData(orgData);
      setIsLoadingFields(false);
      
      resetTranscript();
    }
    
    // STEP 2 → STEP 3
    else if (state.currentStep === "org_profile") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Complete step 2
      completeStep("org_profile");
      setExpandedStep(null);
      setIsProcessing(false);
      
      // Wait before moving to step 3
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Pre-populate step 3 data
      const countries = ["NO", "PH"];
      updateFormData({ selectedCountries: countries });
      
      const confirmMessage = "Great! I've selected Norway and Philippines as your contractor countries. You can adjust these if needed.";
      handleSpeak(confirmMessage, async () => {
        // Set loading state FIRST, before expanding step 3
        setIsLoadingFields(true);
        goToStep("localization_country_blocks");
        setExpandedStep("localization_country_blocks");
        scrollToStep("localization_country_blocks");
        
        // Keep skeleton visible briefly
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsLoadingFields(false);
        setHasFinishedReading(true);
        setHasAutoStarted(false);
      });
      
      resetTranscript();
    }
    
    // STEP 3 → STEP 5 (Finish - Skip Mini-Rules for now)
    else if (state.currentStep === "localization_country_blocks") {
      const selectedCountries = state.formData.selectedCountries || [];
      
      if (selectedCountries.length === 0) {
        const errorMessage = "I don't see any countries selected. Could you pick at least one?";
        handleSpeak(errorMessage, () => {
          setHasFinishedReading(true);
          setHasAutoStarted(false);
        });
        
        resetTranscript();
        return;
      }
      
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      completeStep("localization_country_blocks");
      setExpandedStep(null);
      setIsProcessing(false);
      
      // Wait before moving to finish step (skip mini-rules)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const confirmMessage = "Excellent! You're all set up, Joe. Want me to draft your first contractor agreement, or explore the dashboard?";
      handleSpeak(confirmMessage, () => {
        setHasFinishedReading(true);
      });
      
      goToStep("finish_dashboard_transition");
      setTimeout(() => {
        setExpandedStep("finish_dashboard_transition");
        scrollToStep("finish_dashboard_transition");
      }, 400);
      
      resetTranscript();
    }
  };

  const handleDashboardNavigation = async () => {
    // Skip loading state for final transition - use smooth fade instead
    const loadingMessage = "Perfect! Saving your settings and opening your dashboard now.";
    handleSpeak(loadingMessage, async () => {
      // Save all onboarding data to database
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userId = session.user.id;
          
          // TODO: Fix database schema - commented out due to type mismatch
          // Save organization profile
          // if (state.formData.companyName) {
          //   await supabase.from("organization_profiles").upsert({...});
          // }
          
          // Save localization settings
          // if (state.formData.selectedCountries) {
          //   await supabase.from("localization_settings").upsert({...});
          // }
          
          console.log("Onboarding completed - data saved to store:", state.formData);
        }
      } catch (error) {
        console.error("Error saving onboarding data:", error);
      }
      
      // Navigate to dashboard with smooth transition (no loader)
      await new Promise(resolve => setTimeout(resolve, 250));
      navigate('/dashboard?onboarding=complete');
    });
    
    resetTranscript();
  };

  const handleStepComplete = (stepId: string, data?: Record<string, any>) => {
    if (data) {
      updateFormData(data);
    }
    completeStep(stepId);
    
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    if (currentIndex < FLOW_STEPS.length - 1) {
      const nextStep = FLOW_STEPS[currentIndex + 1];
      goToStep(nextStep.id);
      
      // If completing step 1 with manual mode, collapse Kurt and step
      if (stepId === "intro_trust_model" && data?.defaultInputMode === "manual") {
        setIsKurtVisible(false);
        setTimeout(() => {
          setExpandedStep(null);
        }, 300);
      } else {
        setExpandedStep(nextStep.id);
      }
    }

    toast({
      title: "Step completed",
      description: "Moving to next step..."
    });
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    if (status !== "inactive") {
      // Toggle: collapse if already expanded, expand if not
      const wasExpanded = expandedStep === stepId;
      const newExpandedStep = wasExpanded ? null : stepId;
      setExpandedStep(newExpandedStep);
      goToStep(stepId);
      
      if (newExpandedStep) {
        // Scroll to the step when opening it
        setTimeout(() => {
          scrollToStep(stepId);
        }, 50);
      }
    }
  };

  const renderStepContent = (stepId: string) => {
    const stepData = state.formData[stepId] || {};
    const stepProps = {
      formData: stepData,
      onComplete: handleStepComplete,
      onOpenDrawer: () => {},
      isProcessing: isProcessing,
      isLoadingFields: isLoadingFields
    };

    switch (stepId) {
      case "intro_trust_model":
        return <Step1IntroTrust {...stepProps} />;
      case "org_profile":
        return <Step2OrgProfileSimplified {...stepProps} />;
      case "localization_country_blocks":
        return <Step3Localization {...stepProps} />;
      // case "mini_rules_setup":
      //   return <Step5MiniRules {...stepProps} />; // Hidden for now
      case "finish_dashboard_transition":
        return <Step7Finish {...stepProps} />;
      default:
        return null;
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
  const totalSteps = FLOW_STEPS.length;

  return (
    <AgentLayout context="Admin Onboarding">
      <main className="flex min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/?tab=flows')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Static background (performance-safe) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
             style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
        <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
             style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
      </div>

      {/* Right Section - Steps & Progress */}
      <div 
        className="flex-shrink-0 flex flex-col h-screen overflow-y-auto px-6 pt-8 pb-32 space-y-6 relative z-10 mx-auto onboarding-scroll-container"
        style={{
          width: '100%',
          maxWidth: '800px'
        }}
      >
        {/* Header with Agent */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          {/* Agent Pulse - centered with gentle animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex justify-center"
            style={{ maxHeight: '240px' }}
          >
            <AudioWaveVisualizer isActive={isSpeaking} />
          </motion.div>

            {/* Title and Subtitle Container */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="text-center space-y-3 max-w-2xl"
            >
              <h1 className="text-3xl font-bold text-foreground">Admin Onboarding</h1>
              <p className={`text-base text-center transition-colors duration-300 ${
                isSpeaking ? "text-foreground/80" : "text-muted-foreground"
              }`}>
                Let's get you ready to start drafting contracts and collecting key details.
              </p>
            </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />
        </div>

        {/* Step Cards */}
        <div className="space-y-3">
          {FLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isExpanded = expandedStep === step.id;
            const headerId = `step-header-${step.id}`;
            
            // Lock steps that come after the current active step
            const currentIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
            const isLocked = index > currentIndex && status === 'inactive';

            return (
              <div 
                key={step.id}
                data-step={step.id}
                role="region"
                aria-labelledby={headerId}
              >
                <StepCard
                  title={step.title}
                  status={status}
                  stepNumber={step.stepNumber}
                  isExpanded={isExpanded}
                  onClick={() => handleStepClick(step.id)}
                  headerId={headerId}
                  isLocked={isLocked}
                >
                  {isExpanded && (
                    <div 
                      ref={(el) => stepRefs.current[step.id] = el}
                      className="pt-6"
                    >
                      {renderStepContent(step.id)}
                    </div>
                  )}
                </StepCard>
              </div>
            );
          })}
        </div>
      </div>
    </main>
    </AgentLayout>
  );
};

export default AdminOnboarding;
