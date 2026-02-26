/**
 * F1v5_ContractCreationScreen — Review & Confirm candidate details
 * 
 * ISOLATED: v5-specific version with categorized sections matching
 * the Add Candidate Drawer structure (Personal Details, Contract Details,
 * Terms & Entitlements). Changes here do NOT affect any other flow.
 */

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sparkles, ChevronDown, User, Briefcase, Calendar, Shield, Clock,
  MapPin, Globe, Building2, Banknote, FileText, Check, ChevronsUpDown,
} from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { getCurrencyCode, parseSalaryValue } from "@/utils/currencyUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkingCountryCombobox } from "@/components/shared/SearchableCountrySelect";

// ─── Nationalities (with flags) ───
const NATIONALITIES = [
  { label: "🇦🇫 Afghan", value: "Afghan" }, { label: "🇺🇸 American", value: "American" },
  { label: "🇦🇷 Argentine", value: "Argentine" }, { label: "🇦🇺 Australian", value: "Australian" },
  { label: "🇦🇹 Austrian", value: "Austrian" }, { label: "🇧🇪 Belgian", value: "Belgian" },
  { label: "🇧🇷 Brazilian", value: "Brazilian" }, { label: "🇬🇧 British", value: "British" },
  { label: "🇧🇬 Bulgarian", value: "Bulgarian" }, { label: "🇨🇦 Canadian", value: "Canadian" },
  { label: "🇨🇳 Chinese", value: "Chinese" }, { label: "🇭🇷 Croatian", value: "Croatian" },
  { label: "🇨🇾 Cypriot", value: "Cypriot" }, { label: "🇨🇿 Czech", value: "Czech" },
  { label: "🇩🇰 Danish", value: "Danish" }, { label: "🇳🇱 Dutch", value: "Dutch" },
  { label: "🇪🇪 Estonian", value: "Estonian" }, { label: "🇵🇭 Filipino", value: "Filipino" },
  { label: "🇫🇮 Finnish", value: "Finnish" }, { label: "🇫🇷 French", value: "French" },
  { label: "🇩🇪 German", value: "German" }, { label: "🇬🇷 Greek", value: "Greek" },
  { label: "🇭🇺 Hungarian", value: "Hungarian" }, { label: "🇮🇳 Indian", value: "Indian" },
  { label: "🇮🇩 Indonesian", value: "Indonesian" }, { label: "🇮🇪 Irish", value: "Irish" },
  { label: "🇮🇱 Israeli", value: "Israeli" }, { label: "🇮🇹 Italian", value: "Italian" },
  { label: "🇯🇵 Japanese", value: "Japanese" }, { label: "🇽🇰 Kosovar", value: "Kosovar" },
  { label: "🇰🇷 South Korean", value: "South Korean" }, { label: "🇱🇻 Latvian", value: "Latvian" },
  { label: "🇱🇹 Lithuanian", value: "Lithuanian" }, { label: "🇱🇺 Luxembourgish", value: "Luxembourgish" },
  { label: "🇲🇾 Malaysian", value: "Malaysian" }, { label: "🇲🇹 Maltese", value: "Maltese" },
  { label: "🇲🇽 Mexican", value: "Mexican" }, { label: "🇳🇿 New Zealander", value: "New Zealander" },
  { label: "🇳🇴 Norwegian", value: "Norwegian" }, { label: "🇵🇰 Pakistani", value: "Pakistani" },
  { label: "🇵🇱 Polish", value: "Polish" }, { label: "🇵🇹 Portuguese", value: "Portuguese" },
  { label: "🇷🇴 Romanian", value: "Romanian" }, { label: "🇸🇬 Singaporean", value: "Singaporean" },
  { label: "🇸🇰 Slovak", value: "Slovak" }, { label: "🇸🇮 Slovenian", value: "Slovenian" },
  { label: "🇿🇦 South African", value: "South African" }, { label: "🇪🇸 Spanish", value: "Spanish" },
  { label: "🇸🇪 Swedish", value: "Swedish" }, { label: "🇨🇭 Swiss", value: "Swiss" },
  { label: "🇹🇭 Thai", value: "Thai" }, { label: "🇹🇷 Turkish", value: "Turkish" },
  { label: "🇦🇪 Emirati", value: "Emirati" }, { label: "🇺🇦 Ukrainian", value: "Ukrainian" },
  { label: "🇻🇳 Vietnamese", value: "Vietnamese" },
];

