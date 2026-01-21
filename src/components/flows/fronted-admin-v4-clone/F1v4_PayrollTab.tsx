/**
 * F1v4_PayrollTab - Main payroll tab for Flow 1 v4 Fronted Admin Dashboard
 * 
 * Bird's-eye view of all companies + drill-down to company payroll run
 */

import React, { useState } from "react";
import { F1v4_PayrollOverview } from "./F1v4_PayrollOverview";
import { F1v4_CompanyPayrollRun } from "./F1v4_CompanyPayrollRun";

export interface CompanyPayrollData {
  id: string;
  name: string;
  payPeriod: string;
  countries: string[];
  employeeCount: number;
  contractorCount: number;
  currencyCount: number;
  totalCost: number;
  status: "blocked" | "needs-review" | "ready" | "approved" | "reconcile";
  blockingExceptions: number;
  lastActivity?: string;
}

// Mock data for multi-company payroll overview
const MOCK_COMPANY_PAYROLLS: CompanyPayrollData[] = [
  {
    id: "company-default",
    name: "Acme Corp",
    payPeriod: "January 2026",
    countries: ["SG", "ES", "PH"],
    employeeCount: 3,
    contractorCount: 4,
    currencyCount: 3,
    totalCost: 128592,
    status: "needs-review",
    blockingExceptions: 2,
    lastActivity: "2 hours ago",
  },
  {
    id: "company-2",
    name: "TechStart Inc",
    payPeriod: "January 2026",
    countries: ["US", "UK"],
    employeeCount: 5,
    contractorCount: 2,
    currencyCount: 2,
    totalCost: 95400,
    status: "ready",
    blockingExceptions: 0,
    lastActivity: "1 hour ago",
  },
  {
    id: "company-3",
    name: "Global Ventures",
    payPeriod: "January 2026",
    countries: ["DE", "FR", "NL", "BE"],
    employeeCount: 8,
    contractorCount: 3,
    currencyCount: 2,
    totalCost: 245000,
    status: "blocked",
    blockingExceptions: 4,
    lastActivity: "30 min ago",
  },
  {
    id: "company-4",
    name: "Nordic Solutions",
    payPeriod: "January 2026",
    countries: ["NO", "SE"],
    employeeCount: 4,
    contractorCount: 1,
    currencyCount: 2,
    totalCost: 78500,
    status: "approved",
    blockingExceptions: 0,
    lastActivity: "Yesterday",
  },
  {
    id: "company-5",
    name: "Pacific Trading",
    payPeriod: "January 2026",
    countries: ["JP", "AU", "NZ"],
    employeeCount: 6,
    contractorCount: 4,
    currencyCount: 3,
    totalCost: 312000,
    status: "reconcile",
    blockingExceptions: 0,
    lastActivity: "3 days ago",
  },
];

interface F1v4_PayrollTabProps {
  selectedCompanyId?: string;
}

export const F1v4_PayrollTab: React.FC<F1v4_PayrollTabProps> = ({
  selectedCompanyId,
}) => {
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [initialStep, setInitialStep] = useState<number | undefined>(undefined);
  const [companies] = useState<CompanyPayrollData[]>(MOCK_COMPANY_PAYROLLS);

  const activeCompany = activeCompanyId 
    ? companies.find(c => c.id === activeCompanyId) 
    : null;

  const handleSelectCompany = (companyId: string, jumpToStep?: number) => {
    setActiveCompanyId(companyId);
    setInitialStep(jumpToStep);
  };

  const handleBackToOverview = () => {
    setActiveCompanyId(null);
    setInitialStep(undefined);
  };

  if (activeCompany) {
    return (
      <F1v4_CompanyPayrollRun
        company={activeCompany}
        onBack={handleBackToOverview}
        initialStep={initialStep}
      />
    );
  }

  return (
    <F1v4_PayrollOverview
      companies={companies}
      onSelectCompany={handleSelectCompany}
    />
  );
};

export default F1v4_PayrollTab;
