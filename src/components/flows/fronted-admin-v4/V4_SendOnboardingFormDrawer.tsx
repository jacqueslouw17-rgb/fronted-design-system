/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Send Onboarding Form Drawer
 * 
 * Opens from "Onboard Candidate" column cards via "Onboard" button
 * Shows preview of the onboarding form the candidate will receive
 * Matches Flow 3 structure: Personal Info, Compliance, Payroll
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
import { Shield, Send, Mail, User, CreditCard, FileUp, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OnboardingFormConfig, OnboardingFieldConfig } from "./V4_ConfigureOnboardingDrawer";

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

  // Filter visible fields
  const visibleFields = config?.baseFields.filter(f => f.enabled) || [];
  
  // Group by section - matching Flow 3 structure
  const personalFields = visibleFields.filter(f => f.section === "personal");
  const complianceFields = visibleFields.filter(f => f.section === "compliance");
  const payrollFields = visibleFields.filter(f => f.section === "payroll");

  const hasNoVisibleFields = visibleFields.length === 0;

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
              {visibleFields.length} fields
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
              {/* Section 1: Confirm Personal Information */}
              {personalFields.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Confirm Personal Information</Label>
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

export default V4_SendOnboardingFormDrawer;
