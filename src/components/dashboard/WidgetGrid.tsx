import DashboardWidget from "./DashboardWidget";
import { DollarSign, Users, FileCheck, TrendingUp, Clock, AlertCircle } from "lucide-react";

interface WidgetGridProps {
  role: string;
  userData: any;
}

const WidgetGrid = ({ role, userData }: WidgetGridProps) => {
  // Role-based widget configuration
  const widgets = role === "admin" ? [
    {
      title: "Total Contractors",
      value: "24",
      trend: "+12%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Monthly Payroll",
      value: "$145,000",
      trend: "+8%",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Compliance Score",
      value: "98%",
      trend: "+2%",
      icon: FileCheck,
      color: "text-purple-500",
    },
    {
      title: "Active Contracts",
      value: "18",
      trend: "+4",
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      title: "Pending Actions",
      value: "3",
      trend: "-2",
      icon: AlertCircle,
      color: "text-red-500",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      trend: "-0.5h",
      icon: Clock,
      color: "text-cyan-500",
    },
  ] : [
    {
      title: "Next Payroll",
      value: "5 days",
      trend: "On track",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Contract Status",
      value: "Active",
      trend: "Valid until Dec 2025",
      icon: FileCheck,
      color: "text-blue-500",
    },
    {
      title: "Support Tickets",
      value: "0",
      trend: "All resolved",
      icon: AlertCircle,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {userData.firstName}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your {role === "admin" ? "organization" : "account"} today.
        </p>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget, idx) => (
          <DashboardWidget key={idx} {...widget} />
        ))}
      </div>
    </div>
  );
};

export default WidgetGrid;
