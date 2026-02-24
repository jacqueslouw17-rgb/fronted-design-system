/**
 * Flow 1 v5 — Add Candidate Drawer (Enhanced)
 * Progressive disclosure: Personal Details → Contract Details (revealed after country selection)
 * ISOLATED: Changes here do NOT affect v4 or any other flow.
 */

import React, { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Sparkles, MapPin, FileText, ChevronDown } from "lucide-react";
import { getCurrencyCode } from "@/utils/currencyUtils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Country Rules ──────────────────────────────────────────────────────
interface CountryRule {
  flag: string;
  currency: string;
  employmentTypes: ("contractor" | "employee")[];
  probation: { default: number; max: number };         // days
  noticePeriod: { default: number; min: number };       // days
  annualLeave: { default: number; min: number };        // days
  sickLeave: { default: number; min: number };          // days
  weeklyHours: { default: number; max: number };        // hours
  payFrequency: { default: string; locked: boolean };   // monthly | fortnightly
  idLabel: string;                                       // e.g. "National ID", "PAN"
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

// ─── Component ──────────────────────────────────────────────────────────
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
    name: "",
    email: "",
    nationality: "",
    address: "",
    idNumber: "",
    country: "",
    role: "",
    employmentType: "" as "" | "contractor" | "employee",
    salary: "",
    startDate: "",
    probationPeriod: "",
    noticePeriod: "",
    annualLeave: "",
    sickLeave: "",
    weeklyHours: "",
    payFrequency: "",
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
          name: candidate.name,
          email: candidate.email,
          nationality: "",
          address: "",
          idNumber: "",
          country: candidate.country,
          role: candidate.role,
          employmentType: candidate.employmentType,
          salary: "",
          startDate: "",
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
        ? formData.employmentType
        : "");
    setFormData(prev => ({
      ...prev,
      country,
      employmentType: empType,
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
    const newCandidate = {
      id: `candidate-${Date.now()}`,
      name: formData.name,
      country: formData.country,
      countryFlag: rule?.flag || "",
      role: formData.role,
      salary: formData.salary,
      status: "offer-accepted" as const,
      formSent: false,
      dataReceived: false,
      employmentType: formData.employmentType,
      hasATSData: selectedAtsId !== "manual",
      email: formData.email,
      startDate: formData.startDate,
      // Contract-specific details
      probationPeriod: formData.probationPeriod,
      noticePeriod: formData.noticePeriod,
      annualLeave: formData.annualLeave,
      sickLeave: formData.sickLeave,
      weeklyHours: formData.weeklyHours,
      payFrequency: formData.payFrequency,
    };
    onSave(newCandidate);
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

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Add Candidate
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* ── Candidate Selector ── */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Candidate</Label>
            <Select value={selectedAtsId} onValueChange={handleATSSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose from ATS or add manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Enter manually</span>
                  </div>
                </SelectItem>
                {ATS_CANDIDATES.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span>{COUNTRY_RULES[c.country]?.flag}</span>
                      <span>{c.name}</span>
                      <Badge variant="secondary" className="text-xs ml-1">
                        <Sparkles className="h-3 w-3 mr-1" />ATS
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isATSSelected && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Details pre-filled from your ATS
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* ── Section 1: Personal Details ── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Personal Details</h3>
                  </div>
                  <div className="space-y-4 pl-6">
                    <FieldRow label="Full Name" required>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., Maria Santos"
                      />
                    </FieldRow>
                    <FieldRow label="Email" required>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </FieldRow>
                    <FieldRow label="Nationality">
                      <Input
                        value={formData.nationality}
                        onChange={e => setFormData(p => ({ ...p, nationality: e.target.value }))}
                        placeholder="e.g., Filipino"
                      />
                    </FieldRow>
                    <FieldRow label="Role" required>
                      <Input
                        value={formData.role}
                        onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                        placeholder="e.g., Senior Developer"
                      />
                    </FieldRow>
                  </div>
                </div>

                <Separator />

                {/* ── Section 2: Contract Details ── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Contract Details</h3>
                  </div>
                  <div className="space-y-4 pl-6">
                    {/* Country — gateway field */}
                    <FieldRow label="Country" required>
                      <Select value={formData.country} onValueChange={handleCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country to reveal contract fields" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c}>
                              {COUNTRY_RULES[c].flag} {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldRow>

                    {/* Country not yet selected — hint */}
                    {!showContractFields && (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center mb-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select a country to reveal contract-specific fields
                        </p>
                      </div>
                    )}

                    {/* Country-specific fields revealed */}
                    <AnimatePresence mode="wait">
                      {showContractFields && countryRule && (
                        <motion.div
                          key={formData.country}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4 overflow-hidden"
                        >
                          {/* Employment Type */}
                          <FieldRow label="Employment Type" required>
                            <Select
                              value={formData.employmentType}
                              onValueChange={(v: "contractor" | "employee") => setFormData(p => ({ ...p, employmentType: v }))}
                              disabled={isContractorOnly}
                            >
                              <SelectTrigger className={isContractorOnly ? "opacity-70" : ""}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryRule.employmentTypes.map(t => (
                                  <SelectItem key={t} value={t}>
                                    {t === "employee" ? "Employee" : "Contractor"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isContractorOnly && (
                              <p className="text-xs text-muted-foreground">Contractor only in {formData.country}</p>
                            )}
                          </FieldRow>

                          {/* Salary */}
                          <FieldRow label="Salary" required>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
                                {formData.employmentType
                                  ? getCurrencyCode(formData.country, formData.employmentType as any)
                                  : countryRule.currency}
                              </span>
                              <Input
                                value={formData.salary}
                                onChange={e => {
                                  const v = e.target.value.replace(/[^0-9]/g, "");
                                  setFormData(p => ({ ...p, salary: v }));
                                }}
                                placeholder="5000"
                                className="pl-12"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Monthly amount (numbers only)</p>
                          </FieldRow>

                          {/* Start Date */}
                          <FieldRow label="Start Date" required>
                            <Input
                              type="date"
                              value={formData.startDate}
                              onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                            />
                          </FieldRow>

                          {/* ID Number */}
                          <FieldRow label={countryRule.idLabel}>
                            <Input
                              value={formData.idNumber}
                              onChange={e => setFormData(p => ({ ...p, idNumber: e.target.value }))}
                              placeholder={`Enter ${countryRule.idLabel}`}
                            />
                          </FieldRow>

                          {/* Address */}
                          <FieldRow label="Address">
                            <Input
                              value={formData.address}
                              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                              placeholder="Full residential address"
                            />
                          </FieldRow>

                          <Separator className="my-2" />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Terms & Entitlements
                          </p>

                          {/* Probation Period */}
                          <FieldRow label="Probation Period">
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.probationPeriod}
                                onChange={e => setFormData(p => ({ ...p, probationPeriod: e.target.value }))}
                                max={countryRule.probation.max}
                                min={0}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">days</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Maximum: {countryRule.probation.max} days</p>
                          </FieldRow>

                          {/* Notice Period */}
                          <FieldRow label="Notice Period">
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.noticePeriod}
                                onChange={e => setFormData(p => ({ ...p, noticePeriod: e.target.value }))}
                                min={countryRule.noticePeriod.min}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">days</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Minimum: {countryRule.noticePeriod.min} days</p>
                          </FieldRow>

                          {/* Annual Leave */}
                          <FieldRow label="Annual Leave">
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.annualLeave}
                                onChange={e => setFormData(p => ({ ...p, annualLeave: e.target.value }))}
                                min={countryRule.annualLeave.min}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">days</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Minimum: {countryRule.annualLeave.min} days</p>
                          </FieldRow>

                          {/* Sick Leave */}
                          <FieldRow label="Sick Leave">
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.sickLeave}
                                onChange={e => setFormData(p => ({ ...p, sickLeave: e.target.value }))}
                                min={countryRule.sickLeave.min}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">days</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Minimum: {countryRule.sickLeave.min} days</p>
                          </FieldRow>

                          {/* Weekly Hours */}
                          <FieldRow label="Weekly Work Hours">
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.weeklyHours}
                                onChange={e => setFormData(p => ({ ...p, weeklyHours: e.target.value }))}
                                max={countryRule.weeklyHours.max}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">hours</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Maximum: {countryRule.weeklyHours.max} hours</p>
                          </FieldRow>

                          {/* Pay Frequency */}
                          <FieldRow label="Pay Frequency">
                            <Select
                              value={formData.payFrequency}
                              onValueChange={v => setFormData(p => ({ ...p, payFrequency: v }))}
                              disabled={countryRule.payFrequency.locked}
                            >
                              <SelectTrigger className={countryRule.payFrequency.locked ? "opacity-70" : ""}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                              </SelectContent>
                            </Select>
                            {countryRule.payFrequency.locked && (
                              <p className="text-xs text-muted-foreground">
                                Fixed to {countryRule.payFrequency.default} for {formData.country}
                              </p>
                            )}
                          </FieldRow>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => { resetForm(); onOpenChange(false); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSave} disabled={!isFormValid}>
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

// ─── Reusable Field Row ─────────────────────────────────────────────────
const FieldRow: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);
