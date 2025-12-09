/**
 * Flow 1 – Fronted Admin Dashboard v4 Embedded Onboarding
 * 
 * Detached clone of EmbeddedAdminOnboarding from v3.
 * Full-screen Add New Company flow within v4.
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

// Step components
import Step2OrgProfileSimplified from "@/components/flows/onboarding/Step2OrgProfileSimplified";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "org_profile", title: "Company details", stepNumber: 1 },
  { id: "localization_country_blocks", title: "Hiring Locations", stepNumber: 2 },
  { id: "finish_dashboard_transition", title: "Finish & Launch", stepNumber: 3 }
];

interface FrontedAdminV4EmbeddedOnboardingProps {
  onComplete: (companyName: string) => void;
  onCancel: () => void;
}

const FrontedAdminV4EmbeddedOnboarding = ({ onComplete, onCancel }: FrontedAdminV4EmbeddedOnboardingProps) => {
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  const { state, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepStatus, getStepData } = useAdminFlowBridge();
  const { resetAdminFlow } = useOnboardingStore();
  
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

  // Ensure first step is expanded on initial load and reset flow for new company
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
      // Read company name directly from store to ensure we get the latest saved value
      const orgProfileData = getStepData("org_profile");
      const companyName = orgProfileData?.companyName || "New Company";
      
      toast({
        title: "Setup Complete",
        description: `${companyName} is ready to go!`,
      });

      setTimeout(() => {
        onComplete(companyName);
      }, 500);
    } else {
      // Move to next step
      const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
      if (currentIndex < FLOW_STEPS.length - 1) {
        const nextStep = FLOW_STEPS[currentIndex + 1];
        goToStep(nextStep.id);
        setExpandedStep(nextStep.id);
        
        setTimeout(() => {
          scrollToStep(nextStep.id);
        }, 100);
      }
    }

    setIsProcessing(false);
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    
    if (status !== 'inactive') {
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
        return <Step2OrgProfileSimplified {...stepProps} />;
      case "localization_country_blocks":
        return <Step3Localization {...stepProps} />;
      case "finish_dashboard_transition":
        return <Step7Finish {...stepProps} />;
      default:
        return null;
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
  const totalSteps = FLOW_STEPS.length;

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
            <h1 className="text-3xl font-bold text-foreground">Add New Company</h1>
            <p className="text-base text-center text-muted-foreground">
              Let's set up your new company and get ready to start managing contracts.
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />
        </div>

        {/* Step Cards */}
        <div className="space-y-3">
          {FLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isExpanded = expandedStep === step.id;
            const headerId = `step-header-${step.id}`;
            
            const currentIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
            const isLocked = index > currentIndex && status === 'inactive';

            // Generate subtitle for step 3 (localization) when collapsed
            let subtitle = undefined;
            if (step.id === 'localization_country_blocks' && !isExpanded) {
              const stepData = state.formData[step.id];
              if (stepData?.selectedCountries && stepData.selectedCountries.length > 0) {
                const COUNTRIES = [
                  { code: "NO", name: "Norway", flag: "🇳🇴" },
                  { code: "PH", name: "Philippines", flag: "🇵🇭" },
                  { code: "IN", name: "India", flag: "🇮🇳" },
                  { code: "XK", name: "Kosovo", flag: "🇽🇰" }
                ];
                const countryNames = stepData.selectedCountries
                  .map((code: string) => {
                    const country = COUNTRIES.find(c => c.code === code);
                    return country ? `${country.flag} ${country.name}` : code;
                  })
                  .join(", ");
                subtitle = countryNames;
              }
            }

            return (
              <div 
                key={step.id}
                data-step={step.id}
                role="region"
                aria-labelledby={headerId}
              >
                <StepCard
                  title={step.title}
                  status={status}
                  stepNumber={step.stepNumber}
                  isExpanded={isExpanded}
                  onClick={() => handleStepClick(step.id)}
                  headerId={headerId}
                  isLocked={isLocked}
                  subtitle={subtitle}
                >
                  {isExpanded && (
                    <div 
                      ref={(el) => stepRefs.current[step.id] = el}
                      className="pt-6"
                    >
                      {renderStepContent(step.id)}
                    </div>
                  )}
                </StepCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FrontedAdminV4EmbeddedOnboarding;
