import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContextTracker } from "@/hooks/useContextTracker";
import { Clock, FileText, DollarSign, Shield, Headphones, LayoutDashboard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const contextTypeIcons = {
  payroll: DollarSign,
  contract: FileText,
  compliance: Shield,
  support: Headphones,
  dashboard: LayoutDashboard,
};

const ThreadHistory = () => {
  const { getRecentContexts, resumeContext, activeContextId } = useContextTracker();
  const contexts = getRecentContexts(10);
  const { toast } = useToast();

  const handleResume = (contextId: string) => {
    const context = contexts.find((c) => c.id === contextId);
    resumeContext(contextId);
    toast({
      title: "Context Resumed",
      description: `Continuing work on: ${context?.name}`,
    });
  };

  const statusColors = {
    active: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    archived: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Genie Threads
        </CardTitle>
        <CardDescription>
          Your conversation history and active contexts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {contexts.map((context) => {
              const Icon = contextTypeIcons[context.type];
              const isActive = context.id === activeContextId;

              return (
                <div
                  key={context.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    isActive ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="p-2 rounded-md bg-muted">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{context.name}</h4>
                      <Badge variant="outline" className={statusColors[context.status]}>
                        {context.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>{context.messages.length} messages</span>
                        <span>{context.actions.length} actions</span>
                      </div>
                      <div>
                        Updated {formatDistanceToNow(new Date(context.updatedAt), { addSuffix: true })}
                      </div>
                    </div>

                    {context.metadata && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(context.metadata).slice(0, 3).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                          >
                            {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isActive && context.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResume(context.id)}
                    >
                      Resume
                    </Button>
                  )}
                  {isActive && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
              );
            })}

            {contexts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversation threads yet</p>
                <p className="text-xs">Start a conversation with Genie to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ThreadHistory;
