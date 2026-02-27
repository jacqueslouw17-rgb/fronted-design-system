/**
 * Flow 5 — Step 1: Account & Company Details
 * 
 * All fields prefilled and locked (read-only). Only password creation is active.
 * Admin must contact Fronted to change details.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import StandardInput from "@/components/shared/StandardInput";

const COUNTRIES: Record<string, { label: string; flag: string }> = {
  NO: { label: "Norway", flag: "🇳🇴" },
  DK: { label: "Denmark", flag: "🇩🇰" },
  SE: { label: "Sweden", flag: "🇸🇪" },
  US: { label: "United States", flag: "🇺🇸" },
  GB: { label: "United Kingdom", flag: "🇬🇧" },
  IN: { label: "India", flag: "🇮🇳" },
  PH: { label: "Philippines", flag: "🇵🇭" },
  XK: { label: "Kosovo", flag: "🇽🇰" },
};

const EUROZONE = ["AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES", "NO", "DK", "SE"];

const DEFAULT_TEMPLATES: Record<string, string[]> = {
  NO: ["Employment Agreement", "NDA", "IP Assignment"],
  DK: ["Employment Agreement", "NDA"],
  SE: ["Employment Agreement", "NDA", "IP Assignment"],
  US: ["Employment Agreement", "NDA", "IP Assignment", "At-Will Notice"],
  GB: ["Employment Agreement", "NDA", "IP Assignment"],
  IN: ["Employment Agreement", "NDA", "IP Assignment", "Gratuity Notice"],
  PH: ["Employment Agreement", "NDA"],
  XK: ["Employment Agreement", "NDA"],
};

interface StepAccountDetailsProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-1.5 text-muted-foreground">
      <Lock className="h-3 w-3" />
      {label}
    </Label>
    <Input value={value} disabled className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
  </div>
);

const StepAccountDetails: React.FC<StepAccountDetailsProps> = ({ formData, onComplete, isProcessing }) => {
  const fullName = formData.adminName || "Joe Smith";
  const email = formData.adminEmail || "joe.smith@jboxtech.com";
  const companyName = formData.companyName || "JBOX Technologies";
  const hqCountry = formData.hqCountry || "NO";
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countryInfo = COUNTRIES[hqCountry];
  const countryDisplay = countryInfo ? `${countryInfo.flag} ${countryInfo.label}` : hqCountry;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = password.length >= 8;

  const handleContinue = () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    onComplete("account_details", { fullName, email, companyName, hqCountry, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6 p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Account & Company Details</h3>
        <p className="text-sm text-muted-foreground">
          Your details have been pre-configured. Create a password to access your dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <LockedField label="Full Name" value={fullName} />
        <LockedField label="Email" value={email} />
        <LockedField label="Company Name" value={companyName} />
        <LockedField label="HQ Country" value={countryDisplay} />

        <p className="text-xs text-muted-foreground">
          Need to update your details? Contact your Fronted admin.
        </p>

        <div className="border-t border-border/40 pt-4">
          <StandardInput
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            error={errors.password}
            helpText="Minimum 8 characters"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default StepAccountDetails;
