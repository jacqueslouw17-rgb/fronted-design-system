/**
 * Flow 5 v3 — Step 1: Company Details (Future)
 * 
 * Isolated v7 Future-styled account details for Flow 5 v3 only.
 * DO NOT modify any other flows or versions.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ArrowRight, Lock, FileText, X } from "lucide-react";
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

const EUROZONE = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES","NO","DK","SE"];

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

interface F5v3AccountDetailsStepProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Lock className="h-3 w-3" />
      {label}
    </Label>
    <Input value={value} disabled className="bg-muted/30 text-muted-foreground/80 cursor-not-allowed border-border/20 text-sm" />
  </div>
);

const F5v3_AccountDetailsStep: React.FC<F5v3AccountDetailsStepProps> = ({ formData, onComplete, isProcessing }) => {
  const fullName = formData.adminName || "Joe Smith";
  const email = formData.adminEmail || "joe.smith@jboxtech.com";
  const companyName = formData.companyName || "JBOX Technologies";
  const hqCountry = formData.hqCountry || "NO";
  const defaultCurrency = formData.defaultCurrency || (EUROZONE.includes(hqCountry) ? "EUR" : "USD");
  const baseTemplates = formData.baseTemplates || DEFAULT_TEMPLATES[hqCountry] || ["Employment Agreement", "NDA"];
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);
  const countryInfo = COUNTRIES[hqCountry];
  const countryDisplay = countryInfo ? `${countryInfo.flag} ${countryInfo.label}` : hqCountry;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = password.length >= 8 && termsAccepted;

  const handleContinue = () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    onComplete("account_details", { fullName, email, companyName, hqCountry, defaultCurrency, password, termsAccepted: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-5 w-full sm:max-w-xl sm:mx-auto px-1 sm:px-0"
    >
      <div className="space-y-4">
        <LockedField label="Full Name" value={fullName} />
        <LockedField label="Email" value={email} />
        <LockedField label="Company Name" value={companyName} />
        <LockedField label="HQ Country" value={countryDisplay} />
        <LockedField label="Default Currency" value={defaultCurrency === "EUR" ? "€ EUR" : "$ USD"} />

        {/* Base Templates — locked list */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Base Contract Templates
          </Label>
          <div className="space-y-1.5">
            {baseTemplates.map((template: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground/80"
                style={{ background: 'hsl(0 0% 0% / 0.02)', border: '1px solid hsl(0 0% 0% / 0.04)' }}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {template}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">
          Need to update your details? Contact your Fronted admin.
        </p>

        <div className="border-t border-border/20 pt-4">
          <StandardInput
            id="f5v3-password"
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            error={errors.password}
            helpText="Minimum 8 characters"
            placeholder="••••••••"
          />
        </div>

        {/* Inline Terms checkbox */}
        <div className="flex items-center gap-3 pt-1">
          <Checkbox
            id="f5v3-terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <label htmlFor="f5v3-terms" className="text-sm text-foreground leading-snug cursor-pointer select-none">
            I agree to the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setTermsSheetOpen(true);
              }}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Terms & Conditions
            </button>
          </label>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Terms Sheet */}
      <Sheet open={termsSheetOpen} onOpenChange={setTermsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 [&>button]:hidden">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-6 py-5 flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Terms & Conditions</SheetTitle>
            <button
              onClick={() => setTermsSheetOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="px-6 py-6 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using the Fronted platform, you agree to the following terms and conditions.
            </p>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">1. Platform Usage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are granted access to manage payroll, employee data, and compliance workflows
                on behalf of your organization.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">2. Data Privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All data is handled in compliance with GDPR and relevant data protection regulations.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">3. Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You agree to maintain the confidentiality of your login credentials.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">4. Liability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The platform is provided "as is." We are not liable for indirect damages.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">5. Amendments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We reserve the right to update these terms at any time.
              </p>
            </section>
            <div className="pt-4 pb-2">
              <Button
                onClick={() => {
                  setTermsAccepted(true);
                  setTermsSheetOpen(false);
                }}
                className="w-full"
              >
                I agree
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default F5v3_AccountDetailsStep;
