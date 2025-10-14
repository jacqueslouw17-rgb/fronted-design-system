import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type TrustRecord, type TrustMetrics } from "@/hooks/useTrustIndex";

export type TrustGaugeProps = {
  score: number;
  status?: "stable" | "caution" | "alert";
  metrics?: TrustMetrics;
  delta?: number;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
};

const sizeConfig = {
  sm: { width: 64, height: 64, strokeWidth: 4, fontSize: "text-sm" },
  md: { width: 96, height: 96, strokeWidth: 6, fontSize: "text-lg" },
  lg: { width: 128, height: 128, strokeWidth: 8, fontSize: "text-2xl" },
};

const statusConfig = {
  stable: { color: "hsl(var(--chart-2))", label: "Stable", badgeVariant: "default" as const },
  caution: { color: "hsl(var(--chart-3))", label: "Caution", badgeVariant: "secondary" as const },
  alert: { color: "hsl(var(--chart-1))", label: "Alert", badgeVariant: "destructive" as const },
};

export const CircularGauge: React.FC<{
  score: number;
  size: number;
  strokeWidth: number;
  color: string;
  pulse?: boolean;
}> = ({ score, size, strokeWidth, color, pulse }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {pulse && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
    </svg>
  );
};

export const MetricsBreakdown: React.FC<{ metrics: TrustMetrics }> = ({ metrics }) => {
  const items = [
    { label: "User Sentiment", value: metrics.sentiment, weight: "40%" },
    { label: "SLA Compliance", value: metrics.slaCompliance, weight: "25%" },
    { label: "FX Accuracy", value: metrics.fxAccuracy, weight: "15%" },
    { label: "Legal Integrity", value: metrics.legalIntegrity, weight: "10%" },
    { label: "System Uptime", value: metrics.systemUptime, weight: "10%" },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground mb-3">Trust Drivers</div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-foreground">{item.label}</span>
            <span className="text-muted-foreground">({item.weight})</span>
          </div>
          <span className="font-medium">{item.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const TrustGauge: React.FC<TrustGaugeProps> = ({
  score,
  status = "stable",
  metrics,
  delta,
  size = "md",
  showDetails = true,
  className,
}) => {
  const [pulse, setPulse] = useState(false);
  const config = sizeConfig[size];
  const statusStyle = statusConfig[status];

  useEffect(() => {
    if (delta !== undefined && delta !== 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [delta]);

  const DeltaIcon = delta && delta > 0 ? TrendingUp : delta && delta < 0 ? TrendingDown : Minus;

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
            <CircularGauge
              score={score}
              size={config.width}
              strokeWidth={config.strokeWidth}
              color={statusStyle.color}
              pulse={pulse}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={score}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={cn("font-bold", config.fontSize)}
              >
                {score}
              </motion.div>
              <div className="text-[10px] text-muted-foreground">/ 100</div>
            </div>
          </button>
        </PopoverTrigger>

        {showDetails && metrics && (
          <PopoverContent className="w-72" align="center">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Trust Index</h4>
                <Badge variant={statusStyle.badgeVariant}>{statusStyle.label}</Badge>
              </div>
              <MetricsBreakdown metrics={metrics} />
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>

      {delta !== undefined && delta !== 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs">
              <DeltaIcon className="h-3 w-3" />
              <span className="font-medium">{delta > 0 ? "+" : ""}{delta}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {delta > 0 ? "Trust index increased" : "Trust index decreased"}
          </TooltipContent>
        </Tooltip>
      )}

      <Badge variant="outline" className="text-[10px]">
        {statusStyle.label}
      </Badge>
    </div>
  );
};

export const TrustGaugeMini: React.FC<{ record: TrustRecord }> = ({ record }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card">
      <div className="text-sm font-semibold">{record.score}</div>
      <div className="text-xs text-muted-foreground">Trust Index</div>
      <Badge variant={statusConfig[record.status].badgeVariant} className="text-[10px]">
        {statusConfig[record.status].label}
      </Badge>
      {record.delta !== undefined && record.delta !== 0 && (
        <div className={cn("text-xs font-medium", record.delta > 0 ? "text-chart-2" : "text-chart-1")}>
          {record.delta > 0 ? "+" : ""}{record.delta}
        </div>
      )}
    </div>
  );
};

export default TrustGauge;
