import { useState, useEffect } from "react";
import { X, Send, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import KurtAvatar from "@/components/KurtAvatar";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import VoiceTypeToggle from "./VoiceTypeToggle";
import { useToast } from "@/hooks/use-toast";

interface GenieDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    firstName: string;
  };
  chatHistory: Array<{ role: string; content: string }>;
}

const GenieDrawer = ({ isOpen, onClose, userData, chatHistory }: GenieDrawerProps) => {
  const [messages, setMessages] = useState(chatHistory);
  const [inputValue, setInputValue] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("text");
  const { speak } = useTextToSpeech();
  const { isListening, transcript, error, startListening, stopListening, resetTranscript, isSupported } = useSpeechToText();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = `Welcome to your dashboard, ${userData.firstName}! How can I help you today?`;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
      speak(welcomeMsg);
    }
  }, [isOpen, messages.length, userData.firstName, speak]);

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript && inputMode === "voice") {
      setInputValue(transcript);
    }
  }, [transcript, inputMode]);

  const handleToggleMode = () => {
    if (inputMode === "text") {
      if (!isSupported) {
        toast({
          title: "Voice not supported",
          description: "Your browser doesn't support speech recognition.",
          variant: "destructive",
        });
        return;
      }
      setInputMode("voice");
      startListening();
      toast({
        title: "Voice input active",
        description: "Say something like 'Draft my new contract for Maria.'",
      });
    } else {
      setInputMode("text");
      stopListening();
      toast({
        title: "Switched to text mode",
        description: "Type your message precisely.",
      });
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    
    // Simulate Genie response
    setTimeout(() => {
      const response = "I'm here to help! This is a demo response.";
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      speak(response);
    }, 1000);

    setInputValue("");
    if (inputMode === "voice") {
      resetTranscript();
    }
  };

  return (
    <div 
      className={`h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
        isOpen ? "w-80" : "w-0 border-r-0"
      }`}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <PanelLeftOpen className="h-5 w-5 text-foreground/60" />
              <h2 className="font-semibold">Genie Assistant</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="w-8 h-8 flex-shrink-0">
                    <KurtAvatar isListening={false} message="" size="sm" />
                  </div>
                ) : (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-foreground/10 text-foreground text-xs">
                      {userData.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[70%] ${
                    msg.role === "user"
                      ? "bg-foreground/10"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder={inputMode === "voice" ? "Listening..." : "Ask Genie anything..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={inputMode === "voice" && isListening}
                className={inputMode === "voice" && isListening ? "bg-muted" : ""}
              />
              <VoiceTypeToggle
                mode={inputMode}
                isListening={isListening}
                error={error}
                onToggle={handleToggleMode}
              />
              <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GenieDrawer;
