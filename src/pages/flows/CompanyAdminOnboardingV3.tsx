/**
 * Flow 5 — Company Admin Onboarding v3 (Future)
 * 
 * Isolated clone with v7 Future glassmorphism stepper UI.
 * Steps:
 * 1. Account & Company Details
 * 2. Policies & Guardrails
 * 
 * DO NOT modify any other flows or versions!
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import { AnimatePresence, motion } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { toast } from "sonner";

import StepAccountDetails from "@/components/flows/onboarding/StepAccountDetails";
import F5v3_PolicySetupStep from "@/components/flows/flow5-v3/F5v3_PolicySetupStep";

const FLOW_STEPS = [
  { id: "account_details", title: "Company details", stepNumber: 1 },
  { id: "policy_setup", title: "Policies & guardrails", stepNumber: 2 },
];

const CompanyAdminOnboardingV3 = () => {
  const navigate = useNavigate();
  const { state, updateFormData, completeStep } = useAdminFlowBridge();
  const { resetAdminFlow } = useOnboardingStore();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepData, setStepData] = useState<Record<string, Record<string, any>>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  useEffect(() => {
    if (!hasInitialized.current) {
      resetAdminFlow();
      const prefilled = {
        adminName: "Joe Smith",
        adminEmail: "joe.smith@jboxtech.com",
        companyName: "JBOX Technologies",
        hqCountry: "NO",
      };
      updateFormData(prefilled);
      setFormData(prefilled);
      hasInitialized.current = true;
    }
  }, [resetAdminFlow, updateFormData]);

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    setIsProcessing(true);

    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
      setStepData(prev => ({ ...prev, [stepId]: data }));
      updateFormData(data);
    }

    completeStep(stepId);
    setCompletedSteps(prev => new Set(prev).add(stepId));

    const currentIdx = FLOW_STEPS.findIndex(s => s.id === stepId);

    if (currentIdx < FLOW_STEPS.length - 1) {
      // Move to next step
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(currentIdx + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step — complete
      toast.success("Onboarding complete! Redirecting to dashboard…");
      setTimeout(() => {
        navigate("/?tab=flows");
      }, 1200);
    }

    setIsProcessing(false);
  };

  const activeStep = FLOW_STEPS[currentStep] || FLOW_STEPS[0];

  const getStepTitle = () => {
    switch (activeStep.id) {
      case "account_details": return "Hi Joe! Let's get you set up";
      case "policy_setup": return "Set the rules";
      default: return "Setup";
    }
  };

  const getStepSubtitle = () => {
    switch (activeStep.id) {
      case "account_details": return "You've been invited as a Company Admin. Confirm your details below.";
      case "policy_setup": return "Define what your AI agent can auto-handle vs escalate.";
      default: return "";
    }
  };

  const renderStepContent = () => {
    switch (activeStep.id) {
      case "account_details":
        return (
          <StepAccountDetails
            formData={formData}
            onComplete={handleStepComplete}
            isProcessing={isProcessing}
          />
        );
      case "policy_setup":
        return (
          <F5v3_PolicySetupStep
            formData={stepData["policy_setup"] || {}}
            onComplete={handleStepComplete}
            isProcessing={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AgentLayout context="Company Admin Onboarding v3 — Future">
      <main className="flex min-h-screen text-foreground relative v7-future-bg">
        <FrostedHeader onLogoClick={() => navigate("/?tab=flows")} onCloseClick={() => navigate("/?tab=flows")} />

        <div
          className="flex-shrink-0 flex flex-col min-h-screen pt-20 sm:pt-24 px-4 sm:px-8 pb-16 sm:pb-32 space-y-4 sm:space-y-6 relative z-10 mx-auto onboarding-scroll-container"
          style={{ width: "100%", maxWidth: "800px" }}
        >
          {/* Header with audio visualizer */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 mb-2 sm:mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-center"
              style={{ maxHeight: '160px' }}
            >
              <AudioWaveVisualizer isActive={isSpeaking} />
            </motion.div>

            {/* Title + subtitle */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-center space-y-1.5 sm:space-y-2 max-w-2xl px-2 sm:px-0"
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {getStepTitle()}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {getStepSubtitle()}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* v7 Stepper indicator */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-1.5"
            >
              {FLOW_STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (completedSteps.has(step.id) || idx <= currentStep) {
                        setCurrentStep(idx);
                      }
                    }}
                    disabled={!completedSteps.has(step.id) && idx > currentStep}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border",
                      idx === currentStep
                        ? "border-[hsl(172_28%_42%/0.15)] text-foreground"
                        : completedSteps.has(step.id)
                        ? "border-[hsl(172_28%_42%/0.08)] text-foreground/60 cursor-pointer"
                        : "border-transparent text-muted-foreground/35 cursor-not-allowed"
                    )}
                    style={
                      idx === currentStep
                        ? { background: 'hsl(172 28% 42% / 0.05)' }
                        : completedSteps.has(step.id)
                        ? { background: 'hsl(172 28% 42% / 0.03)' }
                        : undefined
                    }
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircle2 className="h-3 w-3" style={{ color: 'hsl(172 28% 42% / 0.5)' }} />
                    ) : (
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                          idx === currentStep ? "" : "text-muted-foreground/25"
                        )}
                        style={idx === currentStep ? { background: 'hsl(172 28% 42% / 0.08)', color: 'hsl(172 28% 42% / 0.7)' } : undefined}
                      >
                        {idx + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  {idx < FLOW_STEPS.length - 1 && (
                    <div
                      className="w-5 h-px transition-colors duration-300"
                      style={{ background: completedSteps.has(step.id) ? 'hsl(172 28% 42% / 0.15)' : 'hsl(0 0% 0% / 0.04)' }}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Step Content — hide redundant heading from shared component */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="[&>div>div:first-child]:hidden"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </AgentLayout>
  );
};

export default CompanyAdminOnboardingV3;
