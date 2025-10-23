import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowState } from "@/hooks/useFlowState";
import { toast } from "@/hooks/use-toast";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import confetti from "canvas-confetti";

// Step components
import CandidateStep1Welcome from "@/components/flows/candidate-onboarding/CandidateStep1Welcome";
import CandidateStep2Personal from "@/components/flows/candidate-onboarding/CandidateStep2Personal";
import CandidateStep3Tax from "@/components/flows/candidate-onboarding/CandidateStep3Tax";
import CandidateStep4Bank from "@/components/flows/candidate-onboarding/CandidateStep4Bank";
import CandidateStep5Emergency from "@/components/flows/candidate-onboarding/CandidateStep5Emergency";
import CandidateStep6Review from "@/components/flows/candidate-onboarding/CandidateStep6Review";

const FLOW_STEPS = [
  { id: "welcome_consent", title: "Welcome & Consent", stepNumber: 1 },
  { id: "personal_identity", title: "Personal & Identity", stepNumber: 2 },
  { id: "tax_residency", title: "Tax Residency", stepNumber: 3 },
  { id: "bank_details", title: "Bank Details", stepNumber: 4 },
  { id: "emergency_contact", title: "Emergency Contact", stepNumber: 5 },
  { id: "review_submit", title: "Review & Submit", stepNumber: 6 }
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const isDemoMode = window.location.pathname.includes('demo');
  
  const { state, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.candidate.onboarding",
    "welcome_consent"
  );

  const [expandedStep, setExpandedStep] = useState<string | null>("welcome_consent");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Prefill demo data
  useEffect(() => {
    if (isDemoMode) {
      updateFormData({
        fullName: "Maria Santos",
        email: "maria.santos@example.com",
        companyName: "Fronted Inc",
        jobTitle: "Senior Developer"
      });
    }
  }, [isDemoMode, updateFormData]);

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
      // All steps complete - show success
      setShowSuccess(true);
      
      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Onboarding Complete!",
        description: "Thank you! We're preparing your contract now.",
      });

      // Redirect after delay
      setTimeout(() => {
        if (isDemoMode) {
          navigate('/flows');
        } else {
          // In production, redirect to dashboard
          navigate('/dashboard');
        }
      }, 3000);
    }
  };

  // Handle step click
  const handleStepClick = (stepId: string) => {
    const stepIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
    
    // Only allow clicking on completed steps or current step
    if (stepIndex <= currentStepIndex) {
      if (expandedStep === stepId) {
        setExpandedStep(null);
      } else {
        setExpandedStep(stepId);
        scrollToStep(stepId);
      }
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">All Set!</h1>
            <p className="text-muted-foreground">
              Thanks! We're preparing your contract. You'll receive an email shortly to review and sign.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/')}>
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  return (
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
        {/* Header with Animation */}
        <div className="text-center space-y-6 mb-8">
          {/* Decorative animated bars */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-12 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-16 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-2 h-12 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <div className="w-2 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground">
            {state.formData.companyName ? `Welcome to ${state.formData.companyName}` : 'Welcome to Fronted'}
          </h1>
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
                    {step.id === "welcome_consent" && (
                      <CandidateStep1Welcome
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "personal_identity" && (
                      <CandidateStep2Personal
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "tax_residency" && (
                      <CandidateStep3Tax
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
                    {step.id === "emergency_contact" && (
                      <CandidateStep5Emergency
                        formData={state.formData}
                        onComplete={handleStepComplete}
                        isProcessing={isProcessing}
                        isLoadingFields={isLoadingFields}
                      />
                    )}
                    {step.id === "review_submit" && (
                      <CandidateStep6Review
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
  );
};

export default CandidateOnboarding;
