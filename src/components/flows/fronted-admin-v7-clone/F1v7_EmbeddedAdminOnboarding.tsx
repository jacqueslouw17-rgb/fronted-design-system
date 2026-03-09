/**
 * Flow 1 — Fronted Admin Dashboard v7 (CLONE)
 * 
 * ISOLATED: This is an independent copy of EmbeddedAdminOnboarding.tsx from v2.
 * Changes here do NOT affect v2 or any other flow.
 * 
 * v7: Multi-step onboarding with Policy & Guardrails setup for Kurt AI agent
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAgentState } from "@/hooks/useAgentState";
import { motion, AnimatePresence } from "framer-motion";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

// Step components
import F1v5_Step2OrgProfile from "./F1v7_Step2OrgProfile";
import F1v7_PolicySetupStep from "./F1v7_PolicySetupStep";
import F1v7_PolicySummary from "./F1v7_PolicySummary";

const FLOW_STEPS = [
  { id: "org_profile", title: "Client details", stepNumber: 1 },
  { id: "policy_setup", title: "Policies & guardrails", stepNumber: 2 },
  { id: "policy_summary", title: "Summary", stepNumber: 3 },
];

interface EmbeddedAdminOnboardingProps {
  onComplete: (companyName: string, companyData?: Record<string, any>) => void;
  onCancel: () => void;
  // Edit mode props
  isEditMode?: boolean;
  editModeTitle?: string;
  initialData?: Record<string, any>;
  hasSignedContract?: boolean;
  hasCandidates?: boolean;
  companyId?: string;
  companyName?: string;
}

const F1v4_EmbeddedAdminOnboarding = ({ 
  onComplete, 
  onCancel, 
  isEditMode = false,
  editModeTitle,
  initialData,
  hasSignedContract = false,
  hasCandidates = false,
  companyId,
  companyName: companyNameProp,
}: EmbeddedAdminOnboardingProps) => {
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  const { state, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepStatus, getStepData } = useAdminFlowBridge();
  const { resetAdminFlow, updateAdminStepData } = useOnboardingStore();
  
  const { currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const hasInitialized = useRef(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Multi-step state for v7
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, Record<string, any>>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Ensure first step is expanded on initial load and reset flow for new company
  useEffect(() => {
    if (!hasInitialized.current) {
      setIsBootstrapping(true);
      resetAdminFlow();

      if (isEditMode && initialData) {
        updateAdminStepData("org_profile", initialData);
      }

      setExpandedStep("org_profile");
      hasInitialized.current = true;
      setIsBootstrapping(false);
    }

    return () => {
      hasInitialized.current = false;
    };
  }, [resetAdminFlow, setExpandedStep, isEditMode, initialData, updateAdminStepData]);

  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const handleStepComplete = async (stepId: string, data?: any) => {
    setIsProcessing(true);

    if (data) {
      updateAdminStepData(stepId, data);
      setStepData(prev => ({ ...prev, [stepId]: data }));
    }
    
    completeStep(stepId);
    setCompletedSteps(prev => new Set(prev).add(stepId));

    // In edit mode, complete immediately (only org_profile step shown)
    if (isEditMode) {
      const orgProfileData = data || getStepData("org_profile");
      const companyName = orgProfileData?.companyName || "Company";
      
      toast({
        title: "Company Updated",
        description: `${companyName} has been updated successfully!`,
      });

      setTimeout(() => {
        onComplete(companyName, orgProfileData);
      }, 500);

      setIsProcessing(false);
      return;
    }

    // Multi-step: advance to next step
    const currentIdx = FLOW_STEPS.findIndex(s => s.id === stepId);
    
    if (stepId === "policy_summary") {
      // Final step — complete the whole flow
      const orgData = stepData["org_profile"] || getStepData("org_profile") || {};
      const policyData = stepData["policy_setup"] || {};
      const companyName = orgData.companyName || "New Company";
      
      toast({
        title: "Client Added",
        description: `${companyName} has been added with policies configured!`,
      });

      setTimeout(() => {
        onComplete(companyName, { ...orgData, policies: policyData });
      }, 500);
    } else if (currentIdx < FLOW_STEPS.length - 1) {
      // Move to next step
      setCurrentStep(currentIdx + 1);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setIsProcessing(false);
  };

  const renderStepContent = () => {
    const step = FLOW_STEPS[currentStep];
    if (!step) return null;

    const commonProps = {
      formData: stepData[step.id] || state.formData[step.id] || {},
      onComplete: handleStepComplete,
      isProcessing,
      isLoadingFields,
    };

    switch (step.id) {
      case "org_profile":
        return (
          <F1v5_Step2OrgProfile 
            {...commonProps} 
            formData={isEditMode ? { ...initialData, ...commonProps.formData } : commonProps.formData}
            onOpenDrawer={() => {}}
            isEditMode={isEditMode}
            hasSignedContract={hasSignedContract}
            hasCandidates={hasCandidates}
            companyId={companyId}
            companyName={companyNameProp || initialData?.companyName}
          />
        );
      case "policy_setup":
        return <F1v7_PolicySetupStep {...commonProps} formData={stepData["policy_setup"] || {}} />;
      case "policy_summary":
        return <F1v7_PolicySummary {...commonProps} formData={stepData["policy_setup"] || {}} />;
      default:
        return null;
    }
  };

  if (isBootstrapping) {
    return (
      <div className="flex-1 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center px-6 py-24">
          <p className="text-sm text-muted-foreground">Starting a fresh company…</p>
        </div>
      </div>
    );
  }

  // Edit mode: only show org_profile
  const stepsToShow = isEditMode ? [FLOW_STEPS[0]] : FLOW_STEPS;
  const activeStep = FLOW_STEPS[currentStep];

  const getStepTitle = () => {
    if (isEditMode) return editModeTitle || "Edit Company";
    switch (activeStep.id) {
      case "org_profile": return "Add new client";
      case "policy_setup": return "Set the rules";
      case "policy_summary": return "Review & confirm";
      default: return "Setup";
    }
  };

  const getStepSubtitle = () => {
    if (isEditMode) return "Update your company details below.";
    switch (activeStep.id) {
      case "org_profile": return "Basic client details to get started.";
      case "policy_setup": return "Define what your AI agent can auto-handle vs escalate.";
      case "policy_summary": return "Here's how your agent will run this client's operations.";
      default: return "";
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <div 
        className="flex-shrink-0 flex flex-col h-full overflow-y-auto px-3 sm:px-6 pt-6 sm:pt-8 pb-32 space-y-4 sm:space-y-6 relative z-10 mx-auto"
        style={{ width: '100%', maxWidth: '800px' }}
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex justify-center"
            style={{ maxHeight: '240px' }}
          >
            <AudioWaveVisualizer isActive={isSpeaking} />
          </motion.div>

          {/* Step indicator — only in create mode with multiple steps */}
          {!isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {FLOW_STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (completedSteps.has(step.id) || idx <= currentStep) {
                        setCurrentStep(idx);
                      }
                    }}
                    disabled={!completedSteps.has(step.id) && idx > currentStep}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-300",
                      idx === currentStep
                        ? "bg-primary/10 text-primary"
                        : completedSteps.has(step.id)
                        ? "bg-primary/5 text-primary/70 cursor-pointer hover:bg-primary/10"
                        : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <span className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold border",
                        idx === currentStep ? "border-primary/30 text-primary" : "border-muted-foreground/20 text-muted-foreground/40"
                      )}>
                        {idx + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  {idx < FLOW_STEPS.length - 1 && (
                    <div className={cn(
                      "w-6 h-px transition-colors duration-300",
                      completedSteps.has(step.id) ? "bg-primary/30" : "bg-border/40"
                    )} />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center space-y-2 sm:space-y-3 max-w-2xl px-2 sm:px-0"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {getStepTitle()}
              </h1>
              <p className="text-sm sm:text-base text-center text-muted-foreground">
                {getStepSubtitle()}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default F1v4_EmbeddedAdminOnboarding;
