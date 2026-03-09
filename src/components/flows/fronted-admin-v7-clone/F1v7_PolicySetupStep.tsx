/**
 * Flow 1 v7 — Policy & Guardrails Setup Step
 * 
 * Lets Fronted admins configure what the AI agent (Kurt) can auto-handle
 * vs what needs human escalation per company.
 * 
 * Sections:
 * 1. Payroll Cycle Rules
 * 2. Approval Guardrails (thresholds)
 * 3. Exception Escalation Preferences
 * 4. Notification Preferences
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Shield, Bell, AlertTriangle, 
  ChevronDown, Zap, Users, Clock,
  MessageSquare, Mail, CheckCircle2
} from "lucide-react";

export interface PolicyData {
  // Payroll cycle
  payrollCycle: "monthly" | "fortnightly";
  monthlyPayoutDay: string;
  fortnightlyPayoutDays: [string, string];
  cutOffDaysBefore: string;
  
  // Approval thresholds
  adjustmentThreshold: "low" | "medium" | "high" | "custom";
  adjustmentCustomAmount?: string;
  expenseThreshold: "low" | "medium" | "high" | "custom";
  expenseCustomAmount?: string;
  contractTemplateApproval: "pre-approved" | "review-each";
  leaveRules: "standard-caps" | "custom-caps";
  
  // Escalation
  escalationScope: "admin-only" | "admin-plus-backup";
  backupApproverEmail?: string;
  bundlePreference: "immediate" | "daily-digest";
  
  // Notifications
  notificationChannel: "in-app" | "email" | "both";
  notificationFrequency: "immediate" | "digest";
}

const DEFAULT_POLICY: PolicyData = {
  payrollCycle: "monthly",
  monthlyPayoutDay: "30",
  fortnightlyPayoutDays: ["15", "30"],
  cutOffDaysBefore: "5",
  adjustmentThreshold: "medium",
  expenseThreshold: "medium",
  contractTemplateApproval: "pre-approved",
  leaveRules: "standard-caps",
  escalationScope: "admin-only",
  bundlePreference: "daily-digest",
  notificationChannel: "both",
  notificationFrequency: "digest",
};

const THRESHOLD_PRESETS = {
  low: { label: "Tight control", description: "Auto-approve up to €200", amount: "200" },
  medium: { label: "Balanced", description: "Auto-approve up to €1,000", amount: "1000" },
  high: { label: "Hands-off", description: "Auto-approve up to €5,000", amount: "5000" },
  custom: { label: "Custom", description: "Set your own limit", amount: "" },
};

interface PolicySetupStepProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

// Collapsible section component
const PolicySection = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  isOpen, 
  onToggle, 
  isCompleted,
  children 
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  children: React.ReactNode;
}) => (
  <div className="v7-glass-card overflow-hidden transition-all duration-300">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 text-left transition-colors"
    >
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300",
        isCompleted ? "bg-foreground/8 text-foreground/70" : isOpen ? "bg-foreground/6 text-foreground/60" : "bg-muted/40 text-muted-foreground/60"
      )}>
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className={cn("h-4 w-4 transition-colors", isOpen ? "text-foreground/50" : "text-muted-foreground/40")} />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Toggle pill selector
const PillSelect = <T extends string>({ 
  options, 
  value, 
  onChange,
  columns = 2
}: { 
  options: { value: T; label: string; description?: string; icon?: React.ElementType }[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) => (
  <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4")}>
    {options.map(opt => {
      const Icon = opt.icon;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative flex flex-col items-start gap-1 rounded-xl p-3 text-left transition-all duration-200 border",
            value === opt.value
              ? "border-primary/30 bg-primary/[0.06] shadow-sm"
              : "border-border/40 bg-background/40 hover:border-border/60 hover:bg-background/60"
          )}
        >
          {value === opt.value && (
            <motion.div
              layoutId="pill-indicator"
              className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"
              transition={{ duration: 0.2 }}
            />
          )}
          {Icon && <Icon className={cn("h-3.5 w-3.5", value === opt.value ? "text-primary" : "text-muted-foreground")} />}
          <span className={cn("text-xs font-semibold", value === opt.value ? "text-foreground" : "text-muted-foreground")}>{opt.label}</span>
          {opt.description && <span className="text-[10px] text-muted-foreground leading-tight">{opt.description}</span>}
        </button>
      );
    })}
  </div>
);

// Threshold card selector
const ThresholdSelector = ({
  label,
  value,
  customAmount,
  onChange,
  onCustomAmountChange,
}: {
  label: string;
  value: "low" | "medium" | "high" | "custom";
  customAmount?: string;
  onChange: (v: "low" | "medium" | "high" | "custom") => void;
  onCustomAmountChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-xs font-medium">{label}</Label>
    <div className="grid grid-cols-4 gap-1.5">
      {(["low", "medium", "high", "custom"] as const).map(key => {
        const preset = THRESHOLD_PRESETS[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg p-2 text-center transition-all duration-200 border",
              value === key
                ? "border-primary/30 bg-primary/[0.06]"
                : "border-border/30 bg-background/30 hover:bg-background/50"
            )}
          >
            <span className={cn("text-[10px] font-semibold", value === key ? "text-primary" : "text-muted-foreground")}>{preset.label}</span>
            {key !== "custom" && <span className="text-[9px] text-muted-foreground">≤ €{preset.amount}</span>}
          </button>
        );
      })}
    </div>
    {value === "custom" && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="flex items-center gap-2"
      >
        <span className="text-xs text-muted-foreground">Auto-approve up to €</span>
        <Input
          type="number"
          value={customAmount || ""}
          onChange={e => onCustomAmountChange(e.target.value)}
          placeholder="2500"
          className="w-24 h-8 text-xs"
        />
      </motion.div>
    )}
  </div>
);

const F1v7_PolicySetupStep = ({ formData, onComplete, isProcessing }: PolicySetupStepProps) => {
  const [policy, setPolicy] = useState<PolicyData>(() => ({
    ...DEFAULT_POLICY,
    ...formData,
  }));
  const [openSection, setOpenSection] = useState<string>("payroll");

  const updatePolicy = <K extends keyof PolicyData>(key: K, value: PolicyData[K]) => {
    setPolicy(prev => ({ ...prev, [key]: value }));
  };

  const sectionComplete = {
    payroll: true, // always has defaults
    approvals: true,
    escalation: policy.escalationScope === "admin-plus-backup" ? !!policy.backupApproverEmail : true,
    notifications: true,
  };

  const allComplete = Object.values(sectionComplete).every(Boolean);

  const handleContinue = () => {
    onComplete("policy_setup", policy as any);
  };

  return (
    <div className="space-y-5 w-full sm:max-w-xl sm:mx-auto px-1 sm:px-0">
      <div className="space-y-2.5">
        {/* Section 1: Payroll Cycle */}
        <PolicySection
          icon={Calendar}
          title="Payroll cycle"
          subtitle={policy.payrollCycle === "monthly" ? `Monthly — payout on the ${policy.monthlyPayoutDay}th` : `Fortnightly — ${policy.fortnightlyPayoutDays[0]}th & ${policy.fortnightlyPayoutDays[1]}th`}
          isOpen={openSection === "payroll"}
          onToggle={() => setOpenSection(openSection === "payroll" ? "" : "payroll")}
          isCompleted={sectionComplete.payroll}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Cycle type</Label>
              <PillSelect
                options={[
                  { value: "monthly" as const, label: "Monthly", description: "Single payout per month", icon: Calendar },
                  { value: "fortnightly" as const, label: "Fortnightly", description: "Two payouts per month", icon: Clock },
                ]}
                value={policy.payrollCycle}
                onChange={v => updatePolicy("payrollCycle", v)}
              />
            </div>

            <div className="v7-glass-item rounded-lg p-3 space-y-3">
              {policy.payrollCycle === "monthly" ? (
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Payout day</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={policy.monthlyPayoutDay}
                      onChange={e => updatePolicy("monthlyPayoutDay", e.target.value)}
                      className="w-16 h-7 text-xs text-center"
                    />
                    <span className="text-[10px] text-muted-foreground">of each month</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">First payout</Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={policy.fortnightlyPayoutDays[0]}
                        onChange={e => updatePolicy("fortnightlyPayoutDays", [e.target.value, policy.fortnightlyPayoutDays[1]])}
                        className="w-16 h-7 text-xs text-center"
                      />
                      <span className="text-[10px] text-muted-foreground">of each month</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Second payout</Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={policy.fortnightlyPayoutDays[1]}
                        onChange={e => updatePolicy("fortnightlyPayoutDays", [policy.fortnightlyPayoutDays[0], e.target.value])}
                        className="w-16 h-7 text-xs text-center"
                      />
                      <span className="text-[10px] text-muted-foreground">of each month</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <Label className="text-xs">Cut-off before payout</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={policy.cutOffDaysBefore}
                    onChange={e => updatePolicy("cutOffDaysBefore", e.target.value)}
                    className="w-16 h-7 text-xs text-center"
                  />
                  <span className="text-[10px] text-muted-foreground">business days</span>
                </div>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* Section 2: Approval Guardrails */}
        <PolicySection
          icon={Shield}
          title="Approval guardrails"
          subtitle="Thresholds for auto-approvals vs escalation"
          isOpen={openSection === "approvals"}
          onToggle={() => setOpenSection(openSection === "approvals" ? "" : "approvals")}
          isCompleted={sectionComplete.approvals}
        >
          <div className="space-y-4">
            <ThresholdSelector
              label="Adjustment threshold"
              value={policy.adjustmentThreshold}
              customAmount={policy.adjustmentCustomAmount}
              onChange={v => updatePolicy("adjustmentThreshold", v)}
              onCustomAmountChange={v => updatePolicy("adjustmentCustomAmount", v)}
            />

            <ThresholdSelector
              label="Expense threshold"
              value={policy.expenseThreshold}
              customAmount={policy.expenseCustomAmount}
              onChange={v => updatePolicy("expenseThreshold", v)}
              onCustomAmountChange={v => updatePolicy("expenseCustomAmount", v)}
            />

            <div className="space-y-2">
              <Label className="text-xs font-medium">Contract templates</Label>
              <PillSelect
                options={[
                  { value: "pre-approved" as const, label: "Pre-approved", description: "Standard clauses auto-applied", icon: Zap },
                  { value: "review-each" as const, label: "Review each", description: "Admin reviews every contract", icon: Users },
                ]}
                value={policy.contractTemplateApproval}
                onChange={v => updatePolicy("contractTemplateApproval", v)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Leave rules</Label>
              <PillSelect
                options={[
                  { value: "standard-caps" as const, label: "Standard caps", description: "Country-default leave entitlements" },
                  { value: "custom-caps" as const, label: "Custom caps", description: "Company-specific leave policies" },
                ]}
                value={policy.leaveRules}
                onChange={v => updatePolicy("leaveRules", v)}
              />
            </div>
          </div>
        </PolicySection>

        {/* Section 3: Escalation Preferences */}
        <PolicySection
          icon={AlertTriangle}
          title="Escalation preferences"
          subtitle={policy.escalationScope === "admin-only" ? "Admin only" : "Admin + backup approver"}
          isOpen={openSection === "escalation"}
          onToggle={() => setOpenSection(openSection === "escalation" ? "" : "escalation")}
          isCompleted={sectionComplete.escalation}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Escalation path</Label>
              <PillSelect
                options={[
                  { value: "admin-only" as const, label: "Admin only", description: "All escalations go to admin", icon: Users },
                  { value: "admin-plus-backup" as const, label: "Admin + backup", description: "Fallback approver when admin is away", icon: Shield },
                ]}
                value={policy.escalationScope}
                onChange={v => updatePolicy("escalationScope", v)}
              />
            </div>

            <AnimatePresence>
              {policy.escalationScope === "admin-plus-backup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-xs font-medium">Backup approver email</Label>
                  <Input
                    type="email"
                    value={policy.backupApproverEmail || ""}
                    onChange={e => updatePolicy("backupApproverEmail", e.target.value)}
                    placeholder="backup@company.com"
                    className="text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Approval bundling</Label>
              <PillSelect
                options={[
                  { value: "immediate" as const, label: "Per event", description: "Escalate as things happen", icon: Zap },
                  { value: "daily-digest" as const, label: "Daily digest", description: "Bundle into one daily review", icon: Clock },
                ]}
                value={policy.bundlePreference}
                onChange={v => updatePolicy("bundlePreference", v)}
              />
            </div>
          </div>
        </PolicySection>

        {/* Section 4: Notifications */}
        <PolicySection
          icon={Bell}
          title="Notifications"
          subtitle={`${policy.notificationChannel === "both" ? "In-app + email" : policy.notificationChannel === "in-app" ? "In-app only" : "Email only"} · ${policy.notificationFrequency === "digest" ? "Digest" : "Immediate"}`}
          isOpen={openSection === "notifications"}
          onToggle={() => setOpenSection(openSection === "notifications" ? "" : "notifications")}
          isCompleted={sectionComplete.notifications}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Where to notify</Label>
              <PillSelect
                columns={3}
                options={[
                  { value: "in-app" as const, label: "In-app", icon: MessageSquare },
                  { value: "email" as const, label: "Email", icon: Mail },
                  { value: "both" as const, label: "Both", icon: Bell },
                ]}
                value={policy.notificationChannel}
                onChange={v => updatePolicy("notificationChannel", v)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Frequency</Label>
              <PillSelect
                options={[
                  { value: "immediate" as const, label: "Immediate", description: "Real-time notifications", icon: Zap },
                  { value: "digest" as const, label: "Daily digest", description: "One summary per day", icon: Clock },
                ]}
                value={policy.notificationFrequency}
                onChange={v => updatePolicy("notificationFrequency", v)}
              />
            </div>
          </div>
        </PolicySection>
      </div>

      <Button 
        onClick={handleContinue} 
        size="lg" 
        className="w-full bg-primary hover:bg-primary/90" 
        disabled={isProcessing || !allComplete}
      >
        {isProcessing ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
};

export default F1v7_PolicySetupStep;
export type { PolicyData as F1v7_PolicyData };
