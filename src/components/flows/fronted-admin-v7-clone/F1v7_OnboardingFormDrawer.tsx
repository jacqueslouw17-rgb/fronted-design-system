/**
 * Flow 1 — Fronted Admin Dashboard v5
 * 
 * OnboardingFormDrawer — "Configure & Send" drawer for Offer Accepted column.
 * Sections: Personal Profile + Working Engagement (matching Done column categories).
 */

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, Bot, ChevronDown, Shield, Info, FileEdit } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { getCurrencyCode, parseSalaryValue } from "@/utils/currencyUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NationalityCombobox, WorkingCountryCombobox } from "@/components/shared/SearchableCountrySelect";

// ─── Country Rules ───
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

// ─── Insurance data from Kota.io contribution reports API ───
interface KotaContributionLine {
  id: string;
  category: "gross_premium" | "tax" | "tax_relief";
  member_type: "policyholder" | "partner_dependant" | "child_dependant";
  amount: number;
  note?: string;
}

interface KotaInsuranceData {
  provider: string;
  plan: string;
  region: string;
  currency: string;
  status: "open" | "finalized";
  employer_contributions: KotaContributionLine[];
  employee_contributions: KotaContributionLine[];
}

const COUNTRY_INSURANCE: Record<string, KotaInsuranceData> = {
  Norway: {
    provider: "Allianz", plan: "Allianz Care Europe", region: "Europe", currency: "NOK", status: "open",
    employer_contributions: [
      { id: "ct_no_er_01", category: "gross_premium", member_type: "policyholder", amount: 3150 },
      { id: "ct_no_er_02", category: "tax", member_type: "policyholder", amount: 315 },
    ],
    employee_contributions: [
      { id: "ct_no_ee_01", category: "gross_premium", member_type: "policyholder", amount: 735 },
    ],
  },
  Sweden: {
    provider: "Allianz", plan: "Allianz Care Europe", region: "Europe", currency: "SEK", status: "open",
    employer_contributions: [
      { id: "ct_se_er_01", category: "gross_premium", member_type: "policyholder", amount: 2850 },
      { id: "ct_se_er_02", category: "tax", member_type: "policyholder", amount: 285 },
    ],
    employee_contributions: [
      { id: "ct_se_ee_01", category: "gross_premium", member_type: "policyholder", amount: 665 },
    ],
  },
  Denmark: {
    provider: "Allianz", plan: "Allianz Care Europe", region: "Europe", currency: "DKK", status: "finalized",
    employer_contributions: [
      { id: "ct_dk_er_01", category: "gross_premium", member_type: "policyholder", amount: 2600 },
      { id: "ct_dk_er_02", category: "tax", member_type: "policyholder", amount: 260 },
    ],
    employee_contributions: [
      { id: "ct_dk_ee_01", category: "gross_premium", member_type: "policyholder", amount: 640 },
    ],
  },
  Spain: {
    provider: "Allianz", plan: "Allianz Care Europe", region: "Europe", currency: "EUR", status: "open",
    employer_contributions: [
      { id: "ct_es_er_01", category: "gross_premium", member_type: "policyholder", amount: 210 },
      { id: "ct_es_er_02", category: "tax", member_type: "policyholder", amount: 21 },
    ],
    employee_contributions: [
      { id: "ct_es_ee_01", category: "gross_premium", member_type: "policyholder", amount: 49 },
    ],
  },
  Romania: {
    provider: "Allianz", plan: "Allianz Care Europe", region: "Europe", currency: "RON", status: "open",
    employer_contributions: [
      { id: "ct_ro_er_01", category: "gross_premium", member_type: "policyholder", amount: 187 },
    ],
    employee_contributions: [
      { id: "ct_ro_ee_01", category: "gross_premium", member_type: "policyholder", amount: 63 },
    ],
  },
  Kosovo: {
    provider: "Allianz", plan: "Allianz Care Europe", region: "Europe", currency: "EUR", status: "open",
    employer_contributions: [
      { id: "ct_xk_er_01", category: "gross_premium", member_type: "policyholder", amount: 165 },
    ],
    employee_contributions: [
      { id: "ct_xk_ee_01", category: "gross_premium", member_type: "policyholder", amount: 55 },
    ],
  },
  Singapore: {
    provider: "AIA", plan: "AIA HealthShield Gold", region: "Asia Pacific", currency: "SGD", status: "finalized",
    employer_contributions: [
      { id: "ct_sg_er_01", category: "gross_premium", member_type: "policyholder", amount: 338 },
      { id: "ct_sg_er_02", category: "tax_relief", member_type: "policyholder", amount: -45, note: "MediSave offset" },
    ],
    employee_contributions: [
      { id: "ct_sg_ee_01", category: "gross_premium", member_type: "policyholder", amount: 112 },
    ],
  },
  Philippines: {
    provider: "AXA Philippines", plan: "AXA Health Max", region: "Asia Pacific", currency: "PHP", status: "open",
    employer_contributions: [
      { id: "ct_ph_er_01", category: "gross_premium", member_type: "policyholder", amount: 9375 },
    ],
    employee_contributions: [
      { id: "ct_ph_ee_01", category: "gross_premium", member_type: "policyholder", amount: 3125 },
    ],
  },
  India: {
    provider: "HDFC Ergo", plan: "HDFC Optima Secure", region: "Asia Pacific", currency: "INR", status: "open",
    employer_contributions: [
      { id: "ct_in_er_01", category: "gross_premium", member_type: "policyholder", amount: 6375 },
    ],
    employee_contributions: [
      { id: "ct_in_ee_01", category: "gross_premium", member_type: "policyholder", amount: 2125 },
    ],
  },
};

