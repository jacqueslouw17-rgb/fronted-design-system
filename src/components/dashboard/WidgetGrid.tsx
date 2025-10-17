import DashboardWidget from "./DashboardWidget";
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
    hr: [
      {
        title: "Onboarding Queue",
        value: "5",
        trend: "+2 this week",
        icon: Users,
      },
      {
        title: "Pending Contracts",
        value: "8",
        trend: "3 need review",
        icon: FileCheck,
      },
      {
        title: "Policy Updates",
        value: "2",
        trend: "Requires approval",
        icon: AlertCircle,
      },
      {
        title: "Support Tickets",
        value: "12",
        trend: "4 unresolved",
        icon: Clock,
      },
    ],
    cfo: [
      {
        title: "Monthly Payroll",
        value: "$145,000",
        trend: "+8%",
        icon: DollarSign,
      },
      {
        title: "FX Impact",
        value: "$2,340",
        trend: "Savings this month",
        icon: TrendingUp,
      },
      {
        title: "Trust Index",
        value: "87",
        trend: "+5 pts",
        icon: FileCheck,
      },
      {
        title: "Pending Approvals",
        value: "3",
        trend: "Awaiting review",
        icon: AlertCircle,
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
  };

  const widgets = allWidgets[currentLens.role];

  const greetings = {
    admin: "Here's your organization overview today.",
    hr: "Here's your onboarding and contracts overview.",
    cfo: "Here's your financial overview today.",
    contractor: "Here's your account status.",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
