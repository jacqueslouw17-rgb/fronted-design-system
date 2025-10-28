import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bot } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { CompliancePreviewCard } from "./CompliancePreviewCard";
import { toast } from "sonner";
import { AgentHeader } from "@/components/agent/AgentHeader";

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success("Contract details validated successfully");
      onNext();
    }
  };

  // Mock data for pipeline view
  const mockContractors = [
    {
      id: "1",
      name: candidate.name,
      country: candidate.country,
      countryFlag: candidate.flag,
      role: candidate.role,
      salary: candidate.salary,
      status: "drafting" as const,
    },
    {
      id: "2",
      name: "Maria Santos",
      country: "Philippines",
      countryFlag: "🇵🇭",
      role: "Backend Developer",
      salary: "$4,500/mo",
      status: "data-pending" as const,
    },
    {
      id: "3",
      name: "Liam Chen",
      country: "Singapore",
      countryFlag: "🇸🇬",
      role: "Product Designer",
      salary: "$6,200/mo",
      status: "awaiting-signature" as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 pb-8 pt-4 max-w-7xl mx-auto space-y-6"
    >
      <AgentHeader
        title="Contract Drafting in Progress"
        subtitle={`${candidate.name} • ${candidate.role} • ${candidate.country}`}
        showPulse={true}
        isActive={false}
      />

      {/* Progress indicator - only show if multiple candidates */}
      {totalCandidates > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Candidate
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold text-foreground">
                {currentIndex + 1}
              </span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {totalCandidates}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalCandidates }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-primary'
                    : idx < currentIndex
                    ? 'w-1.5 bg-primary/40'
                    : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Contract Form View */}
      <div className="space-y-6">{/* ... keep existing code */}

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
          {currentIndex + 1 === totalCandidates 
            ? "Next: Review Contract Bundle" 
            : "Review Next Candidate"}
        </Button>
      </div>
      </div>
    </motion.div>
  );
};
