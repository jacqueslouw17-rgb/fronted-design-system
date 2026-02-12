/**
 * Flow 4.1 — Employee Dashboard v6
 * 
 * Clean payout dashboard with hero tiles and payslips list.
 * INDEPENDENT from v5 - changes here do not affect other flows.
 */

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  F41v6_PayoutHeroCard, 
  F41v6_PayslipsSection, 
  F41v6_PayoutBreakdownDrawer,
  F41v6_AdjustmentsSection,
  F41v6_AdjustmentModal
} from "@/components/flows/employee-dashboard-v6";

interface PayslipData {
  id: string;
  period: string;
  paidDate: string;
  earnings: { label: string; amount: number }[];
  deductions: { label: string; amount: number }[];
  netPay: number;
  status?: 'paid' | 'expired';
  carryOverFrom?: string;
  carryOverAmount?: number;
}

const payslipsData: PayslipData[] = [
  {
    id: "dec",
    period: "Dec 2025",
    paidDate: "Dec 15, 2025",
    earnings: [
      { label: "Base Salary", amount: 50000 },
      { label: "Overtime (8 hrs)", amount: 2500 },
      { label: "Performance Bonus", amount: 5000 },
      { label: "Carry-over adjustment", amount: 3500 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 1125 },
      { label: "PhilHealth", amount: 500 },
      { label: "Pag-IBIG", amount: 100 },
      { label: "Withholding Tax", amount: 8608.33 },
      { label: "Company Benefits", amount: 5000 },
    ],
    netPay: 45666.67,
    carryOverFrom: "Nov 2025",
    carryOverAmount: 3500,
  },
  {
    id: "expired-nov",
    period: "Nov 2025",
    paidDate: "",
    earnings: [
      { label: "Base Salary", amount: 50000 },
      { label: "Overtime (4 hrs)", amount: 1250 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 1125 },
      { label: "PhilHealth", amount: 500 },
      { label: "Pag-IBIG", amount: 100 },
      { label: "Withholding Tax", amount: 8025 },
    ],
    netPay: 41500.00,
    status: 'expired',
  },
  {
    id: "1",
    period: "Nov 2025",
    paidDate: "Dec 5, 2025",
    earnings: [
      { label: "Base Salary", amount: 50000 },
      { label: "Overtime (4 hrs)", amount: 1250 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 1125 },
      { label: "PhilHealth", amount: 500 },
      { label: "Pag-IBIG", amount: 100 },
      { label: "Withholding Tax", amount: 8025 },
    ],
    netPay: 41500.00,
  },
  {
    id: "2",
    period: "Oct 2025",
    paidDate: "Nov 5, 2025",
    earnings: [
      { label: "Base Salary", amount: 50000 },
      { label: "Overtime (8 hrs)", amount: 2500 },
      { label: "Performance Bonus", amount: 5000 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 1125 },
      { label: "PhilHealth", amount: 500 },
      { label: "Pag-IBIG", amount: 100 },
      { label: "Withholding Tax", amount: 8608.33 },
      { label: "Company Benefits", amount: 5000 },
    ],
    netPay: 42166.67,
  },
  {
    id: "3",
    period: "Sep 2025",
    paidDate: "Oct 5, 2025",
    earnings: [
      { label: "Base Salary", amount: 50000 },
      { label: "Overtime (8 hrs)", amount: 2500 },
      { label: "Performance Bonus", amount: 5000 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 1125 },
      { label: "PhilHealth", amount: 500 },
      { label: "Pag-IBIG", amount: 100 },
      { label: "Withholding Tax", amount: 8608.33 },
      { label: "Company Benefits", amount: 5000 },
    ],
    netPay: 42166.67,
  },
];

