import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, DollarSign, Calendar, Clock, ArrowLeft, X } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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
  const { speak, currentWordIndex: ttsWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  
  const subtextMessage = "All contracts ready. Review and send to candidates for signature.";
  const subtextWords = subtextMessage.split(' ');

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
      className="space-y-6 relative"
    >
      {/* Navigation buttons */}
      <div className="flex items-center justify-between mb-6">
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2 ml-auto"
            aria-label="Close and return to pipeline"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

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
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Review Contracts</h1>
        <p className="text-base text-muted-foreground">
          All contracts ready. Review and send to candidates for signature.
        </p>
      </div>

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
          onClick={onStartSigning}
          className="w-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
          size="lg"
        >
          Send to Candidates
        </Button>
      </motion.div>
    </motion.div>
  );
};
