/**
 * Flow 1 – Fronted Admin Dashboard v4 - Profile Settings
 * 4-card overview: Company Administrators, Team Members, Roles & Permissions, Change Password
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Mail, Users, Shield, KeyRound, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import frontedLogo from "@/assets/fronted-logo.png";
import CompanyAdministratorsDetail from "@/components/flows/admin-profile/CompanyAdministratorsDetail";
import { TeamMembersSection } from "@/components/flows/admin-profile/rbac/TeamMembersSection";
import { RolesPermissionsSection } from "@/components/flows/admin-profile/rbac/RolesPermissionsSection";
import { RBACProvider } from "@/contexts/RBACContext";

type Section = "overview" | "company-administrators" | "team-members" | "roles-permissions" | "change-password";

const OVERVIEW_CARDS = [
  {
    id: "company-administrators" as Section,
    icon: Mail,
    title: "End-client Administrators",
    description: "Manage End-client admin users who can access this workspace."
  },
  {
    id: "team-members" as Section,
    icon: Users,
    title: "Team Members",
    description: "Invite and manage team members with role assignments."
  },
  {
    id: "roles-permissions" as Section,
    icon: Shield,
    title: "Roles & Permissions",
    description: "Create and configure roles with module-level permissions."
  },
  {
    id: "change-password" as Section,
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password for Fronted."
  }
];

const FrontedAdminProfileSettings = () => {
  const navigate = useNavigate();
  const { isSpeaking } = useAgentState();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setLoading(false);
    });
  }, []);

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
        onClick={() => navigate("/flows/fronted-admin-dashboard-v4-clone")}
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
        <RBACProvider>
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

                {currentSection === "company-administrators" && (
                  <motion.div
                    key="company-administrators"
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

                {currentSection === "team-members" && (
                  <motion.div
                    key="team-members"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="pb-20 sm:pb-8"
                  >
                    <TeamMembersSection
                      onBack={() => setCurrentSection("overview")}
                      onNavigateToRoles={() => setCurrentSection("roles-permissions")}
                    />
                  </motion.div>
                )}

                {currentSection === "roles-permissions" && (
                  <motion.div
                    key="roles-permissions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="pb-20 sm:pb-8"
                  >
                    <RolesPermissionsSection
                      onBack={() => setCurrentSection("overview")}
                    />
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
        </RBACProvider>
      </AgentLayout>
    </div>
  );
};

export default FrontedAdminProfileSettings;
