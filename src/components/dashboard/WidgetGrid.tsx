import DashboardWidget from "./DashboardWidget";
import ContractProgressCard from "./ContractProgressCard";
import { DollarSign, Users, FileCheck, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useRoleLens } from "@/contexts/RoleLensContext";
import { motion } from "framer-motion";

interface WidgetGridProps {
  userData: any;
}

const WidgetGrid = ({ userData }: WidgetGridProps) => {
  const { currentLens } = useRoleLens();
  
  // Role-based widget configuration
  const allWidgets = {
    admin: [
      {
        title: "Total Contractors",
        value: "24",
        trend: "+12%",
        icon: Users,
      },
      {
        title: "Monthly Payroll",
        value: "$145,000",
        trend: "+8%",
        icon: DollarSign,
      },
      {
        title: "Compliance Score",
        value: "98%",
        trend: "+2%",
        icon: FileCheck,
      },
      {
        title: "Active Contracts",
        value: "18",
        trend: "+4",
        icon: TrendingUp,
      },
      {
        title: "Pending Actions",
        value: "3",
        trend: "-2",
        icon: AlertCircle,
      },
      {
        title: "Avg Response Time",
        value: "2.4h",
        trend: "-0.5h",
        icon: Clock,
      },
    ],
    contractor: [
      {
        title: "Next Payroll",
        value: "5 days",
        trend: "On track",
        icon: DollarSign,
      },
      {
        title: "Contract Status",
        value: "Active",
        trend: "Valid until Dec 2025",
        icon: FileCheck,
      },
      {
        title: "Support Tickets",
        value: "0",
        trend: "All resolved",
        icon: AlertCircle,
      },
    ],
    employee: [
      {
        title: "Next Payroll",
        value: "5 days",
        trend: "On track",
        icon: DollarSign,
      },
      {
        title: "Time Off Balance",
        value: "12 days",
        trend: "Available",
        icon: Clock,
      },
      {
        title: "Benefits Status",
        value: "Active",
        trend: "All enrolled",
        icon: FileCheck,
      },
    ],
  };

  const widgets = allWidgets[currentLens.role];

  const greetings = {
    admin: "Here's your organization overview today.",
    contractor: "Here's your account status.",
    employee: "Here's your dashboard overview.",
  };

  return (
    <motion.div
      key={currentLens.role}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="space-y-6"
    >
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {userData.firstName}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          {greetings[currentLens.role]}
        </p>
      </div>

      {/* Widget Grid - Responsive: stacks on small, 2 cols on md, 3 cols on lg+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Show Contract Progress Card for contractor/employee */}
        {(currentLens.role === 'contractor' || currentLens.role === 'employee') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="sm:col-span-2"
          >
            <ContractProgressCard 
              candidateName={userData.firstName}
              onSendMessage={(msg) => console.log('Message:', msg)}
            />
          </motion.div>
        )}
        
        {widgets.map((widget, idx) => (
          <motion.div
            key={`${currentLens.role}-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <DashboardWidget {...widget} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WidgetGrid;
