/**
 * Flow 3 – Candidate Onboarding v2
 * 
 * DETACHED CLONE of v1 - changes here do NOT affect v1
 * All navigation stays within v2 routes
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { useWorkerFlowBridge } from "@/hooks/useWorkerFlowBridge";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";

import WorkerStep1Welcome_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep1Welcome_v2";
import WorkerStep2Personal_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep2Personal_v2";
import WorkerStep3Compliance_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep3Compliance_v2";
import WorkerStep4Payroll_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep4Payroll_v2";
import WorkerStep5WorkSetup_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep5WorkSetup_v2";
import WorkerStep7Finish_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep7Finish_v2";
import WorkerCompletionScreen_v2 from "@/components/flows/worker-onboarding-v2/WorkerCompletionScreen_v2";

import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";

const FLOW_STEPS = [
  { id: "welcome", title: "Welcome and setup", icon: "👋" },
  { id: "personal", title: "Confirm Personal Information", icon: "👤" },
  { id: "compliance", title: "Compliance Requirements", icon: "📋" },
  { id: "payroll", title: "Payroll Details", icon: "💰" },
  { id: "work_setup", title: "Work Setup & Agreements", icon: "💼" },
  { id: "finish", title: "All Set!", icon: "🎉" }
];

const WorkerOnboardingV2 = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  
  const { state, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepStatus } = useWorkerFlowBridge();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  useEffect(() => {
    if (!hasInitialized.current) {
      updateFormData({
        workerName: "Maria",
        email: "maria.santos@example.com",
        country: "Philippines",
        employmentType: "employee"
      });
      setExpandedStep('welcome');
      hasInitialized.current = true;
    }
  }, [expandedStep, state.currentStep, updateFormData, setExpandedStep]);

  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const isFinalStep = currentIndex === FLOW_STEPS.length - 1;
    
    if (!isFinalStep) {
      setIsProcessing(true);
    }
    
    if (data) {
      updateFormData(data);
    }

    if (!isFinalStep) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    completeStep(stepId);
    
    if (!isFinalStep) {
      setIsProcessing(false);
    }
    
    if (isFinalStep) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
    const status = getStepStatus(stepId);
    if (status !== "inactive") {
      const wasExpanded = expandedStep === stepId;
      const newExpandedStep = wasExpanded ? null : stepId;
      setExpandedStep(newExpandedStep);
      goToStep(stepId);
      
      if (newExpandedStep) {
        setTimeout(() => scrollToStep(stepId), 50);
      }
    }
  };

  if (showCompletionScreen) {
    const workerName = state.formData[state.currentStep]?.workerName || state.formData.workerName || "Maria";
    return <WorkerCompletionScreen_v2 workerName={workerName} />;
  }

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);

  return (
    <AgentLayout context="Worker Onboarding">
      <main className="flex min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => navigate('/?tab=flows')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        </div>

        <div 
          className="flex-shrink-0 flex flex-col min-h-screen p-8 pb-32 space-y-8 relative z-10 mx-auto onboarding-scroll-container"
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <AgentHeader
            title="Hi Maria! Let's complete your onboarding"
            subtitle="Review and confirm your details below to finalize your profile."
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
              const currentIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
              const isLocked = index > currentIndex && status === 'inactive';

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
                          {step.id === "welcome" && <WorkerStep1Welcome_v2 formData={state.formData} onComplete={handleStepComplete} isProcessing={isProcessing} isLoadingFields={isLoadingFields} />}
                          {step.id === "personal" && <WorkerStep2Personal_v2 formData={state.formData} onComplete={handleStepComplete} isProcessing={isProcessing} isLoadingFields={isLoadingFields} />}
                          {step.id === "compliance" && <WorkerStep3Compliance_v2 formData={state.formData} onComplete={handleStepComplete} isProcessing={isProcessing} isLoadingFields={isLoadingFields} />}
                          {step.id === "payroll" && <WorkerStep4Payroll_v2 formData={state.formData} onComplete={handleStepComplete} isProcessing={isProcessing} isLoadingFields={isLoadingFields} />}
                          {step.id === "work_setup" && <WorkerStep5WorkSetup_v2 formData={state.formData} onComplete={handleStepComplete} isProcessing={isProcessing} isLoadingFields={isLoadingFields} />}
                          {step.id === "finish" && <WorkerStep7Finish_v2 formData={state.formData} onComplete={handleStepComplete} isProcessing={isProcessing} isLoadingFields={isLoadingFields} />}
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

export default WorkerOnboardingV2;