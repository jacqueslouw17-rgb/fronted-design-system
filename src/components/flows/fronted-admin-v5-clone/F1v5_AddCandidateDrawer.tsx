/**
 * Flow 1 v5 — Add Candidate Drawer (Enhanced v2)
 * Progressive disclosure: Personal Details → Contract Details (revealed after country selection)
 * Premium UI with proper hierarchy, card sections, and no overlap issues.
 * ISOLATED: Changes here do NOT affect v4 or any other flow.
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { User, Sparkles, MapPin, FileText, Clock, Shield, Check, ChevronsUpDown, Info, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getCurrencyCode } from "@/utils/currencyUtils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Nationalities ──────────────────────────────────────────────────────
const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine",
  "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini",
  "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese",
  "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian",
  "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian",
  "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese",
  "Colombian", "Comorian", "Congolese", "Costa Rican", "Croatian", "Cuban",
  "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "Ecuadorian",
  "Egyptian", "Emirati", "English", "Eritrean", "Estonian", "Ethiopian",
  "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian",
  "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guyanese",
  "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian",
  "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican",
  "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kosovar", "Kuwaiti", "Kyrgyz",
  "Lao", "Latvian", "Lebanese", "Liberian", "Libyan", "Lithuanian", "Luxembourgish",
  "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian",
  "Maltese", "Mauritanian", "Mauritian", "Mexican", "Moldovan", "Mongolian",
  "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nepalese", "New Zealander",
  "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Norwegian", "Omani",
  "Pakistani", "Palestinian", "Panamanian", "Paraguayan", "Peruvian", "Polish",
  "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saudi", "Scottish",
  "Senegalese", "Serbian", "Singaporean", "Slovak", "Slovenian", "Somali",
  "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese",
  "Surinamese", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian",
  "Thai", "Togolese", "Trinidadian", "Tunisian", "Turkish", "Turkmen",
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbek", "Venezuelan", "Vietnamese",
  "Welsh", "Yemeni", "Zambian", "Zimbabwean",
];

// ─── Country Rules ──────────────────────────────────────────────────────
interface CountryRule {
  flag: string;
  currency: string;
  employmentTypes: ("contractor" | "employee")[];
  probation: { default: number; max: number };
  noticePeriod: { default: number; min: number };
  annualLeave: { default: number; min: number };
  sickLeave: { default: number; min: number };
  weeklyHours: { default: number; max: number };
  payFrequency: { default: string; locked: boolean };
  idLabel: string;
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  Norway: {
    flag: "🇳🇴", currency: "NOK",
    employmentTypes: ["employee", "contractor"],
    probation: { default: 180, max: 180 },
    noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 25, min: 25 },
    sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 37.5, max: 40 },
    payFrequency: { default: "monthly", locked: true },
    idLabel: "National ID (Fødselsnummer)",
  },
  Sweden: {
    flag: "🇸🇪", currency: "SEK",
    employmentTypes: ["employee", "contractor"],
    probation: { default: 180, max: 180 },
    noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 25, min: 25 },
    sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 40, max: 40 },
    payFrequency: { default: "monthly", locked: true },
    idLabel: "Personal Number (Personnummer)",
  },
  Denmark: {
    flag: "🇩🇰", currency: "DKK",
    employmentTypes: ["employee", "contractor"],
    probation: { default: 90, max: 90 },
    noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 25, min: 25 },
    sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 37, max: 37 },
    payFrequency: { default: "monthly", locked: true },
    idLabel: "CPR Number",
  },
  Philippines: {
    flag: "🇵🇭", currency: "PHP",
    employmentTypes: ["contractor"],
    probation: { default: 180, max: 180 },
    noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 5, min: 5 },
    sickLeave: { default: 5, min: 5 },
    weeklyHours: { default: 48, max: 48 },
    payFrequency: { default: "fortnightly", locked: true },
    idLabel: "TIN / PhilHealth ID",
  },
  India: {
    flag: "🇮🇳", currency: "INR",
    employmentTypes: ["contractor"],
    probation: { default: 90, max: 180 },
    noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 21, min: 21 },
    sickLeave: { default: 12, min: 12 },
    weeklyHours: { default: 48, max: 48 },
    payFrequency: { default: "monthly", locked: true },
    idLabel: "PAN Number",
  },
  Kosovo: {
    flag: "🇽🇰", currency: "EUR",
    employmentTypes: ["contractor"],
    probation: { default: 180, max: 180 },
    noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 20, min: 20 },
    sickLeave: { default: 20, min: 20 },
    weeklyHours: { default: 40, max: 40 },
    payFrequency: { default: "monthly", locked: true },
    idLabel: "Personal ID Number",
  },
};

const COUNTRIES = Object.keys(COUNTRY_RULES);

// ─── ATS Mock Data ──────────────────────────────────────────────────────
const ATS_CANDIDATES = [
  { id: "ats-1", name: "Maria Santos", country: "Philippines", role: "Senior Developer", email: "maria.santos@email.com", employmentType: "contractor" as const, hasATSData: true },
  { id: "ats-2", name: "John Smith", country: "Denmark", role: "Product Manager", email: "john.smith@email.com", employmentType: "employee" as const, hasATSData: true },
  { id: "ats-3", name: "Sarah Chen", country: "Sweden", role: "UX Designer", email: "sarah.chen@email.com", employmentType: "contractor" as const, hasATSData: true },
];

// ─── Sub-components ─────────────────────────────────────────────────────

/** Section card wrapper with icon header */
const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, subtitle, children, badge, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 px-5 py-3.5 bg-muted/30 border-b border-border/40 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {badge}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-4">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/** Unified field with label, input, and optional hint */
const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  optionalTooltip?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, optionalTooltip, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5">
      <Label className="text-[13px] font-medium text-foreground/80">
        {label}
      </Label>
      {optionalTooltip && (
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 cursor-help">
                <span className="text-[11px] text-muted-foreground/70 font-normal">Optional</span>
                <Info className="h-3 w-3 text-muted-foreground/50" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">
              {optionalTooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground leading-tight">{hint}</p>}
  </div>
);

/** Number field with suffix badge — avoids overlap with spinner arrows */
const NumberFieldWithUnit: React.FC<{
  value: string;
  onChange: (val: string) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}> = ({ value, onChange, unit, min, max, step }) => (
  <div className="flex items-center gap-2">
    <Input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100"
    />
    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md border border-border/40 whitespace-nowrap select-none">
      {unit}
    </span>
  </div>
);

/** Searchable nationality combobox */
const NationalityCombobox: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm font-normal h-10"
        >
          {value || <span className="text-muted-foreground">Select nationality</span>}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
        <Command>
          <CommandInput placeholder="Search nationality..." className="h-10" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No nationality found.</CommandEmpty>
            <CommandGroup>
              {NATIONALITIES.map(n => (
                <CommandItem
                  key={n}
                  value={n}
                  onSelect={() => { onChange(n); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-3.5 w-3.5", value === n ? "opacity-100" : "opacity-0")} />
                  {n}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────
interface AddCandidateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (candidate: any) => void;
}

export const F1v4_AddCandidateDrawer: React.FC<AddCandidateDrawerProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [selectedAtsId, setSelectedAtsId] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", nationality: "", address: "", idNumber: "",
    country: "", role: "",
    employmentType: "" as "" | "contractor" | "employee",
    salary: "", startDate: "",
    probationPeriod: "", noticePeriod: "", annualLeave: "", sickLeave: "",
    weeklyHours: "", payFrequency: "",
  });

  const countryRule = formData.country ? COUNTRY_RULES[formData.country] : null;
  const isContractorOnly = countryRule?.employmentTypes.length === 1 && countryRule.employmentTypes[0] === "contractor";

  const handleATSSelect = (value: string) => {
    setSelectedAtsId(value);
    if (value === "manual") {
      setFormData({
        name: "", email: "", nationality: "", address: "", idNumber: "",
        country: "", role: "", employmentType: "", salary: "", startDate: "",
        probationPeriod: "", noticePeriod: "", annualLeave: "", sickLeave: "",
        weeklyHours: "", payFrequency: "",
      });
    } else {
      const candidate = ATS_CANDIDATES.find(c => c.id === value);
      if (candidate) {
        const rule = COUNTRY_RULES[candidate.country];
        setFormData({
          name: candidate.name, email: candidate.email,
          nationality: "", address: "", idNumber: "",
          country: candidate.country, role: candidate.role,
          employmentType: candidate.employmentType,
          salary: "", startDate: "",
          probationPeriod: rule ? String(rule.probation.default) : "",
          noticePeriod: rule ? String(rule.noticePeriod.default) : "",
          annualLeave: rule ? String(rule.annualLeave.default) : "",
          sickLeave: rule ? String(rule.sickLeave.default) : "",
          weeklyHours: rule ? String(rule.weeklyHours.default) : "",
          payFrequency: rule ? rule.payFrequency.default : "",
        });
      }
    }
  };

  const handleCountryChange = (country: string) => {
    const rule = COUNTRY_RULES[country];
    if (!rule) return;
    const empType = rule.employmentTypes.length === 1
      ? rule.employmentTypes[0]
      : (formData.employmentType && rule.employmentTypes.includes(formData.employmentType as any)
        ? formData.employmentType : "");
    setFormData(prev => ({
      ...prev, country, employmentType: empType,
      probationPeriod: String(rule.probation.default),
      noticePeriod: String(rule.noticePeriod.default),
      annualLeave: String(rule.annualLeave.default),
      sickLeave: String(rule.sickLeave.default),
      weeklyHours: String(rule.weeklyHours.default),
      payFrequency: rule.payFrequency.default,
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.country || !formData.role || !formData.salary || !formData.startDate || !formData.employmentType) {
      toast.error("Please fill in all required fields");
      return;
    }
    const rule = COUNTRY_RULES[formData.country];
    onSave({
      id: `candidate-${Date.now()}`,
      name: formData.name, country: formData.country,
      countryFlag: rule?.flag || "", role: formData.role,
      salary: formData.salary, status: "offer-accepted" as const,
      formSent: false, dataReceived: false,
      employmentType: formData.employmentType,
      hasATSData: selectedAtsId !== "manual",
      email: formData.email, startDate: formData.startDate,
      probationPeriod: formData.probationPeriod,
      noticePeriod: formData.noticePeriod,
      annualLeave: formData.annualLeave,
      sickLeave: formData.sickLeave,
      weeklyHours: formData.weeklyHours,
      payFrequency: formData.payFrequency,
    });
    toast.success(`✅ ${formData.name} added to pipeline`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedAtsId("");
    setFormData({
      name: "", email: "", nationality: "", address: "", idNumber: "",
      country: "", role: "", employmentType: "", salary: "", startDate: "",
      probationPeriod: "", noticePeriod: "", annualLeave: "", sickLeave: "",
      weeklyHours: "", payFrequency: "",
    });
  };

  const isATSSelected = selectedAtsId && selectedAtsId !== "manual";
  const showForm = !!selectedAtsId;
  const showContractFields = !!formData.country && !!countryRule;
  const isFormValid = formData.name && formData.email && formData.country && formData.role && formData.salary && formData.startDate && formData.employmentType;

  const set = (key: string) => (val: string) => setFormData(p => ({ ...p, [key]: val }));

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <SheetContent className="sm:max-w-[560px] overflow-y-auto p-0">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 py-4">
          <SheetHeader className="p-0">
            <SheetTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              Add Candidate
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* ── Candidate Source ── */}
          <div className="space-y-1.5">
            <Select value={selectedAtsId} onValueChange={handleATSSelect}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose from ATS or add manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Enter manually</span>
                  </div>
                </SelectItem>
                {ATS_CANDIDATES.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span>{COUNTRY_RULES[c.country]?.flag}</span>
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" />ATS
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* ── Section 1: Personal Details ── */}
                <SectionCard
                  title="Personal Details"
                  subtitle="Basic information about the candidate"
                >
                  <Field label="Full Name" required>
                    <Input value={formData.name} onChange={e => set("name")(e.target.value)} placeholder="e.g., Maria Santos" className="h-10" />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={formData.email} onChange={e => set("email")(e.target.value)} placeholder="email@example.com" className="h-10" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nationality">
                      <NationalityCombobox value={formData.nationality} onChange={set("nationality")} />
                    </Field>
                    <Field label="Role" required>
                      <Input value={formData.role} onChange={e => set("role")(e.target.value)} placeholder="e.g., Senior Dev" className="h-10" />
                    </Field>
                  </div>
                </SectionCard>

                {/* ── Section 2: Contract Details ── */}
                <SectionCard
                  title="Contract Details"
                  subtitle="Select country to configure contract terms"
                  badge={formData.country && countryRule ? (
                    <Badge variant="outline" className="text-xs font-medium gap-1">
                      {countryRule.flag} {formData.country}
                    </Badge>
                  ) : undefined}
                >
                  {/* Country — gateway field */}
                  <Field label="Country" required>
                    <Select value={formData.country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select country to reveal fields..." />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c} value={c}>
                            <span className="mr-2">{COUNTRY_RULES[c].flag}</span>{c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Empty state */}
                  {!showContractFields && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                        <MapPin className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                      <p className="text-sm text-muted-foreground/70 max-w-[220px]">
                        Contract fields will appear once you select a country above
                      </p>
                    </div>
                  )}

                  {/* Revealed fields */}
                  <AnimatePresence mode="wait">
                    {showContractFields && countryRule && (
                      <motion.div
                        key={formData.country}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Employment & Compensation row */}
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Employment Type" required hint={isContractorOnly ? `Contractor only in ${formData.country}` : undefined}>
                            <Select
                              value={formData.employmentType}
                              onValueChange={(v: "contractor" | "employee") => set("employmentType")(v)}
                              disabled={isContractorOnly}
                            >
                              <SelectTrigger className={`h-10 ${isContractorOnly ? "opacity-60" : ""}`}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryRule.employmentTypes.map(t => (
                                  <SelectItem key={t} value={t}>{t === "employee" ? "Employee" : "Contractor"}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Start Date" required>
                            <Input type="date" value={formData.startDate} onChange={e => set("startDate")(e.target.value)} className="h-10" />
                          </Field>
                        </div>

                        <Field label="Salary" required hint="Monthly gross amount (numbers only)">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none select-none">
                              {formData.employmentType
                                ? getCurrencyCode(formData.country, formData.employmentType as any)
                                : countryRule.currency}
                            </span>
                            <Input
                              value={formData.salary}
                              onChange={e => set("salary")(e.target.value.replace(/[^0-9]/g, ""))}
                              placeholder="5,000"
                              className="pl-12 h-10"
                            />
                          </div>
                        </Field>

                        {/* Identity & Address */}
                        <div className="grid grid-cols-2 gap-3">
                          <Field label={countryRule.idLabel} optionalTooltip="Can be completed by the worker during onboarding">
                            <Input value={formData.idNumber} onChange={e => set("idNumber")(e.target.value)} placeholder="Enter ID" className="h-10" />
                          </Field>
                          <Field label="Address" optionalTooltip="Can be completed by the worker during onboarding">
                            <Input value={formData.address} onChange={e => set("address")(e.target.value)} placeholder="Residential address" className="h-10" />
                          </Field>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SectionCard>

                {/* ── Section 3: Terms & Entitlements (only when country selected) ── */}
                <AnimatePresence>
                  {showContractFields && countryRule && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                    >
                      <SectionCard
                        title="Terms & Entitlements"
                        subtitle={`Country defaults for ${formData.country} — adjust as negotiated`}
                        badge={
                          <Badge variant="secondary" className="text-[10px] font-normal gap-1 bg-amber-500/10 text-amber-700 border-amber-500/20">
                            <Clock className="h-2.5 w-2.5" /> Pre-filled
                          </Badge>
                        }
                      >
                        {/* Row 1: Probation & Notice */}
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Probation Period" hint={`Max: ${countryRule.probation.max} days`}>
                            <NumberFieldWithUnit
                              value={formData.probationPeriod}
                              onChange={set("probationPeriod")}
                              unit="days"
                              min={0}
                              max={countryRule.probation.max}
                            />
                          </Field>
                          <Field label="Notice Period" hint={`Min: ${countryRule.noticePeriod.min} days`}>
                            <NumberFieldWithUnit
                              value={formData.noticePeriod}
                              onChange={set("noticePeriod")}
                              unit="days"
                              min={countryRule.noticePeriod.min}
                            />
                          </Field>
                        </div>

                        {/* Row 2: Annual & Sick Leave */}
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Annual Leave" hint={`Min: ${countryRule.annualLeave.min} days`}>
                            <NumberFieldWithUnit
                              value={formData.annualLeave}
                              onChange={set("annualLeave")}
                              unit="days"
                              min={countryRule.annualLeave.min}
                            />
                          </Field>
                          <Field label="Sick Leave" hint={`Min: ${countryRule.sickLeave.min} days`}>
                            <NumberFieldWithUnit
                              value={formData.sickLeave}
                              onChange={set("sickLeave")}
                              unit="days"
                              min={countryRule.sickLeave.min}
                            />
                          </Field>
                        </div>

                        {/* Row 3: Weekly Hours & Pay Frequency */}
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Weekly Hours" hint={`Max: ${countryRule.weeklyHours.max} hrs`}>
                            <NumberFieldWithUnit
                              value={formData.weeklyHours}
                              onChange={set("weeklyHours")}
                              unit="hours"
                              max={countryRule.weeklyHours.max}
                              step={0.5}
                            />
                          </Field>
                          <Field
                            label="Pay Frequency"
                            hint={countryRule.payFrequency.locked ? `Fixed for ${formData.country}` : undefined}
                          >
                            <Select
                              value={formData.payFrequency}
                              onValueChange={v => set("payFrequency")(v)}
                              disabled={countryRule.payFrequency.locked}
                            >
                              <SelectTrigger className={`h-10 ${countryRule.payFrequency.locked ? "opacity-60" : ""}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                      </SectionCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Sticky Actions ── */}
                <div className="flex gap-3 pt-2 pb-2">
                  <Button variant="outline" className="flex-1 h-11" onClick={() => { resetForm(); onOpenChange(false); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1 h-11" onClick={handleSave} disabled={!isFormValid}>
                    Save Candidate
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};
