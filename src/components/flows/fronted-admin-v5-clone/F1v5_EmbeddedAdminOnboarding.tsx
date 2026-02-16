/**
 * Flow 1 — Fronted Admin Dashboard v4 (CLONE)
 * 
 * ISOLATED: This is an independent copy of EmbeddedAdminOnboarding.tsx from v2.
 * Changes here do NOT affect v2 or any other flow.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAgentState } from "@/hooks/useAgentState";
import { motion } from "framer-motion";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { F1v5_CountryTemplatesSection } from "./F1v5_CountryTemplatesSection";

// Step components
import Step1IntroTrust from "@/components/flows/onboarding/Step1IntroTrust";
import Step2OrgProfileSimplified from "@/components/flows/onboarding/Step2OrgProfileSimplified";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step4Integrations from "@/components/flows/onboarding/Step4Integrations";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "org_profile", title: "Company details", stepNumber: 1 },
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
  // Prevent step components from mounting with stale persisted values before we reset the store
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const hasInitialized = useRef(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Ensure first step is expanded on initial load and reset flow for new company
  useEffect(() => {
    if (!hasInitialized.current) {
      setIsBootstrapping(true);

      // Always reset for a fresh start
      resetAdminFlow();

      // In edit mode, pre-populate the form data AFTER reset
      if (isEditMode && initialData) {
        updateAdminStepData("org_profile", initialData);
      }

      setExpandedStep("org_profile");
      hasInitialized.current = true;
      setIsBootstrapping(false);
    }

    // Reset on unmount so next mount starts fresh
    return () => {
      hasInitialized.current = false;
    };
  }, [resetAdminFlow, setExpandedStep, isEditMode, initialData, updateAdminStepData]);

  // Scroll to step helper
  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const handleStepComplete = async (stepId: string, data?: any) => {
    setIsProcessing(true);

    // Update form data if provided - explicitly save under the step's ID
    if (data) {
      updateAdminStepData(stepId, data);
    }
    
    // Complete the step
    completeStep(stepId);

    // Since we only have org_profile step now, complete immediately
    const orgProfileData = data || getStepData("org_profile");
    const companyName = orgProfileData?.companyName || (isEditMode ? "Company" : "New Company");
    
    toast({
      title: isEditMode ? "Company Updated" : "Company Added",
      description: `${companyName} has been ${isEditMode ? "updated" : "added"} successfully!`,
    });

    setTimeout(() => {
      onComplete(companyName, orgProfileData);
    }, 500);

    setIsProcessing(false);
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    
    // In edit mode, all steps are clickable
    if (isEditMode || status !== 'inactive') {
      if (expandedStep === stepId) {
        setExpandedStep(null);
      } else {
        setExpandedStep(stepId);
        
        setTimeout(() => {
          scrollToStep(stepId);
        }, 50);
      }
    }
  };

  const renderStepContent = (stepId: string) => {
    // For the final step, provide a merged view of earlier steps so it can
    // reflect completion states (e.g. hiring locations)
    const stepData = stepId === "finish_dashboard_transition"
      ? {
          ...(state.formData["org_profile"] || {}),
          ...(state.formData["localization_country_blocks"] || {}),
          ...(state.formData[stepId] || {}),
        }
      : (state.formData[stepId] || {});

    const stepProps = {
      formData: stepData,
      onComplete: handleStepComplete,
      onOpenDrawer: () => {},
      isProcessing: isProcessing,
      isLoadingFields: isLoadingFields
    };

    switch (stepId) {
      case "org_profile":
        return (
          <Step2OrgProfileSimplified 
            {...stepProps} 
            isEditMode={isEditMode}
            hasSignedContract={hasSignedContract}
            hasCandidates={hasCandidates}
          />
        );
      case "localization_country_blocks":
        return (
          <Step3Localization 
            {...stepProps} 
            showSkipButton={!isEditMode}
            isEditMode={isEditMode}
            hasCandidates={hasCandidates}
            existingCountries={initialData?.selectedCountries || []}
          />
        );
      case "finish_dashboard_transition":
        return <Step7Finish {...stepProps} />;
      default:
        return null;
    }
  };

  if (isBootstrapping) {
    return (
      <div className="flex-1 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
          <div
            className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))",
            }}
          />
          <div
            className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
            style={{
              background:
                "linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))",
            }}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center px-6 py-24">
          <p className="text-sm text-muted-foreground">Starting a fresh company…</p>
        </div>
      </div>
    );
  }

  // Only show the company details step
  const stepsToShow = FLOW_STEPS;

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative overflow-hidden">
      {/* Static background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
             style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
        <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
             style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
      </div>

      {/* Content */}
      <div 
        className="flex-shrink-0 flex flex-col h-full overflow-y-auto px-6 pt-8 pb-32 space-y-6 relative z-10 mx-auto"
        style={{
          width: '100%',
          maxWidth: '800px'
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex justify-center"
            style={{ maxHeight: '240px' }}
          >
            <AudioWaveVisualizer isActive={isSpeaking} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-center space-y-3 max-w-2xl"
          >
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? editModeTitle || "Edit Company" : "Add New Company"}
            </h1>
            <p className="text-base text-center text-muted-foreground">
              {isEditMode 
                ? "Update your company details below."
                : "Let's set up your new company and get ready to start managing contracts."}
            </p>
          </motion.div>
        </div>

        {/* Step Content - Render directly without StepCard wrapper */}
        <div className="space-y-3">
          {stepsToShow.map((step) => (
            <div 
              key={step.id}
              data-step={step.id}
              role="region"
            >
              <div 
                ref={(el) => stepRefs.current[step.id] = el}
              >
                {renderStepContent(step.id)}
              </div>
            </div>
          ))}
        </div>

        {/* Country Templates — inline within the form area */}
        <div className="max-w-xl mx-auto w-full">
          <F1v5_CountryTemplatesSection
            companyId={isEditMode && companyId ? companyId : "__new__"}
            companyName={companyNameProp || initialData?.companyName || "New Company"}
            isNewCompany={!isEditMode}
          />
        </div>
      </div>
    </div>
  );
};

export default F1v4_EmbeddedAdminOnboarding;