const F41v6_EmployeeDashboardPage = () => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData>(payslipsData[0]);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentPrefill, setAdjustmentPrefill] = useState<{
    type?: string;
    category?: string;
    amount?: string;
    rejectedId?: string;
    hours?: number;
    days?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  const candidateProfile = {
    name: "Maria Santos",
    firstName: "Maria",
    role: "Senior Backend Engineer",
    currency: "PHP",
    country: "Philippines"
  };

  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 300);
  }, []);

  const handleViewDetails = (payslipId?: string) => {
    const payslip = payslipsData.find(p => p.id === payslipId) || payslipsData[0];
    setSelectedPayslip(payslip);
    setBreakdownOpen(true);
  };

  const handleDownload = (payslipId: string) => {
    console.log("Download payslip:", payslipId);
  };

  const handleRequestAdjustment = (
    type?: string,
    category?: string,
    amount?: string,
    rejectedId?: string,
    hours?: number,
    date?: string,
    startTime?: string,
    endTime?: string,
    days?: number
  ) => {
    setAdjustmentPrefill({ type, category, amount, rejectedId, hours, date, startTime, endTime, days });
    setAdjustmentModalOpen(true);
  };

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar 
            userName={candidateProfile.name} 
            profileSettingsUrl="/flows/employee-profile-settings-v6?returnUrl=/candidate-dashboard-employee-v6" 
            dashboardUrl="/candidate-dashboard-employee-v6" 
          />

          <div className="flex-1">
            <AgentLayout context="Employee Dashboard v6">
              <main className="flex-1 min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
                {/* Static background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                  <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10" style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))'
                  }} />
                  <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8" style={{
                    background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))'
                  }} />
                </div>

                <div className="max-w-5xl mx-auto p-8 pb-32 space-y-6 relative z-10">
                  {/* Agent Header */}
                  <AgentHeader 
                    title={`Welcome back, ${candidateProfile.firstName}!`} 
                    subtitle="Candidate Dashboard — Employee" 
                    showPulse={true} 
                    isActive={false} 
                    showInput={false} 
                  />

                  {/* Tabs: Payroll / Adjustments */}
                  <Tabs defaultValue="payroll" className="w-full">
                    <div className="flex justify-center mb-6">
                      <TabsList>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                        <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="payroll" className="mt-0 space-y-6">
                      {/* Hero Card with Last/Next Payout */}
                      <F41v6_PayoutHeroCard 
                        onViewDetails={handleViewDetails}
                        currency={candidateProfile.currency}
                      />
                      <F41v6_PayslipsSection 
                        currency={candidateProfile.currency}
                        onDownload={handleDownload}
                        onViewDetails={handleViewDetails}
                      />
                    </TabsContent>

                    <TabsContent value="adjustments" className="mt-0">
                      <F41v6_AdjustmentsSection 
                        onRequestAdjustment={handleRequestAdjustment}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </main>
            </AgentLayout>
          </div>

          {/* Breakdown Drawer */}
          <F41v6_PayoutBreakdownDrawer
            open={breakdownOpen}
            onOpenChange={setBreakdownOpen}
            currency={candidateProfile.currency}
            period={selectedPayslip.period}
            paidDate={selectedPayslip.paidDate}
            earnings={selectedPayslip.earnings}
            deductions={selectedPayslip.deductions}
            netPay={selectedPayslip.netPay}
            isExpired={selectedPayslip.status === 'expired'}
            carryOverFrom={selectedPayslip.carryOverFrom}
          />

          {/* Adjustment Modal */}
          <F41v6_AdjustmentModal
            open={adjustmentModalOpen}
            onOpenChange={setAdjustmentModalOpen}
            currency={candidateProfile.currency}
            initialType={adjustmentPrefill.type as any}
            initialExpenseCategory={adjustmentPrefill.category}
            initialExpenseAmount={adjustmentPrefill.amount}
            rejectedId={adjustmentPrefill.rejectedId}
            initialHours={adjustmentPrefill.hours}
            initialDays={adjustmentPrefill.days}
            initialDate={adjustmentPrefill.date}
            initialStartTime={adjustmentPrefill.startTime}
            initialEndTime={adjustmentPrefill.endTime}
          />
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F41v6_EmployeeDashboardPage;
