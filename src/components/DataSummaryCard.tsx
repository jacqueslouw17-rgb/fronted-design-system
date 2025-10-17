import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, ChevronRight, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface DataSummaryCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  status?: "normal" | "warning" | "error" | "loading";
  tooltipText?: string;
  tags?: string[];
  onExpand?: () => void;
  sparklineData?: number[];
  className?: string;
}

const DataSummaryCard = ({
  label,
  value,
  icon: Icon,
  trend,
  status = "normal",
  tooltipText,
  tags,
  onExpand,
  sparklineData,
  className,
}: DataSummaryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [chartData, setChartData] = useState<{ value: number }[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Convert sparklineData to chart format
    if (sparklineData && sparklineData.length > 0) {
      setChartData(sparklineData.map(value => ({ value })));
    }
    
    // Trigger animation on mount
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [sparklineData]);

  const getStatusStyles = () => {
    switch (status) {
      case "warning":
        return "border-amber-500/30 hover:bg-amber-500/5 hover:border-amber-500/50";
      case "error":
        return "border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50";
      case "loading":
        return "animate-pulse";
      default:
        return "";
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend.direction === "down") return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const renderSparkline = () => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <div 
        className="mt-3 h-16 -mx-2" 
        style={{ opacity: isAnimating ? 0 : 1, transition: 'opacity 0.6s ease-in' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--secondary))"
              strokeWidth={2.5}
              fill={`url(#gradient-${label})`}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "transition-all hover:bg-primary/5 hover:border-primary/40",
        getStatusStyles(),
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {status === "loading" ? "..." : value}
            </span>
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={cn(
                  "text-sm font-medium",
                  trend.direction === "up" && "text-accent-green-text",
                  trend.direction === "down" && "text-destructive",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>

          {chartData.length > 0 && renderSparkline()}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {tags.map((tag, index) => (
                <span key={index} className="text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {onExpand && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="w-full justify-between group"
          >
            <span className="text-sm">See details</span>
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isHovered && "translate-x-1"
            )} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DataSummaryCard;
