import React from "react";
import { AlertTriangle, AlertCircle, Info, ChevronRight, Check, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
          bgColor: "bg-red-500/10",
          label: "Blocking",
        };
      case "warning":
        return {
          icon: AlertCircle,
          iconColor: "text-amber-500",
          bgColor: "bg-amber-500/10",
          label: "Warning",
        };
      case "info":
        return {
          icon: Info,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-500/10",
          label: "Info",
        };
    }
  };

  const config = getSeverityConfig(check.severity);
  const Icon = config.icon;
  const TypeIcon = check.workerType === "employee" ? Users : Briefcase;

  if (check.status !== "pending") {
    return null;
  }

  return (
    <div 
      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/30 bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Worker Avatar */}
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
            {getInitials(check.workerName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">
              {check.workerName}
            </span>
            <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground">· {check.workerCountry}</span>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground leading-tight">
            <Badge variant="secondary" className={cn("text-[10px] gap-1 px-1.5 py-0", config.iconColor)}>
              <Icon className="h-3 w-3" />
              {check.title}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        {check.canFixNow && check.severity === "blocking" && (
          <Button 
            size="sm" 
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onFixNow(check);
            }}
          >
            Fix
          </Button>
        )}
        
        {check.severity === "warning" && (
          <Button 
            size="sm" 
            variant="ghost"
            className="h-7 text-xs gap-1"
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
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onSkip(check);
            }}
          >
            Skip
          </Button>
        )}
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default CA3_ReviewCheckCard;