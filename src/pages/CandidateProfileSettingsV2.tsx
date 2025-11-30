/**
 * Candidate Profile Settings v2 - For Flow 4 Candidate Dashboard v2
 * Uses 3-card overview pattern from Flow 6
 * This is isolated to Flow 4 v2 and does not affect other flows
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, FileCheck, CreditCard, Briefcase, ChevronRight, KeyRound, ArrowLeft } from "lucide-react";
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

type Section = "overview" | "profile-details" | "profile-details-inner" | "change-password" | "personal-details" | "compliance-docs" | "payroll-details" | "work-setup";

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

// Nested sections inside Profile Details
const PROFILE_DETAIL_SECTIONS = [
  {
    id: "personal-details" as Section,
    icon: User,
    title: "Personal Details",
    description: "Name, contact information, and basic personal data."
  },
  {
    id: "compliance-docs" as Section,
    icon: FileCheck,
    title: "Compliance Documents",
    description: "Upload and manage identity and compliance documents."
  },
  {
    id: "payroll-details" as Section,
    icon: CreditCard,
    title: "Payroll Details",
    description: "Banking, payout, and tax-related details."
  },
  {
    id: "work-setup" as Section,
    icon: Briefcase,
    title: "Work Setup & Agreements",
    description: "Work arrangements, policies, and contract-related documents."
  }
];

const CandidateProfileSettingsV2 = () => {
  const navigate = useNavigate();
  const { isSpeaking } = useAgentState();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
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

  const handleSectionSave = async (sectionId: string, data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }

    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSaving(false);
    // Return to the inner profile details screen after saving a nested section
    setCurrentSection("profile-details-inner");
    
    toast.success("✅ Changes saved successfully", {
      position: "bottom-right",
      duration: 3000
    });
  };

  const handleCardClick = (cardId: Section) => {
    if (cardId === "profile-details") {
      // Navigate to nested inner screen
      setCurrentSection("profile-details-inner");
    } else {
      // Navigate directly to the section
      setCurrentSection(cardId);
    }
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
                  : currentSection === "profile-details-inner"
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

              {currentSection === "profile-details-inner" && (
                <motion.div
                  key="profile-details-inner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 pb-20 sm:pb-8"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentSection("overview")}
                    className="mb-4 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile Settings
                  </Button>
                  
                  {PROFILE_DETAIL_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Card
                        key={section.id}
                        className="p-6 bg-card/20 border-border/30 cursor-pointer hover:bg-card/30 hover:border-primary/20 transition-all group"
                        onClick={() => setCurrentSection(section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-foreground mb-1">
                                {section.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {section.description}
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

              {currentSection === "personal-details" && (
                <motion.div
                  key="personal-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <div className="space-y-6">
                    <CandidateStep2PersonalDetails
                      formData={formData}
                      onComplete={(_, data) => handleSectionSave("personal-details", data)}
                      isProcessing={isSaving}
                      isLoadingFields={false}
                      buttonText="Save Changes"
                    />
                    <div className="flex justify-start">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection("profile-details-inner")}
                        className="w-auto"
                        size="lg"
                      >
                        Back to Profile Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSection === "compliance-docs" && (
                <motion.div
                  key="compliance-docs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <div className="space-y-6">
                    <CandidateStep3Compliance
                      formData={formData}
                      onComplete={(_, data) => handleSectionSave("compliance-docs", data)}
                      isProcessing={isSaving}
                      isLoadingFields={false}
                      buttonText="Save Changes"
                    />
                    <div className="flex justify-start">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection("profile-details-inner")}
                        className="w-auto"
                        size="lg"
                      >
                        Back to Profile Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSection === "payroll-details" && (
                <motion.div
                  key="payroll-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <div className="space-y-6">
                    <CandidateStep4Bank
                      formData={formData}
                      onComplete={(_, data) => handleSectionSave("payroll-details", data)}
                      isProcessing={isSaving}
                      isLoadingFields={false}
                      buttonText="Save Changes"
                    />
                    <div className="flex justify-start">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection("profile-details-inner")}
                        className="w-auto"
                        size="lg"
                      >
                        Back to Profile Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSection === "work-setup" && (
                <motion.div
                  key="work-setup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <div className="space-y-6">
                    <CandidateStep5WorkSetup
                      formData={formData}
                      onComplete={(_, data) => handleSectionSave("work-setup", data)}
                      isProcessing={isSaving}
                      isLoadingFields={false}
                      buttonText="Save Changes"
                    />
                    <div className="flex justify-start">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection("profile-details-inner")}
                        className="w-auto"
                        size="lg"
                      >
                        Back to Profile Details
                      </Button>
                    </div>
                  </div>
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
