/**
 * Flow 1 – Fronted Admin Dashboard v4 - Profile Settings
 * 3-card overview pattern: Company Administrators, User Management, Change Password
 * Uses shared v3 components for profile settings
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Mail, Users, KeyRound, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import AdminUserManagement from "@/components/flows/admin-profile/AdminUserManagement";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import frontedLogo from "@/assets/fronted-logo.png";
import CompanyAdministratorsDetail from "@/components/flows/admin-profile/CompanyAdministratorsDetail";

type V4Section = "overview" | "company-administrators" | "user-management" | "change-password";

const V4_OVERVIEW_CARDS = [
  {
    id: "company-administrators" as V4Section,
    icon: Mail,
    title: "Company Administrators",
    description: "Manage Fronted admin users who can access this workspace."
  },
  {
    id: "user-management" as V4Section,
    icon: Users,
    title: "User Management",
    description: "View and manage all Fronted admin accounts and roles."
  },
  {
    id: "change-password" as V4Section,
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password for Fronted."
  }
];

const FrontedAdminV4ProfileSettings = () => {
  const navigate = useNavigate();
  const { isSpeaking } = useAgentState();
  const [currentSection, setCurrentSection] = useState<V4Section>("overview");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    users: []
  });

  useEffect(() => {
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
      const [orgProfile] = await Promise.all([
        supabase.from("organization_profiles").select("*").eq("user_id", uid).maybeSingle(),
      ]);

      const adminName = orgProfile.data?.contact_name || "Joe User";
      const adminEmail = orgProfile.data?.contact_email || "joe@fronted.com";

      setFormData({
        users: [
          {
            id: "1",
            name: adminName,
            email: adminEmail,
            role: "admin",
            status: "active" as const
          }
        ]
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
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
        onClick={() => navigate("/flows/fronted-admin-dashboard-v4")}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <AgentLayout context="admin-profile-settings-v4">
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
                  ? "Manage company admin access and your account security." 
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
                  key="v4-overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 pb-20 sm:pb-8"
                >
                  {V4_OVERVIEW_CARDS.map((card) => {
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

              {currentSection === "company-administrators" && (
                <motion.div
                  key="v4-company-administrators"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <CompanyAdministratorsDetail
                    onCancel={() => setCurrentSection("overview")}
                  />
                </motion.div>
              )}

              {currentSection === "user-management" && (
                <motion.div
                  key="v4-user-management"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <div className="space-y-6">
                    <FrontedAdminV4UserManagement
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
                  key="v4-change-password"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pb-20 sm:pb-8"
                >
                  <FrontedAdminV4ChangePassword
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

export default FrontedAdminV4ProfileSettings;
