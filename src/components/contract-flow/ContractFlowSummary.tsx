import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CheckCircle2 } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ContractFlowSummaryProps {
  candidates: Candidate[];
}

export const ContractFlowSummary: React.FC<ContractFlowSummaryProps> = ({
  candidates,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const { speak, currentWordIndex: ttsWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  
  const subtextMessage = "Perfect — compliance verified and contract copies stored securely.";
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
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <AudioWaveVisualizer 
            isActive={!hasSpoken} 
            isListening={true}
            isDetectingVoice={isSpeaking}
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          🎉 Contracts Signed — You're All Set!
        </h1>
        <p className="text-foreground/60 relative max-w-xl mx-auto">
          {subtextWords.map((word, index) => (
            <span
              key={index}
              className={`transition-colors duration-200 ${
                isSpeaking && ttsWordIndex === index ? 'text-foreground/90 font-medium' : ''
              }`}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </motion.div>

      {/* Signed Contractors Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3"
      >
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/50"
          >
            <Avatar className="h-10 w-10 bg-primary/10">
              <span className="text-lg">{candidate.flag}</span>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{candidate.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{candidate.role}</p>
            </div>
            <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Contract Signed
            </Badge>
          </motion.div>
        ))}
      </motion.div>

      {/* Next Step Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 p-6 rounded-lg bg-muted/30 border border-border"
      >
        <p className="text-sm text-muted-foreground text-center">
          📌 Next workflow: Contractor Onboarding — My Checklist
        </p>
      </motion.div>
    </div>
  );
};
