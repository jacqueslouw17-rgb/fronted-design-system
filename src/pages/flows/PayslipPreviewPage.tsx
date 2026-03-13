/**
 * Shared – Payslip Template Preview
 * 
 * Standalone page to preview the universal EOR payslip template
 * with sample data from different countries.
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
    employee: { name: "James Richardson", employeeNo: "FRN-0042", department: "Engineering", jobTitle: "Senior Developer", startDate: "12 Jan 2026", contractType: "Permanent", hoursPerWeek: 40, bankAccount: "****4521", taxCode: "0T", nationalInsuranceNo: "QQ 12 34 56 C" },
    period: { label: "January 2026", startDate: "01 Jan 2026", endDate: "31 Jan 2026", paymentDate: "30 Jan 2026" },
    currency: "GBP", currencySymbol: "£",
    earnings: [
      { label: "Monthly Pay", amount: 4326.92 },
    ],
    deductions: [
      { label: "Tax", amount: 865.20, rate: "20%" },
      { label: "National Insurance", amount: 254.04, rate: "5.9%" },
    ],
    employerCosts: [
      { label: "Employer National Insurance", amount: 586.49, rate: "13.8%" },
    ],
    ytd: [
      { label: "Taxable Gross Pay", amount: 4326.92 },
      { label: "Tax", amount: 865.20 },
      { label: "Employee National Insurance", amount: 254.04 },
      { label: "Employer National Insurance", amount: 586.49 },
    ],
    holidays: [
      { label: "Annual Leave", earned: 2.33, taken: 0, balance: 2.33, unit: "days" },
    ],
    grossPay: 4326.92, totalDeductions: 1119.24, netPay: 3207.68, totalEmployerCosts: 586.49,
    referenceNo: "PS-2026-01-UK042", generatedDate: "30 Jan 2026", confidential: true,
  },
  nl: {
    employer: { entityName: "Fronted Consultancy Netherlands BV", registrationLabel: "KvK", registrationId: "90481275", address: "Keizersgracht 482, 1096 HR Amsterdam", country: "Netherlands" },
    employee: { name: "Anna de Vries", employeeNo: "FRN-0001", department: "Business Development", jobTitle: "Head of Business Dev", startDate: "01 Jan 2026", contractType: "Permanent", hoursPerWeek: 40, bankAccount: "NL70****7875", address: "Keizersgracht 197, 1096 HR Amsterdam" },
    period: { label: "February 2026", startDate: "01 Feb 2026", endDate: "28 Feb 2026", paymentDate: "25 Feb 2026" },
    currency: "EUR", currencySymbol: "€",
    earnings: [
      { label: "Gross Salaris", amount: 7916.67 },
    ],
    deductions: [
      { label: "PAWW Wn", amount: 6.62, rate: "0.1%" },
      { label: "Pensioenregeling Wn", amount: 431.34, rate: "7.5%" },
      { label: "Loonheffing (Tax)", amount: 2626.25, rate: "33.2%" },
    ],
    employerCosts: [
      { label: "Employer Social Security", amount: 633.33 },
      { label: "Employer Pension", amount: 316.67 },
    ],
    ytd: [
      { label: "Fiscal Wage", amount: 14957.42 },
      { label: "Tax", amount: 5252.50 },
      { label: "Labour Deduction (cum.)", amount: 469.00 },
    ],
    holidays: [
      { label: "Annual Leave", earned: 1.67, taken: 0, balance: 1.67, unit: "days" },
    ],
    grossPay: 7916.67, totalDeductions: 3064.21, netPay: 4852.46, totalEmployerCosts: 950.00,
    referenceNo: "PS-2026-02-NL001", generatedDate: "25 Feb 2026", confidential: true,
  },
  dk: {
    employer: { entityName: "Fronted Denmark ApS", registrationLabel: "CVR no.", registrationId: "46182596", address: "Lyskær 3, 2730 Herlev", country: "Denmark" },
    employee: { name: "Mikkel Andersen", employeeNo: "FRN-0001", department: "Standard", jobTitle: "Software Engineer", startDate: "01 Jan 2026", contractType: "Permanent", hoursPerWeek: 40, bankAccount: "5328-****4212" },
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
    employerCosts: [
      { label: "ATP (Employer)", amount: 198.00 },
      { label: "Social Security", amount: 520.00 },
    ],
    ytd: [
      { label: "AM Income Base", amount: 64901.00 },
      { label: "A-tax, Salary & Holiday Pay", amount: 18501.00 },
      { label: "AM Contribution", amount: 5192.00 },
    ],
    holidays: [
      { label: "Annual Leave", earned: 2.08, taken: 0, balance: 2.08, unit: "days" },
      { label: "Special Holiday Allowance", earned: 652.93, taken: 0, balance: 652.93, unit: "DKK" },
    ],
    grossPay: 65000.00, totalDeductions: 23792.00, netPay: 41208.00, totalEmployerCosts: 718.00,
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
