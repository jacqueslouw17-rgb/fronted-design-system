/**
 * F1v7_PayslipPreviewModal - Payslip preview using universal PayslipTemplate
 * 
 * Wraps the shared PayslipTemplate in a dialog with download action.
 * Generates country-appropriate mock data from WorkerData.
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { WorkerData } from "./F1v7_WorkerDetailDrawer";
import { PayslipTemplate, type PayslipData } from "@/components/shared/PayslipTemplate";

interface F1v7_PayslipPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerData | null;
}

// ─── Country-specific entity mapping ─────────────────────────────────

const countryEntities: Record<string, { entityName: string; registrationLabel: string; registrationId: string; address: string }> = {
  "United Kingdom": { entityName: "Fronted UK Ltd", registrationLabel: "Company Reg.", registrationId: "14523876", address: "71-75 Shelton Street, London WC2H 9JQ" },
  "Netherlands": { entityName: "Fronted Consultancy Netherlands BV", registrationLabel: "KvK", registrationId: "90481275", address: "Keizersgracht 482, 1096 HR Amsterdam" },
  "Denmark": { entityName: "Fronted Denmark ApS", registrationLabel: "CVR no.", registrationId: "46182596", address: "Lyskær 3, 2730 Herlev" },
  "Germany": { entityName: "Fronted Germany GmbH", registrationLabel: "HRB", registrationId: "241853", address: "Friedrichstraße 123, 10117 Berlin" },
  "France": { entityName: "Fronted France SAS", registrationLabel: "SIRET", registrationId: "912 345 678 00012", address: "42 Rue de Rivoli, 75001 Paris" },
  "Spain": { entityName: "Fronted Spain SL", registrationLabel: "CIF", registrationId: "B12345678", address: "Paseo de la Castellana 91, 28046 Madrid" },
  "Portugal": { entityName: "Fronted Portugal Lda", registrationLabel: "NIF", registrationId: "516234789", address: "Av. da Liberdade 110, 1269-046 Lisboa" },
  "Norway": { entityName: "Fronted Norway AS", registrationLabel: "Org.nr.", registrationId: "923 456 789", address: "Karl Johans gate 22, 0159 Oslo" },
  "Singapore": { entityName: "Fronted Singapore Pte. Ltd.", registrationLabel: "UEN", registrationId: "202312345A", address: "1 Raffles Place, #20-01, 048616" },
  "Philippines": { entityName: "Fronted Philippines Inc.", registrationLabel: "SEC Reg.", registrationId: "CS202312345", address: "BGC, Taguig City, Metro Manila" },
  "Italy": { entityName: "Fronted Italy S.r.l.", registrationLabel: "P.IVA", registrationId: "IT12345678901", address: "Via Montenapoleone 8, 20121 Milano" },
};

const currencySymbols: Record<string, string> = {
  GBP: "£", EUR: "€", DKK: "kr ", NOK: "kr ", SEK: "kr ",
  PHP: "₱", USD: "$", SGD: "S$", MXN: "$", EGP: "E£",
};

const countryFlags: Record<string, string> = {
  "United Kingdom": "🇬🇧", Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭",
  Norway: "🇳🇴", Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷",
  Italy: "🇮🇹", Netherlands: "🇳🇱", Denmark: "🇩🇰",
};

// ─── Build PayslipData from WorkerData ───────────────────────────────

function buildPayslipData(worker: WorkerData): PayslipData {
  const entity = countryEntities[worker.country] || {
    entityName: `Fronted ${worker.country}`,
    registrationLabel: "Reg. No.",
    registrationId: "000000",
    address: worker.country,
  };

  const sym = currencySymbols[worker.currency] || worker.currency + " ";
  const grossPay = worker.grossPay || worker.netPay * 1.35;
  const baseSalary = worker.baseSalary || grossPay * 0.88;

  // Country-adaptive earnings
  const earnings = [
    { label: "Base Salary", amount: baseSalary },
    { label: "Housing Allowance", amount: grossPay * 0.07 },
    { label: "Transport Allowance", amount: grossPay * 0.03 },
    { label: "Meal Allowance", amount: grossPay * 0.02 },
  ];

  // Country-adaptive deductions
  const isEmployee = worker.type === "employee";
  const deductions: { label: string; amount: number; rate?: string }[] = isEmployee ? [] : [];

  if (isEmployee) {
    // These vary by country but we show the universal structure
    const taxRate = worker.country === "Denmark" ? 0.38 : worker.country === "Netherlands" ? 0.33 : 0.20;
    const socialRate = worker.country === "Denmark" ? 0 : 0.05;
    const pensionRate = worker.country === "Netherlands" ? 0.075 : worker.country === "Denmark" ? 0.04 : 0.03;

    deductions.push(
      { label: "Income Tax", amount: grossPay * taxRate, rate: `${(taxRate * 100).toFixed(0)}%` },
    );
    if (socialRate > 0) {
      deductions.push(
        { label: worker.country === "United Kingdom" ? "National Insurance" : "Social Security", amount: grossPay * socialRate, rate: `${(socialRate * 100).toFixed(0)}%` },
      );
    }
    deductions.push(
      { label: "Pension Contribution", amount: grossPay * pensionRate, rate: `${(pensionRate * 100).toFixed(1)}%` },
    );
    if (["Netherlands", "Germany", "France"].includes(worker.country)) {
      deductions.push({ label: "Health Insurance", amount: grossPay * 0.02, rate: "2%" });
    }
  }

  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  // Employer costs
  const employerCosts = isEmployee ? [
    { label: "Employer Social Security", amount: grossPay * 0.08 },
    { label: "Employer Pension", amount: grossPay * 0.04 },
    ...(worker.country === "United Kingdom" ? [{ label: "Employer NI", amount: grossPay * 0.138, rate: "13.8%" }] : []),
  ] : undefined;

  const totalEmployerCosts = employerCosts?.reduce((s, c) => s + c.amount, 0) || 0;

  // YTD (single month = same as current)
  const ytd = [
    { label: "Taxable Gross Pay", amount: totalEarnings },
    { label: "Total Tax Paid", amount: deductions.find(d => d.label === "Income Tax")?.amount || 0 },
    { label: "Total Deductions", amount: totalDeductions },
    { label: "Total Net Pay", amount: netPay },
  ];

  // Holiday balances (EU countries)
  const holidays = isEmployee ? [
    { label: "Annual Leave", earned: 2.08, taken: 0, balance: 2.08, unit: "days" },
    { label: "Sick Leave", earned: 0, taken: 0, balance: 0, unit: "days" },
  ] : undefined;

  return {
    employer: { ...entity, country: worker.country },
    employee: {
      name: worker.name,
      jobTitle: "Senior Specialist",
      startDate: "01 Jan 2026",
      bankAccount: "****4521",
    },
    period: {
      label: "January 2026",
      startDate: "01 Jan 2026",
      endDate: "31 Jan 2026",
      paymentDate: "30 Jan 2026",
    },
    currency: worker.currency,
    currencySymbol: sym,
    earnings,
    deductions,
    employerCosts,
    ytd,
    holidays,
    grossPay: totalEarnings,
    totalDeductions,
    netPay,
    totalEmployerCosts,
    referenceNo: `PS-2026-01-${worker.id}`,
    generatedDate: "20 Jan 2026",
    confidential: true,
  };
}

// ─── Modal Component ─────────────────────────────────────────────────

export const F1v4_PayslipPreviewModal: React.FC<F1v7_PayslipPreviewModalProps> = ({
  open,
  onOpenChange,
  worker,
}) => {
  if (!worker) return null;

  const payslipData = buildPayslipData(worker);

  const handleDownload = () => {
    toast.success("Payslip PDF downloaded");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[580px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 mb-2 bg-primary/10 text-primary border-primary/20">
                Payslip
              </Badge>
              <DialogTitle className="text-lg font-semibold text-foreground">
                {payslipData.period.label}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {countryFlags[worker.country] || ""} {worker.name} · {worker.country}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Payslip Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <PayslipTemplate data={payslipData} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Ref: {payslipData.referenceNo} · Generated {payslipData.generatedDate}
          </p>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default F1v4_PayslipPreviewModal;
