import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, X } from "lucide-react";

interface Step5Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
}

const CandidateStep5WorkSetup = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false,
  buttonText = "Continue"
}: Step5Props) => {
  const [deviceProvided, setDeviceProvided] = useState<string>("");
  const [reimbursementAmount, setReimbursementAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [assetAcknowledged, setAssetAcknowledged] = useState(false);
  const [agreementSigned, setAgreementSigned] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptFileName("");
  };

  const handleContinue = () => {
    const data = {
      deviceProvided,
      reimbursementAmount: deviceProvided === "no" ? reimbursementAmount : "",
      receiptFile: deviceProvided === "no" ? receiptFile : null,
      assetAcknowledged: deviceProvided === "yes" ? assetAcknowledged : false,
      agreementSigned
    };
    onComplete("work_setup", data);
  };

  const isValid = 
    deviceProvided && 
    agreementSigned &&
    (deviceProvided === "yes" ? assetAcknowledged : true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Work Setup & Agreements</h3>
        <p className="text-sm text-muted-foreground">
          Let's finalize your work equipment and required agreements.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Device Question */}
          <div className="space-y-3">
            <Label>Did your company provide you with a device for work? *</Label>
            <RadioGroup value={deviceProvided} onValueChange={setDeviceProvided}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="device-yes" />
                <Label htmlFor="device-yes" className="font-normal cursor-pointer">
                  Yes, I received a company device
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="device-no" />
                <Label htmlFor="device-no" className="font-normal cursor-pointer">
                  No, I'm using my own device
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* If Yes - Company Device Acknowledgment */}
          {deviceProvided === "yes" && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <h4 className="font-medium">Company Asset Acknowledgment</h4>
                <p className="text-sm text-muted-foreground">
                  You have received the following company-owned equipment:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Laptop / Desktop Computer</li>
                  <li>Accessories (as applicable)</li>
                </ul>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="asset-ack" 
                  checked={assetAcknowledged}
                  onCheckedChange={(checked) => setAssetAcknowledged(checked as boolean)}
                />
                <Label 
                  htmlFor="asset-ack" 
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  I acknowledge receipt of company-owned equipment and agree to return it upon request or termination of employment.
                </Label>
              </div>

              <div className="p-3 rounded bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  📄 <strong>Document:</strong> Company Asset Agreement will be attached to your employment contract for signature.
                </p>
              </div>
            </div>
          )}

          {/* If No - Reimbursement Option */}
          {deviceProvided === "no" && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <h4 className="font-medium">Equipment Reimbursement (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  If applicable, you may request reimbursement for work equipment.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reimbursement">Reimbursement Amount</Label>
                <Input
                  id="reimbursement"
                  type="number"
                  value={reimbursementAmount}
                  onChange={(e) => setReimbursementAmount(e.target.value)}
                  placeholder="Enter amount (optional)"
                />
              </div>

              {reimbursementAmount && (
                <div className="space-y-2">
                  <Label>Upload Receipt (Optional)</Label>
                  {receiptFile ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm flex-1">{receiptFileName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to upload receipt</p>
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
              )}

              <div className="p-3 rounded bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  📄 <strong>Document:</strong> Personal Equipment Agreement will be attached to your employment contract for signature.
                </p>
              </div>
            </div>
          )}

          {/* Agreement Signature */}
          {deviceProvided && (
            <div className="space-y-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <h4 className="font-medium">Required Agreement</h4>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agreement" 
                  checked={agreementSigned}
                  onCheckedChange={(checked) => setAgreementSigned(checked as boolean)}
                />
                <Label 
                  htmlFor="agreement" 
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  I agree to sign the {deviceProvided === "yes" ? "Company Asset Agreement" : "Personal Equipment Agreement"} as part of my employment contract.
                </Label>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CandidateStep5WorkSetup;
