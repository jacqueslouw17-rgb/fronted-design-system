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
  const { speak, currentWordIndex } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });

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

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden ${
        isDrawerOpen ? "w-1/2" : "w-full"
      }`}
    >
      {/* Stunning subtle gradient background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] rounded-full blur-[120px]"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.1))' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 right-0 w-[50rem] h-[35rem] rounded-full blur-[100px]"
          style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.08), hsl(var(--primary) / 0.05))' }}
        />
      </motion.div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Gelo Avatar - Clean, no animations */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center space-y-8"
        >
          {/* Avatar circles */}
          <div className="relative w-48 h-48">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl opacity-30" />
            
            {/* Outermost circle - lightest */}
            <div className="absolute inset-0 rounded-full border bg-primary/5 border-primary/10" />
            
            {/* Second circle */}
            <div className="absolute inset-4 rounded-full border bg-primary/8 border-primary/15" />
            
            {/* Third circle */}
            <div className="absolute inset-8 rounded-full border bg-primary/12 border-primary/20" />
            
            {/* Fourth circle */}
            <div className="absolute inset-12 rounded-full border bg-primary/18 border-primary/30" />
            
            {/* Inner circle */}
            <div className="absolute inset-16 rounded-full border bg-primary/25 border-primary/40" />
            
            {/* Center circle */}
            <div className="absolute inset-20 rounded-full border bg-primary/30 border-primary/50 flex items-center justify-center">
              {isListening && (
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </div>

          {/* Beautiful hierarchy: caption, heading, subtext */}
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">AI Assistant</p>
            <h1 className="text-3xl font-bold text-foreground balance-text">
              Hi {userData.firstName}, what would you like to know?
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ask me anything or use voice input to get started
            </p>
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
