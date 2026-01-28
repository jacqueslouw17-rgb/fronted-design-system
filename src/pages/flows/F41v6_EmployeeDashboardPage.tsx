/**
 * Flow 4.1 — Employee Dashboard v6 (UI: v4)
 * 
 * Action-first employee dashboard focused on payroll readiness.
 * Documents moved to Profile → Documents section.
 * INDEPENDENT from v5 - changes here do not affect other flows.
 */

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  F41v6_UpcomingPayCard, 
  F41v6_TimeOffSection, 
  F41v6_TimeOffRequestDrawer,
  F41v6_AdjustmentsSection,
  F41v6_AdjustmentModal
} from "@/components/flows/employee-dashboard-v6";
import type { RequestType } from "@/components/flows/employee-dashboard-v6/F41v6_AdjustmentModal";

const F41v6_EmployeeDashboardPage = () => {
  const [timeOffDrawerOpen, setTimeOffDrawerOpen] = useState(false);
  const [timeOffRejectedId, setTimeOffRejectedId] = useState<string | undefined>(undefined);
  const [timeOffRejectionReason, setTimeOffRejectionReason] = useState<string | undefined>(undefined);
  const [timeOffInitialLeaveType, setTimeOffInitialLeaveType] = useState<string | undefined>(undefined);
  const [timeOffInitialStartDate, setTimeOffInitialStartDate] = useState<string | undefined>(undefined);
  const [timeOffInitialEndDate, setTimeOffInitialEndDate] = useState<string | undefined>(undefined);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentInitialType, setAdjustmentInitialType] = useState<RequestType>(null);
  const [adjustmentInitialCategory, setAdjustmentInitialCategory] = useState('');
  const [adjustmentInitialAmount, setAdjustmentInitialAmount] = useState('');
  const [adjustmentInitialHours, setAdjustmentInitialHours] = useState<number | undefined>(undefined);
  const [adjustmentInitialDate, setAdjustmentInitialDate] = useState<string | undefined>(undefined);
  const [adjustmentInitialStartTime, setAdjustmentInitialStartTime] = useState<string | undefined>(undefined);
  const [adjustmentInitialEndTime, setAdjustmentInitialEndTime] = useState<string | undefined>(undefined);
  const [adjustmentRejectedId, setAdjustmentRejectedId] = useState<string | undefined>(undefined);

  const candidateProfile = {
    name: "Maria Santos",
    firstName: "Maria",
    role: "Senior Backend Engineer",
    salary: "$85,000",
    currency: "PHP",
    startDate: "March 15, 2024",
    noticePeriod: "30 days",
    pto: "25 days",
    country: "Philippines"
  };

  // Handler to open adjustment modal with optional pre-fill
  const handleRequestAdjustment = (type?: string, category?: string, amount?: string, rejectedId?: string, hours?: number, date?: string, startTime?: string, endTime?: string) => {
    const typeMap: Record<string, RequestType> = {
      'expense': 'expense',
      'overtime': 'overtime',
      'bonus-correction': 'bonus-correction'
    };
    setAdjustmentInitialType(type ? typeMap[type] || null : null);
    setAdjustmentInitialCategory(category || '');
    setAdjustmentInitialAmount(amount || '');
    setAdjustmentInitialHours(hours);
    setAdjustmentInitialDate(date);
    setAdjustmentInitialStartTime(startTime);
    setAdjustmentInitialEndTime(endTime);
    setAdjustmentRejectedId(rejectedId);
    setAdjustmentModalOpen(true);
  };

  const handleAdjustmentModalClose = (open: boolean) => {
    setAdjustmentModalOpen(open);
    if (!open) {
      setAdjustmentInitialType(null);
      setAdjustmentInitialCategory('');
      setAdjustmentInitialAmount('');
      setAdjustmentInitialHours(undefined);
      setAdjustmentInitialDate(undefined);
      setAdjustmentInitialStartTime(undefined);
      setAdjustmentInitialEndTime(undefined);
      setAdjustmentRejectedId(undefined);
    }
  };

  // Handler to open time off drawer with optional rejection data
  const handleRequestTimeOff = (rejectedId?: string, leaveType?: string, startDate?: string, endDate?: string, rejectionReason?: string) => {
    setTimeOffRejectedId(rejectedId);
    setTimeOffRejectionReason(rejectionReason);
    setTimeOffInitialLeaveType(leaveType);
    setTimeOffInitialStartDate(startDate);
    setTimeOffInitialEndDate(endDate);
    setTimeOffDrawerOpen(true);
  };

  const handleTimeOffDrawerClose = (open: boolean) => {
    setTimeOffDrawerOpen(open);
    if (!open) {
      setTimeOffRejectedId(undefined);
      setTimeOffRejectionReason(undefined);
      setTimeOffInitialLeaveType(undefined);
      setTimeOffInitialStartDate(undefined);
      setTimeOffInitialEndDate(undefined);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.6
        }
      });
    }, 300);
  }, []);

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

                  {/* Payroll / Leaves Tab Toggle */}
                  <Tabs defaultValue="payroll" className="w-full">
                    <div className="flex justify-center mb-6">
                      <TabsList className="bg-muted/50 p-1 rounded-full">
                        <TabsTrigger 
                          value="payroll" 
                          className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                          Payroll
                        </TabsTrigger>
                        <TabsTrigger 
                          value="leaves" 
                          className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                          Leaves
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Payroll Tab Content */}
                    <TabsContent value="payroll" className="space-y-4 mt-0">
                      <F41v6_UpcomingPayCard />
                      <F41v6_AdjustmentsSection onRequestAdjustment={handleRequestAdjustment} />
                    </TabsContent>

                    {/* Leaves Tab Content */}
                    <TabsContent value="leaves" className="space-y-4 mt-0">
                      <F41v6_TimeOffSection onRequestTimeOff={handleRequestTimeOff} />
                    </TabsContent>
                  </Tabs>
                </div>
              </main>
            </AgentLayout>
          </div>
          
          {/* Dedicated Time Off Request Drawer - at root level for proper z-index */}
          <F41v6_TimeOffRequestDrawer 
            open={timeOffDrawerOpen} 
            onOpenChange={handleTimeOffDrawerClose}
            rejectedId={timeOffRejectedId}
            rejectionReason={timeOffRejectionReason}
            initialLeaveType={timeOffInitialLeaveType}
            initialStartDate={timeOffInitialStartDate}
            initialEndDate={timeOffInitialEndDate}
          />
          
          {/* Adjustment Modal - at root level for proper z-index */}
          <F41v6_AdjustmentModal
            open={adjustmentModalOpen}
            onOpenChange={handleAdjustmentModalClose}
            currency={candidateProfile.currency}
            initialType={adjustmentInitialType}
            initialExpenseCategory={adjustmentInitialCategory}
            initialExpenseAmount={adjustmentInitialAmount}
            initialHours={adjustmentInitialHours}
            initialDate={adjustmentInitialDate}
            initialStartTime={adjustmentInitialStartTime}
            initialEndTime={adjustmentInitialEndTime}
            rejectedId={adjustmentRejectedId}
          />
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F41v6_EmployeeDashboardPage;
