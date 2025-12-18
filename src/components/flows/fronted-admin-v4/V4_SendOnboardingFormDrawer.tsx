/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Send Onboarding Form Drawer
 * 
 * Opens from "Onboard Candidate" column cards via "Onboard" button
 * Shows preview of the onboarding form the candidate will receive
 * Matches Flow 3 structure: Personal Info, Compliance, Payroll, Custom Fields
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Send, Mail, User, CreditCard, FileUp, AlertCircle, Lock, Plus, FileText, Hash, CalendarDays, List, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OnboardingFormConfig, OnboardingFieldConfig, CustomOnboardingField, CustomOnboardingFieldType } from "./V4_ConfigureOnboardingDrawer";

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

interface V4_SendOnboardingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  config?: OnboardingFormConfig;
  onSend: (candidateId: string) => void;
}

const FIELD_TYPE_ICONS: Record<CustomOnboardingFieldType, React.ElementType> = {
  short_text: FileText,
  long_text: FileText,
  number: Hash,
  date: CalendarDays,
  single_select: List,
  file_upload: Upload,
};

// Personal fields
const getPersonalFields = (): OnboardingFieldConfig[] => [
  { id: "full_name", label: "Full Name", section: "personal", type: "text", required: true, enabled: true, locked: true, filledBy: "prefilled", helperText: "As per contract" },
  { id: "email", label: "Email Address", section: "personal", type: "text", required: true, enabled: true, locked: false, filledBy: "prefilled", helperText: "Primary email" },
  { id: "phone", label: "Phone Number", section: "personal", type: "text", required: true, enabled: true, locked: false, filledBy: "candidate", helperText: "Include country code" },
  { id: "date_of_birth", label: "Date of Birth", section: "personal", type: "text", required: true, enabled: true, locked: true, filledBy: "prefilled", helperText: "DD/MM/YYYY" },
  { id: "nationality", label: "Nationality", section: "personal", type: "select", required: true, enabled: true, locked: true, filledBy: "prefilled", options: ["United States", "Philippines", "India", "Germany", "Sweden", "Norway", "Denmark", "Kosovo"] },
  { id: "residential_address", label: "Residential Address", section: "personal", type: "text", required: true, enabled: true, locked: true, filledBy: "prefilled", helperText: "Full address" },
];

