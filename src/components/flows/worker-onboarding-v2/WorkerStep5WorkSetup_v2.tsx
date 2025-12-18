/**
 * Flow 3 – Candidate Onboarding v2
 * Step 5: Work Setup & Agreements
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
import { ArrowRight, FileText, Upload, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CurrencyInput from "@/components/shared/CurrencyInput";

interface Step5Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep5WorkSetup_v2 = ({ formData, onComplete, isProcessing, isLoadingFields }: Step5Props) => {
  const [data, setData] = useState({
    deviceProvided: formData.deviceProvided ?? undefined,
    reimbursementAmount: formData.reimbursementAmount || "",
    receiptFile: formData.receiptFile || null,
    assetAcknowledged: false,
    agreementSigned: false
  });

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

  const isValid = data.deviceProvided === undefined
    ? true
    : data.deviceProvided 
      ? data.assetAcknowledged
      : true;


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
                          <X className="h-4 w-4" />
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




      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkerStep5WorkSetup_v2;