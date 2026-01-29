/**
 * F1v4_ReviewStep - Review payroll totals and workers
 * 
 * Uses F1v4_SubmissionsView which matches Flow 6 v3 patterns exactly:
 * - Worker rows with pending/rejected counts
 * - "1 day to resubmit" indicator
 * - Full drawer with approve/reject actions
 */

import React, { useState } from "react";
import { 
  Users, 
  Briefcase, 
  DollarSign,
  Receipt,
  Building2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_SubmissionsView, WorkerSubmission } from "./F1v4_SubmissionsView";
import { F1v4_PeriodDropdown, PayrollPeriod } from "./F1v4_PeriodDropdown";

interface F1v4_ReviewStepProps {
  company: CompanyPayrollData;
  onContinue: () => void;
}

// Mock submissions data matching CA3_SubmissionsView structure
const MOCK_SUBMISSIONS: WorkerSubmission[] = [
  { 
    id: "1", 
    workerId: "1",
    workerName: "Marcus Chen", 
    workerType: "contractor", 
    workerCountry: "Singapore", 
    currency: "SGD", 
    status: "ready",
    basePay: 12000,
    estimatedNet: 12000,
    totalImpact: 500,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Contract Fee", amount: 12000, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
  },
  { 
    id: "2", 
    workerId: "2",
    workerName: "Sofia Rodriguez", 
    workerType: "contractor", 
    workerCountry: "Spain", 
    currency: "EUR", 
    status: "ready",
    basePay: 6500,
    estimatedNet: 6500,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Contract Fee", amount: 6500, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
  },
  { 
    id: "3", 
    workerId: "3",
    workerName: "Maria Santos", 
    workerType: "employee", 
    workerCountry: "Philippines", 
    currency: "PHP", 
    status: "pending",
    basePay: 280000,
    estimatedNet: 238000,
    totalImpact: 15000,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Salary", amount: 280000, type: "Earnings" },
      { label: "Income Tax", amount: -28000, type: "Deduction", locked: true },
      { label: "Social Security", amount: -14000, type: "Deduction", locked: true },
    ],
    submissions: [
      { type: "expenses", amount: 8500, description: "Travel reimbursement", status: "pending" },
      { type: "bonus", amount: 6500, description: "Q4 Performance Bonus", status: "pending" },
    ],
    pendingLeaves: [],
  },
  { 
    id: "4", 
    workerId: "4",
    workerName: "Alex Hansen", 
    workerType: "employee", 
    workerCountry: "Norway", 
    currency: "NOK", 
    status: "pending",
    basePay: 65000,
    estimatedNet: 52000,
    totalImpact: 4500,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Salary", amount: 65000, type: "Earnings" },
      { label: "Income Tax", amount: -9750, type: "Deduction", locked: true },
      { label: "Pension", amount: -3250, type: "Deduction", locked: true },
    ],
    submissions: [
      { type: "overtime", amount: 4500, hours: 12, description: "12h overtime", status: "pending" },
    ],
    pendingLeaves: [
      { id: "leave-1", leaveType: "Unpaid", startDate: "2026-01-20", endDate: "2026-01-21", totalDays: 2, daysInThisPeriod: 2, status: "pending", dailyRate: 2955 },
    ],
  },
  { 
    id: "5", 
    workerId: "5",
    workerName: "David Martinez", 
    workerType: "contractor", 
    workerCountry: "Portugal", 
    currency: "EUR", 
    status: "ready",
    basePay: 4200,
    estimatedNet: 4200,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Contract Fee", amount: 4200, type: "Earnings" },
    ],
    submissions: [],
    pendingLeaves: [],
  },
  { 
    id: "6", 
    workerId: "6",
    workerName: "Emma Wilson", 
    workerType: "contractor", 
    workerCountry: "Norway", 
    currency: "NOK", 
    status: "pending",
    basePay: 72000,
    estimatedNet: 72000,
    totalImpact: 3200,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Contract Fee", amount: 72000, type: "Earnings" },
    ],
    submissions: [
      { type: "expenses", amount: 3200, description: "Equipment purchase", status: "rejected", rejectionReason: "Missing receipt - please resubmit with documentation" },
    ],
    pendingLeaves: [],
  },
  { 
    id: "7", 
    workerId: "7",
    workerName: "Jonas Schmidt", 
    workerType: "employee", 
    workerCountry: "Germany", 
    currency: "EUR", 
    status: "ready",
    basePay: 5800,
    estimatedNet: 4350,
    periodLabel: "Jan 1 – Jan 31",
    lineItems: [
      { label: "Base Salary", amount: 5800, type: "Earnings" },
      { label: "Income Tax", amount: -1160, type: "Deduction", locked: true },
      { label: "Social Security", amount: -290, type: "Deduction", locked: true },
    ],
    submissions: [],
    pendingLeaves: [],
  },
];

const MOCK_PERIODS: PayrollPeriod[] = [
  { id: "current", label: "January 2026", status: "current" },
  { id: "dec-2025", label: "December 2025", status: "paid" },
  { id: "nov-2025", label: "November 2025", status: "paid" },
];

export const F1v4_ReviewStep: React.FC<F1v4_ReviewStepProps> = ({
  company,
  onContinue,
}) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState("current");

  const employees = MOCK_SUBMISSIONS.filter(w => w.workerType === "employee");
  const contractors = MOCK_SUBMISSIONS.filter(w => w.workerType === "contractor");
  
  const isViewingPrevious = selectedPeriodId !== "current";

  return (
    <div className="space-y-5">
      {/* Summary Card with Period Header and KPIs */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <F1v4_PeriodDropdown 
                periods={MOCK_PERIODS}
                selectedPeriodId={selectedPeriodId}
                onPeriodChange={setSelectedPeriodId}
              />
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                <Clock className="h-3 w-3 mr-1" />
                In review
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-5 px-5">
          {/* KPI Grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Gross Pay</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$124.9K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Salaries + Contractor fees</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Adjustments</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$8.2K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Bonuses, overtime & expenses</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Fronted Fees</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$3.7K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Transaction + Service</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Total Cost</span>
              </div>
              <p className="text-xl font-semibold text-foreground">${(company.totalCost / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Pay + All Fees</p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground py-2.5 border-t border-border/30">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Employees: <strong className="text-foreground">{employees.length}</strong>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Contractors: <strong className="text-foreground">{contractors.length}</strong>
            </span>
            <span className="text-border">·</span>
            <span>Currencies: <strong className="text-foreground">{company.currencyCount}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Worker Submissions - Matches Flow 6 v3 exactly */}
      {!isViewingPrevious && (
        <F1v4_SubmissionsView
          submissions={MOCK_SUBMISSIONS}
          onContinue={onContinue}
        />
      )}
    </div>
  );
};

export default F1v4_ReviewStep;
