import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { ArrowLeft, Mic, PanelRightClose, PanelRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "./Dashboard";

type StepStatus = "pending" | "active" | "completed";

interface Step {
  id: number;
  title: string;
  status: StepStatus;
}

const Index = () => {
  const { toast } = useToast();
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [kurtMessage, setKurtMessage] = useState(
    "Hi Joe, ready to save your personal details to kick off onboarding?"
  );
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-start and speak Kurt's greeting on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpeaking(true);
      speak(kurtMessage, () => {
        setIsSpeaking(false);
      });
      setChatHistory([{ role: "assistant", content: kurtMessage }]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Speak Kurt's message whenever it changes (except on mount)
  useEffect(() => {
    if (kurtMessage !== "Hi Joe, ready to save your personal details to kick off onboarding?") {
      setIsSpeaking(true);
      speak(kurtMessage, () => {
        setIsSpeaking(false);
      });
      setChatHistory((prev) => [...prev, { role: "assistant", content: kurtMessage }]);
    }
  }, [kurtMessage]);

  const [formData, setFormData] = useState({
    firstName: "Joe",
    lastName: "Smith",
    email: "joe.smith@example.com",
    country: "norway",
    taxId: "123-45-6789",
    bankName: "Nordic Bank",
    accountNumber: "9876543210",
    role: "contractor",
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
      // Just start listening - no toast or message
    } else {
      // User finished speaking
      setTimeout(() => {
        setKurtMessage("Saving details...");
      }, 500);
      
      // Process and move to next step
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
        setKurtMessage("Next, confirm your tax residency.");
      }, 2000);
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

      // Scroll to top
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

      // Update Kurt message based on step
      const messages = [
        "Great start! Now let's confirm your tax residency.",
        "Excellent! Next, I need your bank details for payments.",
        "Almost done! Let's review everything together.",
        "Perfect! You're all set. Welcome aboard!",
      ];
      setKurtMessage(messages[currentStep] || "Let's continue!");
    } else {
      // Final step - transition to dashboard
      setKurtMessage("Perfect! Saving your details now...");
      
      setTimeout(() => {
        toast({
          title: "Details Saved",
          description: "Your information has been saved successfully!",
        });
        
        setKurtMessage("All set! Preparing your workspace...");
        
        // Transition to dashboard
        setTimeout(() => {
          setShowDashboard(true);
        }, 1500);
      }, 2500);
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

  // Show dashboard if onboarding is complete
  if (showDashboard) {
    return <Dashboard userData={formData} />;
  }

  return (
    <main className="flex h-screen bg-background text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Agent Panel - 60% width */}
      <section className={`flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] transition-all duration-300 ${isFormCollapsed ? 'w-full' : 'w-[60%]'}`}>
        {/* Drawer Toggle Button - In agent panel when form visible */}
        {!isFormCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFormCollapsed(true)}
            className="absolute top-4 right-4 z-10 hover:bg-primary/10 bg-card/50 backdrop-blur-sm border border-border"
          >
            <PanelRightClose className="h-5 w-5" />
          </Button>
        )}
        {/* Stunning subtle gradient background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-[60rem] h-[40rem] rounded-full blur-[120px]"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.15))' }}
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.08, 0.12, 0.08],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute w-[50rem] h-[35rem] rounded-full blur-[100px]"
            style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.12), hsl(var(--primary) / 0.1))' }}
          />
        </motion.div>

        {/* Audio Wave Visualizer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center space-y-4"
        >
          <AudioWaveVisualizer isActive={isListening} />

          {/* Beautiful hierarchy: title and dynamic subtext */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Hi {formData.firstName}, ready to get started?
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {kurtMessage.split(' ').map((word, index) => (
                <span
                  key={index}
                  className={`transition-colors duration-150 ${
                    index === currentWordIndex - 1 
                      ? 'text-foreground font-semibold' 
                      : index < currentWordIndex - 1
                      ? 'text-foreground/70 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {word}{index < kurtMessage.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        </motion.div>

        {/* Voice Input Control */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mt-8 relative z-10"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
            {/* Ring pulse effect when listening */}
            {isListening && (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.3],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-lg border-2 border-destructive"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.4],
                    opacity: [0.4, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.3
                  }}
                  className="absolute inset-0 rounded-lg border-2 border-destructive"
                />
              </>
            )}
            <Button
              onClick={handleVoiceInput}
              className={`px-6 relative ${
                isListening 
                  ? "bg-destructive hover:bg-destructive/90" 
                  : "bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              }`}
            >
              <Mic className={`h-5 w-5 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
              <span>{isListening ? "Stop" : "Speak"}</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Back Button */}
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="absolute bottom-10 left-10 flex items-center space-x-2 text-muted-foreground hover:text-primary transition z-10"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        )}
      </section>

      {/* Drawer Toggle Button - When collapsed, show at viewport edge */}
      {isFormCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFormCollapsed(false)}
          className="absolute top-4 right-4 z-20 hover:bg-primary/10 bg-card border border-border"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      )}

      {/* Right Panel — Steps + Progress - 40% width */}
      <aside className={`border-l border-border bg-card transition-all duration-300 flex flex-col h-screen ${isFormCollapsed ? 'w-0 overflow-hidden' : 'w-[40%]'}`}>
        {/* Scrollable content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
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
                    // Toggle: collapse if already expanded, expand if not
                    setCurrentStep(currentStep === step.id ? 0 : step.id);
                    if (currentStep !== step.id) {
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }
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
                  <Button onClick={handleNext} variant="outline" className="flex-1">
                    {currentStep === totalSteps ? "Complete" : "Next"}
                  </Button>
                </div>
              </StepCard>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Index;
