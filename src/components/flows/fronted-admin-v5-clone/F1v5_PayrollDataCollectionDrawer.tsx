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

interface CountryPayrollConfig {
  payrollFields: PayrollField[];
  bankFields: PayrollField[];
}

const INDIA_CONFIG: CountryPayrollConfig = {
  payrollFields: [
    {
      key: "pay_frequency", label: "Pay Frequency", type: "select", required: true,
      options: [{ value: "monthly", label: "Monthly" }],
    },
    { key: "payment_schedule", label: "Payment Schedule", type: "text", placeholder: "e.g., Last business day of month" },
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
    {
      key: "pay_frequency", label: "Pay Frequency", type: "select", required: true,
      options: [{ value: "fortnightly", label: "Fortnightly" }],
    },
    { key: "payment_schedule", label: "Payment Schedule", type: "text", placeholder: "e.g., 15th and 30th of each month" },
    { key: "tin", label: "TIN (Tax ID)", type: "text", required: true, placeholder: "e.g., 123-456-789-000" },
    {
      key: "tax_status", label: "Tax Status", type: "select", required: true,
      options: [
        { value: "single", label: "Single (S)" },
        { value: "married", label: "Married (ME)" },
        { value: "head_of_family", label: "Head of Family (HF)" },
      ],
    },
    { key: "sss_number", label: "SSS Number", type: "text", required: true, placeholder: "Social Security System" },
    { key: "philhealth_number", label: "PhilHealth Number", type: "text", required: true, placeholder: "Health insurance ID" },
    { key: "pagibig_number", label: "Pag-IBIG / HDMF Number", type: "text", required: true, placeholder: "Home Development Fund" },
  ],
  bankFields: [
    { key: "account_holder_name", label: "Account Holder Name", type: "text", required: true, placeholder: "As per bank records" },
    { key: "account_number", label: "Bank Account Number", type: "text", required: true, placeholder: "Enter account number" },
    { key: "bank_name", label: "Bank Name", type: "text", required: true, placeholder: "e.g., BDO, BPI" },
    { key: "branch_name", label: "Branch", type: "text", placeholder: "e.g., Makati, BGC" },
  ],
};

const NORWAY_CONFIG: CountryPayrollConfig = {
  payrollFields: [
    {
      key: "pay_frequency", label: "Pay Frequency", type: "select", required: true,
      options: [{ value: "monthly", label: "Monthly" }],
    },
    { key: "payment_schedule", label: "Payment Schedule", type: "text", placeholder: "e.g., Last business day of month" },
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
    {
      key: "pay_frequency", label: "Pay Frequency", type: "select", required: true,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "fortnightly", label: "Fortnightly" },
      ],
    },
    { key: "payment_schedule", label: "Payment Schedule", type: "text", placeholder: "e.g., Last business day of month" },
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
  isResend?: boolean;
}

export const F1v5_PayrollDataCollectionDrawer: React.FC<PayrollDataCollectionDrawerProps> = ({
  open,
  onOpenChange,
  contractor,
  onSendForm,
  isResend = false,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const config = contractor ? getPayrollConfig(contractor.country) : DEFAULT_CONFIG;

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
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Payroll Data Collection</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="text-lg">{contractor.countryFlag}</span>
            <span>{contractor.name} • {contractor.role}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3 space-y-3">
          {/* ── Section 1: Payroll Parameters ── */}
          <SectionCard
            title="Payroll Parameters"
            badge={
              <Badge variant="outline" className="text-xs font-medium gap-1">
                {contractor.countryFlag} {contractor.country}
              </Badge>
            }
          >
            {config.payrollFields.map(field => (
              <PayrollFieldInput
                key={field.key}
                field={field}
                value={formValues[field.key] || ""}
                onChange={setValue(field.key)}
              />
            ))}
          </SectionCard>

          {/* ── Section 2: Payout Destination ── */}
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

          {/* Preview message */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {isResend ? "This form was sent to:" : "This form will be sent to:"}
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{contractor.name}</p>
                <p className="text-xs text-muted-foreground">{contractor.email || contractor.role}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSave}
              disabled={isSubmitting || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSendForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (isResend ? "Resending..." : "Sending...") : (isResend ? "Resend Form" : "Send Form")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
