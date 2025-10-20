import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, PanelRightClose, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowState } from "@/hooks/useFlowState";
import { toast } from "@/hooks/use-toast";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import LoadingDots from "@/components/LoadingDots";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Step components
import Step1IntroTrust from "@/components/flows/onboarding/Step1IntroTrust";
import Step2OrgProfile from "@/components/flows/onboarding/Step2OrgProfile";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step4Integrations from "@/components/flows/onboarding/Step4Integrations";
import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules";
import Step6Pledge from "@/components/flows/onboarding/Step6Pledge";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "intro_trust_model", title: "Welcome & Setup", stepNumber: 1 },
  { id: "org_profile", title: "Organization Profile", stepNumber: 2 },
  { id: "localization_country_blocks", title: "Localization & Countries", stepNumber: 3 },
  { id: "integrations_connect", title: "Integrations", stepNumber: 4 },
  { id: "mini_rules_setup", title: "Mini-Rules", stepNumber: 5 },
  { id: "transparency_pledge_esign", title: "Transparency Pledge", stepNumber: 6 },
  { id: "finish_dashboard_transition", title: "Finish & Launch", stepNumber: 7 }
];

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const { state, logEvent, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.admin.f1.onboarding",
    "intro_trust_model"
  );
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { isListening, transcript, startListening, stopListening, resetTranscript, error: sttError, isSupported } = useSpeechToText();

  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [kurtMessage, setKurtMessage] = useState(
    "Hi, I'm Genie. Let's set up your global contractor management system together."
  );
  const [messageStyle, setMessageStyle] = useState("text-muted-foreground");
  const [hasFinishedReading, setHasFinishedReading] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-expand step 1 and update message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMessage = "Let's set you up Joe, want me to accept the privacy policy on your behalf?";
      setKurtMessage(newMessage);
      setMessageStyle("text-foreground/80");
      
      // Start speaking and track state
      setIsSpeaking(true);
      setHasAutoStarted(false); // Reset auto-start flag
      speak(newMessage, () => {
        setIsSpeaking(false);
        setHasFinishedReading(true);
      });
      
      // Delay step expansion slightly for better animation
      setTimeout(() => {
        setExpandedStep("intro_trust_model");
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!isListening && transcript && !isProcessing) {
      const lowerTranscript = transcript.toLowerCase();
      
      // Check for dashboard navigation (step 7)
      if ((lowerTranscript.includes("dashboard") || lowerTranscript.includes("let's go") || lowerTranscript.includes("lets go")) && state.currentStep === "finish_dashboard_transition") {
        handleDashboardNavigation();
      }
      // Check for affirmative responses
      else if (lowerTranscript.includes("yes") || lowerTranscript.includes("please") || lowerTranscript.includes("sure") || lowerTranscript.includes("good") || lowerTranscript.includes("okay") || lowerTranscript.includes("ok")) {
        handleUserConfirmation();
      }
      // Check for save/continue commands (for when user edits selections)
      else if (lowerTranscript.includes("save") || lowerTranscript.includes("continue") || lowerTranscript.includes("proceed")) {
        handleUserSaveAction();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const handleUserConfirmation = async () => {
    // STEP 1 → STEP 2
    if (state.currentStep === "intro_trust_model") {
      // Start processing
      setIsProcessing(true);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Auto-accept privacy
      updateFormData({ privacyAccepted: true, defaultInputMode: "chat" });
      
      // Confirm action with voice
      setIsProcessing(false);
      const confirmMessage = "Perfect! I've got that sorted. Let me grab your organization details now.";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false); // Reset for next message
      setIsSpeaking(true);
      
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        setHasFinishedReading(true);
        
        // Complete step 1 and close it
        completeStep("intro_trust_model");
        setExpandedStep(null);
        
        // Wait before moving to step 2
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        // Pre-populate step 2 data
        const orgData = {
          companyName: "Fronted Inc",
          primaryContactName: "Joe Smith",
          primaryContactEmail: "joe@fronted.com",
          hqCountry: "NO",
          payrollFrequency: "monthly",
          payoutDay: "25",
          dualApproval: true
        };
        updateFormData(orgData);
        
        // Update message and expand step 2
        const newMessage = "I've added your organization details here. Everything look good to you?";
        setKurtMessage(newMessage);
        setMessageStyle("text-foreground/80");
        setHasFinishedReading(false);
        setHasAutoStarted(false); // Reset for next message
        setIsSpeaking(true);
        speak(newMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
        });
        
        goToStep("org_profile");
        setTimeout(() => {
          setExpandedStep("org_profile");
        }, 400);
      });
      
      resetTranscript();
    }
    
    // STEP 2 → STEP 3
    else if (state.currentStep === "org_profile") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Complete step 2
      completeStep("org_profile");
      setExpandedStep(null);
      setIsProcessing(false);
      
      // Pre-populate step 3 data
      const countries = ["NO", "PH"];
      updateFormData({ selectedCountries: countries });
      
      const confirmMessage = "Great! I've selected Norway and Philippines as your contractor countries. You can adjust these if needed, then just say 'save' when ready.";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      speak(confirmMessage, () => {
        setIsSpeaking(false);
        setHasFinishedReading(true);
      });
      
      goToStep("localization_country_blocks");
      setTimeout(() => {
        setExpandedStep("localization_country_blocks");
      }, 400);
      
      resetTranscript();
    }
    
    // STEP 3 → STEP 4
    else if (state.currentStep === "localization_country_blocks") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      completeStep("localization_country_blocks");
      setExpandedStep(null);
      setIsProcessing(false);
      
      const confirmMessage = "Perfect! Compliance blocks loaded. Now let me connect your integrations—Slack for alerts and FX for currency rates.";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        
        // Auto-connect integrations
        await new Promise(resolve => setTimeout(resolve, 2500));
        updateFormData({ 
          slackConnected: true, 
          fxConnected: true,
          googleSignConnected: false 
        });
        
        const nextMessage = "All set! Slack and FX are connected. Ready to configure your mini-rules?";
        setKurtMessage(nextMessage);
        setHasFinishedReading(false);
        setHasAutoStarted(false);
        setIsSpeaking(true);
        
        speak(nextMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
        });
        
        goToStep("integrations_connect");
        setTimeout(() => {
          setExpandedStep("integrations_connect");
        }, 400);
      });
      
      resetTranscript();
    }
    
    // STEP 4 → STEP 5
    else if (state.currentStep === "integrations_connect") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      completeStep("integrations_connect");
      setExpandedStep(null);
      setIsProcessing(false);
      
      // Pre-populate mini rules
      const rules = [
        { id: "r1", type: "approval", description: "Tag Finance when payroll batch > 100k" },
        { id: "r2", type: "compliance", description: "Remind contractor 7 days before doc expiry" },
        { id: "r3", type: "policy", description: "Default paid leave: 5d (PH), 0d (NO)" }
      ];
      updateFormData({ miniRules: rules });
      
      const confirmMessage = "I've set up three starter mini-rules for you. These look good?";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      speak(confirmMessage, () => {
        setIsSpeaking(false);
        setHasFinishedReading(true);
      });
      
      goToStep("mini_rules_setup");
      setTimeout(() => {
        setExpandedStep("mini_rules_setup");
      }, 400);
      
      resetTranscript();
    }
    
    // STEP 5 → STEP 6
    else if (state.currentStep === "mini_rules_setup") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      completeStep("mini_rules_setup");
      setExpandedStep(null);
      setIsProcessing(false);
      
      const confirmMessage = "Rules saved! One last step—our Transparency Pledge. It's our commitment to you. Ready to review and sign?";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      speak(confirmMessage, () => {
        setIsSpeaking(false);
        setHasFinishedReading(true);
      });
      
      goToStep("transparency_pledge_esign");
      setTimeout(() => {
        setExpandedStep("transparency_pledge_esign");
      }, 400);
      
      resetTranscript();
    }
    
    // STEP 6 → STEP 7
    else if (state.currentStep === "transparency_pledge_esign") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateFormData({ pledgeSigned: true, signedAt: new Date().toISOString() });
      completeStep("transparency_pledge_esign");
      setExpandedStep(null);
      setIsProcessing(false);
      
      const confirmMessage = "Excellent! You're all set up, Joe. Want me to draft your first contractor agreement, or would you prefer to explore the dashboard?";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      speak(confirmMessage, () => {
        setIsSpeaking(false);
        setHasFinishedReading(true);
      });
      
      goToStep("finish_dashboard_transition");
      setTimeout(() => {
        setExpandedStep("finish_dashboard_transition");
      }, 400);
      
      resetTranscript();
    }
  };

  const handleDashboardNavigation = async () => {
    setIsProcessing(true);
    
    const loadingMessage = "Perfect! Let me open your dashboard now.";
    setKurtMessage(loadingMessage);
    setMessageStyle("text-foreground/80");
    setHasFinishedReading(false);
    setHasAutoStarted(false);
    setIsSpeaking(true);
    
    speak(loadingMessage, async () => {
      setIsSpeaking(false);
      
      // Show loading for a moment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard
      navigate('/dashboard');
    });
    
    resetTranscript();
  };

  const handleUserSaveAction = async () => {
    // Handle save for Step 3 (when user manually edits countries)
    if (state.currentStep === "localization_country_blocks") {
      const selectedCountries = state.formData.selectedCountries || [];
      
      if (selectedCountries.length === 0) {
        const errorMessage = "I don't see any countries selected. Could you pick at least one?";
        setKurtMessage(errorMessage);
        setMessageStyle("text-foreground/80");
        setHasFinishedReading(false);
        setHasAutoStarted(false);
        setIsSpeaking(true);
        
        speak(errorMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
        });
        
        resetTranscript();
        return;
      }
      
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      completeStep("localization_country_blocks");
      setExpandedStep(null);
      setIsProcessing(false);
      
      const countryNames = selectedCountries.map((code: string) => {
        const country = [
          { code: "NO", name: "Norway" },
          { code: "PH", name: "Philippines" },
          { code: "IN", name: "India" },
          { code: "XK", name: "Kosovo" }
        ].find(c => c.code === code);
        return country?.name;
      }).filter(Boolean).join(", ");
      
      const confirmMessage = `Perfect! I've loaded compliance blocks for ${countryNames}. Now let me connect your integrations—Slack and FX.`;
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        
        // Auto-connect integrations
        await new Promise(resolve => setTimeout(resolve, 2000));
        updateFormData({ 
          slackConnected: true, 
          fxConnected: true,
          googleSignConnected: false 
        });
        
        const nextMessage = "All set! Slack and FX are connected. Ready to configure your mini-rules?";
        setKurtMessage(nextMessage);
        setHasFinishedReading(false);
        setHasAutoStarted(false);
        setIsSpeaking(true);
        
        speak(nextMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
        });
        
        goToStep("integrations_connect");
        setTimeout(() => {
          setExpandedStep("integrations_connect");
        }, 400);
      });
      
      resetTranscript();
    }
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
      setExpandedStep(nextStep.id);
      
      // Scroll to top and ensure visibility
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }

    toast({
      title: "Step completed",
      description: "Moving to next step..."
    });
  };

  const getStepStatus = (stepId: string): "pending" | "active" | "completed" => {
    if (state.completedSteps.includes(stepId)) return "completed";
    if (stepId === state.currentStep) return "active";
    return "pending";
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    if (status !== "pending") {
      // Toggle: collapse if already expanded, expand if not
      const newExpandedStep = expandedStep === stepId ? null : stepId;
      setExpandedStep(newExpandedStep);
      goToStep(stepId);
      
      // Scroll to top when expanding
      if (newExpandedStep === stepId) {
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      }
    }
  };

  const renderStepContent = (stepId: string) => {
    const stepProps = {
      formData: state.formData,
      onComplete: handleStepComplete,
      onOpenDrawer: () => {},
      isProcessing: isProcessing
    };

    switch (stepId) {
      case "intro_trust_model":
        return <Step1IntroTrust {...stepProps} />;
      case "org_profile":
        return <Step2OrgProfile {...stepProps} />;
      case "localization_country_blocks":
        return <Step3Localization {...stepProps} />;
      case "integrations_connect":
        return <Step4Integrations {...stepProps} />;
      case "mini_rules_setup":
        return <Step5MiniRules {...stepProps} />;
      case "transparency_pledge_esign":
        return <Step6Pledge {...stepProps} />;
      case "finish_dashboard_transition":
        return <Step7Finish {...stepProps} />;
      default:
        return null;
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
  const totalSteps = FLOW_STEPS.length;

  return (
    <main className="flex h-screen bg-background text-foreground relative min-h-0">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

        {/* Agent Panel - 60% width */}
        <section className={`flex flex-col items-center justify-center p-8 relative bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] transition-all duration-300 ${isFormCollapsed ? 'flex-1' : 'flex-shrink-0'}`} style={{ width: isFormCollapsed ? '100%' : '60%' }}>
          {/* Drawer Toggle Button - In agent panel when form visible */}
          {!isFormCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFormCollapsed(true)}
              className="absolute top-4 right-4 z-10 hover:bg-primary/10 bg-card/50 border border-border"
            >
              <PanelRightClose className="h-5 w-5" />
            </Button>
          )}
        {/* Static background (performance-safe) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-secondary/[0.04] to-accent/[0.05]" />
          <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-2xl opacity-15"
               style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.08))' }} />
          <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-2xl opacity-10"
               style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.1), hsl(var(--primary) / 0.08))' }} />
        </div>

        {/* Audio Wave Visualizer or Loading Dots */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          {isProcessing ? (
            <LoadingDots isActive={isProcessing} />
          ) : (
            <AudioWaveVisualizer isActive={isSpeaking || isListening} />
          )}

          {/* Title and dynamic subtext */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to Fronted
            </h1>
            <p className="text-sm max-w-md mx-auto">
              {kurtMessage.split(' ').map((word, index) => (
                <span
                  key={index}
                  className={`transition-colors duration-150 ${
                    hasFinishedReading
                      ? `${messageStyle}` 
                      : index === currentWordIndex - 1 
                      ? `${messageStyle} font-semibold` 
                      : index < currentWordIndex - 1
                      ? `${messageStyle} font-medium`
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {word}{index < kurtMessage.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Voice Input Control */}
        <div className="flex items-center justify-center mt-8 relative z-10">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleVoiceInput}
              disabled={isProcessing}
              className={`px-6 relative ${
                isListening 
                  ? "bg-destructive hover:bg-destructive/90" 
                  : "bg-gradient-to-r from-primary to-secondary shadow"
              }`}
            >
              <Mic className="h-5 w-5 mr-2" />
              <span>{isListening ? "Stop" : isProcessing ? "Processing..." : "Speak"}</span>
            </Button>
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                <Mic className="h-4 w-4" />
                <span>Listening...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Drawer Toggle Button - When collapsed, show at viewport edge */}
      {isFormCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFormCollapsed(false)}
          className="absolute top-4 right-4 z-20 hover:bg-primary/10 bg-card border border-border"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      )}

      {/* Right Panel — Steps + Progress - 40% width */}
      <aside className={`border-l border-border bg-card transition-all duration-300 flex flex-col h-screen min-h-0 ${isFormCollapsed ? 'w-0 overflow-hidden opacity-0' : 'flex-shrink-0 opacity-100'}`} style={{ width: isFormCollapsed ? '0' : '40%', minWidth: isFormCollapsed ? '0' : '380px' }}>
        {/* Scrollable content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {/* Progress Bar */}
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />

          {/* Step Cards */}
          <div className="space-y-3">
            {FLOW_STEPS.map((step) => {
              const status = getStepStatus(step.id);
              const isExpanded = expandedStep === step.id;

              return (
                <StepCard
                  key={step.id}
                  title={step.title}
                  status={status}
                  stepNumber={step.stepNumber}
                  isExpanded={isExpanded}
                  onClick={() => handleStepClick(step.id)}
                >
                  {isExpanded && (
                    <div className="pt-6">
                      {renderStepContent(step.id)}
                    </div>
                  )}
                </StepCard>
              );
            })}
          </div>
        </div>
      </aside>
    </main>
  );
};

export default AdminOnboarding;
