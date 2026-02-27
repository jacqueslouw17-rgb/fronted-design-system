/**
 * Flow 5 — Company Admin Onboarding v1
 * 
 * Single flat form: locked prefilled fields, password creation, inline T&C acceptance.
 * No multi-step accordion — everything in one container.
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import { motion } from "framer-motion";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { useAdminFlowBridge } from "@/hooks/useAdminFlowBridge";
import { useOnboardingStore } from "@/stores/onboardingStore";
import StandardInput from "@/components/shared/StandardInput";
import { Lock, FileText, ArrowRight, X, Shield } from "lucide-react";

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

const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-1.5 text-muted-foreground">
      <Lock className="h-3 w-3" />
      {label}
    </Label>
    <Input value={value} disabled className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
  </div>
);

const CompanyAdminOnboarding = () => {
  const navigate = useNavigate();
  const { updateFormData, completeStep } = useAdminFlowBridge();
  const { resetAdminFlow } = useOnboardingStore();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();

  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasInitialized = useRef(false);

  const fullName = "Joe Smith";
  const email = "joe.smith@jboxtech.com";
  const companyName = "JBOX Technologies";
  const hqCountry = "NO";
  const defaultCurrency = EUROZONE.includes(hqCountry) ? "EUR" : "USD";
  const baseTemplates = DEFAULT_TEMPLATES[hqCountry] || ["Employment Agreement", "NDA"];
  const countryInfo = COUNTRIES[hqCountry];
  const countryDisplay = countryInfo ? `${countryInfo.flag} ${countryInfo.label}` : hqCountry;

  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  useEffect(() => {
    if (!hasInitialized.current) {
      resetAdminFlow();
      updateFormData({ adminName: fullName, adminEmail: email, companyName, hqCountry });
      hasInitialized.current = true;
    }
  }, [resetAdminFlow, updateFormData]);

  const isValid = password.length >= 8 && termsAccepted;

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    completeStep("account_details");
    completeStep("terms");
    navigate("/flows/company-admin-dashboard-v3");
  };

  return (
    <AgentLayout context="Company Admin Onboarding">
      <main className="flex min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
        <FrostedHeader onLogoClick={() => navigate("/?tab=flows")} onCloseClick={() => navigate("/?tab=flows")} />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        </div>

        <div
          className="flex-shrink-0 flex flex-col min-h-screen p-4 sm:p-8 pb-16 sm:pb-32 space-y-6 sm:space-y-8 relative z-10 mx-auto onboarding-scroll-container"
          style={{ width: "100%", maxWidth: "800px" }}
        >
          <AgentHeader
            title="Hi Joe! Let's complete your onboarding"
            subtitle="You've been invited as a Company Admin. Confirm your details below."
            showPulse={true}
            isActive={isSpeaking}
            showInput={false}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 sm:p-6 space-y-4"
          >
            {/* Locked fields */}
            <LockedField label="Full Name" value={fullName} />
            <LockedField label="Email" value={email} />
            <LockedField label="Company Name" value={companyName} />
            <LockedField label="HQ Country" value={countryDisplay} />

            <p className="text-xs text-muted-foreground">
              Need to update your details? Contact your Fronted admin.
            </p>

            {/* Password field */}
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

            {/* Inline Terms checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <label htmlFor="terms" className="text-sm text-foreground leading-snug cursor-pointer select-none">
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

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Processing..." : "Go to Dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </main>

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
              These terms govern your use of the platform as a Company Admin.
            </p>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">1. Platform Usage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are granted access to manage payroll, employee data, and compliance workflows
                on behalf of your organization. You agree to use the platform responsibly and in
                accordance with applicable laws.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">2. Data Privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All employee and contractor data processed through the platform is handled in
                compliance with GDPR and relevant data protection regulations. You are responsible
                for ensuring the accuracy of the data you submit.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">3. Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You agree to maintain the confidentiality of your login credentials and to notify
                us immediately of any unauthorized access to your account.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">4. Liability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The platform is provided "as is." While we take reasonable measures to ensure
                accuracy and uptime, we are not liable for any indirect damages arising from
                platform use.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">5. Amendments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We reserve the right to update these terms at any time. Continued use of the
                platform constitutes acceptance of any changes.
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
    </AgentLayout>
  );
};

export default CompanyAdminOnboarding;
