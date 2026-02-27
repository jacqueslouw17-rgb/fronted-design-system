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
import { ArrowRight, Lock } from "lucide-react";
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
  backAction?: React.ReactNode;
  allFieldsLocked?: boolean;
  hideHeader?: boolean;
  hideButtons?: boolean;
  showContactNotice?: boolean;
}

const WorkerStep4BankDetails_v2 = ({ formData, onComplete, isProcessing, buttonText, backAction, allFieldsLocked, hideHeader, hideButtons, showContactNotice }: Step4Props) => {
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
        className="space-y-5 sm:space-y-6 p-3 sm:p-6"
      >
        {!hideHeader && (
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold">Bank Details</h3>
          <p className="text-sm text-muted-foreground">
            Enter your bank details so we can process your payments.
          </p>
        </div>
        )}

        <div className="space-y-4">
          {/* Bank Country */}
          <div className="space-y-2">
            <Label htmlFor="bankCountry" className={allFieldsLocked ? "flex items-center gap-2" : ""}>
              Bank country
              {allFieldsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            {allFieldsLocked ? (
              <Input value={data.bankCountry} disabled className="bg-muted/50 cursor-not-allowed" />
            ) : (
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
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className={allFieldsLocked ? "flex items-center gap-2" : ""}>
              Bank name
              {allFieldsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Input
              id="bankName"
              value={data.bankName}
              onChange={(e) => !allFieldsLocked && handleInputChange("bankName", e.target.value)}
              disabled={allFieldsLocked}
              className={allFieldsLocked ? "bg-muted/50 cursor-not-allowed" : ""}
              placeholder="e.g., BDO, BPI, Wells Fargo"
            />
          </div>

          {/* Account Holder */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder" className={allFieldsLocked ? "flex items-center gap-2" : ""}>
              Account holder
              {allFieldsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Input
              id="accountHolder"
              value={data.accountHolder}
              onChange={(e) => !allFieldsLocked && handleInputChange("accountHolder", e.target.value)}
              disabled={allFieldsLocked}
              className={allFieldsLocked ? "bg-muted/50 cursor-not-allowed" : ""}
              placeholder="Full name on the account"
            />
          </div>

          {/* Account Number / IBAN */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className={allFieldsLocked ? "flex items-center gap-2" : ""}>
              Account number / IBAN
              {allFieldsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Input
              id="accountNumber"
              value={data.accountNumber}
              onChange={(e) => !allFieldsLocked && handleInputChange("accountNumber", e.target.value)}
              disabled={allFieldsLocked}
              className={allFieldsLocked ? "bg-muted/50 cursor-not-allowed" : ""}
              placeholder="Enter your account number"
            />
          </div>

          {/* SWIFT / BIC */}
          <div className="space-y-2">
            <Label htmlFor="swiftBic" className={allFieldsLocked ? "flex items-center gap-2" : ""}>
              SWIFT / BIC (optional)
              {allFieldsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Input
              id="swiftBic"
              value={data.swiftBic}
              onChange={(e) => !allFieldsLocked && handleInputChange("swiftBic", e.target.value)}
              disabled={allFieldsLocked}
              className={allFieldsLocked ? "bg-muted/50 cursor-not-allowed" : ""}
              placeholder="For international payments"
            />
          </div>
        </div>

        {/* Payment schedule info */}
        {!allFieldsLocked && (
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Payment Schedule</h4>
          <p className="text-sm text-muted-foreground">
            Salary is paid monthly on the last business day of each month. Your first payment will be prorated based on your start date.
          </p>
        </div>
        )}

        {/* Payment acknowledgement */}
        {!allFieldsLocked && (
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
        )}

        {!hideButtons && (
        <div className={backAction ? "flex items-center gap-2" : ""}>
          {backAction}
          <Button
            onClick={handleContinue}
            disabled={!isValid || isProcessing}
            className={backAction ? "" : "w-full"}
            size={backAction ? "sm" : "lg"}
          >
            {isProcessing ? "Saving..." : (buttonText || "Continue")}
            {!buttonText && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep4BankDetails_v2;
