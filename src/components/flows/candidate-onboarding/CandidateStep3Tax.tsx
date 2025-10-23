import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep3Tax = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step3Props) => {
  const [data, setData] = useState({
    taxCountry: formData.taxCountry || "",
    taxNumber: formData.taxNumber || ""
  });

  const getTaxHelper = (country: string) => {
    const helpers: Record<string, string> = {
      NO: "Enter your Norwegian Tax Identification Number (TIN)",
      PH: "Enter your Philippine Tax Identification Number (TIN)",
      IN: "Enter your Permanent Account Number (PAN)",
      US: "Enter your Social Security Number (SSN) or Tax ID",
      GB: "Enter your National Insurance Number (NINO)"
    };
    return helpers[country] || "Enter your local tax identification number";
  };

  const handleContinue = () => {
    onComplete("tax_residency", data);
  };

  const isValid = data.taxCountry && data.taxNumber;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Tax Residency</h3>
        <p className="text-sm text-muted-foreground">
          This helps us ensure tax compliance and proper withholding.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxCountry">Country of Tax Residency *</Label>
            <Select value={data.taxCountry} onValueChange={(value) => setData({ ...data, taxCountry: value })}>
              <SelectTrigger id="taxCountry">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxNumber">Tax Identification Number *</Label>
            <Input
              id="taxNumber"
              value={data.taxNumber}
              onChange={(e) => setData({ ...data, taxNumber: e.target.value })}
              placeholder={data.taxCountry ? getTaxHelper(data.taxCountry) : "Select country first"}
            />
            {data.taxCountry && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{getTaxHelper(data.taxCountry)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        {isProcessing ? (
          <Button disabled size="lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleContinue} 
            disabled={!isValid}
            size="lg"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep3Tax;
