/**
 * Flow 6 — Company Admin Dashboard v3/v4 Profile Settings
 * Shared across v3 and v4 (agnostic). v7-style clean UI.
 * Sections: Profile Details (Company Details + Admin Details accordion) and Change Password.
 * Profile Details fields sourced from Flow 5 Company Admin Onboarding v1:
 *   - Full Name, Email (locked), Company Name, HQ Country
 *   - Excludes payroll currencies, payout day, and default currency per memory
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronDown, Lock, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";

type Section = "overview" | "profile-details" | "change-password";

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    title: "Profile Details",
    description: "Company and admin account details"
  },
  {
    id: "change-password" as Section,
    title: "Change Password",
    description: "Update your login password"
  },
];

const SECTION_HEADERS: Record<Section, { title: string; subtitle: string }> = {
  "overview": { title: "Profile Settings", subtitle: "Manage your company profile and account." },
  "profile-details": { title: "Profile Details", subtitle: "Your company and admin details." },
  "change-password": { title: "Change Password", subtitle: "Update your login password." },
};

const PROFILE_SECTIONS = [
  { id: "company_details", title: "Company Details" },
  { id: "admin_details", title: "Admin Details" },
];

const COUNTRIES: Record<string, { label: string; flag: string }> = {
  NO: { label: "Norway", flag: "🇳🇴" },
  DK: { label: "Denmark", flag: "🇩🇰" },
  SE: { label: "Sweden", flag: "🇸🇪" },
  US: { label: "United States", flag: "🇺🇸" },
  GB: { label: "United Kingdom", flag: "🇬🇧" },
  IN: { label: "India", flag: "🇮🇳" },
  PH: { label: "Philippines", flag: "🇵🇭" },
  XK: { label: "Kosovo", flag: "🇽🇰" },
};

const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-1.5 text-muted-foreground text-sm">
      <Lock className="h-3 w-3" />
      {label}
    </Label>
    <Input value={value} disabled className="bg-muted/50 text-muted-foreground cursor-not-allowed text-sm" />
  </div>
);

const F6_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const formData = {
    companyName: "JBOX Technologies",
    hqCountry: "NO",
    adminName: "Joe Smith",
    adminEmail: "joe.smith@jboxtech.com",
  };

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("returnUrl") || "/flows/company-admin-dashboard-v3";
  };

  const handleClose = () => {
    navigate(getReturnUrl());
  };

  const handleAccordionToggle = (sectionId: string) => {
    setExpandedAccordion(prev => prev === sectionId ? null : sectionId);
  };

  const header = SECTION_HEADERS[currentSection];
  const countryInfo = COUNTRIES[formData.hqCountry];
  const countryDisplay = countryInfo ? `${countryInfo.flag} ${countryInfo.label}` : formData.hqCountry;

  const renderAccordionContent = (sectionId: string) => {
    switch (sectionId) {
      case "company_details":
        return (
          <div className="p-4 space-y-4">
            <LockedField label="Company Name" value={formData.companyName} />
            <LockedField label="HQ Country" value={countryDisplay} />
            <p className="text-xs text-muted-foreground">
              Need to update your details? Contact your Fronted admin.
            </p>
          </div>
        );

      case "admin_details":
        return (
          <div className="p-4 space-y-4">
            <LockedField label="Full Name" value={formData.adminName} />
            <LockedField label="Email" value={formData.adminEmail} />
            <p className="text-xs text-muted-foreground">
              Need to update your details? Contact your Fronted admin.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Logo and Close Button */}
      <FrostedHeader onLogoClick={handleClose} onCloseClick={handleClose} />

      <AgentLayout context="company-admin-profile-settings">
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
                    <Button variant="outline" size="sm" onClick={() => setCurrentSection("overview")} className="text-xs">Back</Button>
                  </div>
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
      </AgentLayout>
    </div>
  );
};

export default F6_ProfileSettings;
