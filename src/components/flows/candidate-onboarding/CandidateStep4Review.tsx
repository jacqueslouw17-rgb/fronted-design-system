import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onSaveDraft?: () => void;
  isProcessing?: boolean;
}

const CandidateStep4Review = ({ 
  formData, 
  onComplete, 
  onSaveDraft,
  isProcessing = false 
}: Step4Props) => {
  const [agreed, setAgreed] = useState(false);
  const isContractor = formData.employmentType === "contractor";

  const handleSubmit = () => {
    onComplete("review_submit", { agreed });
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      {/* Genie tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <p className="text-sm text-foreground/80">
          Once submitted, Kurt will validate your details and notify the admin. Your contract will be generated automatically.
        </p>
      </div>

      {/* Review sections */}
      <div className="space-y-4">
        {/* Personal Info */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Personal Information</h4>
            <Badge variant="outline" className="text-xs">Step 1</Badge>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{formData.fullName}</span></p>
            <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{formData.email}</span></p>
            <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{formData.phone || "Not provided"}</span></p>
          </div>
        </div>

        {/* Work & Pay */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Work & Pay Details</h4>
            <Badge variant="outline" className="text-xs">Step 2</Badge>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Role:</span> <span className="font-medium">{formData.role}</span></p>
            <p><span className="text-muted-foreground">Type:</span> <span className="font-medium capitalize">{formData.employmentType}</span></p>
            <p><span className="text-muted-foreground">Start Date:</span> <span className="font-medium">{formData.startDate}</span></p>
            <p><span className="text-muted-foreground">Compensation:</span> <span className="font-medium">{formData.currency} {formData.salary} / {formData.frequency}</span></p>
            {isContractor && formData.paidLeave && (
              <p><span className="text-muted-foreground">Benefits:</span> <span className="font-medium">Paid leave included</span></p>
            )}
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Compliance Documents</h4>
            <Badge variant="outline" className="text-xs">Step 3</Badge>
          </div>
          <div className="text-sm space-y-1">
            {formData.country === "PH" && isContractor && (
              <>
                <p><span className="text-muted-foreground">TIN Number:</span> <span className="font-medium">{formData.tinNumber || "Not provided"}</span></p>
                <p><span className="text-muted-foreground">National ID:</span> <span className="font-medium">{formData.nationalIdFile ? "✓ Uploaded" : "Not uploaded"}</span></p>
              </>
            )}
            {formData.country === "PH" && !isContractor && (
              <>
                <p><span className="text-muted-foreground">SSS Number:</span> <span className="font-medium">{formData.sssNumber || "Not provided"}</span></p>
                <p><span className="text-muted-foreground">PhilHealth:</span> <span className="font-medium">{formData.philHealthNumber || "Not provided"}</span></p>
                <p><span className="text-muted-foreground">Pag-IBIG:</span> <span className="font-medium">{formData.pagIbigNumber || "Not provided"}</span></p>
              </>
            )}
            {formData.country === "NO" && (
              <>
                <p><span className="text-muted-foreground">Personnummer:</span> <span className="font-medium">{formData.personnummer || "Not provided"}</span></p>
                <p><span className="text-muted-foreground">Bank IBAN:</span> <span className="font-medium">{formData.bankIBAN || "Not provided"}</span></p>
              </>
            )}
            {formData.country === "XK" && (
              <>
                <p><span className="text-muted-foreground">ID Card:</span> <span className="font-medium">{formData.idCardFile ? "✓ Uploaded" : "Not uploaded"}</span></p>
                <p><span className="text-muted-foreground">Bank IBAN:</span> <span className="font-medium">{formData.bankIBAN || "Not provided"}</span></p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Agreement checkbox */}
      <div className="flex items-start gap-3 p-4 border rounded-lg bg-background">
        <Checkbox 
          checked={agreed} 
          onCheckedChange={(checked) => setAgreed(!!checked)} 
          id="agree" 
          className="mt-0.5"
        />
        <Label htmlFor="agree" className="text-sm cursor-pointer leading-relaxed">
          I confirm that all information provided is accurate and complete. I understand that this data will be used to generate my employment contract and for compliance purposes.
        </Label>
      </div>

      {/* Security note */}
      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
        🔒 Your information is encrypted and securely stored. We comply with GDPR and local data protection regulations.
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        {onSaveDraft && (
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isProcessing}
            className="flex-1"
          >
            Save & Continue Later
          </Button>
        )}
        {isProcessing ? (
          <Button disabled className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Submitting...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={!agreed}
            className="flex-1"
          >
            Submit Details
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep4Review;
