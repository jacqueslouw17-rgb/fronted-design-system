/**
 * Flow 6 — Company Admin Dashboard v3/v4 Profile Settings
 * Shared across v3 and v4 (agnostic). v7-style clean UI.
 * Sections: Profile Details (Company Details + Admin Details accordion) and Change Password.
 * Profile Details fields sourced from Flow 5 Company Admin Onboarding v1.
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronDown, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import frontedLogo from "@/assets/fronted-logo.png";
import Flow6ChangePassword from "@/components/flows/admin-profile/Flow6ChangePassword";
import FloatingKurtButton from "@/components/FloatingKurtButton";

type Section = "overview" | "profile-details" | "change-password";

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    title: "Profile Details",
    description: "Company information, payroll setup, and admin details"
  },
  {
    id: "change-password" as Section,
    title: "Change Password",
    description: "Update your login password"
  },
];

const SECTION_HEADERS: Record<Section, { title: string; subtitle: string }> = {
  "overview": { title: "Profile Settings", subtitle: "Manage your company profile and account." },
  "profile-details": { title: "Profile Details", subtitle: "Update your company information and admin details." },
  "change-password": { title: "Change Password", subtitle: "Update your login password." },
};

const PROFILE_SECTIONS = [
  { id: "company_details", title: "Company Details" },
  { id: "payroll_details", title: "Payroll Details" },
  { id: "admin_details", title: "Admin Details" },
];

const COUNTRIES = [
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
];

const CURRENCIES = [
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

const F6_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "JBOX Technologies",
    hqCountry: "NO",
    payrollCurrency: ["NOK", "PHP"] as string[],
    payoutDay: "25",
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
              <Label htmlFor="hqCountry" className="text-sm">Primary Legal Entity Country</Label>
              <Select value={formData.hqCountry} onValueChange={(val) => handleFieldChange("hqCountry", val)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</> : "Save changes"}
              </Button>
            </div>
          </div>
        );

      case "payroll_details":
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payrollCurrency" className="text-sm">Payroll Currencies</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between text-sm h-10 hover:bg-card hover:text-foreground hover:shadow-none"
                  >
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {formData.payrollCurrency.length > 0 ? (
                        formData.payrollCurrency.map((currency) => (
                          <span
                            key={currency}
                            className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                          >
                            {currency}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFieldChange("payrollCurrency", formData.payrollCurrency.filter(c => c !== currency));
                              }}
                              className="rounded-sm p-0.5"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Select currencies</span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="p-1.5 space-y-0.5">
                    {CURRENCIES.map((currency) => {
                      const isSelected = formData.payrollCurrency.includes(currency.value);
                      return (
                        <div
                          key={currency.value}
                          className="flex items-center space-x-2.5 px-2.5 py-2 hover:bg-primary/5 rounded-md cursor-pointer transition-colors"
                          onClick={() => {
                            const newCurrencies = isSelected
                              ? formData.payrollCurrency.filter(c => c !== currency.value)
                              : [...formData.payrollCurrency, currency.value];
                            handleFieldChange("payrollCurrency", newCurrencies);
                          }}
                        >
                          <Checkbox checked={isSelected} onCheckedChange={() => {}} />
                          <label className="text-sm cursor-pointer flex-1 text-foreground">{currency.label}</label>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutDay" className="text-sm">Preferred Payout Date</Label>
              <Input
                id="payoutDay"
                type="number"
                min="1"
                max="31"
                value={formData.payoutDay}
                onChange={(e) => handleFieldChange("payoutDay", e.target.value)}
                placeholder="e.g., 25"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Day of the month (1–31)</p>
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
                onChange={(e) => handleFieldChange("adminEmail", e.target.value)}
                placeholder="email@company.com"
                className="text-sm"
                disabled
              />
              <p className="text-xs text-muted-foreground">Email is linked to your account and cannot be changed</p>
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