/** Searchable nationality combobox */
const NationalityCombobox: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = NATIONALITIES.find(n => n.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-sm font-normal h-10">
          {selected ? selected.label : <span className="text-muted-foreground">Select nationality</span>}
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
                <CommandItem key={n.value} value={n.label} onSelect={() => { onChange(n.value); setOpen(false); }} className="text-sm">
                  <Check className={cn("mr-2 h-4 w-4", value === n.value ? "opacity-100" : "opacity-0")} />
                  {n.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ─── Country Rules (mirrored from AddCandidateDrawer) ───
interface CountryRule {
  flag: string; currency: string;
  probation: { default: number; max: number };
  noticePeriod: { default: number; min: number };
  annualLeave: { default: number; min: number };
  sickLeave: { default: number; min: number };
  weeklyHours: { default: number; max: number };
  payFrequency: { default: string; locked: boolean };
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  Norway:      { flag: "🇳🇴", currency: "NOK", probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 }, annualLeave: { default: 25, min: 25 }, sickLeave: { default: 365, min: 0 }, weeklyHours: { default: 37.5, max: 40 }, payFrequency: { default: "monthly", locked: true } },
  Sweden:      { flag: "🇸🇪", currency: "SEK", probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 }, annualLeave: { default: 25, min: 25 }, sickLeave: { default: 365, min: 0 }, weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true } },
  Denmark:     { flag: "🇩🇰", currency: "DKK", probation: { default: 90, max: 90 }, noticePeriod: { default: 30, min: 30 }, annualLeave: { default: 25, min: 25 }, sickLeave: { default: 365, min: 0 }, weeklyHours: { default: 37, max: 37 }, payFrequency: { default: "monthly", locked: true } },
  Philippines: { flag: "🇵🇭", currency: "PHP", probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 }, annualLeave: { default: 5, min: 5 }, sickLeave: { default: 5, min: 5 }, weeklyHours: { default: 48, max: 48 }, payFrequency: { default: "fortnightly", locked: true } },
  India:       { flag: "🇮🇳", currency: "INR", probation: { default: 90, max: 180 }, noticePeriod: { default: 30, min: 30 }, annualLeave: { default: 21, min: 21 }, sickLeave: { default: 12, min: 12 }, weeklyHours: { default: 48, max: 48 }, payFrequency: { default: "monthly", locked: true } },
  Kosovo:      { flag: "🇽🇰", currency: "EUR", probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 }, annualLeave: { default: 20, min: 20 }, sickLeave: { default: 20, min: 20 }, weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true } },
  Singapore:   { flag: "🇸🇬", currency: "SGD", probation: { default: 90, max: 180 }, noticePeriod: { default: 30, min: 7 }, annualLeave: { default: 7, min: 7 }, sickLeave: { default: 14, min: 14 }, weeklyHours: { default: 44, max: 44 }, payFrequency: { default: "monthly", locked: true } },
  Spain:       { flag: "🇪🇸", currency: "EUR", probation: { default: 60, max: 180 }, noticePeriod: { default: 15, min: 15 }, annualLeave: { default: 22, min: 22 }, sickLeave: { default: 365, min: 0 }, weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true } },
  Romania:     { flag: "🇷🇴", currency: "RON", probation: { default: 90, max: 90 }, noticePeriod: { default: 20, min: 20 }, annualLeave: { default: 20, min: 20 }, sickLeave: { default: 183, min: 0 }, weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true } },
};

interface Props {
  candidate: Candidate;
  onNext: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalCandidates?: number;
}

/* ── Section Card — matches drawer style ── */
const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, badge, defaultOpen = true, forceOpen, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Allow parent to force-open a collapsed section
  React.useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden transition-all">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-card/40 transition-colors text-left group">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <div className="flex items-center gap-2">
              {badge}
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform duration-200", !isOpen && "-rotate-90")} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border/20">
            <div className="p-4 pt-3 space-y-3">
              {children}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/* ── Field wrapper ── */
