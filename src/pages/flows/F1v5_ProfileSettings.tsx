/**
 * Flow 1 – Fronted Admin Dashboard v5 - Profile Settings
 * Clean v7-style UI: text-only overview cards, dynamic headers, centered back buttons
 * Isolated from v4 per flow isolation policy
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { RBACProvider } from "@/contexts/RBACContext";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import frontedLogo from "@/assets/fronted-logo.png";
import { F1v5_CompanyAdministratorsDetail } from "@/components/flows/fronted-admin-v5-clone/F1v5_CompanyAdministratorsDetail";
import { F1v5_TeamMembersSection } from "@/components/flows/fronted-admin-v5-clone/F1v5_TeamMembersSection";
import { F1v5_RolesPermissionsSection } from "@/components/flows/fronted-admin-v5-clone/F1v5_RolesPermissionsSection";

type Section = "overview" | "company-administrators" | "team-members" | "roles-permissions" | "change-password";

const OVERVIEW_CARDS = [
  {
    id: "company-administrators" as Section,
    title: "End-client Administrators",
    description: "Manage end-client admin access to this workspace"
  },
  {
    id: "team-members" as Section,
    title: "Team Members",
    description: "Invite and manage team members with role assignments"
  },
  {
    id: "roles-permissions" as Section,
    title: "Roles & Permissions",
    description: "Create and configure roles with module-level permissions"
  },
  {
    id: "change-password" as Section,
    title: "Change Password",
    description: "Update your login password"
  }
];

const SECTION_HEADERS: Record<Section, { title: string; subtitle: string }> = {
  "overview": { title: "Profile Settings", subtitle: "Manage company admin access and your account security." },
  "company-administrators": { title: "End-client Administrators", subtitle: "Manage end-client admin users who can access this workspace." },
  "team-members": { title: "Team Members", subtitle: "Invite and manage team members with role assignments." },
  "roles-permissions": { title: "Roles & Permissions", subtitle: "Create and configure roles with module-level permissions." },
  "change-password": { title: "Change Password", subtitle: "Update your login password." },
};

const F1v5_ProfileSettings = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setLoading(false);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const header = SECTION_HEADERS[currentSection];

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
        onClick={() => navigate("/flows/fronted-admin-dashboard-v5-clone")}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      <AgentLayout context="admin-profile-settings-v5">
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

            <div className="w-full max-w-[800px] mx-auto py-4 sm:py-8 px-3 sm:px-4 relative z-10">
              {/* Dynamic Header */}
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
                        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/50 transition-all text-left group"
                        onClick={() => setCurrentSection(card.id)}
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

                {currentSection === "company-administrators" && (
                  <motion.div
                    key="company-administrators"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="pb-20 sm:pb-8"
                  >
                    <F1v5_CompanyAdministratorsDetail
                      onBack={() => setCurrentSection("overview")}
                    />
                  </motion.div>
                )}

                {currentSection === "team-members" && (
                  <motion.div
                    key="team-members"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="pb-20 sm:pb-8"
                  >
                    <F1v5_TeamMembersSection
                      onBack={() => setCurrentSection("overview")}
                      onNavigateToRoles={() => setCurrentSection("roles-permissions")}
                    />
                  </motion.div>
                )}

                {currentSection === "roles-permissions" && (
                  <motion.div
                    key="roles-permissions"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="pb-20 sm:pb-8"
                  >
                    <F1v5_RolesPermissionsSection
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
          <FloatingKurtButton />
        </RBACProvider>
      </AgentLayout>
    </div>
  );
};

export default F1v5_ProfileSettings;
