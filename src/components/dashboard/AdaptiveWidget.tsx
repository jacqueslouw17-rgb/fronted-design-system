import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon, GripVertical, MoreVertical, Maximize2, Pin, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export type WidgetStatus = "ok" | "warning" | "breach";

interface AdaptiveWidgetProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  status?: WidgetStatus;
  genieHint?: string;
  tooltipText?: string;
  isPinned?: boolean;
  onExpand?: () => void;
  onPin?: () => void;
  onRemove?: () => void;
  sparklineData?: number[];
}

// Generate smooth sparkline data
const generateSparklineData = (points: number = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    value: Math.sin(i / 3) * 20 + 50 + Math.random() * 10,
  }));
};

const statusColors = {
  ok: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  breach: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const AdaptiveWidget = ({
  title,
  value,
  trend,
  icon: Icon,
  status = "ok",
  genieHint,
  tooltipText,
  isPinned = false,
  onExpand,
  onPin,
  onRemove,
  sparklineData,
}: AdaptiveWidgetProps) => {
  const [isHovered, setIsHovered] = useState(false);
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
    <Card
      className="relative h-full hover:shadow-lg transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Widget Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onExpand && (
              <DropdownMenuItem onClick={onExpand}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Expand
              </DropdownMenuItem>
            )}
            {onPin && (
              <DropdownMenuItem onClick={onPin}>
                <Pin className="h-4 w-4 mr-2" />
                {isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
            )}
            {onRemove && (
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <X className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pin Indicator */}
      {isPinned && (
        <div className="absolute top-2 left-10">
          <Pin className="h-3 w-3 text-primary fill-primary" />
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
            </TooltipTrigger>
            {tooltipText && (
              <TooltipContent>
                <p className="max-w-xs">{tooltipText}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-foreground/60" />
          {status !== "ok" && (
            <Badge variant="outline" className={statusColors[status]}>
              {status}
            </Badge>
          )}
        </div>
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

        {/* Genie Hint */}
        {genieHint && (
          <div className="mt-2 p-2 rounded-md bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{genieHint}</p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Resize Anchor */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-3 w-3 border-r-2 border-b-2 border-muted-foreground/30" />
      </div>
    </Card>
  );
};

export default AdaptiveWidget;
