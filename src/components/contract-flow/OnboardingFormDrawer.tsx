/**
 * ⚠️ LOCKED COMPONENT - Part of Flow 1.1 Fronted Admin Dashboard v2 ⚠️
 * 
 * This component is part of a LOCKED flow and should NOT be modified.
 * See: src/pages/AdminContractingMultiCompany.tsx
 * Flow: Flow 1.1 — Fronted Admin Dashboard v2
 * Locked Date: 2025-01-15
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle2, Plus, Bot, Pencil, Check, X } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";
interface OnboardingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  onComplete: () => void;
  onSent: () => void;
  isResend?: boolean;
}
interface CustomField {
  id: string;
  label: string;
}
export const OnboardingFormDrawer: React.FC<OnboardingFormDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
  onSent,
  isResend = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [employmentType, setEmploymentType] = useState<"contractor" | "employee" | null>(candidate.employmentType || null);
  const [showEmploymentConfirm, setShowEmploymentConfirm] = useState(!candidate.employmentType && candidate.employmentTypeSource === "suggested");
  
  // Detect if candidate is from ATS or manually added
  const isFromATS = candidate.employmentTypeSource === "ats" || (candidate as any).hasATSData;
  
  // Form data state for manual candidates
  const [formData, setFormData] = useState({
    name: candidate.name,
    email: candidate.email || "",
    role: candidate.role,
    salary: candidate.salary,
    startDate: candidate.startDate || "",
  });

  // Keep form state in sync when candidate changes (e.g. selecting another card)
  React.useEffect(() => {
    if (!candidate) return;
    setFormData({
      name: candidate.name,
      email: candidate.email || "",
      role: candidate.role,
      salary: candidate.salary,
      startDate: candidate.startDate || "",
    });
    setEmploymentType(candidate.employmentType || null);
    setShowEmploymentConfirm(!isFromATS && !candidate.employmentType && candidate.employmentTypeSource === "suggested");
  }, [candidate, isFromATS]);
  const handleSendForm = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`✅ Form sent to ${candidate.name}. They'll receive it via email.`, {
      duration: 4000
    });
    setIsSubmitting(false);
    onSent();
    onOpenChange(false);
  };
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save the updated form data for manual candidates
    if (!isFromATS) {
      toast.success("📝 Candidate information updated successfully.", {
        duration: 3000
      });
    } else {
      toast.success("📝 Form configuration saved as draft.", {
        duration: 3000
      });
    }
    
    setIsSavingDraft(false);
    onOpenChange(false);
  };
  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `custom-${Date.now()}`,
      label: "Custom Field"
    };
    setCustomFields([...customFields, newField]);
  };
  const handleStartEdit = (field: CustomField) => {
    setEditingFieldId(field.id);
    setEditingLabel(field.label);
  };
  const handleSaveEdit = () => {
    if (editingFieldId && editingLabel.trim()) {
      setCustomFields(customFields.map(field => field.id === editingFieldId ? {
        ...field,
        label: editingLabel.trim()
      } : field));
      setEditingFieldId(null);
      setEditingLabel("");
    }
  };
  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditingLabel("");
  };
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Onboarding Data Collection Form</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="text-lg">{candidate.flag}</span>
            <span>{candidate.name} • {candidate.role}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Kurt Agent bubble */}
        {/* Compliance badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>GDPR & {candidate.country} Employment Law Compliant</span>
        </div>

        {/* Form fields - prefilled and pending */}
        <div className="mt-6 space-y-6">
          {/* Section: Prefilled from ATS */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              {isFromATS ? (
                <>
                  <Input value={candidate.name} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </>
              ) : (
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {isFromATS ? (
                <>
                  <Input value={candidate.email || "candidate@example.com"} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </>
              ) : (
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  type="email"
                  className="bg-background"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              {isFromATS ? (
                <>
                  <Input value={candidate.role} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </>
              ) : (
                <Input 
                  value={formData.role} 
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-background"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Salary</Label>
              {isFromATS ? (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      {candidate.employmentType === "contractor" 
                        ? "$" 
                        : candidate.country === "Philippines" 
                          ? "₱" 
                          : candidate.country === "Norway" 
                            ? "kr" 
                            : candidate.country === "India" 
                              ? "₹" 
                              : candidate.country === "Singapore" 
                                ? "S$" 
                                : candidate.country === "Mexico" 
                                  ? "$" 
                                  : "$"}
                    </span>
                    <Input value={candidate.salary} disabled className="bg-muted/50 pl-8" />
                  </div>
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </>
              ) : (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      {employmentType === "contractor" 
                        ? "$" 
                        : candidate.country === "Philippines" 
                          ? "₱" 
                          : candidate.country === "Norway" 
                            ? "kr" 
                            : candidate.country === "India" 
                              ? "₹" 
                              : candidate.country === "Singapore" 
                                ? "S$" 
                                : candidate.country === "Mexico" 
                                  ? "$" 
                                  : "$"}
                    </span>
                    <Input 
                      value={formData.salary} 
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, salary: numericValue }));
                      }}
                      placeholder="e.g., 5000"
                      className="bg-background pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter monthly amount (numbers only).</p>
                </>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            {isFromATS ? (
              candidate.startDate ? (
                <>
                  <Input value={candidate.startDate} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </>
              ) : (
                <>
                  <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                  <p className="text-xs text-muted-foreground">To be filled by candidate</p>
                </>
              )
            ) : (
              <Input 
                type="date"
                value={formData.startDate} 
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-background"
              />
            )}
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Employment Type
              {isFromATS && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">From ATS</Badge>}
            </Label>
            {isFromATS ? <>
                <Input value={candidate.employmentType === "contractor" ? "Contractor" : "Employee"} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Locked from ATS</p>
              </> : showEmploymentConfirm ? <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Bot className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Based on {candidate.country} hiring model and job category, I suggest: <span className="font-semibold text-foreground">{employmentType === "contractor" ? "Contractor" : "Employee"}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant={employmentType === "contractor" ? "default" : "outline"} size="sm" onClick={() => {
                setEmploymentType("contractor");
                setShowEmploymentConfirm(false);
              }} className="flex-1">
                    ✅ Contractor
                  </Button>
                  <Button type="button" variant={employmentType === "employee" ? "default" : "outline"} size="sm" onClick={() => {
                setEmploymentType("employee");
                setShowEmploymentConfirm(false);
              }} className="flex-1">
                    💼 Employee
                  </Button>
                </div>
              </div> : <>
                <Select 
                  value={employmentType || undefined} 
                  onValueChange={(value: "contractor" | "employee") => setEmploymentType(value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </>}
          </div>

          {/* Document Bundle Preview */}
          {employmentType && <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
              <Label className="text-xs font-medium">Contract Documents to be Generated</Label>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span>📄</span>
                  <span>Employment Agreement</span>
                </div>
              </div>
            </div>}

          {/* Preview message */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {isResend ? "This form was sent to:" : "This form will be sent to:"}
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                <p className="text-xs text-muted-foreground">{candidate.email || candidate.role}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            {!isFromATS && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveDraft} 
                disabled={isSubmitting || isSavingDraft}
                className="flex-1"
              >
                {isSavingDraft ? "Saving..." : "Save Changes"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className={isFromATS ? "flex-1" : ""}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSendForm} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? isResend ? "Resending..." : "Sending..." : isResend ? "Resend Form" : "Send Form"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
};