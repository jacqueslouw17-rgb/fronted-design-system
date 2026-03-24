/**
 * Shared – Payslip Template Preview (v1 scope)
 * 
 * Stripped to v1 data: no employee number, department, YTD, holiday/leave,
 * tax codes, NI numbers, or employer costs.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download } from "lucide-react";
import frontedLogo from "@/assets/fronted-logo.png";
import { PayslipTemplate, type PayslipData } from "@/components/shared/PayslipTemplate";
import { toast } from "sonner";

const samplePayslips: Record<string, PayslipData> = {
  uk: {
    employer: { entityName: "Fronted UK Ltd", registrationLabel: "Company Reg.", registrationId: "14523876", address: "71-75 Shelton Street, London WC2H 9JQ", country: "United Kingdom" },
    employee: { name: "James Richardson", jobTitle: "Senior Developer", startDate: "12 Jan 2026", bankAccount: "****4521" },
    period: { label: "January 2026", startDate: "01 Jan 2026", endDate: "31 Jan 2026", paymentDate: "30 Jan 2026" },
    currency: "GBP", currencySymbol: "£",
    earnings: [
      { label: "Monthly Salary", amount: 4326.92 },
    ],
    deductions: [
      { label: "Income Tax", amount: 865.20, rate: "20%" },
      { label: "Social Contributions", amount: 254.04, rate: "5.9%" },
    ],
    grossPay: 4326.92, totalDeductions: 1119.24, netPay: 3207.68,
    referenceNo: "PS-2026-01-UK042", generatedDate: "30 Jan 2026", confidential: true,
  },
  nl: {
    employer: { entityName: "Fronted Consultancy Netherlands BV", registrationLabel: "KvK", registrationId: "90481275", address: "Keizersgracht 482, 1096 HR Amsterdam", country: "Netherlands" },
    employee: { name: "Anna de Vries", jobTitle: "Head of Business Dev", startDate: "01 Jan 2026", bankAccount: "NL70****7875" },
    period: { label: "February 2026", startDate: "01 Feb 2026", endDate: "28 Feb 2026", paymentDate: "25 Feb 2026" },
    currency: "EUR", currencySymbol: "€",
    earnings: [
      { label: "Gross Salary", amount: 7916.67 },
    ],
    deductions: [
      { label: "Pension Contribution", amount: 431.34, rate: "7.5%" },
      { label: "Income Tax", amount: 2626.25, rate: "33.2%" },
    ],
    grossPay: 7916.67, totalDeductions: 3057.59, netPay: 4859.08,
    referenceNo: "PS-2026-02-NL001", generatedDate: "25 Feb 2026", confidential: true,
  },
  dk: {
    employer: { entityName: "Fronted Denmark ApS", registrationLabel: "CVR no.", registrationId: "46182596", address: "Lyskær 3, 2730 Herlev", country: "Denmark" },
    employee: { name: "Mikkel Andersen", jobTitle: "Software Engineer", startDate: "01 Jan 2026", bankAccount: "5328 – ****4212" },
    period: { label: "January 2026", startDate: "01 Jan 2026", endDate: "31 Jan 2026", paymentDate: "30 Jan 2026" },
    currency: "DKK", currencySymbol: "kr ",
    earnings: [
      { label: "Salary", amount: 65000.00 },
    ],
    deductions: [
      { label: "ATP", amount: 99.00 },
      { label: "AM Contribution", amount: 5192.00, rate: "8%" },
      { label: "A-tax", amount: 18501.00, rate: "38%" },
    ],
    grossPay: 65000.00, totalDeductions: 23792.00, netPay: 41208.00,
    referenceNo: "PS-2026-01-DK001", generatedDate: "30 Jan 2026", confidential: true,
  },
};

const PayslipPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState("uk");
  const data = samplePayslips[selectedCountry];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/?tab=flows")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={frontedLogo} alt="Fronted" className="h-5 w-auto" />
            <div className="h-4 w-px bg-border/60" />
            <span className="text-sm font-medium text-muted-foreground">Payslip Template</span>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="nl">🇳🇱 Netherlands</SelectItem>
                <SelectItem value="dk">🇩🇰 Denmark</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Payslip PDF downloaded")}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Payslip Document */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-card border border-border/50 rounded-xl p-8 shadow-sm">
          <PayslipTemplate data={data} />
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-6">
          This is a sample payslip generated for preview purposes. Actual payslips are generated per pay run.
        </p>
      </div>
    </div>
  );
};

export default PayslipPreviewPage;
