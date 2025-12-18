/**
 * Flow 5 — Company Admin Onboarding v1
 * 
 * Standalone onboarding flow for Company Admins accessed via email invite link.
 * Duplicated from the Add Company flow used in Flow 1.1 Fronted Admin Dashboard v2.
 * 
 * Key differences from embedded version:
 * - Standalone flow (not embedded in dashboard)
 * - Heading: "Admin Onboarding"
 * - Welcoming subtitle for company admins
 * - Accessed via deep link from email invite
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAgentState } from "@/hooks/useAgentState";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";
import frontedLogo from "@/assets/fronted-logo.png";

// Step components
import Step1AdminAccount from "@/components/flows/onboarding/Step1AdminAccount";
import Step2CompanyDetailsOnly from "@/components/flows/onboarding/Step2CompanyDetailsOnly";
import Step3HiringLocationsV2 from "@/components/flows/onboarding/Step3HiringLocationsV2";
import Step4FinishAdminOnboarding from "@/components/flows/onboarding/Step4FinishAdminOnboarding";
const FLOW_STEPS = [{
  id: "admin_account",
  title: "Your details",
  stepNumber: 1
}, {
  id: "company_details",
  title: "Company details",
  stepNumber: 2
}, {
  id: "localization_country_blocks",
  title: "Hiring Locations",
  stepNumber: 3
}, {
  id: "finish_dashboard_transition",
  title: "Ready to Launch",
  stepNumber: 4
}];
const CompanyAdminOnboarding = () => {
  const navigate = useNavigate();
  const {
    state,
    updateFormData,
    completeStep,
    goToStep,
    expandedStep,
    setExpandedStep,
    getStepData
  } = useAdminFlowBridge();
  const {
    resetAdminFlow
  } = useOnboardingStore();
  const {
    setIsSpeaking: setAgentSpeaking
  } = useAgentState();
  const {
    currentWordIndex
  } = useTextToSpeech({
    lang: 'en-GB',
    voiceName: 'british',
    rate: 1.1
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const hasInitialized = useRef(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Reset flow state on mount and prefill admin data if available
  useEffect(() => {
    if (!hasInitialized.current) {
      resetAdminFlow();

      // Prefill admin name and email from invite link (simulated for now)
      // In production, these would come from URL params or API
      updateFormData({
        adminName: "John Doe",
        adminEmail: "john@company.com",
        companyName: "Acme Corp",
        hqCountry: "NO"
      });
      setExpandedStep("admin_account");
      hasInitialized.current = true;
    }
  }, [resetAdminFlow, setExpandedStep, updateFormData]);

  // Scroll to step helper
  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, {
      focusHeader: true,
      delay: 100
    });
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
      // Final step completed; navigation to the Company Admin Dashboard
      // is handled inside Step4FinishAdminOnboarding.
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
      isProcessing
    };
    switch (stepId) {
      case "admin_account":
        return <Step1AdminAccount {...commonProps} />;
      case "company_details":
        return <Step2CompanyDetailsOnly {...commonProps} />;
      case "localization_country_blocks":
        return <Step3HiringLocationsV2 {...commonProps} showSkipButton={false} />;
      case "finish_dashboard_transition":
        return <Step4FinishAdminOnboarding {...commonProps} />;
      default:
        return null;
    }
  };
  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
  const totalSteps = FLOW_STEPS.length;
  return <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] overflow-hidden">
      {/* Static background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))'
      }} />
        <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8" style={{
        background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))'
      }} />
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 h-full overflow-y-auto">
        {/* Logo Header */}
        <div className="px-6 pt-6 pb-0 flex items-center gap-3">
          <button onClick={() => navigate("/?tab=flows")} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Back to flows">
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </button>
          <img src={frontedLogo} alt="Fronted" className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/?tab=flows")} />
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-32 space-y-6 mx-auto" style={{
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* Header */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.5,
            ease: "easeOut"
          }} className="flex justify-center" style={{
            maxHeight: '240px'
          }}>
            <AudioWaveVisualizer isActive={isSpeaking} />
          </motion.div>

          <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.1,
            ease: "easeOut"
          }} className="text-center space-y-3 max-w-2xl">
            <h1 className="text-3xl font-bold text-foreground">Hi Joe! Let's complete your onboarding</h1>
            <p className="text-base text-center text-muted-foreground">
              Complete your admin setup to access your dashboard
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />
        </div>

        {/* Step Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="sync">
            {FLOW_STEPS.map((step, index) => {
              const isCompleted = state.completedSteps.includes(step.id);
              const isCurrent = state.currentStep === step.id;
              const isExpanded = expandedStep === step.id;
              const isLocked = !isCompleted && !isCurrent && FLOW_STEPS.findIndex(s => s.id === step.id) > FLOW_STEPS.findIndex(s => s.id === state.currentStep);
              return <motion.div key={step.id} id={`step-card-${step.id}`} ref={el => stepRefs.current[step.id] = el} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -20
              }} transition={{
                delay: index * 0.1
              }}>
                  <StepCard stepNumber={step.stepNumber} title={step.title} status={isCompleted ? "completed" : isCurrent ? "active" : "inactive"} isExpanded={isExpanded} onClick={() => handleStepClick(step.id)} isLocked={isLocked}>
                    {renderStepContent(step.id)}
                  </StepCard>
                </motion.div>;
            })}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </div>;
};
export default CompanyAdminOnboarding;