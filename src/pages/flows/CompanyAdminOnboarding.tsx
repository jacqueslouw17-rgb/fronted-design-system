/**
 * Flow 5 — Company Admin Onboarding v1
 * 
 * Aligned with Flow 2 v2 / Flow 3 v2 UX pattern:
 * AgentLayout → AgentHeader → ProgressBar → StepCard accordion
 * 
 * Steps:
 * 1. Account & Company Details (prefilled from invite + company profile)
 * 2. Terms & Conditions (checkbox + sheet drawer)
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";

import StepAccountDetails from "@/components/flows/onboarding/StepAccountDetails";
import StepTermsConditions from "@/components/flows/onboarding/StepTermsConditions";

const FLOW_STEPS = [
  { id: "account_details", title: "Account & Company Details" },
  { id: "terms", title: "Terms & Conditions" },
];

const CompanyAdminOnboarding = () => {
  const navigate = useNavigate();
  const { state, updateFormData, completeStep } = useAdminFlowBridge();
  const { resetAdminFlow } = useOnboardingStore();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();

  const [currentStep, setCurrentStep] = useState("account_details");
  const [expandedStep, setExpandedStep] = useState<string | null>("account_details");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
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
      setExpandedStep("account_details");
      hasInitialized.current = true;
    }
  }, [resetAdminFlow, updateFormData]);

  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const getStepStatus = (stepId: string): "inactive" | "pending" | "active" | "completed" => {
    if (completedSteps.has(stepId)) return "completed";
    if (stepId === currentStep) return "active";
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === currentStep);
    const stepIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    if (stepIndex > currentIndex) return "inactive";
    return "pending";
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const isFinalStep = currentIndex === FLOW_STEPS.length - 1;

    if (!isFinalStep) {
      setIsProcessing(true);
    }

    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
      updateFormData(data);
    }

    completeStep(stepId);
    setCompletedSteps(prev => new Set(prev).add(stepId));

    if (isFinalStep) {
      navigate("/flows/company-admin-dashboard-v3");
      return;
    }

    const nextStep = FLOW_STEPS[currentIndex + 1];
    if (nextStep) {
      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(nextStep.id);
      setExpandedStep(nextStep.id);
      setIsProcessing(false);
      setTimeout(() => scrollToStep(nextStep.id), 50);
    }
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    if (status === "inactive") return;
    const wasExpanded = expandedStep === stepId;
    const newExpanded = wasExpanded ? null : stepId;
    setExpandedStep(newExpanded);
    if (newExpanded) {
      setTimeout(() => scrollToStep(stepId), 50);
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === currentStep);

  return (
    <AgentLayout context="Company Admin Onboarding">
      <main className="flex min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
        <img 
          src={frontedLogo}
          alt="Fronted"
          className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/?tab=flows")}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/?tab=flows")}
          className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        </div>

        <div
          className="flex-shrink-0 flex flex-col min-h-screen p-4 sm:p-8 pb-16 sm:pb-32 space-y-6 sm:space-y-8 relative z-10 mx-auto onboarding-scroll-container"
          style={{ width: "100%", maxWidth: "800px" }}
        >
          <AgentHeader
            title="Hi Joe! Let's complete your onboarding"
            subtitle="You've been invited as a Company Admin. Confirm your details below."
            showPulse={true}
            isActive={isSpeaking}
            showInput={false}
          />

          <div>
            <ProgressBar currentStep={currentStepIndex + 1} totalSteps={FLOW_STEPS.length} />
          </div>

          <div className="space-y-4">
            {FLOW_STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              const isExpanded = expandedStep === step.id;
              const headerId = `step-header-${step.id}`;
              const isLocked = index > currentStepIndex && status === "inactive";

              return (
                <div key={step.id} id={`step-${step.id}`} data-step={step.id} role="region" aria-labelledby={headerId}>
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
                          {step.id === "account_details" && (
                            <StepAccountDetails
                              formData={formData}
                              onComplete={handleStepComplete}
                              isProcessing={isProcessing}
                            />
                          )}
                          {step.id === "terms" && (
                            <StepTermsConditions
                              onComplete={handleStepComplete}
                              isProcessing={isProcessing}
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

export default CompanyAdminOnboarding;
