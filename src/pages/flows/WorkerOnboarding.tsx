import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { useWorkerFlowBridge } from "@/hooks/useWorkerFlowBridge";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

import WorkerStep1Welcome from "@/components/flows/worker-onboarding/WorkerStep1Welcome";
import WorkerStep2Personal from "@/components/flows/worker-onboarding/WorkerStep2Personal";
import WorkerStep3Compliance from "@/components/flows/worker-onboarding/WorkerStep3Compliance";
import WorkerStep4Payroll from "@/components/flows/worker-onboarding/WorkerStep4Payroll";
import WorkerStep5WorkSetup from "@/components/flows/worker-onboarding/WorkerStep5WorkSetup";
import WorkerStep7Finish from "@/components/flows/worker-onboarding/WorkerStep7Finish";
import WorkerCompletionScreen from "@/components/flows/worker-onboarding/WorkerCompletionScreen";

const FLOW_STEPS = [
  { id: "welcome", title: "Welcome and setup", icon: "👋" },
  { id: "personal", title: "Confirm Personal Information", icon: "👤" },
  { id: "compliance", title: "Compliance Requirements", icon: "📋" },
  { id: "payroll", title: "Payroll Details", icon: "💰" },
  { id: "work_setup", title: "Work Setup & Agreements", icon: "💼" },
  { id: "finish", title: "All Set!", icon: "🎉" }
];

import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";

const WorkerOnboarding = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  
  // Use persistent store
  const { state, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepStatus } = useWorkerFlowBridge();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const hasSpokenWelcome = useRef(false);
  const hasInitialized = useRef(false);
  const [welcomeMessage] = useState("Hi Maria! Welcome to Fronted - we'll help you complete a few quick tasks so your first day is smooth and compliant.");

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Prefill demo data and ensure initial step is expanded
  useEffect(() => {
    if (!hasInitialized.current) {
      updateFormData({
        workerName: "Maria",
        email: "maria.santos@example.com",
        country: "Philippines",
        employmentType: "employee"
      });

      // Always ensure first step is expanded on initial page load
      setExpandedStep('welcome');
      
      hasInitialized.current = true;
    }
  }, [expandedStep, state.currentStep, updateFormData, setExpandedStep]);

  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    // Check if this is the final step
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const isFinalStep = currentIndex === FLOW_STEPS.length - 1;
    
    // Skip loading animation for final step
    if (!isFinalStep) {
      setIsProcessing(true);
    }
    
    if (data) {
      updateFormData(data);
    }

    // Only delay for non-final steps
    if (!isFinalStep) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    completeStep(stepId);
    
    if (!isFinalStep) {
      setIsProcessing(false);
    }
    
    if (isFinalStep) {
      // Final step - show completion directly with smooth fade
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

  if (showCompletionScreen) {
    const workerName = state.formData[state.currentStep]?.workerName || state.formData.workerName || "Maria";
    return <WorkerCompletionScreen workerName={workerName} />;
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

      {/* Main Content - Steps & Progress */}
      <div 
        className="flex-shrink-0 flex flex-col min-h-screen p-8 pb-32 space-y-8 relative z-10 mx-auto onboarding-scroll-container"
        style={{
          width: '100%',
          maxWidth: '800px'
        }}
      >

        {/* Header with Agent */}
        <AgentHeader
          title="Hi Maria! Let's complete your onboarding"
          subtitle="Review, confirm, and welcome your new hire onboard."
          showPulse={true}
          isActive={isSpeaking}
          showInput={false}
        />

        {/* Progress bar */}
        <div>
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={FLOW_STEPS.length} />
        </div>

        {/* Steps */}
        <div className="space-y-4">
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
                id={`step-${step.id}`}
                data-step={step.id}
                role="region"
                aria-labelledby={headerId}
              >
                <StepCard
                  stepNumber={index + 1}
                  title={step.title}
                  status={status}
                  isExpanded={isExpanded}
                  isLocked={isLocked}
                  onClick={() => handleStepClick(step.id)}
                  headerId={headerId}
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
