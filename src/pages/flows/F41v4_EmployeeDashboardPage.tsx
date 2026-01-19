/**
 * Flow 4.1 — Employee Dashboard v4 (UI: v2)
 * 
 * Action-first employee dashboard focused on payroll readiness.
 * Documents moved to Profile → Documents section.
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { F41v4_UpcomingPayCard } from "@/components/flows/employee-dashboard-v4";

const F41v4_EmployeeDashboardPage = () => {
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
              <main className="flex-1 min-h-screen bg-gradient-to-br from-primary/[0.04] via-background to-secondary/[0.03] text-foreground relative overflow-hidden">
                {/* Subtle background accents */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-[0.04]" style={{
                    background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)'
                  }} />
                </div>

                <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 relative z-10">
                  {/* Hero Header */}
                  <div className="space-y-3">
                    <AgentHeader 
                      title={`Hey ${candidateProfile.firstName}, here's your pay overview`} 
                      subtitle="" 
                      showPulse={false} 
                      isActive={false} 
                      showInput={false} 
                    />
                    <p className="text-muted-foreground text-base max-w-xl">
                      Review and confirm your upcoming pay. Need to make changes? Submit adjustments before the window closes.
                    </p>
                  </div>

                  {/* Primary Action: Upcoming Pay Card */}
                  <div className="relative">
                    <F41v4_UpcomingPayCard />
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

export default F41v4_EmployeeDashboardPage;
