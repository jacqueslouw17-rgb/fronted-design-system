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
  const variant = Math.random() > 0.6 ? "gradient" : "default";

  return (
    <Card variant={variant} className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-xl",
          variant === "gradient" 
            ? "bg-muted/50 border border-border/50"
            : "bg-amber-500/10 border border-amber-500/20"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            variant === "gradient" ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"
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
