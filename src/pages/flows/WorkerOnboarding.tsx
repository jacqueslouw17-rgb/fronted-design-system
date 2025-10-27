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
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
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
      setExpandedStep(expandedStep === stepId ? "" : stepId);
      if (expandedStep !== stepId) {
        scrollToStep(stepId);
      }
    }
  };

  if (showCompletionScreen) {
    return <WorkerCompletionScreen workerName={state.formData.workerName} />;
  }

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="h-1 w-12 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="h-1 w-12 bg-primary/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
            <motion.div
              className="h-1 w-12 bg-primary/30 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>

          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Worker Onboarding
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Complete your onboarding to get ready for your first day
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
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
    </div>
  );
};

export default WorkerOnboarding;
