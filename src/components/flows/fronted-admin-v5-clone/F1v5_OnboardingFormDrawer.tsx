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
import { CheckCircle2, Bot, ChevronDown } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { getCurrencyCode, parseSalaryValue } from "@/utils/currencyUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface OnboardingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  onComplete: () => void;
  onSent: () => void;
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
  children: React.ReactNode;
}> = ({ label, optional, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {optional && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
    {hint && <p className="text-muted-foreground text-[11px]">{hint}</p>}
  </div>
);

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

export const F1v4_OnboardingFormDrawer: React.FC<OnboardingFormDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSent,
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
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-border/30 shrink-0">
          <SheetDescription className="sr-only">Data collection form</SheetDescription>
          <div className="min-w-0">
            <SheetTitle className="text-base font-semibold text-foreground leading-tight truncate">{candidate.flag} {candidate.name}</SheetTitle>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{candidate.role} · Data Collection</p>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
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
              <Select value={formData.nationality} onValueChange={set("nationality")}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Swedish", "Norwegian", "Filipino", "Indian", "Kosovar", "Danish", "Singaporean", "American", "British", "German", "Spanish", "Romanian"].map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            badge={formData.country ? (
              <Badge variant="outline" className="text-xs font-medium gap-1">
                {countryRule?.flag || candidate.flag} {formData.country}
              </Badge>
            ) : undefined}
          >
            <Field label="Role">
              {isFromATS ? (
                <Input value={candidate.role} disabled className="bg-muted/50 h-10" />
              ) : (
                <Input value={formData.role} onChange={e => set("role")(e.target.value)} className="h-10" />
              )}
            </Field>
            <Field label="Country">
              <Select value={formData.country} onValueChange={set("country")}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNTRY_RULES).map(([c, r]) => (
                    <SelectItem key={c} value={c}><span className="mr-2">{r.flag}</span>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Preview message */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {isResend ? "This form was sent to:" : "This form will be sent to:"}
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                <p className="text-xs text-muted-foreground">{candidate.email || candidate.role}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="flex-1"
            >
              {isSavingDraft ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" onClick={handleSendForm} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (isResend ? "Resending..." : "Sending...") : (isResend ? "Resend Form" : "Send Form")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
