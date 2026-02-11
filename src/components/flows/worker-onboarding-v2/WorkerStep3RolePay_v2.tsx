/**
 * Flow 3 – Candidate Onboarding v2
 * Step 3: Role & Pay
 * 
 * Mirrors Flow 1 v4 "Working Engagement" + "Payroll Parameters" as read-only confirmation.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep3RolePay_v2 = ({ formData, onComplete, isProcessing }: Step3Props) => {
  const isContractor = formData.employmentType === "contractor";

  // Mock contract-driven data
  const rolePayData = {
    workerType: isContractor ? "Contractor" : "Employee",
    role: formData.role || "Senior Backend Engineer",
    startDate: formData.startDate || "November 15, 2025",
    workLocation: formData.country || "Philippines",
    salary: formData.salary || "₱85,000/month",
    payFrequency: "Monthly",
    paymentSchedule: "Last business day of each month",
  };

  const handleContinue = () => {
    onComplete("role_pay", rolePayData);
  };

  const fields = [
    { label: "Worker type", value: rolePayData.workerType },
    { label: "Role", value: rolePayData.role },
    { label: "Start date", value: rolePayData.startDate },
    { label: "Work location", value: rolePayData.workLocation },
    { label: "Salary / rate", value: rolePayData.salary },
    { label: "Pay frequency", value: rolePayData.payFrequency },
    { label: "Payment schedule", value: rolePayData.paymentSchedule },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="space-y-6 p-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Role & Pay</h3>
          <p className="text-sm text-muted-foreground">
            Please confirm your role and compensation details below. These are set by your contract.
          </p>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.label} className="space-y-2">
              <Label className="flex items-center gap-2">
                {field.label}
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                value={field.value}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Saving..." : "Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep3RolePay_v2;
