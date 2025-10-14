import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  DollarSign,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Send,
  Edit,
  AlertCircle,
  ChevronRight,
  Filter,
  Activity,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import KurtAvatar from "./KurtAvatar";

// Types
export type EventType =
  | "contract"
  | "payroll"
  | "compliance"
  | "support"
  | "policy"
  | "payout"
  | "upload"
  | "approval";

export type EventStatus = "success" | "pending" | "failed" | "info";

export type EventActor = "genie" | "user" | "system";

export interface TimelineEvent {
  id: string;
  type: EventType;
  status: EventStatus;
  actor: EventActor;
  actorName: string;
  title: string;
  description: string;
  context?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  isNew?: boolean;
}

// Event type configuration
const eventTypeConfig: Record<EventType, { icon: any; color: string; label: string }> = {
  contract: { icon: FileText, color: "text-blue-600 bg-blue-100", label: "Contract" },
  payroll: { icon: DollarSign, color: "text-green-600 bg-green-100", label: "Payroll" },
  compliance: { icon: Shield, color: "text-purple-600 bg-purple-100", label: "Compliance" },
  support: { icon: Users, color: "text-orange-600 bg-orange-100", label: "Support" },
  policy: { icon: FileText, color: "text-indigo-600 bg-indigo-100", label: "Policy" },
  payout: { icon: DollarSign, color: "text-emerald-600 bg-emerald-100", label: "Payout" },
  upload: { icon: Upload, color: "text-cyan-600 bg-cyan-100", label: "Upload" },
  approval: { icon: CheckCircle2, color: "text-teal-600 bg-teal-100", label: "Approval" },
};

// Status configuration
const statusConfig: Record<EventStatus, { icon: any; color: string }> = {
  success: { icon: CheckCircle2, color: "text-green-600" },
  pending: { icon: Clock, color: "text-yellow-600" },
  failed: { icon: XCircle, color: "text-red-600" },
  info: { icon: AlertCircle, color: "text-blue-600" },
};

// Hook for timeline state management
export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const stored = localStorage.getItem("genie-timeline-events");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("genie-timeline-events", JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<TimelineEvent, "id" | "timestamp">) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isNew: true,
    };

    setEvents((prev) => [newEvent, ...prev]);

    // Remove isNew flag after animation
    setTimeout(() => {
      setEvents((prev) =>
        prev.map((e) => (e.id === newEvent.id ? { ...e, isNew: false } : e))
      );
    }, 3000);

    return newEvent;
  };

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem("genie-timeline-events");
  };

  return { events, addEvent, clearEvents };
}

// Event Card Component
interface EventCardProps {
  event: TimelineEvent;
  onExpand?: (event: TimelineEvent) => void;
  showConnector?: boolean;
}

export function EventCard({ event, onExpand, showConnector = true }: EventCardProps) {
  const typeConfig = eventTypeConfig[event.type];
  const statusInfo = statusConfig[event.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusInfo.icon;

  const getActorAvatar = () => {
    switch (event.actor) {
      case "genie":
        return <KurtAvatar size="sm" />;
      case "user":
        return (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {event.actorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      case "system":
        return (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              <Activity className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        );
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex gap-4 pb-6 transition-all duration-500",
          event.isNew && "animate-in slide-in-from-top-2"
        )}
      >
        {/* Avatar & Connector Line */}
        <div className="relative flex flex-col items-center">
          <div className={cn("relative", event.isNew && "animate-pulse")}>
            {event.isNew && (
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            )}
            {getActorAvatar()}
          </div>

          {showConnector && (
            <div className="w-[2px] flex-1 bg-border mt-2" />
          )}
        </div>

        {/* Event Content */}
        <Card
          className={cn(
            "flex-1 p-4 transition-all duration-300 hover:shadow-md cursor-pointer",
            event.isNew && "ring-2 ring-primary ring-offset-2"
          )}
          onClick={() => onExpand?.(event)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Event Type Icon */}
              <div className={cn("p-2 rounded-lg", typeConfig.color)}>
                <TypeIcon className="h-4 w-4" />
              </div>

              {/* Event Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
                  {event.isNew && (
                    <Badge variant="secondary" className="animate-pulse">
                      New
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{event.description}</p>

                {event.context && (
                  <p className="text-xs text-muted-foreground mt-2">{event.context}</p>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">{event.actorName}</span>
                  <span>•</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                  <Badge variant="outline" className="text-xs">
                    {typeConfig.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            {onExpand && (
              <Button variant="ghost" size="icon" className="shrink-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Event Detail Drawer
interface EventDetailDrawerProps {
  event: TimelineEvent | null;
  open: boolean;
  onClose: () => void;
}

export function EventDetailDrawer({ event, open, onClose }: EventDetailDrawerProps) {
  if (!event) return null;

  const typeConfig = eventTypeConfig[event.type];
  const statusInfo = statusConfig[event.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", typeConfig.color)}>
              <TypeIcon className="h-5 w-5" />
            </div>
            Event Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusInfo.color)} />
            <span className="font-medium capitalize">{event.status}</span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          {/* Context */}
          {event.context && (
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium text-sm mb-2">Context</h4>
              <p className="text-sm text-muted-foreground">{event.context}</p>
            </div>
          )}

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Additional Details</h4>
              <div className="space-y-1">
                {Object.entries(event.metadata).map(([key, value]) => (
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

          {/* Actor & Timestamp */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actor:</span>
              <span className="font-medium">{event.actorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{typeConfig.label}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1">Open in Context</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Timeline Component
interface TimelineProps {
  events?: TimelineEvent[];
  showFilters?: boolean;
  maxHeight?: string;
}

export function Timeline({ events: externalEvents, showFilters = true, maxHeight = "600px" }: TimelineProps) {
  const { events: internalEvents } = useTimeline();
  const events = externalEvents || internalEvents;

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const filteredEvents = events.filter((event) => {
    if (filterType !== "all" && event.type !== filterType) return false;
    if (filterStatus !== "all" && event.status !== filterStatus) return false;
    return true;
  });

  const handleExpand = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="payout">Payout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="ml-auto">
            {filteredEvents.length} events
          </Badge>
        </div>
      )}

      {/* Timeline */}
      <ScrollArea style={{ maxHeight }}>
        <div className="pr-4">
          {filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No events to display</p>
            </Card>
          ) : (
            filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                onExpand={handleExpand}
                showConnector={index < filteredEvents.length - 1}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

// Live Pulse Indicator
export function LivePulseIndicator({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </div>
      <span>Live</span>
    </div>
  );
}
