/**
 * Candidate Profile Settings v2 - For Flow 4 Candidate Dashboard v2
 * Uses 3-card overview pattern from Flow 6
 * This is isolated to Flow 4 v2 and does not affect other flows
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, FileCheck, CreditCard, Briefcase, ChevronRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import frontedLogo from "@/assets/fronted-logo.png";

// Import existing candidate onboarding step components
import CandidateStep2PersonalDetails from "@/components/flows/candidate-onboarding/CandidateStep2PersonalDetails";
import CandidateStep3Compliance from "@/components/flows/candidate-onboarding/CandidateStep3Compliance";
import CandidateStep4Bank from "@/components/flows/candidate-onboarding/CandidateStep4Bank";
import CandidateStep5WorkSetup from "@/components/flows/candidate-onboarding/CandidateStep5WorkSetup";

type Section = "overview" | "profile-details" | "change-password";
type ProfileStep = 1 | 2 | 3 | 4;

// Top-level cards (2 cards only)
const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    icon: User,
    title: "Profile Details",
    description: "View and update your personal, compliance, and work details."
  },
  {
    id: "change-password" as Section,
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password for Fronted."
  }
];

// Profile Details steps configuration
const PROFILE_STEPS = [
  {
    number: 1,
    label: "Personal Details",
    description: "Name, contact information, and basic personal data."
  },
  {
    number: 2,
    label: "Compliance Documents",
    description: "Upload and manage identity and compliance documents."
  },
  {
    number: 3,
    label: "Payroll Details",
    description: "Banking, payout, and tax-related details."
  },
  {
    number: 4,
    label: "Work Setup & Agreements",
    description: "Work arrangements, policies, and contract-related documents."
  }
];

const CandidateProfileSettingsV2 = () => {
  const navigate = useNavigate();
  const { isSpeaking } = useAgentState();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [currentProfileStep, setCurrentProfileStep] = useState<ProfileStep>(1);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pre-filled form data (from completed onboarding)
  const [formData, setFormData] = useState({
    fullName: "Maria Santos",
    email: "maria.santos@example.com",
    phone: "+63 917 123 4567",
    dateOfBirth: "1995-06-15",
    nationality: "PH",
    address: "123 Makati Avenue, Manila",
    city: "Manila",
    postalCode: "1200",
    country: "PH",
    companyName: "Fronted Inc",
    jobTitle: "Senior Developer",
    role: "Senior Developer",
    startDate: "2024-02-01",
    employmentType: "contractor",
    taxId: "123-456-789",
    bankName: "BDO Unibank",
    accountNumber: "1234567890",
    routingNumber: "BDOPHPMM",
    currency: "PHP",
    equipment: ["laptop", "monitor"],
    acknowledgedAgreements: true
  });

  const handleStepSave = async (data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }

    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSaving(false);
    
    // Move to next step or complete
    if (currentProfileStep < 4) {
      setCurrentProfileStep((currentProfileStep + 1) as ProfileStep);
      toast.success("✅ Changes saved", {
        position: "bottom-right",
        duration: 2000
      });
    } else {
      // Final step - return to overview
      setCurrentSection("overview");
      setCurrentProfileStep(1);
      toast.success("✅ Profile details saved successfully", {
        position: "bottom-right",
        duration: 3000
      });
    }
  };

  const handleCardClick = (cardId: Section) => {
    if (cardId === "profile-details") {
      setCurrentSection("profile-details");
      setCurrentProfileStep(1);
    } else {
      setCurrentSection(cardId);
    }
  };

  const handlePreviousStep = () => {
    if (currentProfileStep > 1) {
      setCurrentProfileStep((currentProfileStep - 1) as ProfileStep);
    }
  };

  const handleNextStep = () => {
    if (currentProfileStep < 4) {
      setCurrentProfileStep((currentProfileStep + 1) as ProfileStep);
    }
  };

  const isStepValid = () => {
    // Add validation logic per step if needed
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Logo and Close Button */}
      <img 
        src={frontedLogo}
        alt="Fronted"
        className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/flows/candidate-dashboard-v2")}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/flows/candidate-dashboard-v2")}
        className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <AgentLayout context="candidate-profile-settings">
        <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
          {/* Static background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
            <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                 style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
            <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                 style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
          </div>

          <div className="container max-w-4xl mx-auto py-4 sm:py-8 px-4 relative z-10">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <AgentHeader 
                title="Profile Settings"
                subtitle={currentSection === "overview" 
                  ? "Manage your profile details and account security." 
                  : currentSection === "profile-details"
                  ? "Update your personal, compliance, and work details."
                  : ""}
                showPulse={true}
                isActive={isSpeaking}
                showInput={false}
              />
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {currentSection === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 pb-20 sm:pb-8"
                >
                  {OVERVIEW_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <Card
                        key={card.id}
                        className="p-6 bg-card/20 border-border/30 cursor-pointer hover:bg-card/30 hover:border-primary/20 transition-all group"
                        onClick={() => handleCardClick(card.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-foreground mb-1">
                                {card.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {card.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Card>
                    );
                  })}
                </motion.div>
              )}

              {currentSection === "profile-details" && (
                <motion.div
                  key="profile-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 pb-20 sm:pb-8"
                >
                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 sm:gap-4 max-w-4xl mx-auto overflow-x-auto pb-2">
                    {PROFILE_STEPS.map((step, index) => (
                      <div key={step.number} className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <div className={`flex items-center gap-2 ${currentProfileStep === step.number ? 'text-primary' : 'text-muted-foreground'}`}>
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                            currentProfileStep === step.number ? 'border-primary bg-primary/10' : 'border-border bg-background'
                          }`}>
                            {step.number}
                          </div>
                          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{step.label}</span>
                        </div>
                        {index < PROFILE_STEPS.length - 1 && (
                          <div className="h-[2px] w-8 sm:w-12 bg-border flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step Content */}
                  <div className="max-w-xl mx-auto space-y-6">
                    {currentProfileStep === 1 && (
                      <CandidateStep2PersonalDetails
                        formData={formData}
                        onComplete={(_, data) => handleStepSave(data)}
                        isProcessing={isSaving}
                        isLoadingFields={false}
                        buttonText="Next"
                      />
                    )}

                    {currentProfileStep === 2 && (
                      <CandidateStep3Compliance
                        formData={formData}
                        onComplete={(_, data) => handleStepSave(data)}
                        isProcessing={isSaving}
                        isLoadingFields={false}
                        buttonText="Next"
                      />
                    )}

                    {currentProfileStep === 3 && (
                      <CandidateStep4Bank
                        formData={formData}
                        onComplete={(_, data) => handleStepSave(data)}
                        isProcessing={isSaving}
                        isLoadingFields={false}
                        buttonText="Next"
                      />
                    )}

                    {currentProfileStep === 4 && (
                      <CandidateStep5WorkSetup
                        formData={formData}
                        onComplete={(_, data) => handleStepSave(data)}
                        isProcessing={isSaving}
                        isLoadingFields={false}
                        buttonText="Save Changes"
                      />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={currentProfileStep === 1 ? () => setCurrentSection("overview") : handlePreviousStep}
                        className="flex-1"
                        size="lg"
                      >
                        {currentProfileStep === 1 ? "Cancel" : "Previous"}
                      </Button>
                      {currentProfileStep < 4 && (
                        <Button
                          onClick={handleNextStep}
                          disabled={!isStepValid()}
                          className="flex-1"
                          size="lg"
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSection === "change-password" && (
                <motion.div
                  key="change-password"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <Flow6ChangePassword
                    onCancel={() => setCurrentSection("overview")}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
        <FloatingKurtButton />
      </AgentLayout>
    </div>
  );
};

export default CandidateProfileSettingsV2;
