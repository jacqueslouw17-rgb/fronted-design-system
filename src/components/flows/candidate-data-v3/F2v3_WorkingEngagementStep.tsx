/**
 * Flow 2 v3 — Step 2: Working Engagement (Future)
 * 
 * Glass-styled working engagement step for Flow 2 v3 only.
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Building2, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CountryRule {
  probation: { default: number; unit: string };
  noticePeriod: { default: number; unit: string };
  annualLeave: { default: number; unit: string };
  sickLeave: { default: number; unit: string };
  weeklyHours: { default: number; unit: string };
  payFrequency: string;
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  Philippines: { probation: { default: 180, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 5, unit: "days" }, sickLeave: { default: 5, unit: "days" }, weeklyHours: { default: 48, unit: "hours" }, payFrequency: "Fortnightly" },
  Norway: { probation: { default: 180, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 25, unit: "days" }, sickLeave: { default: 365, unit: "days" }, weeklyHours: { default: 37.5, unit: "hours" }, payFrequency: "Monthly" },
  Sweden: { probation: { default: 180, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 25, unit: "days" }, sickLeave: { default: 365, unit: "days" }, weeklyHours: { default: 40, unit: "hours" }, payFrequency: "Monthly" },
  India: { probation: { default: 90, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 21, unit: "days" }, sickLeave: { default: 12, unit: "days" }, weeklyHours: { default: 48, unit: "hours" }, payFrequency: "Monthly" },
  Kosovo: { probation: { default: 180, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 20, unit: "days" }, sickLeave: { default: 20, unit: "days" }, weeklyHours: { default: 40, unit: "hours" }, payFrequency: "Monthly" },
  Denmark: { probation: { default: 90, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 25, unit: "days" }, sickLeave: { default: 365, unit: "days" }, weeklyHours: { default: 37, unit: "hours" }, payFrequency: "Monthly" },
  Singapore: { probation: { default: 90, unit: "days" }, noticePeriod: { default: 30, unit: "days" }, annualLeave: { default: 7, unit: "days" }, sickLeave: { default: 14, unit: "days" }, weeklyHours: { default: 44, unit: "hours" }, payFrequency: "Monthly" },
  Spain: { probation: { default: 60, unit: "days" }, noticePeriod: { default: 15, unit: "days" }, annualLeave: { default: 22, unit: "days" }, sickLeave: { default: 365, unit: "days" }, weeklyHours: { default: 40, unit: "hours" }, payFrequency: "Monthly" },
  Romania: { probation: { default: 90, unit: "days" }, noticePeriod: { default: 20, unit: "days" }, annualLeave: { default: 20, unit: "days" }, sickLeave: { default: 183, unit: "days" }, weeklyHours: { default: 40, unit: "hours" }, payFrequency: "Monthly" },
};

const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Lock className="h-3 w-3" />
      {label}
    </Label>
    <Input value={value} disabled className="bg-white/40 text-muted-foreground/80 cursor-not-allowed border-primary/10 text-sm backdrop-blur-sm" />
  </div>
);

const EntitlementRow = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg v7-glass-item">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-medium text-foreground/80">{value}{unit ? ` ${unit}` : ''}</span>
  </div>
);

interface F2v3WorkingEngagementStepProps {
  formData: Record<string, any>;
  prefilled: { role: string; employmentType: string; startDate: string; salary: string; country: string; companyName: string };
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const F2v3_WorkingEngagementStep: React.FC<F2v3WorkingEngagementStepProps> = ({ formData, prefilled, onComplete, isProcessing }) => {
  const countryRule = COUNTRY_RULES[prefilled.country];
  const [workLocation, setWorkLocation] = useState(formData.workLocation || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-5 w-full sm:max-w-xl sm:mx-auto px-1 sm:px-0"
    >
      <div className="v7-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <LockedField label="Role" value={prefilled.role} />

        <div className="grid grid-cols-2 gap-3">
          <LockedField label="Employment Type" value={prefilled.employmentType} />
          <LockedField label="Start Date" value={prefilled.startDate} />
        </div>

        <LockedField label={prefilled.employmentType === "Contractor" ? "Consultancy Fee" : "Salary"} value={prefilled.salary} />

        <div className="border-t border-primary/10 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              Work Location
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal bg-white/40 border-primary/10">Optional</Badge>
            </Label>
            <Input
              value={workLocation}
              onChange={e => setWorkLocation(e.target.value)}
              placeholder="e.g., Manila, Oslo, Remote"
              className="bg-white/50 border-primary/10 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Terms & Entitlements */}
        {countryRule && (
          <div className="border-t border-primary/10 pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">
                Terms & Entitlements — confirmed with {prefilled.companyName} for {prefilled.country}
              </p>
            </div>
            <div className="space-y-1.5">
              <EntitlementRow label="Probation Period" value={String(countryRule.probation.default)} unit={countryRule.probation.unit} />
              <EntitlementRow label="Notice Period" value={String(countryRule.noticePeriod.default)} unit={countryRule.noticePeriod.unit} />
              <EntitlementRow label="Annual Leave" value={String(countryRule.annualLeave.default)} unit={countryRule.annualLeave.unit} />
              <EntitlementRow label="Sick Leave" value={String(countryRule.sickLeave.default)} unit={countryRule.sickLeave.unit} />
              <EntitlementRow label="Weekly Hours" value={String(countryRule.weeklyHours.default)} unit={countryRule.weeklyHours.unit} />
              <EntitlementRow label="Pay Frequency" value={countryRule.payFrequency} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 pt-2">
          <Shield className="h-3.5 w-3.5" />
          <span>GDPR Compliant • Your data is encrypted and secure</span>
        </div>
      </div>

      <button
        onClick={() => onComplete("working_engagement", { workLocation })}
        disabled={isProcessing}
        className="w-full h-12 rounded-xl text-sm font-semibold text-primary-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 bg-gradient-primary"
      >
        {isProcessing ? "Submitting..." : "Submit"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default F2v3_WorkingEngagementStep;
