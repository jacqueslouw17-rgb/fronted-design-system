import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { useFlowState } from "@/hooks/useFlowState";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

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
  const [expandedStep, setExpandedStep] = useState<string>("welcome");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  
  const { state, updateFormData, completeStep, goToStep } = useFlowState(
    "worker_onboarding",
    "welcome"
  );

  const { speak } = useTextToSpeech();
  const hasSpokenWelcome = useRef(false);

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
      const welcomeText = "Hi Maria! Welcome to Fronted. We'll help you complete a few quick tasks so your first day is smooth and compliant.";
      speak(welcomeText);
      hasSpokenWelcome.current = true;
    }
  }, [state.currentStep, speak]);

  const scrollToStep = (stepId: string) => {
    const element = document.getElementById(`step-${stepId}`);
    const container = document.querySelector('.onboarding-scroll-container');
    
    if (container) {
      // Scroll container to top for clean step view
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    // Then scroll to the specific step card
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
        // Scroll container to top when opening a step
        const container = document.querySelector('.onboarding-scroll-container');
        if (container) {
          setTimeout(() => {
            container.scrollTo({ top: 0, behavior: "smooth" });
          }, 50);
        }
      }
    }
  };

  if (showCompletionScreen) {
    return <WorkerCompletionScreen workerName={state.formData.workerName} />;
  }

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);

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

      {/* Main Content - Steps & Progress */}
      <div 
        className="flex-shrink-0 flex flex-col h-screen overflow-y-auto px-6 py-8 space-y-6 relative z-10 mx-auto onboarding-scroll-container"
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
          
          {/* Subtext */}
          <p className="text-foreground/60 relative max-w-2xl mx-auto">
            Complete your onboarding to get ready for your first day.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={FLOW_STEPS.length} />
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
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
  );
};

export default WorkerOnboarding;
