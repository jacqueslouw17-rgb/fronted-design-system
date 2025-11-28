/**
 * Flow 5 — Company Admin Onboarding v1
 * 
 * Standalone onboarding flow for Company Admins accessed via email invite link.
 * Duplicated from the Add Company flow used in Flow 1.1 Fronted Admin Dashboard v2.
 * 
 * Key differences from embedded version:
 * - No X close icon (standalone, no parent dashboard)
 * - Heading: "Admin Onboarding"
 * - Welcoming subtitle for company admins
 * - Accessed via deep link from email invite
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAgentState } from "@/hooks/useAgentState";
import { useOnboardingStore } from "@/stores/onboardingStore";
import frontedLogo from "@/assets/fronted-logo.png";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";

// Step components
import Step2OrgProfileSimplified from "@/components/flows/onboarding/Step2OrgProfileSimplified";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "org_profile", title: "Company details", stepNumber: 1 },
  { id: "localization_country_blocks", title: "Hiring Locations", stepNumber: 2 },
  { id: "finish_dashboard_transition", title: "Ready to Launch", stepNumber: 3 }
];

const CompanyAdminOnboarding = () => {
  const navigate = useNavigate();
  const { state, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepData } = useAdminFlowBridge();
  const { resetAdminFlow } = useOnboardingStore();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  const { currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const hasInitialized = useRef(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Reset flow state on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      resetAdminFlow();
      setExpandedStep("org_profile");
      hasInitialized.current = true;
    }
  }, [resetAdminFlow, setExpandedStep]);

  // Scroll to step helper
  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const handleStepComplete = async (stepId: string, data?: any) => {
    setIsProcessing(true);

    // Update form data if provided
    if (data) {
      updateFormData(data);
    }
    
    // Complete the step
    completeStep(stepId);

    // Check if this is the final step
    if (stepId === "finish_dashboard_transition") {
      // Read company name from store
      const orgProfileData = getStepData("org_profile");
      const companyName = orgProfileData?.companyName || "Your Company";
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success("Company onboarding complete!", {
        description: `${companyName} has been set up successfully.`
      });
      
      // Navigate to company admin dashboard
      setTimeout(() => {
        navigate("/");
      }, 2000);
      setIsProcessing(false);
      return;
    }
    
    // Move to the next step
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    if (currentIndex < FLOW_STEPS.length - 1) {
      const nextStep = FLOW_STEPS[currentIndex + 1];
      goToStep(nextStep.id);
      setExpandedStep(nextStep.id);
      
      setTimeout(() => {
        scrollToStep(nextStep.id);
      }, 150);
    }

    setIsProcessing(false);
  };

  const handleStepClick = (stepId: string) => {
    const clickedIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
    
    if (clickedIndex <= currentIndex || state.completedSteps.includes(stepId)) {
      setExpandedStep(expandedStep === stepId ? null : stepId);
      
      setTimeout(() => {
        scrollToStep(stepId);
      }, 100);
    }
  };

  const handleOpenDrawer = () => {
    // No-op for standalone flow
    console.log("Drawer interaction (no-op in standalone flow)");
  };

  const renderStepContent = (stepId: string) => {
    const isExpanded = expandedStep === stepId;
    if (!isExpanded) return null;

    const commonProps = {
      formData: state.formData,
      onComplete: (data?: any) => handleStepComplete(stepId, data),
      onOpenDrawer: handleOpenDrawer,
      isProcessing,
    };

    switch (stepId) {
      case "org_profile":
        return <Step2OrgProfileSimplified {...commonProps} />;
      case "localization_country_blocks":
        return <Step3Localization {...commonProps} />;
      case "finish_dashboard_transition":
        return <Step7Finish {...commonProps} />;
      default:
        return null;
    }
  };

  const completedStepsCount = state.completedSteps.length;
  const totalSteps = FLOW_STEPS.length;
  const progressPercent = (completedStepsCount / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header with logo only (no X close icon) */}
      <div className="relative z-10 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img 
            src={frontedLogo} 
            alt="Fronted" 
            className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Admin Onboarding
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to Fronted. Confirm your details and set up your company so we can handle payroll and compliance on your behalf.
            </p>
            <AudioWaveVisualizer 
              isActive={isSpeaking}
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ProgressBar 
              currentStep={completedStepsCount}
              totalSteps={totalSteps}
            />
          </motion.div>

          {/* Step cards */}
          <div className="space-y-4">
            <AnimatePresence mode="sync">
              {FLOW_STEPS.map((step, index) => {
                const isCompleted = state.completedSteps.includes(step.id);
                const isCurrent = state.currentStep === step.id;
                const isExpanded = expandedStep === step.id;
                const isLocked = !isCompleted && !isCurrent && 
                                FLOW_STEPS.findIndex(s => s.id === step.id) > 
                                FLOW_STEPS.findIndex(s => s.id === state.currentStep);

                return (
                  <motion.div
                    key={step.id}
                    id={`step-card-${step.id}`}
                    ref={el => stepRefs.current[step.id] = el}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StepCard
                      stepNumber={step.stepNumber}
                      title={step.title}
                      status={isCompleted ? "completed" : isCurrent ? "active" : "inactive"}
                      isExpanded={isExpanded}
                      onClick={() => handleStepClick(step.id)}
                      isLocked={isLocked}
                    >
                      {renderStepContent(step.id)}
                    </StepCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminOnboarding;
