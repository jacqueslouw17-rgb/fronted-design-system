import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

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
        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
          <Icon className="h-5 w-5 text-accent" />
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
