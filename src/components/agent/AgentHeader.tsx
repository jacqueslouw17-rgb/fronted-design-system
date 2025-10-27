import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudioWaveVisualizer from '@/components/AudioWaveVisualizer';
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
}) => {
  const [inputValue, setInputValue] = useState('');
  const { setOpen, addMessage, simulateResponse, isSpeaking } = useAgentState();
  const isActive = isActiveProp !== undefined ? isActiveProp : isSpeaking;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // Add user message
    addMessage({
      role: 'user',
      text: inputValue.trim(),
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center space-y-6 ${className}`}
    >
      {/* Agent Pulse */}
      {showPulse && (
        <div className="flex justify-center scale-75">
          <AudioWaveVisualizer isActive={isActive} isListening={true} />
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-base">
          {enableWordHighlight ? (
            // Word-by-word highlighting when speaking
            subtitle.split(' ').map((word, idx) => (
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
            // Default static subtitle
            <span className="text-muted-foreground">{subtitle}</span>
          )}
        </p>
      </div>

      {/* Chat Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xl"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center gap-1.5 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow px-2 py-1.5">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSubmitting}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground h-8"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isSubmitting}
              className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? (
                <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
