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
        {/* Agent Drawer - positioned on right in both modes */}
        <AgentDrawer
          isOpen={version === "v2" ? isV2AgentOpen : isV1AgentOpen}
          onClose={() => setIsAgentOpen(false)}
          userData={userData}
          chatHistory={onboardingHistory}
        />

        {/* Left Sidebar - hide when Agent is open in V1 */}
        {!isV1AgentOpen && (
          <NavSidebar 
            onGenieToggle={() => {
              if (version === "v1") {
                setIsAgentOpen(!isAgentOpen);
              }
            }} 
            isGenieOpen={isV1AgentOpen}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-w-0 ${version === "v2" && isV2AgentOpen ? "w-1/2" : "w-full"}`}>
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
      </div>
    </RoleLensProvider>
  );
};

export default Dashboard;
