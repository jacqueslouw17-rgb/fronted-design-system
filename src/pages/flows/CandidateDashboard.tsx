import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import CandidateChecklistTab from "@/components/flows/candidate-onboarding/CandidateChecklistTab";
import CandidateMetricsTab from "@/components/flows/candidate-onboarding/CandidateMetricsTab";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [isGenieOpen, setIsGenieOpen] = useState(false);
  const [genieMessage, setGenieMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm Genie, your AI assistant. I can help you with questions about your onboarding, compliance requirements, payroll, or any documents you need to submit. What would you like to know?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Mock candidate data - in real app, this would come from auth/context
  const candidateName = "Maria";
  const candidateCountry = "PH"; // Philippines
  const candidateType = "Contractor";

  const handleAskGenie = () => {
    setIsGenieOpen(true);
  };

  const handleSendToGenie = async () => {
    if (!genieMessage.trim()) return;
    
    const userMessage = genieMessage.trim();
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setGenieMessage("");
    setIsTyping(true);
    
    // Simulate AI response (in real app, call AI API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock AI responses based on keywords
    let response = "";
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("document") || lowerMessage.includes("upload")) {
      response = "You still need to upload your Policy Acknowledgment and NDA Signature. You can upload these in the Checklist tab. Just click on each item to see details and upload options.";
    } else if (lowerMessage.includes("pay") || lowerMessage.includes("payroll") || lowerMessage.includes("salary")) {
      response = "Your first payment is scheduled for January 25, 2025. Payroll is currently being set up. You'll receive an email notification once everything is ready!";
    } else if (lowerMessage.includes("tax") || lowerMessage.includes("tin")) {
      response = "Your Tax Residency document is currently under review by our compliance team. This typically takes 1-2 business days. I'll notify you once it's approved!";
    } else if (lowerMessage.includes("contract") || lowerMessage.includes("agreement")) {
      response = "Your contract is signed and active as of January 15, 2025. You can view it anytime in the Metrics tab by clicking 'View Contract'.";
    } else if (lowerMessage.includes("complete") || lowerMessage.includes("done") || lowerMessage.includes("finish")) {
      response = "You're 60% complete with your onboarding! You have 2 items remaining: Policy Acknowledgment and NDA Signature. Complete these in the Checklist tab to finish your setup.";
    } else {
      response = "I'm here to help! You can ask me about your documents, payroll, compliance requirements, or anything else related to your onboarding. What would you like to know?";
    }
    
    setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendToGenie();
    }
  };

  return (
    <main className="flex h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/flows')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Static background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
             style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
        <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
             style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
      </div>

      {/* Main Content */}
      <div 
        className="flex-shrink-0 flex flex-col h-screen overflow-y-auto px-6 py-8 space-y-6 relative z-10 mx-auto"
        style={{ 
          width: '100%',
          maxWidth: '900px'
        }}
      >
        {/* Genie Banner */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground/80">
              Hi {candidateName}, I'm here if you need help
            </p>
          </div>
          <Button
            onClick={handleAskGenie}
            size="sm"
            variant="outline"
          >
            Ask Genie
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checklist" className="mt-6">
            <CandidateChecklistTab 
              country={candidateCountry}
              type={candidateType}
            />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <CandidateMetricsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Genie Chat Modal */}
      <Dialog open={isGenieOpen} onOpenChange={setIsGenieOpen}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Chat with Genie
            </DialogTitle>
          </DialogHeader>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              <AnimatePresence>
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-3 w-3" />
                          <span className="text-xs font-medium">Genie</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs font-medium">Genie</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Ask about your onboarding, pay, or documents..."
              value={genieMessage}
              onChange={(e) => setGenieMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendToGenie} 
              disabled={!genieMessage.trim() || isTyping}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CandidateDashboard;
