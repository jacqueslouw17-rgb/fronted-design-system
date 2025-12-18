/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Configure Onboarding Form Drawer
 * 
 * Opens from "Onboard Candidate" column cards via "Configure" button
 * Shows country-specific compliance fields based on the candidate's country
 * Fields are based on Flow 3 Candidate Onboarding v2 requirements
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, FileText, Globe, User, Building2, Receipt, Upload, Info, CreditCard, Briefcase } from "lucide-react";
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
  type: "text" | "select" | "radio" | "upload";
  required: boolean;
  enabled: boolean;
  helperText?: string;
  filledBy: FilledBySource;
  adminValue?: string;
  options?: string[];
  conditionalOn?: { field: string; value: string };
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
  const isContractor = employmentType === "contractor";

  switch (country) {
    case "Sweden":
      return [
        // Identity & Documents
        { id: "personal_id_number", label: "Personal identity number (Personnummer / samordningsnummer)", section: "identity", type: "text", required: true, enabled: true, helperText: "Swedish personal ID number", filledBy: "candidate" },
        { id: "tax_residency", label: "Tax residency", section: "tax", type: "select", required: true, enabled: true, options: ["Resident in Sweden", "Non-resident (SINK)"], filledBy: "candidate" },
        { id: "municipality", label: "Municipality of taxation", section: "tax", type: "text", required: false, enabled: true, helperText: "If not clear from address", filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "work_permit", label: "Residence / work permit upload", section: "uploads", type: "upload", required: false, enabled: true, helperText: "Only if non-EU/EEA", filledBy: "candidate" },
      ];

    case "Norway":
      return [
        // Identity & Documents
        { id: "norwegian_id", label: "Norwegian ID (Fødselsnummer or D-number)", section: "identity", type: "text", required: true, enabled: true, helperText: "National identity number for foreign workers", filledBy: "candidate" },
        { id: "tax_residency", label: "Tax residency", section: "tax", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident (PAYE scheme)"], filledBy: "candidate" },
        { id: "tax_card_status", label: "Tax card status", section: "tax", type: "select", required: true, enabled: true, options: ["I have ordered my tax card", "I have not ordered my tax card"], helperText: "Actual tax card is pulled by payroll", filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "work_permit", label: "Residence / work permit upload", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If required", filledBy: "candidate" },
      ];

    case "Denmark":
      return [
        // Identity & Documents
        { id: "cpr_number", label: "CPR number (Civil registration number)", section: "identity", type: "text", required: true, enabled: true, helperText: "Danish civil registration number", filledBy: "candidate" },
        { id: "tax_residency", label: "Tax residency", section: "tax", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident"], filledBy: "candidate" },
        { id: "tax_card_status", label: "Tax card status", section: "tax", type: "select", required: true, enabled: true, options: ["Main tax card is registered with Danish Tax Agency", "Tax card not yet registered"], filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "work_permit", label: "Residence / work permit upload", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If required", filledBy: "candidate" },
      ];

    case "India":
      // India is contractors only
      return [
        { id: "name_per_pan", label: "Name as per PAN", section: "identity", type: "text", required: true, enabled: true, helperText: "Exactly as shown on PAN card", filledBy: "candidate" },
        { id: "pan_number", label: "PAN (Permanent Account Number)", section: "tax", type: "text", required: true, enabled: true, helperText: "Required for tax reporting", filledBy: "candidate" },
        { id: "gst_registered", label: "Are you registered for GST?", section: "tax", type: "select", required: true, enabled: true, options: ["Yes", "No"], filledBy: "candidate" },
        { id: "gstin", label: "GSTIN", section: "tax", type: "text", required: false, enabled: true, helperText: "Required if GST registered", filledBy: "candidate", conditionalOn: { field: "gst_registered", value: "Yes" } },
        { id: "invoicing_as", label: "Invoicing as", section: "invoicing", type: "select", required: true, enabled: true, options: ["Individual", "Proprietorship", "Company"], filledBy: "candidate" },
        { id: "legal_entity_name", label: "Legal entity name", section: "invoicing", type: "text", required: false, enabled: true, helperText: "If invoicing as company", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
        { id: "cin", label: "Corporate Identification Number (CIN)", section: "invoicing", type: "text", required: false, enabled: true, helperText: "Optional for companies", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
        { id: "pan_card_upload", label: "PAN card upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Required", filledBy: "candidate" },
        { id: "gst_certificate", label: "GST registration certificate", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If GST registered", filledBy: "candidate", conditionalOn: { field: "gst_registered", value: "Yes" } },
      ];

    case "Philippines":
      // Philippines is contractors only in this setup
      return [
        { id: "tin_number", label: "TIN (Tax Identification Number)", section: "tax", type: "text", required: true, enabled: true, helperText: "Required for tax reporting", filledBy: "candidate" },
        { id: "invoicing_as", label: "Invoicing as", section: "invoicing", type: "select", required: true, enabled: true, options: ["Individual", "Sole proprietor", "Company"], filledBy: "candidate" },
        { id: "business_name", label: "Registered business name", section: "invoicing", type: "text", required: false, enabled: true, helperText: "If company or sole proprietor", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
        { id: "bir_number", label: "BIR registration number", section: "invoicing", type: "text", required: false, enabled: true, helperText: "If available", filledBy: "candidate" },
        { id: "national_id", label: "National ID / Government ID number", section: "identity", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "government_id_upload", label: "Government ID upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Philippine ID, passport, driver's license, etc.", filledBy: "candidate" },
        { id: "bir_registration_doc", label: "BIR registration document", section: "uploads", type: "upload", required: false, enabled: true, helperText: "If invoicing as a business", filledBy: "candidate" },
      ];

    case "Kosovo":
      // Kosovo is contractors only
      return [
        { id: "invoicing_as", label: "Invoicing as", section: "invoicing", type: "select", required: true, enabled: true, options: ["Individual", "Company"], filledBy: "candidate" },
        { id: "personal_number", label: "Personal number (10-digit ID)", section: "identity", type: "text", required: false, enabled: true, helperText: "For individual contractors", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Individual" } },
        { id: "local_tax_number", label: "Local tax number", section: "tax", type: "text", required: false, enabled: true, helperText: "If different from personal number", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Individual" } },
        { id: "legal_entity_name", label: "Legal entity name", section: "invoicing", type: "text", required: false, enabled: true, helperText: "For company contractors", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
        { id: "fiscal_number", label: "Tax / Fiscal number", section: "tax", type: "text", required: false, enabled: true, helperText: "If available", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
        { id: "vat_number", label: "VAT number", section: "tax", type: "text", required: false, enabled: true, helperText: "If VAT registered", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
        { id: "id_upload", label: "ID upload", section: "uploads", type: "upload", required: true, enabled: true, helperText: "Passport or National ID", filledBy: "candidate" },
        { id: "company_registration", label: "Company registration certificate", section: "uploads", type: "upload", required: false, enabled: true, helperText: "For companies", filledBy: "candidate", conditionalOn: { field: "invoicing_as", value: "Company" } },
      ];

    default:
      // Default generic fields
      return [
        { id: "national_id", label: "National ID / Passport number", section: "identity", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "tax_id", label: "Tax ID / Registration number", section: "tax", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "id_document", label: "ID document upload", section: "uploads", type: "upload", required: true, enabled: true, filledBy: "candidate" },
      ];
  }
};

const getSectionIcon = (section: string) => {
  switch (section) {
    case "identity": return User;
    case "tax": return Receipt;
    case "invoicing": return Briefcase;
    case "uploads": return Upload;
    default: return FileText;
  }
};

const getSectionLabel = (section: string) => {
  switch (section) {
    case "identity": return "Identity & Documents";
    case "tax": return "Tax & Compliance";
    case "invoicing": return "Invoicing Details";
    case "uploads": return "Document Uploads";
    default: return section;
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

  // Reset fields when candidate changes
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
  const sections = ["identity", "tax", "invoicing", "uploads"];
  const fieldsBySection = sections.reduce((acc, section) => {
    acc[section] = fieldConfig.filter(f => f.section === section);
    return acc;
  }, {} as Record<string, OnboardingFieldConfig[]>);

  const enabledFieldCount = fieldConfig.filter(f => f.enabled).length;
  const countryLabel = candidate.country || "Unknown Country";
  const employmentLabel = candidate.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Configure Onboarding Form
          </SheetTitle>
        </SheetHeader>

        {/* Candidate Info Card */}
        <Card className="mt-6 border-border/40 bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {candidate.countryFlag}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.role}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {employmentLabel}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Country:</span>
              <span className="font-medium">{countryLabel}</span>
            </div>
          </CardContent>
        </Card>

        {/* Country-specific notice */}
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            These compliance fields are specific to <strong>{countryLabel}</strong>. 
            Toggle fields on/off to customize what the candidate needs to provide.
          </span>
        </div>

        {/* Field Configuration Sections */}
        <div className="mt-6 space-y-6">
          {sections.map(section => {
            const sectionFields = fieldsBySection[section];
            if (!sectionFields || sectionFields.length === 0) return null;

            const SectionIcon = getSectionIcon(section);
            const sectionLabel = getSectionLabel(section);

            return (
              <div key={section} className="space-y-3">
                <div className="flex items-center gap-2">
                  <SectionIcon className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">{sectionLabel}</Label>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {sectionFields.filter(f => f.enabled).length}/{sectionFields.length}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {sectionFields.map(field => (
                    <Card 
                      key={field.id} 
                      className={cn(
                        "border transition-all duration-200",
                        field.enabled 
                          ? "border-border/60 bg-card" 
                          : "border-border/30 bg-muted/20 opacity-60"
                      )}
                    >
                      <CardContent className="p-3 space-y-2">
                        {/* Field Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={cn(
                              "text-sm font-medium truncate",
                              !field.enabled && "text-muted-foreground"
                            )}>
                              {field.label}
                            </span>
                            {field.required && field.enabled && (
                              <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                                Required
                              </Badge>
                            )}
                          </div>
                          <Switch
                            checked={field.enabled}
                            onCheckedChange={() => handleToggleEnabled(field.id)}
                          />
                        </div>

                        {/* Helper text */}
                        {field.helperText && field.enabled && (
                          <p className="text-xs text-muted-foreground pl-0">
                            {field.helperText}
                          </p>
                        )}

                        {/* Field options when enabled */}
                        {field.enabled && (
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Required:</Label>
                              <Switch
                                checked={field.required}
                                onCheckedChange={() => handleToggleRequired(field.id)}
                                className="scale-75"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Filled by:</Label>
                              <Select
                                value={field.filledBy}
                                onValueChange={(value: FilledBySource) => handleFilledByChange(field.id, value)}
                              >
                                <SelectTrigger className="h-6 text-xs w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="candidate">Candidate</SelectItem>
                                  <SelectItem value="prefilled">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {/* Admin value input when prefilled */}
                        {field.enabled && field.filledBy === "prefilled" && field.type !== "upload" && (
                          <div className="pt-1">
                            {field.type === "select" && field.options ? (
                              <Select
                                value={field.adminValue || ""}
                                onValueChange={(value) => handleAdminValueChange(field.id, value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select value..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={field.adminValue || ""}
                                onChange={(e) => handleAdminValueChange(field.id, e.target.value)}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                                className="h-8 text-xs"
                              />
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total enabled fields:</span>
          <Badge variant="secondary">{enabledFieldCount}</Badge>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default V4_ConfigureOnboardingDrawer;
