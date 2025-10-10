import { useState, useEffect } from "react";
import { X, Mic, Send, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import KurtAvatar from "@/components/KurtAvatar";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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
  const { speak } = useTextToSpeech();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = `Welcome to your dashboard, ${userData.firstName}! How can I help you today?`;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
      speak(welcomeMsg);
    }
  }, [isOpen, messages.length, userData.firstName, speak]);

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
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-80 bg-card border-r z-50 flex flex-col shadow-2xl animate-slide-in-left">
        {/* Genie Toggle */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PanelLeftOpen className="h-5 w-5 text-foreground/60" />
            <h2 className="font-semibold">Genie Assistant</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 p-4">
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
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask Genie anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" variant="ghost">
              <Mic className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenieDrawer;
