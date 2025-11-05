import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Filter } from "lucide-react";
import type { PayrollBatch, BatchEvent } from "@/types/payroll";

interface AuditLogViewerProps {
  batch: PayrollBatch;
  onGeneratePDF?: () => void;
  onExportCSV?: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  batch,
  onGeneratePDF,
  onExportCSV,
}) => {
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const allEvents: Array<BatchEvent & { type: "batch" | "approval" }> = [
    ...batch.events.map((e) => ({ ...e, type: "batch" as const })),
    ...batch.approvals.map((a) => ({
      at: a.at,
      actor: "User" as const,
      message: `${a.role} ${a.action.toLowerCase()} the batch${a.note ? `: ${a.note}` : ""}`,
      level: "info" as const,
      type: "approval" as const,
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const filteredEvents = allEvents.filter((event) => {
    if (actorFilter !== "all" && event.actor !== actorFilter) return false;
    if (levelFilter !== "all" && event.level !== levelFilter) return false;
    return true;
  });

  const getLevelBadge = (level: BatchEvent["level"]) => {
    const variants: Record<BatchEvent["level"], { variant: any; label: string }> = {
      info: { variant: "outline", label: "Info" },
      warn: { variant: "default", label: "Warning" },
      error: { variant: "destructive", label: "Error" },
    };
    return variants[level];
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Audit Log</h3>
          <div className="flex gap-2">
            {onExportCSV && (
              <Button onClick={onExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            {onGeneratePDF && (
              <Button onClick={onGeneratePDF} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actors</SelectItem>
                <SelectItem value="Genie">Genie</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEvents.map((event, index) => {
            const levelInfo = getLevelBadge(event.level);

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {event.actor}
                    </Badge>
                    <Badge variant={levelInfo.variant} className="text-xs">
                      {levelInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{event.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No events match the selected filters</p>
          </div>
        )}
      </Card>
    </div>
  );
};
