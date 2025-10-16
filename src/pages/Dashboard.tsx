import { useState, useEffect } from "react";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import AgentDrawer from "@/components/dashboard/AgentDrawer";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import AgentMain from "@/components/dashboard/AgentMain";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    role: string;
  };
  onboardingHistory?: Array<{ role: string; content: string }>;
}

const Dashboard = ({ 
  userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  },
  onboardingHistory = []
}: DashboardProps) => {
  const [version, setVersion] = useState<"v1" | "v2" | "v3" | "v4">("v3");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // When switching to v2, auto-open the agent
  useEffect(() => {
    if (version === "v2") {
      setIsAgentOpen(true);
    } else if (version === "v4") {
      // Navigate to payroll demo
      window.location.href = "/payroll-demo";
    } else {
      // Reset to closed when switching back to v1
      setIsAgentOpen(false);
    }
  }, [version]);

  // Handle transition loading state for v3
  useEffect(() => {
    if (version === "v3") {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  // V2 mode: Agent is always open on the right initially, but can be closed
  const isV2AgentOpen = version === "v2" ? isAgentOpen : false;
  const isV1AgentOpen = version === "v1" ? isAgentOpen : false;

  return (
    <RoleLensProvider initialRole={(userData.role as any) || 'admin'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Left Sidebar - always visible */}
        <NavSidebar 
          onGenieToggle={() => {
            if (version === "v1") {
              setIsAgentOpen(!isAgentOpen);
            }
          }} 
          isGenieOpen={version === "v1" && isV1AgentOpen}
          disabled={version === "v2" || version === "v3"}
        />

        {/* V1: Agent Panel from LEFT (40% width, pushes dashboard) */}
        {version === "v1" && isV1AgentOpen && (
          <div className="w-[40%] border-r border-border flex-shrink-0">
            <AgentDrawer
              isOpen={isV1AgentOpen}
              onClose={() => setIsAgentOpen(false)}
              userData={userData}
              chatHistory={onboardingHistory}
            />
          </div>
        )}

        {/* Main Content - adapts to agent panel width */}
        {version === "v3" ? (
          // V3 Layout: Agent-first with toggleable dashboard drawer
          <>
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar 
                userName={`${userData.firstName} ${userData.lastName}`}
                version={version}
                onVersionChange={(v) => setVersion(v)}
                isDrawerOpen={isDrawerOpen}
                onDrawerToggle={toggleDrawer}
              />
              
              <main className="flex-1 flex overflow-hidden">
                {/* Dashboard Drawer */}
                <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />
                
                {/* Agent Main Area */}
                <AnimatePresence mode="wait">
                  {isTransitioning ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-center p-8"
                    >
                      <div className="max-w-2xl w-full space-y-8">
                        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </motion.div>
                  ) : (
                    <AgentMain 
                      key="agent"
                      userData={userData} 
                      isDrawerOpen={isDrawerOpen} 
                    />
                  )}
                </AnimatePresence>
              </main>
            </div>
          </>
        ) : (
          // V1 & V2 Layout (existing)
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar 
              userName={`${userData.firstName} ${userData.lastName}`}
              version={version}
              onVersionChange={(v) => setVersion(v)}
              isAgentOpen={isAgentOpen}
              onAgentToggle={() => setIsAgentOpen(!isAgentOpen)}
            />

            <main className="flex-1 p-6 overflow-y-auto">
              <WidgetGrid userData={userData} />
            </main>
          </div>
        )}

        {/* V2: Agent Panel on RIGHT (50% width, pushes dashboard) */}
        {version === "v2" && isV2AgentOpen && (
          <div className="w-[50%] border-l border-border flex-shrink-0">
            <AgentDrawer
              isOpen={isV2AgentOpen}
              onClose={() => setIsAgentOpen(false)}
              userData={userData}
              chatHistory={onboardingHistory}
            />
          </div>
        )}
      </div>
    </RoleLensProvider>
  );
};

export default Dashboard;
