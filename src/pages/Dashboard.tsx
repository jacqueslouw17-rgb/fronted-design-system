import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import GenieDrawer from "@/components/dashboard/GenieDrawer";
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
  const [isGenieOpen, setIsGenieOpen] = useState(false);

  return (
    <RoleLensProvider initialRole={(userData.role as any) || 'admin'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Genie Drawer */}
        <GenieDrawer
          isOpen={isGenieOpen}
          onClose={() => setIsGenieOpen(false)}
          userData={userData}
          chatHistory={onboardingHistory}
        />

        {/* Left Sidebar - hide when Genie is open */}
        {!isGenieOpen && (
          <NavSidebar 
            onGenieToggle={() => setIsGenieOpen(!isGenieOpen)} 
            isGenieOpen={isGenieOpen}
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
