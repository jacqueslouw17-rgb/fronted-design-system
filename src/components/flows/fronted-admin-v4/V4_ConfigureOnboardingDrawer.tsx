/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Configure Onboarding Form Drawer
 * 
 * Matches Flow 3 Candidate Onboarding v2 structure:
 * - Section 1: Personal Information (Step 2)
 * - Section 2: Compliance Requirements (Step 3) - country-specific
 * - Section 3: Payroll Details (Step 4)
 */

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, CreditCard, Upload, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface V4_Candidate {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  email?: string;
  employmentType?: "contractor" | "employee";
}

export type FilledBySource = "candidate" | "prefilled";

export interface OnboardingFieldConfig {
  id: string;
  label: string;
  section: "personal" | "compliance" | "payroll";
  type: "text" | "select" | "upload" | "checkbox";
  required: boolean;
  enabled: boolean;
  locked?: boolean; // Read-only field linked to contract
  helperText?: string;
  filledBy: FilledBySource;
  adminValue?: string;
  options?: string[];
}

export interface OnboardingFormConfig {
  baseFields: OnboardingFieldConfig[];
  country: string;
  employmentType: "contractor" | "employee";
}

interface V4_ConfigureOnboardingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  onSave: (candidateId: string, config: OnboardingFormConfig) => void;
  initialConfig?: OnboardingFormConfig;
}

// Personal Information fields - from WorkerStep2Personal_v2
const getPersonalFields = (): OnboardingFieldConfig[] => [
  { id: "fullName", label: "Full Name", section: "personal", type: "text", required: true, enabled: true, locked: true, helperText: "Linked to contract", filledBy: "prefilled" },
  { id: "email", label: "Email Address", section: "personal", type: "text", required: true, enabled: true, filledBy: "candidate" },
  { id: "phone", label: "Phone Number", section: "personal", type: "text", required: true, enabled: true, filledBy: "candidate" },
  { id: "dateOfBirth", label: "Date of Birth", section: "personal", type: "text", required: true, enabled: true, locked: true, helperText: "Linked to contract", filledBy: "prefilled" },
  { id: "nationality", label: "Nationality", section: "personal", type: "text", required: true, enabled: true, locked: true, helperText: "Linked to contract", filledBy: "prefilled" },
  { id: "address", label: "Residential Address", section: "personal", type: "text", required: true, enabled: true, locked: true, helperText: "Linked to contract", filledBy: "prefilled" },
];

