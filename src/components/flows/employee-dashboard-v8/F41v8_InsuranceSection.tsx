/**
 * Flow 4.1 v9 (Future) — Insurance Section for Profile Settings
 * Read-only view of health insurance details from Kota.io
 * Mirrors the DetailRow pattern from Flow 1 v7 Future
 */

import { Shield, Lock } from "lucide-react";

interface InsuranceContribution {
  id: string;
  label: string;
  amount: number;
  type: "employer" | "employee";
}

const INSURANCE_DATA = {
  provider: "AXA Philippines",
  plan: "AXA Health Max",
  policyId: "KOT-PH-2024-4821",
  currency: "PHP",
  status: "Active",
  effectiveDate: "1 Feb 2024",
  employer_contributions: [
    { id: "er_01", label: "ER Premium", amount: 9375, type: "employer" as const },
  ],
  employee_contributions: [
    { id: "ee_01", label: "EE Premium", amount: 3125, type: "employee" as const },
  ],
};

const DetailRow = ({ label, value, muted }: { label: string; value: string; muted?: boolean }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`text-xs font-medium tabular-nums ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      {value}
    </span>
  </div>
);

const fmt = (amount: number) => `PHP ${amount.toLocaleString()}`;

export const F41v8_InsuranceSection = () => {
  const erTotal = INSURANCE_DATA.employer_contributions.reduce((s, c) => s + c.amount, 0);
  const eeTotal = INSURANCE_DATA.employee_contributions.reduce((s, c) => s + c.amount, 0);
  const totalMonthly = erTotal + eeTotal;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-[hsl(172,40%,40%)]" />
        <span className="text-xs font-medium text-[hsl(172,40%,35%)]">Active coverage</span>
      </div>

      {/* Plan details */}
      <div className="space-y-0.5">
        <DetailRow label="Provider" value={INSURANCE_DATA.provider} />
        <DetailRow label="Plan" value={INSURANCE_DATA.plan} />
        <DetailRow label="Policy ID" value={INSURANCE_DATA.policyId} />
        <DetailRow label="Effective from" value={INSURANCE_DATA.effectiveDate} />
      </div>

      {/* Contributions breakdown */}
      <div className="border-t border-border/30 pt-3 space-y-0.5">
        <p className="text-[11px] text-muted-foreground/70 mb-2">Monthly contributions</p>
        {INSURANCE_DATA.employer_contributions.map((c) => (
          <DetailRow key={c.id} label={c.label} value={fmt(c.amount)} />
        ))}
        {INSURANCE_DATA.employee_contributions.map((c) => (
          <DetailRow key={c.id} label={c.label} value={`−${fmt(c.amount)}`} muted />
        ))}
        <div className="flex items-center justify-between py-1.5 border-t border-border/40 mt-1 pt-2">
          <span className="text-xs text-muted-foreground font-medium">Total monthly</span>
          <span className="text-xs font-semibold text-foreground tabular-nums">{fmt(totalMonthly)}</span>
        </div>
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/20">
        <Lock className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground/70">
          Insurance details are managed by your employer. Contact your Fronted admin for changes.
        </p>
      </div>
    </div>
  );
};
