import React from "react";
import { AlertTriangle, AlertCircle, Info, ChevronRight, Check } from "lucide-react";
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
          label: "Blocking",
        };
      case "warning":
        return {
          icon: AlertCircle,
          iconColor: "text-amber-500",
          label: "Warning",
        };
      case "info":
        return {
          icon: Info,
          iconColor: "text-blue-500",
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
        "group flex items-center gap-4 p-3.5 rounded-lg border transition-all duration-150",
        "border-border/5 bg-muted/5",
        "hover:bg-muted/15 cursor-pointer"
      )}
    >
      {/* Worker Avatar */}
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarFallback className="text-[10px] font-medium bg-muted/30">
          {getInitials(check.workerName)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm text-foreground">
            {check.workerName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {check.workerType === "employee" ? "EE" : "C"} · {check.workerCountry}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3 w-3 flex-shrink-0", config.iconColor)} />
          <span className="text-xs text-foreground">{check.title}</span>
        </div>
      </div>

      {/* Actions - streamlined */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {check.canFixNow && check.severity === "blocking" && (
          <Button 
            size="sm" 
            variant="outline"
            className="h-7 text-[11px] gap-1 px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              onFixNow(check);
            }}
          >
            Fix
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
        
        {check.severity === "warning" && (
          <Button 
            size="sm" 
            variant="ghost"
            className="h-7 text-[11px] gap-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge(check);
            }}
          >
            <Check className="h-3 w-3" />
            OK
          </Button>
        )}

        {(check.severity !== "blocking" || !check.canFixNow) && (
          <Button 
            size="sm" 
            variant="ghost"
            className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
            onClick={(e) => {
              e.stopPropagation();
              onSkip(check);
            }}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};

export default CA3_ReviewCheckCard;
