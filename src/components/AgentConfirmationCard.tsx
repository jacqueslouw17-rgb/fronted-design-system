import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Lock, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Severity = "default" | "warning" | "critical" | "completed";

interface AgentConfirmationCardProps {
  title: string;
  summary: string;
  details?: string[];
  severity?: Severity;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  impactTooltip?: string;
  agentHint?: string;
  className?: string;
}

const severityConfig = {
  default: {
    border: "border-border",
    icon: Info,
    iconColor: "text-muted-foreground",
    badge: null,
  },
  warning: {
    border: "border-amber-500/50",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    badge: "Pending",
  },
  critical: {
    border: "border-destructive/50",
    icon: Lock,
    iconColor: "text-destructive",
    badge: "High Impact",
  },
  completed: {
    border: "border-muted",
    icon: Info,
    iconColor: "text-muted-foreground",
    badge: "Approved",
  },
};

export const AgentConfirmationCard = ({
  title,
  summary,
  details,
  severity = "default",
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  impactTooltip,
  agentHint,
  className,
}: AgentConfirmationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(severity === "completed");
  
  const config = severityConfig[isCompleted ? "completed" : severity];
  const Icon = config.icon;

  const handleConfirm = () => {
    setIsCompleted(true);
    toast({
      title: "Action confirmed",
      description: "Your request has been initiated successfully.",
    });
    onConfirm?.();
  };

  const handleCancel = () => {
    toast({
      title: "Action cancelled",
      description: "No changes have been made.",
    });
    onCancel?.();
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 animate-scale-in mx-auto max-w-2xl shadow-card",
        config.border,
        isCompleted && "opacity-70",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-md bg-muted/50 flex-shrink-0", config.iconColor)}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {config.badge && (
                <Badge variant={severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                  {config.badge}
                </Badge>
              )}
            </div>
            {impactTooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Impact details
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{impactTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>

        {details && details.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isExpanded ? "Hide details" : "Show details"}
            </button>
            
            {isExpanded && (
              <div className="space-y-1.5 pl-4 border-l-2 border-border animate-fade-in">
                {details.map((detail, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    {detail}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {!isCompleted && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleConfirm}
              size="sm"
              variant={severity === "critical" ? "destructive" : "default"}
              className="flex-1"
            >
              {confirmLabel}
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              {cancelLabel}
            </Button>
          </div>
        )}
      </CardContent>

      {agentHint && !isCompleted && (
        <CardFooter className="pt-0 pb-4">
          <div className="w-full p-3 rounded-md bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground italic">
              💡 Agent: {agentHint}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};