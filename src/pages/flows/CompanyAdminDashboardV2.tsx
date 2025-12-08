/**
 * Flow 6 – Company Admin Dashboard v2
 * 
 * Features:
 * - Two-toggle header: Workers | Payroll
 * - Workers tab: certified workers list (cloned from v1)
 * - Payroll tab: payroll overview cloned from Flow 7 v1 with read-only Country Rules
 */

import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Topbar from "@/components/dashboard/Topbar";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import confetti from "canvas-confetti";
import { F6v2_WorkersTab } from "@/components/flows/company-admin-v2/F6v2_WorkersTab";
import { F6v2_PayrollTab } from "@/components/flows/company-admin-v2/F6v2_PayrollTab";

// Mock data for certified workers (v2-scoped copy)
const mockCertifiedWorkersV2 = [{
  id: "1",
  name: "Maria Santos",
  role: "Senior Backend Engineer",
  country: "Philippines",
  countryFlag: "🇵🇭",
  employmentType: "Contractor" as const,
  salary: "PHP 85,000/mo",
  status: "Certified"
}, {
  id: "2",
  name: "John Chen",
  role: "Product Designer",
  country: "Singapore",
  countryFlag: "🇸🇬",
  employmentType: "Employee" as const,
  salary: "SGD 6,500/mo",
  status: "Certified"
}, {
  id: "3",
  name: "Sarah Williams",
  role: "Frontend Developer",
  country: "United Kingdom",
  countryFlag: "🇬🇧",
  employmentType: "Contractor" as const,
  salary: "GBP 4,800/mo",
  status: "Certified"
}];

const CompanyAdminDashboardV2 = () => {
  const [viewMode, setViewMode] = useState<"workers" | "payroll">("workers");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock company data - in production, this would come from auth context
  const companyName = "Acme Corp";

  // Celebration confetti on mount
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
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
          {/* Top Header - No company dropdown for single-tenant */}
          <Topbar 
            userName="Admin User" 
            profileSettingsUrl="/admin/profile-settings-v2" 
            dashboardUrl="/flows/company-admin-dashboard-v2" 
          />

          {/* Main Content Area with Agent Layout */}
          <AgentLayout context="Company Admin Dashboard v2">
            <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
              {/* Static background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                <div 
                  className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10" 
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))"
                  }} 
                />
                <div 
                  className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8" 
                  style={{
                    background: "linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))"
                  }} 
                />
              </div>

              <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-20 sm:pb-32 space-y-2 relative z-10">
                {/* Agent Header */}
                <AgentHeader 
                  title={`Welcome back, ${companyName}!`} 
                  subtitle={viewMode === "workers" 
                    ? "View your certified workers and access their contracts and certificates." 
                    : "Kurt can help with: FX rates, compliance checks, or payment execution."
                  }
                  showPulse={true} 
                  showInput={false} 
                  simplified={false} 
                />

                {/* View Mode Toggle - Same style as Flow 7 */}
                <div className="flex items-center justify-center py-2">
                  <Tabs 
                    value={viewMode} 
                    onValueChange={value => setViewMode(value as "workers" | "payroll")}
                  >
                    <TabsList className="grid w-[280px] grid-cols-2">
                      <TabsTrigger value="workers">Workers</TabsTrigger>
                      <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Conditional View */}
                <div className="pt-6">
                  {viewMode === "workers" ? (
                    <F6v2_WorkersTab 
                      workers={mockCertifiedWorkersV2}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  ) : (
                    <F6v2_PayrollTab />
                  )}
                </div>
              </div>
            </main>
          </AgentLayout>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CompanyAdminDashboardV2;
