import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowState } from "@/hooks/useFlowState";
import { toast } from "@/hooks/use-toast";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import confetti from "canvas-confetti";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";

// Step components
import CandidateStep2PersonalDetails from "@/components/flows/candidate-onboarding/CandidateStep2PersonalDetails";
import CandidateStep3Compliance from "@/components/flows/candidate-onboarding/CandidateStep3Compliance";
import CandidateStep4Confirm from "@/components/flows/candidate-onboarding/CandidateStep4Confirm";
import CandidateCompletionScreen from "@/components/flows/candidate-onboarding/CandidateCompletionScreen";

const FLOW_STEPS = [
  { id: "personal_details", title: "Personal Details", stepNumber: 1 },
  { id: "compliance_docs", title: "Compliance", stepNumber: 2 },
  { id: "confirm_submit", title: "Confirm & Submit", stepNumber: 3 }
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const isDemoMode = window.location.pathname.includes('demo');
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  
  const { state, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.candidate.onboarding",
    "personal_details"
  );

  const [expandedStep, setExpandedStep] = useState<string | null>("personal_details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Text-to-Speech (Kurt voice over)
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'male', rate: 1.05 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasWelcomeSpoken, setHasWelcomeSpoken] = useState(false);
  const welcomeMessage = "Let's complete a few quick details so we can finalize your contract.";

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Prefill demo data
  useEffect(() => {
    // Always prefill for demo/preview purposes
    updateFormData({
      fullName: "Maria Santos",
      email: "maria.santos@example.com",
      companyName: "Fronted Inc",
      jobTitle: "Senior Developer",
      role: "Senior Developer",
      startDate: "2024-02-01",
      employmentType: "contractor", // contractor or employee
      country: "PH" // PH, NO, XK
    });
  }, [updateFormData]);

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

  // Handle step completion
  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    if (data) {
      updateFormData(data);
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    completeStep(stepId);
    setExpandedStep(null);
    setIsProcessing(false);

    // Navigate to next step
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const nextStep = FLOW_STEPS[currentIndex + 1];

    if (nextStep) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setIsLoadingFields(true);
      goToStep(nextStep.id);
      setExpandedStep(nextStep.id);
      scrollToStep(nextStep.id);

      await new Promise(resolve => setTimeout(resolve, 400));
      setIsLoadingFields(false);
    } else {
      // All steps complete - show completion screen
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowCompletionScreen(true);
    }
  };

  // Handle step click
  const handleStepClick = (stepId: string) => {
    const stepIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
    
    // Only allow clicking on completed steps or current step
    if (stepIndex <= currentStepIndex) {
      const wasExpanded = expandedStep === stepId;
      
      if (wasExpanded) {
        setExpandedStep(null);
      } else {
        setExpandedStep(stepId);
        scrollToStep(stepId);
      }
    }
  };


  // Show completion screen if all steps done
  if (showCompletionScreen) {
    return <CandidateCompletionScreen candidateName={state.formData.fullName} />;
  }

  return (
    <AgentLayout context="Candidate Onboarding">
      <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
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

      {/* Main Content - Centered Single Column */}
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Header with Agent */}
        <AgentHeader
          title={`Hi ${state.formData.fullName?.split(' ')[0] || "there"} 👋 Welcome to Fronted!`}
          subtitle={welcomeMessage}
          showPulse={true}
          isActive={isSpeaking}
          placeholder="Ask Kurt anything..."
          currentWordIndex={currentWordIndex}
          enableWordHighlight={isSpeaking}
          className="mb-8"
        />

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            currentStep={FLOW_STEPS.findIndex(s => s.id === state.currentStep) + 1} 
            totalSteps={FLOW_STEPS.length}
          />
        </div>

        {/* Step Cards */}
        <div className="space-y-3">
          {FLOW_STEPS.map((step) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = state.currentStep === step.id;
            const isExpanded = expandedStep === step.id;
            const canExpand = isCompleted || isCurrent;
            
            // Determine status
            const status = isCompleted ? "completed" : isCurrent ? "active" : "pending";

            return (
              <StepCard
                key={step.id}
                title={step.title}
                stepNumber={step.stepNumber}
                status={status}
                isExpanded={isExpanded}
                onClick={() => canExpand && handleStepClick(step.id)}
              >
                {isExpanded && (
                  <div 
                    ref={(el) => (stepRefs.current[step.id] = el)}
                    className="pt-6"
                  >
                    {step.id === "personal_details" && (
                      <CandidateStep2PersonalDetails
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "compliance_docs" && (
                      <CandidateStep3Compliance
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "confirm_submit" && (
                      <CandidateStep4Confirm
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                  </div>
                )}
              </StepCard>
            );
          })}
        </div>
      </div>
    </div>
    </AgentLayout>
  );
};

export default CandidateOnboarding;
