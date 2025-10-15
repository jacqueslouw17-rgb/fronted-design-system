import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecallThreadCard, ThreadListPanel } from "@/components/AgentRecallThread";
import { useRecallThread, RecallThread } from "@/hooks/useRecallThread";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import KurtAvatar from "@/components/KurtAvatar";

const GenieMultiStepRecallThreadPattern = () => {
  const {
    threads,
    createThread,
    pauseThread,
    resumeThread,
    completeThread,
    deleteThread,
    getActiveThreads,
    getPausedThreads,
  } = useRecallThread();

  const [activeTab, setActiveTab] = useState<"active" | "paused" | "all">("active");

  const sampleThreads = [
    {
      flowName: "Onboard Maria Santos",
      flowType: "onboarding" as const,
      currentStep: 3,
      totalSteps: 5,
      steps: [
        { id: "1", label: "Personal info", completed: true },
        { id: "2", label: "Upload ID", completed: true },
        { id: "3", label: "Contract review", completed: false },
        { id: "4", label: "Compliance docs", completed: false },
        { id: "5", label: "Welcome email", completed: false },
      ],
      lastAction: "Contract drafted",
      lastMessage: "I've preloaded the draft so you can approve or make edits.",
      metadata: { contractorName: "Maria Santos", country: "Philippines" },
    },
    {
      flowName: "October Payroll Prep",
      flowType: "payroll" as const,
      currentStep: 2,
      totalSteps: 4,
      steps: [
        { id: "1", label: "Fetch contractor list", completed: true },
        { id: "2", label: "Validate accounts", completed: false },
        { id: "3", label: "Lock FX rates", completed: false },
        { id: "4", label: "Final review", completed: false },
      ],
      lastAction: "Fetched 24 contractors",
      lastMessage: "All contractors loaded — ready to validate payment details.",
      metadata: { contractorCount: 24, countries: ["Norway", "Philippines"] },
    },
    {
      flowName: "Senior Dev Contract Amendment",
      flowType: "contract" as const,
      currentStep: 1,
      totalSteps: 3,
      steps: [
        { id: "1", label: "Review changes", completed: false },
        { id: "2", label: "Legal validation", completed: false },
        { id: "3", label: "Send for signature", completed: false },
      ],
      lastAction: "Rate increase detected",
      lastMessage: "Generating amendment with new rate ($85 → $95/hr).",
      metadata: { contractor: "Ole Hansen", rateChange: "+12%" },
    },
  ];

  const createSampleThread = (index: number) => {
    const sample = sampleThreads[index];
    const thread = createThread(sample);

    toast({
      title: "Thread Created",
      description: `Started "${sample.flowName}" workflow`,
    });

    return thread;
  };

  const handleResume = (id: string) => {
    resumeThread(id);
    const thread = threads.find((t) => t.id === id);

    toast({
      title: "Thread Resumed",
      description: `Continuing "${thread?.flowName}" from step ${thread?.currentStep}`,
      duration: 3000,
    });
  };

  const handlePause = (id: string) => {
    pauseThread(id);
    const thread = threads.find((t) => t.id === id);

    toast({
      title: "Thread Paused",
      description: `"${thread?.flowName}" saved — you can resume anytime`,
    });
  };

  const handleComplete = (id: string) => {
    completeThread(id);
    const thread = threads.find((t) => t.id === id);

    toast({
      title: "Thread Completed! 🎉",
      description: `"${thread?.flowName}" finished successfully`,
    });
  };

  const handleDelete = (id: string) => {
    const thread = threads.find((t) => t.id === id);
    deleteThread(id);

    toast({
      title: "Thread Deleted",
      description: `"${thread?.flowName}" removed from memory`,
      variant: "destructive",
    });
  };

  const activeThreads = getActiveThreads();
  const pausedThreads = getPausedThreads();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Patterns
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Pattern 40 — Agent Multi-Step Recall Thread</h1>
          <p className="text-muted-foreground text-lg">
            Pause, remember, and resume multi-step processes without losing context.
          </p>
        </div>

        {/* Genie Greeting with Recall */}
        {pausedThreads.length > 0 && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <KurtAvatar size="sm" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">Hey there! 👋</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    You were working on{" "}
                    <span className="font-medium text-foreground">
                      {pausedThreads[0].flowName}
                    </span>{" "}
                    earlier. You stopped after{" "}
                    <span className="font-medium text-foreground">
                      {pausedThreads[0].lastAction}
                    </span>{" "}
                    — would you like to continue from there?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleResume(pausedThreads[0].id)}>
                      Resume from Step {pausedThreads[0].currentStep}
                    </Button>
                    <Button size="sm" variant="outline">
                      View All Threads
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Actions</CardTitle>
            <CardDescription>Create sample threads to test the recall system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              {sampleThreads.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => createSampleThread(index)}
                >
                  <Plus className="w-4 h-4" />
                  Create: {sample.flowName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thread List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recall Threads</CardTitle>
                <CardDescription>View and manage all workflow threads</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{threads.length} total</Badge>
                <Badge variant="default">{activeThreads.length} active</Badge>
                <Badge variant="secondary">{pausedThreads.length} paused</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">
                  Active ({activeThreads.length})
                </TabsTrigger>
                <TabsTrigger value="paused">
                  Paused ({pausedThreads.length})
                </TabsTrigger>
                <TabsTrigger value="all">All ({threads.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <ThreadListPanel
                  threads={activeThreads}
                  onResume={handleResume}
                  onPause={handlePause}
                  onDelete={handleDelete}
                  emptyMessage="No active threads — start a workflow to see it here"
                />
              </TabsContent>

              <TabsContent value="paused" className="mt-6">
                <ThreadListPanel
                  threads={pausedThreads}
                  onResume={handleResume}
                  onDelete={handleDelete}
                  emptyMessage="No paused threads — pause an active workflow to see it here"
                />
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <ThreadListPanel
                  threads={threads}
                  onResume={handleResume}
                  onPause={handlePause}
                  onDelete={handleDelete}
                  emptyMessage="No threads yet — create a sample workflow to get started"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Behavior Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Automatic Context Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie tracks flow, progress, and decisions made in every multi-step process
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">State Persistence</h4>
                  <p className="text-sm text-muted-foreground">
                    When paused, thread state is stored locally with structured data: flow, step,
                    last action
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Intelligent Greeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Upon return, Genie greets with recall context: "Welcome back! We were midway
                    through..."
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Recall Menu</h4>
                  <p className="text-sm text-muted-foreground">
                    View all paused/active threads with progress % and timestamp in organized panel
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Seamless Continuation</h4>
                  <p className="text-sm text-muted-foreground">
                    Selecting a thread reopens the conversation with last message + step restored
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  6
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Audit Trail Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Thread summaries logged for traceability with support for recap commands
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Use Cases Across Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="font-semibold text-sm mb-1">Onboarding (F1)</h4>
              <p className="text-xs text-muted-foreground">
                Resume paused contractor setup without re-entering data
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="font-semibold text-sm mb-1">Contracts (F2)</h4>
              <p className="text-xs text-muted-foreground">
                Resume contract review or approval with all edits preserved
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="font-semibold text-sm mb-1">Payroll (F3/F11)</h4>
              <p className="text-xs text-muted-foreground">
                Resume last payroll batch preparation with validated data intact
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="font-semibold text-sm mb-1">Compliance (F6)</h4>
              <p className="text-xs text-muted-foreground">
                Continue document validation exactly where you left off
              </p>
            </div>
          </CardContent>
        </Card>

        {/* UX Principle */}
        <Card>
          <CardHeader>
            <CardTitle>UX Principle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold mb-2">Continuity builds confidence</h4>
              <p className="text-sm text-muted-foreground">
                Users trust systems that remember responsibly — Genie doesn't just recall data; it
                recalls intent, context, and progress, creating a sense of partnership and flow. By
                eliminating the friction of "starting over," we enable asynchronous collaboration
                and reduce cognitive load.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieMultiStepRecallThreadPattern;
