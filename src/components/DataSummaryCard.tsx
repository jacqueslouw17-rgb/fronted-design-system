import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, ChevronRight, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useState } from "react";
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
  className,
}: DataSummaryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const cardVariant = status === "normal" && Math.random() > 0.5 ? "gradient" : "default";

  return (
    <Card
      variant={cardVariant}
      className={cn(
        "transition-all hover:shadow-lg group",
        getStatusStyles(),
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                cardVariant === "gradient" 
                  ? "bg-muted/50 border border-border/50 group-hover:bg-muted group-hover:border-border"
                  : "bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-600 group-hover:border-amber-600"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  cardVariant === "gradient" 
                    ? "text-muted-foreground group-hover:text-foreground" 
                    : "text-amber-600 dark:text-amber-400 group-hover:text-white"
                )} />
              </div>
            )}
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
