/**
 * Flow 3 – Candidate Onboarding v2
 * Step 4: Payroll Details
 * 
 * DETACHED CLONE of v1 - changes here do NOT affect v1
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { bankDetailsSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { toast } from "sonner";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep4Payroll_v2 = ({ formData, onComplete, isProcessing, isLoadingFields }: Step4Props) => {
  const isContractor = formData.employmentType === "contractor";
  
  const [data, setData] = useState({
    bankName: formData.bankName || "",
    accountNumber: formData.accountNumber || "",
    swiftBic: formData.swiftBic || "",
    iban: formData.iban || "",
    payAcknowledged: formData.payAcknowledged || false,
    invoiceRuleConfirmed: formData.invoiceRuleConfirmed || false
  });

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleContinue = () => {
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
          Enter your bank details to receive salary payments.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            value={data.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            placeholder="e.g., BDO, BPI, Wells Fargo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number / IBAN *</Label>
          <Input
            id="accountNumber"
            value={data.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
            placeholder="Enter your account number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="swiftBic">SWIFT / BIC Code</Label>
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

export default WorkerStep4Payroll_v2;