import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle2, 
  X,
  Download,
  MessageSquare,
  ExternalLink,
  BarChart3,
  GitBranch
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";

interface Worker {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  status: "certified";
  avatarUrl?: string;
}

// Empty state for first time users
const mockWorkers: Worker[] = [];

// Mock contractors for pipeline view - empty state for first time
const mockContractors: any[] = [];

// Metric Widget Component with hover toolbar
const MetricWidget = ({ title, value, trend, icon: Icon, onAskGenie, onExport, onDetails }: any) => {
  const [showToolbar, setShowToolbar] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
      className="relative"
    >
      <Card className="hover:shadow-lg transition-all h-full border border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-accent' : trend.startsWith('-') ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {trend} from last month
          </p>
        </CardContent>
      </Card>

      {/* Hover Micro-Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 flex gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg z-10"
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={onAskGenie}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={onExport}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={onDetails}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  
  // Check if user just completed onboarding
  const searchParams = new URLSearchParams(window.location.search);
  const isFirstTime = searchParams.get('onboarding') === 'complete';
  
  const welcomeTitle = isFirstTime ? "Welcome onboard, Joe! 🎉" : "Welcome Joe, get to work!";

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

              <div className="max-w-7xl mx-auto p-8 pb-32 space-y-8 relative z-10">
                {/* Agent Header */}
                <AgentHeader
                  title={welcomeTitle}
                  subtitle="Let's finalize contracts and complete onboarding."
                  showPulse={true}
                  isActive={false}
                  isMuted={isKurtMuted}
                  onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                  tags={
                    <div className="flex flex-wrap justify-center gap-2 px-4 mt-2">
                      {[
                        { id: 'track-progress', label: 'Track Progress' },
                        { id: 'resend-link', label: 'Resend Link' },
                        { id: 'mark-complete', label: 'Mark Complete' }
                      ].map((tag) => (
                        <motion.button
                          key={tag.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleKurtAction(tag.id)}
                          className="group relative px-3 py-1.5 rounded-full text-xs font-normal bg-background/60 hover:bg-primary/[0.03] hover:border-primary/30 border border-border/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <span className="text-foreground">{tag.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  }
                />

                {/* People Pipeline Tracking - Full Width */}
                <div className="space-y-4">
                  <Tabs defaultValue="pipeline" className="w-full">
                    <TabsList className="grid w-64 grid-cols-2 mx-auto mb-6 rounded-xl bg-card/60 backdrop-blur-sm border border-border/40 shadow-sm">
                      <TabsTrigger value="list" data-testid="tab-metrics">
                        <BarChart3 className="h-4 w-4" />
                        Metrics
                      </TabsTrigger>
                      <TabsTrigger value="pipeline" data-testid="tab-pipeline">
                        <GitBranch className="h-4 w-4" />
                        Pipeline View
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-6">
                      {/* Empty State for Metrics */}
                      <div className="max-w-5xl mx-auto">
                        <Card className="border-dashed border-border/40 bg-card/50 backdrop-blur-sm">
                          <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-full bg-muted p-4 mb-4">
                              <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No metrics yet</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                              Your metrics will appear here once you start sending offers and onboarding contractors.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="pipeline">
                      {mockContractors.length === 0 ? (
                        <div className="max-w-5xl mx-auto">
                          <Card className="border-dashed border-border/40 bg-card/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                              <div className="rounded-full bg-muted p-4 mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">No new offers yet</h3>
                              <p className="text-sm text-muted-foreground text-center max-w-md">
                                Send your first offer to a contractor to see them in your pipeline.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <PipelineView contractors={mockContractors} />
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </main>
          </AgentLayout>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default DashboardAdmin;
