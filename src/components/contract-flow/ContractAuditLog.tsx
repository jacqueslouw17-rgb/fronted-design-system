import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, User, FileEdit } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ContractEditEvent {
  id: string;
  editorName: string;
  timestamp: string; // UTC ISO string
  workerName: string;
}

interface ContractAuditLogProps {
  contractId: string;
  workerName: string;
  editEvents: ContractEditEvent[];
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }) + ' UTC';
};

const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatTimestamp(isoString);
};

export const ContractAuditLog: React.FC<ContractAuditLogProps> = ({
  contractId,
  workerName,
  editEvents,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const editCount = editEvents.length;
  const mostRecentEdit = editEvents[0] || null;

  if (editCount === 0) {
    return null; // Don't show if no edits
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.2 }}
      className="mt-3"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-muted/40 border border-border/40 transition-all duration-200 text-left group"
          >
            {/* Header row */}
            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <FileEdit className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  Edit history
                </span>
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium bg-muted/60">
                  {editCount}
                </Badge>
              </div>
              <ChevronDown 
                className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
            
            {/* Last edit preview - only in collapsed state */}
            {!isOpen && mostRecentEdit && (
              <div className="flex items-center gap-1.5 pl-7 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {mostRecentEdit.editorName} · {formatRelativeTime(mostRecentEdit.timestamp)}
                </span>
              </div>
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mt-2 rounded-lg border border-border/30 bg-card/30 overflow-hidden">
                  {/* Summary header */}
                  {mostRecentEdit && (
                    <div className="px-3 py-2 border-b border-border/20 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground">
                        Last edited by <span className="text-foreground font-medium">{mostRecentEdit.editorName}</span>
                        {' · '}
                        <span className="text-muted-foreground">{formatRelativeTime(mostRecentEdit.timestamp)}</span>
                      </p>
                    </div>
                  )}

                  {/* Edit log list */}
                  <ScrollArea className="max-h-40">
                    <div className="divide-y divide-border/20">
                      {editEvents.map((event, index) => (
                        <div
                          key={event.id}
                          className="px-3 py-2 flex items-start gap-2 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-medium truncate">
                              {event.editorName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </div>
                          </div>
                          {index === 0 && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] flex-shrink-0">
                              Latest
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Footer */}
                  <div className="px-3 py-1.5 border-t border-border/20 bg-muted/10">
                    <p className="text-[10px] text-muted-foreground text-center">
                      {editCount} edit{editCount !== 1 ? 's' : ''} recorded · Read-only log
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};
