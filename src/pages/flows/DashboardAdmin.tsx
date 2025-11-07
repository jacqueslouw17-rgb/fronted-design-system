import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import FloatingKurtButton from "@/components/FloatingKurtButton";

// Mock contractors for pipeline view - empty state for first time
const mockContractors: any[] = [];

const DashboardAdmin = () => {
  const navigate = useNavigate();

  const handleKurtAction = async (action: string) => {
    const { useAgentState } = await import('@/hooks/useAgentState');
    const { addMessage, setLoading, setOpen } = useAgentState.getState();
    
    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    });

    setOpen(true);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    let response = '';
    
    switch(action) {
      case 'track-progress':
        response = "📊 Latest Onboarding Stats\n\nHere's the latest onboarding completion stats for your team:\n\n✅ 3 contractors fully certified\n🔄 2 contractors in onboarding (avg. 67% complete)\n⏳ 1 contractor awaiting signature\n📝 2 contractors drafting contracts\n\nMaria Santos is at 80% completion. Want me to send her a reminder?";
        break;
      case 'resend-link':
        response = "✅ Link Re-sent\n\nDone! I've re-sent Maria's onboarding link and notified her via email.\n\nShe was last active 3 hours ago and completed 4 out of 6 items. I'll remind her again in 24 hours if she doesn't complete it.";
        break;
      case 'mark-complete':
        response = "✅ Marking as Complete\n\nMarking Maria's record as completed. Do you want to archive her onboarding card as well?\n\nThis will:\n• Move her to 'Certified' status\n• Trigger payroll setup\n• Archive the onboarding card";
        break;
      default:
        response = `I'll help you with "${action}". Let me process that for you.`;
    }

    addMessage({
      role: 'kurt',
      text: response,
    });

    setLoading(false);
  };

  return (
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
          {/* Top Header */}
          <Topbar 
            userName="Joe User"
            profileSettingsUrl="/admin/profile-settings"
            dashboardUrl="/flows/admin-dashboard"
          />

          {/* Main Content Area with Agent Layout */}
          <AgentLayout context="Admin Dashboard">
            <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
              {/* Static background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                     style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                     style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
              </div>

              <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-20 sm:pb-32 space-y-6 sm:space-y-8 relative z-10">
                {/* Agent Header */}
                <AgentHeader
                  title={`Welcome, Joe, get to work!`}
                  subtitle="Your dashboard is ready for action."
                  showPulse={true}
                  simplified={true}
                />

                {/* Pipeline Content */}
                {mockContractors.length === 0 ? (
                  <div className="max-w-4xl mx-auto">
                    <Card className="border border-border/20 bg-background/60 backdrop-blur-sm shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-20 px-6">
                        {/* Icon with subtle background */}
                        <div className="rounded-full bg-primary/5 p-6 mb-6">
                          <Users className="h-12 w-12 text-primary/40" />
                        </div>
                        
                        {/* Headline */}
                        <h3 className="text-2xl font-semibold mb-3 text-foreground">
                          Your pipeline is ready.
                        </h3>
                        
                        {/* Subtext */}
                        <p className="text-[15px] text-[#6B7280] text-center max-w-lg leading-relaxed mb-6">
                          Once contracts are finalized, your first records will appear here. You'll be able to track onboarding, payroll, and compliance progress in real time.
                        </p>
                        
                        {/* Disabled CTA Button */}
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            disabled
                            className="cursor-not-allowed opacity-50"
                            title="This action will be available once the pilot setup is complete."
                          >
                            Add First Contract
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <PipelineView contractors={mockContractors} />
                )}
              </div>
            </main>
            <FloatingKurtButton />
          </AgentLayout>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default DashboardAdmin;
