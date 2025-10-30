import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";

// Import step components from candidate onboarding
import CandidateStep2PersonalDetails from "@/components/flows/candidate-onboarding/CandidateStep2PersonalDetails";
import CandidateStep3Compliance from "@/components/flows/candidate-onboarding/CandidateStep3Compliance";
import CandidateStep4Bank from "@/components/flows/candidate-onboarding/CandidateStep4Bank";
import CandidateStep5WorkSetup from "@/components/flows/candidate-onboarding/CandidateStep5WorkSetup";

const PROFILE_SECTIONS = [
  { id: "personal_details", title: "Personal Details", stepNumber: 1 },
  { id: "compliance_docs", title: "Compliance Documents", stepNumber: 2 },
  { id: "bank_details", title: "Payroll Details", stepNumber: 3 },
  { id: "work_setup", title: "Work Setup & Agreements", stepNumber: 4 }
];

const CandidateProfileSettings = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Pre-filled form data (from completed onboarding)
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({
    personal_details: false,
    compliance_docs: false,
    bank_details: false,
    work_setup: false
  });

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const sectionElement = stepRefs.current[sectionId];
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle section toggle
  const handleSectionClick = (sectionId: string) => {
    const wasExpanded = expandedSection === sectionId;
    
    if (wasExpanded) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      scrollToSection(sectionId);
    }
  };

  // Track changes to enable save button
  const handleFormDataChange = (sectionId: string, data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
      setHasChanges(prev => ({ ...prev, [sectionId]: true }));
    }
  };

  // Handle save changes (instead of onComplete)
  const handleSaveChanges = async (sectionId: string, data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }

    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSaving(false);
    setExpandedSection(null);
    setHasChanges(prev => ({ ...prev, [sectionId]: false }));
    
    toast.success("✅ Changes saved successfully", {
      position: "bottom-right",
      duration: 3000
    });
  };

  // Kurt's contextual suggestions based on section
  const getKurtSuggestions = (sectionId: string) => {
    switch (sectionId) {
      case "personal_details":
        return [
          { label: "View History", icon: "📋" },
          { label: "Update Address", icon: "📍" }
        ];
      case "compliance_docs":
        return [
          { label: "Upload Document", icon: "📎" },
          { label: "View Expiration", icon: "⏰" }
        ];
      case "bank_details":
        return [
          { label: "Test Connection", icon: "🔗" },
          { label: "Notify Support", icon: "💬" }
        ];
      case "work_setup":
        return [
          { label: "Update Equipment", icon: "💻" },
          { label: "Review Agreement", icon: "📄" }
        ];
      default:
        return [];
    }
  };

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName={formData.fullName} profileSettingsUrl="/candidate/profile-settings" dashboardUrl="/candidate-dashboard" />

          <div className="flex-1">
            <AgentLayout context="Profile Settings">
              <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
                {/* Static background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                  <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                       style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                  <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                       style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl relative z-10 pb-20 sm:pb-8">
                  {/* Header with Kurt */}
                  <AgentHeader
                    title="Profile Settings"
                    subtitle="Update your personal information, compliance documents, and payroll details."
                    showPulse={true}
                    isActive={isSpeaking}
                    placeholder="Ask Kurt for help..."
                    isMuted={isKurtMuted}
                    onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                    className="mb-8"
                  />

                  {/* Progress Bar - Always 100% */}
                  <div className="mb-8">
                    <ProgressBar 
                      currentStep={4} 
                      totalSteps={4}
                    />
                    <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                      Profile complete and verified
                    </p>
                  </div>

                  {/* Profile Sections */}
                  <div className="space-y-4 mb-12">
                    {PROFILE_SECTIONS.map((section) => (
                      <div 
                        key={section.id} 
                        ref={el => stepRefs.current[section.id] = el}
                      >
                        <StepCard
                          stepNumber={section.stepNumber}
                          title={section.title}
                          status="completed" // All sections marked as completed
                          isExpanded={expandedSection === section.id}
                          onClick={() => handleSectionClick(section.id)}
                        >
                          <AnimatePresence mode="wait">
                            {expandedSection === section.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6"
                              >
                                {section.id === "personal_details" && (
                                  <CandidateStep2PersonalDetails
                                    formData={formData}
                                    onComplete={handleSaveChanges}
                                    isProcessing={isSaving}
                                    isLoadingFields={isLoadingFields}
                                    buttonText="Save Changes"
                                  />
                                )}
                                
                                {section.id === "compliance_docs" && (
                                  <CandidateStep3Compliance
                                    formData={formData}
                                    onComplete={handleSaveChanges}
                                    isProcessing={isSaving}
                                    isLoadingFields={isLoadingFields}
                                    buttonText="Save Changes"
                                  />
                                )}
                                
                                {section.id === "bank_details" && (
                                  <CandidateStep4Bank
                                    formData={formData}
                                    onComplete={handleSaveChanges}
                                    isProcessing={isSaving}
                                    isLoadingFields={isLoadingFields}
                                    buttonText="Save Changes"
                                  />
                                )}
                                
                                {section.id === "work_setup" && (
                                  <CandidateStep5WorkSetup
                                    formData={formData}
                                    onComplete={handleSaveChanges}
                                    isProcessing={isSaving}
                                    isLoadingFields={isLoadingFields}
                                    buttonText="Save Changes"
                                  />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </StepCard>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <FloatingKurtButton />
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CandidateProfileSettings;
