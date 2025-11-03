import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

const DashboardWidget = ({ title, value, trend, icon: Icon }: DashboardWidgetProps) => {
  // Only Total Contractors gets gradient
  const variant = title === "Total Contractors" ? "gradient" : "default";

  return (
    <Card variant={variant} className="hover:shadow-lg transition-shadow overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-xl transition-all duration-200",
          variant === "gradient" 
            ? "bg-muted/50 border border-border/50 group-hover:bg-muted group-hover:border-border"
            : "bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-600 group-hover:border-amber-600"
        )}>
          <Icon className={cn(
            "h-5 w-5 transition-colors duration-200",
            variant === "gradient" 
              ? "text-muted-foreground group-hover:text-foreground" 
              : "text-amber-600 dark:text-amber-400 group-hover:text-white"
          )} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
