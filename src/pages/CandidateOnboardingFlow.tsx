import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, Sparkles } from "lucide-react";
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

  const steps: OnboardingStep[] = ["welcome", "personal", "address", "tax", "bank", "emergency", "review", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercent = ((currentStepIndex) / (steps.length - 1)) * 100;

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = () => {
    setCurrentStep("complete");
    
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
    setTimeout(() => {
      console.log("Candidate onboarding complete:", candidateId, formData);
    }, 500);
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

  // Complete Screen
  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="h-24 w-24 text-success mx-auto" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                All Set! ✨
              </h1>
              <p className="text-xl text-foreground/70">
                Your details have been securely sent to Fronted
              </p>
            </div>

            {renderGenieTip("Your information is now being processed. You'll receive your contract documents shortly!")}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to Dashboard
              </Button>
              <Button onClick={() => navigate("/")}>
                Track Contract Status
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Form Steps
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStepIndex <= 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <span className="text-sm text-foreground/60">
              Step {currentStepIndex} of {steps.length - 2}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6 py-12">
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

                    <Button onClick={handleNext} className="w-full">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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

                    <Button onClick={handleNext} className="w-full">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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

                    <Button onClick={handleNext} className="w-full">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                          placeholder="Juan Dela Cruz"
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

                    <Button onClick={handleNext} className="w-full">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Review & Confirm */}
                {currentStep === "review" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Review & Confirm</h2>
                      <p className="text-foreground/60">Please verify all information is correct</p>
                    </div>

                    <div className="space-y-4">
                      <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-foreground/60">Personal Info</p>
                            <p className="font-medium">{formData.fullName}</p>
                            <p className="text-sm text-foreground/70">{formData.email}</p>
                            <p className="text-sm text-foreground/70">{formData.phone}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-foreground/60">Address</p>
                            <p className="text-sm">{formData.address}</p>
                            <p className="text-sm">{formData.city}, {formData.country}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-foreground/60">Tax & Compliance</p>
                            <p className="text-sm">TIN: {formData.tin || "Not provided"}</p>
                            <p className="text-sm">Tax Residence: {formData.taxResidence}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-foreground/60">Bank Details</p>
                            <p className="text-sm">{formData.bankName}</p>
                            <p className="text-sm">Account: {formData.accountNumber}</p>
                            <p className="text-sm">Currency: {formData.currency}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <Checkbox 
                        id="agree" 
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked === true)}
                      />
                      <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                        I confirm that all the details provided above are accurate and complete to the best of my knowledge.
                      </label>
                    </div>

                    <Button 
                      onClick={handleSubmit} 
                      className="w-full"
                      disabled={!agreed}
                    >
                      Submit Onboarding
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
