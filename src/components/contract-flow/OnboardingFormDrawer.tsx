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
                  <Input value={candidate.salary} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </>
              ) : (
                <Input 
                  value={formData.salary} 
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  className="bg-background"
                />
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
                {employmentType === "contractor" ? <>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📄</span>
                      <span>Contractor Agreement</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📄</span>
                      <span>NDA</span>
                    </div>
                    {candidate.country === "Philippines" && <div className="flex items-center gap-2 text-xs">
                        <span>📄</span>
                        <span>Data Privacy Addendum (PH)</span>
                      </div>}
                  </> : <>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📄</span>
                      <span>Employment Agreement</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📄</span>
                      <span>Country Compliance Attachments</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📄</span>
                      <span>NDA / Policy Docs</span>
                    </div>
                  </>}
              </div>
            </div>}

          {/* Pending fields */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-4">
              Required Fields <Badge variant="secondary" className="ml-2 text-xs">To be filled by candidate</Badge>
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  ID Type & Number
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Select disabled>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="To be filled by candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="national-id">National ID</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Tax Residence
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  City
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Nationality
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Address
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Textarea placeholder="To be filled by candidate" disabled className="bg-muted/30" rows={3} />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Bank Details
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30 mb-2" />
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Pay Frequency
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Select disabled>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="To be filled by candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Emergency Contact
                  <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30 mb-2" />
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                <p className="text-xs text-muted-foreground">To be filled by candidate</p>
              </div>

              {/* Custom fields */}
              {customFields.map(field => <div key={field.id} className="space-y-2">
                  {editingFieldId === field.id ? <div className="flex items-center gap-2">
                      <Input value={editingLabel} onChange={e => setEditingLabel(e.target.value)} className="flex-1" placeholder="Field name" autoFocus onKeyDown={e => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }} />
                      <Button type="button" size="icon" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 text-primary hover:bg-primary/10">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 text-muted-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                      </Button>
                    </div> : <div className="flex items-center justify-between">
                      <Label>{field.label}</Label>
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleStartEdit(field)} className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>}
                  <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                </div>)}

              {/* Add custom field button - hidden for now */}
              {false && <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField} className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Field
                </Button>}
            </div>
          </div>

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