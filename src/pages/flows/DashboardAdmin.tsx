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
      <Card className="hover:shadow-lg transition-all h-full">
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
  
  // Check if user just completed onboarding
  const searchParams = new URLSearchParams(window.location.search);
  const isFirstTime = searchParams.get('onboarding') === 'complete';
  
  const welcomeTitle = isFirstTime ? "Welcome onboard, Joe! 🎉" : "Welcome back, Joe! 👋";

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
            <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
              <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Agent Header */}
                <AgentHeader
                  title={welcomeTitle}
                  subtitle="You're all set. Start by sending an offer to your first contractor."
                  showPulse={true}
                  isActive={false}
                />

                {/* People Pipeline Tracking - Full Width */}
                <div className="space-y-4">
                  <Tabs defaultValue="pipeline" className="w-full">
                    <TabsList className="grid w-64 mx-auto grid-cols-2 mb-6">
                      <TabsTrigger value="list" className="flex items-center gap-2" data-testid="tab-metrics">
                        <BarChart3 className="h-4 w-4" />
                        Metrics
                      </TabsTrigger>
                      <TabsTrigger value="pipeline" className="flex items-center gap-2" data-testid="tab-pipeline">
                        <GitBranch className="h-4 w-4" />
                        Pipeline View
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-6">
                      {/* Empty State for Metrics */}
                      <div className="max-w-5xl mx-auto">
                        <Card className="border-dashed">
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
                          <Card className="border-dashed">
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
