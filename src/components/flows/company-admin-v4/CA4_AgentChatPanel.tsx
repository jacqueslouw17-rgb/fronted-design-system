import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2 } from 'lucide-react';
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    // Add user message
    addMessage({ role: 'user', content: query });
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Process query and get response
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
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full bg-background flex flex-col overflow-hidden border-l border-border/30"
        >
          {/* Minimal Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Animated frequency indicator - mini version */}
              <div className="flex items-center gap-0.5 h-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full bg-primary"
                    animate={{
                      height: [6, 12, 8, 14, 6],
                      opacity: [0.5, 0.8, 0.6, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">Kurt</span>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Status - minimal */}
          <AnimatePresence>
            {isNavigating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-3"
              >
                <div className="flex items-center gap-2 text-xs text-primary/80">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{navigationMessage || 'Navigating...'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 pb-4"
          >
            <div className="space-y-5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                    Ask about payroll, costs, workers, or anything else.
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

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/40"
                        animate={{ 
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input - clean, minimal */}
          <div className="px-4 pb-4 pt-2">
            <div className="relative flex items-end gap-2 rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 focus-within:border-primary/30 focus-within:bg-muted/40 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Kurt..."
                rows={1}
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 resize-none outline-none min-h-[20px] max-h-[120px]"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  input.trim() 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-muted-foreground/40"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Minimal Message Bubble
const MessageBubble: React.FC<{
  message: AgentMessage;
  onActionClick: (action: AgentAction) => void;
}> = ({ message, onActionClick }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Response text */}
      <div className="text-sm text-foreground leading-relaxed">
        {message.summary || message.content}
      </div>

      {/* Minimal context chips */}
      {message.context && Object.keys(message.context).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(message.context).map(([key, value]) => (
            value && (
              <span 
                key={key}
                className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
              >
                {value}
              </span>
            )
          ))}
        </div>
      )}

      {/* Actions as subtle links */}
      {message.actions && message.actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {message.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionClick(action)}
              className="text-xs text-primary hover:text-primary/80 hover:underline underline-offset-2 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Assumptions - very subtle */}
      {message.assumptions && message.assumptions.length > 0 && (
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
          {message.assumptions.join(' ')}
        </p>
      )}
    </div>
  );
};
