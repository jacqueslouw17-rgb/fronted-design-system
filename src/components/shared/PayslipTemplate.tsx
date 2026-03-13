/**
 * PayslipTemplate - Universal EOR payslip template
 * 
 * Based on UK, NL, and DK payslip standards. Fronted-branded letterhead
 * with country-adaptive sections: employer entity, employee details,
 * earnings, deductions, year-to-date, holiday/leave, and payment info.
 */

import React from "react";
import { Separator } from "@/components/ui/separator";
import frontedLogo from "@/assets/fronted-logo.png";

// ─── Types ───────────────────────────────────────────────────────────

export interface PayslipEmployer {
  entityName: string;       // e.g. "Fronted Denmark ApS", "Fronted Consultancy Netherlands BV"
  registrationId: string;   // CVR, KvK, Company Reg No etc.
  registrationLabel: string;// "CVR no.", "KvK", "Company Reg."
  address: string;
  country: string;
}

export interface PayslipEmployee {
  name: string;
  employeeNo: string;
  department: string;
  jobTitle: string;
  startDate: string;
  contractType: string;     // "Permanent", "Fixed-term"
  hoursPerWeek: number;
  bankAccount: string;      // masked e.g. "****4521" or "NL70****7875"
  taxCode?: string;         // UK-specific
  nationalInsuranceNo?: string; // UK-specific (masked)
}

export interface PayslipLineItem {
  label: string;
  amount: number;
  rate?: string;            // e.g. "8%", "38%"
  basis?: number;           // base amount it's calculated on
}

export interface PayslipYTD {
  label: string;
  amount: number;
}

export interface PayslipHoliday {
  label: string;
  earned: number;
  taken: number;
  balance: number;
  unit: string;             // "days" or currency code
}

