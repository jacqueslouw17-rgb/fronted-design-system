/**
 * Flow 4.1 — Employee Dashboard v6 Profile Settings
 * 
 * Isolated profile settings for v6 employees with Documents section.
 * Cloned from v4 - INDEPENDENT from other flows.
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, KeyRound, FileText, ChevronRight, Download, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import frontedLogo from "@/assets/fronted-logo.png";
import CandidateStep2PersonalDetails from "@/components/flows/candidate-onboarding/CandidateStep2PersonalDetails";
import CandidateStep3Compliance from "@/components/flows/candidate-onboarding/CandidateStep3Compliance";
import CandidateStep4Bank from "@/components/flows/candidate-onboarding/CandidateStep4Bank";
import CandidateStep5WorkSetup from "@/components/flows/candidate-onboarding/CandidateStep5WorkSetup";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";

type Section = "overview" | "profile-details" | "change-password" | "documents";
type ProfileStep = 1 | 2 | 3 | 4;

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    icon: User,
    title: "Profile Details",
    description: "View and update your personal, compliance, and work details."
  },
  {
    id: "documents" as Section,
    icon: FileText,
    title: "Documents",
    description: "Your signed documents are stored here."
  },
  {
    id: "change-password" as Section,
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password for Fronted."
  }
];

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

const F41v6_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [currentProfileStep, setCurrentProfileStep] = useState<ProfileStep>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
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

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl') || (location.state as any)?.returnUrl;
    if (returnUrl) return returnUrl;
    return '/candidate-dashboard-employee-v6';
  };

  const handleClose = () => {
    navigate(getReturnUrl());
  };

  const handleDownloadContract = () => {
    window.open("#", "_blank");
    toast.info("Downloading contract bundle...");
  };

  const handleStepSave = async (stepId: string, data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setCurrentSection("overview");
    setCurrentProfileStep(1);
    toast.success("✅ Profile details saved successfully", {
      position: "bottom-right",
      duration: 3000
    });
  };

  const handlePasswordCancel = () => {
    setCurrentSection("overview");
  };

  const handleCardClick = (cardId: Section) => {
    if (cardId === "profile-details") {
      setCurrentSection("profile-details");
      setCurrentProfileStep(1);
    } else {
      setCurrentSection(cardId);
    }
  };

  const renderProfileStepContent = () => {
    switch (currentProfileStep) {
      case 1:
        return (
          <CandidateStep2PersonalDetails 
            formData={formData} 
            onComplete={handleStepSave}
            isProcessing={isSaving}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      case 2:
        return (
          <CandidateStep3Compliance 
            formData={formData} 
            onComplete={handleStepSave}
            isProcessing={isSaving}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      case 3:
        return (
          <CandidateStep4Bank 
            formData={formData} 
            onComplete={handleStepSave}
            isProcessing={isSaving}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      case 4:
        return (
          <CandidateStep5WorkSetup 
            formData={formData} 
            onComplete={handleStepSave}
            isProcessing={isSaving}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Logo and Close Button */}
      <img 
        src={frontedLogo}
        alt="Fronted"
        className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleClose}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <AgentLayout context="employee-profile-settings-v6">
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
                  : currentSection === "documents"
                  ? "Your signed documents are stored here."
                  : ""}
                showPulse={true}
                isActive={false}
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

              {currentSection === "documents" && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 pb-20 sm:pb-8"
                >
                  <Card className="p-6 bg-card/20 border-border/30">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-5 w-5 text-accent-green-text flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Signed Contract Bundle</p>
                            <p className="text-xs text-muted-foreground">Your final HR-approved contract bundle.</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleDownloadContract} className="flex-shrink-0 ml-4">
                          <Download className="h-4 w-4 mr-1.5" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Button variant="outline" onClick={() => setCurrentSection("overview")}>
                    Back to settings
                  </Button>
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
                  <div className="flex flex-wrap items-center gap-2 max-w-4xl mx-auto">
                    {PROFILE_STEPS.map((step) => {
                      const isActive = currentProfileStep === step.number;
                      
                      return (
                        <button
                          key={step.number}
                          onClick={() => setCurrentProfileStep(step.number as ProfileStep)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-left",
                            isActive && "bg-primary/10 border border-primary/20",
                            !isActive && "bg-card/40 border border-border/30 hover:bg-card/60 hover:border-primary/10"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                            isActive && "bg-primary/20 text-primary",
                            !isActive && "bg-muted/30 text-muted-foreground"
                          )}>
                            {step.number}
                          </div>
                          <span className={cn(
                            "text-sm font-medium whitespace-nowrap",
                            isActive && "text-primary",
                            !isActive && "text-muted-foreground"
                          )}>
                            {step.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <Card className="p-6 bg-card/20 border-border/30">
                    {renderProfileStepContent()}
                  </Card>

                  <Button variant="outline" onClick={() => setCurrentSection("overview")}>
                    Back to settings
                  </Button>
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
      </AgentLayout>
    </div>
  );
};

export default F41v6_ProfileSettings;
