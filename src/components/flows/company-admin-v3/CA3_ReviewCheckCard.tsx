import React from "react";
import { AlertTriangle, AlertCircle, Info, ChevronRight, Check, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type CheckSeverity = "blocking" | "warning" | "info";
export type CheckStatus = "pending" | "resolved" | "acknowledged" | "skipped";

export interface ReviewCheck {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  workerType: "employee" | "contractor";
  title: string;
  description: string;
  severity: CheckSeverity;
  status: CheckStatus;
  canFixNow: boolean;
}

interface CA3_ReviewCheckCardProps {
  check: ReviewCheck;
  onFixNow: (check: ReviewCheck) => void;
  onAcknowledge: (check: ReviewCheck) => void;
  onSkip: (check: ReviewCheck) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CA3_ReviewCheckCard: React.FC<CA3_ReviewCheckCardProps> = ({
  check,
  onFixNow,
  onAcknowledge,
  onSkip,
  isExpanded,
  onToggleExpand,
}) => {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSeverityConfig = (severity: CheckSeverity) => {
    switch (severity) {
      case "blocking":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          textColor: "text-red-600",
          badgeClass: "bg-red-500/10 text-red-600 border-red-500/30",
          label: "Blocking",
        };
      case "warning":
        return {
          icon: AlertCircle,
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-600",
          badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30",
          label: "Warning",
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-600",
          badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/30",
          label: "Info",
        };
    }
  };

  const config = getSeverityConfig(check.severity);
  const Icon = config.icon;

  if (check.status !== "pending") {
    return null; // Hide resolved/acknowledged/skipped items by default
  }

  return (
    <div 
      className={cn(
        "group rounded-xl border p-4 transition-all duration-200",
        config.bgColor,
        config.borderColor,
        "hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Worker Avatar */}
        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
          <AvatarFallback className="text-xs font-medium bg-muted">
            {getInitials(check.workerName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground truncate">
              {check.workerName}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{check.workerCountry}</span>
            <Badge variant="outline" className={cn("text-[10px]", config.badgeClass)}>
              {config.label}
            </Badge>
          </div>
          
          <div className="flex items-start gap-2">
            <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.textColor)} />
            <div>
              <p className="text-sm font-medium text-foreground">{check.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{check.description}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {check.canFixNow && check.severity === "blocking" && (
            <Button 
              size="sm" 
              className="h-8 text-xs gap-1.5"
              onClick={() => onFixNow(check)}
            >
              Fix now
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
          
          {check.severity === "warning" && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => onAcknowledge(check)}
            >
              <Check className="h-3 w-3" />
              Acknowledge
            </Button>
          )}

          {check.severity !== "blocking" && (
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onSkip(check)}
            >
              Skip
            </Button>
          )}

          {check.severity === "blocking" && !check.canFixNow && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => onSkip(check)}
            >
              <Clock className="h-3 w-3" />
              Skip this cycle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CA3_ReviewCheckCard;
