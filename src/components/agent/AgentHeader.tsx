import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudioWaveVisualizer from '@/components/AudioWaveVisualizer';
import KurtMuteToggle from '@/components/shared/KurtMuteToggle';
import { useAgentState } from '@/hooks/useAgentState';
interface AgentHeaderProps {
  title?: string;
  subtitle?: string;
  showPulse?: boolean;
  isActive?: boolean;
  placeholder?: string;
  className?: string;
  currentWordIndex?: number;
  enableWordHighlight?: boolean;
  hasChanges?: boolean;
  progressIndicator?: React.ReactNode;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  tags?: React.ReactNode;
  simplified?: boolean;
  showInput?: boolean;
}
export const AgentHeader: React.FC<AgentHeaderProps> = ({
  title = "Welcome back",
  subtitle = "How can I help you today?",
  showPulse = true,
  isActive: isActiveProp,
  placeholder = "Ask Kurt anything...",
  className = "",
  currentWordIndex = 0,
  enableWordHighlight = false,
  hasChanges = false,
  progressIndicator,
  isMuted = false,
  onMuteToggle,
  tags,
  simplified = false,
  showInput = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const {
    setOpen,
    addMessage,
    simulateResponse,
    isSpeaking,
    currentWordIndex: globalWordIndex
  } = useAgentState();
  const isActive = isActiveProp !== undefined ? isActiveProp : isSpeaking;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use global word index when available, otherwise use prop
  const displayWordIndex = isSpeaking ? globalWordIndex : currentWordIndex;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);

    // Add user message
    addMessage({
      role: 'user',
      text: inputValue.trim()
    });

    // Open the agent panel
    setOpen(true);

    // Simulate agent response
    await simulateResponse(inputValue.trim());
    setInputValue('');
    setIsSubmitting(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return <motion.div initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} className={`flex flex-col items-center space-y-4 sm:space-y-6 px-4 ${className}`}>
      {/* Agent Pulse */}
      {showPulse && <div className="flex justify-center scale-75 sm:scale-100">
          <AudioWaveVisualizer isActive={isActive} isListening={false} />
        </div>}

      {/* Title & Subtitle */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <p className="text-sm sm:text-base">
            {enableWordHighlight || isSpeaking ?
          // Word-by-word highlighting when speaking (grey reading effect)
          subtitle.split(' ').map((word, idx) => <span key={idx} className={idx < displayWordIndex ? 'text-foreground/90' : 'text-muted-foreground/40'}>
                  {word}{' '}
                </span>) :
          // Default static subtitle with darker color if there are changes
          <span className={hasChanges ? "text-foreground/60" : "text-muted-foreground"}>
                {subtitle}
              </span>}
          </p>
          {onMuteToggle && !simplified && <KurtMuteToggle isMuted={isMuted} onToggle={onMuteToggle} />}
        </div>
      </div>

      {/* Progress Indicator */}
      {progressIndicator && <div className="w-full max-w-xl px-4">
          {progressIndicator}
        </div>}

      {/* Chat Input or Tags */}
      {!simplified && (
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="w-full max-w-xl space-y-2 sm:space-y-3 px-4 sm:px-0 -mt-2">
          <>
            {showInput && (
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center gap-1.5 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow px-2 py-1.5 sm:py-2">
                  <Input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={isSubmitting} className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground h-8 sm:h-9" />
                  <Button type="submit" size="icon" disabled={!inputValue.trim() || isSubmitting} className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                    {isSubmitting ? <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </Button>
                </div>
              </form>
            )}
            
            {/* Contextual Tags */}
            {tags && <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent" style={{ marginTop: showInput ? undefined : '0' }}>
                {tags}
              </div>}
          </>
        </motion.div>
      )}
    </motion.div>;
};