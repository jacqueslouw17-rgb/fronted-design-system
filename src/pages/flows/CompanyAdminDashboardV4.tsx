/**
 * Flow 6 — Company Admin Dashboard v4 (Agent)
 * 
 * Agentic payroll dashboard where Kurt AI assistant drives the UI.
 * Changes here do NOT affect v3 or any other versions.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import {
  CA4_PayrollSection,
  CA4_LeavesTab,
  CA4_AgentProvider,
  CA4_AgentChatPanel,
  CA4_AskKurtButton,
  useCA4Agent,
} from "@/components/flows/company-admin-v4";
import { cn } from "@/lib/utils";

const CompanyAdminDashboardV4Content: React.FC = () => {
  const {
    isOpen: isDrawerOpen,
    toggle: toggleDrawer
  } = useDashboardDrawer();
  
  const { isOpen: isAgentOpen, highlights } = useCA4Agent();

  // Main dashboard tab state - defaults to payroll
  const [activeTab] = useState<"payroll" | "leaves">("payroll");

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  // Payroll cycle data
  const payrollCycleData = {
    current: {
      label: "January 2026",
      status: "active" as const,
    }
  };

  // Check if a card should be highlighted
  const isCardHighlighted = (cardId: string) => {
    return highlights.some(h => h.type === 'card' && h.id === cardId && h.active);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <Topbar 
        userName={`${userData.firstName} ${userData.lastName}`} 
        isDrawerOpen={isDrawerOpen} 
        onDrawerToggle={toggleDrawer} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Dashboard Drawer */}
        <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Dashboard Content */}
          <motion.div
            animate={{ 
              flex: isAgentOpen ? '1 1 0%' : '1 1 100%',
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative min-h-full"
          >
            {/* Static background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
              <div 
                className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10" 
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))'
                }} 
              />
              <div 
                className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8" 
                style={{
                  background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))'
                }} 
              />
            </div>
            
            <div className="relative z-10">
              <motion.div 
                key="payroll-pipeline-agent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="max-w-7xl mx-auto p-8 pb-32 space-y-6">
                  {/* Agent Header - Clean and inviting */}
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                        Company Admin · Payroll
                      </h1>
                      <p className="text-sm text-muted-foreground max-w-lg">
                        Ask anything about payroll, taxes, FX, or worker costs. I'll navigate the dashboard and open the right details for you.
                      </p>
                    </div>
                    <CA4_AskKurtButton />
                  </div>

                  {/* Tab Content */}
                  <div>
                    {activeTab === "leaves" && (
                      <CA4_LeavesTab />
                    )}

                    {activeTab === "payroll" && (
                      <CA4_PayrollSection 
                        payPeriod={payrollCycleData.current.label} 
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Agent Chat Panel */}
          <CA4_AgentChatPanel />
        </div>
      </main>
    </div>
  );
};

const CompanyAdminDashboardV4: React.FC = () => {
  return (
    <RoleLensProvider initialRole="admin">
      <CA4_AgentProvider>
        <CompanyAdminDashboardV4Content />
      </CA4_AgentProvider>
    </RoleLensProvider>
  );
};

export default CompanyAdminDashboardV4;
