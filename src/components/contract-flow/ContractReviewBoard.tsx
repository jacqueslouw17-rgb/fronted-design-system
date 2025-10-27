import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, DollarSign, Calendar, Clock, ArrowLeft, X, ArrowRight } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAgentState } from "@/hooks/useAgentState";

interface ContractReviewBoardProps {
  candidates: Candidate[];
  onStartSigning: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export const ContractReviewBoard: React.FC<ContractReviewBoardProps> = ({
  candidates,
  onStartSigning,
  onBack,
  onClose,
}) => {
  const [globalComment, setGlobalComment] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { speak, currentWordIndex: ttsWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { setOpen, addMessage, simulateResponse } = useAgentState();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const subtextMessage = "All contracts ready. Review and send to candidates for signature.";
  const subtextWords = subtextMessage.split(' ');

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

  // Auto-speak on mount
  useEffect(() => {
    if (!hasSpoken) {
      const timer = setTimeout(() => {
        setHasSpoken(true);
        setIsSpeaking(true);
        speak(subtextMessage, () => {
          setIsSpeaking(false);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasSpoken, subtextMessage, speak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >

      {/* Audio Wave Visualizer */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <AudioWaveVisualizer 
          isActive={!hasSpoken} 
          isListening={true}
          isDetectingVoice={isSpeaking}
        />
      </motion.div>

      {/* Header - Centered below visualizer */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Review Contracts</h1>
        <p className="text-base text-muted-foreground">
          All contracts ready. Review and send to candidates for signature.
        </p>
      </div>

      {/* Chat Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl mx-auto mb-10"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center gap-2 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow px-4 py-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Kurt anything..."
              disabled={isSubmitting}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isSubmitting}
              className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Review cards */}
      <div className="grid grid-cols-3 gap-4">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
          >
            <Card className="p-5 hover:shadow-elevated transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{candidate.flag}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                      <p className="text-xs text-muted-foreground">{candidate.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">Compliance check passed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">Currency verified ({candidate.currency})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">Country policy aligned</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{candidate.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{candidate.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{candidate.noticePeriod}</span>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  className="flex justify-center"
                >
                  <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Reviewed
                  </Badge>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comment section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <Card className="p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Review Comment (Optional)
          </label>
          <Textarea
            placeholder="Add any notes or comments..."
            value={globalComment}
            onChange={(e) => setGlobalComment(e.target.value)}
            className="mb-3 min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground italic">
            Ensure notice period aligns with region policy.
          </p>
        </Card>
      </motion.div>

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <Button
          onClick={() => {
            setIsSending(true);
            setTimeout(() => {
              onStartSigning();
            }, 1200);
          }}
          disabled={isSending}
          className="w-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
          size="lg"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Sending to candidates...
            </>
          ) : (
            "Send to Candidates"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
