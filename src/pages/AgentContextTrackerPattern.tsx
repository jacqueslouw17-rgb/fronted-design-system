import { ArrowLeft, MessageSquare, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useContextTracker, ContextType } from "@/hooks/useContextTracker";
import ContextHeader from "@/components/dashboard/ContextHeader";
import ContextChip from "@/components/dashboard/ContextChip";
import ThreadHistory from "@/components/dashboard/ThreadHistory";
import KurtAvatar from "@/components/KurtAvatar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const GenieContextTrackerPattern = () => {
  const {
    createContext,
    addMessage,
    addAction,
    getActiveContext,
    switchContext,
    getRecentContexts,
  } = useContextTracker();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");

  const activeContext = getActiveContext();
  const recentContexts = getRecentContexts();

  // Initialize sample contexts if none exist
  const initializeSampleContexts = () => {
    if (recentContexts.length === 0) {
      // Payroll context
      const payrollId = createContext("October 2025 Payroll", "payroll", {
        contractors: 12,
        total: "€52,430",
        status: "pending",
      });
      addMessage(payrollId, "user", "Show me the October payroll summary.");
      addMessage(
        payrollId,
        "assistant",
        "Here's the October payroll — 12 contractors, total €52,430. 2 approvals pending."
      );
      addAction(payrollId, "summary_generated", "Payroll summary displayed", "System");

      // Contract context
      const contractId = createContext("Anna Martinez Contract", "contract", {
        contractor: "Anna Martinez",
        country: "Spain",
        rate: "€4,500/month",
      });
      addMessage(contractId, "user", "Draft a contract for Anna.");
      addMessage(
        contractId,
        "assistant",
        "I've drafted the contract. Review before sending for e-signature."
      );
      addAction(contractId, "contract_drafted", "Contract created for review", "Agent");

      // Switch to payroll
      switchContext(payrollId);

      toast({
        title: "Sample Contexts Created",
        description: "3 example contexts have been initialized",
      });
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeContext) return;

    addMessage(activeContext.id, "user", inputValue);
    
    // Simulate Agent response
    setTimeout(() => {
      addMessage(
        activeContext.id,
        "assistant",
        `I understand you're asking about "${inputValue}". Let me help with that in the ${activeContext.type} context.`
      );
      addAction(activeContext.id, "response_generated", "Agent provided contextual response", "Agent");
    }, 500);

    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patterns
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Agent Context Tracker (Memory Thread)
          </h1>
          <p className="text-muted-foreground mt-2">
            Persistent conversation awareness with context switching and memory
          </p>
        </div>

        {/* Pattern Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pattern Behavior
            </CardTitle>
            <CardDescription>
              Agent maintains persistent awareness of conversation context
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Core Principle</h3>
              <p className="text-sm text-muted-foreground">
                "Agent never forgets what matters." — Memory creates continuity, and continuity builds trust.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Key Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Unique Context ID for each conversation thread</li>
                <li>Persistent tracking of actions and approvals</li>
                <li>Context summary in chat header</li>
                <li>Seamless context switching with state preservation</li>
                <li>Recent threads history with quick resume</li>
                <li>Filtered responses based on active context</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat Demo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Agent Chat Demo</h2>
              {recentContexts.length === 0 && (
                <Button onClick={initializeSampleContexts} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Initialize Samples
                </Button>
              )}
            </div>

            <Card className="h-[600px] flex flex-col">
              {/* Context Header */}
              {activeContext && <ContextHeader />}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {activeContext ? (
                  <div className="space-y-4">
                    {activeContext.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && <KurtAvatar size="sm" />}
                        <div
                          className={`max-w-[80%] space-y-2 ${
                            message.role === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          {message.role === "assistant" && (
                            <ContextChip
                              contextName={activeContext.name}
                              contextType={activeContext.type}
                              contextId={activeContext.id}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <div>
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active context</p>
                      <p className="text-xs">Create or resume a context to begin</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      activeContext
                        ? `Message in ${activeContext.name}...`
                        : "Create a context first..."
                    }
                    disabled={!activeContext}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!activeContext || !inputValue.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Thread History */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Thread History</h2>
            <ThreadHistory />
          </div>
        </div>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Context Types & Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <h3 className="font-medium">Payroll Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Retains all Agent-led approvals, edits, and FX steps in one thread
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <h3 className="font-medium">Contract Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Groups contract drafts and e-sign actions by project or role
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="font-medium">Compliance Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Tracks document validation steps per country
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎧</div>
                <div>
                  <h3 className="font-medium">Support Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Keeps escalation history per ticket ID
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieContextTrackerPattern;
