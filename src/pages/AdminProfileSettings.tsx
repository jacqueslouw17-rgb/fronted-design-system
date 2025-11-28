import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Building2, Users, KeyRound, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import AdminUserManagement from "@/components/flows/admin-profile/AdminUserManagement";
import Flow6ProfileDetails from "@/components/flows/admin-profile/Flow6ProfileDetails";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import frontedLogo from "@/assets/fronted-logo.png";

type Section = "overview" | "profile-details" | "user-management" | "change-password";

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    icon: Building2,
    title: "Profile Details",
    description: "Update company information and hiring locations."
  },
  {
    id: "user-management" as Section,
    icon: Users,
    title: "User Management",
    description: "View and manage company admin users."
  },
  {
    id: "change-password" as Section,
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password for Fronted."
  }
];

const AdminProfileSettings = () => {
  const navigate = useNavigate();
  const { isSpeaking } = useAgentState();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    companyName: "",
    hqCountry: "",
    adminName: "",
    adminEmail: "",
    payrollCurrency: [],
    payoutDay: "",
    selectedCountries: [],
    users: []
  });

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
      const [orgProfile, localization] = await Promise.all([
        supabase.from("organization_profiles").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("localization_settings").select("*").eq("user_id", uid).maybeSingle()
      ]);

      setFormData({
        companyName: orgProfile.data?.company_name || "",
        hqCountry: orgProfile.data?.hq_country || "",
        adminName: orgProfile.data?.contact_name || "Joe User",
        adminEmail: orgProfile.data?.contact_email || "",
        payrollCurrency: orgProfile.data?.default_currency ? [orgProfile.data.default_currency] : [],
        payoutDay: "25",
        selectedCountries: localization.data?.operating_countries || [],
        users: [
          {
            id: "1",
            name: orgProfile.data?.contact_name || "Joe User",
            email: orgProfile.data?.contact_email || "joe@fronted.com",
            role: "admin",
            status: "active"
          }
        ]
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileDetailsSave = async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || userId;

    if (!currentUserId) {
      throw new Error("Please log in to save settings");
    }

    await Promise.all([
      supabase
        .from("organization_profiles")
        .upsert({
          user_id: currentUserId,
          company_name: data.companyName,
          contact_name: data.adminName,
          contact_email: data.adminEmail,
          hq_country: data.hqCountry,
          default_currency: data.payrollCurrency?.[0] || null,
        }, { onConflict: "user_id" }),
      supabase
        .from("localization_settings")
        .upsert({
          operating_countries: data.selectedCountries,
          user_id: currentUserId
        }, { onConflict: "user_id" })
    ]);

    setFormData(prev => ({ ...prev, ...data }));
    setCurrentSection("overview");
  };

  const handleUserManagementSave = async (stepId: string, data?: Record<string, any>) => {
    if (!data) return;
    setFormData(prev => ({ ...prev, users: data.users }));
    toast.success("User management settings saved");
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
      {/* Logo and Close Button */}
      <img 
        src={frontedLogo}
        alt="Fronted"
        className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/flows/company-admin-dashboard")}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <AgentLayout context="admin-profile-settings">
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
                  ? "Manage company profile, users and your account security." 
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
                        onClick={() => setCurrentSection(card.id)}
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
                  className="pb-20 sm:pb-8"
                >
                  <Flow6ProfileDetails
                    formData={formData}
                    onSave={handleProfileDetailsSave}
                    onCancel={() => setCurrentSection("overview")}
                  />
                </motion.div>
              )}

              {currentSection === "user-management" && (
                <motion.div
                  key="user-management"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <div className="space-y-6">
                    <AdminUserManagement
                      formData={{ users: formData.users }}
                      onComplete={handleUserManagementSave}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSection("overview")}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      Back to Overview
                    </Button>
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

export default AdminProfileSettings;
