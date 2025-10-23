import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, AlertCircle } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { CompliancePreviewCard } from "./CompliancePreviewCard";
import { toast } from "sonner";

interface ContractCreationScreenProps {
  candidate: Candidate;
  onNext: () => void;
  currentIndex?: number;
  totalCandidates?: number;
}

export const ContractCreationScreen: React.FC<ContractCreationScreenProps> = ({
  candidate,
  onNext,
  currentIndex = 0,
  totalCandidates = 1,
}) => {
  const defaultEmploymentType = candidate.employmentType || "contractor";
  const [employmentType, setEmploymentType] = useState<"employee" | "contractor">(defaultEmploymentType);
  const [contractData, setContractData] = useState({
    fullName: candidate.name,
    email: candidate.email || "",
    role: candidate.role,
    startDate: candidate.startDate || "",
    salary: candidate.salary,
    country: candidate.country,
    workLocation: "Remote",
    workHours: employmentType === "employee" ? "40 hours/week" : "Flexible",
    socialId: "",
    employerEntity: candidate.countryCode === "PH" ? "Fronted PH" : "Fronted NO",
    optionalClauses: "",
    variablePay: "",
    paymentSchedule: "Monthly",
    customAttachments: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!contractData.salary) {
      newErrors.salary = "Salary is required";
    }
    
    if (!contractData.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const startDate = new Date(contractData.startDate);
      const today = new Date();
      if (startDate < today) {
        // Genie confirmation for past dates
        toast.warning("This start date looks in the past. Did you mean a future date?", {
          duration: 5000,
          action: {
            label: "Correct it",
            onClick: () => {},
          },
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (handleValidate()) {
      toast.success("Contract details validated successfully");
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{candidate.flag}</span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Contract Creation</h1>
              <Badge variant={employmentType === "employee" ? "default" : "secondary"} className="text-sm">
                {employmentType === "employee" ? "Employee" : "Contractor"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{candidate.name} • {candidate.role} • {candidate.country}</p>
          </div>
        </div>
        {totalCandidates > 1 && (
          <Badge variant="outline" className="text-sm">
            Candidate {currentIndex + 1} of {totalCandidates}
          </Badge>
        )}
      </div>

      {/* Genie Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
      >
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-primary mt-0.5" />
          <p className="text-sm text-foreground">
            I've pre-filled the contract details from the onboarding form. Review and adjust as needed, then I'll generate the contract bundle.
          </p>
        </div>
      </motion.div>

      {/* Employment Type Toggle */}
      <Card className="p-6 space-y-6">
        {/* Auto-populated fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Legal Name</Label>
            <Input
              value={contractData.fullName}
              onChange={(e) => setContractData({ ...contractData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={contractData.email}
              onChange={(e) => setContractData({ ...contractData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value={contractData.role}
              onChange={(e) => setContractData({ ...contractData, role: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Start Date
              {errors.startDate && (
                <span className="text-destructive text-xs ml-2">Required</span>
              )}
            </Label>
            <Input
              type="date"
              value={contractData.startDate}
              onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
              className={errors.startDate ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Monthly Salary / Compensation
              {errors.salary && (
                <span className="text-destructive text-xs ml-2">Required</span>
              )}
            </Label>
            <Input
              value={contractData.salary}
              onChange={(e) => setContractData({ ...contractData, salary: e.target.value })}
              className={errors.salary ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Country of Employment</Label>
            <Input value={contractData.country} disabled />
          </div>

          <div className="space-y-2">
            <Label>Work Location</Label>
            <Input
              value={contractData.workLocation}
              onChange={(e) => setContractData({ ...contractData, workLocation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Work Hours {employmentType === "contractor" && <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>}</Label>
            <Input
              value={contractData.workHours}
              onChange={(e) => setContractData({ ...contractData, workHours: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Social ID / Tax ID {employmentType === "contractor" && <Badge variant="secondary" className="ml-2 text-xs">If provided</Badge>}</Label>
            <Input
              value={contractData.socialId}
              onChange={(e) => setContractData({ ...contractData, socialId: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label>Employer Legal Entity</Label>
            <Input value={contractData.employerEntity} disabled />
          </div>
        </div>

        {/* Compliance Preview */}
        <CompliancePreviewCard
          country={candidate.country}
          countryCode={candidate.countryCode}
          flag={candidate.flag}
          employmentType={employmentType}
        />

        {/* Admin Additional Inputs */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Additional Contract Terms</h3>
          
          <div className="space-y-2">
            <Label>Optional Clauses</Label>
            <Textarea
              value={contractData.optionalClauses}
              onChange={(e) => setContractData({ ...contractData, optionalClauses: e.target.value })}
              placeholder="Add any additional clauses or terms..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Variable Pay / Bonus Config</Label>
              <Input
                value={contractData.variablePay}
                onChange={(e) => setContractData({ ...contractData, variablePay: e.target.value })}
                placeholder="e.g., 10% annual bonus"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Schedule</Label>
              <Input
                value={contractData.paymentSchedule}
                onChange={(e) => setContractData({ ...contractData, paymentSchedule: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Attachments (NDA, Policies)</Label>
            <Input
              value={contractData.customAttachments}
              onChange={(e) => setContractData({ ...contractData, customAttachments: e.target.value })}
              placeholder="e.g., NDA, Company Policy Handbook"
            />
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleNext} size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Next: Review Documents
        </Button>
      </div>
    </motion.div>
  );
};
