import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import Topbar from "@/components/dashboard/Topbar";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import Step2OrgProfileSimplified from "@/components/flows/onboarding/Step2OrgProfileSimplified";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules";
import AdminUserManagement from "@/components/flows/admin-profile/AdminUserManagement";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import { useOnboardingStore } from "@/stores/onboardingStore";

const PROFILE_SECTIONS = [
  { id: "company-details", title: "Organization Profile", step: 1 },
  { id: "localization", title: "Localization & Countries", step: 2 },
  { id: "mini-rules", title: "Mini-Rules", step: 3 },
  { id: "user-management", title: "User Management", step: 4 }
];

const AdminProfileSettings = () => {
  const navigate = useNavigate();
  const { isSpeaking } = useAgentState();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    companyDetails: {},
    localization: {},
    miniRules: {},
    userManagement: {}
  });
  const [hasChanges, setHasChanges] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // Allow viewing without auth; load data only when session exists
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setTimeout(() => loadUserData(session.user!.id), 0);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    setLoading(true);
    try {
      const [orgProfile, localization, miniRules] = await Promise.all([
        supabase.from("organization_profiles").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("localization_settings").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("mini_rules").select("*").eq("user_id", uid)
      ]);

      // Map database columns to component expected format
      const mappedOrgProfile = orgProfile.data ? {
        companyName: orgProfile.data.company_name || "",
        legalEntityName: "",
        primaryContactName: orgProfile.data.contact_name || "Joe User",
        primaryContactEmail: orgProfile.data.contact_email || "",
        hqCountry: orgProfile.data.hq_country || "",
        payrollFrequency: orgProfile.data.payroll_frequency || "monthly",
        payoutDay: "25",
        dualApproval: true
      } : {};

      const mappedLocalization = localization.data ? {
        selectedCountries: localization.data.operating_countries || [],
        countries: localization.data.operating_countries || []
      } : {};

      const mappedMiniRules = miniRules.data ? 
        miniRules.data.map(rule => ({
          id: rule.id,
          tag: rule.rule_type as any,
          triggerType: rule.trigger_type as any || "threshold",
          description: rule.description,
          linkedAction: rule.linked_action || undefined
        })) : [];

      // Fallback to onboarding store if DB empty or no auth
      const store = useOnboardingStore.getState();
      const storeOrg = store.getAdminStepData("org_profile") || {};
      const storeLoc = store.getAdminStepData("localization_country_blocks") || {};
      const storeRules = store.getAdminStepData("mini_rules_setup") || {};

      const finalOrg = Object.keys(mappedOrgProfile).length ? mappedOrgProfile : {
        companyName: storeOrg.companyName || "",
        primaryContactName: storeOrg.primaryContactName || "Joe User",
        primaryContactEmail: storeOrg.primaryContactEmail || "",
        hqCountry: storeOrg.hqCountry || "",
        payrollFrequency: storeOrg.payrollFrequency || "monthly",
        payoutDay: storeOrg.payoutDay || "25",
        dualApproval: true
      };

      const finalLoc = Object.keys(mappedLocalization).length ? mappedLocalization : {
        selectedCountries: storeLoc.selectedCountries || [],
        countries: storeLoc.selectedCountries || []
      };

      const finalRules = mappedMiniRules.length ? mappedMiniRules : (storeRules.miniRules || []);

      setFormData({
        companyDetails: finalOrg,
        localization: finalLoc,
        miniRules: { rules: finalRules },
        userManagement: {
          users: [
            {
              id: "1",
              name: "Joe User",
              email: (finalOrg as any).primaryContactEmail || "joe@fronted.com",
              role: "admin",
              status: "active"
            }
          ]
        }
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const sectionElement = sectionRefs.current[sectionId];
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSectionClick = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      scrollToSection(sectionId);
    }
  };

  const handleFormDataChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async (stepId: string, data?: Record<string, any>) => {
    if (!data) return;

    setIsSaving(true);
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || userId;

      if (!currentUserId) {
        toast.error("Please log in to save settings");
        setIsSaving(false);
        return;
      }

      // Handle different section saves
      switch (stepId) {
        case "user-management":
          // User management is local only for now, no DB save needed
          handleFormDataChange("userManagement", data);
          setHasChanges(false);
          toast.success("✅ User management settings saved");
          setIsSaving(false);
          return;

        case "company-details":
        case "org_profile":
          await supabase
            .from("organization_profiles")
            .upsert({
              user_id: currentUserId,
              company_name: data.companyName,
              contact_name: data.primaryContactName,
              contact_email: data.primaryContactEmail,
              contact_phone: data.contact_phone || null,
              website: data.website || null,
              industry: data.industry || null,
              company_size: data.company_size || null,
              hq_country: data.hqCountry || null,
              default_currency: data.payrollCurrency || null,
              payroll_frequency: data.payrollFrequency || null
            }, { onConflict: "user_id" });
          break;

        case "localization":
        case "localization_country_blocks":
          await supabase
            .from("localization_settings")
            .upsert({
              operating_countries: data.selectedCountries,
              user_id: currentUserId
            }, { onConflict: "user_id" });
          break;

        case "mini-rules":
        case "mini_rules_setup":
          if (data.miniRules) {
            // Delete existing rules first
            await supabase
              .from("mini_rules")
              .delete()
              .eq("user_id", currentUserId);
            
            // Insert new rules
            const rulesToInsert = data.miniRules.map((rule: any) => ({
              user_id: currentUserId,
              rule_type: rule.tag || rule.type,
              trigger_type: rule.triggerType,
              description: rule.description,
              linked_action: rule.linkedAction || null
            }));
            
            if (rulesToInsert.length > 0) {
              await supabase
                .from("mini_rules")
                .insert(rulesToInsert);
            }
          }
          break;
      }

      handleFormDataChange(stepId, data);
      setHasChanges(false);
      
      // Update mini-rules structure to match expected format
      if (stepId === "mini-rules" && data.miniRules) {
        handleFormDataChange("miniRules", { rules: data.miniRules });
      }
      
      toast.success("✅ Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionStatus = (sectionId: string): "completed" | "active" | "pending" => {
    if (expandedSection === sectionId) return "active";
    
    // Check if section has data - mark as completed if it does
    const sectionKey = sectionId === "company-details" ? "companyDetails" : 
                      sectionId === "mini-rules" ? "miniRules" :
                      sectionId === "user-management" ? "userManagement" : 
                      "localization";
    
    const sectionData = formData[sectionKey];
    
    // For mini-rules, check if rules array exists and has items
    if (sectionId === "mini-rules") {
      return (sectionData?.rules && Array.isArray(sectionData.rules) && sectionData.rules.length > 0) ? "completed" : "completed";
    }
    
    // For localization, check selectedCountries
    if (sectionId === "localization") {
      return (sectionData?.selectedCountries && sectionData.selectedCountries.length > 0) ? "completed" : "completed";
    }
    
    // For other sections, check if they have data
    const hasData = sectionData && Object.keys(sectionData).length > 0;
    return hasData ? "completed" : "completed"; // Always show as completed in settings
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "company-details":
        return (
          <Step2OrgProfileSimplified
            formData={formData.companyDetails}
            onComplete={handleSaveChanges}
            onOpenDrawer={() => {}}
            isProcessing={isSaving}
            isLoadingFields={false}
            showAutoFillLoading={false}
          />
        );

      case "localization":
        return (
          <Step3Localization
            formData={formData.localization}
            onComplete={handleSaveChanges}
            onOpenDrawer={() => {}}
            isProcessing={isSaving}
          />
        );

      case "mini-rules":
        return (
          <Step5MiniRules
            formData={{ miniRules: formData.miniRules?.rules || [] }}
            onComplete={handleSaveChanges}
            onOpenDrawer={() => {}}
            isProcessing={isSaving}
          />
        );

      case "user-management":
        return (
          <AdminUserManagement
            formData={formData.userManagement}
            onComplete={handleSaveChanges}
            isProcessing={isSaving}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Topbar 
        userName="Joe User" 
        profileSettingsUrl="/admin/profile-settings"
        dashboardUrl="/dashboard-admin"
      />
      
      <AgentLayout context="admin-profile-settings">
        <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
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
                subtitle="Update your organization profile and preferences"
                showPulse={true}
                isActive={isSpeaking}
                showInput={false}
              />
            </div>

            {/* Progress Bar - Always 100% */}
            <div className="mb-4 sm:mb-6">
              <ProgressBar
                currentStep={PROFILE_SECTIONS.length}
                totalSteps={PROFILE_SECTIONS.length}
              />
              <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                <span className="text-accent-green-text">✓</span>
                Profile Complete and Verified
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-3 sm:space-y-4 pb-20 sm:pb-8">
              {PROFILE_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                >
                  <StepCard
                    stepNumber={section.step}
                    title={section.title}
                    status={getSectionStatus(section.id)}
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
                        >
                          {renderSectionContent(section.id)}
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
  );
};

export default AdminProfileSettings;
