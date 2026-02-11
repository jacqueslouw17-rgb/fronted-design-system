/**
 * Flow 4.2 — Contractor Dashboard v6 Profile Settings
 * 
 * Isolated profile settings for v6 contractors with Documents section.
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
import StepCard from "@/components/StepCard";
import WorkerStep2PersonalProfile_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep2PersonalProfile_v2";
import WorkerStep4BankDetails_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep4BankDetails_v2";
import WorkerStep5WorkSetup_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep5WorkSetup_v2";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";

type Section = "overview" | "profile-details" | "change-password" | "documents";

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    icon: User,
    title: "Profile Details",
    description: "View and update your personal, bank, and work details."
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

const PROFILE_SECTIONS = [
  { id: "personal_profile", title: "Personal Profile", icon: "👤" },
  { id: "bank_details", title: "Bank Details", icon: "🏦" },
  { id: "work_setup", title: "Work Setup & Agreements", icon: "💼" },
];

const F42v6_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    workerName: "Maria",
    fullName: "Maria Santos",
    email: "maria.santos@example.com",
    phone: "+1 555 123 4567",
    dateOfBirth: "1995-06-15",
    nationality: "US",
    address: "456 Market Street, San Francisco",
    city: "San Francisco",
    postalCode: "94102",
    country: "United States",
    companyName: "Fronted Inc",
    jobTitle: "Senior Developer",
    role: "Senior Developer",
    startDate: "2024-02-01",
    employmentType: "contractor",
    taxId: "123-45-6789",
    bankName: "Chase Bank",
    bankCountry: "United States",
    accountNumber: "9876543210",
    routingNumber: "021000021",
    currency: "USD",
    equipment: ["laptop", "monitor"],
    acknowledgedAgreements: true
  });

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl') || (location.state as any)?.returnUrl;
    if (returnUrl) return returnUrl;
    return '/candidate-dashboard-contractor-v6';
  };

  const handleClose = () => {
    navigate(getReturnUrl());
  };

  const handleDownloadContract = () => {
    window.open("#", "_blank");
    toast.info("Downloading contract bundle...");
  };

  const handleAccordionSave = async (stepId: string, data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSaving(false);
    setExpandedAccordion(null);
    toast.success("Changes saved", {
      position: "bottom-right",
      duration: 2500
    });
  };

  const handleAccordionToggle = (sectionId: string) => {
    setExpandedAccordion(prev => prev === sectionId ? null : sectionId);
  };

  const handleCardClick = (cardId: Section) => {
    setCurrentSection(cardId);
    if (cardId === "profile-details") {
      setExpandedAccordion(null);
    }
  };

  const renderAccordionContent = (sectionId: string) => {
    const commonProps = {
      formData,
      onComplete: handleAccordionSave,
      isProcessing: isSaving,
      isLoadingFields: false,
    };

    switch (sectionId) {
      case "personal_profile":
        return <WorkerStep2PersonalProfile_v2 {...commonProps} />;
      case "bank_details":
        return <WorkerStep4BankDetails_v2 {...commonProps} />;
      case "work_setup":
        return <WorkerStep5WorkSetup_v2 {...commonProps} />;
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
      
      <AgentLayout context="contractor-profile-settings-v6">
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
                  ? "Update your personal, bank, and work details."
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
                  className="space-y-3 pb-20 sm:pb-8"
                >
                  {PROFILE_SECTIONS.map((section, index) => {
                    const isExpanded = expandedAccordion === section.id;
                    
                    return (
                      <StepCard
                        key={section.id}
                        stepNumber={index + 1}
                        title={section.title}
                        status="completed"
                        isExpanded={isExpanded}
                        onClick={() => handleAccordionToggle(section.id)}
                      >
                        <AnimatePresence mode="wait">
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {renderAccordionContent(section.id)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </StepCard>
                    );
                  })}

                  <Button variant="outline" onClick={() => setCurrentSection("overview")} className="mt-4">
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

export default F42v6_ProfileSettings;