// Country-specific Compliance fields
const getComplianceFields = (country: string): OnboardingFieldConfig[] => {
  switch (country) {
    case "Sweden":
      return [
        { id: "personalIdNumber", label: "Personal identity number (Personnummer)", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxResidency", label: "Tax residency", section: "compliance", type: "select", required: true, enabled: true, options: ["Resident in Sweden", "Non-resident (SINK)"], filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
      ];
    case "Norway":
      return [
        { id: "norwegianId", label: "Norwegian ID (Fødselsnummer or D-number)", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxResidency", label: "Tax residency", section: "compliance", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident (PAYE scheme)"], filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
      ];
    case "Denmark":
      return [
        { id: "cprNumber", label: "CPR number (Civil registration number)", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxResidency", label: "Tax residency", section: "compliance", type: "select", required: true, enabled: true, options: ["Resident", "Non-resident"], filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
      ];
    case "Philippines":
      return [
        { id: "tinNumber", label: "Tax Identification Number (TIN)", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "nationalId", label: "National ID / Government ID number", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "governmentIdUpload", label: "Government ID upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Philippine ID, passport, etc.", filledBy: "candidate" },
      ];
    case "Kosovo":
      return [
        { id: "invoicingAs", label: "Invoicing as", section: "compliance", type: "select", required: true, enabled: true, options: ["Individual", "Company"], filledBy: "candidate" },
        { id: "personalNumber", label: "Personal number (10-digit ID)", section: "compliance", type: "text", required: false, enabled: true, filledBy: "candidate" },
        { id: "idUpload", label: "ID upload", section: "compliance", type: "upload", required: true, enabled: true, helperText: "Passport / National ID", filledBy: "candidate" },
      ];
    default:
      return [
        { id: "nationalId", label: "National ID / Passport number", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "taxId", label: "Tax ID / Registration number", section: "compliance", type: "text", required: true, enabled: true, filledBy: "candidate" },
        { id: "idDocumentUpload", label: "ID document upload", section: "compliance", type: "upload", required: true, enabled: true, filledBy: "candidate" },
      ];
  }
};

// Payroll fields
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

// Default base fields for config - includes all three sections by default
const getDefaultConfig = (candidate: V4_Candidate): OnboardingFormConfig => {
  const employmentType = candidate.employmentType || "contractor";
  return {
    baseFields: [
      ...getPersonalFields(),
      ...getComplianceFields(candidate.country),
      ...getPayrollFields(employmentType),
    ],
    customFields: [],
    country: candidate.country,
    employmentType,
  };
};

export const V4_SendOnboardingFormDrawer: React.FC<V4_SendOnboardingFormDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  config,
  onSend,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!candidate) return;
    setIsSending(true);
    
    setTimeout(() => {
      onSend(candidate.id);
      setIsSending(false);
      toast.success("Onboarding form sent", {
        description: `${candidate.name} will receive an email with the form link.`
      });
      onOpenChange(false);
    }, 800);
  };

  if (!candidate) return null;

  // Use config or default, filter visible fields
  const activeConfig = config || getDefaultConfig(candidate);
  const visibleFields = activeConfig.baseFields.filter(f => f.enabled);
  const visibleCustomFields = activeConfig.customFields?.filter(f => f.enabled) || [];
  
  // Group by section - matching Flow 3 structure
  const personalFields = visibleFields.filter(f => f.section === "personal");
  const complianceFields = visibleFields.filter(f => f.section === "compliance");
  const payrollFields = visibleFields.filter(f => f.section === "payroll");

  const totalVisibleFields = visibleFields.length + visibleCustomFields.length;
  // Always show form preview with default fields

  const renderField = (field: OnboardingFieldConfig) => {
    const isRequired = field.required;
    const isPrefilled = field.filledBy === "prefilled";
    const isLocked = field.locked;
    
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-sm flex items-center gap-1.5">
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
          {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </Label>
        {field.type === "upload" ? (
          <div className="border border-dashed border-border/60 rounded-lg p-4 text-center bg-muted/20">
            <FileUp className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Upload area (preview)</p>
          </div>
        ) : field.type === "checkbox" ? (
          <div className="flex items-center gap-2">
            <Checkbox disabled checked={false} />
            <span className="text-sm text-muted-foreground">{field.helperText || "Confirmation required"}</span>
          </div>
        ) : field.type === "select" && field.options ? (
          <Select disabled value={isPrefilled ? field.adminValue : undefined}>
            <SelectTrigger className={cn(
              "bg-background text-muted-foreground",
              isPrefilled && field.adminValue && "text-foreground",
              isLocked && "bg-muted/50"
            )}>
              <SelectValue placeholder={isPrefilled && field.adminValue ? field.adminValue : `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            placeholder={field.helperText || `Enter ${field.label.toLowerCase()}`} 
            disabled 
            className={cn(
              "bg-muted/30",
              isPrefilled && field.adminValue && "text-foreground",
              isLocked && "bg-muted/50 cursor-not-allowed"
            )}
            value={isPrefilled ? field.adminValue : ""}
          />
        )}
        {field.helperText && field.type !== "checkbox" && (
          <p className="text-xs text-muted-foreground">{field.helperText}</p>
        )}
      </div>
    );
  };

  const renderCustomField = (field: CustomOnboardingField) => {
    const isRequired = field.required;
    const isPrefilled = field.filledBy === "prefilled";
    const TypeIcon = FIELD_TYPE_ICONS[field.type];
    
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-sm flex items-center gap-1.5">
          <TypeIcon className="h-3 w-3 text-muted-foreground" />
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {field.type === "file_upload" ? (
          <div className="border border-dashed border-border/60 rounded-lg p-4 text-center bg-muted/20">
            <FileUp className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Upload area (preview)</p>
          </div>
        ) : field.type === "single_select" && field.options ? (
          <Select disabled value={isPrefilled ? field.adminValue : undefined}>
            <SelectTrigger className={cn(
              "bg-background text-muted-foreground",
              isPrefilled && field.adminValue && "text-foreground"
            )}>
              <SelectValue placeholder={isPrefilled && field.adminValue ? field.adminValue : `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            placeholder={`Enter ${field.label.toLowerCase()}`} 
            disabled 
            className={cn(
              "bg-muted/30",
              isPrefilled && field.adminValue && "text-foreground"
            )}
            value={isPrefilled ? field.adminValue : ""}
            type={field.type === "number" ? "number" : "text"}
          />
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Send Onboarding Form</SheetTitle>
        </SheetHeader>

        {/* Recipient Info Card */}
        <Card className="mt-6 border-border/40 bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">This form will be sent to:</p>
                <p className="font-semibold text-foreground">{candidate.name}</p>
                <p className="text-sm text-primary">{candidate.email || "No email provided"}</p>
              </div>
            </div>
            <Separator />
            {/* Prefilled from contract - read-only context */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prefilled from contract</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{candidate.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{candidate.countryFlag} {candidate.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Salary:</span>
                  <span className="font-medium">{candidate.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {candidate.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>GDPR & local employment regulations compliant</span>
        </div>

        {/* Form Preview */}
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Form Preview</p>
            <Badge variant="secondary" className="text-xs">
              {totalVisibleFields} fields
            </Badge>
          </div>

          <div className="space-y-6 opacity-80">
              {/* Section 1: Confirm Personal Information */}
              {personalFields.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Personal Information</Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 pl-6">
                    Details pre-filled from contract. Some fields locked.
                  </p>
                  <div className="space-y-4 pl-6">
                    {personalFields.map(renderField)}
                  </div>
                </div>
              )}

              {/* Section 2: Compliance Requirements */}
              {complianceFields.length > 0 && (
                <>
                  {personalFields.length > 0 && <Separator />}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Compliance Requirements</Label>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2 pl-6">
                      Country-specific documents for {candidate.country}.
                    </p>
                    <div className="space-y-4 pl-6">
                      {complianceFields.map(renderField)}
                    </div>
                  </div>
                </>
              )}

              {/* Section 3: Payroll Details / Invoice Rules */}
              {payrollFields.length > 0 && (
                <>
                  {(personalFields.length > 0 || complianceFields.length > 0) && <Separator />}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">
                        {candidate.employmentType === "contractor" ? "Invoice Rules" : "Payroll Details"}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2 pl-6">
                      {candidate.employmentType === "contractor" 
                        ? "Contractor confirms invoice submission rules."
                        : "Bank details for salary payments."
                      }
                    </p>
                    <div className="space-y-4 pl-6">
                      {payrollFields.map(renderField)}
                    </div>
                  </div>
                </>
              )}

              {/* Section 4: Custom Fields */}
              {visibleCustomFields.length > 0 && (
                <>
                  {(personalFields.length > 0 || complianceFields.length > 0 || payrollFields.length > 0) && <Separator />}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Additional Information</Label>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2 pl-6">
                      Custom fields for this candidate.
                    </p>
                    <div className="space-y-4 pl-6">
                      {visibleCustomFields.map(renderCustomField)}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || !candidate.email}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Form"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default V4_SendOnboardingFormDrawer;
