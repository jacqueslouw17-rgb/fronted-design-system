/**
 * F1v4_PayrollTab - Main payroll tab for Flow 1 v7 Fronted Admin Dashboard
 * 
 * Supports single-company and "All Clients" aggregate mode
 */

import React, { useState } from "react";
import { F1v4_CompanyPayrollRun } from "./F1v7_CompanyPayrollRun";

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
  isAllClients?: boolean;
  highlightedWorkerId?: string | null;
}

export const F1v4_PayrollTab: React.FC<F1v4_PayrollTabProps> = ({
  selectedCompanyId,
  isAllClients = false,
  highlightedWorkerId,
}) => {
  const [companies] = useState<CompanyPayrollData[]>(MOCK_COMPANY_PAYROLLS);

  if (isAllClients) {
    // Aggregate company data across all companies
    const aggregatedCompany: CompanyPayrollData = {
      id: "all-clients",
      name: "All Clients",
      payPeriod: "January 2026",
      countries: [...new Set(companies.flatMap(c => c.countries))],
      employeeCount: companies.reduce((sum, c) => sum + c.employeeCount, 0),
      contractorCount: companies.reduce((sum, c) => sum + c.contractorCount, 0),
      currencyCount: [...new Set(companies.flatMap(c => c.countries))].length,
      totalCost: companies.reduce((sum, c) => sum + c.totalCost, 0),
      status: "needs-review",
      blockingExceptions: companies.reduce((sum, c) => sum + c.blockingExceptions, 0),
    };

    return (
      <F1v4_CompanyPayrollRun
        company={aggregatedCompany}
        isAllClients
        highlightedWorkerId={highlightedWorkerId}
      />
    );
  }

  // Find the selected company, default to first company if not found
  const activeCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  if (!activeCompany) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-8 text-center text-muted-foreground">
        No companies available
      </div>
    );
  }

  return (
    <F1v4_CompanyPayrollRun
      company={activeCompany}
    />
  );
};

export default F1v4_PayrollTab;
