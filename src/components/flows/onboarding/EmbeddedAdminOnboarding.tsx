/**
 * ⚠️ LOCKED COMPONENT - Part of Flow 1.1 Fronted Admin Dashboard v2 ⚠️
 * 
 * This component is part of a LOCKED flow and should NOT be modified.
 * See: src/pages/AdminContractingMultiCompany.tsx
 * Flow: Flow 1.1 — Fronted Admin Dashboard v2
 * Locked Date: 2025-01-15
 * 
 * Embedded Admin Onboarding Flow
 * 
 * This is a duplicate of Flow 1 Admin Onboarding, adapted to render
 * within the dashboard rather than as a standalone page.
 */

import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useAgentState } from "@/hooks/useAgentState";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboardingStore";

// Step components
import Step2OrgProfileSimplified from "@/components/flows/onboarding/Step2OrgProfileSimplified";

interface EmbeddedAdminOnboardingProps {
  onComplete: (companyName: string, companyData?: Record<string, any>) => void;
  onCancel: () => void;
  // Edit mode props
  isEditMode?: boolean;
  editModeTitle?: string;
  initialData?: Record<string, any>;
  hasSignedContract?: boolean;
  hasCandidates?: boolean;
}

const EmbeddedAdminOnboarding = ({ 
  onComplete, 
  onCancel, 
  isEditMode = false,
  editModeTitle,
  initialData,
  hasSignedContract = false,
  hasCandidates = false,
}: EmbeddedAdminOnboardingProps) => {
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  const { completeStep, getStepData } = useAdminFlowBridge();
  const { resetAdminFlow, updateAdminStepData } = useOnboardingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const hasInitialized = useRef(false);

  // Sync local speaking state with agent state
  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  // Initialize the flow on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      setIsBootstrapping(true);

      // Always reset for a fresh start
      resetAdminFlow();

      // In edit mode, pre-populate the form data AFTER reset
      if (isEditMode && initialData) {
        updateAdminStepData("org_profile", initialData);
      }

      hasInitialized.current = true;
      setIsBootstrapping(false);
    }

    // Reset on unmount so next mount starts fresh
    return () => {
      hasInitialized.current = false;
    };
  }, [resetAdminFlow, isEditMode, initialData, updateAdminStepData]);

  const handleStepComplete = async (stepId: string, data?: any) => {
    setIsProcessing(true);

    // Update form data if provided
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

  const formData = getStepData("org_profile") || {};

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

        {/* Company Details Form */}
        <Step2OrgProfileSimplified 
          formData={formData}
          onComplete={handleStepComplete}
          onOpenDrawer={() => {}}
          isProcessing={isProcessing}
          isEditMode={isEditMode}
          hasSignedContract={hasSignedContract}
          hasCandidates={hasCandidates}
        />
      </div>
    </div>
  );
};

export default EmbeddedAdminOnboarding;
