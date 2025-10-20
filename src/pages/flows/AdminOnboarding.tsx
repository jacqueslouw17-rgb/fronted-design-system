import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowState } from "@/hooks/useFlowState";
import { Textarea } from "@/components/ui/textarea";
import KurtAvatar from "@/components/KurtAvatar";
import VoiceTypeToggle from "@/components/dashboard/VoiceTypeToggle";
import { toast } from "@/hooks/use-toast";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";

// Step components
import Step1IntroTrust from "@/components/flows/onboarding/Step1IntroTrust";
import Step2OrgProfile from "@/components/flows/onboarding/Step2OrgProfile";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step4Integrations from "@/components/flows/onboarding/Step4Integrations";
import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules";
import Step6Pledge from "@/components/flows/onboarding/Step6Pledge";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "intro_trust_model", title: "Welcome & Trust Model", stepNumber: 1 },
  { id: "org_profile", title: "Organization Profile", stepNumber: 2 },
  { id: "localization_country_blocks", title: "Localization & Countries", stepNumber: 3 },
  { id: "integrations_connect", title: "Integrations", stepNumber: 4 },
  { id: "mini_rules_setup", title: "Mini-Rules", stepNumber: 5 },
  { id: "transparency_pledge_esign", title: "Transparency Pledge", stepNumber: 6 },
  { id: "finish_dashboard_transition", title: "Finish & Launch", stepNumber: 7 }
];

const AdminOnboarding = () => {
  const { state, logEvent, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.admin.f1.onboarding",
    "intro_trust_model"
  );

  const [expandedStep, setExpandedStep] = useState<string | null>(state.currentStep);
  const [inputMode, setInputMode] = useState<"voice" | "text">("text");
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [agentMessages, setAgentMessages] = useState<Array<{ role: "user" | "genie"; content: string }>>([
    {
      role: "genie",
      content: "Welcome! I'm Genie. I'll prepare everything and ask you to confirm key actions. You can switch between chat and forms anytime."
    }
  ]);

  const handleToggleMode = () => {
    const newMode = inputMode === "voice" ? "text" : "voice";
    setInputMode(newMode);
    
    if (newMode === "voice") {
      setIsListening(true);
      toast({
        title: "Voice mode activated",
        description: "Speak naturally, I'm listening..."
      });
    } else {
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    logEvent(state.currentStep, "user", "input", { message: inputValue });
    setAgentMessages(prev => [...prev, { role: "user", content: inputValue }]);
    
    // Simulate Genie response
    setTimeout(() => {
      const response = getGenieResponse(state.currentStep, inputValue);
      setAgentMessages(prev => [...prev, { role: "genie", content: response }]);
      logEvent(state.currentStep, "genie", "input", { message: response });
    }, 800);

    setInputValue("");
  };

  const getGenieResponse = (step: string, userInput: string): string => {
    // Simple response logic based on step
    const responses: Record<string, string> = {
      intro_trust_model: "Great! Let me show you what we'll set up together. Click 'Get Started' when you're ready.",
      org_profile: "I can help fill in your organization details. Just tell me your company name and location.",
      localization_country_blocks: "Which countries do you operate in? I'll load the relevant compliance rules for each.",
      integrations_connect: "Let's connect your tools. I can set up Slack notifications and FX rate feeds.",
      mini_rules_setup: "I'll create some starter rules for approvals and compliance. You can customize them anytime.",
      transparency_pledge_esign: "Our transparency pledge ensures you always know what's happening. Ready to review and sign?",
      finish_dashboard_transition: "You're all set! Would you like me to help draft your first contract?"
    };
    return responses[step] || "I'm here to help. What would you like to do next?";
  };

  const handleStepComplete = (stepId: string, data?: Record<string, any>) => {
    if (data) {
      updateFormData(data);
    }
    completeStep(stepId);
    
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    if (currentIndex < FLOW_STEPS.length - 1) {
      const nextStep = FLOW_STEPS[currentIndex + 1];
      goToStep(nextStep.id);
      setExpandedStep(nextStep.id);
    }

    toast({
      title: "Step completed",
      description: "Moving to next step..."
    });
  };

  const getStepStatus = (stepId: string): "pending" | "active" | "completed" => {
    if (state.completedSteps.includes(stepId)) return "completed";
    if (stepId === state.currentStep) return "active";
    return "pending";
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    if (status !== "pending") {
      setExpandedStep(expandedStep === stepId ? null : stepId);
      goToStep(stepId);
    }
  };

  const renderStepContent = (stepId: string) => {
    const stepProps = {
      formData: state.formData,
      onComplete: handleStepComplete,
      onOpenDrawer: () => {}
    };

    switch (stepId) {
      case "intro_trust_model":
        return <Step1IntroTrust {...stepProps} />;
      case "org_profile":
        return <Step2OrgProfile {...stepProps} />;
      case "localization_country_blocks":
        return <Step3Localization {...stepProps} />;
      case "integrations_connect":
        return <Step4Integrations {...stepProps} />;
      case "mini_rules_setup":
        return <Step5MiniRules {...stepProps} />;
      case "transparency_pledge_esign":
        return <Step6Pledge {...stepProps} />;
      case "finish_dashboard_transition":
        return <Step7Finish {...stepProps} />;
      default:
        return null;
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === state.currentStep);
  const totalSteps = FLOW_STEPS.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/flows/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Flows
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Onboarding</h1>
          <p className="text-muted-foreground">
            Complete setup: introduce Genie, capture settings, configure rules, and launch your dashboard
          </p>
        </div>

        <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />

        <div className="mt-8 space-y-4">
          {FLOW_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            const isExpanded = expandedStep === step.id;

            return (
              <StepCard
                key={step.id}
                title={step.title}
                status={status}
                stepNumber={step.stepNumber}
                isExpanded={isExpanded}
                onClick={() => handleStepClick(step.id)}
              >
                {isExpanded && (
                  <div className="pt-6">
                    {renderStepContent(step.id)}
                  </div>
                )}
              </StepCard>
            );
          })}
        </div>
      </div>

      {/* EXTENSION: add "Draft first contract" micro-flow */}
      {/* EXTENSION: connect Vouch ATS webhook here */}
    </div>
  );
};

export default AdminOnboarding;
