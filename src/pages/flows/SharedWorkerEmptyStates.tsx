/**
 * Shared – Worker Dashboard Empty States
 * 
 * Showcase page demonstrating first-time worker experience
 * for both Flow 4.1 (Employee) and Flow 4.2 (Contractor).
 * 
 * Cloned from Flow 4.1 Employee Dashboard v8 (Next) layout.
 * INDEPENDENT: Changes here do NOT affect any other flow.
 */

import { useEffect } from "react";
import "@/styles/v7-glass-theme.css";
import "@/styles/v7-glass-portals.css";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkerEmptyPayroll } from "@/components/flows/empty-states/WorkerEmptyPayroll";
import { WorkerEmptyAdjustments } from "@/components/flows/empty-states/WorkerEmptyAdjustments";
import { toast } from "sonner";

const SharedWorkerEmptyStates = () => {
  const candidateProfile = {
    name: "Maria Santos",
    firstName: "Maria",
  };

  // Activate v7 glass portal overrides on body
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

  const handleRequestAdjustment = () => {
    toast.info("Adjustment modal would open here");
  };

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen v7-glass-bg">
          <div className="v7-orb-center" />

          <Topbar 
            userName={candidateProfile.name} 
            dashboardUrl="/flows/shared-worker-empty-states"
            forceFixed
          />

          <div className="flex-1">
            <AgentLayout context="Worker Empty States">
              <main className="flex-1 min-h-screen text-foreground relative overflow-hidden">
                <div className="max-w-5xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-6 relative z-10 pt-16 sm:pt-20">
                  <AgentHeader 
                    title={`Welcome, ${candidateProfile.firstName}!`} 
                    subtitle="Candidate Dashboard — Employee" 
                    showPulse={true} 
                    isActive={false} 
                    showInput={false} 
                  />

                  <Tabs defaultValue="payroll" className="w-full">
                    <div className="flex justify-center mb-6">
                      <TabsList>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                        <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="payroll" className="mt-0 space-y-4">
                      <WorkerEmptyPayroll />
                    </TabsContent>

                    <TabsContent value="adjustments" className="mt-0">
                      <WorkerEmptyAdjustments onRequestAdjustment={handleRequestAdjustment} />
                    </TabsContent>
                  </Tabs>
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default SharedWorkerEmptyStates;
