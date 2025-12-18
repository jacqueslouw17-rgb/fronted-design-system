/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Configure Onboarding Form Drawer
 * 
 * Opens from "Onboard Candidate" column cards via "Configure" button
 * Shows country-specific compliance fields based on the candidate's country
 * SAME EXACT STYLE as V4_ConfigureCandidateDetailsDrawer
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
import { User, Globe, Receipt, Briefcase, Upload, MapPin, EyeOff } from "lucide-react";
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
  section: "identity" | "tax" | "invoicing" | "uploads";
  type: "text" | "select" | "upload";
  required: boolean;
  enabled: boolean;
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

// Country-specific field configurations
const getFieldsForCountry = (country: string, employmentType: "contractor" | "employee"): OnboardingFieldConfig[] => {
  switch (country) {
    case "Sweden":
      return [
        { id: "personal_id_number", label: "Personal identity number (Personnummer / samordningsnummer)", section: "identity", type: "text", required: true, enabled: true, helperText: "Swedish personal ID number", filledBy: "candidate" },
        { id: "tax_residency", label: "Tax residency", section: "tax", type: "select", required: true, enabled: true, options: ["Resident in Sweden", "Non-resident (SINK)"], filledBy: "candidate" },
        { id: "municipality", label: "Municipality of taxation", section: "tax", type: "text", required: false, enabled: true, helperText: "If not clear from address", filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "work_permit", label: "Residence / work permit upload", section: "uploads", type: "upload", required: false, enabled: true, helperText: "Only if non-EU/EEA", filledBy: "candidate" },
      ];

    case "Norway":
      return [
        { id: "norwegian_id", label: "Norwegian ID (Fødselsnummer or D-number)", section: "identity", type: "text", required: true, enabled: true, helperText: "National identity number for foreign workers", filledBy: "candidate" },
        { id: "tax_residency", label: "Tax residency", section: "tax", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident (PAYE scheme)"], filledBy: "candidate" },
        { id: "tax_card_status", label: "Tax card status", section: "tax", type: "select", required: true, enabled: true, options: ["I have ordered my tax card", "I have not ordered my tax card"], helperText: "Actual tax card is pulled by payroll", filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "work_permit", label: "Residence / work permit upload", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If required", filledBy: "candidate" },
      ];

    case "Denmark":
      return [
        { id: "cpr_number", label: "CPR number (Civil registration number)", section: "identity", type: "text", required: true, enabled: true, helperText: "Danish civil registration number", filledBy: "candidate" },
        { id: "tax_residency", label: "Tax residency", section: "tax", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident"], filledBy: "candidate" },
        { id: "tax_card_status", label: "Tax card status", section: "tax", type: "select", required: true, enabled: true, options: ["Main tax card is registered with Danish Tax Agency", "Tax card not yet registered"], filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "work_permit", label: "Residence / work permit upload", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If required", filledBy: "candidate" },
      ];

    case "India":
      return [
        { id: "name_per_pan", label: "Name as per PAN", section: "identity", type: "text", required: true, enabled: true, helperText: "Exactly as shown on PAN card", filledBy: "candidate" },
        { id: "pan_number", label: "PAN (Permanent Account Number)", section: "tax", type: "text", required: true, enabled: true, helperText: "Required for tax reporting", filledBy: "candidate" },
        { id: "gst_registered", label: "Are you registered for GST?", section: "tax", type: "select", required: true, enabled: true, options: ["Yes", "No"], filledBy: "candidate" },
        { id: "gstin", label: "GSTIN", section: "tax", type: "text", required: false, enabled: true, helperText: "Required if GST registered", filledBy: "candidate" },
        { id: "invoicing_as", label: "Invoicing as", section: "invoicing", type: "select", required: true, enabled: true, options: ["Individual", "Proprietorship", "Company"], filledBy: "candidate" },
        { id: "legal_entity_name", label: "Legal entity name", section: "invoicing", type: "text", required: false, enabled: true, helperText: "If invoicing as company", filledBy: "candidate" },
        { id: "cin", label: "Corporate Identification Number (CIN)", section: "invoicing", type: "text", required: false, enabled: true, helperText: "Optional for companies", filledBy: "candidate" },
        { id: "pan_card_upload", label: "PAN card upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Required", filledBy: "candidate" },
        { id: "gst_certificate", label: "GST registration certificate", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If GST registered", filledBy: "candidate" },
      ];

    case "Philippines":
      return [
        { id: "tin_number", label: "TIN (Tax Identification Number)", section: "tax", type: "text", required: true, enabled: true, helperText: "Required for tax reporting", filledBy: "candidate" },
        { id: "invoicing_as", label: "Invoicing as", section: "invoicing", type: "select", required: true, enabled: true, options: ["Individual", "Sole proprietor", "Company"], filledBy: "candidate" },
        { id: "business_name", label: "Registered business name", section: "invoicing", type: "text", required: false, enabled: true, helperText: "If company or sole proprietor", filledBy: "candidate" },
        { id: "bir_number", label: "BIR registration number", section: "invoicing", type: "text", required: false, enabled: true, helperText: "If available", filledBy: "candidate" },
        { id: "national_id", label: "National ID / Government ID number", section: "identity", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "government_id_upload", label: "Government ID upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Philippine ID, passport, driver's license, etc.", filledBy: "candidate" },
        { id: "bir_registration_doc", label: "BIR registration document", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If invoicing as a business", filledBy: "candidate" },
      ];

    case "Kosovo":
      return [
        { id: "invoicing_as", label: "Invoicing as", section: "invoicing", type: "select", required: true, enabled: true, options: ["Individual", "Company"], filledBy: "candidate" },
        { id: "personal_number", label: "Personal number (10-digit ID)", section: "identity", type: "text", required: false, enabled: true, helperText: "For individual contractors", filledBy: "candidate" },
        { id: "local_tax_number", label: "Local tax number", section: "tax", type: "text", required: false, enabled: true, helperText: "If different from personal number", filledBy: "candidate" },
        { id: "legal_entity_name", label: "Legal entity name", section: "invoicing", type: "text", required: false, enabled: true, helperText: "For company contractors", filledBy: "candidate" },
        { id: "fiscal_number", label: "Tax / Fiscal number", section: "tax", type: "text", required: false, enabled: true, helperText: "If available", filledBy: "candidate" },
        { id: "vat_number", label: "VAT number", section: "tax", type: "text", required: false, enabled: true, helperText: "If VAT registered", filledBy: "candidate" },
        { id: "id_upload", label: "ID upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "company_registration", label: "Company registration certificate", section: "uploads", type: "upload", required: false, enabled: true, helperText: "For companies", filledBy: "candidate" },
      ];

    default:
      return [
        { id: "national_id", label: "National ID / Passport number", section: "identity", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "tax_id", label: "Tax ID / Registration number", section: "tax", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, filledBy: "candidate" },
      ];
  }
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
      const defaultFields = getFieldsForCountry(country, employmentType);
      setFieldConfig(initialConfig?.baseFields || defaultFields);
    }
  }, [candidate?.id, candidate?.country, candidate?.employmentType, initialConfig]);

  const handleToggleEnabled = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleToggleRequired = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, required: !field.required } : field
      )
    );
  };

  const handleFilledByChange = (fieldId: string, filledBy: FilledBySource) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, filledBy } : field
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
      setFieldConfig(initialConfig?.baseFields || getFieldsForCountry(country, employmentType));
    }
    onOpenChange(false);
  };

  if (!candidate) return null;

  // Group fields by section
  const identityFields = fieldConfig.filter(f => f.section === "identity");
  const taxFields = fieldConfig.filter(f => f.section === "tax");
  const invoicingFields = fieldConfig.filter(f => f.section === "invoicing");
  const uploadFields = fieldConfig.filter(f => f.section === "uploads");

  // Dynamic helper text based on state
  const getHelperText = (field: OnboardingFieldConfig) => {
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
    const currentValue = field.adminValue || "";
    
    return (
      <div key={field.id} className={cn(
        "flex items-start justify-between p-3 rounded-lg border border-border/40 bg-card/50",
        isHidden && "opacity-60"
      )}>
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{field.label}</span>
            {field.required && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
            )}
          </div>
          
          {field.helperText && (
            <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
          )}
          
          <div className={cn(isHidden && "opacity-50")}>
            {/* Filled by selector */}
            {field.type !== "upload" && (
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

            {/* Hidden on form indicator */}
            {isHidden && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                <span>Hidden on worker form. Value is used only in internal workflows / contracts.</span>
              </div>
            )}
          </div>
        </div>
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
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Configure Onboarding Form</SheetTitle>
        </SheetHeader>

        {/* Candidate Info Card - Same as Offer Accepted */}
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

        {/* Field Configuration */}
        <div className="mt-6 space-y-6">
          {/* Section 1: Identity & Documents */}
          {identityFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Identity & Documents</Label>
              </div>
              <div className="space-y-3">
                {identityFields.map(renderFieldRow)}
              </div>
            </div>
          )}

          {identityFields.length > 0 && (taxFields.length > 0 || invoicingFields.length > 0) && <Separator />}

          {/* Section 2: Tax & Compliance */}
          {taxFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Tax & Compliance</Label>
              </div>
              <div className="space-y-3">
                {taxFields.map(renderFieldRow)}
              </div>
            </div>
          )}

          {taxFields.length > 0 && invoicingFields.length > 0 && <Separator />}

          {/* Section 3: Invoicing Details */}
          {invoicingFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Invoicing Details</Label>
              </div>
              <div className="space-y-3">
                {invoicingFields.map(renderFieldRow)}
              </div>
            </div>
          )}

          {(taxFields.length > 0 || invoicingFields.length > 0 || identityFields.length > 0) && uploadFields.length > 0 && <Separator />}

          {/* Section 4: Document Uploads */}
          {uploadFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Document Uploads</Label>
              </div>
              <div className="space-y-3">
                {uploadFields.map(renderFieldRow)}
              </div>
            </div>
          )}
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
