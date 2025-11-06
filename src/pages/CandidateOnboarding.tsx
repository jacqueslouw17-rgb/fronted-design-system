import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowState } from "@/hooks/useFlowState";
import { toast } from "@/hooks/use-toast";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import confetti from "canvas-confetti";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { motion } from "framer-motion";

// Step components
import CandidateStep2PersonalDetails from "@/components/flows/candidate-onboarding/CandidateStep2PersonalDetails";
import CandidateStep3Compliance from "@/components/flows/candidate-onboarding/CandidateStep3Compliance";
import CandidateStep4Bank from "@/components/flows/candidate-onboarding/CandidateStep4Bank";
import CandidateStep5WorkSetup from "@/components/flows/candidate-onboarding/CandidateStep5WorkSetup";
import CandidateStep4Confirm from "@/components/flows/candidate-onboarding/CandidateStep4Confirm";
import CandidateCompletionScreen from "@/components/flows/candidate-onboarding/CandidateCompletionScreen";

const FLOW_STEPS = [
  { id: "personal_details", title: "Personal Details", stepNumber: 1 },
  { id: "compliance_docs", title: "Compliance", stepNumber: 2 },
  { id: "bank_details", title: "Payroll Details", stepNumber: 3 },
  { id: "work_setup", title: "Work Setup & Agreements", stepNumber: 4 },
  { id: "confirm_submit", title: "Confirm & Submit", stepNumber: 5 }
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const isDemoMode = window.location.pathname.includes('demo');
  
  const { state, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.candidate.onboarding",
    "personal_details"
  );

  const [expandedStep, setExpandedStep] = useState<string | null>("personal_details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isSpeaking] = useState(false);


  // Prefill demo data
  useEffect(() => {
    // Always prefill for demo/preview purposes
    updateFormData({
      fullName: "Maria Santos",
      email: "maria.santos@example.com",
      companyName: "Fronted Inc",
      jobTitle: "Senior Developer",
      role: "Senior Developer",
      startDate: "2024-02-01",
      employmentType: "contractor", // contractor or employee
      country: "PH" // PH, NO, XK
    });
  }, [updateFormData]);


  // Scroll to step helper
  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      const stepElement = stepRefs.current[stepId];
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle step completion
  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    if (data) {
      updateFormData(data);
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    completeStep(stepId);
    setExpandedStep(null);
    setIsProcessing(false);

    // Navigate to next step
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const nextStep = FLOW_STEPS[currentIndex + 1];

    if (nextStep) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setIsLoadingFields(true);
      goToStep(nextStep.id);
      setExpandedStep(nextStep.id);
      scrollToStep(nextStep.id);

      await new Promise(resolve => setTimeout(resolve, 400));
      setIsLoadingFields(false);
    } else {
      // All steps complete - show completion screen
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowCompletionScreen(true);
    }
  };

  // Handle step click
  const handleStepClick = (stepId: string) => {
    const stepIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
    
    // Only allow clicking on completed steps or current step
    if (stepIndex <= currentStepIndex) {
      const wasExpanded = expandedStep === stepId;
      
      if (wasExpanded) {
        setExpandedStep(null);
      } else {
        setExpandedStep(stepId);
        scrollToStep(stepId);
      }
    }
  };


  // Show completion screen if all steps done
  if (showCompletionScreen) {
    return <CandidateCompletionScreen candidateName={state.formData.fullName} />;
  }

  return (
    <AgentLayout context="Candidate Onboarding">
      <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Static background (performance-safe) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
             style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
        <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
             style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
      </div>

      {/* Main Content - Centered Single Column */}
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Header with Agent */}
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
            <h1 className="text-3xl font-bold text-foreground">{`Hi ${state.formData.fullName?.split(' ')[0] || "there"} 👋 Welcome to Fronted!`}</h1>
            <p className={`text-base text-center transition-colors duration-300 ${isSpeaking ? "text-foreground/80" : "text-muted-foreground"}`}>
              Gather everything your new hire needs to get started quickly and compliantly.
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            currentStep={FLOW_STEPS.findIndex(s => s.id === state.currentStep) + 1} 
            totalSteps={FLOW_STEPS.length}
          />
        </div>

        {/* Step Cards */}
        <div className="space-y-3">
          {FLOW_STEPS.map((step) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = state.currentStep === step.id;
            const isExpanded = expandedStep === step.id;
            const canExpand = isCompleted || isCurrent;
            
            // Determine status
            const status = isCompleted ? "completed" : isCurrent ? "active" : "pending";

            return (
              <StepCard
                key={step.id}
                title={step.title}
                stepNumber={step.stepNumber}
                status={status}
                isExpanded={isExpanded}
                onClick={() => canExpand && handleStepClick(step.id)}
              >
                {isExpanded && (
                  <div 
                    ref={(el) => (stepRefs.current[step.id] = el)}
                    className="pt-6"
                  >
                    {step.id === "personal_details" && (
                      <CandidateStep2PersonalDetails
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "compliance_docs" && (
                      <CandidateStep3Compliance
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "bank_details" && (
                      <CandidateStep4Bank
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "work_setup" && (
                      <CandidateStep5WorkSetup
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "confirm_submit" && (
                      <CandidateStep4Confirm
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                  </div>
                )}
              </StepCard>
            );
          })}
        </div>
      </div>
    </div>
    </AgentLayout>
  );
};

export default CandidateOnboarding;
