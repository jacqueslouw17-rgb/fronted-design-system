import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContextPivotProvider,
  useContextPivot,
  ContextChip,
  ContextSwitcher,
  ContextTransition,
  ContextEntity,
} from "@/components/AgentContextPivot";

// Sample Data
const sampleEntities: ContextEntity[] = [
  {
    id: "1",
    type: "contractor",
    name: "Alex Hansen",
    subtitle: "Senior Developer • Norway",
    status: "active",
  },
  {
    id: "2",
    type: "contractor",
    name: "Maria Santos",
    subtitle: "Designer • Philippines",
    status: "active",
  },
  {
    id: "3",
    type: "contractor",
    name: "James Wong",
    subtitle: "QA Engineer • Singapore",
    status: "pending",
  },
  {
    id: "4",
    type: "payroll",
    name: "September 2025 Payroll",
    subtitle: "15 contractors • $125,000",
    status: "active",
  },
  {
    id: "5",
    type: "payroll",
    name: "August 2025 Payroll",
    subtitle: "15 contractors • $118,500",
    status: "closed",
  },
  {
    id: "6",
    type: "policy",
    name: "Norway Leave Policy",
    subtitle: "25 days annual leave",
    status: "active",
  },
  {
    id: "7",
    type: "policy",
    name: "Philippines Benefits",
    subtitle: "Health insurance + 13th month",
    status: "draft",
  },
  {
    id: "8",
    type: "support",
    name: "Ticket #452",
    subtitle: "Payment issue - Alex Hansen",
    status: "active",
  },
  {
    id: "9",
    type: "support",
    name: "Ticket #451",
    subtitle: "Contract amendment",
    status: "closed",
  },
];

const PatternContent = () => {
  const navigate = useNavigate();
  const { activeEntity, getThread, addMessage } = useContextPivot();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const currentThread = activeEntity ? getThread(activeEntity.id) : null;

  const handleSendMessage = (content: string) => {
    if (!activeEntity) return;
    
    addMessage(activeEntity.id, "user", content);
    
    // Simulate Genie response
    setTimeout(() => {
      const responses: Record<string, string> = {
        contractor: `I'm now viewing ${activeEntity.name}'s profile. I can help with contracts, payments, or compliance documents. What would you like to do?`,
        payroll: `Switched to ${activeEntity.name}. I can show you totals, FX breakdown, or payment status. What do you need?`,
        policy: `Now reviewing ${activeEntity.name}. Would you like to see the full policy details or make changes?`,
        support: `Viewing ${activeEntity.name}. I can help escalate, update status, or pull related contractor information.`,
      };
      
      addMessage(
        activeEntity.id,
        "assistant",
        responses[activeEntity.type] || "How can I help you with this context?"
      );
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Pattern 27: Context Pivot Switcher</h1>
                <p className="text-sm text-muted-foreground">
                  Seamlessly switch between entity contexts with memory threads
                </p>
              </div>
            </div>
            
            {/* Context Chip */}
            <ContextChip onClick={() => setSwitcherOpen(true)} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Current Context View */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Context</CardTitle>
                <CardDescription>
                  Active entity and conversation thread
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContextTransition>
                  {activeEntity ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="font-medium text-lg">{activeEntity.name}</div>
                        {activeEntity.subtitle && (
                          <div className="text-sm text-muted-foreground">{activeEntity.subtitle}</div>
                        )}
                        <div className="mt-2">
                          <span className="text-xs font-medium">Type: </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {activeEntity.type}
                          </span>
                        </div>
                      </div>

                      {/* Conversation Thread */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Conversation Thread</div>
                        {currentThread && currentThread.messages.length > 0 ? (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {currentThread.messages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground ml-8"
                                    : "bg-muted mr-8"
                                }`}
                              >
                                <div className="text-xs font-medium mb-1 capitalize">
                                  {msg.role === "user" ? "You" : "Genie"}
                                </div>
                                <div className="text-sm">{msg.content}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-8">
                            No messages yet. Click a quick action below to start.
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Quick Actions</div>
                        <div className="flex flex-wrap gap-2">
                          {activeEntity.type === "contractor" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Show contract details")}
                              >
                                View Contract
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Show payment history")}
                              >
                                Payment History
                              </Button>
                            </>
                          )}
                          {activeEntity.type === "payroll" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Show FX breakdown")}
                              >
                                FX Breakdown
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Show payment status")}
                              >
                                Payment Status
                              </Button>
                            </>
                          )}
                          {activeEntity.type === "policy" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Show policy details")}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Edit policy")}
                              >
                                Edit Policy
                              </Button>
                            </>
                          )}
                          {activeEntity.type === "support" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Show ticket details")}
                              >
                                View Ticket
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage("Escalate ticket")}
                              >
                                Escalate
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No context selected</p>
                      <Button
                        className="mt-4"
                        onClick={() => setSwitcherOpen(true)}
                      >
                        Select Context
                      </Button>
                    </div>
                  )}
                </ContextTransition>
              </CardContent>
            </Card>
          </div>

          {/* Right: Pattern Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium text-sm mb-2">1. Select Context</div>
                  <p className="text-sm text-muted-foreground">
                    Click the context chip in the header to open the switcher modal.
                  </p>
                </div>
                <div>
                  <div className="font-medium text-sm mb-2">2. Search & Browse</div>
                  <p className="text-sm text-muted-foreground">
                    Search across contractors, payroll batches, policies, or support tickets.
                  </p>
                </div>
                <div>
                  <div className="font-medium text-sm mb-2">3. Separate Memory Threads</div>
                  <p className="text-sm text-muted-foreground">
                    Each context maintains its own conversation history and state.
                  </p>
                </div>
                <div>
                  <div className="font-medium text-sm mb-2">4. Quick Actions</div>
                  <p className="text-sm text-muted-foreground">
                    Context-specific actions adapt based on the entity type.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pattern Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <div className="text-sm">Seamless context switching without losing conversation</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <div className="text-sm">Separate memory threads per entity</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <div className="text-sm">Recent entities for quick access</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <div className="text-sm">Animated transitions for clarity</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <div className="text-sm">Dashboard syncs with active context</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Context Switcher Modal */}
      <ContextSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        entities={sampleEntities}
      />
    </div>
  );
};

const GenieContextPivotPattern = () => {
  return (
    <ContextPivotProvider>
      <PatternContent />
    </ContextPivotProvider>
  );
};

export default GenieContextPivotPattern;
