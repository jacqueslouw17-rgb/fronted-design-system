/**
 * Flow 3 – Candidate Onboarding v2
 * Step 5: Work Setup & Agreements (final step)
 * 
 * DETACHED CLONE of v1 - changes here do NOT affect v1
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ArrowRight, FileText, Upload, X as XIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CurrencyInput from "@/components/shared/CurrencyInput";

interface Step5Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
}

const WorkerStep5WorkSetup_v2 = ({ formData, onComplete, isProcessing, isLoadingFields, buttonText }: Step5Props) => {
  const [data, setData] = useState({
    deviceProvided: formData.deviceProvided ?? undefined,
    reimbursementAmount: formData.reimbursementAmount || "",
    receiptFile: formData.receiptFile || null,
    assetAcknowledged: formData.assetAcknowledged || false,
    agreementSigned: formData.agreementSigned || false
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({ ...data, receiptFile: file });
    }
  };

  const handleRemoveFile = () => {
    setData({ ...data, receiptFile: null });
  };

  const handleContinue = () => {
    onComplete("work_setup", data);
  };

  const deviceValid = data.deviceProvided === undefined
    ? true
    : data.deviceProvided 
      ? data.assetAcknowledged
      : true;
  const isValid = deviceValid && termsAccepted;


  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Work Setup & Agreements</h3>
        <p className="text-sm text-muted-foreground">
          Let us know about your device setup and review agreements.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-base">Did your company provide you with a device for work?</Label>
          <RadioGroup
            value={data.deviceProvided === undefined ? undefined : data.deviceProvided ? "yes" : "no"}
            onValueChange={(value) => setData({ ...data, deviceProvided: value === "yes" })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="device-yes" />
              <Label htmlFor="device-yes" className="font-normal">
                Yes, I received a company device
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="device-no" />
              <Label htmlFor="device-no" className="font-normal">
                No, I'm using my personal device
              </Label>
            </div>
          </RadioGroup>
        </div>

        {data.deviceProvided !== undefined && (
          <>
            {data.deviceProvided ? (
              <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">Company Asset Acknowledgment</h4>
                <p className="text-sm text-muted-foreground">
                  You acknowledge receipt of company-owned equipment. This device remains property of the company and must be returned upon request or termination of employment.
                </p>
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="assetAck"
                    checked={data.assetAcknowledged}
                    onCheckedChange={(checked) => 
                      setData({ ...data, assetAcknowledged: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="assetAck"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I acknowledge receipt of company equipment and agree to return it when requested
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Equipment Reimbursement (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    If eligible, you may claim reimbursement for work-related equipment purchases.
                  </p>
                </div>

                <div className="space-y-3">
                  <CurrencyInput
                    label="Reimbursement Amount"
                    value={data.reimbursementAmount}
                    onChange={(value) => setData({ ...data, reimbursementAmount: value })}
                    currency="USD"
                    showCurrencySelect={false}
                  />

                  <div className="space-y-2">
                    <Label>Upload Receipt (Optional)</Label>
                    {data.receiptFile ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm flex-1 truncate">
                          {data.receiptFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleRemoveFile}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload receipt</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Terms & Conditions */}
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
              <XIcon className="h-4 w-4 text-muted-foreground" />
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

      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : (buttonText || "Go to Dashboard")}
        {!buttonText && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

export default WorkerStep5WorkSetup_v2;