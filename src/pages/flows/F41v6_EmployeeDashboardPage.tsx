/**
 * Flow 4.1 — Employee Dashboard v6
 * 
 * Clean payout dashboard with hero tiles and payslips list.
 * INDEPENDENT from v5 - changes here do not affect other flows.
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { F41v6_PayoutHeroCard, F41v6_PayslipsSection } from "@/components/flows/employee-dashboard-v6";

const F41v6_EmployeeDashboardPage = () => {
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

  const handleViewDetails = () => {
    // Open breakdown drawer or navigate to details
    console.log("View details clicked");
  };

  const handleDownload = (payslipId: string) => {
    console.log("Download payslip:", payslipId);
  };

  const handleDownloadAll = () => {
    console.log("Download all payslips");
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

                  {/* Hero Card with Last/Next Payout */}
                  <F41v6_PayoutHeroCard 
                    onViewDetails={handleViewDetails}
                    currency={candidateProfile.currency}
                  />

                  {/* Payslips List */}
                  <F41v6_PayslipsSection 
                    currency={candidateProfile.currency}
                    onDownload={handleDownload}
                    onDownloadAll={handleDownloadAll}
                  />
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F41v6_EmployeeDashboardPage;
