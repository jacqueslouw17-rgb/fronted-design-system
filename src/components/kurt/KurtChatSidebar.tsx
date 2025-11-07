import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentState } from "@/hooks/useAgentState";
import { format, isToday, isYesterday } from "date-fns";

interface KurtChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MessageWithTimestamp {
  role: "user" | "kurt" | "system";
  text: string;
  timestamp: Date;
}

export const KurtChatSidebar: React.FC<KurtChatSidebarProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const { messages, loading } = useAgentState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [groupedMessages, setGroupedMessages] = useState<Record<string, MessageWithTimestamp[]>>({});

  // Group messages by date
  useEffect(() => {
    const messagesWithTimestamps: MessageWithTimestamp[] = messages.map((msg) => ({
      ...msg,
      timestamp: new Date(),
    }));

    const grouped = messagesWithTimestamps.reduce((acc, msg) => {
      let dateLabel = format(msg.timestamp, "MMM d, yyyy");
      if (isToday(msg.timestamp)) dateLabel = "Today";
      else if (isYesterday(msg.timestamp)) dateLabel = "Yesterday";

      if (!acc[dateLabel]) acc[dateLabel] = [];
      acc[dateLabel].push(msg);
      return acc;
    }, {} as Record<string, MessageWithTimestamp[]>);

    setGroupedMessages(grouped);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "fixed top-0 right-0 h-full w-full sm:w-[360px] bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-md border-l border-border shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-50 flex flex-col rounded-l-xl",
              className
            )}
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Kurt</h2>
                  <p className="text-xs text-muted-foreground">your AI assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages - Scrollable */}
            <ScrollArea className="flex-1 overflow-hidden">
              <div ref={scrollRef} className="p-4 space-y-6">
                {Object.keys(groupedMessages).length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="rounded-full bg-primary/10 p-4 mb-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Ask Kurt for updates!
                    </p>
                  </motion.div>
                )}

                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex justify-center">
                      <span className="text-xs text-muted-foreground/70 bg-muted/30 px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>

                    {/* Messages */}
                    {msgs.map((msg, idx) => (
                      <motion.div
                        key={`${date}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "flex",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                            msg.role === "user"
                              ? "bg-muted/40 text-foreground"
                              : "bg-primary/10 text-foreground border border-primary/20"
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                            {format(msg.timestamp, "HH:mm")}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}

                {/* Loading State */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-lg px-3 py-2 bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Footer - Fixed */}
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                <input
                  type="text"
                  placeholder="Chat disabled for Flow 2"
                  disabled
                  className="flex-1 bg-transparent text-sm text-muted-foreground outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
                Use action tags to interact with Kurt
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