// Country-specific Compliance fields - from WorkerStep3Compliance_v2
const getComplianceFields = (country: string, employmentType: "contractor" | "employee"): OnboardingFieldConfig[] => {
  switch (country) {
    case "Sweden":
      return [
        { id: "personalIdNumber", label: "Personal identity number (Personnummer / samordningsnummer)", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxResidency", label: "Tax residency", section: "compliance", type: "select", required: true, enabled: true, options: ["Resident in Sweden", "Non-resident (SINK)"], filledBy: "candidate" },
        { id: "municipality", label: "Municipality of taxation", section: "compliance", type: "text", required: false, enabled: true, helperText: "If not already clear from address", filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
        { id: "workPermitUpload", label: "Residence / work permit upload", section: "compliance", type: "upload", required: false, enabled: true, helperText: "Only if non-EU/EEA", filledBy: "candidate" },
      ];

    case "Norway":
      return [
        { id: "norwegianId", label: "Norwegian ID (Fødselsnummer or D-number)", section: "compliance", type: "text", required: true, enabled: true, helperText: "National identity number for foreign workers", filledBy: "candidate" },
        { id: "taxResidency", label: "Tax residency", section: "compliance", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident (PAYE scheme)"], filledBy: "candidate" },
        { id: "taxCardStatus", label: "Tax card status", section: "compliance", type: "select", required: true, enabled: true, options: ["I have ordered my tax card", "I have not ordered my tax card"], helperText: "Actual tax card is pulled by payroll, not uploaded", filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
        { id: "workPermitUpload", label: "Residence / work permit upload", section: "compliance", type: "upload", required: false, enabled: true, helperText: "If required", filledBy: "candidate" },
      ];

    case "Denmark":
      return [
        { id: "cprNumber", label: "CPR number (Civil registration number)", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxResidency", label: "Tax residency", section: "compliance", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident"], filledBy: "candidate" },
        { id: "taxCardStatus", label: "Tax card status", section: "compliance", type: "select", required: true, enabled: true, options: ["Main tax card is registered with Danish Tax Agency", "Tax card not yet registered"], filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
        { id: "workPermitUpload", label: "Residence / work permit upload", section: "compliance", type: "upload", required: false, enabled: true, helperText: "If required", filledBy: "candidate" },
      ];

    case "India":
      return [
        { id: "nameAsPerPan", label: "Name as per PAN", section: "compliance", type: "text", required: true, enabled: true, helperText: "Exactly as shown on PAN card", filledBy: "candidate" },
        { id: "panNumber", label: "PAN (Permanent Account Number)", section: "compliance", type: "text", required: true, enabled: true, helperText: "Required for tax reporting", filledBy: "candidate" },
        { id: "gstRegistered", label: "Are you registered for GST?", section: "compliance", type: "select", required: true, enabled: true, options: ["Yes", "No"], filledBy: "candidate" },
        { id: "gstin", label: "GSTIN", section: "compliance", type: "text", required: false, enabled: true, helperText: "Required if GST registered", filledBy: "candidate" },
        { id: "invoicingAs", label: "Invoicing as", section: "compliance", type: "select", required: true, enabled: true, options: ["Individual", "Proprietorship", "Company"], filledBy: "candidate" },
        { id: "legalEntityName", label: "Legal entity name", section: "compliance", type: "text", required: false, enabled: true, helperText: "If invoicing as company", filledBy: "candidate" },
        { id: "cin", label: "Corporate Identification Number (CIN)", section: "compliance", type: "text", required: false, enabled: true, helperText: "Optional for companies", filledBy: "candidate" },
        { id: "panCardUpload", label: "PAN card upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Required", filledBy: "candidate" },
        { id: "gstCertificateUpload", label: "GST registration certificate", section: "compliance", type: "upload", required: false, enabled: true, helperText: "If GST registered", filledBy: "candidate" },
      ];

    case "Philippines":
      return [
        { id: "tinNumber", label: "TIN (Tax Identification Number)", section: "compliance", type: "text", required: true, enabled: true, helperText: "Required for tax reporting", filledBy: "candidate" },
        { id: "invoicingAs", label: "Invoicing as", section: "compliance", type: "select", required: true, enabled: true, options: ["Individual", "Sole proprietor", "Company"], filledBy: "candidate" },
        { id: "businessName", label: "Registered business name", section: "compliance", type: "text", required: false, enabled: true, helperText: "If company or sole proprietor", filledBy: "candidate" },
        { id: "birNumber", label: "BIR registration number", section: "compliance", type: "text", required: false, enabled: true, helperText: "If available", filledBy: "candidate" },
        { id: "nationalId", label: "National ID / Government ID number", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "governmentIdUpload", label: "Government ID upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Philippine ID, passport, driver's license, etc.", filledBy: "candidate" },
        { id: "birRegistrationUpload", label: "BIR registration document", section: "compliance", type: "upload", required: false, enabled: true, helperText: "Optional: If invoicing as a business", filledBy: "candidate" },
      ];

    case "Kosovo":
      return [
        { id: "invoicingAs", label: "Invoicing as", section: "compliance", type: "select", required: true, enabled: true, options: ["Individual", "Company"], filledBy: "candidate" },
        { id: "personalNumber", label: "Personal number (10-digit ID)", section: "compliance", type: "text", required: false, enabled: true, helperText: "For individual contractors", filledBy: "candidate" },
        { id: "localTaxNumber", label: "Local tax number", section: "compliance", type: "text", required: false, enabled: true, helperText: "If different from personal number", filledBy: "candidate" },
        { id: "legalEntityName", label: "Legal entity name", section: "compliance", type: "text", required: false, enabled: true, helperText: "For company contractors", filledBy: "candidate" },
        { id: "fiscalNumber", label: "Tax / Fiscal number", section: "compliance", type: "text", required: false, enabled: true, helperText: "If available", filledBy: "candidate" },
        { id: "vatNumber", label: "VAT number", section: "compliance", type: "text", required: false, enabled: true, helperText: "If VAT registered", filledBy: "candidate" },
        { id: "idUpload", label: "ID upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
        { id: "companyRegistrationUpload", label: "Company registration certificate", section: "compliance", type: "upload", required: false, enabled: true, helperText: "For companies", filledBy: "candidate" },
      ];

    default:
      return [
        { id: "nationalId", label: "National ID / Passport number", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxId", label: "Tax ID / Registration number", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, filledBy: "candidate" },
      ];
  }
};

// Payroll Details fields - from WorkerStep4Payroll_v2
const getPayrollFields = (employmentType: "contractor" | "employee"): OnboardingFieldConfig[] => {
  if (employmentType === "contractor") {
    return [
      { id: "invoiceRuleConfirmed", label: "Invoice Rules Acknowledgment", section: "payroll", type: "checkbox", required: true, enabled: true, helperText: "Worker confirms understanding of invoice submission rules", filledBy: "candidate" },
    ];
  }
  return [
    { id: "bankName", label: "Bank Name", section: "payroll", type: "text", required: true, enabled: true, helperText: "e.g., BDO, BPI, Wells Fargo", filledBy: "candidate" },
    { id: "accountNumber", label: "Account Number / IBAN", section: "payroll", type: "text", required: true, enabled: true, filledBy: "candidate" },
    { id: "swiftBic", label: "SWIFT / BIC Code", section: "payroll", type: "text", required: false, enabled: true, helperText: "For international payments", filledBy: "candidate" },
  ];
};

export const V4_ConfigureOnboardingDrawer: React.FC<V4_ConfigureOnboardingDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onSave,
  initialConfig,
}) => {
  const [fieldConfig, setFieldConfig] = useState<OnboardingFieldConfig[]>([]);

  useEffect(() => {
    if (candidate) {
      const country = candidate.country || "Philippines";
      const employmentType = candidate.employmentType || "contractor";
      
      const personalFields = getPersonalFields();
      const complianceFields = getComplianceFields(country, employmentType);
      const payrollFields = getPayrollFields(employmentType);
      
      const allFields = [...personalFields, ...complianceFields, ...payrollFields];
      setFieldConfig(initialConfig?.baseFields || allFields);
    }
  }, [candidate?.id, candidate?.country, candidate?.employmentType, initialConfig]);

  const handleToggleEnabled = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId && !field.locked ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleToggleRequired = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId && !field.locked ? { ...field, required: !field.required } : field
      )
    );
  };

  const handleFilledByChange = (fieldId: string, filledBy: FilledBySource) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId && !field.locked ? { ...field, filledBy } : field
      )
    );
  };

  const handleAdminValueChange = (fieldId: string, value: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, adminValue: value } : field
      )
    );
  };

  const handleSave = () => {
    if (!candidate) return;
    onSave(candidate.id, { 
      baseFields: fieldConfig,
      country: candidate.country,
      employmentType: candidate.employmentType || "contractor"
    });
    toast.success("Onboarding form configuration saved");
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (candidate) {
      const country = candidate.country || "Philippines";
      const employmentType = candidate.employmentType || "contractor";
      const personalFields = getPersonalFields();
      const complianceFields = getComplianceFields(country, employmentType);
      const payrollFields = getPayrollFields(employmentType);
      setFieldConfig(initialConfig?.baseFields || [...personalFields, ...complianceFields, ...payrollFields]);
    }
    onOpenChange(false);
  };

  if (!candidate) return null;

  // Group fields by section
  const personalFields = fieldConfig.filter(f => f.section === "personal");
  const complianceFields = fieldConfig.filter(f => f.section === "compliance");
  const payrollFields = fieldConfig.filter(f => f.section === "payroll");

  const getHelperText = (field: OnboardingFieldConfig) => {
    if (field.locked) {
      return "Read-only. Linked to contract details.";
    }
    if (field.filledBy === "candidate") {
      return "Shown as an empty field on the worker form.";
    }
    if (!field.enabled) {
      return "Pre-filled by admin. Hidden from worker, used only for contracts / payroll.";
    }
    return "Pre-filled before sending. Worker can see this value.";
  };

  const renderFieldRow = (field: OnboardingFieldConfig) => {
    const isPrefilled = field.filledBy === "prefilled";
    const isHidden = !field.enabled;
    const isLocked = field.locked;
    const currentValue = field.adminValue || "";
    
    return (
      <div key={field.id} className={cn(
        "flex items-start justify-between p-3 rounded-lg border border-border/40 bg-card/50",
        isHidden && "opacity-60",
        isLocked && "bg-muted/30"
      )}>
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{field.label}</span>
            {field.required && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-xs">Locked</Badge>
            )}
          </div>
          
          {field.helperText && (
            <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
          )}
          
          <div className={cn(isHidden && "opacity-50")}>
            {/* Filled by selector - not for uploads or locked fields */}
            {field.type !== "upload" && field.type !== "checkbox" && !isLocked && (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Filled by</span>
                </div>
                <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleFilledByChange(field.id, "candidate")}
                    className={cn(
                      "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                      field.filledBy === "candidate" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilledByChange(field.id, "prefilled")}
                    className={cn(
                      "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                      field.filledBy === "prefilled" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Pre-fill
                  </button>
                </div>

                {/* Pre-filled value input */}
                {isPrefilled && (
                  <div className="mt-2 space-y-1.5">
                    {field.type === "select" && field.options ? (
                      <Select value={currentValue} onValueChange={(v) => handleAdminValueChange(field.id, v)}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Select value..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {field.options.map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-xs">
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleAdminValueChange(field.id, e.target.value)}
                        className="h-8 text-xs bg-background"
                        placeholder="Enter value..."
                      />
                    )}
                  </div>
                )}

                {/* Dynamic helper text */}
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {getHelperText(field)}
                </p>
              </div>
            )}

            {/* Upload field indicator */}
            {field.type === "upload" && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Upload className="h-3 w-3" />
                <span>Worker will upload this document</span>
              </div>
            )}

            {/* Checkbox field indicator */}
            {field.type === "checkbox" && (
              <div className="mt-2 text-[10px] text-muted-foreground">
                Worker must check this to proceed
              </div>
            )}

            {/* Hidden on form indicator */}
            {isHidden && !isLocked && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                <span>Hidden on worker form. Value is used only in internal workflows / contracts.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls - disabled for locked fields */}
        {!isLocked && (
          <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Required</span>
              <Switch 
                checked={field.required} 
                onCheckedChange={() => handleToggleRequired(field.id)}
                className="scale-75"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Show</span>
              <Switch 
                checked={field.enabled} 
                onCheckedChange={() => handleToggleEnabled(field.id)}
                className="scale-75"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Configure Onboarding Form</SheetTitle>
        </SheetHeader>

        {/* Candidate Info Card */}
        <Card className="mt-6 border-border/40 bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{candidate.countryFlag}</span>
              <div>
                <p className="font-semibold text-foreground">{candidate.name}</p>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{candidate.country}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Salary</p>
                <p className="font-medium">{candidate.salary}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employment Type</p>
                <Badge variant="outline" className="capitalize mt-0.5">
                  {candidate.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-sm truncate">{candidate.email || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Configuration - 3 Sections matching Flow 3 */}
        <div className="mt-6 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Confirm Personal Information</Label>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              These details are pre-filled from the contract. Some fields are locked.
            </p>
            <div className="space-y-3">
              {personalFields.map(renderFieldRow)}
            </div>
          </div>

          <Separator />

          {/* Section 2: Compliance Requirements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Compliance Requirements</Label>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Country-specific documents required for {candidate.country}.
              {candidate.employmentType === "contractor" && " Contractor-specific fields."}
            </p>
            <div className="space-y-3">
              {complianceFields.map(renderFieldRow)}
            </div>
          </div>

          <Separator />

          {/* Section 3: Payroll Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">
                {candidate.employmentType === "contractor" ? "Invoice Rules" : "Payroll Details"}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              {candidate.employmentType === "contractor" 
                ? "Contractor will confirm understanding of invoice submission rules."
                : "Bank details to receive salary payments."
              }
            </p>
            <div className="space-y-3">
              {payrollFields.map(renderFieldRow)}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save & Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default V4_ConfigureOnboardingDrawer;
