/**
 * Flow 4.1 — Employee Dashboard v9 (Future) Profile Settings
 * 
 * Glassmorphism-themed profile settings with v7 Future aesthetic.
 * INDEPENDENT from v7 - changes here do not affect other flows.
 */

import { useState, useEffect } from "react";
import { Shield, Lock } from "lucide-react";
import "@/styles/v7-glass-theme.css";
import "@/styles/v7-glass-portals.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
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
  { id: "tax_details", title: "Pre-employment Requirements" },
  { id: "bank_details", title: "Bank Details" },
  { id: "work_setup", title: "Work Setup" },
  { id: "insurance", title: "Health Insurance" },
];

const MOCK_CONTRACT_DOCUMENTS = [
  { id: "1", title: "Employment Agreement", date: "1 Feb 2024", fileType: "PDF" },
  { id: "2", title: "NDA — Confidentiality Agreement", date: "1 Feb 2024", fileType: "PDF" },
];

const F41v8_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    workerName: "Maria",
    fullName: "Maria Santos",
    email: "maria.santos@example.com",
    phone: "+63 917 123 4567",
    dateOfBirth: "1995-06-15",
    nationality: "PH",
    address: "123 Makati Avenue, Manila",
    city: "Manila",
    postalCode: "1200",
    country: "Philippines",
    tinNumber: "123-456-789-000",
    taxCountry: "PH",
    taxNumber: "123-456-789-000",
    philHealthNumber: "12-345678901-2",
    nationalId: "1234-5678-9012-3456",
    identityDocUploaded: true,
    identityFileName: "Maria_Santos_ID.pdf",
    companyName: "Fronted Inc",
    jobTitle: "Senior Developer",
    role: "Senior Developer",
    startDate: "2024-02-01",
    employmentType: "employee",
    taxId: "123-456-789",
    bankName: "BDO Unibank",
    bankCountry: "Philippines",
    accountHolder: "Maria Santos",
    accountNumber: "1234567890",
    swiftBic: "BDOPHMMXXX",
    routingNumber: "BDOPHPMM",
    currency: "PHP",
    payAcknowledged: true,
    deviceProvided: true,
    assetAcknowledged: true,
    agreementSigned: true,
    equipment: ["laptop", "monitor"],
    acknowledgedAgreements: true
  });

  // Activate v7 glass portal overrides on body
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl') || (location.state as any)?.returnUrl;
    if (returnUrl) return returnUrl;
    return '/candidate-dashboard-employee-v8';
  };

  const handleClose = () => {
    navigate(getReturnUrl());
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

  const backButton = (
    <Button variant="outline" size="sm" onClick={() => setCurrentSection("overview")} className="text-xs">Back</Button>
  );

  const renderAccordionContent = (sectionId: string) => {
    const commonProps = {
      formData,
      onComplete: handleAccordionSave,
      isProcessing: isSaving,
      isLoadingFields: false,
      buttonText: "Save changes",
      backAction: backButton,
    };

    switch (sectionId) {
      case "personal_profile":
        return <WorkerStep2PersonalProfile_v2 {...commonProps} allFieldsLocked hideHeader hideButtons hideIdentityDoc showContactNotice />;
      case "tax_details":
        return <WorkerStep2TaxDetails_v2 {...commonProps} allFieldsLocked hideHeader hideButtons hideIdentityDoc showContactNotice />;
      case "bank_details":
        return <WorkerStep4BankDetails_v2 {...commonProps} allFieldsLocked hideHeader hideButtons showContactNotice />;
      case "work_setup":
        return <WorkerStep5WorkSetup_v2 {...commonProps} allFieldsLocked hideHeader hideButtons showContactNotice />;
      case "insurance":
        return <F41v8_InsuranceSection />;
      default:
        return null;
    }
  };

  const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
    "overview": { title: "Profile Settings", subtitle: "Manage your profile and account." },
    "profile-details": { title: "Profile Details", subtitle: "Update your personal, tax, bank, and work details." },
    "documents": { title: "Documents", subtitle: "Your contract and identity documents." },
    "change-password": { title: "Change Password", subtitle: "Update your login password." },
  };

  const header = sectionTitles[currentSection];

  return (
    <div className="v7-glass-bg">
      <div className="v7-orb-center" />
      <FrostedHeader onLogoClick={handleClose} onCloseClick={handleClose} />
      
      <AgentLayout context="employee-profile-settings-v8-future">
        <div className="min-h-screen text-foreground relative">
          <div className="w-full max-w-[800px] mx-auto py-4 sm:py-8 px-3 sm:px-4 relative z-10">
            {/* Header */}
            <div className="mb-5 sm:mb-8">
              <AgentHeader 
                title={header.title}
                subtitle={header.subtitle}
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
                      className="v7-glass-item w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left group"
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
                  <div className="space-y-1.5">
                    {PROFILE_SECTIONS.map((section) => {
                      const isExpanded = expandedAccordion === section.id;
                      
                      return (
                        <div key={section.id} className="v7-glass-item overflow-hidden">
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
                    <Button variant="outline" size="sm" onClick={() => setCurrentSection("overview")} className="text-xs">Back</Button>
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

export default F41v8_ProfileSettings;
