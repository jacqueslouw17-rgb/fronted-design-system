import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import AgentDrawer from "@/components/dashboard/AgentDrawer";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [version, setVersion] = useState<"v1" | "v2">("v1");

  // V2 mode: Agent is always open on the right
  const isV2AgentOpen = version === "v2" ? true : isAgentOpen;

  return (
    <RoleLensProvider initialRole={(userData.role as any) || 'admin'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Agent Drawer - V1: overlay, V2: fixed 50% split */}
        <AgentDrawer
          isOpen={isV2AgentOpen}
          onClose={() => version === "v1" && setIsAgentOpen(false)}
          userData={userData}
          chatHistory={onboardingHistory}
        />

        {/* Left Sidebar - hide when Agent is open in V1 */}
        {!(version === "v1" && isAgentOpen) && (
          <NavSidebar 
            onGenieToggle={() => version === "v1" && setIsAgentOpen(!isAgentOpen)} 
            isGenieOpen={isAgentOpen}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${version === "v2" ? "max-w-[50%]" : ""}`}>
          {/* Top Bar */}
          <Topbar 
            userName={`${userData.firstName} ${userData.lastName}`}
            version={version}
            onVersionChange={setVersion}
            isAgentOpen={isV2AgentOpen}
            onAgentToggle={() => version === "v2" && setIsAgentOpen(!isAgentOpen)}
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
