/**
 * Flow 4.2 — Contractor Dashboard v7 Profile Settings
 * 
 * Dense, clean profile settings with aligned sections from Flow 2/3.
 * Sections: Personal Profile, Tax Details, Bank Details, Work Setup, Documents
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import frontedLogo from "@/assets/fronted-logo.png";
import WorkerStep2PersonalProfile_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep2PersonalProfile_v2";
import WorkerStep2TaxDetails_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep2TaxDetails_v2";
import WorkerStep4BankDetails_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep4BankDetails_v2";
import WorkerStep5WorkSetup_v2 from "@/components/flows/worker-onboarding-v2/WorkerStep5WorkSetup_v2";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import ProfileDocumentsSection from "@/components/flows/shared/ProfileDocumentsSection";

type Section = "overview" | "profile-details" | "documents" | "change-password";

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    title: "Profile Details",
    description: "Personal, tax, bank, and work details"
  },
  {
    id: "documents" as Section,
    title: "Documents",
    description: "Your contract and identity documents"
  },
  {
    id: "change-password" as Section,
    title: "Change Password",
    description: "Update your login password"
  },
];

const PROFILE_SECTIONS = [
  { id: "personal_profile", title: "Personal Profile" },
  { id: "tax_details", title: "Tax Details" },
  { id: "bank_details", title: "Bank Details" },
  { id: "work_setup", title: "Work Setup" },
];

const MOCK_CONTRACT_DOCUMENTS = [
  { id: "1", title: "Contractor Agreement", date: "1 Feb 2024", fileType: "PDF" },
  { id: "2", title: "NDA — Confidentiality Agreement", date: "1 Feb 2024", fileType: "PDF" },
];

const F42v7_ProfileSettings = () => {
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
    nationalId: "A12345678",
    taxCountry: "US",
    taxNumber: "123-45-6789",
    identityDocUploaded: true,
    identityFileName: "Maria_Santos_Passport.pdf",
    companyName: "Fronted Inc",
    jobTitle: "Senior Developer",
    role: "Senior Developer",
    startDate: "2024-02-01",
    employmentType: "contractor",
    taxId: "123-45-6789",
    bankName: "Chase Bank",
    bankCountry: "United States",
    accountHolder: "Maria Santos",
    accountNumber: "9876543210",
    swiftBic: "CHASUS33XXX",
    routingNumber: "021000021",
    currency: "USD",
    payAcknowledged: true,
    deviceProvided: false,
    assetAcknowledged: false,
    agreementSigned: true,
    equipment: ["laptop", "monitor"],
    acknowledgedAgreements: true
  });

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl') || (location.state as any)?.returnUrl;
    if (returnUrl) return returnUrl;
    return '/candidate-dashboard-contractor-v7';
  };

  const handleClose = () => {
    navigate(getReturnUrl());
  };

  const handleDownloadContract = () => {
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
      buttonText: "Save changes",
    };

    switch (sectionId) {
      case "personal_profile":
        return <WorkerStep2PersonalProfile_v2 {...commonProps} />;
      case "tax_details":
        return <WorkerStep2TaxDetails_v2 {...commonProps} />;
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
      
      <AgentLayout context="contractor-profile-settings-v7">
        <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
          {/* Static background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
            <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                 style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
            <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                 style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
          </div>

          <div className="w-full max-w-[800px] mx-auto py-4 sm:py-8 px-3 sm:px-4 relative z-10">
            {/* Header */}
            <div className="mb-5 sm:mb-8">
              <AgentHeader 
                title={currentSection === "overview" 
                  ? "Profile Settings" 
                  : currentSection === "profile-details"
                  ? "Profile Details"
                  : currentSection === "documents"
                  ? "Documents"
                  : "Change Password"}
                subtitle={currentSection === "overview" 
                  ? "Manage your profile and account." 
                  : currentSection === "profile-details"
                  ? "Update your personal, tax, bank, and work details."
                  : currentSection === "documents"
                  ? "Your contract and identity documents."
                  : "Update your login password."}
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 pb-20 sm:pb-8"
                >
                  {OVERVIEW_CARDS.map((card) => (
                    <button
                      key={card.id}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/50 transition-all text-left group"
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{card.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-colors" />
                    </button>
                  ))}
                </motion.div>
              )}

              {currentSection === "profile-details" && (
                <motion.div
                  key="profile-details"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="pb-20 sm:pb-8"
                >
                  <div>

                    <div className="space-y-1.5">
                      {PROFILE_SECTIONS.map((section) => {
                        const isExpanded = expandedAccordion === section.id;
                        
                        return (
                          <div key={section.id} className="rounded-xl border border-border/30 bg-card/20 overflow-hidden transition-all">
                            <button
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-card/40 transition-colors text-left group"
                              onClick={() => handleAccordionToggle(section.id)}
                            >
                              <p className="text-sm font-medium text-foreground">{section.title}</p>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-colors" />
                              )}
                            </button>
                            <AnimatePresence mode="wait">
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="border-t border-border/20"
                                >
                                  {renderAccordionContent(section.id)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentSection("overview")} 
                        className="text-xs"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSection === "documents" && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="pb-20 sm:pb-8"
                >
                  <ProfileDocumentsSection
                    contractDocuments={MOCK_CONTRACT_DOCUMENTS}
                    identityFileName={formData.identityFileName}
                    onBack={() => setCurrentSection("overview")}
                  />
                </motion.div>
              )}

              {currentSection === "change-password" && (
                <motion.div
                  key="change-password"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
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

export default F42v7_ProfileSettings;
