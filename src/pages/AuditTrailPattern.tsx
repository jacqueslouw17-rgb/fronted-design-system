import { useState } from "react";
import { ArrowLeft, User, Bot, Download, Filter, Search, Check, X, Edit3, FileText, DollarSign, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EventType = "approval" | "edit" | "payment" | "contract" | "system";
type EventStatus = "approved" | "declined" | "edited" | "completed" | "error";

interface AuditEvent {
  id: string;
  type: EventType;
  actor: {
    name: string;
    avatar?: string;
    isGenie: boolean;
  };
  headline: string;
  subtext: string;
  status: EventStatus;
  timestamp: Date;
  metadata?: string;
}

const mockEvents: AuditEvent[] = [
  {
    id: "1",
    type: "contract",
    actor: { name: "Genie", isGenie: true },
    headline: "Generated contract v3 for Jacques Morel",
    subtext: "Document ID #1847 · Auto-saved at 10:42 UTC",
    status: "completed",
    timestamp: new Date(Date.now() - 3 * 60000),
    metadata: "Contract includes updated payment terms and compliance clauses"
  },
  {
    id: "2",
    type: "approval",
    actor: { name: "Howard Chen", avatar: "", isGenie: false },
    headline: "Approved payroll batch #17",
    subtext: "52 contractors · Total: $127,450 USD",
    status: "approved",
    timestamp: new Date(Date.now() - 15 * 60000),
    metadata: "Approved after FX rate verification"
  },
  {
    id: "3",
    type: "edit",
    actor: { name: "Sarah Kim", avatar: "", isGenie: false },
    headline: "Edited Jacques' overtime hours",
    subtext: "Changed from 8h to 12h · Week 42",
    status: "edited",
    timestamp: new Date(Date.now() - 45 * 60000),
    metadata: "Manual adjustment approved by HR"
  },
  {
    id: "4",
    type: "payment",
    actor: { name: "Genie", isGenie: true },
    headline: "Executed payment to Ioana Popescu",
    subtext: "Amount: €2,840 · Via Wise · Batch #17",
    status: "completed",
    timestamp: new Date(Date.now() - 2 * 3600000),
    metadata: "Payment confirmed by bank"
  },
  {
    id: "5",
    type: "approval",
    actor: { name: "Howard Chen", avatar: "", isGenie: false },
    headline: "Approved contract for new contractor",
    subtext: "Ioana Popescu · PHP Developer · Romania",
    status: "approved",
    timestamp: new Date(Date.now() - 24 * 3600000),
  },
  {
    id: "6",
    type: "system",
    actor: { name: "Genie", isGenie: true },
    headline: "Detected document expiry for 3 contractors",
    subtext: "Renewal requests sent automatically",
    status: "completed",
    timestamp: new Date(Date.now() - 24 * 3600000),
  },
  {
    id: "7",
    type: "edit",
    actor: { name: "Genie", isGenie: true },
    headline: "Updated FX rates for 12 currencies",
    subtext: "Market rates refreshed · USD/EUR 1.08",
    status: "completed",
    timestamp: new Date(Date.now() - 2 * 24 * 3600000),
  },
  {
    id: "8",
    type: "payment",
    actor: { name: "Sarah Kim", avatar: "", isGenie: false },
    headline: "Declined payment to contractor",
    subtext: "Missing compliance documentation",
    status: "declined",
    timestamp: new Date(Date.now() - 2 * 24 * 3600000),
  },
];

const getEventIcon = (type: EventType) => {
  switch (type) {
    case "approval": return Check;
    case "edit": return Edit3;
    case "payment": return DollarSign;
    case "contract": return FileText;
    case "system": return Bot;
  }
};

const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case "approved": return "default";
    case "declined": return "destructive";
    case "edited": return "secondary";
    case "completed": return "default";
    case "error": return "destructive";
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

const groupEventsByDate = (events: AuditEvent[]) => {
  const groups: Record<string, AuditEvent[]> = {};
  
  events.forEach(event => {
    const now = new Date();
    const eventDate = event.timestamp;
    const diff = now.getTime() - eventDate.getTime();
    const days = Math.floor(diff / 86400000);
    
    let label: string;
    if (days === 0) label = "Today";
    else if (days === 1) label = "Yesterday";
    else label = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    if (!groups[label]) groups[label] = [];
    groups[label].push(event);
  });
  
  return groups;
};

const AuditTrailPattern = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<EventType[]>([]);

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = 
      event.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(event.type);
    return matchesSearch && matchesFilter;
  });

  const groupedEvents = groupEventsByDate(filteredEvents);

  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleExport = () => {
    console.log("Exporting audit trail...");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10"
          onClick={() => (window.location.href = "/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="max-w-4xl mx-auto space-y-6 pl-16 pr-6 py-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Audit Trail Timeline</h1>
            <p className="text-sm text-muted-foreground">
              Complete chronological record of every action — human or Genie — for accountability and trust
            </p>
          </div>

          {/* Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by action or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      {activeFilters.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("approval")}
                      onCheckedChange={() => toggleFilter("approval")}
                    >
                      Approvals
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("edit")}
                      onCheckedChange={() => toggleFilter("edit")}
                    >
                      Edits
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("payment")}
                      onCheckedChange={() => toggleFilter("payment")}
                    >
                      Payments
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("contract")}
                      onCheckedChange={() => toggleFilter("contract")}
                    >
                      Contracts
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("system")}
                      onCheckedChange={() => toggleFilter("system")}
                    >
                      System
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="default" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([dateLabel, events]) => (
              <div key={dateLabel} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    {dateLabel}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Events */}
                <div className="space-y-3">
                  {events.map((event, index) => {
                    const Icon = getEventIcon(event.type);
                    return (
                      <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                          <Card 
                            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                              event.actor.isGenie ? "bg-accent/20" : ""
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                {/* Left Column - Avatar & Timeline */}
                                <div className="flex flex-col items-center gap-2">
                                  <Avatar className="h-9 w-9">
                                    {event.actor.isGenie ? (
                                      <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Bot className="h-4 w-4" />
                                      </AvatarFallback>
                                    ) : (
                                      <>
                                        <AvatarImage src={event.actor.avatar} />
                                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                                          {event.actor.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                      </>
                                    )}
                                  </Avatar>
                                  {index < events.length - 1 && (
                                    <div className="flex-1 w-px bg-border min-h-[20px]" />
                                  )}
                                </div>

                                {/* Right Column - Content */}
                                <div className="flex-1 space-y-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <p className="text-sm font-medium leading-tight">
                                        {event.headline}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Badge variant={getStatusColor(event.status)} className="capitalize">
                                        {event.status}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatTimestamp(event.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {event.subtext}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        {event.metadata && (
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="text-xs">{event.metadata}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No events found matching your criteria
                </p>
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {filteredEvents.length > 0 && (
            <div className="text-center">
              <Button variant="outline" size="sm">
                Load older events
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AuditTrailPattern;