const Field = React.forwardRef<HTMLDivElement, {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}>(({ label, error, hint, optional, children }, ref) => (
  <div ref={ref} className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {optional && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
    {error && <p className="text-destructive text-xs animate-in fade-in-0 slide-in-from-top-1 duration-200">{error}</p>}
    {hint && !error && <p className="text-muted-foreground text-[11px]">{hint}</p>}
  </div>
));
Field.displayName = "Field";

/* ── Number with unit badge ── */
const NumberFieldWithUnit: React.FC<{
  value: string; onChange: (v: string) => void; unit: string; min?: number; max?: number; step?: number;
}> = ({ value, onChange, unit, min, max, step }) => (
  <div className="flex items-center gap-2">
    <Input type="number" value={value} onChange={e => onChange(e.target.value)} min={min} max={max} step={step}
      className="flex-1 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100" />
    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md border border-border/40 whitespace-nowrap select-none">{unit}</span>
  </div>
);

/* ── Parse human-readable date to YYYY-MM-DD ── */
const parseToISODate = (raw: string): string => {
  if (!raw) return "";
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Try parsing "Dec 1, 2025" etc.
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return "";
};

export const F1v5_ContractCreationScreen: React.FC<Props> = ({
  candidate,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalCandidates = 1,
}) => {
  const defaultEmploymentType = candidate.employmentType || "contractor";
  const [employmentType, setEmploymentType] = useState<"employee" | "contractor">(defaultEmploymentType);
  const countryRule = COUNTRY_RULES[candidate.country];

  // Field refs for scroll-to-error
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setFieldRef = useCallback((key: string) => (el: HTMLDivElement | null) => {
    fieldRefs.current[key] = el;
  }, []);

  const [formData, setFormData] = useState({
    fullName: candidate.name,
    email: candidate.email || "",
    role: candidate.role,
    nationality: candidate.nationality || "",
    city: candidate.city || "Manila",
    address: candidate.address || "123 Rizal Avenue, Makati City",
    idType: candidate.idType || "",
    idNumber: candidate.idNumber || "PH-2024-881204",
    country: candidate.country,
    startDate: parseToISODate(candidate.startDate) || "2025-12-01",
    salary: candidate.salary,
    taxResidence: candidate.taxResidence || "",
    // Terms — prepopulated from country defaults
    probationPeriod: countryRule ? String(countryRule.probation.default) : "",
    noticePeriod: countryRule ? String(countryRule.noticePeriod.default) : "",
    annualLeave: countryRule ? String(countryRule.annualLeave.default) : "",
    sickLeave: countryRule ? String(countryRule.sickLeave.default) : "",
    weeklyHours: countryRule ? String(countryRule.weeklyHours.default) : "",
    payFrequency: countryRule ? countryRule.payFrequency.default : "monthly",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track which sections need to be force-opened for validation
  const [forceOpenSections, setForceOpenSections] = useState<Record<string, boolean>>({});

  // When candidate changes, force-open personal profile and scroll to top
  React.useEffect(() => {
    setForceOpenSections({ personal: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset after a tick so it can retrigger on next candidate change
    const t = setTimeout(() => setForceOpenSections({}), 300);
    return () => clearTimeout(t);
  }, [candidate.id]);

  // Map fields to their parent sections
  const fieldSectionMap: Record<string, string> = {
    fullName: "personal",
    email: "personal",
    nationality: "personal",
    role: "working",
    startDate: "working",
    salary: "working",
  };

  const set = (key: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const handleValidate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.role?.trim()) newErrors.role = "Role is required";
    if (!formData.salary) newErrors.salary = "Salary is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    else {
      const [y, m, d] = formData.startDate.split("-").map(Number);
      const sd = new Date(y, m - 1, d);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (sd < today) newErrors.startDate = "Must be a future date";
    }
    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      // Determine which sections contain errors and force them open
      const sectionsToOpen: Record<string, boolean> = {};
      errorKeys.forEach(key => {
        const section = fieldSectionMap[key];
        if (section) sectionsToOpen[section] = true;
      });
      setForceOpenSections(sectionsToOpen);

      // Wait for collapsible animation to expand, then scroll to first error
      const firstErrorKey = errorKeys[0];
      setTimeout(() => {
        const el = fieldRefs.current[firstErrorKey];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
      
      toast.error(`Please fix ${errorKeys.length} field${errorKeys.length > 1 ? "s" : ""} before continuing`);
    }
    return errorKeys.length === 0;
  };

  const handleNext = () => {
    if (handleValidate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 pb-8 pt-4 max-w-3xl mx-auto space-y-1.5"
    >
      <AgentHeader
        title={`Review ${candidate.name.split(" ")[0]}'s Details`}
        subtitle="Confirm the details below before generating contract documents."
        showPulse={true}
        showInput={false}
        progressIndicator={
          totalCandidates > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground">Candidate</span>
              <span className="text-lg font-bold text-foreground">{currentIndex + 1}</span>
              <span className="text-sm text-muted-foreground">/ {totalCandidates}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / totalCandidates) * 100}%` }} />
              </div>
            </div>
          ) : undefined
        }
      />

      {/* ── Section 1: Personal Profile ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionCard title="Personal Profile" forceOpen={forceOpenSections.personal}>
          <Field label="Full Name" error={errors.fullName} ref={setFieldRef("fullName")}>
            <Input value={formData.fullName} onChange={e => set("fullName")(e.target.value)} placeholder="e.g., Marcus Chen" className={cn("h-10", errors.fullName && "border-destructive focus-visible:ring-destructive")} />
          </Field>
          <Field label="Email" error={errors.email} ref={setFieldRef("email")}>
            <Input type="email" value={formData.email} onChange={e => set("email")(e.target.value)} placeholder="email@example.com" className={cn("h-10", errors.email && "border-destructive focus-visible:ring-destructive")} />
          </Field>
          <Field label="Nationality">
            <NationalityCombobox value={formData.nationality} onChange={set("nationality")} />
          </Field>
          <Field label="Address">
            <Input value={formData.address} onChange={e => set("address")(e.target.value)} placeholder="Residential address" className="h-10" />
          </Field>
          <Field label="ID Number">
            <Input value={formData.idNumber} onChange={e => set("idNumber")(e.target.value)} placeholder="Enter ID" className="h-10" />
          </Field>
        </SectionCard>
      </motion.div>

      {/* ── Section 2: Working Engagement ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionCard
          title="Working Engagement"
          forceOpen={forceOpenSections.working}
        >
          <Field label="Role" error={errors.role} ref={setFieldRef("role")}>
            <Input value={formData.role} onChange={e => set("role")(e.target.value)} placeholder="e.g., Senior Dev" className={cn("h-10", errors.role && "border-destructive focus-visible:ring-destructive")} />
          </Field>
          <Field label="Country">
            <WorkingCountryCombobox
              value={formData.country}
              onChange={set("country")}
              countries={Object.entries(COUNTRY_RULES).map(([c, r]) => ({ name: c, flag: r.flag }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employment Type">
              <Select value={employmentType} onValueChange={(v: "employee" | "contractor") => setEmploymentType(v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Start Date" error={errors.startDate} ref={setFieldRef("startDate")}>
              <Input type="date" value={formData.startDate} onChange={e => set("startDate")(e.target.value)} className={cn("h-10", formData.startDate ? "text-foreground" : "text-muted-foreground", errors.startDate && "border-destructive focus-visible:ring-destructive")} />
            </Field>
          </div>
          <Field label={employmentType === "employee" ? "Salary" : "Consultancy Fee"} error={errors.salary} ref={setFieldRef("salary")}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none select-none">
                {getCurrencyCode(formData.country, employmentType)}
              </span>
              <Input value={parseSalaryValue(formData.salary)} onChange={e => set("salary")(e.target.value)} placeholder="5,000" className={cn("pl-12 h-10", errors.salary && "border-destructive focus-visible:ring-destructive")} />
            </div>
          </Field>
          <Field label="Work Location">
            <Input value={formData.city} onChange={e => set("city")(e.target.value)} placeholder="e.g., Manila, Oslo" className="h-10" />
          </Field>

          {/* Terms fields (part of Working Engagement) */}
          {countryRule && (
            <div className="border-t border-border/40 pt-3 mt-1">
              <p className="text-[11px] text-muted-foreground mb-3">Country defaults for {formData.country} — adjust as negotiated</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Probation Period" hint={`Max: ${countryRule.probation.max} days`}>
                    <NumberFieldWithUnit value={formData.probationPeriod} onChange={set("probationPeriod")} unit="days" min={0} max={countryRule.probation.max} />
                  </Field>
                  <Field label="Notice Period" hint={`Min: ${countryRule.noticePeriod.min} days`}>
                    <NumberFieldWithUnit value={formData.noticePeriod} onChange={set("noticePeriod")} unit="days" min={countryRule.noticePeriod.min} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Annual Leave" hint={`Min: ${countryRule.annualLeave.min} days`}>
                    <NumberFieldWithUnit value={formData.annualLeave} onChange={set("annualLeave")} unit="days" min={countryRule.annualLeave.min} />
                  </Field>
                  <Field label="Sick Leave" hint={`Min: ${countryRule.sickLeave.min} days`}>
                    <NumberFieldWithUnit value={formData.sickLeave} onChange={set("sickLeave")} unit="days" min={countryRule.sickLeave.min} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Weekly Hours" hint={`Max: ${countryRule.weeklyHours.max} hrs`}>
                    <NumberFieldWithUnit value={formData.weeklyHours} onChange={set("weeklyHours")} unit="hours" max={countryRule.weeklyHours.max} step={0.5} />
                  </Field>
                  <Field label="Pay Frequency" hint={countryRule.payFrequency.locked ? `Fixed for ${formData.country}` : undefined}>
                    <Select value={formData.payFrequency} onValueChange={v => set("payFrequency")(v)} disabled={countryRule.payFrequency.locked}>
                      <SelectTrigger className={cn("h-10", countryRule.payFrequency.locked && "opacity-60")}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="fortnightly">Fortnightly</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ── Actions ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end gap-3 pt-2"
      >
        {currentIndex > 0 && onPrevious && (
          <Button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); onPrevious(); }} variant="outline" size="lg" className="px-8">
            Previous
          </Button>
        )}
        <Button onClick={handleNext} size="lg">
          {currentIndex + 1 === totalCandidates
            ? (totalCandidates > 1 ? "Review Agreements" : "Review Agreement")
            : "Review Next Candidate"}
        </Button>
      </motion.div>
    </motion.div>
  );
};
