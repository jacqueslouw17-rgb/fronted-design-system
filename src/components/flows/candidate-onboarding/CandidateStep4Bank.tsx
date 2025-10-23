import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep4Bank = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step4Props) => {
  const [data, setData] = useState({
    accountHolder: formData.accountHolder || "",
    iban: formData.iban || "",
    swift: formData.swift || "",
    currency: formData.currency || ""
  });

  // Auto-fill currency based on tax country
  useEffect(() => {
    if (formData.taxCountry && !data.currency) {
      const currencyMap: Record<string, string> = {
        NO: "NOK",
        PH: "PHP",
        IN: "INR",
        US: "USD",
        GB: "GBP"
      };
      setData(prev => ({ ...prev, currency: currencyMap[formData.taxCountry] || "USD" }));
    }
  }, [formData.taxCountry, data.currency]);

  const handleContinue = () => {
    onComplete("bank_details", data);
  };

  const isValid = data.accountHolder && (data.iban || data.swift) && data.currency;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Bank Account Details</h3>
        <p className="text-sm text-muted-foreground">
          We'll use this information to process your salary payments securely.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name *</Label>
            <Input
              id="accountHolder"
              value={data.accountHolder}
              onChange={(e) => setData({ ...data, accountHolder: e.target.value })}
              placeholder="Full name as shown on bank account"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">IBAN or Account Number *</Label>
            <Input
              id="iban"
              value={data.iban}
              onChange={(e) => setData({ ...data, iban: e.target.value })}
              placeholder="Enter IBAN or account number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swift">SWIFT/BIC Code</Label>
            <Input
              id="swift"
              value={data.swift}
              onChange={(e) => setData({ ...data, swift: e.target.value })}
              placeholder="Optional for local transfers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Payment Currency *</Label>
            <Select value={data.currency} onValueChange={(value) => setData({ ...data, currency: value })}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-filled based on your tax country. You can change this if needed.
            </p>
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

export default CandidateStep4Bank;
