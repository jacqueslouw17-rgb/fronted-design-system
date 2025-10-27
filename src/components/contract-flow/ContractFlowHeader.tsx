import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useAgentState } from "@/hooks/useAgentState";

interface ContractFlowHeaderProps {
  title: string;
  subtitle: string;
  showAudioWave?: boolean;
  isAudioActive?: boolean;
}

export const ContractFlowHeader: React.FC<ContractFlowHeaderProps> = ({
  title,
  subtitle,
  showAudioWave = true,
  isAudioActive = false,
}) => {
  const { setOpen, addMessage, simulateResponse } = useAgentState();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    addMessage({ role: 'user', text: inputValue.trim() });
    setOpen(true);
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
    <div className="w-full space-y-8 mb-12">
      {/* Audio Wave Visualizer */}
      {showAudioWave && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <AudioWaveVisualizer 
            isActive={isAudioActive} 
            isListening={true}
            isDetectingVoice={false}
          />
        </motion.div>
      )}

      {/* Header - Centered */}
      <div className="text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold text-foreground px-4"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg text-muted-foreground px-4"
        >
          {subtitle}
        </motion.p>
        
        {/* Chat Input - directly below subtitle with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-4xl mx-auto pt-8 px-4"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center gap-3 bg-card rounded-2xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow px-6 py-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Kurt anything..."
                disabled={isSubmitting}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isSubmitting}
                className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
