/**
 * Flow 1 — Fronted Admin Dashboard v5
 * 
 * PayrollDataCollectionDrawer — "Configure & Send" drawer for Onboard Candidate column.
 * Sections: Payroll Parameters + Payout Destination (matching Done column categories).
 * Country-specific tax/statutory fields fold into Payroll Parameters.
 */

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Country-specific payroll field definitions ───
interface PayrollField {
  key: string;
  label: string;
  type: "text" | "select" | "number";
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// ─── Payroll Country Defaults (country-level payroll config, not worker-specific) ───
interface PayrollCountryDefault {
  key: string;
  label: string;
  value: string;
  type: "text" | "number" | "info";
  helpText?: string;
}

interface DeMinimisItem {
  label: string;
  amount: string;
  period: string;
}

interface PayrollCountryDefaultsConfig {
  overtimeDefaults: PayrollCountryDefault[];
  deMinimis: DeMinimisItem[];
  additionalDefaults?: PayrollCountryDefault[];
}

const PAYROLL_COUNTRY_DEFAULTS: Record<string, PayrollCountryDefaultsConfig> = {
  Philippines: {
    overtimeDefaults: [
      { key: "ot_regular", label: "Regular OT Rate", value: "1.25x", type: "text", helpText: "125% of hourly rate for work beyond 8 hours" },
      { key: "ot_restday", label: "Rest Day / Special Holiday OT", value: "1.30x", type: "text", helpText: "130% of hourly rate" },
      { key: "ot_regular_holiday", label: "Regular Holiday OT", value: "2.00x", type: "text", helpText: "200% of daily rate" },
      { key: "night_diff", label: "Night Differential", value: "10%", type: "text", helpText: "Additional 10% for work between 10PM–6AM" },
    ],
    deMinimis: [
      { label: "Rice Subsidy", amount: "₱2,000", period: "/month" },
      { label: "Clothing Allowance", amount: "₱6,000", period: "/year" },
      { label: "Laundry Allowance", amount: "₱300", period: "/month" },
      { label: "Medical (Cash)", amount: "₱10,000", period: "/year" },
      { label: "Achievement Award", amount: "₱10,000", period: "/year" },
    ],
    additionalDefaults: [
      { key: "thirteenth_month", label: "13th Month Pay", value: "Mandatory", type: "info", helpText: "Required for all rank-and-file employees — paid on or before Dec 24" },
    ],
  },
};

interface CountryPayrollConfig {
  payrollFields: PayrollField[];
  bankFields: PayrollField[];
}

const INDIA_CONFIG: CountryPayrollConfig = {
  payrollFields: [
    { key: "pan_number", label: "PAN Number", type: "text", required: true, placeholder: "e.g., ABCDE1234F" },
    {
      key: "tax_regime", label: "Income Tax Regime", type: "select", required: true,
      helpText: "New regime: simpler, lower rates. Old regime: allows deductions (80C, HRA, etc.)",
      options: [
        { value: "new", label: "New Regime (FY 2024-25)" },
        { value: "old", label: "Old Regime (with deductions)" },
      ],
    },
    { key: "uan_number", label: "UAN (PF Number)", type: "text", placeholder: "e.g., 100123456789" },
    {
      key: "pf_contribution", label: "PF Contribution", type: "select", required: true,
      options: [
        { value: "statutory", label: "Statutory (12% of basic)" },
        { value: "voluntary", label: "Voluntary PF (higher)" },
        { value: "opted_out", label: "Opted Out (salary > ₹15,000)" },
      ],
    },
    { key: "esi_number", label: "ESI Number", type: "text", placeholder: "If applicable" },
    {
      key: "professional_tax", label: "Professional Tax", type: "select",
      options: [
        { value: "applicable", label: "Applicable" },
        { value: "exempt", label: "Exempt" },
      ],
    },
    { key: "gratuity_nominee", label: "Gratuity Nominee Name", type: "text", placeholder: "Full legal name" },
  ],
  bankFields: [
    { key: "account_holder_name", label: "Account Holder Name", type: "text", required: true, placeholder: "As per bank records" },
    { key: "account_number", label: "Bank Account Number", type: "text", required: true, placeholder: "Enter account number" },
    { key: "ifsc_code", label: "IFSC Code", type: "text", required: true, placeholder: "e.g., SBIN0001234" },
    { key: "bank_name", label: "Bank Name", type: "text", required: true, placeholder: "e.g., State Bank of India" },
    { key: "branch_name", label: "Branch", type: "text", placeholder: "e.g., Koramangala, Bangalore" },
  ],
};

const PHILIPPINES_CONFIG: CountryPayrollConfig = {
  payrollFields: [
    { key: "tin", label: "TIN (Tax ID)", type: "text", required: true, placeholder: "e.g., 123-456-789-000" },
    {
      key: "civil_status", label: "Civil Status / Tax Status", type: "select", required: true,
      helpText: "Determines withholding tax bracket under BIR",
      options: [
        { value: "single", label: "Single (S)" },
        { value: "married", label: "Married (ME)" },
        { value: "head_of_family", label: "Head of Family (HF)" },
      ],
    },
    { key: "num_dependents", label: "Number of Qualified Dependents", type: "number", placeholder: "0", helpText: "Qualified dependents for additional tax exemption" },
    { key: "sss_number", label: "SSS Number", type: "text", required: true, placeholder: "e.g., 34-1234567-8", helpText: "Social Security System — mandatory for all employees" },
    { key: "philhealth_number", label: "PhilHealth Number", type: "text", required: true, placeholder: "e.g., 12-345678901-2", helpText: "Philippine Health Insurance Corporation" },
    { key: "pagibig_number", label: "Pag-IBIG / HDMF Number", type: "text", required: true, placeholder: "e.g., 1234-5678-9012", helpText: "Home Development Mutual Fund — mandatory contribution" },
  ],
  bankFields: [
    { key: "account_holder_name", label: "Account Holder Name", type: "text", required: true, placeholder: "As per bank records" },
    { key: "account_number", label: "Bank Account Number", type: "text", required: true, placeholder: "Enter account number" },
    { key: "bank_name", label: "Bank Name", type: "text", required: true, placeholder: "e.g., BDO, BPI, Metrobank" },
    { key: "bank_branch", label: "Branch", type: "text", placeholder: "e.g., Makati, BGC" },
  ],
};

const NORWAY_CONFIG: CountryPayrollConfig = {
  payrollFields: [
    { key: "fodselsnummer", label: "Fødselsnummer (National ID)", type: "text", required: true, placeholder: "11-digit personal number" },
    {
      key: "tax_card_type", label: "Tax Card Type", type: "select", required: true,
      options: [
        { value: "main", label: "Main Employer (Hovedkort)" },
        { value: "secondary", label: "Secondary (Bikort)" },
        { value: "foreign", label: "Foreign Worker Card" },
      ],
    },
    { key: "tax_percentage", label: "Tax Deduction %", type: "number", placeholder: "From Skatteetaten" },
    {
      key: "pension_type", label: "Occupational Pension", type: "select", required: true,
      options: [
        { value: "otp", label: "OTP (Obligatory)" },
        { value: "defined_benefit", label: "Defined Benefit" },
        { value: "hybrid", label: "Hybrid Scheme" },
      ],
    },
    { key: "union_membership", label: "Union Membership", type: "text", placeholder: "If applicable" },
  ],
  bankFields: [
    { key: "account_holder_name", label: "Account Holder Name", type: "text", required: true, placeholder: "As per bank records" },
    { key: "account_number", label: "Norwegian Account Number", type: "text", required: true, placeholder: "11 digits" },
    { key: "bank_name", label: "Bank Name", type: "text", required: true, placeholder: "e.g., DNB, Nordea" },
  ],
};

const DEFAULT_CONFIG: CountryPayrollConfig = {
  payrollFields: [
    { key: "tax_id", label: "Tax ID / TIN", type: "text", required: true, placeholder: "National tax identifier" },
    {
      key: "tax_residency", label: "Tax Residency", type: "select", required: true,
      options: [
        { value: "resident", label: "Tax Resident" },
        { value: "non_resident", label: "Non-Resident" },
      ],
    },
    { key: "social_security_id", label: "Social Security / Insurance ID", type: "text", placeholder: "If applicable" },
    {
      key: "pension_scheme", label: "Pension Scheme", type: "select",
      options: [
        { value: "statutory", label: "Statutory Pension" },
        { value: "private", label: "Private Pension" },
        { value: "opted_out", label: "Opted Out" },
      ],
    },
  ],
  bankFields: [
    { key: "account_holder_name", label: "Account Holder Name", type: "text", required: true, placeholder: "As per bank records" },
    { key: "iban", label: "IBAN / Account Number", type: "text", required: true, placeholder: "Enter IBAN or account number" },
    { key: "swift_bic", label: "SWIFT / BIC Code", type: "text", required: true, placeholder: "e.g., DEUTDEFF" },
    { key: "bank_name", label: "Bank Name", type: "text", required: true, placeholder: "Enter bank name" },
    { key: "branch_name", label: "Branch", type: "text", placeholder: "Optional" },
  ],
};

function getPayrollConfig(country: string): CountryPayrollConfig {
  switch (country) {
    case "India": return INDIA_CONFIG;
    case "Philippines": return PHILIPPINES_CONFIG;
    case "Norway": return NORWAY_CONFIG;
    default: return DEFAULT_CONFIG;
  }
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
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}> = ({ label, required, helpText, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {!required && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
    {helpText && <p className="text-muted-foreground text-[11px]">{helpText}</p>}
  </div>
);

/* ── Render a single payroll field ── */
const PayrollFieldInput: React.FC<{
  field: PayrollField;
  value: string;
  onChange: (value: string) => void;
}> = ({ field, value, onChange }) => {
  if (field.type === "select" && field.options) {
    return (
      <Field label={field.label} required={field.required} helpText={field.helpText}>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {field.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  }
  return (
    <Field label={field.label} required={field.required} helpText={field.helpText}>
      <Input
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="h-10"
      />
    </Field>
  );
};

// ─── Main Component ───
interface PayrollDataCollectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: {
    id: string;
    name: string;
    country: string;
    countryFlag: string;
    role: string;
    salary: string;
    email?: string;
    employmentType?: "contractor" | "employee";
  } | null;
  onSendForm: () => void;
  onSkipToDone?: () => void;
  isResend?: boolean;
}

export const F1v5_PayrollDataCollectionDrawer: React.FC<PayrollDataCollectionDrawerProps> = ({
  open,
  onOpenChange,
  contractor,
  onSendForm,
  onSkipToDone,
  isResend = false,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countryDefaultOverrides, setCountryDefaultOverrides] = useState<Record<string, string>>({});
  const [deMinimisOverrides, setDeMinimisOverrides] = useState<Record<string, string>>({});

  const config = contractor ? getPayrollConfig(contractor.country) : DEFAULT_CONFIG;
  const countryDefaults = contractor ? PAYROLL_COUNTRY_DEFAULTS[contractor.country] : undefined;

  // Reset form when contractor changes
  useEffect(() => {
    if (!contractor) return;
    const cfg = getPayrollConfig(contractor.country);
    const defaults: Record<string, string> = {};
    [...cfg.payrollFields, ...cfg.bankFields].forEach(f => {
      if (f.type === "select" && f.options?.length) {
        defaults[f.key] = f.options[0].value;
      } else {
        defaults[f.key] = "";
      }
    });
    setFormValues(defaults);

    // Initialize country default overrides
    const pcd = PAYROLL_COUNTRY_DEFAULTS[contractor.country];
    if (pcd) {
      const otDefaults: Record<string, string> = {};
      pcd.overtimeDefaults.forEach(d => { otDefaults[d.key] = d.value; });
      (pcd.additionalDefaults || []).forEach(d => { otDefaults[d.key] = d.value; });
      setCountryDefaultOverrides(otDefaults);
      const dmDefaults: Record<string, string> = {};
      pcd.deMinimis.forEach(d => { dmDefaults[d.label] = d.amount; });
      setDeMinimisOverrides(dmDefaults);
    } else {
      setCountryDefaultOverrides({});
      setDeMinimisOverrides({});
    }
  }, [contractor?.id, contractor?.country]);

  const setValue = (key: string) => (value: string) =>
    setFormValues(prev => ({ ...prev, [key]: value }));

  const handleSendForm = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`✅ Payroll details form sent to ${contractor?.name}`, { duration: 4000 });
    setIsSubmitting(false);
    onSendForm();
    onOpenChange(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("📝 Payroll details saved as draft.", { duration: 3000 });
    setIsSaving(false);
    onOpenChange(false);
  };

  if (!contractor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[85%] sm:w-full sm:max-w-xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-border/30 shrink-0">
          <SheetDescription className="sr-only">Payroll data collection</SheetDescription>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold text-foreground leading-tight truncate">{contractor.name}</SheetTitle>
              <span className="text-base shrink-0">{contractor.countryFlag}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{contractor.role} · Payroll Data Collection</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">Pre-fill any known fields — this form will be sent to {contractor.name} to complete.</p>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {/* ── Section 1: Payroll Parameters ── */}
          <SectionCard
            title="Payroll Parameters"
          >
            {config.payrollFields.map(field => (
              <React.Fragment key={field.key}>
                <PayrollFieldInput
                  field={field}
                  value={formValues[field.key] || ""}
                  onChange={setValue(field.key)}
                />
                {/* Old Regime conditional deduction fields for India */}
                {field.key === "tax_regime" && contractor.country === "India" && (
                  <AnimatePresence>
                    {formValues.tax_regime === "old" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pl-3 border-l-2 border-primary/20 ml-1">
                          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/30">
                            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Old Regime allows deductions under Chapter VI-A. Configure the applicable deduction limits below.
                            </p>
                          </div>
                          <Field label="Section 80C Limit" helpText="Max ₹1,50,000 — PPF, ELSS, LIC, NSC, tax-saving FDs">
                            <Input
                              type="number"
                              value={formValues.section_80c || ""}
                              onChange={e => setValue("section_80c")(e.target.value)}
                              placeholder="e.g., 150000"
                              className="h-10"
                            />
                          </Field>
                          <Field label="Section 80D Limit" helpText="Max ₹25,000 (₹50,000 for senior citizens) — Health insurance premiums">
                            <Input
                              type="number"
                              value={formValues.section_80d || ""}
                              onChange={e => setValue("section_80d")(e.target.value)}
                              placeholder="e.g., 25000"
                              className="h-10"
                            />
                          </Field>
                          <Field label="HRA Exemption" helpText="House Rent Allowance — based on salary structure and rent paid">
                            <Select value={formValues.hra_exemption || ""} onValueChange={setValue("hra_exemption")}>
                              <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="applicable">Applicable</SelectItem>
                                <SelectItem value="not_applicable">Not Applicable</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Other Deductions (80G, 80E, etc.)" helpText="Total of other applicable Chapter VI-A deductions">
                            <Input
                              type="number"
                              value={formValues.other_deductions || ""}
                              onChange={e => setValue("other_deductions")(e.target.value)}
                              placeholder="e.g., 50000"
                              className="h-10"
                            />
                          </Field>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </React.Fragment>
            ))}

            {/* ── Country Payroll Defaults (inline within Payroll Parameters) ── */}
            {countryDefaults && (
              <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Country defaults for {contractor.country}</p>
                  <p className="text-[11px] text-muted-foreground">Payroll configuration defaults — adjust as negotiated</p>
                </div>

                {/* Overtime & Premium Rates */}
                {countryDefaults.overtimeDefaults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overtime & Premium Pay</p>
                    {countryDefaults.overtimeDefaults.map(d => (
                      <Field key={d.key} label={d.label} helpText={d.helpText}>
                        <Input
                          value={countryDefaultOverrides[d.key] ?? d.value}
                          onChange={e => setCountryDefaultOverrides(prev => ({ ...prev, [d.key]: e.target.value }))}
                          className="h-9"
                        />
                      </Field>
                    ))}
                  </div>
                )}

                {/* Additional Defaults (e.g., 13th month) */}
                {(countryDefaults.additionalDefaults || []).map(d => (
                  <div key={d.key} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/30">
                    <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium">{d.label}: {d.value}</p>
                      {d.helpText && <p className="text-[11px] text-muted-foreground">{d.helpText}</p>}
                    </div>
                  </div>
                ))}

                {/* De Minimis Allowances */}
                {countryDefaults.deMinimis.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">De Minimis Allowances (Tax-exempt)</p>
                    {countryDefaults.deMinimis.map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground flex-1 min-w-0">{item.label}</Label>
                        <Input
                          value={deMinimisOverrides[item.label] ?? item.amount}
                          onChange={e => setDeMinimisOverrides(prev => ({ ...prev, [item.label]: e.target.value }))}
                          className="h-9 w-28 text-right"
                        />
                        <span className="text-[10px] text-muted-foreground/60 w-14 shrink-0">{item.period}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── Section 3: Payout Destination ── */}
          <SectionCard title="Payout Destination">
            {config.bankFields.map(field => (
              <PayrollFieldInput
                key={field.key}
                field={field}
                value={formValues[field.key] || ""}
                onChange={setValue(field.key)}
              />
            ))}
          </SectionCard>


          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                toast.success("Changes saved", { description: `${contractor?.name}'s details have been saved.` });
              }}
              disabled={isSubmitting || isSaving}
            >
              Save Changes
            </Button>
            <Button
              className="flex-1 bg-gradient-primary"
              onClick={handleSendForm}
              disabled={isSubmitting || isSaving}
            >
              {isSubmitting ? (isResend ? "Resending..." : "Sending...") : (isResend ? "Resend Form" : "Send Form")}
            </Button>
          </div>
          {onSkipToDone && (
            <p className="text-center pt-2 pb-1">
              <button
                type="button"
                className="text-[11px] text-muted-foreground/70 hover:text-primary transition-colors underline decoration-dotted underline-offset-2"
                onClick={() => {
                  onSkipToDone();
                  onOpenChange(false);
                }}
              >
                I have all details — skip sending & mark as done
              </button>
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
