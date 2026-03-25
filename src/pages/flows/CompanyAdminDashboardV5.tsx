/**
 * Flow 6 — Company Admin Dashboard v5 (Future)
 * 
 * Isolated clone of v4 with v7 Future glassmorphism theme.
 * Changes here do NOT affect v4 or any other versions.
 * 
 * @refresh reset
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import {
  CA5_PayrollSection,
  CA5_LeavesTab,
  CA5_AgentProvider,
  CA5_AgentChatPanel,
  CA5_KurtVisualizer,
  useCA5Agent,
} from "@/components/flows/company-admin-v5";

const CompanyAdminDashboardV5Content: React.FC = () => {
  const {
    isOpen: isDrawerOpen,
    toggle: toggleDrawer
  } = useDashboardDrawer();
  
  const { isOpen: isAgentOpen, highlights } = useCA5Agent();

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

  // Activate v7 glass portal overrides on body
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

  // Scroll-based topbar frosted glass — listen on the actual scroll container
  useEffect(() => {
    const scrollContainer = document.querySelector('.ca5-scroll-container');
    if (!scrollContainer) return;
    const onScroll = () => {
      const scrolled = scrollContainer.scrollTop > 16;
      document.body.classList.toggle("v7-topbar-scrolled", scrolled);
    };
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      document.body.classList.remove("v7-topbar-scrolled");
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden v7-glass-bg">
      {/* Floating orb */}
      <div className="v7-orb-center" />

      {/* Left: Full product (header + content) - responds to chat */}
      <motion.div
        className="flex flex-col h-full min-w-0 overflow-hidden"
        animate={{ 
          flex: isAgentOpen ? '1 1 0%' : '1 1 100%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Topbar — transparent at rest, frosted on scroll via v7 CSS */}
        <Topbar 
          userName={`${userData.firstName} ${userData.lastName}`} 
          isDrawerOpen={isDrawerOpen} 
          onDrawerToggle={toggleDrawer}
          profileSettingsUrl="/flow-6-v5/profile-settings?returnUrl=/flows/company-admin-dashboard-v5"
          forceFixed
        />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Dashboard Drawer */}
          <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Main Area — transparent bg, glass theme handles background */}
          <div className="flex-1 overflow-auto relative min-h-full">
            <div className="relative">
              <motion.div 
                key="payroll-pipeline-agent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-6 pt-16 sm:pt-20">
                  {/* Agent Header - Centered with frequency visualizer */}
                  <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-6">
                    {/* Kurt Frequency Visualizer - Interactive entry point */}
                    <CA5_KurtVisualizer />
                    
                    {/* Title & Subtitle */}
                    <div className="space-y-2 pt-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Company Admin · Payroll
                      </h1>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Ask about payroll, taxes, FX, or worker costs.
                      </p>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div>
                    {activeTab === "leaves" && (
                      <CA5_LeavesTab />
                    )}

                    {activeTab === "payroll" && (
                      <CA5_PayrollSection 
                        payPeriod={payrollCycleData.current.label} 
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </motion.div>

      {/* Right: Agent Chat Panel - completely outside product area */}
      <CA5_AgentChatPanel />
    </div>
  );
};

const CompanyAdminDashboardV5: React.FC = () => {
  return (
    <RoleLensProvider initialRole="admin">
      <CA5_AgentProvider>
        <CompanyAdminDashboardV5Content />
      </CA5_AgentProvider>
    </RoleLensProvider>
  );
};

export default CompanyAdminDashboardV5;
