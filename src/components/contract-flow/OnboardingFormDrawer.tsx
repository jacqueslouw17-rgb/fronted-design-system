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
import { Shield, CheckCircle2 } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";

interface OnboardingFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  onComplete: () => void;
}

export const OnboardingFormDrawer: React.FC<OnboardingFormDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onComplete,
}) => {
  const [formData, setFormData] = useState({
    nationalId: "",
    taxResidence: "",
    bankAccount: "",
    emergencyContact: "",
    additionalInfo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(`I've sent the secure onboarding form to ${candidate.name}. You'll be notified when it's completed and ready for contract generation.`, {
      duration: 5000,
    });
    setIsSubmitting(false);
    onComplete();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span className="text-2xl">{candidate.flag}</span>
            <div>
              <p className="text-lg">{candidate.name}</p>
              <p className="text-sm text-muted-foreground font-normal">
                Onboarding Data Collection
              </p>
            </div>
          </SheetTitle>
          <SheetDescription>
            Collect missing information to finalize the employment contract
          </SheetDescription>
        </SheetHeader>

        {/* Info message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
        >
          <p className="text-sm font-medium text-foreground mb-1">Onboarding Data Collection Form</p>
          <p className="text-xs text-muted-foreground mb-2">
            Purpose: Collect missing information to finalize the employment contract.
          </p>
          <p className="text-xs text-muted-foreground">
            Note: Fronted ensures personal data is stored securely and shared only with authorized HR and payroll admins.
          </p>
        </motion.div>

        {/* Compliance badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>GDPR & {candidate.country} Employment Law Compliant</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nationalId" className="flex items-center gap-2">
              National ID / Passport
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Input
              id="nationalId"
              placeholder="Enter national ID or passport number"
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxResidence" className="flex items-center gap-2">
              Tax Residence
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Input
              id="taxResidence"
              placeholder="Country of tax residence"
              value={formData.taxResidence}
              onChange={(e) =>
                setFormData({ ...formData, taxResidence: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccount" className="flex items-center gap-2">
              Bank Account Details
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Input
              id="bankAccount"
              placeholder="IBAN or local bank account number"
              value={formData.bankAccount}
              onChange={(e) =>
                setFormData({ ...formData, bankAccount: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="flex items-center gap-2">
              Emergency Contact
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Input
              id="emergencyContact"
              placeholder="Name and phone number"
              value={formData.emergencyContact}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContact: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">
              Additional Information
              <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
            </Label>
            <Input
              id="additionalInfo"
              placeholder="Any other relevant information"
              value={formData.additionalInfo}
              onChange={(e) =>
                setFormData({ ...formData, additionalInfo: e.target.value })
              }
            />
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
                <p className="text-xs text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Sending..." : "Send Form"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
