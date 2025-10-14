import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

const DashboardWidget = ({ title, value, trend, icon: Icon }: DashboardWidgetProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-foreground/60" />
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
