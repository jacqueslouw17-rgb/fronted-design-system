import { useState, useEffect } from "react";
import { Send, Mic, Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KurtAvatar from "@/components/KurtAvatar";
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
  const [kurtMessage, setKurtMessage] = useState("");
  const [view, setView] = useState<"chat" | "compliance">("chat");
  const [selectedCountry] = useState("NO");
  const { speak, stop } = useTextToSpeech();
  const { toast } = useToast();
  const { data: complianceData, status: complianceStatus } = useComplianceChanges(selectedCountry);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = `Welcome to your dashboard, ${userData.firstName}! How can I help you today?`;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
      setKurtMessage(welcomeMsg);
      speak(welcomeMsg);
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
      speak(response);
    }, 1000);

    setInputValue("");
    if (inputMode === "voice") {
      setIsListening(false);
      setInputMode("text");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header controls - top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <ComplianceIcon
          status={complianceStatus}
          count={complianceData?.changes.length}
          onClick={() => setView("compliance")}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {view === "chat" ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Kurt Avatar with message */}
            <KurtAvatar 
              isListening={isListening} 
              message={kurtMessage}
            />

            {/* Input Controls - styled like onboarding */}
            <div className="flex items-center space-x-4 mt-8">
              <Button
                onClick={handleToggleMode}
                className={`px-6 ${
                  isListening ? "bg-destructive hover:bg-destructive/90" : ""
                }`}
              >
                <Mic className="h-5 w-5 mr-2" />
                {isListening ? "Stop" : "Speak"}
              </Button>
              <Button 
                variant="outline" 
                className="px-6"
                onClick={() => setInputMode("text")}
              >
                <Keyboard className="h-5 w-5 mr-2" />
                Type
              </Button>
            </div>

            {/* Text input area - only show when in text mode or has messages */}
            {(inputMode === "text" || messages.length > 0) && (
              <div className="mt-8 w-full max-w-2xl">
                <div className="flex gap-2">
                  <Input
                    placeholder={inputMode === "voice" ? "Listening..." : "Ask agent anything..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={inputMode === "voice" && isListening}
                    className={`${inputMode === "voice" && isListening ? "bg-muted" : ""}`}
                  />
                  <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : complianceData ? (
          <ComplianceContent
            onBack={() => setView("chat")}
            country={selectedCountry}
            status={complianceStatus}
            lastSync={complianceData.lastSync}
            changes={complianceData.changes}
            activePolicies={complianceData.activePolicies}
            sources={complianceData.sources}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AgentDrawer;