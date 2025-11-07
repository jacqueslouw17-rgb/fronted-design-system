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
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { PipelineView } from "@/components/contract-flow/PipelineView";

const PayrollBatch: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { isSpeaking } = useAgentState();

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
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
                      isActive={isSpeaking}
                      enableWordHighlight={true}
                      showInput={false}
                      tags={
                        <AgentSuggestionChips
                          chips={[
                            {
                              label: "Any Updates?",
                              variant: "default",
                            },
                            {
                              label: "Ask Kurt",
                              variant: "default",
                            },
                          ]}
                        />
                      }
                    />

                    {/* Pipeline Tracking - Full Width */}
                    <div className="space-y-4">
                      <div className="mt-3">
                        <PipelineView 
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
          </AgentLayout>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default PayrollBatch;
