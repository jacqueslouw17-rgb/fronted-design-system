import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Sparkles } from "lucide-react";
import { bankDetailsSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { toast } from "sonner";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep4Payroll = ({ formData, onComplete, isProcessing, isLoadingFields }: Step4Props) => {
  const isContractor = formData.employmentType === "contractor";
  // Check if we have persisted data (revisiting step)
  const hasPersistedData = formData && formData.bankName;
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  
  const [data, setData] = useState({
    bankName: formData.bankName || "",
    accountNumber: formData.accountNumber || "",
    swiftBic: formData.swiftBic || "",
    iban: formData.iban || "",
    payAcknowledged: formData.payAcknowledged || false,
    invoiceRuleConfirmed: formData.invoiceRuleConfirmed || false
  });

  // Auto-fill from ATS on mount for employees - ONLY if no persisted data
  useEffect(() => {
    if (!isContractor && !hasPersistedData) {
      setIsAutoFilling(true);
      // No auto TTS
      
      setTimeout(() => {
        const atsData = {
          bankName: formData.country === "Philippines" ? "BDO Unibank" : "Wells Fargo",
          accountNumber: "1234567890",
          swiftBic: formData.country === "Philippines" ? "BNORPHMM" : "WFBIUS6S",
          iban: formData.country === "Philippines" ? "" : "GB82WEST12345698765432"
        };
        
        setData(prev => ({ ...prev, ...atsData }));
        setAutoFilledFields(["bankName", "accountNumber", "swiftBic", "iban"]);
        setIsAutoFilling(false);
      }, 2000);
    } else if (hasPersistedData) {
      // Mark persisted fields
      const persistedFields = [];
      if (formData.bankName) persistedFields.push("bankName");
      if (formData.accountNumber) persistedFields.push("accountNumber");
      if (formData.swiftBic) persistedFields.push("swiftBic");
      if (formData.iban) persistedFields.push("iban");
      setAutoFilledFields(persistedFields);
    }
  }, [isContractor, formData.country, hasPersistedData, formData.bankName, formData.accountNumber, formData.swiftBic, formData.iban]);

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
    // Remove auto-fill indicator when user edits
    if (autoFilledFields.includes(field)) {
      setAutoFilledFields(autoFilledFields.filter(f => f !== field));
    }
  };

  const handleContinue = () => {
    // Only validate bank details for employees
    if (!isContractor) {
      try {
        bankDetailsSchema.parse({
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          swiftBic: data.swiftBic,
          iban: data.iban
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return;
        }
      }
    }
    onComplete("payroll", data);
  };

  const isValid = isContractor 
    ? data.invoiceRuleConfirmed 
    : (data.bankName && data.accountNumber && data.payAcknowledged);

  if (isLoadingFields || isAutoFilling) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex justify-center mb-4">
          <AudioWaveVisualizer isActive={true} />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isContractor) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Invoice Rules</h3>
          <p className="text-sm text-muted-foreground">
            As a contractor, you'll submit invoices according to your contract terms.
          </p>
        </div>

        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm">Your Invoice Schedule</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Submit invoices by the 25th of each month</li>
            <li>• Payment processed within 30 days</li>
            <li>• Include your contract reference number</li>
            <li>• Use the invoice template provided</li>
          </ul>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="invoiceConfirm"
            checked={data.invoiceRuleConfirmed}
            onCheckedChange={(checked) => 
              setData({ ...data, invoiceRuleConfirmed: checked as boolean })
            }
          />
          <label
            htmlFor="invoiceConfirm"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I understand the invoice submission rules and will follow them
          </label>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Kurt says:</strong> You'll receive an invoice template via email. Keep track of your submission deadlines!
          </p>
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
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Payroll Details</h3>
        <p className="text-sm text-muted-foreground">
          {autoFilledFields.length > 0 
            ? "Some of your details were pre-filled from your company's ATS."
            : "Enter your bank details to receive salary payments."
          }
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bankName">Bank Name *</Label>
            {autoFilledFields.includes("bankName") && (
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-filled by Kurt
              </span>
            )}
          </div>
          <Input
            id="bankName"
            value={data.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            placeholder="e.g., BDO, BPI, Wells Fargo"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="accountNumber">Account Number / IBAN *</Label>
            {autoFilledFields.includes("accountNumber") && (
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-filled by Kurt
              </span>
            )}
          </div>
          <Input
            id="accountNumber"
            value={data.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
            placeholder="Enter your account number"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="swiftBic">SWIFT / BIC Code</Label>
            {autoFilledFields.includes("swiftBic") && (
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-filled by Kurt
              </span>
            )}
          </div>
          <Input
            id="swiftBic"
            value={data.swiftBic}
            onChange={(e) => handleInputChange("swiftBic", e.target.value)}
            placeholder="For international payments"
          />
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-sm">Payment Schedule</h4>
        <p className="text-sm text-muted-foreground">
          Salary is paid on the last business day of each month. First payment prorated based on start date.
        </p>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="payAcknowledge"
          checked={data.payAcknowledged}
          onCheckedChange={(checked) => 
            setData({ ...data, payAcknowledged: checked as boolean })
          }
        />
        <label
          htmlFor="payAcknowledge"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I acknowledge the payment schedule and have entered my correct bank details
        </label>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 <strong>Kurt says:</strong> Double-check your bank details! Incorrect information can delay your first payment.
        </p>
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

export default WorkerStep4Payroll;
