import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, History, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useAgentState } from '@/hooks/useAgentState';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const loadingPhrases = [
  "Reading contract clauses...",
  "Analyzing compliance requirements...",
  "Checking tax regulations...",
  "Reviewing payment terms...",
  "Validating contract structure...",
  "Cross-referencing policies...",
];

export const KurtAgentPanel: React.FC = () => {
  const { open, messages, loading, setOpen, context, clearMessages, isSpeaking, setIsSpeaking } = useAgentState();
  const [currentPhrase, setCurrentPhrase] = React.useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });

  // Clear messages on mount
  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  // Cycle through loading phrases
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % loadingPhrases.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  // Auto-scroll to bottom when new messages arrive or loading starts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Also scroll when panel opens
  useEffect(() => {
    if (open && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [open]);

  // Auto-speak the latest Kurt message after loading completes (only first line/heading)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'kurt' && readingMessageId !== lastMessage.id) {
        setReadingMessageId(lastMessage.id);
        setIsSpeaking(true);
        // Only speak the first line (heading)
        const firstLine = lastMessage.text.split('\n')[0];
        speak(firstLine, () => {
          setIsSpeaking(false);
          setReadingMessageId(null);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, messages]);

  const handleCopy = () => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      navigator.clipboard.writeText(lastMessage.text);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="w-full h-full min-h-full bg-background border-l border-border flex flex-col relative"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background">
          <span className="font-semibold text-foreground text-sm">Kurt</span>
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-6" ref={scrollRef}>
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {msg.role === 'user' ? (
                      // User message - light grey bubble on right
                      <div className="flex justify-end mb-6">
                        <div className="max-w-[85%] rounded-xl px-3 py-2 bg-muted">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                            {msg.text}
                          </p>
                          <p className="text-[10px] opacity-50 mt-0.5 text-muted-foreground">
                            {new Date(msg.ts).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Agent response - thinking indicator + word-by-word reading
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lightbulb className="h-3.5 w-3.5" />
                          <span className="text-xs">Thought for 2s</span>
                        </div>
                        
                        {/* Check if message has structured content (emojis indicate cards) */}
                        {msg.text.includes('📄') || msg.text.includes('✅') || msg.text.includes('🔧') || msg.text.includes('📚') || msg.text.includes('📊') || msg.text.includes('🔄') || msg.text.includes('📈') || msg.text.includes('📧') ? (
                          <Card className="p-4 bg-card border-border/50 shadow-sm">
                            <div className="space-y-2">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {readingMessageId === msg.id ? (
                                  // Currently being read - apply word-by-word highlighting
                                  msg.text.split(' ').map((word, idx) => (
                                    <span
                                      key={idx}
                                      className={
                                        idx < currentWordIndex
                                          ? 'text-foreground/90'
                                          : 'text-muted-foreground/40'
                                      }
                                    >
                                      {word}{' '}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-foreground">{msg.text}</span>
                                )}
                              </p>
                            </div>
                          </Card>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {readingMessageId === msg.id ? (
                                msg.text.split(' ').map((word, idx) => (
                                  <span
                                    key={idx}
                                    className={
                                      idx < currentWordIndex
                                        ? 'text-foreground/90'
                                        : 'text-muted-foreground/40'
                                    }
                                  >
                                    {word}{' '}
                                  </span>
                                ))
                              ) : (
                                <span className="text-foreground">{msg.text}</span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        {msg.actionButtons && msg.actionButtons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.actionButtons.map((btn, idx) => (
                              <Button
                                key={idx}
                                variant={btn.variant || 'default'}
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  // Trigger the action through the same handler
                                  const handleKurtAction = (window as any).handleKurtAction;
                                  if (handleKurtAction) {
                                    handleKurtAction(btn.action);
                                  }
                                }}
                              >
                                {btn.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(msg.ts).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Loading State */}
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lightbulb className="h-3.5 w-3.5 animate-pulse" />
                      <motion.span
                        key={currentPhrase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs"
                      >
                        {loadingPhrases[currentPhrase]}
                      </motion.span>
                    </div>
                    <div className="space-y-2 pl-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-border bg-muted/20">
          <p className="text-[10px] text-muted-foreground text-center">
            Agentic mode • Type to refine
          </p>
        </div>
      {/* History Overlay - Opens within agent panel */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setHistoryOpen(false)}
            />
            
            {/* History Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0 bg-background border-l border-border flex flex-col z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">History</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHistoryOpen(false)}
                  className="h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No conversation history yet
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium capitalize">{msg.role === 'kurt' ? 'Kurt' : 'You'}</span>
                          <span>
                            {new Date(msg.ts).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
