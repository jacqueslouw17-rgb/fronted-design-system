import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import GenieDrawer from "@/components/dashboard/GenieDrawer";
import WidgetGrid from "@/components/dashboard/WidgetGrid";

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
    role: "viewer"
  },
  onboardingHistory = []
}: DashboardProps) => {
  const [isGenieOpen, setIsGenieOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-50"
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

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
          <WidgetGrid role={userData.role} userData={userData} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
