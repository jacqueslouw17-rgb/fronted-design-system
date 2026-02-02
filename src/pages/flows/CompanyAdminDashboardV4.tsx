/**
 * Flow 6 — Company Admin Dashboard v4 (Agent)
 * 
 * Isolated clone of v3. Changes here do NOT affect v3 or any other versions.
 * Uses CA4_ prefixed components for complete isolation.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import { CA4_PayrollSection, CA4_LeavesTab } from "@/components/flows/company-admin-v4";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

const CompanyAdminDashboardV4: React.FC = () => {
  const {
    isOpen: isDrawerOpen,
    toggle: toggleDrawer
  } = useDashboardDrawer();
  const {
    addMessage,
    setLoading,
    setOpen
  } = useAgentState();

  // Main dashboard tab state
  const [activeTab, setActiveTab] = useState<"payroll" | "leaves">("payroll");

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const handleKurtAction = async (action: string) => {
    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    });
    setOpen(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    let response = '';
    if (action === 'any-updates') {
      response = `📊 Payroll Status Update\n\n✅ 2 contractors ready for batch\n🔄 2 contractors in current batch\n⚡ 1 contractor executing payment\n💰 1 contractor paid (last month)\n⏸️ 1 contractor on hold\n\nYou have 2 contractors ready to be added to the current payroll batch.`;
    } else if (action === 'ask-kurt') {
      response = `I'm here to help you with payroll! 
      
You can ask me about:

💱 FX rates and currency conversions
📋 Compliance checks and requirements
💸 Payment execution and timing
🔍 Batch review and adjustments
⚠️ Exception handling

**Try asking:**
• "What's the total for this batch?"
• "Any compliance issues?"
• "Show me FX rates"
• "When will payments execute?"`;
    }
    addMessage({
      role: 'kurt',
      text: response
    });
    setLoading(false);
  };

  return (
    <RoleLensProvider initialRole="admin">
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

          {/* Main Area with Agent Layout */}
          <AgentLayout context="Payroll Pipeline (Agent)">
            <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative min-h-full">
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
                  <div className="max-w-7xl mx-auto p-8 pb-32 space-y-2">
                    {/* Agent Header with Badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <AgentHeader 
                        title="Company Admin · Payroll" 
                        subtitle="Kurt can help with: FX rates, compliance checks, or payment execution." 
                        showPulse={true} 
                        showInput={false} 
                        simplified={false}
                      />
                      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                        <Bot className="h-3 w-3" />
                        Agent
                      </Badge>
                    </div>

                    {/* Tab Navigation */}
                    <div className="pt-4">
                      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "payroll" | "leaves")}>
                        <TabsList className="h-9">
                          <TabsTrigger value="payroll" className="text-xs px-4">Payroll</TabsTrigger>
                          <TabsTrigger value="leaves" className="text-xs px-4">Leaves</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-4">
                      {activeTab === "payroll" && (
                        <CA4_PayrollSection payPeriod="January 2026" />
                      )}
                      
                      {activeTab === "leaves" && (
                        <CA4_LeavesTab />
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            <FloatingKurtButton />
          </AgentLayout>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default CompanyAdminDashboardV4;
