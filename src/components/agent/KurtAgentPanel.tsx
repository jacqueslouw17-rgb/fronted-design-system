import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, History, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useAgentState } from '@/hooks/useAgentState';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { ComplianceReviewSummaryCard } from '@/components/contract-flow/ComplianceReviewSummaryCard';
import { PayrollBatchPreviewCard } from '@/components/contract-flow/PayrollBatchPreviewCard';
import { usePayrollBatch } from '@/hooks/usePayrollBatch';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const loadingPhrases = [
  "Reading contract clauses...",
  "Analyzing compliance requirements...",
  "Checking tax regulations...",
  "Reviewing payment terms...",
  "Validating contract structure...",
  "Cross-referencing policies...",
];

export const KurtAgentPanel: React.FC = () => {
  const { open, messages, loading, setOpen, context, clearMessages, isSpeaking, setIsSpeaking, setCurrentWordIndex, addMessage } = useAgentState();
  const [currentPhrase, setCurrentPhrase] = React.useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [kurtState, setKurtState] = useState<'idle' | 'listening' | 'thinking' | 'responding' | 'working' | 'complete'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, currentWordIndex: localWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { createBatch, batches } = usePayrollBatch();
  const navigate = useNavigate();

  // Preserve conversation when panel opens; do not clear on mount
  // If needed, we can clear explicitly via a control elsewhere.

  // Update Kurt state based on loading and messages
  useEffect(() => {
    if (loading) {
      setKurtState('thinking');
    } else if (messages.length > 0 && messages[messages.length - 1].role === 'kurt') {
      setKurtState('complete');
      setTimeout(() => setKurtState('idle'), 2000);
    } else {
      setKurtState('idle');
    }
  }, [loading, messages]);

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

  // Sync local word index to global state
  useEffect(() => {
    setCurrentWordIndex(localWordIndex);
  }, [localWordIndex, setCurrentWordIndex]);

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
          setCurrentWordIndex(0);
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
      className="w-full h-full bg-background border-l border-border flex flex-col relative overflow-hidden"
    >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 border-b border-border bg-background shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">Kurt</span>
            {kurtState === 'thinking' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex gap-1"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}
            {kurtState === 'complete' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              </motion.div>
            )}
          </div>
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

        {/* Messages Area - Independent Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="space-y-6">
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
                        {msg.text.includes('🧾 Compliance Review Summary') ? (
                          // Render the Compliance Summary Card
                          <ComplianceReviewSummaryCard
                            totalBundles={14}
                            issuesFound={2}
                            issuesResolved={2}
                            onDownloadReport={() => {
                              toast.success("Audit report download started");
                            }}
                            onViewDashboard={() => {
                              toast.info("Scrolling to compliance summary...");
                            }}
                            onProceedToPayroll={() => {
                              // Add context message
                              addMessage({
                                role: 'kurt',
                                text: "Perfect. All contracts are verified — let's prepare the next payroll batch.",
                              });
                              
                              // Show loading message
                              setTimeout(() => {
                                addMessage({
                                  role: 'kurt',
                                  text: "Pulling all certified contractors into the current month's batch...",
                                });
                                
                                // Create mock payees data
                                const mockPayees = [
                                  {
                                    workerId: "w1",
                                    name: "Oskar Nilsen",
                                    countryCode: "NO",
                                    currency: "NOK",
                                    gross: 35000,
                                    employerCosts: 3500,
                                    adjustments: [],
                                    status: "CERTIFIED" as const,
                                  },
                                  {
                                    workerId: "w2",
                                    name: "Maria Santos",
                                    countryCode: "PH",
                                    currency: "PHP",
                                    gross: 25000,
                                    employerCosts: 2500,
                                    adjustments: [],
                                    status: "CERTIFIED" as const,
                                  },
                                  {
                                    workerId: "w3",
                                    name: "John Peterson",
                                    countryCode: "NO",
                                    currency: "NOK",
                                    gross: 32600,
                                    employerCosts: 3260,
                                    adjustments: [],
                                    status: "CERTIFIED" as const,
                                  },
                                ];
                                
                                // Create the batch
                                const batchId = createBatch("2025-11", mockPayees, "Admin User");
                                
                                // Show batch preview
                                setTimeout(() => {
                                  addMessage({
                                    role: 'kurt',
                                    text: "💸 PAYROLL_BATCH_PREVIEW",
                                  });
                                }, 1500);
                              }, 800);
                            }}
                          />
                        ) : msg.text.includes('💸 PAYROLL_BATCH_PREVIEW') ? (
                          // Render the Payroll Batch Preview Card
                          <PayrollBatchPreviewCard
                            month="November 2025"
                            countrySplit={[
                              { code: "NO", count: 3 },
                              { code: "PH", count: 5 },
                            ]}
                            totalPayout={92600}
                            fxVariance={0.4}
                            onReviewFX={() => {
                              const batch = batches[0];
                              if (batch) {
                                addMessage({
                                  role: 'kurt',
                                  text: "Pulling numbers like a pro accountant... but with better UX. 📊",
                                });
                                setTimeout(() => {
                                  navigate(`/payroll-batch?batchId=${batch.id}`);
                                }, 500);
                              }
                            }}
                            onSendForApproval={() => {
                              addMessage({
                                role: 'kurt',
                                text: "CFO approval request sent to @Howard. You'll be notified once he approves.",
                              });
                              
                              // Update batch status
                              setTimeout(() => {
                                addMessage({
                                  role: 'kurt',
                                  text: "✅ Batch status updated to: 🕓 Pending CFO Review.",
                                });
                              }, 1000);
                            }}
                          />
                        ) : msg.text.includes('📄') || msg.text.includes('✅') || msg.text.includes('🔧') || msg.text.includes('📚') || msg.text.includes('📊') || msg.text.includes('🔄') || msg.text.includes('📈') || msg.text.includes('📧') ? (
                          <Card className="p-4 bg-card border-border/50 shadow-sm">
                            <div className="space-y-2">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {readingMessageId === msg.id ? (
                                  // Currently being read - apply word-by-word highlighting
                                  msg.text.split(' ').map((word, idx) => (
                                    <span
                                      key={idx}
                                      className={
                                        idx < localWordIndex
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
                                      idx < localWordIndex
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
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-border bg-muted/20">
          {kurtState === 'thinking' && (
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full mb-1.5"
            />
          )}
          <p className="text-[10px] text-muted-foreground text-center">
            {kurtState === 'idle' && "Ready when you are"}
            {kurtState === 'listening' && "Got it — what should I check?"}
            {kurtState === 'thinking' && "Thinking..."}
            {kurtState === 'working' && "Processing your request..."}
            {kurtState === 'complete' && "Done! You're all set ✅"}
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
