import { useState } from "react";
import { Bell, Clock, AlertTriangle, FileText, Sparkles, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type NotificationType = "sla" | "genie" | "system" | "compliance";
type Priority = "low" | "medium" | "high" | "critical";
type Status = "unread" | "active" | "breach" | "resolved";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  status: Status;
  timestamp: Date;
  timeLeft?: string;
  genieHint?: string;
  quickAction?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
}

const NotificationCenter = ({
  notifications = [],
  onDismiss,
  onMarkAllRead,
}: NotificationCenterProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "sla":
        return <Clock className="h-4 w-4" />;
      case "genie":
        return <Sparkles className="h-4 w-4" />;
      case "system":
        return <FileText className="h-4 w-4" />;
      case "compliance":
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "low":
      return "bg-muted text-muted-foreground";
    case "medium":
      return "bg-foreground/10 text-foreground";
    case "high":
      return "bg-primary text-primary-foreground";
    case "critical":
      return "bg-destructive text-destructive-foreground";
  }
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case "unread":
      return "bg-primary/10 border-primary/20";
    case "active":
      return "bg-foreground/5 border-border";
    case "breach":
      return "bg-destructive/10 border-destructive/20";
    case "resolved":
      return "bg-muted border-border";
  }
};

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0" align="end">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sla">SLA</TabsTrigger>
                <TabsTrigger value="genie">Genie</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[400px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No notifications
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 border-l-4 transition-colors hover:bg-primary/5",
              getStatusColor(notification.status)
            )}
          >
                        {/* Main Content */}
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              "shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                              getPriorityColor(notification.priority)
                            )}
                          >
                            {getIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => onDismiss?.(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {notification.message}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {notification.timeLeft && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs animate-pulse",
                                    notification.status === "breach" &&
                                      "border-destructive text-destructive"
                                  )}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {notification.timeLeft}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {/* Genie Hint */}
            {notification.genieHint && (
              <div className="mt-2 p-2 bg-foreground/5 rounded-md border border-border">
                <p className="text-xs text-foreground flex items-start gap-1">
                  <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
                  <span className="font-medium">Genie:</span>
                  <span>{notification.genieHint}</span>
                </p>
              </div>
            )}

                            {/* Quick Action */}
                            {notification.quickAction && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-7 text-xs"
                                onClick={notification.quickAction.onClick}
                              >
                                {notification.quickAction.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <Button variant="ghost" className="w-full text-xs" size="sm">
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
