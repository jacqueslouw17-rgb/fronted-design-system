import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCandidateDataFlowBridge } from "@/hooks/useCandidateDataFlowBridge";
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

const FLOW_STEPS = [
  { id: "personal_details", title: "Personal Details", stepNumber: 1 },
  { id: "compliance", title: "Compliance & Tax", stepNumber: 2 },
  { id: "bank_details", title: "Bank Details", stepNumber: 3 },
  { id: "work_setup", title: "Work Setup", stepNumber: 4 },
  { id: "confirm", title: "Review & Confirm", stepNumber: 5 }
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const isDemoMode = window.location.pathname.includes('demo');
  
  const { state, updateFormData, completeStep, goToStep, expandedStep, setExpandedStep, getStepData } = useCandidateDataFlowBridge();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasInitialized = useRef(false);

  const [isSpeaking] = useState(false);

  // Get all form data (flattened from all steps) with proper typing
  const allFormData: Record<string, any> = Object.values(state.formData).reduce(
    (acc, stepData) => ({ ...acc, ...stepData }), 
    {} as Record<string, any>
  );

  // Prefill demo data and ensure first step is expanded
  useEffect(() => {
    if (!hasInitialized.current) {
      // Only prefill if no data exists yet
      if (!allFormData.fullName) {
        updateFormData({
          fullName: "Sofia Rodriguez",
          email: "sofia.rodriguez@email.com",
          role: "Marketing Manager",
          salary: "$72,000 USD",
          employmentType: "Contractor",
          startDate: "2025-02-01",
          country: "Mexico",
          companyName: "Fronted Inc",
          jobTitle: "Marketing Manager"
        });
      }
      
      // Always ensure first step is expanded on initial page load
      setExpandedStep("personal_details");
      hasInitialized.current = true;
    }
  }, [updateFormData, allFormData.fullName, setExpandedStep]);


  // Scroll to step helper
  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      const stepElement = stepRefs.current[stepId];
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle step completion - submit form and redirect to dashboard
  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    if (data) {
      updateFormData(data);
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    completeStep(stepId);
    setIsProcessing(false);

    // Find the next step
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const nextStep = FLOW_STEPS[currentIndex + 1];

    if (nextStep) {
      // Go to next step
      await new Promise(resolve => setTimeout(resolve, 300));
      setExpandedStep(nextStep.id);
      scrollToStep(nextStep.id);
    } else {
      // All steps complete - show loading and redirect to dashboard
      setIsSubmitting(true);
      setExpandedStep(null);
      
      // Fire silent analytics event (if backend is configured)
      // logEvent?.({ type: 'onboarding_complete', candidateId });
      
      // Short delay with loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate directly to dashboard
      navigate('/candidate-dashboard');
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


  return (
    <AgentLayout context="Candidate Onboarding">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">Wrapping up your setup...</p>
          </motion.div>
        </div>
      )}
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
            <h1 className="text-3xl font-bold text-foreground">{`Hi ${allFormData.fullName?.split(' ')[0] || "there"}! Let's complete your profile`}</h1>
            <p className={`text-base text-center transition-colors duration-300 ${isSpeaking ? "text-foreground/80" : "text-muted-foreground"}`}>
              Let's gather a few more details to get your onboarding started smoothly.
            </p>
          </motion.div>
        </div>

        {/* Step Cards */}
        <div className="space-y-3">
          {FLOW_STEPS.filter(step => step.id === "personal_details").map((step) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = state.currentStep === step.id;
            const isExpanded = expandedStep === step.id;
            const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
            const stepIndex = FLOW_STEPS.findIndex(s => s.id === step.id);
            const isLocked = stepIndex > currentStepIndex && !isCompleted;
            
            // Determine status - match admin onboarding pattern
            let status: "inactive" | "active" | "completed" = "inactive";
            if (isCompleted) {
              status = "completed";
            } else if (isCurrent) {
              status = "active";
            } else if (stepIndex <= currentStepIndex) {
              status = "completed"; // Already passed steps should be completed
            }

            return (
              <StepCard
                key={step.id}
                title={step.title}
                stepNumber={step.stepNumber}
                status={status}
                isLocked={isLocked}
                isExpanded={isExpanded}
                onClick={() => !isLocked && handleStepClick(step.id)}
              >
                {isExpanded && (
                  <div 
                    ref={(el) => (stepRefs.current[step.id] = el)}
                  >
                    {step.id === "personal_details" && (
                      <CandidateStep2PersonalDetails
                        formData={allFormData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                        buttonText="Send Form"
                      />
                    )}
                    {step.id === "compliance" && (
                      <CandidateStep3Compliance
                        formData={allFormData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                      />
                    )}
                    {step.id === "bank_details" && (
                      <CandidateStep4Bank
                        formData={allFormData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                      />
                    )}
                    {step.id === "work_setup" && (
                      <CandidateStep5WorkSetup
                        formData={allFormData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                      />
                    )}
                    {step.id === "confirm" && (
                      <CandidateStep4Confirm
                        formData={allFormData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
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
