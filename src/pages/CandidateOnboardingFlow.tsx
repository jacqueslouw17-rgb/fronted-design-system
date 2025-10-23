import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import StepCard from "@/components/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, Sparkles, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

type OnboardingStep = "welcome" | "personal" | "address" | "tax" | "bank" | "emergency" | "review" | "complete";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxResidence: string;
  tin: string;
  nationalIdFile: File | null;
  bankName: string;
  accountNumber: string;
  swiftBic: string;
  currency: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
}

export default function CandidateOnboardingFlow() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState<FormData>({
    fullName: "Maria Santos",
    email: "maria.santos@example.com",
    phone: "",
    address: "",
    city: "",
    country: "Philippines",
    taxResidence: "Philippines",
    tin: "",
    nationalIdFile: null,
    bankName: "",
    accountNumber: "",
    swiftBic: "",
    currency: "PHP",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const steps: OnboardingStep[] = ["welcome", "personal", "address", "tax", "bank", "emergency", "review"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercent = ((currentStepIndex) / (steps.length - 1)) * 100;

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = () => {
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: "✅ Onboarding Complete!",
      description: "Your details have been securely sent to Fronted.",
    });

    // Simulate backend update
    console.log("Candidate onboarding complete:", candidateId, formData);
    
    // Navigate directly to dashboard as contractor
    setTimeout(() => {
      navigate("/dashboard?role=contractor");
    }, 1000);
  };

  const renderGenieTip = (message: string) => (
    <motion.div
      initial={{ opacity: 0, x: 20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
    >
      <div className="mt-0.5">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm text-foreground/80">{message}</p>
    </motion.div>
  );

  // Welcome Screen
  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <div className="mx-auto">
              <AudioWaveVisualizer isActive={true} />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                Welcome, {formData.fullName}! 🎉
              </h1>
              <p className="text-xl text-foreground/70">
                Let's get you ready for day one at Fronted
              </p>
            </div>

            {renderGenieTip("Takes about 3–5 minutes to complete. Your info stays secure and encrypted.")}

            <Button 
              size="lg" 
              onClick={handleNext}
              className="px-8"
            >
              Start Onboarding
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Step-based layout (similar to AdminOnboarding)
  const stepConfigs = [
    { id: "personal", title: "Personal Information", desc: "Basic details about you", icon: FileText },
    { id: "address", title: "Address & Residency", desc: "Where you live and work", icon: FileText },
    { id: "tax", title: "Tax & Compliance", desc: "Required for legal compliance", icon: FileText },
    { id: "bank", title: "Bank Details", desc: "For salary payments", icon: FileText },
    { id: "emergency", title: "Emergency Contact", desc: "Optional but recommended", icon: FileText },
    { id: "review", title: "Review & Submit", desc: "Confirm your details", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-secondary/[0.03]">
      {/* Top instructional header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">Candidate Onboarding</h1>
              <p className="text-sm text-muted-foreground">
                Complete your information to finalize your employment with Fronted
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="scale-75">
                <AudioWaveVisualizer isActive={false} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Step {currentStepIndex} of {steps.length - 2}</p>
                <Progress value={progressPercent} className="h-1.5 w-32 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-8">
          {/* Left: Progress sidebar with step cards */}
          <div className="w-80 flex-shrink-0 space-y-3">
            {stepConfigs.map((step, idx) => {
              const stepIndex = steps.indexOf(step.id as OnboardingStep);
              const isCompleted = currentStepIndex > stepIndex;
              const isActive = currentStep === step.id;

              return (
                <StepCard
                  key={step.id}
                  title={step.title}
                  stepNumber={idx + 1}
                  status={isCompleted ? "completed" : isActive ? "active" : "pending"}
                  isExpanded={expandedStep === step.id}
                  onClick={() => {
                    if (isActive) {
                      setExpandedStep(expandedStep === step.id ? null : step.id);
                    }
                  }}
                >
                  <p className="text-xs text-muted-foreground mb-1">{step.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? "✓ Completed" : isActive ? "In progress" : "Pending"}
                  </p>
                </StepCard>
              );
            })}
          </div>

          {/* Right: Large centered form */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-8 space-y-8">
                    {/* Personal Info */}
                    {currentStep === "personal" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Personal Information</h2>
                          <p className="text-foreground/60">Basic details about you</p>
                        </div>

                        {renderGenieTip("These details help us ensure all documents are accurate and personalized for you.")}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name (as per ID)</Label>
                            <Input
                              id="fullName"
                              value={formData.fullName}
                              onChange={(e) => updateFormData({ fullName: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => updateFormData({ email: e.target.value })}
                              disabled
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => updateFormData({ phone: e.target.value })}
                              placeholder="+63 912 345 6789"
                            />
                          </div>
                        </div>

                        <Button onClick={handleNext} className="w-full">
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Address & Residency */}
                    {currentStep === "address" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Address & Residency</h2>
                          <p className="text-foreground/60">Where you live and work</p>
                        </div>

                        {renderGenieTip("Your address helps us ensure compliance with local labor laws and regulations.")}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Textarea
                              id="address"
                              value={formData.address}
                              onChange={(e) => updateFormData({ address: e.target.value })}
                              placeholder="123 Main Street, Barangay Example"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => updateFormData({ city: e.target.value })}
                                placeholder="Manila"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="country">Country</Label>
                              <Select value={formData.country} onValueChange={(value) => updateFormData({ country: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                                  <SelectItem value="Norway">🇳🇴 Norway</SelectItem>
                                  <SelectItem value="India">🇮🇳 India</SelectItem>
                                  <SelectItem value="United States">🇺🇸 United States</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="taxResidence">Tax Residence</Label>
                            <Input
                              id="taxResidence"
                              value={formData.taxResidence}
                              onChange={(e) => updateFormData({ taxResidence: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button onClick={handleNext} className="flex-1">
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tax & Compliance */}
                    {currentStep === "tax" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Tax & Compliance</h2>
                          <p className="text-foreground/60">Required for legal compliance</p>
                        </div>

                        {renderGenieTip(`Your TIN ensures tax compliance in ${formData.country} 🇵🇭`)}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                            <Input
                              id="tin"
                              value={formData.tin}
                              onChange={(e) => updateFormData({ tin: e.target.value })}
                              placeholder="123-456-789-000"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nationalId">National ID / Passport</Label>
                            <div className="flex items-center gap-4">
                              <Input
                                id="nationalId"
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  updateFormData({ nationalIdFile: file });
                                }}
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-foreground/60">
                              Accepted formats: PDF, JPG, PNG (max 5MB)
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button onClick={handleNext} className="flex-1">
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Bank Details */}
                    {currentStep === "bank" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Bank Details</h2>
                          <p className="text-foreground/60">For salary payments</p>
                        </div>

                        {renderGenieTip("Your bank details are encrypted and used only for salary deposits.")}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input
                              id="bankName"
                              value={formData.bankName}
                              onChange={(e) => updateFormData({ bankName: e.target.value })}
                              placeholder="BDO Unibank"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number / IBAN</Label>
                            <Input
                              id="accountNumber"
                              value={formData.accountNumber}
                              onChange={(e) => updateFormData({ accountNumber: e.target.value })}
                              placeholder="1234567890"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="swiftBic">SWIFT/BIC Code</Label>
                              <Input
                                id="swiftBic"
                                value={formData.swiftBic}
                                onChange={(e) => updateFormData({ swiftBic: e.target.value })}
                                placeholder="BNORPHMM"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="currency">Preferred Currency</Label>
                              <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PHP">PHP (₱)</SelectItem>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="NOK">NOK (kr)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button onClick={handleNext} className="flex-1">
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {currentStep === "emergency" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Emergency Contact</h2>
                          <p className="text-foreground/60">Optional but recommended</p>
                        </div>

                        {renderGenieTip("This person will be contacted in case of emergencies during your employment.")}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="emergencyName">Full Name</Label>
                            <Input
                              id="emergencyName"
                              value={formData.emergencyName}
                              onChange={(e) => updateFormData({ emergencyName: e.target.value })}
                              placeholder="John Doe"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="emergencyPhone">Phone Number</Label>
                            <Input
                              id="emergencyPhone"
                              type="tel"
                              value={formData.emergencyPhone}
                              onChange={(e) => updateFormData({ emergencyPhone: e.target.value })}
                              placeholder="+63 912 345 6789"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="emergencyRelation">Relationship</Label>
                            <Select value={formData.emergencyRelation} onValueChange={(value) => updateFormData({ emergencyRelation: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button onClick={handleNext} className="flex-1">
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Review & Submit */}
                    {currentStep === "review" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Review & Submit</h2>
                          <p className="text-foreground/60">Please review your information</p>
                        </div>

                        {renderGenieTip("Once submitted, your details will be securely sent to Fronted for processing.")}

                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-sm">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Name</p>
                                <p className="font-medium">{formData.fullName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{formData.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium">{formData.phone || "Not provided"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Country</p>
                                <p className="font-medium">{formData.country}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-sm">Bank Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Bank</p>
                                <p className="font-medium">{formData.bankName || "Not provided"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Currency</p>
                                <p className="font-medium">{formData.currency}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 border rounded-lg">
                            <Checkbox 
                              id="agree" 
                              checked={agreed}
                              onCheckedChange={(checked) => setAgreed(checked as boolean)}
                            />
                            <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                              I confirm that all information provided is accurate and complete. I understand that this data will be used for employment purposes at Fronted.
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button 
                            onClick={handleSubmit} 
                            className="flex-1"
                            disabled={!agreed}
                          >
                            Submit Onboarding
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