interface OnboardingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  onComplete: () => void;
  onSent: () => void;
  onPrepareContract?: () => void;
  isResend?: boolean;
}

/* ── Section Card ── */
const SectionCard: React.FC<{
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, badge, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 px-5 py-3 bg-muted/30 border-b border-border/40 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
            </div>
            {badge}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-3 space-y-3">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/* ── Field wrapper ── */
const Field: React.FC<{
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, optional, hint, error, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {optional && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
    {error ? (
      <p className="text-destructive text-[11px] font-medium">{error}</p>
    ) : (
      hint && <p className="text-muted-foreground text-[11px]">{hint}</p>
    )}
  </div>
);

/* ── Number with unit badge ── */
const NumberFieldWithUnit: React.FC<{
  value: string; onChange: (v: string) => void; unit: string; min?: number; max?: number; step?: number; hasError?: boolean;
}> = ({ value, onChange, unit, min, max, step, hasError }) => (
  <div className="flex items-center gap-2">
    <Input type="number" value={value} onChange={e => onChange(e.target.value)} min={min} max={max} step={step}
      className={cn("flex-1 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100", hasError && "border-destructive focus-visible:ring-destructive")} />
    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md border border-border/40 whitespace-nowrap select-none">{unit}</span>
  </div>
);

export const F1v4_OnboardingFormDrawer: React.FC<OnboardingFormDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSent,
  onPrepareContract,
  isResend = false,
}) => {
  const isFromATS = candidate.employmentTypeSource === "ats" || (candidate as any).hasATSData;

  const [employmentType, setEmploymentType] = useState<"contractor" | "employee">(
    candidate.employmentType || "contractor"
  );
  const [showEmploymentConfirm, setShowEmploymentConfirm] = useState(
    !candidate.employmentType && candidate.employmentTypeSource === "suggested"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [insuranceOptIn, setInsuranceOptIn] = useState(true);

  const activeCountryRule = COUNTRY_RULES[candidate.country];

  const [formData, setFormData] = useState({
    // Personal Profile
    name: candidate.name,
    email: candidate.email || "",
    nationality: candidate.nationality || "",
    address: candidate.address || "",
    idNumber: candidate.idNumber || "",
    // Working Engagement
    role: candidate.role,
    country: candidate.country,
    salary: candidate.salary,
    startDate: candidate.startDate || "",
    city: candidate.city || "",
    // Terms (inside Working Engagement)
    probationPeriod: activeCountryRule ? String(activeCountryRule.probation.default) : "",
    noticePeriod: activeCountryRule ? String(activeCountryRule.noticePeriod.default) : "",
    annualLeave: activeCountryRule ? String(activeCountryRule.annualLeave.default) : "",
    sickLeave: activeCountryRule ? String(activeCountryRule.sickLeave.default) : "",
    weeklyHours: activeCountryRule ? String(activeCountryRule.weeklyHours.default) : "",
    payFrequency: activeCountryRule ? activeCountryRule.payFrequency.default : "monthly",
  });

  useEffect(() => {
    if (!candidate) return;
    const rule = COUNTRY_RULES[candidate.country];
    setFormData({
      name: candidate.name,
      email: candidate.email || "",
      nationality: candidate.nationality || "",
      address: candidate.address || "",
      idNumber: candidate.idNumber || "",
      role: candidate.role,
      country: candidate.country,
      salary: candidate.salary,
      startDate: candidate.startDate || "",
      city: candidate.city || "",
      probationPeriod: rule ? String(rule.probation.default) : "",
      noticePeriod: rule ? String(rule.noticePeriod.default) : "",
      annualLeave: rule ? String(rule.annualLeave.default) : "",
      sickLeave: rule ? String(rule.sickLeave.default) : "",
      weeklyHours: rule ? String(rule.weeklyHours.default) : "",
      payFrequency: rule ? rule.payFrequency.default : "monthly",
    });
    setEmploymentType(candidate.employmentType || "contractor");
    setShowEmploymentConfirm(
      !isFromATS && !candidate.employmentType && candidate.employmentTypeSource === "suggested"
    );
  }, [candidate, isFromATS]);

  const set = (key: string) => (value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const countryRule = COUNTRY_RULES[formData.country];

  // ── Inline validation for country-default fields ──
  const fieldErrors = (() => {
    if (!countryRule) return {} as Record<string, string>;
    const errors: Record<string, string> = {};
    const probVal = Number(formData.probationPeriod);
    const noticeVal = Number(formData.noticePeriod);
    const annualVal = Number(formData.annualLeave);
    const sickVal = Number(formData.sickLeave);
    const hoursVal = Number(formData.weeklyHours);

    if (formData.probationPeriod !== "" && probVal > countryRule.probation.max) {
      errors.probationPeriod = `Must be ${countryRule.probation.max} or fewer days`;
    }
    if (formData.noticePeriod !== "" && noticeVal < countryRule.noticePeriod.min) {
      errors.noticePeriod = `Must be ${countryRule.noticePeriod.min} or more days`;
    }
    if (formData.annualLeave !== "" && annualVal < countryRule.annualLeave.min) {
      errors.annualLeave = `Must be ${countryRule.annualLeave.min} or more days`;
    }
    if (formData.sickLeave !== "" && sickVal < countryRule.sickLeave.min) {
      errors.sickLeave = `Must be ${countryRule.sickLeave.min} or more days`;
    }
    if (formData.weeklyHours !== "" && hoursVal > countryRule.weeklyHours.max) {
      errors.weeklyHours = `Must be ${countryRule.weeklyHours.max} or fewer hours`;
    }
    return errors;
  })();

  const hasValidationErrors = Object.keys(fieldErrors).length > 0;

  const handleSendForm = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`✅ Form sent to ${candidate.name}. They'll receive it via email.`, { duration: 4000 });
    setIsSubmitting(false);
    onSent();
    onOpenChange(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("📝 Candidate information updated successfully.", { duration: 3000 });
    setIsSavingDraft(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[85%] sm:w-full sm:max-w-xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-border/30 shrink-0">
          <SheetDescription className="sr-only">Data collection form</SheetDescription>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold text-foreground leading-tight truncate">{candidate.name}</SheetTitle>
              <span className="text-base shrink-0">{candidate.flag}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{candidate.role} · Data Collection</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">Configure fields based on the agreed terms, and pre-fill any details you already have.</p>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {/* ── Section 1: Personal Profile ── */}
          <SectionCard title="Personal Profile">
            <Field label="Full Name">
              {isFromATS ? (
                <Input value={candidate.name} disabled className="bg-muted/50 h-10" />
              ) : (
                <Input value={formData.name} onChange={e => set("name")(e.target.value)} className="h-10" />
              )}
            </Field>
            <Field label="Email">
              {isFromATS ? (
                <Input value={candidate.email || "candidate@example.com"} disabled className="bg-muted/50 h-10" />
              ) : (
                <Input type="email" value={formData.email} onChange={e => set("email")(e.target.value)} className="h-10" />
              )}
            </Field>
            <Field label="Nationality" optional>
              <NationalityCombobox value={formData.nationality} onChange={set("nationality")} />
            </Field>
            <Field label="Address" optional>
              <Input value={formData.address} onChange={e => set("address")(e.target.value)} placeholder="Residential address" className="h-10" />
            </Field>
            <Field label="ID Number" optional>
              <Input value={formData.idNumber} onChange={e => set("idNumber")(e.target.value)} placeholder="National ID / Government ID" className="h-10" />
            </Field>
          </SectionCard>

          {/* ── Section 2: Working Engagement ── */}
          <SectionCard
            title="Working Engagement"
          >
            <Field label="Role">
              {isFromATS ? (
                <Input value={candidate.role} disabled className="bg-muted/50 h-10" />
              ) : (
                <Input value={formData.role} onChange={e => set("role")(e.target.value)} className="h-10" />
              )}
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
                {isFromATS ? (
                  <Input value={employmentType === "contractor" ? "Contractor" : "Employee"} disabled className="bg-muted/50 h-10" />
                ) : showEmploymentConfirm ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Bot className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Based on {candidate.country} hiring model, I suggest: <span className="font-semibold text-foreground">{employmentType === "contractor" ? "Contractor" : "Employee"}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant={employmentType === "contractor" ? "default" : "outline"} size="sm" onClick={() => { setEmploymentType("contractor"); setShowEmploymentConfirm(false); }} className="flex-1">
                        ✅ Contractor
                      </Button>
                      <Button type="button" variant={employmentType === "employee" ? "default" : "outline"} size="sm" onClick={() => { setEmploymentType("employee"); setShowEmploymentConfirm(false); }} className="flex-1">
                        💼 Employee
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Select value={employmentType} onValueChange={(v: "contractor" | "employee") => setEmploymentType(v)}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <Field label="Start Date">
                {isFromATS && candidate.startDate ? (
                  <Input value={candidate.startDate} disabled className="bg-muted/50 h-10" />
                ) : (
                  <Input type="date" value={formData.startDate} onChange={e => set("startDate")(e.target.value)} className="h-10" />
                )}
              </Field>
            </div>
            <Field label={employmentType === "employee" ? "Salary" : "Consultancy Fee"}>
              {isFromATS ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none select-none">
                    {getCurrencyCode(formData.country, employmentType)}
                  </span>
                  <Input value={candidate.salary} disabled className="bg-muted/50 pl-12 h-10" />
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none select-none">
                    {getCurrencyCode(formData.country, employmentType)}
                  </span>
                  <Input
                    value={parseSalaryValue(formData.salary)}
                    onChange={e => set("salary")(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="5,000"
                    className="pl-12 h-10"
                  />
                </div>
              )}
            </Field>
            <Field label="Work Location" optional>
              <Input value={formData.city} onChange={e => set("city")(e.target.value)} placeholder="e.g., Manila, Oslo" className="h-10" />
            </Field>

            {/* Terms fields (part of Working Engagement) */}
            {countryRule && (
              <div className="border-t border-border/40 pt-3 mt-1">
                <p className="text-[11px] text-muted-foreground mb-3">Country defaults for {formData.country} — adjust as negotiated</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Probation Period" hint={`Max: ${countryRule.probation.max} days`} error={fieldErrors.probationPeriod}>
                      <NumberFieldWithUnit value={formData.probationPeriod} onChange={set("probationPeriod")} unit="days" min={0} max={countryRule.probation.max} hasError={!!fieldErrors.probationPeriod} />
                    </Field>
                    <Field label="Notice Period" hint={`Min: ${countryRule.noticePeriod.min} days`} error={fieldErrors.noticePeriod}>
                      <NumberFieldWithUnit value={formData.noticePeriod} onChange={set("noticePeriod")} unit="days" min={countryRule.noticePeriod.min} hasError={!!fieldErrors.noticePeriod} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Annual Leave" hint={`Min: ${countryRule.annualLeave.min} days`} error={fieldErrors.annualLeave}>
                      <NumberFieldWithUnit value={formData.annualLeave} onChange={set("annualLeave")} unit="days" min={countryRule.annualLeave.min} hasError={!!fieldErrors.annualLeave} />
                    </Field>
                    <Field label="Sick Leave" hint={`Min: ${countryRule.sickLeave.min} days`} error={fieldErrors.sickLeave}>
                      <NumberFieldWithUnit value={formData.sickLeave} onChange={set("sickLeave")} unit="days" min={countryRule.sickLeave.min} hasError={!!fieldErrors.sickLeave} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Weekly Hours" hint={`Max: ${countryRule.weeklyHours.max} hrs`} error={fieldErrors.weeklyHours}>
                      <NumberFieldWithUnit value={formData.weeklyHours} onChange={set("weeklyHours")} unit="hours" max={countryRule.weeklyHours.max} step={0.5} hasError={!!fieldErrors.weeklyHours} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ── Insurance & Benefits (via Kota.io) ── */}
            {countryRule && (() => {
              const ins = COUNTRY_INSURANCE[formData.country];
              if (!ins) return null;

              const employerTotal = ins.employer_contributions.reduce((sum, c) => sum + c.amount, 0);
              const employeeTotal = ins.employee_contributions.reduce((sum, c) => sum + c.amount, 0);
              const grandTotal = employerTotal + employeeTotal;

              const CATEGORY_LABELS: Record<string, string> = {
                gross_premium: "Premium",
                tax: "Tax",
                tax_relief: "Tax relief",
              };

              return (
                <div className="border-t border-border/40 pt-3 mt-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-3.5 w-3.5 text-primary/70" />
                    <p className="text-[11px] text-muted-foreground">Health Insurance — {formData.country}</p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal ml-auto gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Kota
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-[9px] px-1.5 py-0 h-4 font-normal",
                      ins.status === "finalized" ? "border-primary/30 text-primary" : "border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {ins.status === "finalized" ? "Finalized" : "Open"}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-3">
                    {/* Provider header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">{ins.provider}</p>
                        <p className="text-[11px] text-muted-foreground">{ins.plan}</p>
                        <p className="text-[10px] text-muted-foreground/60">{ins.region} coverage</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs font-semibold text-foreground tabular-nums">
                          {ins.currency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">total / month</p>
                      </div>
                    </div>

                    {/* Opt-in toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInsuranceOptIn(!insuranceOptIn)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                          insuranceOptIn ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      >
                        <span className={cn(
                          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200",
                          insuranceOptIn ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                      <span className="text-[11px] text-muted-foreground">
                        {insuranceOptIn ? "Offer insurance to this worker" : "Insurance not offered"}
                      </span>
                    </div>

                    {insuranceOptIn && (
                      <div className="space-y-2.5 pt-1">
                        {/* Contribution totals */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md border border-border/40 bg-card/60 p-2.5 space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Employer</p>
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                              {ins.currency} {employerTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-muted-foreground tabular-nums">
                              {ins.employer_contributions.length} line{ins.employer_contributions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Employee</p>
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                              {ins.currency} {employeeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-muted-foreground tabular-nums">
                              {ins.employee_contributions.length} line{ins.employee_contributions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Stacked bar */}
                        <div className="space-y-1">
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted/50">
                            <div className="bg-muted-foreground/25 transition-all" style={{ width: `${grandTotal > 0 ? (employerTotal / grandTotal) * 100 : 50}%` }} />
                            <div className="bg-primary/40 transition-all" style={{ width: `${grandTotal > 0 ? (employeeTotal / grandTotal) * 100 : 50}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground/60 tabular-nums">
                            <span>Employer {grandTotal > 0 ? Math.round((employerTotal / grandTotal) * 100) : 50}%</span>
                            <span>Employee {grandTotal > 0 ? Math.round((employeeTotal / grandTotal) * 100) : 50}%</span>
                          </div>
                        </div>

                        {/* Line-item breakdown */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Info className="h-3 w-3 text-muted-foreground/50" />
                            <p className="text-[10px] text-muted-foreground/60">Contribution breakdown from Kota report</p>
                          </div>
                          <div className="rounded-md border border-border/30 overflow-hidden text-[11px]">
                            {/* Employer lines */}
                            {ins.employer_contributions.map((c) => (
                              <div key={c.id} className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/20 last:border-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-muted-foreground/50 w-[18px] shrink-0">ER</span>
                                  <span className="text-muted-foreground truncate">{CATEGORY_LABELS[c.category] || c.category}</span>
                                  {c.member_type !== "policyholder" && (
                                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 font-normal">
                                      {c.member_type.replace("_", " ")}
                                    </Badge>
                                  )}
                                  {c.note && (
                                    <span className="text-[10px] text-muted-foreground/40 italic truncate">{c.note}</span>
                                  )}
                                </div>
                                <span className={cn("tabular-nums font-medium shrink-0 ml-2", c.amount < 0 ? "text-destructive" : "text-foreground")}>
                                  {c.amount < 0 ? "−" : ""}{ins.currency} {Math.abs(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                            {/* Employee lines */}
                            {ins.employee_contributions.map((c) => (
                              <div key={c.id} className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/20 last:border-0 bg-primary/[0.02]">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-primary/50 w-[18px] shrink-0">EE</span>
                                  <span className="text-muted-foreground truncate">{CATEGORY_LABELS[c.category] || c.category}</span>
                                  {c.member_type !== "policyholder" && (
                                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 font-normal">
                                      {c.member_type.replace("_", " ")}
                                    </Badge>
                                  )}
                                </div>
                                <span className="tabular-nums font-medium text-foreground shrink-0 ml-2">
                                  {ins.currency} {c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </SectionCard>


          {/* Action buttons */}
          <div className="space-y-2 pt-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft || hasValidationErrors}
                className="flex-1"
              >
                {isSavingDraft ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" onClick={handleSendForm} disabled={isSubmitting || hasValidationErrors} className="flex-1">
                {isSubmitting ? (isResend ? "Resending..." : "Sending...") : (isResend ? "Resend Form" : "Send Form")}
              </Button>
            </div>
            {onPrepareContract && !isResend && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrepareContract}
                className="w-full text-xs h-8 gap-1.5 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
              >
                <FileEdit className="h-3.5 w-3.5" />
                Skip data collection — Prepare contract directly
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
