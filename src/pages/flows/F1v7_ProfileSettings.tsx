/**
 * Flow 1 – Fronted Admin Dashboard v7 (Experimental) - Profile Settings
 * Isolated from v6 per flow isolation policy
 */

import { useState, useEffect } from "react";
import "@/styles/v7-glass-theme.css";
import "@/styles/v7-glass-portals.css";
import { useNavigate } from "react-router-dom";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
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
import { F1v5_CompanyAdministratorsDetail } from "@/components/flows/fronted-admin-v7-clone/F1v7_CompanyAdministratorsDetail";
import { F1v5_TeamMembersSection } from "@/components/flows/fronted-admin-v7-clone/F1v7_TeamMembersSection";
import { F1v5_RolesPermissionsSection } from "@/components/flows/fronted-admin-v7-clone/F1v7_RolesPermissionsSection";
import { F1v7_ExportSection } from "@/components/flows/fronted-admin-v7-clone/F1v7_ExportSection";

type Section = "overview" | "company-administrators" | "team-members" | "roles-permissions" | "change-password" | "export";

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

const F1v7_ProfileSettings = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Set body class for portal-level glass overrides
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

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
    <div className="v7-glass-bg">
      <div className="v7-orb-center" />
      <FrostedHeader
        onLogoClick={() => navigate("/flows/fronted-admin-dashboard-v7-clone")}
        onCloseClick={() => navigate(-1)}
      />

      <AgentLayout context="admin-profile-settings-v7">
        <RBACProvider>
          <div className="min-h-screen text-foreground relative">
            <div className="w-full max-w-[800px] mx-auto py-4 sm:py-8 px-3 sm:px-4 relative z-10">
              <div className="mb-5 sm:mb-8">
                <AgentHeader
                  title={header.title}
                  subtitle={header.subtitle}
                  showPulse={true}
                  isActive={false}
                  showInput={false}
                />
              </div>

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
                  <motion.div key="company-administrators" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="pb-20 sm:pb-8">
                    <F1v5_CompanyAdministratorsDetail onBack={() => setCurrentSection("overview")} />
                  </motion.div>
                )}

                {currentSection === "team-members" && (
                  <motion.div key="team-members" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="pb-20 sm:pb-8">
                    <F1v5_TeamMembersSection onBack={() => setCurrentSection("overview")} onNavigateToRoles={() => setCurrentSection("roles-permissions")} />
                  </motion.div>
                )}

                {currentSection === "roles-permissions" && (
                  <motion.div key="roles-permissions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="pb-20 sm:pb-8">
                    <F1v5_RolesPermissionsSection onBack={() => setCurrentSection("overview")} />
                  </motion.div>
                )}

                {currentSection === "change-password" && (
                  <motion.div key="change-password" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="pb-20 sm:pb-8">
                    <Flow6ChangePassword onCancel={() => setCurrentSection("overview")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </RBACProvider>
      </AgentLayout>
    </div>
  );
};

export default F1v7_ProfileSettings;
