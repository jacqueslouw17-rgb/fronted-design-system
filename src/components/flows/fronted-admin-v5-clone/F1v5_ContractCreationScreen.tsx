/**
 * F1v5_ContractCreationScreen — Review & Confirm candidate details
 * 
 * ISOLATED: v5-specific version with categorized sections matching
 * the Add Candidate Drawer structure (Personal Details, Contract Details,
 * Terms & Entitlements). Changes here do NOT affect any other flow.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sparkles, ChevronDown, User, Briefcase, Calendar, Shield, Clock,
  MapPin, Globe, Building2, Banknote, FileText, Landmark, Phone,
} from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { getCurrencyCode, parseSalaryValue } from "@/utils/currencyUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
};

interface Props {
  candidate: Candidate;
  onNext: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalCandidates?: number;
}

/* ── Reusable Section Card ── */
const SectionCard: React.FC<{
  title: string;
  icon: React.ElementType;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon: Icon, subtitle, badge, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-muted/30 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {badge}
              </div>
              {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground/60 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-2 space-y-4 border-t border-border/20">
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

/* ── Field wrapper ── */
const Field: React.FC<{
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}> = ({ label, error, hint, optional, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {optional && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
    {error && <p className="text-destructive text-xs">{error}</p>}
    {hint && !error && <p className="text-muted-foreground text-[11px]">{hint}</p>}
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

  const [formData, setFormData] = useState({
    fullName: candidate.name,
    email: candidate.email || "",
    role: candidate.role,
    nationality: candidate.nationality || "",
    city: candidate.city || "",
    address: candidate.address || "",
    idType: candidate.idType || "",
    idNumber: candidate.idNumber || "",
    country: candidate.country,
    startDate: candidate.startDate || "",
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

  const set = (key: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const handleValidate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Required";
    if (!formData.email?.trim()) newErrors.email = "Required";
    if (!formData.role?.trim()) newErrors.role = "Required";
    if (!formData.salary) newErrors.salary = "Required";
    if (!formData.startDate) newErrors.startDate = "Required";
    else {
      const [y, m, d] = formData.startDate.split("-").map(Number);
      const sd = new Date(y, m - 1, d);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (sd < today) newErrors.startDate = "Must be a future date";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) window.scrollTo({ top: 0, behavior: "smooth" });
    return Object.keys(newErrors).length === 0;
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
      className="px-8 pb-8 pt-4 max-w-3xl mx-auto space-y-3"
    >
      <AgentHeader
        title={`Review ${candidate.name.split(" ")[0]}'s Details`}
        subtitle="Confirm the details below before generating contract documents."
        showPulse={true}
        showInput={false}
        progressIndicator={
          totalCandidates > 1 ? (
            <div className="flex items-center gap-3">
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

      {/* ── Candidate Header Chip ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm"
      >
        <span className="text-3xl">{candidate.flag}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">{candidate.name}</h3>
          <p className="text-xs text-muted-foreground">{candidate.role} · {candidate.country}</p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          {employmentType === "employee" ? "Employee" : "Contractor"}
        </Badge>
      </motion.div>

      {/* ── Section 1: Personal Details ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionCard title="Personal Details" icon={User} subtitle="Identity and contact information">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" error={errors.fullName}>
              <Input value={formData.fullName} onChange={e => set("fullName")(e.target.value)} className="h-10" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={formData.email} onChange={e => set("email")(e.target.value)} placeholder="email@example.com" className="h-10" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nationality" optional>
              <Select value={formData.nationality} onValueChange={set("nationality")}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Swedish", "Norwegian", "Filipino", "Indian", "Kosovar", "Danish", "American", "British", "German"].map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Country">
              <Select value={formData.country} onValueChange={set("country")}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Norway", "Sweden", "Denmark", "Philippines", "India", "Kosovo"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ID Type" optional>
              <Select value={formData.idType} onValueChange={set("idType")}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="National ID">National ID</SelectItem>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Driver's License">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="ID Number" optional>
              <Input value={formData.idNumber} onChange={e => set("idNumber")(e.target.value)} placeholder="Enter ID" className="h-10" />
            </Field>
          </div>
          <Field label="City" optional>
            <Input value={formData.city} onChange={e => set("city")(e.target.value)} placeholder="e.g., Monterrey" className="h-10" />
          </Field>
          <Field label="Address" optional>
            <Input value={formData.address} onChange={e => set("address")(e.target.value)} placeholder="Residential address" className="h-10" />
          </Field>
        </SectionCard>
      </motion.div>

      {/* ── Section 2: Contract Details ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionCard title="Contract Details" icon={Briefcase} subtitle="Employment terms and compensation">
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
            <Field label="Role" error={errors.role}>
              <Input value={formData.role} onChange={e => set("role")(e.target.value)} className="h-10" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary" error={errors.salary} hint="Monthly gross amount">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none select-none">
                  {getCurrencyCode(formData.country, employmentType)}
                </span>
                <Input
                  value={parseSalaryValue(formData.salary)}
                  onChange={e => set("salary")(e.target.value)}
                  placeholder="5,000"
                  className="pl-12 h-10"
                />
              </div>
            </Field>
            <Field label="Start Date" error={errors.startDate}>
              <Input
                type="date"
                value={formData.startDate}
                onChange={e => set("startDate")(e.target.value)}
                className={cn("h-10", formData.startDate ? "text-foreground" : "text-muted-foreground")}
              />
            </Field>
          </div>
          <Field label="Tax Residence" optional>
            <Input value={formData.taxResidence} onChange={e => set("taxResidence")(e.target.value)} placeholder="e.g., Norway" className="h-10" />
          </Field>
        </SectionCard>
      </motion.div>

      {/* ── Section 3: Payout & Emergency ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SectionCard title="Payout & Emergency" icon={Landmark} subtitle="Bank details and emergency contacts" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank Name" optional>
              <Input value={formData.bankName} onChange={e => set("bankName")(e.target.value)} placeholder="Bank name" className="h-10" />
            </Field>
            <Field label="Account / IBAN" optional>
              <Input value={formData.bankAccount} onChange={e => set("bankAccount")(e.target.value)} placeholder="Account number" className="h-10" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emergency Contact" optional>
              <Input value={formData.emergencyContactName} onChange={e => set("emergencyContactName")(e.target.value)} placeholder="Contact name" className="h-10" />
            </Field>
            <Field label="Emergency Phone" optional>
              <Input value={formData.emergencyContactPhone} onChange={e => set("emergencyContactPhone")(e.target.value)} placeholder="+1 234 567 890" className="h-10" />
            </Field>
          </div>
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
        <Button onClick={handleNext} size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          {currentIndex + 1 === totalCandidates
            ? (totalCandidates > 1 ? "Review Agreements" : "Review Agreement")
            : "Review Next Candidate"}
        </Button>
      </motion.div>
    </motion.div>
  );
};
