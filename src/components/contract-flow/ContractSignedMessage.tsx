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
    </motion.div>
  );
};
