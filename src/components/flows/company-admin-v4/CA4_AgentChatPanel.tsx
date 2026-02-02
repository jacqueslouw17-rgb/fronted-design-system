import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useCA4Agent } from './CA4_AgentContext';
import { AgentMessage, AgentAction } from './CA4_AgentTypes';
import { Skeleton } from '@/components/ui/skeleton';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kurt-chat`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const CA4_AgentChatPanel: React.FC = () => {
  const {
    isOpen,
    setOpen,
    addMessage,
    isNavigating,
    navigationMessage,
    executeAction,
  } = useCA4Agent();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add to agent context
    addMessage({ role: 'user', content: query });

    abortControllerRef.current = new AbortController();
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let streamDone = false;

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              // Update the last message with new content
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantContent,
                  };
                }
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, put back and wait for more
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                  newMessages[newMessages.length - 1].content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Add to agent context
      if (assistantContent) {
        addMessage({ role: 'assistant', content: assistantContent });
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled - keep partial response
        return;
      }
      console.error('Kurt chat error:', error);
      setMessages(prev => [
        ...prev.filter(m => !(m.role === 'assistant' && m.content === '')),
        { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full bg-background flex flex-col overflow-hidden border-l border-border/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
            <span className="text-sm font-medium text-foreground">Kurt</span>
            <button 
              onClick={() => setOpen(false)} 
              className="p-1.5 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="pt-2">
                  <p className="text-[13px] text-muted-foreground/70">
                    Ask about payroll, workers, or submissions.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                  />
                ))
              )}

              {/* Skeleton loading when waiting for first token */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-5/8" />
                </div>
              )}

              {/* Navigation status */}
              {isNavigating && (
                <p className="text-xs text-muted-foreground/60">
                  {navigationMessage || 'Navigating...'}
                </p>
              )}
            </div>
          </div>

          {/* Input Area - Lovable style */}
          <div className="p-4 border-t border-border/20">
            <div className={cn(
              "relative flex items-end gap-3 rounded-2xl border bg-muted/30 px-4 py-3 transition-all",
              input.trim() ? "border-border/60" : "border-border/30",
              "focus-within:border-border/80 focus-within:bg-muted/40"
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[200px] leading-relaxed placeholder:text-muted-foreground/50"
                disabled={isLoading && !isStreaming}
              />
              
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="shrink-0 p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  title="Stop generating"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(input)}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "shrink-0 p-2 rounded-xl transition-all",
                    input.trim() 
                      ? "bg-foreground text-background hover:bg-foreground/90" 
                      : "bg-muted text-muted-foreground/40"
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Message component with markdown support
const MessageBubble: React.FC<{
  message: ChatMessage;
  isStreaming?: boolean;
}> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] px-3 py-2 rounded-2xl bg-muted/60 text-foreground/80 text-[13px] leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message with markdown - tight, dense styling
  return (
    <div className={cn(
      "text-[13px] text-foreground/90 leading-relaxed",
      "[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
      "[&_h1]:text-sm [&_h1]:font-semibold [&_h1]:mt-3 [&_h1]:mb-1.5",
      "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
      "[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-2.5 [&_h3]:mb-1",
      "[&_ul]:my-1.5 [&_ul]:pl-4 [&_ul]:list-disc",
      "[&_ol]:my-1.5 [&_ol]:pl-4 [&_ol]:list-decimal",
      "[&_li]:my-0.5",
      "[&_strong]:font-semibold",
      "[&_code]:bg-muted/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
      "[&_pre]:bg-muted/40 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto",
    )}>
      <ReactMarkdown>
        {message.content || ''}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-foreground/50 animate-pulse ml-0.5 rounded-sm" />
      )}
    </div>
  );
};
