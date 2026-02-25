/**
 * Flow 3 – Candidate Onboarding v2
 * Step 6: Terms & Conditions
 * 
 * Separated from Work Setup to match Flow 5 pattern.
 * Checkbox + Sheet drawer for T&Cs.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ArrowRight, X, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface StepTermsProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
}

const WorkerStep6Terms_v2 = ({ formData, onComplete, isProcessing, buttonText }: StepTermsProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);

  const handleContinue = () => {
    onComplete("terms", { termsAccepted: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-5 sm:space-y-6 p-3 sm:p-6"
    >
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-semibold">Terms & Conditions</h3>
        <p className="text-sm text-muted-foreground">
          Review and accept the terms to complete your onboarding.
        </p>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="terms-onboarding"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <label htmlFor="terms-onboarding" className="text-sm text-foreground leading-snug cursor-pointer select-none">
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

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>GDPR Compliant • Your data is encrypted and secure</span>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!termsAccepted || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : (buttonText || "Go to Dashboard")}
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
              These terms govern your use of the platform as a Candidate.
            </p>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">1. Platform Usage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are granted access to manage your personal profile, payroll information, and employment
                workflows through the platform. You agree to use the platform responsibly and in
                accordance with applicable laws.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">2. Data Privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All personal and employment data processed through the platform is handled in
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
    </motion.div>
  );
};

export default WorkerStep6Terms_v2;
