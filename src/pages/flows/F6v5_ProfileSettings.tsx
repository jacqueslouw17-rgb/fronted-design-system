/**
 * Flow 6 — Company Admin Dashboard v5 (Future) - Profile Settings
 * Isolated clone with v7 Future glassmorphism theme.
 * Changes here do NOT affect v3/v4 or any other versions.
 */

import { useState, useEffect } from "react";
import "@/styles/v7-glass-theme.css";
import "@/styles/v7-glass-portals.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, Lock, FileText } from "lucide-react";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";

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

const EUROZONE = ["AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES", "NO", "DK", "SE"];

const DEFAULT_TEMPLATES: Record<string, string[]> = {
  NO: ["Employment Agreement", "NDA", "IP Assignment"],
  DK: ["Employment Agreement", "NDA"],
  SE: ["Employment Agreement", "NDA", "IP Assignment"],
  US: ["Employment Agreement", "NDA", "IP Assignment", "At-Will Notice"],
  GB: ["Employment Agreement", "NDA", "IP Assignment"],
  IN: ["Employment Agreement", "NDA", "IP Assignment", "Gratuity Notice"],
  PH: ["Employment Agreement", "NDA"],
  XK: ["Employment Agreement", "NDA"],
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

const F6v5_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  // Activate v7 glass portal overrides on body
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

  const formData = {
    companyName: "JBOX Technologies",
    hqCountry: "NO",
    adminName: "Joe Smith",
    adminEmail: "joe.smith@jboxtech.com",
  };

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("returnUrl") || "/flows/company-admin-dashboard-v5";
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
  const defaultCurrency = EUROZONE.includes(formData.hqCountry) ? "EUR" : "USD";
  const baseTemplates = DEFAULT_TEMPLATES[formData.hqCountry] || ["Employment Agreement", "NDA"];

  const renderAccordionContent = (sectionId: string) => {
    switch (sectionId) {
      case "company_details":
        return (
          <div className="p-4 space-y-4">
            <LockedField label="Company Name" value={formData.companyName} />
            <LockedField label="HQ Country" value={countryDisplay} />
            <LockedField label="Default Currency" value={defaultCurrency === "EUR" ? "€ EUR" : "$ USD"} />

            {/* Base Contract Templates — locked list */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Lock className="h-3 w-3" />
                Base Contract Templates
              </Label>
              <div className="space-y-1.5">
                {baseTemplates.map((template, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm text-muted-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    {template}
                  </div>
                ))}
              </div>
            </div>

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
    <div className="v7-glass-bg">
      <div className="v7-orb-center" />
      <FrostedHeader
        onLogoClick={handleClose}
        onCloseClick={handleClose}
      />

      <AgentLayout context="company-admin-profile-settings-v5">
        <div className="min-h-screen text-foreground relative">
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
                        <div key={section.id} className="v7-glass-card rounded-2xl overflow-hidden transition-all">
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
      </AgentLayout>
    </div>
  );
};

export default F6v5_ProfileSettings;
