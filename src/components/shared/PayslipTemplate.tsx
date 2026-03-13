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
  entityName: string;
  registrationId: string;
  registrationLabel: string;
  address: string;
  country: string;
}

export interface PayslipEmployee {
  name: string;
  employeeNo: string;
  department: string;
  jobTitle: string;
  startDate: string;
  contractType: string;
  hoursPerWeek: number;
  bankAccount: string;
  taxCode?: string;
  nationalInsuranceNo?: string;
  address?: string;
}

export interface PayslipLineItem {
  label: string;
  amount: number;
  rate?: string;
  basis?: number;
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
  unit: string;
}

export interface PayslipData {
  employer: PayslipEmployer;
  employee: PayslipEmployee;
  period: {
    label: string;
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

/** Top letterhead: logo left, entity right — mirrors real payslips */
const Letterhead: React.FC<{ employer: PayslipEmployer; periodLabel: string }> = ({ employer, periodLabel }) => (
  <div className="flex items-start justify-between pb-4">
    <div className="space-y-1">
      <img src={frontedLogo} alt="Fronted" className="h-6 w-auto mb-1" />
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        Salary Specification
      </p>
      <p className="text-xs text-muted-foreground">{periodLabel}</p>
    </div>
    <div className="text-right space-y-0.5">
      <p className="text-sm font-semibold text-foreground">{employer.entityName}</p>
      <p className="text-[11px] text-muted-foreground">{employer.address}</p>
      <p className="text-[11px] text-muted-foreground">
        {employer.registrationLabel}: <span className="font-medium text-foreground">{employer.registrationId}</span>
      </p>
    </div>
  </div>
);

/** Single key-value row */
const InfoRow: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex justify-between py-[3px]">
    <span className="text-[11px] text-muted-foreground">{label}</span>
    <span className={`text-[11px] tabular-nums ${bold ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{value}</span>
  </div>
);

/** Compact info block with a title and key-value rows */
const InfoBlock: React.FC<{ title: string; items: { label: string; value: string; bold?: boolean }[] }> = ({ title, items }) => (
  <div>
    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pb-1 border-b border-border/40">
      {title}
    </h4>
    <div className="space-y-0">
      {items.map((item, i) => (
        <InfoRow key={i} label={item.label} value={item.value} bold={item.bold} />
      ))}
    </div>
  </div>
);

/** Line items table */
const LineItemsTable: React.FC<{
  title: string;
  items: PayslipLineItem[];
  currency: string;
  total: number;
  totalLabel: string;
  isDeduction?: boolean;
}> = ({ title, items, currency, total, totalLabel, isDeduction }) => {
  const hasRate = items.some(i => i.rate);
  return (
    <div className="space-y-1.5">
      <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{title}</h4>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        {/* Header */}
        <div className={`grid ${hasRate ? "grid-cols-[1fr_60px_90px]" : "grid-cols-[1fr_90px]"} px-3 py-1.5 bg-muted/40 text-[9px] text-muted-foreground uppercase tracking-wider font-semibold`}>
          <span>Description</span>
          {hasRate && <span className="text-right">Rate</span>}
          <span className="text-right">Amount</span>
        </div>
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`grid ${hasRate ? "grid-cols-[1fr_60px_90px]" : "grid-cols-[1fr_90px]"} px-3 py-2 border-t border-border/30`}
          >
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
            {hasRate && (
              <span className="text-[11px] text-right text-muted-foreground tabular-nums">{item.rate || ""}</span>
            )}
            <span className={`text-[11px] text-right font-medium tabular-nums ${isDeduction ? "text-destructive" : "text-foreground"}`}>
              {isDeduction ? "−" : ""}{fmt(item.amount, currency)}
            </span>
          </div>
        ))}
        {/* Total */}
        <div className={`grid ${hasRate ? "grid-cols-[1fr_60px_90px]" : "grid-cols-[1fr_90px]"} px-3 py-2 border-t border-border/50 bg-muted/30`}>
          <span className="text-[11px] font-semibold text-foreground">{totalLabel}</span>
          {hasRate && <span />}
          <span className={`text-[11px] text-right font-bold tabular-nums ${isDeduction ? "text-destructive" : "text-foreground"}`}>
            {isDeduction ? "−" : ""}{fmt(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Gross / Deductions / Net summary */
const SummaryBar: React.FC<{ gross: number; deductions: number; net: number; currency: string }> = ({
  gross, deductions, net, currency,
}) => (
  <div className="grid grid-cols-3 gap-2">
    <div className="p-2.5 rounded-lg border border-border/50 bg-card/40 text-center">
      <p className="text-[9px] text-muted-foreground uppercase mb-0.5 font-medium">Gross Pay</p>
      <p className="text-sm font-bold tabular-nums">{fmt(gross, currency)}</p>
    </div>
    <div className="p-2.5 rounded-lg border border-border/50 bg-card/40 text-center">
      <p className="text-[9px] text-muted-foreground uppercase mb-0.5 font-medium">Deductions</p>
      <p className="text-sm font-bold tabular-nums text-destructive">−{fmt(deductions, currency)}</p>
    </div>
    <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-center">
      <p className="text-[9px] text-primary/70 uppercase mb-0.5 font-medium">Net Pay</p>
      <p className="text-sm font-bold text-primary tabular-nums">{fmt(net, currency)}</p>
    </div>
  </div>
);

// ─── Main Template ───────────────────────────────────────────────────

export const PayslipTemplate: React.FC<{ data: PayslipData }> = ({ data }) => {
  const sym = data.currencySymbol;

  const employeeDetails = [
    { label: "Name", value: data.employee.name, bold: true },
    { label: "Employee No.", value: data.employee.employeeNo },
    { label: "Job Title", value: data.employee.jobTitle },
    { label: "Department", value: data.employee.department },
    { label: "Date of Employment", value: data.employee.startDate },
    { label: "Contract Type", value: data.employee.contractType },
    { label: "Hours / Week", value: String(data.employee.hoursPerWeek) },
    ...(data.employee.taxCode ? [{ label: "Tax Code", value: data.employee.taxCode }] : []),
    ...(data.employee.nationalInsuranceNo ? [{ label: "NI Number", value: data.employee.nationalInsuranceNo }] : []),
  ];

  const paymentDetails = [
    { label: "Salary Period", value: `${data.period.startDate} – ${data.period.endDate}` },
    { label: "Payment Date", value: data.period.paymentDate, bold: true },
    { label: "Bank Account", value: data.employee.bankAccount },
    { label: "Currency", value: data.currency },
    ...(data.totalEmployerCosts ? [{ label: "Employer Costs", value: fmt(data.totalEmployerCosts, sym) }] : []),
  ];

  return (
    <div className="space-y-5 text-foreground">
      {/* ── Letterhead ── */}
      <Letterhead employer={data.employer} periodLabel={data.period.label} />

      <Separator className="bg-border/50" />

      {/* ── Employee + Payment info — two columns ── */}
      <div className="grid grid-cols-2 gap-8">
        <InfoBlock title="Employee Details" items={employeeDetails} />
        <InfoBlock title="Payment Details" items={paymentDetails} />
      </div>

      <Separator className="bg-border/50" />

      {/* ── Summary Bar ── */}
      <SummaryBar gross={data.grossPay} deductions={data.totalDeductions} net={data.netPay} currency={sym} />

      {/* ── Earnings ── */}
      <LineItemsTable
        title="Earnings"
        items={data.earnings}
        currency={sym}
        total={data.grossPay}
        totalLabel="Total Gross Pay"
      />

      {/* ── Deductions ── */}
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

      {/* ── Employer Costs ── */}
      {data.employerCosts && data.employerCosts.length > 0 && (
        <LineItemsTable
          title="Employer Costs"
          items={data.employerCosts}
          currency={sym}
          total={data.totalEmployerCosts || 0}
          totalLabel="Total Employer Costs"
        />
      )}

      {/* ── Year to Date ── */}
      {data.ytd && data.ytd.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Year to Date</h4>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="grid grid-cols-[1fr_90px] px-3 py-1.5 bg-muted/40 text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
              <span>Description</span>
              <span className="text-right">Cumulative</span>
            </div>
            {data.ytd.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_90px] px-3 py-2 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
                <span className="text-[11px] text-right font-medium tabular-nums">{fmt(item.amount, sym)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Holiday / Leave Balances ── */}
      {data.holidays && data.holidays.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Holiday & Leave Balances</h4>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-3 py-1.5 bg-muted/40 text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
              <span>Type</span>
              <span className="text-right">Earned</span>
              <span className="text-right">Taken</span>
              <span className="text-right">Balance</span>
            </div>
            {data.holidays.map((h, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground">{h.label}</span>
                <span className="text-[11px] text-right tabular-nums">{h.earned} {h.unit}</span>
                <span className="text-[11px] text-right tabular-nums">{h.taken} {h.unit}</span>
                <span className="text-[11px] text-right font-medium tabular-nums">{h.balance} {h.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Net Pay highlight ── */}
      <div className="flex items-center justify-between p-3.5 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-sm font-semibold text-foreground">Net Pay</span>
        <span className="text-xl font-bold text-primary tabular-nums">{fmt(data.netPay, sym)}</span>
      </div>

      <Separator className="bg-border/50" />

      {/* ── Footer ── */}
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
