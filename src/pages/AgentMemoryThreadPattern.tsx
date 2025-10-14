import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain } from "lucide-react";
import { 
  RecallCard, 
  ContextTag, 
  MemoryChipGroup, 
  MemoryDrawer,
  InlineMemoryRecall,
  useMemoryThread,
  type MemoryEntry 
} from "@/components/AgentMemoryThread";
import KurtAvatar from "@/components/KurtAvatar";
import { toast } from "sonner";

const GenieMemoryThreadPattern = () => {
  const navigate = useNavigate();
  const { memories, captureMemory, forgetMemory, updateMemoryStatus } = useMemoryThread();

  // Sample memories for demo
  const [sampleMemories] = useState<MemoryEntry[]>([
    {
      id: "1",
      title: "Alex Hansen Contract Review",
      description: "You left Alex's contract halfway through review.",
      entityType: "Contract",
      entityName: "Alex Hansen",
      status: "pending",
      scope: "module",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      context: { step: 3, totalSteps: 5 }
    },
    {
      id: "2",
      title: "September Payroll Draft",
      description: "Resuming September Payroll draft. Total payout $32,800 USD.",
      entityType: "Payroll",
      entityName: "September 2025",
      status: "paused",
      scope: "module",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      context: { contractors: 5, total: 32800 }
    },
    {
      id: "3",
      title: "Norway KYC Compliance Check",
      description: "Last checked Norway KYC docs 3 days ago.",
      entityType: "Compliance",
      entityName: "Norway",
      status: "completed",
      scope: "global",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      id: "4",
      title: "Ticket #32 Escalation",
      description: "You escalated Ticket #32 yesterday — status is Pending.",
      entityType: "Support Ticket",
      entityName: "#32",
      status: "pending",
      scope: "module",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ]);

  const handleResume = (memory: MemoryEntry) => {
    toast.success(`Resuming: ${memory.title}`);
    updateMemoryStatus(memory.id, "pending");
  };

  const handleView = (memory: MemoryEntry) => {
    toast.info(`Viewing details for: ${memory.title}`);
  };

  const handleForget = (memory: MemoryEntry) => {
    toast.success(`Forgot: ${memory.title}`);
    forgetMemory(memory.id);
  };

  const handleCaptureNew = () => {
    captureMemory({
      title: "New Contractor Onboarding",
      description: "Started onboarding process for Sarah Chen (Philippines)",
      entityType: "Onboarding",
      entityName: "Sarah Chen",
      status: "pending",
      scope: "module",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-card px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-semibold">
                Pattern 23 — Agent Context Memory Thread
              </h1>
            </div>
            <MemoryDrawer
              memories={[...sampleMemories, ...memories]}
              onResume={handleResume}
              onView={handleView}
              onForget={handleForget}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Make Genie feel intelligent and consistent by remembering context across sessions
          </p>
        </div>

        {/* Inline Memory Recall */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Inline Memory Recall</h2>
          <InlineMemoryRecall
            memory={sampleMemories[0]}
            onResume={() => handleResume(sampleMemories[0])}
            onView={() => handleView(sampleMemories[0])}
            onForget={() => handleForget(sampleMemories[0])}
          />
        </div>

        {/* Context Tags */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Context Tags</h2>
          <div className="flex flex-wrap gap-2">
            <ContextTag entityType="Contract" entityName="Alex Hansen" />
            <ContextTag entityType="Payroll" entityName="September 2025" />
            <ContextTag 
              entityType="Support" 
              entityName="Ticket #32" 
              onRemove={() => toast.success("Context removed")}
            />
          </div>
        </div>

        {/* Memory Chip Group */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Recall Chips</h2>
          <MemoryChipGroup
            memories={sampleMemories}
            onSelect={(memory) => {
              toast.info(`Selected: ${memory.title}`);
            }}
          />
        </div>

        {/* Recall Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Memory Threads</h2>
            <Button size="sm" onClick={handleCaptureNew}>
              <Brain className="w-4 h-4 mr-2" />
              Capture New Memory
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sampleMemories.map((memory) => (
              <RecallCard
                key={memory.id}
                memory={memory}
                onResume={() => handleResume(memory)}
                onView={() => handleView(memory)}
                onForget={() => handleForget(memory)}
              />
            ))}
          </div>
        </div>

        {/* Chat Simulation */}
        <div>
          <h2 className="text-lg font-semibold mb-3">In Conversation Context</h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Genie message with memory */}
              <div className="flex gap-3">
                <KurtAvatar size="sm" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm">
                      Welcome back Jaco! I remember you were reviewing Alex Hansen's contract. 
                      Would you like to continue where we left off?
                    </p>
                  </div>
                  <MemoryChipGroup
                    memories={[sampleMemories[0]]}
                    onSelect={(memory) => toast.info(`Resuming: ${memory.title}`)}
                  />
                </div>
              </div>

              {/* User response */}
              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">Yes, let's continue with the contract review</p>
                </div>
              </div>

              {/* Genie response */}
              <div className="flex gap-3">
                <KurtAvatar size="sm" />
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm">
                      Perfect! I've restored the context. You were on step 3 of 5 - reviewing the 
                      compensation clauses. The base rate is set at €75/hour with quarterly reviews.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Use Cases</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Continuity</CardTitle>
                <CardDescription>Resume drafting from where you stopped</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payroll Memory</CardTitle>
                <CardDescription>Reuse previous settings and configurations</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support Context</CardTitle>
                <CardDescription>Track escalations and pending tickets</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance Tracking</CardTitle>
                <CardDescription>Remember last KYC check dates</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cross-Module Memory</CardTitle>
                <CardDescription>Context persists across different flows</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personalization</CardTitle>
                <CardDescription>Genie remembers your preferences</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenieMemoryThreadPattern;
