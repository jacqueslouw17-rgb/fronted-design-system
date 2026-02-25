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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronRight, ChevronDown, X, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import frontedLogo from "@/assets/fronted-logo.png";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import { cn } from "@/lib/utils";

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
  "profile-details": { title: "Profile Details", subtitle: "Update your company and admin details." },
  "change-password": { title: "Change Password", subtitle: "Update your login password." },
};

const PROFILE_SECTIONS = [
  { id: "company_details", title: "Company Details" },
  { id: "admin_details", title: "Admin Details" },
];

const COUNTRIES = [
  { value: "AF", label: "Afghanistan", flag: "🇦🇫" },
  { value: "AL", label: "Albania", flag: "🇦🇱" },
  { value: "AR", label: "Argentina", flag: "🇦🇷" },
  { value: "AU", label: "Australia", flag: "🇦🇺" },
  { value: "AT", label: "Austria", flag: "🇦🇹" },
  { value: "BE", label: "Belgium", flag: "🇧🇪" },
  { value: "BR", label: "Brazil", flag: "🇧🇷" },
  { value: "CA", label: "Canada", flag: "🇨🇦" },
  { value: "CL", label: "Chile", flag: "🇨🇱" },
  { value: "CN", label: "China", flag: "🇨🇳" },
  { value: "CO", label: "Colombia", flag: "🇨🇴" },
  { value: "HR", label: "Croatia", flag: "🇭🇷" },
  { value: "CZ", label: "Czech Republic", flag: "🇨🇿" },
  { value: "DK", label: "Denmark", flag: "🇩🇰" },
  { value: "EE", label: "Estonia", flag: "🇪🇪" },
  { value: "FI", label: "Finland", flag: "🇫🇮" },
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "DE", label: "Germany", flag: "🇩🇪" },
  { value: "GR", label: "Greece", flag: "🇬🇷" },
  { value: "HK", label: "Hong Kong", flag: "🇭🇰" },
  { value: "HU", label: "Hungary", flag: "🇭🇺" },
  { value: "IS", label: "Iceland", flag: "🇮🇸" },
  { value: "IN", label: "India", flag: "🇮🇳" },
  { value: "ID", label: "Indonesia", flag: "🇮🇩" },
  { value: "IE", label: "Ireland", flag: "🇮🇪" },
  { value: "IL", label: "Israel", flag: "🇮🇱" },
  { value: "IT", label: "Italy", flag: "🇮🇹" },
  { value: "JP", label: "Japan", flag: "🇯🇵" },
  { value: "KE", label: "Kenya", flag: "🇰🇪" },
  { value: "XK", label: "Kosovo", flag: "🇽🇰" },
  { value: "LV", label: "Latvia", flag: "🇱🇻" },
  { value: "LT", label: "Lithuania", flag: "🇱🇹" },
  { value: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { value: "MY", label: "Malaysia", flag: "🇲🇾" },
  { value: "MX", label: "Mexico", flag: "🇲🇽" },
  { value: "NL", label: "Netherlands", flag: "🇳🇱" },
  { value: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { value: "NG", label: "Nigeria", flag: "🇳🇬" },
  { value: "NO", label: "Norway", flag: "🇳🇴" },
  { value: "PK", label: "Pakistan", flag: "🇵🇰" },
  { value: "PH", label: "Philippines", flag: "🇵🇭" },
  { value: "PL", label: "Poland", flag: "🇵🇱" },
  { value: "PT", label: "Portugal", flag: "🇵🇹" },
  { value: "RO", label: "Romania", flag: "🇷🇴" },
  { value: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "RS", label: "Serbia", flag: "🇷🇸" },
  { value: "SG", label: "Singapore", flag: "🇸🇬" },
  { value: "SK", label: "Slovakia", flag: "🇸🇰" },
  { value: "SI", label: "Slovenia", flag: "🇸🇮" },
  { value: "ZA", label: "South Africa", flag: "🇿🇦" },
  { value: "KR", label: "South Korea", flag: "🇰🇷" },
  { value: "ES", label: "Spain", flag: "🇪🇸" },
  { value: "SE", label: "Sweden", flag: "🇸🇪" },
  { value: "CH", label: "Switzerland", flag: "🇨🇭" },
  { value: "TH", label: "Thailand", flag: "🇹🇭" },
  { value: "TR", label: "Turkey", flag: "🇹🇷" },
  { value: "UA", label: "Ukraine", flag: "🇺🇦" },
  { value: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "VN", label: "Vietnam", flag: "🇻🇳" },
];

const F6_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "JBOX Technologies",
    hqCountry: "NO",
    adminName: "Joe Smith",
    adminEmail: "joe.smith@jboxtech.com",
  });

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("returnUrl") || "/flows/company-admin-dashboard-v3";
  };

  const handleClose = () => {
    navigate(getReturnUrl());
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSaving(false);
    setExpandedAccordion(null);
    toast.success("Changes saved", { position: "bottom-right", duration: 2500 });
  };

  const handleAccordionToggle = (sectionId: string) => {
    setExpandedAccordion(prev => prev === sectionId ? null : sectionId);
  };

  const header = SECTION_HEADERS[currentSection];
  const selectedCountry = COUNTRIES.find(c => c.value === formData.hqCountry);

  const renderAccordionContent = (sectionId: string) => {
    switch (sectionId) {
      case "company_details":
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleFieldChange("companyName", e.target.value)}
                placeholder="Company name"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hqCountry" className="text-sm">HQ Country</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between text-sm font-normal h-10"
                  >
                    {selectedCountry ? (
                      <span>{selectedCountry.flag} {selectedCountry.label}</span>
                    ) : (
                      <span className="text-muted-foreground">Select country</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." className="h-10" />
                    <CommandList className="max-h-[240px]">
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {COUNTRIES.map((country) => (
                          <CommandItem
                            key={country.value}
                            value={country.label}
                            onSelect={() => {
                              handleFieldChange("hqCountry", country.value);
                              setCountryOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.hqCountry === country.value ? "opacity-100" : "opacity-0")} />
                            {country.flag} {country.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : "Save changes"}
              </Button>
            </div>
          </div>
        );

      case "admin_details":
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminName" className="text-sm">Full Name</Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) => handleFieldChange("adminName", e.target.value)}
                placeholder="Full name"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-sm">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                className="text-sm bg-muted/50"
                disabled
              />
              <p className="text-xs text-muted-foreground">Linked to your invitation and cannot be changed</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : "Save changes"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Logo and Close Button */}
      <img
        src={frontedLogo}
        alt="Fronted"
        className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleClose}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

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
                  <div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSection("overview")}
                        className="text-xs"
                      >
                        Back
                      </Button>
                    </div>
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
