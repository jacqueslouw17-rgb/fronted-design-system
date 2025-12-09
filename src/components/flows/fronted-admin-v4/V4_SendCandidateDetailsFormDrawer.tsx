/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Send Candidate Details Form Drawer
 * 
 * Opens from "Offer Accepted" column cards via "Send Form" button
 * Renders the candidate-facing onboarding form based on saved config
 * Shows preview of what candidate will receive
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Shield, Send, Mail, User, Globe, MapPin, CalendarIcon, FileUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { OnboardingConfig, OnboardingFieldConfig, CustomOnboardingField, CustomOnboardingFieldType } from "./V4_ConfigureCandidateDetailsDrawer";

interface V4_Candidate {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  email?: string;
  startDate?: string;
  employmentType?: "contractor" | "employee";
}

interface V4_SendCandidateDetailsFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  config?: OnboardingConfig;
  onSend: (candidateId: string) => void;
}

// Default config if none provided
const DEFAULT_CONFIG: OnboardingConfig = {
  baseFields: [
    { id: "date_of_birth", label: "Date of birth", section: "identity", type: "date", required: true, enabled: true, helperText: "As shown on government ID" },
    { id: "id_type", label: "ID type", section: "identity", type: "select", required: true, enabled: true, helperText: "Passport, National ID, etc." },
    { id: "id_number", label: "ID number", section: "identity", type: "text", required: true, enabled: true, helperText: "Document number from selected ID" },
    { id: "tax_residence_country", label: "Tax residence country", section: "tax", type: "select", required: true, enabled: true, helperText: "Country where you pay taxes" },
    { id: "tax_residence_city", label: "Tax residence city / region", section: "tax", type: "text", required: true, enabled: true, helperText: "City or region of tax residence" },
    { id: "residential_address", label: "Residential address", section: "address", type: "text", required: true, enabled: true, helperText: "Full street address incl. postal code and city" },
    { id: "nationality", label: "Nationality", section: "address", type: "select", required: true, enabled: true, helperText: "Your citizenship / nationality" },
  ],
  customFields: [],
};

const ID_TYPE_OPTIONS = ["Passport", "National ID", "Driver's License", "Residence Permit", "Other"];
const SAMPLE_COUNTRIES = ["United States", "United Kingdom", "Philippines", "Singapore", "Germany", "France", "Japan", "Australia", "Canada", "India"];

export const V4_SendCandidateDetailsFormDrawer: React.FC<V4_SendCandidateDetailsFormDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  config = DEFAULT_CONFIG,
  onSend,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!candidate) return;
    setIsSending(true);
    
    // Simulate sending
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

  // Filter visible fields
  const visibleBaseFields = config.baseFields.filter(f => f.enabled);
  const visibleCustomFields = config.customFields.filter(f => f.enabled);

  const identityFields = visibleBaseFields.filter(f => f.section === "identity");
  const taxFields = visibleBaseFields.filter(f => f.section === "tax");
  const addressFields = visibleBaseFields.filter(f => f.section === "address");

  const renderBaseField = (field: OnboardingFieldConfig) => {
    const isRequired = field.required;
    
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-sm flex items-center gap-1">
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {field.type === "date" ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Select date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" className="pointer-events-auto" disabled />
            </PopoverContent>
          </Popover>
        ) : field.type === "select" ? (
          <Select disabled>
            <SelectTrigger className="bg-background text-muted-foreground">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {field.id === "id_type" && ID_TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
              {(field.id === "tax_residence_country" || field.id === "nationality") && SAMPLE_COUNTRIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input placeholder={field.helperText || `Enter ${field.label.toLowerCase()}`} disabled className="bg-muted/30" />
        )}
        {field.helperText && field.type !== "text" && (
          <p className="text-xs text-muted-foreground">{field.helperText}</p>
        )}
      </div>
    );
  };

  const renderCustomField = (field: CustomOnboardingField) => {
    const isRequired = field.required;
    
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className="text-sm flex items-center gap-1">
          {field.label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {field.type === "short_text" && (
          <Input placeholder={`Enter ${field.label.toLowerCase()}`} disabled className="bg-muted/30" />
        )}
        {field.type === "long_text" && (
          <Textarea placeholder={`Enter ${field.label.toLowerCase()}`} disabled className="bg-muted/30 min-h-[80px]" />
        )}
        {field.type === "number" && (
          <Input type="number" placeholder="0" disabled className="bg-muted/30" />
        )}
        {field.type === "date" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Select date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" className="pointer-events-auto" disabled />
            </PopoverContent>
          </Popover>
        )}
        {field.type === "single_select" && (
          <Select disabled>
            <SelectTrigger className="bg-background text-muted-foreground">
              <SelectValue placeholder={`Select option`} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {field.options?.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {field.type === "file_upload" && (
          <div className="border border-dashed border-border/60 rounded-lg p-4 text-center bg-muted/20">
            <FileUp className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Upload file (disabled preview)</p>
          </div>
        )}
      </div>
    );
  };

  const hasNoVisibleFields = visibleBaseFields.length === 0 && visibleCustomFields.length === 0;

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
            {/* Prefilled from ATS/contract - read-only context */}
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
              {visibleBaseFields.length + visibleCustomFields.length} fields
            </Badge>
          </div>

          {hasNoVisibleFields ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">No fields configured</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please configure the form first by clicking "Configure" on the candidate card.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 opacity-80">
              {/* Section 1: Identity & Documents */}
              {identityFields.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Identity & Documents</Label>
                  </div>
                  <div className="space-y-4 pl-6">
                    {identityFields.map(renderBaseField)}
                  </div>
                </div>
              )}

              {/* Section 2: Tax & Residency */}
              {taxFields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Tax & Residency</Label>
                    </div>
                    <div className="space-y-4 pl-6">
                      {taxFields.map(renderBaseField)}
                    </div>
                  </div>
                </>
              )}

              {/* Section 3: Address */}
              {addressFields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Address</Label>
                    </div>
                    <div className="space-y-4 pl-6">
                      {addressFields.map(renderBaseField)}
                    </div>
                  </div>
                </>
              )}

              {/* Section 4: Custom Fields */}
              {visibleCustomFields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Additional Information</Label>
                    </div>
                    <div className="space-y-4 pl-6">
                      {visibleCustomFields.map(renderCustomField)}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || hasNoVisibleFields || !candidate.email}
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

export default V4_SendCandidateDetailsFormDrawer;
