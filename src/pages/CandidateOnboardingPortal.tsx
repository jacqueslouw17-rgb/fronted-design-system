import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import confetti from "canvas-confetti";

const STEPS = [
  { id: 1, title: "Welcome", description: "Get started" },
  { id: 2, title: "Personal Details", description: "Basic info" },
  { id: 3, title: "Address & Tax", description: "Residency" },
  { id: 4, title: "Tax & ID", description: "Documents" },
  { id: 5, title: "Bank Details", description: "Payment" },
  { id: 6, title: "Emergency Contact", description: "Optional" },
  { id: 7, title: "Review & Submit", description: "Confirm" },
];

const CandidateOnboardingPortal = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    consentPrivacy: false,
  });

  // Simulate token validation and data fetch
  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, fetch from API
      setCandidateData({
        name: "Maria Santos",
        email: "maria.santos@example.com",
        company: "Fronted Inc",
        role: "Senior Backend Engineer",
      });
      setIsLoading(false);
    };

    // Allow demo mode without token
    if (token || window.location.pathname.includes('demo')) {
      validateToken();
    } else {
      toast.error("Invalid onboarding link");
    }
  }, [token]);

  const handleNext = () => {
    // Autosave
    toast.success("Saved ✓", { duration: 1500 });
    
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setIsSubmitting(false);
    setCurrentStep(8); // Success screen
    
    // Simulate backend notification
    setTimeout(() => {
      toast.success("Admin has been notified!");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (currentStep === 8) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold mb-2">All Set!</h1>
            <p className="text-muted-foreground">
              Your details have been securely sent to {candidateData.company}. 
              We'll notify you when your contract is ready for review.
            </p>
          </div>
          <Button onClick={() => window.close()}>Close</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome to {candidateData.company}</h1>
              <p className="text-sm text-muted-foreground">Complete your onboarding</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Step {currentStep} of {STEPS.length}</div>
              <div className="text-xs text-muted-foreground">{STEPS[currentStep - 1].title}</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome {candidateData.name}!</h2>
                      <p className="text-muted-foreground">
                        Let's get you ready for day one at {candidateData.company}. This will take about 3–5 minutes.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Data Privacy & Security</p>
                          <p className="text-sm text-muted-foreground">
                            Your information stays secure and encrypted. We only collect what's necessary for compliance and payroll.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consent"
                        checked={formData.consentPrivacy}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, consentPrivacy: checked })
                        }
                      />
                      <label htmlFor="consent" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I consent to data collection and processing as per the privacy policy
                      </label>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full"
                      disabled={!formData.consentPrivacy}
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Personal Details</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={candidateData.name} disabled />
                        <p className="text-xs text-muted-foreground mt-1">Prefilled from offer</p>
                      </div>
                      
                      <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" />
                      </div>
                      
                      <div>
                        <Label>Phone Number</Label>
                        <Input type="tel" placeholder="+63 XXX XXX XXXX" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button className="flex-1" onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Address & Tax Residency</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Country</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                            <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                            <SelectItem value="IN">🇮🇳 India</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Full Address</Label>
                        <Textarea placeholder="Street, city, postal code" />
                      </div>
                      
                      <div>
                        <Label>Tax Residency</Label>
                        <Input placeholder="Primary country for tax purposes" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button className="flex-1" onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Tax & ID Documents</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Tax Identification Number (TIN)</Label>
                        <Input placeholder="Your TIN" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Ensures tax compliance in 🇵🇭 Philippines
                        </p>
                      </div>
                      
                      <div>
                        <Label>National ID / Passport</Label>
                        <Input type="file" accept="image/*,.pdf" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button className="flex-1" onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Bank Details</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Account Name</Label>
                        <Input placeholder="Name as it appears on account" />
                      </div>
                      
                      <div>
                        <Label>IBAN / Account Number</Label>
                        <Input placeholder="IBAN or local account number" />
                      </div>
                      
                      <div>
                        <Label>SWIFT / BIC Code</Label>
                        <Input placeholder="Bank's SWIFT code" />
                      </div>
                      
                      <div>
                        <Label>Currency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button className="flex-1" onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Emergency Contact (Optional)</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Contact Name</Label>
                        <Input placeholder="Full name" />
                      </div>
                      
                      <div>
                        <Label>Relationship</Label>
                        <Input placeholder="e.g., Spouse, Parent, Sibling" />
                      </div>
                      
                      <div>
                        <Label>Phone Number</Label>
                        <Input type="tel" placeholder="+63 XXX XXX XXXX" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button className="flex-1" onClick={handleNext}>Continue</Button>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Review & Confirm</h2>
                    
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Personal Details</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>{candidateData.name}</p>
                          <p>{candidateData.email}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Bank Details</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>Account ending in ****1234</p>
                          <p>PHP - Philippine Peso</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="confirm" />
                      <label htmlFor="confirm" className="text-sm leading-none">
                        I confirm my details are accurate
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button 
                        className="flex-1 gap-2" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right rail - stepper */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Progress</h3>
              {STEPS.map((step) => (
                <TooltipProvider key={step.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                          currentStep === step.id
                            ? "bg-primary/10 border border-primary/20"
                            : currentStep > step.id
                            ? "bg-muted/50"
                            : "bg-background border"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            currentStep > step.id
                              ? "bg-green-500 text-white"
                              : currentStep === step.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {currentStep > step.id ? "✓" : step.id}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {step.title}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboardingPortal;
