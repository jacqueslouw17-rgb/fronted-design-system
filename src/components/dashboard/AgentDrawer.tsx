import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { ComplianceIcon } from "@/components/compliance/ComplianceIcon";
import { ComplianceContent } from "@/components/compliance/ComplianceContent";
import { useComplianceChanges } from "@/hooks/useComplianceChanges";

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    firstName: string;
  };
  chatHistory: Array<{ role: string; content: string }>;
}

const AgentDrawer = ({ isOpen, onClose, userData, chatHistory }: AgentDrawerProps) => {
  if (!isOpen) return null;
  const [messages, setMessages] = useState(chatHistory);
  const [inputValue, setInputValue] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("text");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [kurtMessage, setKurtMessage] = useState("");
  const [view, setView] = useState<"chat" | "compliance">("chat");
  const [selectedCountry] = useState("NO");
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();
  const { data: complianceData, status: complianceStatus } = useComplianceChanges(selectedCountry);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = `Welcome to your dashboard, ${userData.firstName}! How can I help you today?`;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
      setKurtMessage(welcomeMsg);
      setIsSpeaking(true);
      speak(welcomeMsg, () => setIsSpeaking(false));
    } else if (isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") {
        setKurtMessage(lastMsg.content);
      }
    }
  }, [isOpen, messages.length, userData.firstName, speak, messages]);

  const handleToggleMode = () => {
    if (inputMode === "text") {
      setInputMode("voice");
      setIsListening(true);
      stop();
      toast({
        title: "Voice input active",
        description: "Say something like 'Show me the latest contracts.'",
      });
    } else {
      setInputMode("text");
      setIsListening(false);
      toast({
        title: "Switched to text mode",
        description: "Type your message precisely.",
      });
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    
    // Simulate agent response
    setTimeout(() => {
      const response = "I'm here to help! This is a demo response.";
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setKurtMessage(response);
      setIsSpeaking(true);
      speak(response, () => setIsSpeaking(false));
    }, 1000);

    setInputValue("");
    if (inputMode === "voice") {
      setIsListening(false);
      setInputMode("text");
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
      {/* Subtle background already applied via container gradient */}

      {/* Header controls - top right */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        {view === "chat" && (
          <ComplianceIcon
            status={complianceStatus}
            count={complianceData?.changes.length}
            onClick={() => setView("compliance")}
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto relative z-10">
        {view === "chat" ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Agent header with wave visualizer */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-col items-center space-y-4"
            >
              <AudioWaveVisualizer isActive={isListening} />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Hi {userData.firstName}, what would you like to know?</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {kurtMessage.split(' ').map((word, index) => (
                    <span
                      key={index}
                      className={`transition-colors duration-150 ${
                        index === currentWordIndex - 1
                          ? 'text-foreground font-semibold'
                          : index < currentWordIndex - 1
                          ? 'text-foreground/70 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {word}{index < kurtMessage.split(' ').length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </motion.div>

            {/* Input Controls with gradient effects */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4 mt-8"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleToggleMode}
                  className={`px-6 relative overflow-hidden ${
                    isListening 
                      ? "bg-destructive hover:bg-destructive/90" 
                      : "bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  }`}
                >
                  {isListening && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    />
                  )}
                  <Mic className={`h-5 w-5 mr-2 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
                  <span className="relative z-10">{isListening ? "Stop" : "Speak"}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="px-6 border-primary/30 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all"
                  onClick={() => setInputMode("text")}
                >
                  <Keyboard className="h-5 w-5 mr-2" />
                  Type
                </Button>
              </motion.div>
            </motion.div>

            {/* Text input area with gradient border */}
            {(inputMode === "text" || messages.length > 0) && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 w-full max-w-2xl"
              >
                <div className="flex gap-2 relative group">
                  {/* Gradient border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20 group-hover:opacity-30 rounded-lg blur transition-opacity" />
                  <Input
                    placeholder={inputMode === "voice" ? "Listening..." : "Ask agent anything..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={inputMode === "voice" && isListening}
                    className={`relative bg-card/95 backdrop-blur-sm border-border/50 focus:border-primary/30 ${
                      inputMode === "voice" && isListening ? "bg-muted" : ""
                    }`}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend} 
                    disabled={!inputValue.trim()}
                    className="relative hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {complianceData ? (
              <ComplianceContent
                onBack={() => setView("chat")}
                country={selectedCountry}
                status={complianceStatus}
                lastSync={complianceData.lastSync}
                changes={complianceData.changes}
                activePolicies={complianceData.activePolicies}
                sources={complianceData.sources}
              />
            ) : (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"
                />
                <p className="text-muted-foreground">Loading compliance data...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDrawer;