import React, { useState, useMemo, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, User, FileEdit, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export type ContractEditEventType = 'edit' | 'reset';

export interface ContractEditEvent {
  id: string;
  editorName: string;
  timestamp: string; // UTC ISO string
  workerName: string;
  eventType?: ContractEditEventType; // 'edit' (default) or 'reset'
}

interface ContractAuditLogProps {
  contractId: string;
  workerName: string;
  editEvents: ContractEditEvent[];
  /** Max height available for this component (in px). Used to enable scrolling when showing full history. */
  maxHeightPx?: number;
}

const INITIAL_VISIBLE_COUNT = 3;

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

type DateGroup = 'Today' | 'Yesterday' | 'This week' | 'Older';

const getDateGroup = (isoString: string): DateGroup => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This week';
  return 'Older';
};

interface GroupedEvents {
  group: DateGroup;
  events: ContractEditEvent[];
}

const groupEventsByDate = (events: ContractEditEvent[]): GroupedEvents[] => {
  const groups: Record<DateGroup, ContractEditEvent[]> = {
    'Today': [],
    'Yesterday': [],
    'This week': [],
    'Older': [],
  };

  events.forEach(event => {
    const group = getDateGroup(event.timestamp);
    groups[group].push(event);
  });

  const order: DateGroup[] = ['Today', 'Yesterday', 'This week', 'Older'];
  return order
    .filter(group => groups[group].length > 0)
    .map(group => ({ group, events: groups[group] }));
};

export const ContractAuditLog: React.FC<ContractAuditLogProps> = ({
  contractId,
  workerName,
  editEvents,
  maxHeightPx,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const showAllToggleRef = useRef<HTMLButtonElement | null>(null);
  const [scrollMaxHeight, setScrollMaxHeight] = useState<number | undefined>(undefined);

  const editCount = editEvents.length;
  const mostRecentEdit = editEvents[0] || null;
  const hasMoreEdits = editCount > INITIAL_VISIBLE_COUNT;

  const recalcScrollMaxHeight = useCallback(() => {
    if (!maxHeightPx || !isOpen) {
      setScrollMaxHeight(undefined);
      return;
    }

    // Tailwind spacing used in this component:
    // mt-3 (12px) on the root + mt-2 (8px) on the expanded card.
    const rootMtPx = 12;
    const expandedCardMtPx = 8;

    const triggerH = triggerButtonRef.current?.offsetHeight ?? 0;
    const toggleH = hasMoreEdits ? (showAllToggleRef.current?.offsetHeight ?? 0) : 0;

    // Small safety padding so we don't clip borders / last row.
    const safetyPx = 8;

    const available =
      maxHeightPx - rootMtPx - triggerH - expandedCardMtPx - toggleH - safetyPx;

    setScrollMaxHeight(Math.max(96, available));
  }, [hasMoreEdits, isOpen, maxHeightPx]);

  useLayoutEffect(() => {
    recalcScrollMaxHeight();
    window.addEventListener("resize", recalcScrollMaxHeight);
    return () => window.removeEventListener("resize", recalcScrollMaxHeight);
  }, [recalcScrollMaxHeight, showAll, editEvents.length]);

  // Events to display based on showAll state
  const visibleEvents = useMemo(() => {
    if (showAll) return editEvents;
    return editEvents.slice(0, INITIAL_VISIBLE_COUNT);
  }, [editEvents, showAll]);

  // Grouped events for full view
  const groupedEvents = useMemo(() => {
    return groupEventsByDate(editEvents);
  }, [editEvents]);

  if (editCount === 0) {
    return null; // Don't show if no edits
  }

  const hiddenCount = editCount - INITIAL_VISIBLE_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.2 }}
      className="mt-3"
    >
      <Collapsible open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setShowAll(false); // Reset showAll when collapsing
      }}>
        <CollapsibleTrigger asChild>
          <button
            ref={triggerButtonRef}
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
                  {/* Edit log list - caps to available height, then scrolls */}
                  <div
                    className="overflow-y-auto"
                    style={scrollMaxHeight ? { maxHeight: scrollMaxHeight } : undefined}
                  >
                    {showAll ? (
                      // Grouped view when showing all
                      <div className="divide-y divide-border/20">
                        {groupedEvents.map((group) => (
                          <div key={group.group}>
                            {/* Group header */}
                            <div className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border/10">
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                {group.group}
                              </span>
                            </div>
                            {/* Group events */}
                            {group.events.map((event) => {
                              const isLatest = event.id === editEvents[0]?.id;
                              const isReset = event.eventType === 'reset';
                              const opacityClass = !isLatest && group.group === 'Older' 
                                ? 'opacity-60' 
                                : group.group === 'This week' && !isLatest
                                  ? 'opacity-80'
                                  : '';
                              
                              return (
                                <div
                                  key={event.id}
                                  className={`px-3 py-2 flex items-start gap-2 hover:bg-muted/10 transition-colors ${opacityClass}`}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isReset ? 'bg-primary/10' : 'bg-muted/50'}`}>
                                      {isReset ? (
                                        <RotateCcw className="h-3 w-3 text-primary" />
                                      ) : (
                                        <User className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs text-foreground font-medium truncate">
                                        {event.editorName}
                                      </p>
                                      {isReset && (
                                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                                          Reset to original
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-[10px] text-muted-foreground">
                                        {formatTimestamp(event.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                  {isLatest && (
                                    <Badge variant="outline" className="h-4 px-1.5 text-[9px] flex-shrink-0">
                                      Latest
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Compact view - show first 3
                      <div className="divide-y divide-border/20">
                        {visibleEvents.map((event, index) => {
                          const isReset = event.eventType === 'reset';
                          return (
                            <div
                              key={event.id}
                              className="px-3 py-2 flex items-start gap-2 hover:bg-muted/10 transition-colors"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isReset ? 'bg-primary/10' : 'bg-muted/50'}`}>
                                  {isReset ? (
                                    <RotateCcw className="h-3 w-3 text-primary" />
                                  ) : (
                                    <User className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs text-foreground font-medium truncate">
                                    {event.editorName}
                                  </p>
                                  {isReset && (
                                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                                      Reset to original
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatRelativeTime(event.timestamp)}
                                  </span>
                                </div>
                              </div>
                              {index === 0 && (
                                <Badge variant="outline" className="h-4 px-1.5 text-[9px] flex-shrink-0">
                                  Latest
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Show all / Show less toggle */}
                  {hasMoreEdits && (
                    <button
                      ref={showAllToggleRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAll(!showAll);
                      }}
                      className="w-full px-3 py-2 border-t border-border/20 bg-muted/10 hover:bg-muted/20 transition-colors text-center"
                    >
                      <span className="text-[11px] text-primary font-medium">
                        {showAll ? 'Show less' : `Show all ${editCount} edits`}
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};
