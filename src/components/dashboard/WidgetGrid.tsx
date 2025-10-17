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
        sparklineData: [18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24],
      },
      {
        title: "Monthly Payroll",
        value: "$145,000",
        trend: "+8%",
        icon: DollarSign,
        sparklineData: [115, 118, 120, 125, 128, 130, 132, 135, 138, 140, 141, 142, 143, 144, 144.5, 145, 145, 145, 145, 145],
      },
      {
        title: "Compliance Score",
        value: "98%",
        trend: "+2%",
        icon: FileCheck,
        sparklineData: [92, 93, 94, 95, 95, 96, 96, 97, 97, 97, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98],
      },
      {
        title: "Active Contracts",
        value: "18",
        trend: "+4",
        icon: TrendingUp,
        sparklineData: [12, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18],
      },
      {
        title: "Pending Actions",
        value: "3",
        trend: "-2",
        icon: AlertCircle,
        sparklineData: [5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      },
      {
        title: "Avg Response Time",
        value: "2.4h",
        trend: "-0.5h",
        icon: Clock,
        sparklineData: [3.2, 3.1, 3.0, 2.9, 2.9, 2.8, 2.7, 2.6, 2.6, 2.5, 2.5, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4],
      },
    ],
    hr: [
      {
        title: "Onboarding Queue",
        value: "5",
        trend: "+2 this week",
        icon: Users,
        sparklineData: [3, 3, 4, 4, 5, 5, 5, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      },
      {
        title: "Pending Contracts",
        value: "8",
        trend: "3 need review",
        icon: FileCheck,
        sparklineData: [10, 10, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      },
      {
        title: "Policy Updates",
        value: "2",
        trend: "Requires approval",
        icon: AlertCircle,
        sparklineData: [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      },
      {
        title: "Support Tickets",
        value: "12",
        trend: "4 unresolved",
        icon: Clock,
        sparklineData: [15, 14, 14, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
      },
    ],
    cfo: [
      {
        title: "Monthly Payroll",
        value: "$145,000",
        trend: "+8%",
        icon: DollarSign,
        sparklineData: [115, 118, 120, 125, 128, 130, 132, 135, 138, 140, 141, 142, 143, 144, 144.5, 145, 145, 145, 145, 145],
      },
      {
        title: "FX Impact",
        value: "$2,340",
        trend: "Savings this month",
        icon: TrendingUp,
        sparklineData: [1800, 1900, 2000, 2100, 2150, 2200, 2220, 2250, 2280, 2300, 2310, 2320, 2330, 2335, 2338, 2340, 2340, 2340, 2340, 2340],
      },
      {
        title: "Trust Index",
        value: "87",
        trend: "+5 pts",
        icon: FileCheck,
        sparklineData: [78, 79, 80, 81, 82, 83, 84, 84, 85, 85, 86, 86, 87, 87, 87, 87, 87, 87, 87, 87],
      },
      {
        title: "Pending Approvals",
        value: "3",
        trend: "Awaiting review",
        icon: AlertCircle,
        sparklineData: [5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      },
    ],
    contractor: [
      {
        title: "Next Payroll",
        value: "5 days",
        trend: "On track",
        icon: DollarSign,
        sparklineData: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      },
      {
        title: "Contract Status",
        value: "Active",
        trend: "Valid until Dec 2025",
        icon: FileCheck,
        sparklineData: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      },
      {
        title: "Support Tickets",
        value: "0",
        trend: "All resolved",
        icon: AlertCircle,
        sparklineData: [3, 3, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
            <DashboardWidget {...widget} sparklineData={widget.sparklineData} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WidgetGrid;