export interface PayslipData {
  employer: PayslipEmployer;
  employee: PayslipEmployee;
  period: {
    label: string;          // e.g. "January 2026", "2026-2-M"
    startDate: string;
    endDate: string;
    paymentDate: string;
  };
  currency: string;
  currencySymbol: string;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  employerCosts?: PayslipLineItem[];
  ytd?: PayslipYTD[];
  holidays?: PayslipHoliday[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  totalEmployerCosts?: number;
  referenceNo: string;
  generatedDate: string;
  confidential?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const fmt = (amount: number, symbol: string) =>
  `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Sub-components ──────────────────────────────────────────────────

const Letterhead: React.FC<{ employer: PayslipEmployer; period: string }> = ({ employer, period }) => (
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <img src={frontedLogo} alt="Fronted" className="h-6 w-auto" />
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Payslip</p>
        <p className="text-xs text-muted-foreground">{period}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-medium text-foreground">{employer.entityName}</p>
      <p className="text-[10px] text-muted-foreground">{employer.address}</p>
      <p className="text-[10px] text-muted-foreground">
        {employer.registrationLabel}: {employer.registrationId}
      </p>
    </div>
  </div>
);

const InfoGrid: React.FC<{ items: { label: string; value: string }[] }> = ({ items }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
    {items.map((item, i) => (
      <div key={i} className="flex justify-between text-xs">
        <span className="text-muted-foreground">{item.label}</span>
        <span className="font-medium text-foreground tabular-nums">{item.value}</span>
      </div>
    ))}
  </div>
);

const LineItemsTable: React.FC<{
  title: string;
  items: PayslipLineItem[];
  currency: string;
  total: number;
  totalLabel: string;
  isDeduction?: boolean;
}> = ({ title, items, currency, total, totalLabel, isDeduction }) => (
  <div className="space-y-1.5">
    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-1.5 bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-wide">
        <span>Description</span>
        {items.some(i => i.rate) && <span className="text-right w-12">Rate</span>}
        <span className="text-right w-20">Amount</span>
      </div>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 border-t border-border/30 text-xs"
        >
          <span className="text-muted-foreground">{item.label}</span>
          {items.some(i => i.rate) && (
            <span className="text-right w-12 text-muted-foreground tabular-nums">{item.rate || ""}</span>
          )}
          <span className={`text-right w-20 font-medium tabular-nums ${isDeduction ? "text-destructive" : "text-foreground"}`}>
            {isDeduction ? "-" : ""}{fmt(item.amount, currency)}
          </span>
        </div>
      ))}
      {/* Total row */}
      <div className="grid grid-cols-[1fr_auto] gap-4 px-3 py-2 border-t border-border/50 bg-muted/20">
        <span className="text-xs font-medium text-foreground">{totalLabel}</span>
        <span className={`text-xs font-semibold tabular-nums text-right ${isDeduction ? "text-destructive" : "text-foreground"}`}>
          {isDeduction ? "-" : ""}{fmt(total, currency)}
        </span>
      </div>
    </div>
  </div>
);

const SummaryBar: React.FC<{ gross: number; deductions: number; net: number; currency: string }> = ({
  gross, deductions, net, currency,
}) => (
  <div className="grid grid-cols-3 gap-2">
    <div className="p-2.5 rounded-lg border border-border/50 bg-card/40 text-center">
      <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Gross Pay</p>
      <p className="text-sm font-semibold tabular-nums">{fmt(gross, currency)}</p>
    </div>
    <div className="p-2.5 rounded-lg border border-border/50 bg-card/40 text-center">
      <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Deductions</p>
      <p className="text-sm font-semibold tabular-nums text-destructive">-{fmt(deductions, currency)}</p>
    </div>
    <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-center">
      <p className="text-[9px] text-primary/70 uppercase mb-0.5">Net Pay</p>
      <p className="text-sm font-semibold text-primary tabular-nums">{fmt(net, currency)}</p>
    </div>
  </div>
);

// ─── Main Template ───────────────────────────────────────────────────

export const PayslipTemplate: React.FC<{ data: PayslipData }> = ({ data }) => {
  const sym = data.currencySymbol;

  const employeeInfo = [
    { label: "Employee", value: data.employee.name },
    { label: "Employee No.", value: data.employee.employeeNo },
    { label: "Department", value: data.employee.department },
    { label: "Job Title", value: data.employee.jobTitle },
    { label: "Start Date", value: data.employee.startDate },
    { label: "Contract", value: data.employee.contractType },
    { label: "Hours/Week", value: String(data.employee.hoursPerWeek) },
    ...(data.employee.taxCode ? [{ label: "Tax Code", value: data.employee.taxCode }] : []),
  ];

  const periodInfo = [
    { label: "Pay Period", value: `${data.period.startDate} – ${data.period.endDate}` },
    { label: "Payment Date", value: data.period.paymentDate },
    { label: "Bank Account", value: data.employee.bankAccount },
    { label: "Currency", value: data.currency },
  ];

  return (
    <div className="space-y-4 text-foreground">
      {/* Letterhead */}
      <Letterhead employer={data.employer} period={data.period.label} />

      <Separator className="bg-border/40" />

      {/* Employee & Period Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Employee Details</h4>
          <InfoGrid items={employeeInfo} />
        </div>
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment Details</h4>
          <InfoGrid items={periodInfo} />
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Summary Bar */}
      <SummaryBar gross={data.grossPay} deductions={data.totalDeductions} net={data.netPay} currency={sym} />

      {/* Earnings */}
      <LineItemsTable
        title="Earnings"
        items={data.earnings}
        currency={sym}
        total={data.grossPay}
        totalLabel="Total Gross Pay"
      />

      {/* Deductions */}
      {data.deductions.length > 0 && (
        <LineItemsTable
          title="Deductions"
          items={data.deductions}
          currency={sym}
          total={data.totalDeductions}
          totalLabel="Total Deductions"
          isDeduction
        />
      )}

      {/* Employer Costs (optional) */}
      {data.employerCosts && data.employerCosts.length > 0 && (
        <LineItemsTable
          title="Employer Costs"
          items={data.employerCosts}
          currency={sym}
          total={data.totalEmployerCosts || 0}
          totalLabel="Total Employer Costs"
        />
      )}

      {/* Year to Date */}
      {data.ytd && data.ytd.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Year to Date</h4>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            {data.ytd.map((item, idx) => (
              <div key={idx} className="flex justify-between px-3 py-2 border-t first:border-t-0 border-border/30 text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium tabular-nums">{fmt(item.amount, sym)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holiday / Leave Balances */}
      {data.holidays && data.holidays.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Holiday & Leave Balances</h4>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-3 py-1.5 bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-wide">
              <span>Type</span>
              <span className="text-right">Earned</span>
              <span className="text-right">Taken</span>
              <span className="text-right">Balance</span>
            </div>
            {data.holidays.map((h, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-border/30 text-xs">
                <span className="text-muted-foreground">{h.label}</span>
                <span className="text-right tabular-nums">{h.earned} {h.unit}</span>
                <span className="text-right tabular-nums">{h.taken} {h.unit}</span>
                <span className="text-right font-medium tabular-nums">{h.balance} {h.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Net Pay highlight */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-sm font-medium text-foreground">Net Pay</span>
        <span className="text-lg font-bold text-primary tabular-nums">{fmt(data.netPay, sym)}</span>
      </div>

      <Separator className="bg-border/40" />

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="space-y-0.5">
          <p>Ref: {data.referenceNo}</p>
          <p>Generated: {data.generatedDate}</p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="font-medium">Powered by Fronted</p>
          {data.confidential !== false && (
            <p className="italic">Confidential — for intended recipient only</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate;
