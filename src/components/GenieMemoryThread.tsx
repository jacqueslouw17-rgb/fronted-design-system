import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Brain, Play, Eye, Trash2, Edit2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type MemoryStatus = "pending" | "completed" | "paused";
export type MemoryScope = "session" | "module" | "global";

export interface MemoryEntry {
  id: string;
  title: string;
  description: string;
  entityType: string;
  entityName?: string;
  status: MemoryStatus;
  scope: MemoryScope;
  timestamp: Date;
  context?: Record<string, any>;
}

interface RecallCardProps {
  memory: MemoryEntry;
  onResume?: (memory: MemoryEntry) => void;
  onView?: (memory: MemoryEntry) => void;
  onForget?: (memory: MemoryEntry) => void;
  className?: string;
}

export const RecallCard = ({ memory, onResume, onView, onForget, className }: RecallCardProps) => {
  const getStatusConfig = (status: MemoryStatus) => {
    const configs = {
      pending: { icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", label: "Pending" },
      completed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/20", label: "Completed" },
      paused: { icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20", label: "Paused" }
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(memory.status);
  const StatusIcon = statusConfig.icon;

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <Card className={cn("transition-all hover:shadow-md animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatusIcon className={cn("w-4 h-4 flex-shrink-0", statusConfig.color)} />
            <CardTitle className="text-base truncate">{memory.title}</CardTitle>
          </div>
          <Badge variant="secondary" className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
            {statusConfig.label}
          </Badge>
        </div>
        <CardDescription className="text-sm mt-1.5">{memory.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{getTimeSince(memory.timestamp)}</span>
            {memory.entityName && (
              <>
                <span>•</span>
                <span className="font-medium">{memory.entityName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onResume && memory.status !== "completed" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onResume(memory)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resume</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onView && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onView(memory)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View details</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onForget && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      onClick={() => onForget(memory)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Forget</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ContextTagProps {
  entityType: string;
  entityName?: string;
  onRemove?: () => void;
  className?: string;
}

export const ContextTag = ({ entityType, entityName, onRemove, className }: ContextTagProps) => {
  return (
    <Badge variant="outline" className={cn("gap-1.5 pl-2 pr-1.5 py-1", className)}>
      <Brain className="w-3 h-3" />
      <span className="text-xs">
        {entityType}
        {entityName && `: ${entityName}`}
      </span>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={onRemove}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </Badge>
  );
};

interface MemoryChipGroupProps {
  memories: MemoryEntry[];
  onSelect?: (memory: MemoryEntry) => void;
  className?: string;
}

export const MemoryChipGroup = ({ memories, onSelect, className }: MemoryChipGroupProps) => {
  if (!memories.length) return null;

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {memories.slice(0, 5).map((memory) => (
          <Button
            key={memory.id}
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all hover:scale-105 active:scale-95"
            onClick={() => onSelect?.(memory)}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            {memory.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

interface MemoryDrawerProps {
  memories: MemoryEntry[];
  onResume?: (memory: MemoryEntry) => void;
  onView?: (memory: MemoryEntry) => void;
  onForget?: (memory: MemoryEntry) => void;
  trigger?: React.ReactNode;
}

export const MemoryDrawer = ({ memories, onResume, onView, onForget, trigger }: MemoryDrawerProps) => {
  const pendingCount = memories.filter(m => m.status === "pending").length;
  const completedCount = memories.filter(m => m.status === "completed").length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Brain className="w-4 h-4" />
            Memory & Recall
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Memory & Recall
          </SheetTitle>
          <SheetDescription>
            {pendingCount} pending tasks • {completedCount} completed this week
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {memories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No memory threads yet</p>
            </div>
          ) : (
            memories.map((memory) => (
              <RecallCard
                key={memory.id}
                memory={memory}
                onResume={onResume}
                onView={onView}
                onForget={onForget}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface InlineMemoryRecallProps {
  memory: MemoryEntry;
  onResume?: () => void;
  onView?: () => void;
  onForget?: () => void;
  className?: string;
}

export const InlineMemoryRecall = ({ 
  memory, 
  onResume, 
  onView, 
  onForget,
  className 
}: InlineMemoryRecallProps) => {
  return (
    <Card className={cn("border-l-4 border-l-primary animate-fade-in", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm mb-1">
              Picking up where we left off...
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {memory.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {onResume && (
                <Button size="sm" onClick={onResume}>
                  <Play className="w-3 h-3 mr-1.5" />
                  Resume
                </Button>
              )}
              {onView && (
                <Button size="sm" variant="outline" onClick={onView}>
                  <Eye className="w-3 h-3 mr-1.5" />
                  View Summary
                </Button>
              )}
              {onForget && (
                <Button size="sm" variant="ghost" onClick={onForget}>
                  <Trash2 className="w-3 h-3 mr-1.5" />
                  Forget
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memory management hooks
export const useMemoryThread = () => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);

  const captureMemory = (memory: Omit<MemoryEntry, "id" | "timestamp">) => {
    const newMemory: MemoryEntry = {
      ...memory,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMemories(prev => [newMemory, ...prev]);
    toast.success("Context saved");
    return newMemory;
  };

  const recallMemory = (id: string) => {
    const memory = memories.find(m => m.id === id);
    if (memory) {
      toast.success("Context restored");
      return memory;
    }
    return null;
  };

  const forgetMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    toast.success("Memory cleared");
  };

  const updateMemoryStatus = (id: string, status: MemoryStatus) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  return {
    memories,
    captureMemory,
    recallMemory,
    forgetMemory,
    updateMemoryStatus,
  };
};
