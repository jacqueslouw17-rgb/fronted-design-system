import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, ChevronRight, TrendingUp, TrendingDown, Info } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

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

  const getStatusStyles = () => {
    switch (status) {
      case "warning":
        return "border-amber-500/50 bg-amber-500/5";
      case "error":
        return "border-destructive/50 bg-destructive/5";
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
    if (!sparklineData || sparklineData.length === 0) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-0.5 h-8 mt-2">
        {sparklineData.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-primary/20 rounded-sm transition-all hover:bg-primary/40"
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg",
        getStatusStyles(),
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
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
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {status === "loading" ? "..." : value}
            </span>
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={cn(
                  "text-sm font-medium",
                  trend.direction === "up" && "text-green-600",
                  trend.direction === "down" && "text-red-600",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>

          {sparklineData && renderSparkline()}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
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
