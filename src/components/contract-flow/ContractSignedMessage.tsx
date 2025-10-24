import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

interface ContractSignedMessageProps {
  onReadingComplete?: () => void;
  mode?: "sent" | "signed"; // "sent" = contracts sent to candidates, "signed" = contracts fully signed
}

export const ContractSignedMessage: React.FC<ContractSignedMessageProps> = ({
  onReadingComplete,
  mode = "signed",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  
  const initialMessage = mode === "sent" 
    ? "Great, contracts sent to candidates via their preferred signing portals."
    : "Perfect, compliance verified and contract copies stored securely.";
    
  const secondMessage = mode === "sent"
    ? "Moving candidates to awaiting signature."
    : "Onboarding invites sent to candidates.";
    
  const heading = mode === "sent"
    ? "Contracts sent - awaiting signatures"
    : "Contract signed - you're all set!";
  
  const [currentMessage, setCurrentMessage] = useState(initialMessage);
  const { speak, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });

  const words = currentMessage.split(' ');

  useEffect(() => {
    if (!hasSpoken) {
      const timer = setTimeout(() => {
        setHasSpoken(true);
        setIsSpeaking(true);
        speak(initialMessage, () => {
          setIsSpeaking(false);
          // Wait a moment then trigger the next step
          setTimeout(() => {
            setCurrentMessage(secondMessage);
            onReadingComplete?.();
          }, 1000);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasSpoken, initialMessage, secondMessage, speak, onReadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
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

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{heading}</h1>
        <p className="text-base text-muted-foreground">
          {words.map((word, index) => (
            <span
              key={index}
              className={`transition-colors duration-200 ${
                isSpeaking && currentWordIndex === index ? 'text-foreground/90 font-medium' : ''
              }`}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>

      {/* Genie Message Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="p-4 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground flex-1">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`transition-colors duration-200 ${
                    isSpeaking && currentWordIndex === index ? 'text-primary font-medium' : ''
                  }`}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
