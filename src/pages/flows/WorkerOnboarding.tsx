import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { useFlowState } from "@/hooks/useFlowState";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import KurtMuteToggle from "@/components/shared/KurtMuteToggle";

import WorkerStep1Welcome from "@/components/flows/worker-onboarding/WorkerStep1Welcome";
import WorkerStep2Personal from "@/components/flows/worker-onboarding/WorkerStep2Personal";
import WorkerStep3Compliance from "@/components/flows/worker-onboarding/WorkerStep3Compliance";
import WorkerStep4Payroll from "@/components/flows/worker-onboarding/WorkerStep4Payroll";
import WorkerStep5WorkSetup from "@/components/flows/worker-onboarding/WorkerStep5WorkSetup";
import WorkerStep6Checklist from "@/components/flows/worker-onboarding/WorkerStep6Checklist";
import WorkerStep7Finish from "@/components/flows/worker-onboarding/WorkerStep7Finish";
import WorkerCompletionScreen from "@/components/flows/worker-onboarding/WorkerCompletionScreen";

const FLOW_STEPS = [
  { id: "welcome", title: "Welcome to Fronted", icon: "👋" },
  { id: "personal", title: "Confirm Personal Information", icon: "👤" },
  { id: "compliance", title: "Compliance Requirements", icon: "📋" },
  { id: "payroll", title: "Payroll Details", icon: "💰" },
  { id: "work_setup", title: "Work Setup & Agreements", icon: "💼" },
  { id: "checklist", title: "Onboarding Checklist", icon: "✅" },
  { id: "finish", title: "All Set!", icon: "🎉" }
];

const WorkerOnboarding = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  const [expandedStep, setExpandedStep] = useState<string>("welcome");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isKurtMuted, setIsKurtMuted] = useState(true);
  
  const { state, updateFormData, completeStep, goToStep } = useFlowState(
    "worker_onboarding",
    "welcome"
  );

  const { speak, stop, currentWordIndex } = useTextToSpeech();
  const hasSpokenWelcome = useRef(false);
  const [welcomeMessage] = useState("Hi Maria! Welcome to Fronted - we'll help you complete a few quick tasks so your first day is smooth and compliant.");

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsKurtMuted(!isKurtMuted);
    if (isSpeaking && !isKurtMuted) {
      stop();
    }
  };

  // Helper function to handle speaking with mute awareness
  const handleSpeak = (message: string, onEnd?: () => void) => {
    setIsSpeaking(true);
    
    // Always call speak for word-by-word progression, but stop immediately if muted
    speak(message, () => {
      setIsSpeaking(false);
      onEnd?.();
    });
    
    // If muted, stop the audio immediately but keep visual indicators
    if (isKurtMuted) {
      setTimeout(() => {
        stop();
      }, 50);
    }
  };

  // Prefill demo data
  useEffect(() => {
    updateFormData({
      workerName: "Maria",
      email: "maria.santos@example.com",
      country: "Philippines",
      employmentType: "employee"
    });
  }, [updateFormData]);

  // Auto-speak welcome message
  useEffect(() => {
    if (!hasSpokenWelcome.current && state.currentStep === "welcome") {
      handleSpeak(welcomeMessage);
      hasSpokenWelcome.current = true;
    }
  }, [state.currentStep, welcomeMessage]);

  const scrollToStep = (stepId: string) => {
    const element = document.getElementById(`step-${stepId}`);
    
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    setIsProcessing(true);
    
    if (data) {
      updateFormData(data);
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    completeStep(stepId);
    setIsProcessing(false);

    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    
    if (currentIndex === FLOW_STEPS.length - 1) {
      // Final step - show completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowCompletionScreen(true);
    } else {
      const nextStep = FLOW_STEPS[currentIndex + 1];
      if (nextStep) {
        goToStep(nextStep.id);
        setExpandedStep(nextStep.id);
        setTimeout(() => scrollToStep(nextStep.id), 100);
      }
    }
  };

  const handleStepClick = (stepId: string) => {
    const isCompleted = state.completedSteps.includes(stepId);
    const isCurrent = state.currentStep === stepId;
    
    if (isCompleted || isCurrent) {
      const wasExpanded = expandedStep === stepId;
      setExpandedStep(wasExpanded ? "" : stepId);
      
      if (!wasExpanded) {
        scrollToStep(stepId);
      }
    }
  };

  if (showCompletionScreen) {
    return <WorkerCompletionScreen workerName={state.formData.workerName} />;
  }

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);

  return (
    <AgentLayout context="Worker Onboarding">
      <main className="flex min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
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

      {/* Main Content - Steps & Progress */}
      <div 
        className="flex-shrink-0 flex flex-col min-h-screen p-8 pb-32 space-y-8 relative z-10 mx-auto onboarding-scroll-container"
        style={{
          width: '100%',
          maxWidth: '800px'
        }}
      >

        {/* Header with Agent */}
        <div className="flex flex-col items-center space-y-4 mb-8">
          {/* Agent Pulse */}
          <div className="flex justify-center scale-75">
            <AudioWaveVisualizer isActive={isSpeaking} isListening={true} />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome to Fronted</h1>
          </div>

          {/* Subtitle with Mute Button */}
          <div className="flex items-center justify-center gap-0.5 w-full max-w-xl">
            <p className={`text-base text-center flex-1 pr-1 ${
              isSpeaking ? "" : "text-muted-foreground"
            }`}>
              {isSpeaking ? (
                welcomeMessage.split(' ').map((word, idx) => (
                  <span
                    key={idx}
                    className={
                      idx < currentWordIndex
                        ? 'text-foreground/90'
                        : 'text-muted-foreground/40'
                    }
                  >
                    {word}{' '}
                  </span>
                ))
              ) : (
                welcomeMessage
              )}
            </p>
            <KurtMuteToggle isMuted={isKurtMuted} onToggle={handleMuteToggle} />
          </div>

          {/* Chat Input */}
          <div className="w-full max-w-xl mt-4">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <div className="relative flex items-center gap-1.5 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow px-2 py-1.5">
                <Input
                  placeholder="Ask Kurt anything..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground h-8"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled
                  className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={FLOW_STEPS.length} />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {FLOW_STEPS.map((step, index) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = state.currentStep === step.id;
            const isExpanded = expandedStep === step.id;
            
            const status: "pending" | "active" | "completed" = 
              isCompleted ? "completed" : isCurrent ? "active" : "pending";

            return (
              <div key={step.id} id={`step-${step.id}`}>
                <StepCard
                  stepNumber={index + 1}
                  title={step.title}
                  status={status}
                  isExpanded={isExpanded}
                  onClick={() => handleStepClick(step.id)}
                >
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {step.id === "welcome" && (
                          <WorkerStep1Welcome
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                        {step.id === "personal" && (
                          <WorkerStep2Personal
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                        {step.id === "compliance" && (
                          <WorkerStep3Compliance
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                        {step.id === "payroll" && (
                          <WorkerStep4Payroll
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                        {step.id === "work_setup" && (
                          <WorkerStep5WorkSetup
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                        {step.id === "checklist" && (
                          <WorkerStep6Checklist
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                        {step.id === "finish" && (
                          <WorkerStep7Finish
                            formData={state.formData}
                            onComplete={handleStepComplete}
                            isProcessing={isProcessing}
                            isLoadingFields={isLoadingFields}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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

export default WorkerOnboarding;
