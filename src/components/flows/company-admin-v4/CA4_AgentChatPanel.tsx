import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCA4Agent } from './CA4_AgentContext';
import { AgentMessage, AgentAction } from './CA4_AgentTypes';
import { processAgentQuery } from './CA4_AgentResponses';

export const CA4_AgentChatPanel: React.FC = () => {
  const {
    isOpen,
    setOpen,
    messages,
    addMessage,
    isNavigating,
    navigationMessage,
    executeAction,
    setNavigating,
    setHighlights,
    setOpenWorkerId,
    setDraftAdjustment,
  } = useCA4Agent();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    addMessage({ role: 'user', content: query });
    setInput('');
    setIsLoading(true);

    await processAgentQuery(query, {
      addMessage,
      setNavigating,
      setHighlights,
      setOpenWorkerId,
      setDraftAdjustment,
      executeAction,
    });

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const handleActionClick = (action: AgentAction) => {
    executeAction(action);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full bg-background flex flex-col overflow-hidden border-l border-border/20"
        >
          {/* Ultra minimal header - just close button */}
          <div className="flex items-center justify-end px-4 py-3">
            <button 
              onClick={() => setOpen(false)} 
              className="p-1 rounded-md hover:bg-muted/40 transition-colors text-muted-foreground/60 hover:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5"
          >
            <div className="space-y-6 pb-4">
              {messages.length === 0 ? (
                <div className="pt-8">
                  <p className="text-[13px] text-muted-foreground/70 leading-relaxed">
                    Ask about payroll, costs, or workers.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onActionClick={handleActionClick}
                  />
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-muted-foreground/30"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}

              {/* Navigation status - inline */}
              {isNavigating && (
                <p className="text-xs text-muted-foreground/60">
                  {navigationMessage || 'Looking...'}
                </p>
              )}
            </div>
          </div>

          {/* Input - ultra minimal */}
          <div className="p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 focus-within:border-border/60 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-[13px] placeholder:text-muted-foreground/40 outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  input.trim() 
                    ? "bg-foreground text-background" 
                    : "text-muted-foreground/30"
                )}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Ultra minimal message styling
const MessageBubble: React.FC<{
  message: AgentMessage;
  onActionClick: (action: AgentAction) => void;
}> = ({ message, onActionClick }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-2 rounded-xl bg-muted/50 text-foreground/80 text-[13px] leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Response text */}
      <div className="text-[13px] text-foreground/90 leading-relaxed">
        {message.summary || message.content}
      </div>

      {/* Actions as subtle text links */}
      {message.actions && message.actions.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {message.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionClick(action)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {action.label} →
            </button>
          ))}
        </div>
      )}

      {/* Context - barely visible */}
      {message.context && Object.keys(message.context).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.entries(message.context).map(([key, value]) => (
            value && (
              <span 
                key={key}
                className="text-[10px] text-muted-foreground/50"
              >
                {value}
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );
};
