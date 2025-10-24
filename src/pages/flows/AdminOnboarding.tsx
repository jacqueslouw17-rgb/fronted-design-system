import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { supabase } from "@/integrations/supabase/client";

// Step components
import Step1IntroTrust from "@/components/flows/onboarding/Step1IntroTrust";
import Step2OrgProfile from "@/components/flows/onboarding/Step2OrgProfile";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step4Integrations from "@/components/flows/onboarding/Step4Integrations";
import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "intro_trust_model", title: "Welcome & Setup", stepNumber: 1 },
  { id: "org_profile", title: "Organization Profile", stepNumber: 2 },
  { id: "localization_country_blocks", title: "Localization & Countries", stepNumber: 3 },
  { id: "integrations_connect", title: "Integrations", stepNumber: 4 },
  { id: "mini_rules_setup", title: "Mini-Rules", stepNumber: 5 },
  { id: "finish_dashboard_transition", title: "Finish & Launch", stepNumber: 6 }
];

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const { state, logEvent, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.admin.f1.onboarding",
    "intro_trust_model"
  );
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { isListening, transcript, startListening, stopListening, resetTranscript, error: sttError, isSupported, isDetectingVoice } = useSpeechToText();

  const [expandedStep, setExpandedStep] = useState<string | null>("intro_trust_model");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [kurtMessage, setKurtMessage] = useState(
    "Click 'Speak' below to get started with your setup."
  );
  const [welcomeMessage] = useState(
    "Let me guide you through setting up your global payroll system."
  );
  const [messageStyle, setMessageStyle] = useState("text-muted-foreground");
  const [hasFinishedReading, setHasFinishedReading] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isKurtVisible, setIsKurtVisible] = useState(false); // Hidden by default
  const [hasActivatedSpeech, setHasActivatedSpeech] = useState(false);
  const [hasWelcomeSpoken, setHasWelcomeSpoken] = useState(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-speak welcome message on page load
  useEffect(() => {
    if (!hasWelcomeSpoken) {
      const timer = setTimeout(() => {
        setHasWelcomeSpoken(true);
        setIsSpeaking(true);
        speak(welcomeMessage, () => {
          setIsSpeaking(false);
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasWelcomeSpoken, welcomeMessage, speak]);

  // Scroll to step helper
  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      const stepElement = stepRefs.current[stepId];
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    stop();
    speak(initialMessage, () => {
      setIsSpeaking(false);
      setHasFinishedReading(true);
      setHasAutoStarted(false);
    });
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
      setIsProcessing(true);
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
      handleUserSaveAction();
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
      scrollToTop();
      
      // Wait before speaking about org details
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // NOW speak about fetching org details
      const loadingMessage = "Perfect! Let me fetch your organization details...";
      setKurtMessage(loadingMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
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
      
      // Expand Step 2 mid-way through voiceover (after 0.8s)
      setTimeout(() => {
        setIsLoadingFields(true);
        goToStep("org_profile");
        setExpandedStep("org_profile");
        scrollToStep("org_profile");
      }, 800);
        
      stop();
      speak(loadingMessage, async () => {
        setIsSpeaking(false);
        
        // Keep skeleton loading visible
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Populate the data
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
        setIsLoadingFields(false);
        
        // Confirm org details are ready and ask for user approval
        const confirmMessage = "Here are your organization details. Happy with these? Just say 'yes' when you're ready to continue.";
        setKurtMessage(confirmMessage);
        setMessageStyle("text-foreground/80");
        setHasFinishedReading(false);
        setHasAutoStarted(false);
        setIsSpeaking(true);
        
        stop();
        speak(confirmMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
          setHasAutoStarted(false);
        });
      });
      
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
      scrollToTop();
      
      // Wait before moving to step 3
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Pre-populate step 3 data
      const countries = ["NO", "PH"];
      updateFormData({ selectedCountries: countries });
      
      const confirmMessage = "Great! I've selected Norway and Philippines as your contractor countries. You can adjust these if needed, then just say 'yes' when ready.";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      // Set loading state FIRST, before expanding step 3
      setIsLoadingFields(true);
      goToStep("localization_country_blocks");
      setExpandedStep("localization_country_blocks");
      scrollToStep("localization_country_blocks");
      
      stop();
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        
        // Keep skeleton visible briefly
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsLoadingFields(false);
        setHasFinishedReading(true);
        setHasAutoStarted(false);
      });
      
      resetTranscript();
    }
    
    // STEP 3 → STEP 4 (when user confirms pre-selected countries with "yes")
    else if (state.currentStep === "localization_country_blocks") {
      const selectedCountries = state.formData.selectedCountries || [];
      
      if (selectedCountries.length === 0) {
        const errorMessage = "I don't see any countries selected. Could you pick at least one?";
        setKurtMessage(errorMessage);
        setMessageStyle("text-foreground/80");
        setHasFinishedReading(false);
        setHasAutoStarted(false);
        setIsSpeaking(true);
        
        stop();
        speak(errorMessage, () => {
          setIsSpeaking(false);
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
      scrollToTop();
      
      // Wait before moving to step 4
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const countryNames = selectedCountries.map((code: string) => {
        const country = [
          { code: "NO", name: "Norway" },
          { code: "PH", name: "Philippines" },
          { code: "IN", name: "India" },
          { code: "XK", name: "Kosovo" }
        ].find(c => c.code === code);
        return country?.name;
      }).filter(Boolean).join(", ");
      
      const confirmMessage = `Perfect! Compliance blocks loaded for ${countryNames}. Now let me connect your integrations—Slack and FX.`;
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      // Set loading state FIRST, before expanding step 4
      setIsLoadingFields(true);
      goToStep("integrations_connect");
      setExpandedStep("integrations_connect");
      scrollToStep("integrations_connect");
      
      stop();
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        
        // Keep skeleton visible briefly while connecting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Auto-connect integrations
        updateFormData({ 
          slackConnected: true, 
          fxConnected: true,
          googleSignConnected: false 
        });
        
        setIsLoadingFields(false);
        
        const nextMessage = "All set! Slack and FX are connected. Ready to configure your mini-rules?";
        setKurtMessage(nextMessage);
        setHasFinishedReading(false);
        setHasAutoStarted(false);
        setIsSpeaking(true);
        
        stop();
        speak(nextMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
          setHasAutoStarted(false);
        });
      });
      
      resetTranscript();
    }
    
    // STEP 4 → STEP 5
    else if (state.currentStep === "integrations_connect") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      completeStep("integrations_connect");
      setExpandedStep(null);
      setIsProcessing(false);
      scrollToTop();
      
      // Wait before moving to step 5
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      
      // Set loading state FIRST, before expanding step 5
      setIsLoadingFields(true);
      goToStep("mini_rules_setup");
      setExpandedStep("mini_rules_setup");
      scrollToStep("mini_rules_setup");
      
      stop();
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        
        // Keep skeleton visible briefly
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsLoadingFields(false);
        setHasFinishedReading(true);
        setHasAutoStarted(false);
      });
      
      resetTranscript();
    }
    
    // STEP 5 → STEP 6 (Finish)
    else if (state.currentStep === "mini_rules_setup") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      completeStep("mini_rules_setup");
      setExpandedStep(null);
      setIsProcessing(false);
      scrollToTop();
      
      // Wait before moving to finish step
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const confirmMessage = "Excellent! You're all set up, Joe. Want me to draft your first contractor agreement, or would you prefer to explore the dashboard?";
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      stop();
      speak(confirmMessage, () => {
        setIsSpeaking(false);
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
    setIsProcessing(true);
    
    const loadingMessage = "Perfect! Let me save your settings and open your dashboard now.";
    setKurtMessage(loadingMessage);
    setMessageStyle("text-foreground/80");
    setHasFinishedReading(false);
    setHasAutoStarted(false);
    setIsSpeaking(true);
    
    stop();
    speak(loadingMessage, async () => {
      setIsSpeaking(false);
      
      // Save all onboarding data to database
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userId = session.user.id;
          
          // Save organization profile
          if (state.formData.companyName) {
            await supabase.from("organization_profiles").upsert({
              user_id: userId,
              company_name: state.formData.companyName,
              industry: state.formData.industry,
              company_size: state.formData.companySize,
              hq_country: state.formData.hqCountry,
              website: state.formData.website,
              contact_name: state.formData.primaryContactName,
              contact_email: state.formData.primaryContactEmail,
              contact_phone: state.formData.primaryContactPhone,
              default_currency: state.formData.defaultCurrency,
              payroll_frequency: state.formData.payrollFrequency,
              auto_tax_calc: state.formData.dualApproval
            }, { onConflict: "user_id" });
          }
          
          // Save localization settings
          if (state.formData.selectedCountries) {
            await supabase.from("localization_settings").upsert({
              user_id: userId,
              operating_countries: state.formData.selectedCountries
            }, { onConflict: "user_id" });
          }
          
          // Save mini rules
          if (state.formData.miniRules && state.formData.miniRules.length > 0) {
            await supabase.from("mini_rules").delete().eq("user_id", userId);
            
            const rulesToInsert = state.formData.miniRules.map((rule: any) => ({
              user_id: userId,
              rule_type: rule.type,
              description: rule.description
            }));
            
            await supabase.from("mini_rules").insert(rulesToInsert);
          }
          
          // Save integrations
          if (state.formData.slackConnected !== undefined) {
            await supabase.from("user_integrations").upsert({
              user_id: userId,
              hr_system: state.formData.slackConnected ? "slack" : null,
              accounting_system: state.formData.fxConnected ? "fx" : null,
              banking_partner: state.formData.googleSignConnected ? "google" : null
            }, { onConflict: "user_id" });
          }
          
          // Save pledge
          if (state.formData.pledgeSigned) {
            await supabase.from("user_pledges").upsert({
              user_id: userId,
              pledge_text: "I commit to transparent, fair, and compliant contractor management."
            }, { onConflict: "user_id" });
          }
        }
      } catch (error) {
        console.error("Error saving onboarding data:", error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Show loading for a moment
      await new Promise(resolve => setTimeout(resolve, 600));
      
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
        
        stop();
        speak(errorMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
          setHasAutoStarted(false);
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
      
      const confirmMessage = `Perfect! I've loaded compliance blocks for ${countryNames}. Now let me connect your integrations.`;
      setKurtMessage(confirmMessage);
      setMessageStyle("text-foreground/80");
      setHasFinishedReading(false);
      setHasAutoStarted(false);
      setIsSpeaking(true);
      
      stop();
      speak(confirmMessage, async () => {
        setIsSpeaking(false);
        
        // Auto-connect integrations
        await new Promise(resolve => setTimeout(resolve, 700));
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
        
        stop();
        speak(nextMessage, () => {
          setIsSpeaking(false);
          setHasFinishedReading(true);
          setHasAutoStarted(false);
        });
        
        goToStep("integrations_connect");
        setTimeout(() => {
          setExpandedStep("integrations_connect");
          scrollToStep("integrations_connect");
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
    
    // Smooth scroll to top after completing a step
    setTimeout(() => {
      scrollToTop();
    }, 300);
    
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
      if (newExpandedStep) {
        scrollToStep(stepId);
      }
    }
  };

  const renderStepContent = (stepId: string) => {
    const stepProps = {
      formData: state.formData,
      onComplete: handleStepComplete,
      onOpenDrawer: () => {},
      isProcessing: isProcessing,
      isLoadingFields: isLoadingFields
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
      case "finish_dashboard_transition":
        return <Step7Finish {...stepProps} />;
      default:
        return null;
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
  const totalSteps = FLOW_STEPS.length;

  return (
    <main className="flex h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/')}
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
        className="flex-shrink-0 flex flex-col h-screen overflow-y-auto px-6 py-8 space-y-6 relative z-10 mx-auto"
        style={{ 
          width: '100%',
          maxWidth: '800px'
        }}
      >
        {/* Header with Animation */}
        <div className="text-center space-y-2 mb-8">
          {/* Decorative animated bars */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-12 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-16 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-2 h-12 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <div className="w-2 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Fronted
          </h1>
          
          {/* Subtext with reading overlay */}
          <p className="text-foreground/60 relative max-w-2xl mx-auto">
            {welcomeMessage.split(' ').map((word, index) => (
              <span
                key={index}
                className={`transition-colors duration-200 ${
                  isSpeaking && currentWordIndex === index
                    ? 'text-foreground/90 font-medium'
                    : ''
                }`}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />
        </div>

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
                  <div 
                    ref={(el) => stepRefs.current[step.id] = el}
                    className="pt-6"
                  >
                    {renderStepContent(step.id)}
                  </div>
                )}
              </StepCard>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default AdminOnboarding;
