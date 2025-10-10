import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KurtAvatar from "@/components/KurtAvatar";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { ArrowLeft, Mic, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StepStatus = "pending" | "active" | "completed";

interface Step {
  id: number;
  title: string;
  status: StepStatus;
}

const Index = () => {
  const { toast } = useToast();
  const { speak, stop } = useTextToSpeech();
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [kurtMessage, setKurtMessage] = useState(
    "Hi, can I save your details?"
  );

  // Speak Kurt's message whenever it changes (only after user has started)
  useEffect(() => {
    if (kurtMessage && hasStarted) {
      speak(kurtMessage);
    }
  }, [kurtMessage, speak, hasStarted]);

  const handleStart = () => {
    setHasStarted(true);
    speak(kurtMessage);
  };

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    country: "",
    taxId: "",
    bankName: "",
    accountNumber: "",
  });

  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: "Personal Information", status: "active" },
    { id: 2, title: "Tax Residency", status: "pending" },
    { id: 3, title: "Bank Details", status: "pending" },
    { id: 4, title: "Review & Confirm", status: "pending" },
  ]);

  const totalSteps = steps.length;

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      stop(); // Stop current speech when starting to listen
      toast({
        title: "Voice input activated",
        description: "Say 'yes' to proceed.",
      });
    } else {
      setKurtMessage("Perfect! Saving your details...");
      
      // Simulate processing and move to next step
      setTimeout(() => {
        const updatedSteps = steps.map((step) =>
          step.id === 1
            ? { ...step, status: "completed" as StepStatus }
            : step.id === 2
            ? { ...step, status: "active" as StepStatus }
            : step
        );
        setSteps(updatedSteps);
        setCurrentStep(2);
        setKurtMessage("Great! Now, what's your country of residence?");
      }, 2500);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Mark current step as completed
      const updatedSteps = steps.map((step) =>
        step.id === currentStep
          ? { ...step, status: "completed" as StepStatus }
          : step.id === currentStep + 1
          ? { ...step, status: "active" as StepStatus }
          : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);

      // Update Kurt message based on step
      const messages = [
        "Great start! Now let's confirm your tax residency.",
        "Excellent! Next, I need your bank details for payments.",
        "Almost done! Let's review everything together.",
        "Perfect! You're all set. Welcome aboard!",
      ];
      setKurtMessage(messages[currentStep] || "Let's continue!");
    } else {
      toast({
        title: "Onboarding Complete! 🎉",
        description: "Welcome to the team! You're all set up.",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const updatedSteps = steps.map((step) =>
        step.id === currentStep
          ? { ...step, status: "pending" as StepStatus }
          : step.id === currentStep - 1
          ? { ...step, status: "active" as StepStatus }
          : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep - 1);
      setKurtMessage("No problem! Let's go back to the previous step.");
    }
  };

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="country">Country of Residence</Label>
              <Select
                value={formData.country}
                onValueChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="norway">Norway</SelectItem>
                  <SelectItem value="philippines">Philippines</SelectItem>
                  <SelectItem value="poland">Poland</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID / Social Security Number</Label>
              <Input
                id="taxId"
                placeholder="123-45-6789"
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Your Bank"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {formData.firstName} {formData.lastName}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{formData.email || "Not provided"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium capitalize">
                {formData.country || "Not provided"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Bank</p>
              <p className="font-medium">
                {formData.bankName || "Not provided"}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      {/* Center Kurt Panel */}
      <section className="flex flex-col flex-1 items-center justify-center space-y-8 p-8 relative">
        <KurtAvatar isListening={isListening} message={kurtMessage} />

        {/* Input Controls */}
        {!hasStarted ? (
          <Button onClick={handleStart} size="lg" className="px-8">
            Start Conversation
          </Button>
        ) : (
          <div className="flex items-center space-x-4 mt-8">
            <Button
              onClick={handleVoiceInput}
              className={`px-6 ${
                isListening ? "bg-destructive hover:bg-destructive/90" : ""
              }`}
            >
              <Mic className="h-5 w-5 mr-2" />
              {isListening ? "Stop" : "Speak"}
            </Button>
            <Button variant="outline" className="px-6">
              <Keyboard className="h-5 w-5 mr-2" />
              Type
            </Button>
          </div>
        )}

        {/* Back Button */}
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="absolute bottom-10 left-10 flex items-center space-x-2 text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        )}
      </section>

      {/* Right Panel — Steps + Progress */}
      <aside className="w-[420px] border-l border-border bg-card px-6 py-8 space-y-6 overflow-y-auto">
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Cards */}
        <div className="space-y-3">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              title={step.title}
              status={step.status}
              stepNumber={step.id}
              isExpanded={step.id === currentStep}
              onClick={() => {
                if (step.status !== "pending") {
                  setCurrentStep(step.id);
                }
              }}
            >
              {renderStepContent(step.id)}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {currentStep === totalSteps ? "Complete" : "Next"}
                </Button>
              </div>
            </StepCard>
          ))}
        </div>
      </aside>
    </main>
  );
};

export default Index;
