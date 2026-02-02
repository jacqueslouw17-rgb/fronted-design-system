import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, ChevronRight, FileText, Calculator, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCA4Agent } from './CA4_AgentContext';
import { SUGGESTED_PROMPTS, AgentMessage, AgentAction } from './CA4_AgentTypes';
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

    // Add user message
    addMessage({ role: 'user', content: query });
    setInput('');
    setIsLoading(true);

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
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full border-l border-border/40 bg-background/95 backdrop-blur-sm flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Kurt</h3>
                <p className="text-xs text-muted-foreground">AI Payroll Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Status */}
          <AnimatePresence>
            {isNavigating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2 bg-primary/5 border-b border-primary/10"
              >
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{navigationMessage || 'Kurt is navigating...'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ask me anything about payroll, taxes, FX, or worker costs. I'll navigate the dashboard and show you the details.
                  </p>
                  
                  {/* Suggested Prompts */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmit(prompt)}
                        className="w-full text-left px-3 py-2.5 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-foreground group"
                      >
                        <span className="line-clamp-2">{prompt}</span>
                        <ChevronRight className="inline-block ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
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
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about payroll costs, taxes, FX, bonuses…"
                className="flex-1 bg-muted/30"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className="h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: AgentMessage;
  onActionClick: (action: AgentAction) => void;
}> = ({ message, onActionClick }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 space-y-3">
        {/* Summary */}
        <div className="text-sm text-foreground leading-relaxed">
          {message.summary || message.content}
        </div>

        {/* Context */}
        {message.context && Object.keys(message.context).length > 0 && (
          <div className="px-3 py-2 rounded-lg bg-muted/40 border border-border/30 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">What I looked at:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.context.payPeriod && (
                <Badge variant="secondary" className="text-xs">{message.context.payPeriod}</Badge>
              )}
              {message.context.worker && (
                <Badge variant="secondary" className="text-xs">{message.context.worker}</Badge>
              )}
              {message.context.country && (
                <Badge variant="secondary" className="text-xs">{message.context.country}</Badge>
              )}
              {message.context.currency && (
                <Badge variant="secondary" className="text-xs">{message.context.currency}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Assumptions */}
        {message.assumptions && message.assumptions.length > 0 && (
          <div className="text-xs text-muted-foreground italic">
            <span className="font-medium">Note:</span> {message.assumptions.join(' ')}
          </div>
        )}

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => onActionClick(action)}
                className="h-7 text-xs gap-1.5"
              >
                {action.type === 'open_panel' && <FileText className="h-3 w-3" />}
                {action.type === 'explain' && <Calculator className="h-3 w-3" />}
                {action.type === 'draft_adjustment' && <ArrowRight className="h-3 w-3" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
