/**
 * Flow 4.2 — Contractor Dashboard v5
 * 
 * Contractor-specific dashboard with invoice status states and adjustment workflow.
 * Aligned with Flow 4.1 Employee Dashboard v2 patterns.
 * 
 * INDEPENDENT: Changes here do NOT affect v4 or any other flow.
 */

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { 
  F42v5_UpcomingInvoiceCard,
  F42v5_AdjustmentsSection,
  F42v5_AdjustmentDrawer
} from "@/components/flows/contractor-dashboard-v5";
import { useF42v5_DashboardStore } from "@/stores/F42v5_DashboardStore";
import type { ContractorRequestType } from "@/components/flows/contractor-dashboard-v5/F42v5_AdjustmentDrawer";

const F42v5_ContractorDashboardPage = () => {
  const { currency, contractType } = useF42v5_DashboardStore();
  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false);
  const [adjustmentInitialType, setAdjustmentInitialType] = useState<ContractorRequestType>(null);
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
    currency: "USD",
    startDate: "March 15, 2024",
    noticePeriod: "30 days",
    pto: "25 days",
    country: "Philippines"
  };

  // Handler to open adjustment drawer with optional pre-fill
  const handleRequestAdjustment = (type?: string, category?: string, amount?: string, rejectedId?: string, hours?: number, date?: string, startTime?: string, endTime?: string) => {
    const typeMap: Record<string, ContractorRequestType> = {
      'expense': 'expense',
      'additional-hours': 'additional-hours',
      'bonus': 'bonus'
    };
    setAdjustmentInitialType(type ? typeMap[type] || null : null);
    setAdjustmentInitialCategory(category || '');
    setAdjustmentInitialAmount(amount || '');
    setAdjustmentInitialHours(hours);
    setAdjustmentInitialDate(date);
    setAdjustmentInitialStartTime(startTime);
    setAdjustmentInitialEndTime(endTime);
    setAdjustmentRejectedId(rejectedId);
    setAdjustmentDrawerOpen(true);
  };

  const handleAdjustmentDrawerClose = (open: boolean) => {
    setAdjustmentDrawerOpen(open);
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

  // One-time success animation on load
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
            profileSettingsUrl="/flows/contractor-profile-settings-v5?returnUrl=/candidate-dashboard-contractor-v5" 
            dashboardUrl="/candidate-dashboard-contractor-v5" 
          />

          <div className="flex-1">
            <AgentLayout context="Contractor Dashboard v5">
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

                <div className="max-w-5xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-6 relative z-10">
                  {/* Agent Header */}
                  <AgentHeader 
                    title={`Welcome back, ${candidateProfile.firstName}!`} 
                    subtitle="Candidate Dashboard — Contractor" 
                    showPulse={true} 
                    isActive={false} 
                    showInput={false} 
                  />

                  {/* Main Content */}
                  <div className="space-y-4">
                    {/* Upcoming Invoice Card - Primary Focus */}
                    <F42v5_UpcomingInvoiceCard />
                    
                    {/* Adjustments Section */}
                    <F42v5_AdjustmentsSection onRequestAdjustment={handleRequestAdjustment} />
                  </div>
                </div>
              </main>
            </AgentLayout>
          </div>
          
          {/* Adjustment Drawer - at root level for proper z-index */}
          <F42v5_AdjustmentDrawer
            open={adjustmentDrawerOpen}
            onOpenChange={handleAdjustmentDrawerClose}
            currency={currency}
            contractType={contractType}
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

export default F42v5_ContractorDashboardPage;
