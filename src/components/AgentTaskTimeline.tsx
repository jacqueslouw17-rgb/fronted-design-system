import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskStatus = "pending" | "in-progress" | "completed" | "error" | "awaiting-input";

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  progress: number;
  eta?: number; // in seconds
  timestamp?: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AgentTaskTimelineProps {
  steps: TaskStep[];
  title?: string;
  compact?: boolean;
  onComplete?: () => void;
}

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  const iconClass = "h-5 w-5";
  
  switch (status) {
    case "completed":
      return <CheckCircle2 className={cn(iconClass, "text-foreground")} />;
    case "in-progress":
      return <Loader2 className={cn(iconClass, "text-muted-foreground animate-spin")} />;
    case "error":
      return <AlertCircle className={cn(iconClass, "text-muted-foreground opacity-70")} />;
    case "awaiting-input":
      return <Clock className={cn(iconClass, "text-muted-foreground")} />;
    default:
      return <div className={cn(iconClass, "rounded-full border-2 border-muted bg-background")} />;
  }
};

const ETAChip = ({ seconds }: { seconds: number }) => {
  const formatETA = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
  };

  return (
    <Badge variant="outline" className="text-xs font-normal bg-muted/50">
      {formatETA(seconds)}
    </Badge>
  );
};

const TimelineStep = ({ 
  step, 
  isLast, 
  compact 
}: { 
  step: TaskStep; 
  isLast: boolean; 
  compact: boolean;
}) => {
  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[10px] top-7 w-px h-full bg-muted" />
      )}
      
      {/* Status Icon */}
      <div className="absolute left-0 top-0 bg-background">
        <StatusIcon status={step.status} />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={cn(
                "font-medium",
                step.status === "completed" && "text-muted-foreground"
              )}>
                {step.title}
              </h4>
              {step.eta !== undefined && step.status === "in-progress" && (
                <ETAChip seconds={step.eta} />
              )}
            </div>
            
            {!compact && step.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {step.description}
              </p>
            )}
            
            {!compact && step.timestamp && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {step.timestamp.toLocaleTimeString()}
              </p>
            )}
          </div>

          {step.action && step.status === "awaiting-input" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={step.action.onClick}
              className="shrink-0"
            >
              {step.action.label}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {step.status === "in-progress" && (
          <Progress 
            value={step.progress} 
            className="h-1.5"
          />
        )}
      </div>
    </div>
  );
};

export const AgentTaskTimeline = ({ 
  steps, 
  title = "Task Progress",
  compact: initialCompact = false,
  onComplete 
}: AgentTaskTimelineProps) => {
  const [compact, setCompact] = useState(initialCompact);
  const [hasNotifiedComplete, setHasNotifiedComplete] = useState(false);

  const allCompleted = steps.every(s => s.status === "completed");
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === "completed").length;

  useEffect(() => {
    if (allCompleted && !hasNotifiedComplete && onComplete) {
      onComplete();
      setHasNotifiedComplete(true);
    }
  }, [allCompleted, hasNotifiedComplete, onComplete]);

  return (
    <Card className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="font-normal">
            {completedSteps} / {totalSteps}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCompact(!compact)}
          className="gap-2"
        >
          {compact ? (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand
            </>
          ) : (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse
            </>
          )}
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
            compact={compact}
          />
        ))}
      </div>

      {/* Completion Summary */}
      {allCompleted && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              All {totalSteps} steps completed — Task ready
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AgentTaskTimeline;
