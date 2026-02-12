/**
 * Flow 3 – Candidate Onboarding v2
 * Step 6: Finish
 * 
 * DETACHED CLONE of v1 - changes here do NOT affect v1
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, ArrowRight, Sparkles, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
interface Step7Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};
const WorkerStep7Finish_v2 = ({
  formData,
  onComplete,
  isProcessing: externalProcessing
}: Step7Props) => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);

  const handleFinish = useCallback(() => {
    if (!termsAccepted) return;
    onComplete("finish");
    navigate('/flows/employee-dashboard-v6', {
      state: {
        fromOnboarding: true
      }
    });
  }, [navigate, onComplete, termsAccepted]);

  // v2: Payroll details removed - collected later via separate secure form
  const completedItems = [{
    label: "Personal profile",
    icon: CheckCircle2,
    done: !!formData.fullName
  }, {
    label: "Role & pay confirmed",
    icon: CheckCircle2,
    done: true
  }, {
    label: "Bank details",
    icon: CheckCircle2,
    done: !!formData.bankName
  }, {
    label: "Profile ready",
    icon: CheckCircle2,
    done: true
  }];
  return <div className="max-w-xl mx-auto space-y-6 relative">
      <motion.div initial={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} transition={{
      duration: 0.3
    }}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">You're All Set! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            Your onboarding is complete
          </p>
        </div>

        {/* What we configured */}
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
          <Label className="text-sm font-medium">What We've Completed</Label>
          <div className="grid grid-cols-2 gap-2">
            {completedItems.map((item, idx) => {
            const Icon = item.icon;
            return <motion.div key={idx} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: idx * 0.05,
              duration: 0.3
            }} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card border border-border/30 hover:border-primary/20 transition-colors">
                  <Icon className={cn("h-3 w-3 flex-shrink-0", item.done ? "text-green-600" : "text-muted-foreground")} />
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </motion.div>;
          })}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-card/40 border border-border/40 rounded-lg px-5 py-4">
          <div className="flex items-center gap-3">
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
                Terms &amp; Conditions
              </button>
            </label>
          </div>
        </div>

        {/* Terms Sheet */}
        <Sheet open={termsSheetOpen} onOpenChange={setTermsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 [&>button]:hidden">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-6 py-5 flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">Terms &amp; Conditions</SheetTitle>
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

        {/* CTA */}
        <div className="space-y-3">
          <Button size="lg" className="w-full" disabled={externalProcessing || !termsAccepted} onClick={handleFinish}>
            {externalProcessing ? <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Launching...
              </> : <>
                Finish & Launch
              </>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Your dashboard is ready to view
          </p>
        </div>
      </motion.div>
    </div>;
};
export default WorkerStep7Finish_v2;