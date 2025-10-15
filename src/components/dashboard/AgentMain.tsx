import { useState } from "react";
import { motion } from "framer-motion";
import KurtAvatar from "@/components/KurtAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { toast } from "sonner";

interface AgentMainProps {
  userData: any;
  isDrawerOpen?: boolean;
}

const AgentMain = ({ userData, isDrawerOpen = false }: AgentMainProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { speak } = useTextToSpeech({ lang: 'nb-NO', voiceName: 'norwegian' });

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.info("Voice input activated");
    } else {
      toast.success("Voice input stopped");
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      toast.success(`Message sent: ${inputValue}`);
      setInputValue("");
    }
  };

  const greeting = `Hi ${userData.firstName}! I'm Gelo, your AI assistant. How can I help you today?`;

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden ${
        isDrawerOpen ? "w-1/2" : "w-full"
      }`}
    >
      {/* Animated gradient background orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'var(--gradient-primary)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl"
          style={{ background: 'var(--gradient-secondary)' }}
        />
      </motion.div>

      <div className="max-w-2xl w-full space-y-6 relative z-10">
        {/* Gelo Avatar with enhanced glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center relative"
        >
          <div className="relative">
            {/* Animated glow rings */}
            {isListening && (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ 
                    background: 'var(--gradient-primary)',
                    filter: 'blur(20px)'
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{ 
                    background: 'var(--gradient-secondary)',
                    filter: 'blur(30px)'
                  }}
                />
              </>
            )}
            <KurtAvatar isListening={isListening} size="default" name="Gelo" />
          </div>
        </motion.div>

        {/* Input Area with gradient border */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20 group-hover:opacity-30 rounded-lg blur transition-opacity" />
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message or click the mic to speak..."
              className="min-h-[120px] pr-12 resize-none relative bg-card/95 backdrop-blur-sm border-border/50 focus:border-primary/30 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute bottom-2 right-2 hover:bg-primary/10 hover:text-primary transition-all"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons with gradient effects */}
          <div className="flex gap-3 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isListening ? "default" : "outline"}
                size="lg"
                onClick={handleVoiceInput}
                className={`gap-2 relative overflow-hidden group ${
                  isListening 
                    ? "bg-gradient-to-r from-primary to-secondary shadow-lg" 
                    : "border-primary/30 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                }`}
              >
                {isListening && (
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  />
                )}
                <Mic className={`h-5 w-5 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
                <span className="relative z-10">{isListening ? "Stop Speaking" : "Speak"}</span>
              </Button>
            </motion.div>
          </div>

          {/* Hints */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>Press Enter to send • Shift+Enter for new line</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AgentMain;
