import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import Step2OrgProfile from "@/components/flows/onboarding/Step2OrgProfile";
import Step3Localization from "@/components/flows/onboarding/Step3Localization";
import Step5MiniRules from "@/components/flows/onboarding/Step5MiniRules";
import Step4Integrations from "@/components/flows/onboarding/Step4Integrations";
import { motion, AnimatePresence } from "framer-motion";

const SETTINGS_SECTIONS = [
  { id: "org-profile", title: "Organization Profile", step: 1 },
  { id: "localization", title: "Localization & Countries", step: 2 },
  { id: "mini-rules", title: "Mini Rules", step: 3 },
  { id: "integrations", title: "Integrations", step: 4 }
];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState("org-profile");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["org-profile"]));
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (uid: string) => {
    setLoading(true);
    try {
      const [orgProfile, localization, miniRules, integrations] = await Promise.all([
        supabase.from("organization_profiles").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("localization_settings").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("mini_rules").select("*").eq("user_id", uid),
        supabase.from("user_integrations").select("*").eq("user_id", uid).maybeSingle()
      ]);

      setFormData({
        orgProfile: orgProfile.data || {},
        localization: localization.data || {},
        miniRules: miniRules.data || [],
        integrations: integrations.data || {}
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
    setCurrentSection(sectionId);
  };

  const handleUpdateOrgProfile = async (stepId: string, data?: Record<string, any>) => {
    if (!userId || !data) return;
    
    try {
      const { error } = await supabase
        .from("organization_profiles")
        .upsert({ ...data, user_id: userId }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Organization profile updated!");
      setFormData(prev => ({ ...prev, orgProfile: data }));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateLocalization = async (stepId: string, data?: Record<string, any>) => {
    if (!userId || !data) return;
    
    try {
      const { error } = await supabase
        .from("localization_settings")
        .upsert({ operating_countries: data.countries, user_id: userId }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Localization settings updated!");
      setFormData(prev => ({ ...prev, localization: data }));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateMiniRules = async (stepId: string, data?: Record<string, any>) => {
    if (!userId || !data) return;
    
    try {
      await supabase.from("mini_rules").delete().eq("user_id", userId);

      if (data.rules && data.rules.length > 0) {
        const rulesToInsert = data.rules.map((rule: any) => ({
          user_id: userId,
          rule_type: rule.type,
          description: rule.description
        }));

        const { error } = await supabase.from("mini_rules").insert(rulesToInsert);
        if (error) throw error;
      }

      toast.success("Mini rules updated!");
      setFormData(prev => ({ ...prev, miniRules: data }));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateIntegrations = async (stepId: string, data?: Record<string, any>) => {
    if (!userId || !data) return;
    
    try {
      const { error } = await supabase
        .from("user_integrations")
        .upsert({ ...data, user_id: userId }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Integrations updated!");
      setFormData(prev => ({ ...prev, integrations: data }));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getSectionStatus = (sectionId: string) => {
    if (currentSection === sectionId) return "active";
    const hasData = formData[sectionId.replace("-", "")] && Object.keys(formData[sectionId.replace("-", "")]).length > 0;
    return hasData ? "completed" : "pending";
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "org-profile":
        return (
          <Step2OrgProfile
            formData={formData.orgProfile}
            onComplete={handleUpdateOrgProfile}
            onOpenDrawer={() => {}}
            isProcessing={false}
          />
        );
      case "localization":
        return (
          <Step3Localization
            formData={formData.localization}
            onComplete={handleUpdateLocalization}
            onOpenDrawer={() => {}}
            isProcessing={false}
          />
        );
      case "mini-rules":
        return (
          <Step5MiniRules
            formData={formData.miniRules}
            onComplete={handleUpdateMiniRules}
            onOpenDrawer={() => {}}
            isProcessing={false}
          />
        );
      case "integrations":
        return (
          <Step4Integrations
            formData={formData.integrations}
            onComplete={handleUpdateIntegrations}
            onOpenDrawer={() => {}}
            isProcessing={false}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your organization profile and preferences</p>
        </div>

        <div className="mb-6">
          <ProgressBar
            currentStep={SETTINGS_SECTIONS.findIndex(s => s.id === currentSection) + 1}
            totalSteps={SETTINGS_SECTIONS.length}
          />
        </div>

        <div className="space-y-4">
          {SETTINGS_SECTIONS.map((section) => (
            <StepCard
              key={section.id}
              stepNumber={section.step}
              title={section.title}
              status={getSectionStatus(section.id)}
              isExpanded={expandedSections.has(section.id)}
              onClick={() => handleSectionToggle(section.id)}
            >
              <AnimatePresence mode="wait">
                {expandedSections.has(section.id) && (
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
          ))}
        </div>
      </div>
    </div>
  );
}
