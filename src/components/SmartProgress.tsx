import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Types
export type StepStatus = "pending" | "in-progress" | "complete" | "failed";

export interface ProcessStep {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  duration?: number; // in seconds
  timestamp?: Date;
}

export interface SmartProcess {
  id: string;
  title: string;
  description: string;
  steps: ProcessStep[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Step status configuration
const stepStatusConfig: Record<StepStatus, { icon: any; color: string; bgColor: string }> = {
  pending: {
    icon: Circle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  complete: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

// Hook for managing process state
export function useSmartProgress() {
  const [processes, setProcesses] = useState<SmartProcess[]>(() => {
    const stored = localStorage.getItem("smart-progress-processes");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("smart-progress-processes", JSON.stringify(processes));
  }, [processes]);

  const addProcess = useCallback((process: Omit<SmartProcess, "id">) => {
    const newProcess: SmartProcess = {
      ...process,
      id: `process-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setProcesses((prev) => [newProcess, ...prev]);
    return newProcess;
  }, []);

  const updateStep = useCallback((processId: string, stepId: string, status: StepStatus) => {
    setProcesses((prev) =>
      prev.map((process) => {
        if (process.id !== processId) return process;

        return {
          ...process,
          steps: process.steps.map((step) =>
            step.id === stepId
              ? { ...step, status, timestamp: new Date() }
              : step
          ),
        };
      })
    );
  }, []);

  const removeProcess = useCallback((processId: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== processId));
  }, []);

  const clearCompleted = useCallback(() => {
    setProcesses((prev) =>
      prev.filter((p) => !p.steps.every((step) => step.status === "complete"))
    );
  }, []);

  return {
    processes,
    addProcess,
    updateStep,
    removeProcess,
    clearCompleted,
  };
}

// Countdown Timer Component
interface CountdownTimerProps {
  expiresAt: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, expiry - now);

      setTimeLeft(diff);

      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isUrgent = minutes < 5;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg transition-colors",
        isUrgent ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
      )}
    >
      <Clock className={cn("h-4 w-4", isUrgent && "animate-pulse")} />
      <span>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

// Mini Progress Bar Component
interface MiniProgressBarProps {
  steps: ProcessStep[];
  className?: string;
}

export function MiniProgressBar({ steps, className }: MiniProgressBarProps) {
  const completed = steps.filter((s) => s.status === "complete").length;
  const total = steps.length;
  const percentage = (completed / total) * 100;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completed} of {total} steps
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

// Progress Pulse Component
interface ProgressPulseProps {
  status: StepStatus;
  size?: "sm" | "md" | "lg";
}

export function ProgressPulse({ status, size = "md" }: ProgressPulseProps) {
  const config = stepStatusConfig[status];
  const StatusIcon = config.icon;

  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className="relative inline-flex">
      {status === "in-progress" && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
      )}
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full",
          sizes[size],
          config.bgColor
        )}
      >
        <StatusIcon className={cn("h-4 w-4", config.color)} />
      </div>
    </div>
  );
}

// Step Tracker Component
interface StepTrackerProps {
  steps: ProcessStep[];
  onStepClick?: (step: ProcessStep) => void;
}

export function StepTracker({ steps, onStepClick }: StepTrackerProps) {
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const config = stepStatusConfig[step.status];
        const StatusIcon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all",
                onStepClick && "cursor-pointer hover:bg-muted/50",
                step.status === "in-progress" && "bg-blue-50/50"
              )}
              onClick={() => onStepClick?.(step)}
            >
              {/* Icon & Connector */}
              <div className="relative flex flex-col items-center">
                <ProgressPulse status={step.status} size="sm" />
                {!isLast && (
                  <div
                    className={cn(
                      "w-[2px] h-8 mt-1",
                      step.status === "complete" ? "bg-green-200" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{step.label}</h4>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs capitalize", config.color)}
                  >
                    {step.status.replace("-", " ")}
                  </Badge>
                </div>

                {step.description && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}

                {step.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Process Card Component
interface ProcessCardProps {
  process: SmartProcess;
  onExpand?: (process: SmartProcess) => void;
  onRetry?: (process: SmartProcess) => void;
  compact?: boolean;
}

export function ProcessCard({ process, onExpand, onRetry, compact = false }: ProcessCardProps) {
  const completed = process.steps.filter((s) => s.status === "complete").length;
  const total = process.steps.length;
  const hasFailed = process.steps.some((s) => s.status === "failed");
  const inProgress = process.steps.some((s) => s.status === "in-progress");
  const isComplete = completed === total;

  return (
    <Card
      className={cn(
        "p-4 transition-all",
        inProgress && "ring-2 ring-blue-200 ring-offset-2"
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <ProgressPulse
              status={
                isComplete ? "complete" : hasFailed ? "failed" : inProgress ? "in-progress" : "pending"
              }
            />

            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-sm">{process.title}</h3>
              <p className="text-xs text-muted-foreground">{process.description}</p>

              {process.expiresAt && !isComplete && (
                <CountdownTimer expiresAt={process.expiresAt} />
              )}
            </div>
          </div>

          {!compact && onExpand && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onExpand(process)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress */}
        {!compact && <MiniProgressBar steps={process.steps} />}

        {/* Actions */}
        {hasFailed && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry(process)}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Failed Steps
          </Button>
        )}

        {/* Compact step preview */}
        {compact && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {completed}/{total} steps complete
            </span>
            {inProgress && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-medium">In Progress</span>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Process Detail Drawer
interface ProcessDetailDrawerProps {
  process: SmartProcess | null;
  open: boolean;
  onClose: () => void;
}

export function ProcessDetailDrawer({ process, open, onClose }: ProcessDetailDrawerProps) {
  if (!process) return null;

  const completed = process.steps.filter((s) => s.status === "complete").length;
  const total = process.steps.length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Process Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{process.title}</h3>
            <p className="text-muted-foreground text-sm">{process.description}</p>
          </div>

          {/* Progress Overview */}
          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completed} / {total}
              </span>
            </div>
            <Progress value={(completed / total) * 100} />
          </div>

          {/* Countdown */}
          {process.expiresAt && completed < total && (
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <span className="text-sm font-medium">Time Remaining</span>
              <CountdownTimer expiresAt={process.expiresAt} />
            </div>
          )}

          {/* Steps */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Process Steps</h4>
            <StepTracker steps={process.steps} />
          </div>

          {/* Metadata */}
          {process.metadata && Object.keys(process.metadata).length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium text-sm">Additional Info</h4>
              <div className="space-y-1">
                {Object.entries(process.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Smart Progress Component
interface SmartProgressProps {
  processes?: SmartProcess[];
  onProcessExpand?: (process: SmartProcess) => void;
  onProcessRetry?: (process: SmartProcess) => void;
  compact?: boolean;
}

export function SmartProgress({
  processes: externalProcesses,
  onProcessExpand,
  onProcessRetry,
  compact = false,
}: SmartProgressProps) {
  const { processes: internalProcesses } = useSmartProgress();
  const processes = externalProcesses || internalProcesses;

  const [selectedProcess, setSelectedProcess] = useState<SmartProcess | null>(null);

  const handleExpand = (process: SmartProcess) => {
    if (onProcessExpand) {
      onProcessExpand(process);
    } else {
      setSelectedProcess(process);
    }
  };

  const activeProcesses = processes.filter((p) =>
    p.steps.some((s) => s.status !== "complete")
  );

  return (
    <div className="space-y-4">
      {activeProcesses.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No active processes</p>
        </Card>
      ) : (
        activeProcesses.map((process) => (
          <ProcessCard
            key={process.id}
            process={process}
            onExpand={handleExpand}
            onRetry={onProcessRetry}
            compact={compact}
          />
        ))
      )}

      <ProcessDetailDrawer
        process={selectedProcess}
        open={!!selectedProcess}
        onClose={() => setSelectedProcess(null)}
      />
    </div>
  );
}
