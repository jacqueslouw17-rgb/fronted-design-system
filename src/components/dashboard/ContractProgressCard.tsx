import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, CheckCircle2, Clock, FileText, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContractProgressCardProps {
  candidateName?: string;
  onSendMessage?: (message: string) => void;
  showCompletion?: boolean;
}

const ContractProgressCard = ({ 
  candidateName = "Maria",
  onSendMessage,
  showCompletion = true
}: ContractProgressCardProps) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progressSteps = [
    { 
      label: "Onboarding Complete", 
      status: "completed" as const,
      icon: CheckCircle2,
      date: "Just now"
    },
    { 
      label: "Contract Generation", 
      status: "active" as const,
      icon: Clock,
      estimate: "~2 hours"
    },
    { 
      label: "Review & Signature", 
      status: "pending" as const,
      icon: FileText,
      estimate: "Pending"
    },
  ];

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Header with Animation */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-12 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-16 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="w-2 h-12 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
          <div className="w-2 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Kurt AI Assistant
          </p>
          <h3 className="text-lg font-semibold">
            Welcome aboard, {candidateName}! 🎉
          </h3>
        </div>
      </div>

      {/* Completion Status Card */}
      {showCompletion && (
        <div className="rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-8 border border-primary/20 space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">All Set!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thanks! We're preparing your contract. You'll receive an email shortly to review and sign.
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps - Only show if not in completion view */}
      {!showCompletion && (
        <div className="space-y-3">
          {progressSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/60 border border-border/40"
              >
                <div className={`
                  p-2 rounded-lg flex-shrink-0
                  ${step.status === 'completed' ? 'bg-primary/10' : 
                    step.status === 'active' ? 'bg-primary/10 animate-pulse' : 
                    'bg-muted/50'}
                `}>
                  <Icon className={`h-4 w-4 ${
                    step.status === 'completed' ? 'text-primary' :
                    step.status === 'active' ? 'text-primary' :
                    'text-muted-foreground'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.status === 'pending' ? 'text-muted-foreground' : ''
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {'date' in step ? step.date : step.estimate}
                  </p>
                </div>

                {step.status === 'completed' && (
                  <Badge variant="default" className="bg-primary/10 text-primary border-0 text-xs">
                    Done
                  </Badge>
                )}
                {step.status === 'active' && (
                  <Badge variant="default" className="bg-primary/10 text-primary border-0 text-xs animate-pulse">
                    In Progress
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Chat Interface */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <p className="text-xs text-muted-foreground text-center">
          Have questions? Ask Kurt, your AI assistant
        </p>
        
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question or use voice..."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsListening(!isListening)}
            className={isListening ? "bg-primary/10 text-primary border-primary/20" : ""}
          >
            <Mic className={`h-4 w-4 mr-2 ${isListening ? "animate-pulse" : ""}`} />
            {isListening ? "Listening..." : "Speak"}
          </Button>
          
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ContractProgressCard;
