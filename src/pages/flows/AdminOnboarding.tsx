import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowState } from "@/hooks/useFlowState";
import FlowProgress from "@/components/flows/FlowProgress";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import KurtAvatar from "@/components/KurtAvatar";
import VoiceTypeToggle from "@/components/dashboard/VoiceTypeToggle";
import { toast } from "@/hooks/use-toast";

// Step components
import Step1IntroTrust from "@/components/flows/onboarding/Step1IntroTrust";
import Step2OrgProfile from "@/components/flows/onboarding/Step2OrgProfile";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step4Integrations from "@/components/flows/onboarding/Step4Integrations";
import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules";
import Step6Pledge from "@/components/flows/onboarding/Step6Pledge";
import Step7Finish from "@/components/flows/onboarding/Step7Finish";

const FLOW_STEPS = [
  { id: "intro_trust_model", label: "Welcome" },
  { id: "org_profile", label: "Organization" },
  { id: "localization_country_blocks", label: "Localization" },
  { id: "integrations_connect", label: "Integrations" },
  { id: "mini_rules_setup", label: "Rules" },
  { id: "transparency_pledge_esign", label: "Pledge" },
  { id: "finish_dashboard_transition", label: "Finish" }
];

const AdminOnboarding = () => {
  const { state, logEvent, updateFormData, completeStep, goToStep } = useFlowState(
    "flows.admin.f1.onboarding",
    "intro_trust_model"
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
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
      goToStep(FLOW_STEPS[currentIndex + 1].id);
    }

    toast({
      title: "Step completed",
      description: "Moving to next step..."
    });
  };

  const renderStepContent = () => {
    const stepProps = {
      formData: state.formData,
      onComplete: handleStepComplete,
      onOpenDrawer: () => setDrawerOpen(true)
    };

    switch (state.currentStep) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/flows/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Flows
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Admin Onboarding</h1>
          <div className="w-24" /> {/* Spacer for center alignment */}
        </div>
      </div>

      <FlowProgress
        steps={FLOW_STEPS}
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
      />

      <div className="flex-1 flex">
        {/* Agent-First Main View */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          drawerOpen ? "lg:w-1/2" : "w-full"
        )}>
          <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 w-full max-w-2xl space-y-8">
              {/* Agent Avatar */}
              <div className="flex flex-col items-center gap-4">
                <KurtAvatar isListening={isListening} />
              </div>

              {/* Chat History */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {agentMessages.slice(-3).map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-4 rounded-lg",
                      msg.role === "genie"
                        ? "bg-muted/50 text-foreground"
                        : "bg-primary/10 text-foreground ml-12"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Input Controls */}
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={inputMode === "voice" ? "Listening..." : "Type your message or switch to voice..."}
                    className="min-h-[100px] pr-12 resize-none"
                    disabled={inputMode === "voice"}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <VoiceTypeToggle
                      mode={inputMode}
                      isListening={isListening}
                      onToggle={handleToggleMode}
                    />
                    {inputMode === "text" && (
                      <Button size="sm" onClick={handleSend} disabled={!inputValue.trim()}>
                        Send
                      </Button>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="w-full"
                >
                  {drawerOpen ? "Hide" : "Show"} Form View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Drawer - Form View */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
            <div className="p-6">
              {renderStepContent()}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* EXTENSION: add "Draft first contract" micro-flow */}
      {/* EXTENSION: connect Vouch ATS webhook here */}
    </div>
  );
};

// Helper for conditional classes
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default AdminOnboarding;
