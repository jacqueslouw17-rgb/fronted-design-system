import { useState, useEffect } from "react";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import AgentDrawer from "@/components/dashboard/AgentDrawer";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { RoleLensProvider } from "@/contexts/RoleLensContext";

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
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com",
    country: "United States",
    role: "admin"
  },
  onboardingHistory = []
}: DashboardProps) => {
  const [version, setVersion] = useState<"v1" | "v2">("v1");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  
  // When switching to v2, auto-open the agent
  useEffect(() => {
    if (version === "v2") {
      setIsAgentOpen(true);
    }
  }, [version]);

  // V2 mode: Agent is always open on the right initially, but can be closed
  const isV2AgentOpen = version === "v2" ? isAgentOpen : false;
  const isV1AgentOpen = version === "v1" ? isAgentOpen : false;

  return (
    <RoleLensProvider initialRole={(userData.role as any) || 'admin'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* V1: Agent Drawer from LEFT (overlay) */}
        {version === "v1" && (
          <div 
            className={`fixed top-0 left-0 h-full bg-card border-r shadow-lg transition-transform duration-300 z-50 flex flex-col ${
              isV1AgentOpen ? "translate-x-0 w-80" : "-translate-x-full w-0"
            }`}
          >
            {isV1AgentOpen && (
              <AgentDrawer
                isOpen={isV1AgentOpen}
                onClose={() => setIsAgentOpen(false)}
                userData={userData}
                chatHistory={onboardingHistory}
              />
            )}
          </div>
        )}

        {/* Left Sidebar - hide when Agent is open in V1 */}
        {!isV1AgentOpen && (
          <NavSidebar 
            onGenieToggle={() => {
              if (version === "v1") {
                setIsAgentOpen(!isAgentOpen);
              }
            }} 
            isGenieOpen={isV1AgentOpen}
            disabled={version === "v2"}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-w-0`}>
          {/* Top Bar */}
          <Topbar 
            userName={`${userData.firstName} ${userData.lastName}`}
            version={version}
            onVersionChange={(v) => setVersion(v)}
            isAgentOpen={isAgentOpen}
            onAgentToggle={() => setIsAgentOpen(!isAgentOpen)}
          />

          {/* Dashboard Grid */}
          <main className="flex-1 p-6 overflow-y-auto">
            <WidgetGrid userData={userData} />
          </main>
        </div>

        {/* V2: Agent Drawer on RIGHT (50/50 split) */}
        {version === "v2" && (
          <AgentDrawer
            isOpen={isV2AgentOpen}
            onClose={() => setIsAgentOpen(false)}
            userData={userData}
            chatHistory={onboardingHistory}
          />
        )}
      </div>
    </RoleLensProvider>
  );
};

export default Dashboard;
