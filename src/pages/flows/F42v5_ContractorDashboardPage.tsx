/**
 * Flow 4.2 — Contractor Dashboard v5
 * 
 * Contractor-specific dashboard with invoice status states and adjustment workflow.
 * Aligned with Flow 4.1 Employee Dashboard v2 patterns.
 * 
 * INDEPENDENT: Changes here do NOT affect v4 or any other flow.
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { F42v5_UpcomingInvoiceCard } from "@/components/flows/contractor-dashboard-v5";

const F42v5_ContractorDashboardPage = () => {
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

                <div className="max-w-5xl mx-auto p-8 pb-32 space-y-6 relative z-10">
                  {/* Agent Header */}
                  <AgentHeader 
                    title={`Welcome back, ${candidateProfile.firstName}!`} 
                    subtitle="Candidate Dashboard — Contractor" 
                    showPulse={true} 
                    isActive={false} 
                    showInput={false} 
                  />

                  {/* Main Content */}
                  <div className="space-y-6">
                    {/* Upcoming Invoice Card - Primary Focus */}
                    <F42v5_UpcomingInvoiceCard />
                  </div>
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F42v5_ContractorDashboardPage;
