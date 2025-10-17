import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface DashboardWidgetProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  sparklineData?: number[];
}

// Generate smooth sparkline data
const generateSparklineData = (points: number = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    value: Math.sin(i / 3) * 20 + 50 + Math.random() * 10,
  }));
};

const DashboardWidget = ({ title, value, trend, icon: Icon, sparklineData }: DashboardWidgetProps) => {
  const [chartData, setChartData] = useState(generateSparklineData());
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Use provided data or generate default
    if (sparklineData) {
      setChartData(sparklineData.map(value => ({ value })));
    }
    
    // Trigger animation on mount
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [sparklineData]);

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-foreground/60" />
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        
        {/* Sparkline Chart */}
        <div className="mt-3 h-12 -mx-4" style={{ opacity: isAnimating ? 0 : 1, transition: 'opacity 0.6s ease-in' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
