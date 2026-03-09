/**
 * Flow 1 v7 — Policy Summary Step
 * 
 * Shows a clear summary of what Kurt will auto-handle vs escalate,
 * based on the policies configured in the previous step.
 */

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Zap, AlertTriangle, Calendar, Shield, Bell, 
  CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";
import type { F1v7_PolicyData } from "./F1v7_PolicySetupStep";

const THRESHOLD_AMOUNTS: Record<string, string> = {
  low: "€200",
  medium: "€1,000",
  high: "€5,000",
};

interface PolicySummaryProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const SummaryRow = ({ icon: Icon, label, className }: { icon: React.ElementType; label: string; className?: string }) => (
  <div className={cn("flex items-start gap-2.5 py-1.5", className)}>
    <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
    <span className="text-xs leading-relaxed">{label}</span>
  </div>
);

const F1v7_PolicySummary = ({ formData, onComplete, isProcessing }: PolicySummaryProps) => {
  const policy = formData as F1v7_PolicyData;
  
  const getThresholdLabel = (level: string, customAmount?: string) => {
    if (level === "custom") return `€${customAmount || "0"}`;
    return THRESHOLD_AMOUNTS[level] || "€1,000";
  };

  const autoItems = [
    `Run ${policy?.payrollCycle || "monthly"} payroll cycle — payout on the ${
      policy?.payrollCycle === "fortnightly" 
        ? `${policy?.fortnightlyPayoutDays?.[0] || "15"}th & ${policy?.fortnightlyPayoutDays?.[1] || "30"}th` 
        : `${policy?.monthlyPayoutDay || "30"}th`
    }`,
    `Auto-approve adjustments up to ${getThresholdLabel(policy?.adjustmentThreshold || "medium", policy?.adjustmentCustomAmount)}`,
    `Auto-approve expenses up to ${getThresholdLabel(policy?.expenseThreshold || "medium", policy?.expenseCustomAmount)}`,
    ...(policy?.contractTemplateApproval === "pre-approved" ? ["Apply pre-approved contract templates automatically"] : []),
    ...(policy?.leaveRules === "standard-caps" ? ["Enforce standard country leave caps"] : []),
    "Process FX conversions at market rate",
    "Generate compliance documents per country",
  ];

  const escalateItems = [
    `Adjustments exceeding ${getThresholdLabel(policy?.adjustmentThreshold || "medium", policy?.adjustmentCustomAmount)}`,
    `Expenses exceeding ${getThresholdLabel(policy?.expenseThreshold || "medium", policy?.expenseCustomAmount)}`,
    ...(policy?.contractTemplateApproval === "review-each" ? ["Each new contract for admin review"] : []),
    ...(policy?.leaveRules === "custom-caps" ? ["Leave requests against custom company caps"] : []),
    "Policy breaches or unusual deltas",
    "Missing worker information",
    "Edge cases requiring human judgment",
  ];

  const handleFinish = () => {
    onComplete("policy_summary", { confirmed: true });
  };

  return (
    <div className="space-y-5 w-full sm:max-w-xl sm:mx-auto px-1 sm:px-0">
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-1"
      >
        <p className="text-xs text-muted-foreground">
          Here's how your agent will operate for this client
        </p>
      </motion.div>

      {/* Auto section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="v7-glass-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/[0.08] flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Kurt will auto-handle</p>
            <p className="text-[10px] text-muted-foreground">Runs in the background within your guardrails</p>
          </div>
        </div>
        <div className="space-y-0.5">
          {autoItems.map((item, i) => (
            <SummaryRow key={i} icon={CheckCircle2} label={item} className="text-foreground/80" />
          ))}
        </div>
      </motion.div>

      {/* Escalate section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="v7-glass-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-foreground/[0.05] flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-foreground/35" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Kurt will escalate</p>
            <p className="text-[10px] text-muted-foreground">You'll be asked to review and decide</p>
          </div>
        </div>
        <div className="space-y-0.5">
          {escalateItems.map((item, i) => (
            <SummaryRow key={i} icon={ArrowRight} label={item} className="text-muted-foreground" />
          ))}
        </div>
      </motion.div>

      {/* Delivery preferences */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="v7-glass-item rounded-xl p-3 space-y-2"
      >
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">How you'll hear from Kurt</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
            {policy?.notificationChannel === "both" ? "In-app + email" : policy?.notificationChannel === "in-app" ? "In-app only" : "Email only"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
            {policy?.notificationFrequency === "digest" ? "Daily digest" : "Immediate alerts"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
            {policy?.escalationScope === "admin-plus-backup" ? "Admin + backup approver" : "Admin only"}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
            {policy?.bundlePreference === "daily-digest" ? "Bundled decisions" : "Per-event decisions"}
          </div>
        </div>
      </motion.div>

      {/* Editable later note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"
      >
        <Sparkles className="h-3 w-3" />
        <span>You can update these rules anytime in Settings → Policies & Approvals</span>
      </motion.div>

      <Button 
        onClick={handleFinish} 
        size="lg" 
        className="w-full bg-primary hover:bg-primary/90" 
        disabled={isProcessing}
      >
        {isProcessing ? "Setting up..." : "Confirm & add client"}
      </Button>
    </div>
  );
};

export default F1v7_PolicySummary;
