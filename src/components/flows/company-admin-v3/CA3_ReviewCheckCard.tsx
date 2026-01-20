import React from "react";
import { AlertTriangle, AlertCircle, Info, ChevronRight, Check, Clock } from "lucide-react";
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
}

export const CA3_ReviewCheckCard: React.FC<CA3_ReviewCheckCardProps> = ({
  check,
  onFixNow,
  onAcknowledge,
  onSkip,
}) => {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSeverityConfig = (severity: CheckSeverity) => {
    switch (severity) {
      case "blocking":
        return {
          icon: AlertTriangle,
          iconColor: "text-red-500",
          bgColor: "bg-red-500/[0.02]",
          badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
          label: "Blocking",
        };
      case "warning":
        return {
          icon: AlertCircle,
          iconColor: "text-amber-500",
          bgColor: "bg-amber-500/[0.02]",
          badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          label: "Warning",
        };
      case "info":
        return {
          icon: Info,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-500/[0.02]",
          badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          label: "Info",
        };
    }
  };

  const config = getSeverityConfig(check.severity);
  const Icon = config.icon;

  if (check.status !== "pending") {
    return null;
  }

  return (
    <div 
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg border transition-all duration-150",
        "border-border/10",
        config.bgColor,
        "hover:bg-muted/20 hover:shadow-sm cursor-pointer"
      )}
    >
      {/* Worker Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="text-[11px] font-medium bg-muted/40">
          {getInitials(check.workerName)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {check.workerName}
          </span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
            {check.workerType === "employee" ? "EE" : "C"}
          </Badge>
          <span className="text-xs text-muted-foreground">{check.workerCountry}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", config.iconColor)} />
          <span className="text-sm text-foreground">{check.title}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{check.description}</p>
      </div>

      {/* Actions - streamlined */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {check.canFixNow && check.severity === "blocking" && (
          <Button 
            size="sm" 
            className="h-8 text-xs gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onFixNow(check);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge(check);
            }}
          >
            <Check className="h-3 w-3" />
            Acknowledge
          </Button>
        )}

        {(check.severity !== "blocking" || !check.canFixNow) && (
          <Button 
            size="sm" 
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onSkip(check);
            }}
          >
            {check.severity === "blocking" ? (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Skip
              </>
            ) : (
              "Skip"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CA3_ReviewCheckCard;
