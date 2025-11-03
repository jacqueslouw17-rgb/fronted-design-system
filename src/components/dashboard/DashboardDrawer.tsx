import { motion, AnimatePresence } from "framer-motion";
import DashboardWidget from "./DashboardWidget";
import { DollarSign, Users, FileCheck, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useRoleLens } from "@/contexts/RoleLensContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface DashboardDrawerProps {
  isOpen: boolean;
  userData: any;
}

const DashboardDrawer = ({ isOpen, userData }: DashboardDrawerProps) => {
  const { currentLens } = useRoleLens();
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading state when opening drawer
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-1/2 border-r border-border bg-background/95 backdrop-blur-sm flex-shrink-0 overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Organization Overview
              </h2>
              <p className="text-muted-foreground mt-1">
                Real-time metrics and insights
              </p>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))
              ) : (
                widgets.map((widget, idx) => (
                  <motion.div
                    key={`${currentLens.role}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <DashboardWidget {...widget} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardDrawer;
