import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, CheckCircle2, Plus, Bot } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";
import KurtAvatar from "@/components/KurtAvatar";

interface OnboardingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  onComplete: () => void;
  onSent: () => void;
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
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const handleSendForm = async () => {
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // ATS notification
    toast.success(`✅ Secure onboarding form sent to ${candidate.name}. You'll be notified once it's completed.`, {
      duration: 5000,
    });
    
    // Simulate ATS notification
    setTimeout(() => {
      toast.success("🔗 ATS notified of new document update.", {
        duration: 3000,
      });
    }, 2000);

    setIsSubmitting(false);
    onSent();
    onOpenChange(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("📝 Form configuration saved as draft.", {
      duration: 3000,
    });
    setIsSavingDraft(false);
  };

  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `custom-${Date.now()}`,
      label: "Custom Field",
    };
    setCustomFields([...customFields, newField]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Onboarding Data Collection Form</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="text-lg">{candidate.flag}</span>
            <span>{candidate.name} • {candidate.role}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Kurt Agent bubble */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8">
              <KurtAvatar />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground mb-1">Kurt will handle the details</p>
              <p className="text-xs text-muted-foreground">
                Once this form is submitted, I'll automatically notify the ATS — no manual steps needed.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Compliance badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>GDPR & {candidate.country} Employment Law Compliant</span>
        </div>

        {/* Form fields - prefilled and pending */}
        <div className="mt-6 space-y-6">
          {/* Prefilled fields */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={candidate.name} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={candidate.email || ""} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={candidate.role} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Salary</Label>
            <Input value={candidate.salary} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          {/* Pending fields */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-4">Pending from Candidate</p>

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
                <Input placeholder="ID Number" disabled className="bg-muted/30" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Tax Residence
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Nationality
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Address
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Textarea placeholder="To be filled by candidate" disabled className="bg-muted/30" rows={3} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Bank Details
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </Label>
                <Input placeholder="Bank Name" disabled className="bg-muted/30 mb-2" />
                <Input placeholder="Account Number / IBAN" disabled className="bg-muted/30" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Emergency Contact
                  <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input placeholder="Name" disabled className="bg-muted/30 mb-2" />
                <Input placeholder="Phone" disabled className="bg-muted/30" />
              </div>

              {/* Custom fields */}
              {customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input placeholder="To be filled by candidate" disabled className="bg-muted/30" />
                </div>
              ))}

              {/* Add custom field button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomField}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Field
              </Button>
            </div>
          </div>

          {/* Preview message */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">
              This form will be sent to:
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isSavingDraft}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="flex-1"
            >
              {isSavingDraft ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              onClick={handleSendForm}
              disabled={isSubmitting || isSavingDraft}
              className="flex-1"
            >
              {isSubmitting ? "Sending..." : "Send Form"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
