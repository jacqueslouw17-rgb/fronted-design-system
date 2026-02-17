/**
 * Flow 3 – Candidate Onboarding v2
 * Step 4: Bank Details
 * 
 * Mirrors Flow 1 v4 "Payout Destination" as editable inputs.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bankDetailsSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
}

const WorkerStep4BankDetails_v2 = ({ formData, onComplete, isProcessing, buttonText }: Step4Props) => {
  const [data, setData] = useState({
    bankCountry: formData.bankCountry || formData.country || "",
    bankName: formData.bankName || "",
    accountHolder: formData.accountHolder || formData.fullName || formData.workerName || "",
    accountNumber: formData.accountNumber || "",
    swiftBic: formData.swiftBic || "",
    payAcknowledged: formData.payAcknowledged || false,
  });

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleContinue = () => {
    try {
      bankDetailsSchema.parse({
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        swiftBic: data.swiftBic,
        iban: data.accountNumber,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    onComplete("bank_details", data);
  };

  const isValid = data.bankName && data.accountNumber && data.accountHolder && data.payAcknowledged;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="space-y-6 p-4 sm:p-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Bank Details</h3>
          <p className="text-sm text-muted-foreground">
            Enter your bank details so we can process your payments.
          </p>
        </div>

        <div className="space-y-4">
          {/* Bank Country */}
          <div className="space-y-2">
            <Label htmlFor="bankCountry">Bank country</Label>
            <Select value={data.bankCountry} onValueChange={(value) => setData({ ...data, bankCountry: value })}>
              <SelectTrigger id="bankCountry">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                <SelectItem value="Norway">🇳🇴 Norway</SelectItem>
                <SelectItem value="India">🇮🇳 India</SelectItem>
                <SelectItem value="United States">🇺🇸 United States</SelectItem>
                <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank name</Label>
            <Input
              id="bankName"
              value={data.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              placeholder="e.g., BDO, BPI, Wells Fargo"
            />
          </div>

          {/* Account Holder */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account holder</Label>
            <Input
              id="accountHolder"
              value={data.accountHolder}
              onChange={(e) => handleInputChange("accountHolder", e.target.value)}
              placeholder="Full name on the account"
            />
          </div>

          {/* Account Number / IBAN */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account number / IBAN</Label>
            <Input
              id="accountNumber"
              value={data.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              placeholder="Enter your account number"
            />
          </div>

          {/* SWIFT / BIC */}
          <div className="space-y-2">
            <Label htmlFor="swiftBic">SWIFT / BIC (optional)</Label>
            <Input
              id="swiftBic"
              value={data.swiftBic}
              onChange={(e) => handleInputChange("swiftBic", e.target.value)}
              placeholder="For international payments"
            />
          </div>
        </div>

        {/* Payment schedule info */}
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Payment Schedule</h4>
          <p className="text-sm text-muted-foreground">
            Salary is paid monthly on the last business day of each month. Your first payment will be prorated based on your start date.
          </p>
        </div>

        {/* Payment acknowledgement */}
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
            I confirm my bank details are correct and acknowledge the payment schedule
          </label>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isValid || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Saving..." : (buttonText || "Continue")}
          {!buttonText && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep4BankDetails_v2;
