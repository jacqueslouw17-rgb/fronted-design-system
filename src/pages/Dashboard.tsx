import { useState } from "react";
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
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  return (
    <RoleLensProvider initialRole={(userData.role as any) || 'admin'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Agent Drawer */}
        <AgentDrawer
          isOpen={isAgentOpen}
          onClose={() => setIsAgentOpen(false)}
          userData={userData}
          chatHistory={onboardingHistory}
        />

        {/* Left Sidebar - hide when Agent is open */}
        {!isAgentOpen && (
          <NavSidebar 
            onGenieToggle={() => setIsAgentOpen(!isAgentOpen)} 
            isGenieOpen={isAgentOpen}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <Topbar userName={`${userData.firstName} ${userData.lastName}`} />

          {/* Dashboard Grid */}
          <main className="flex-1 p-6">
            <WidgetGrid userData={userData} />
          </main>
        </div>
      </div>
    </RoleLensProvider>
  );
};

export default Dashboard;
