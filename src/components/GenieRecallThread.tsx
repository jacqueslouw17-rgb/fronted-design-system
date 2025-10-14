import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  UserPlus,
  FileText,
  DollarSign,
  Shield,
  Headphones,
  Clock,
} from "lucide-react";
import { RecallThread } from "@/hooks/useRecallThread";
import { cn } from "@/lib/utils";

type RecallThreadCardProps = {
  thread: RecallThread;
  onResume: (id: string) => void;
  onPause?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
};

const flowIcons = {
  onboarding: UserPlus,
  contract: FileText,
  payroll: DollarSign,
  compliance: Shield,
  support: Headphones,
};

const statusConfig = {
  active: {
    color: "bg-green-500",
    label: "Active",
    variant: "default" as const,
  },
  paused: {
    color: "bg-orange-500",
    label: "Paused",
    variant: "secondary" as const,
  },
  completed: {
    color: "bg-blue-500",
    label: "Completed",
    variant: "outline" as const,
  },
};

export const RecallThreadCard = ({
  thread,
  onResume,
  onPause,
  onDelete,
  className,
}: RecallThreadCardProps) => {
  const Icon = flowIcons[thread.flowType];
  const progressPercentage = Math.round((thread.currentStep / thread.totalSteps) * 100);
  const statusStyle = statusConfig[thread.status];

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("relative", className)}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        {/* Status Indicator */}
        <div className="absolute top-3 right-3">
          <Badge variant={statusStyle.variant} className="gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.color)} />
            {statusStyle.label}
          </Badge>
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{thread.flowName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Step {thread.currentStep} of {thread.totalSteps}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(thread.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {/* Last Action */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            Last action: <span className="text-foreground">{thread.lastAction}</span>
          </p>
          {thread.lastMessage && (
            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
              "{thread.lastMessage}"
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Progress</span>
            <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {thread.status !== "completed" && (
            <>
              <Button
                size="sm"
                onClick={() => onResume(thread.id)}
                className="flex-1 gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                {thread.status === "paused" ? "Resume" : "Continue"}
              </Button>
              {thread.status === "active" && onPause && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPause(thread.id)}
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pause thread</TooltipContent>
                </Tooltip>
              )}
            </>
          )}
          {thread.status === "completed" && (
            <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Completed
            </div>
          )}
          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(thread.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete thread</TooltipContent>
            </Tooltip>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

type ThreadListPanelProps = {
  threads: RecallThread[];
  onResume: (id: string) => void;
  onPause?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
};

export const ThreadListPanel = ({
  threads,
  onResume,
  onPause,
  onDelete,
  emptyMessage = "No active threads",
}: ThreadListPanelProps) => {
  if (threads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <RecallThreadCard
          key={thread.id}
          thread={thread}
          onResume={onResume}
          onPause={onPause}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default RecallThreadCard;
