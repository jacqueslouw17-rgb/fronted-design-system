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
  const { speak } = useTextToSpeech();

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

  const greeting = `Hi ${userData.firstName}! I'm Kurt, your AI assistant. How can I help you today?`;

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`flex-1 flex flex-col items-center justify-center p-8 ${
        isDrawerOpen ? "w-1/2" : "w-full"
      }`}
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Kurt Avatar with pulse animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center"
        >
          <KurtAvatar isListening={isListening} size="default" />
        </motion.div>

        {/* Greeting Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Kurt
          </h1>
          <p className="text-muted-foreground text-lg">
            {greeting}
          </p>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message or click the mic to speak..."
              className="min-h-[120px] pr-12 resize-none"
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
              className="absolute bottom-2 right-2"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant={isListening ? "default" : "outline"}
              size="lg"
              onClick={handleVoiceInput}
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              {isListening ? "Stop Speaking" : "Speak"}
            </Button>
          </div>

          {/* Hints */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Press Enter to send • Shift+Enter for new line</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AgentMain;
