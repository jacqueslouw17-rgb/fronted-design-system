import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import { Button } from "@/components/ui/button";
import { BellRing, MessageCircle } from "lucide-react";
import FloatingKurtButton from "@/components/FloatingKurtButton";

const PayrollBatch: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { isSpeaking, addMessage, setLoading, setOpen } = useAgentState();

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
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
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
      text: response,
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

          {/* Payroll Pipeline Main Area with Agent Layout */}
          <AgentLayout context="Payroll Pipeline">
            <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative">
              {/* Static background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                     style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                     style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
              </div>
              <div className="relative z-10">
                <motion.div 
                  key="payroll-pipeline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="max-w-7xl mx-auto p-8 pb-32 space-y-8">
                    {/* Agent Header */}
                    <AgentHeader
                      title={`Welcome ${userData.firstName}, review payroll`}
                      subtitle="Kurt can help with: FX rates, compliance checks, or payment execution."
                      showPulse={true}
                      simplified={true}
                      tags={
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKurtAction('any-updates')}
                            className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all"
                          >
                            <BellRing className="h-3.5 w-3.5" />
                            Any Updates?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKurtAction('ask-kurt')}
                            className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Ask Kurt
                          </Button>
                        </div>
                      }
                    />

                    {/* Pipeline Tracking - Full Width */}
                    <div className="space-y-4">
                      <div className="mt-3">
                        <PipelineView 
                          mode="payroll-ready"
                          contractors={[
                            {
                              id: "cert-1",
                              name: "Emma Wilson",
                              country: "United Kingdom",
                              countryFlag: "🇬🇧",
                              role: "Senior Backend Developer",
                              salary: "£6,500/mo",
                              status: "PAYROLL_PENDING" as const,
                              employmentType: "employee" as const,
                              payrollMonth: "current" as const,
                            },
                            {
                              id: "cert-2",
                              name: "Luis Hernandez",
                              country: "Spain",
                              countryFlag: "🇪🇸",
                              role: "Product Manager",
                              salary: "€5,200/mo",
                              status: "IN_BATCH" as const,
                              employmentType: "contractor" as const,
                              payrollMonth: "current" as const,
                            },
                            {
                              id: "cert-3",
                              name: "Yuki Tanaka",
                              country: "Japan",
                              countryFlag: "🇯🇵",
                              role: "UI/UX Designer",
                              salary: "¥650,000/mo",
                              status: "EXECUTING" as const,
                              employmentType: "contractor" as const,
                              payrollMonth: "current" as const,
                            },
                            {
                              id: "cert-4",
                              name: "Sophie Dubois",
                              country: "France",
                              countryFlag: "🇫🇷",
                              role: "Data Scientist",
                              salary: "€5,800/mo",
                              status: "PAID" as const,
                              employmentType: "employee" as const,
                              payrollMonth: "last" as const,
                            },
                            {
                              id: "cert-5",
                              name: "Ahmed Hassan",
                              country: "Egypt",
                              countryFlag: "🇪🇬",
                              role: "Mobile Developer",
                              salary: "EGP 45,000/mo",
                              status: "ON_HOLD" as const,
                              employmentType: "contractor" as const,
                              payrollMonth: "current" as const,
                            },
                            {
                              id: "cert-6",
                              name: "Anna Kowalski",
                              country: "Poland",
                              countryFlag: "🇵🇱",
                              role: "QA Engineer",
                              salary: "PLN 15,000/mo",
                              status: "PAYROLL_PENDING" as const,
                              employmentType: "employee" as const,
                              payrollMonth: "current" as const,
                            },
                            {
                              id: "cert-7",
                              name: "Marcus Silva",
                              country: "Brazil",
                              countryFlag: "🇧🇷",
                              role: "DevOps Engineer",
                              salary: "R$ 18,000/mo",
                              status: "IN_BATCH" as const,
                              employmentType: "contractor" as const,
                              payrollMonth: "current" as const,
                            },
                            {
                              id: "cert-8",
                              name: "Priya Sharma",
                              country: "India",
                              countryFlag: "🇮🇳",
                              role: "Software Engineer",
                              salary: "₹450,000/mo",
                              status: "CERTIFIED" as const,
                              employmentType: "employee" as const,
                              payrollMonth: "current" as const,
                            },
                          ]}
                        />
                      </div>
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

export default PayrollBatch;
