/**
 * Flow 4.1 — Employee Dashboard v4 (UI: v2)
 * 
 * Action-first employee dashboard focused on payroll readiness.
 * Documents moved to Profile → Documents section.
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { F41v4_UpcomingPayCard, F41v4_TimeOffSection, F41v4_TimeOffRequestDrawer } from "@/components/flows/employee-dashboard-v4";

const F41v4_EmployeeDashboardPage = () => {
  const [timeOffDrawerOpen, setTimeOffDrawerOpen] = useState(false);

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
            profileSettingsUrl="/flows/employee-profile-settings-v4?returnUrl=/candidate-dashboard-employee-v4" 
            dashboardUrl="/candidate-dashboard-employee-v4" 
          />

          <div className="flex-1">
            <AgentLayout context="Employee Dashboard v4">
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

                  {/* Main Content */}
                  <div className="space-y-4">
                    {/* Upcoming Pay Card - T-5 Confirmation */}
                    <F41v4_UpcomingPayCard />
                    
                    {/* Time Off Section - First-class dashboard block */}
                    <F41v4_TimeOffSection onRequestTimeOff={() => setTimeOffDrawerOpen(true)} />
                  </div>
                </div>
              </main>
            </AgentLayout>
          </div>
          
          {/* Dedicated Time Off Request Drawer - at root level for proper z-index */}
          <F41v4_TimeOffRequestDrawer 
            open={timeOffDrawerOpen} 
            onOpenChange={setTimeOffDrawerOpen} 
          />
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F41v4_EmployeeDashboardPage;
