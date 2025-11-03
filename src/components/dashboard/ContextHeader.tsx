import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, X } from "lucide-react";
import { useContextTracker, ContextType } from "@/hooks/useContextTracker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const contextTypeIcons = {
  payroll: "💰",
  contract: "📄",
  compliance: "✓",
  support: "🎧",
  dashboard: "📊",
};

const ContextHeader = () => {
  const { getActiveContext, switchContext, getRecentContexts, pauseContext } = useContextTracker();
  const activeContext = getActiveContext();
  const recentContexts = getRecentContexts();
  const { toast } = useToast();

  if (!activeContext) {
    return null;
  }

  const handleSwitch = (contextId: string) => {
    const newContext = recentContexts.find((c) => c.id === contextId);
    if (newContext) {
      switchContext(contextId);
      toast({
        title: "Context Switched",
        description: `Now working on: ${newContext.name}`,
      });
    }
  };

  const handlePause = () => {
    pauseContext(activeContext.id);
    toast({
      title: "Context Paused",
      description: `${activeContext.name} has been paused`,
    });
  };

  const statusColors = {
    active: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    archived: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <div className="border-b bg-muted/30 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl">{contextTypeIcons[activeContext.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{activeContext.name}</h3>
              <Badge variant="outline" className={statusColors[activeContext.status]}>
                {activeContext.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ID: {activeContext.id.split('-').slice(0, 2).join('-')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                Switch Context
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
              {recentContexts
                .filter((c) => c.id !== activeContext.id)
                .map((context) => (
                  <DropdownMenuItem
                    key={context.id}
                    onClick={() => handleSwitch(context.id)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg">{contextTypeIcons[context.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{context.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(context.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {context.messages.length}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              {recentContexts.length <= 1 && (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No other contexts available
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePause}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Pause
          </Button>
        </div>
      </div>

      {activeContext.metadata && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {Object.entries(activeContext.metadata).map(([key, value]) => (
            <span key={key} className="bg-muted px-2 py-1 rounded">
              {key}: <strong>{String(value)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextHeader;
