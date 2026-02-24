/**
 * Flow 2 v2 - Candidate Data Collection (Single Page Form)
 * 
 * Aligned with admin-side configuration from Flow 1 v5:
 * - Section 1: Personal Profile (worker fills optional fields)
 * - Section 2: Working Engagement (read-only terms confirmed by company + worker fills location)
 * 
 * Uses SectionCard pattern matching admin drawer UX.
 * Version: v2 (staging)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle2, ChevronDown, Lock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

// ─── Country Rules (matching admin-side F1v5) ───
interface CountryRule {
  flag: string;
  currency: string;
  probation: { default: number; unit: string };
  noticePeriod: { default: number; unit: string };
  annualLeave: { default: number; unit: string };
  sickLeave: { default: number; unit: string };
  weeklyHours: { default: number; unit: string };
  payFrequency: string;
  idLabel: string;
  idPlaceholder: string;
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  Norway: {
    flag: "🇳🇴", currency: "NOK",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 25, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 37.5, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "National ID (Fødselsnummer)",
    idPlaceholder: "11-digit personal number",
  },
  Sweden: {
    flag: "🇸🇪", currency: "SEK",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 25, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "Personal Number (Personnummer)",
    idPlaceholder: "YYMMDD-XXXX",
  },
  Philippines: {
    flag: "🇵🇭", currency: "PHP",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 5, unit: "days" },
    sickLeave: { default: 5, unit: "days" },
    weeklyHours: { default: 48, unit: "hours" },
    payFrequency: "Fortnightly",
    idLabel: "TIN / PhilHealth ID",
    idPlaceholder: "e.g., 123-456-789-000",
  },
  India: {
    flag: "🇮🇳", currency: "INR",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 21, unit: "days" },
    sickLeave: { default: 12, unit: "days" },
    weeklyHours: { default: 48, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "PAN Number",
    idPlaceholder: "e.g., ABCDE1234F",
  },
  Kosovo: {
    flag: "🇽🇰", currency: "EUR",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 20, unit: "days" },
    sickLeave: { default: 20, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "Personal ID Number",
    idPlaceholder: "National ID number",
  },
  Denmark: {
    flag: "🇩🇰", currency: "DKK",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 25, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 37, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "CPR Number",
    idPlaceholder: "DDMMYY-XXXX",
  },
  Singapore: {
    flag: "🇸🇬", currency: "SGD",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 7, unit: "days" },
    sickLeave: { default: 14, unit: "days" },
    weeklyHours: { default: 44, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "NRIC / FIN",
    idPlaceholder: "e.g., S1234567A",
  },
  Spain: {
    flag: "🇪🇸", currency: "EUR",
    probation: { default: 60, unit: "days" },
    noticePeriod: { default: 15, unit: "days" },
    annualLeave: { default: 22, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "DNI / NIE",
    idPlaceholder: "e.g., 12345678Z",
  },
  Romania: {
    flag: "🇷🇴", currency: "RON",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 20, unit: "days" },
    annualLeave: { default: 20, unit: "days" },
    sickLeave: { default: 183, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "CNP (Personal Numeric Code)",
    idPlaceholder: "13-digit code",
  },
};

const NATIONALITIES = [
  "American", "Australian", "Brazilian", "British", "Canadian", "Chinese", "Danish",
  "Dutch", "Filipino", "Finnish", "French", "German", "Greek", "Indian", "Indonesian",
  "Irish", "Italian", "Japanese", "Korean", "Kosovar", "Malaysian", "Mexican",
  "Norwegian", "Polish", "Portuguese", "Romanian", "Russian", "Singaporean",
  "South African", "Spanish", "Swedish", "Swiss", "Thai", "Turkish", "Ukrainian",
];

// ─── Prefilled data from ATS (simulating admin-configured data) ───
const PREFILLED = {
  fullName: "Sofia Rodriguez",
  email: "sofia.rodriguez@email.com",
  role: "Marketing Manager",
  country: "Philippines",
  employmentType: "Contractor" as const,
  startDate: "2025-02-01",
  salary: "₱85,000",
  companyName: "Acme Corp",
};

// ─── Analytics (staging) ───
const F2v2_Analytics = {
  track: (event: string, data?: Record<string, unknown>) => {
    console.log(`[F2v2_Analytics][staging] ${event}`, data || {});
  }
};

// ─── UI Components (matching admin SectionCard pattern) ───
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

const Field: React.FC<{
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}> = ({ label, optional, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {optional && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
  </div>
);

const ReadOnlyField: React.FC<{
  label: string;
  value: string;
  unit?: string;
}> = ({ label, value, unit }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <Input value={value} disabled className="bg-muted/50 h-10 flex-1" />
      {unit && (
        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md border border-border/40 whitespace-nowrap select-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// ─── Main Component ───
const F2v2_CandidateDataForm: React.FC = () => {
  const navigate = useNavigate();
  const countryRule = COUNTRY_RULES[PREFILLED.country];

  const [formData, setFormData] = useState({
    // Worker fills these (optional from admin side)
    nationality: "",
    address: "",
    idNumber: "",
    workLocation: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    F2v2_Analytics.track('flow2_v2_opened');
  }, []);

  const set = (key: string) => (value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const isFormValid = () => {
    // At minimum, nationality and ID are needed
    return formData.nationality && formData.idNumber;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      F2v2_version: "v2",
      submitted_at: new Date().toISOString(),
      prefilled: PREFILLED,
      worker_provided: formData,
    };

    console.log('[F2v2_SubmitAction] Payload:', JSON.stringify(payload, null, 2));
    F2v2_Analytics.track('flow2_v2_submitted', payload);

    await new Promise(r => setTimeout(r, 1000));

    toast.success("Your details have been submitted successfully", {
      description: `${PREFILLED.companyName} will be notified.`
    });
    setIsSubmitting(false);
    navigate("/");
  };

  const handleCancel = () => {
    F2v2_Analytics.track('flow2_v2_cancelled');
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
      {/* Back Arrow */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-foreground hover:bg-transparent">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          {/* Header with Audio Wave */}
          <div className="flex flex-col items-center pt-4">
            <div className="mb-4" style={{ maxHeight: '120px' }}>
              <AudioWaveVisualizer isActive={false} />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground text-center">
                Hi {PREFILLED.fullName.split(' ')[0]}! Let's complete your details
              </h1>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0">
                v2
              </Badge>
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Please verify the information below and fill in the remaining fields.
            </p>
          </div>

          {/* ── Section 1: Personal Profile ── */}
          <SectionCard title="Personal Profile">
            {/* Locked fields from ATS */}
            <Field label="Full Name">
              <Input value={PREFILLED.fullName} disabled className="bg-muted/50 h-10" />
            </Field>
            <Field label="Email">
              <Input value={PREFILLED.email} disabled className="bg-muted/50 h-10" />
            </Field>

            {/* Worker fills these */}
            <div className="border-t border-border/40 pt-3 mt-1">
              <p className="text-[11px] text-muted-foreground mb-3">Please complete the following</p>
            </div>

            <Field label="Nationality">
              <Select value={formData.nationality} onValueChange={set("nationality")}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select your nationality" /></SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Residential Address" optional>
              <Input
                value={formData.address}
                onChange={e => set("address")(e.target.value)}
                placeholder="Full residential address"
                className="h-10"
              />
            </Field>

            <Field label={countryRule?.idLabel || "ID Number"}>
              <Input
                value={formData.idNumber}
                onChange={e => set("idNumber")(e.target.value)}
                placeholder={countryRule?.idPlaceholder || "Government-issued ID number"}
                className="h-10"
              />
            </Field>
          </SectionCard>

          {/* ── Section 2: Working Engagement ── */}
          <SectionCard
            title="Working Engagement"
            badge={
              <Badge variant="outline" className="text-xs font-medium gap-1">
                {countryRule?.flag} {PREFILLED.country}
              </Badge>
            }
          >
            {/* Core terms — read-only, confirmed by company */}
            <Field label="Role">
              <Input value={PREFILLED.role} disabled className="bg-muted/50 h-10" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Employment Type">
                <Input value={PREFILLED.employmentType} disabled className="bg-muted/50 h-10" />
              </Field>
              <Field label="Start Date">
                <Input value={PREFILLED.startDate} disabled className="bg-muted/50 h-10" />
              </Field>
            </div>

            <Field label={PREFILLED.employmentType === "Contractor" ? "Consultancy Fee" : "Salary"}>
              <Input value={PREFILLED.salary} disabled className="bg-muted/50 h-10" />
            </Field>

            {/* Worker fills location */}
            <Field label="Work Location" optional>
              <Input
                value={formData.workLocation}
                onChange={e => set("workLocation")(e.target.value)}
                placeholder="e.g., Manila, Oslo, Remote"
                className="h-10"
              />
            </Field>

            {/* Terms & Entitlements — read-only country defaults */}
            {countryRule && (
              <div className="border-t border-border/40 pt-3 mt-1">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[11px] text-muted-foreground">
                    Terms & Entitlements — confirmed with {PREFILLED.companyName} for {PREFILLED.country}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField
                      label="Probation Period"
                      value={String(countryRule.probation.default)}
                      unit={countryRule.probation.unit}
                    />
                    <ReadOnlyField
                      label="Notice Period"
                      value={String(countryRule.noticePeriod.default)}
                      unit={countryRule.noticePeriod.unit}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField
                      label="Annual Leave"
                      value={String(countryRule.annualLeave.default)}
                      unit={countryRule.annualLeave.unit}
                    />
                    <ReadOnlyField
                      label="Sick Leave"
                      value={String(countryRule.sickLeave.default)}
                      unit={countryRule.sickLeave.unit}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField
                      label="Weekly Hours"
                      value={String(countryRule.weeklyHours.default)}
                      unit={countryRule.weeklyHours.unit}
                    />
                    <ReadOnlyField
                      label="Pay Frequency"
                      value={countryRule.payFrequency}
                    />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Compliance badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>GDPR Compliant • Your data is encrypted and secure</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Details"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default F2v2_CandidateDataForm;
