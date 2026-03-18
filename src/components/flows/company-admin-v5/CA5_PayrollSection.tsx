import React, { useEffect, useMemo } from "react";
import { F1v4_CompanyPayrollRun } from "@/components/flows/fronted-admin-v7-clone/F1v7_CompanyPayrollRun";
import type { CompanyPayrollData } from "@/components/flows/fronted-admin-v7-clone/F1v7_PayrollTab";
import { useCA4Agent } from "./CA5_AgentContext";

interface CA4_PayrollSectionProps {
  payPeriod: string;
}

const FLOW6_V5_COMPANY: CompanyPayrollData = {
  id: "flow-6-v5-company",
  name: "Company Admin",
  payPeriod: "January 2026",
  countries: ["PT", "FR", "PH", "NO", "DE", "SE", "IN"],
  employeeCount: 4,
  contractorCount: 5,
  currencyCount: 3,
  totalCost: 128592,
  status: "needs-review",
  blockingExceptions: 2,
  lastActivity: "2 hours ago",
};

export const CA4_PayrollSection: React.FC<CA4_PayrollSectionProps> = ({ payPeriod }) => {
  const { requestedStep, setRequestedStep, openWorkerId } = useCA4Agent();

  useEffect(() => {
    if (requestedStep) {
      setRequestedStep(undefined);
    }
  }, [requestedStep, setRequestedStep]);

  const company = useMemo<CompanyPayrollData>(
    () => ({
      ...FLOW6_V5_COMPANY,
      payPeriod,
    }),
    [payPeriod],
  );

  const highlightedWorkerId = openWorkerId ?? (requestedStep ? "__flow-6-v5-enter-payroll__" : null);

  return (
    <F1v4_CompanyPayrollRun
      company={company}
      highlightedWorkerId={highlightedWorkerId}
    />
  );
};

export default CA4_PayrollSection;
