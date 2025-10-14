import { useState, useEffect } from "react";
import { ArrowLeft, Play, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenieTaskTimeline, TaskStep, TaskStatus } from "@/components/GenieTaskTimeline";
import { useToast } from "@/hooks/use-toast";

const GenieTaskTimelinePattern = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TaskStep[]>([]);

  const initialSteps: TaskStep[] = [
    {
      id: "step-1",
      title: "Fetching FX rates",
      description: "Retrieving latest currency exchange rates from provider",
      status: "pending",
      progress: 0,
      eta: 2,
    },
    {
      id: "step-2",
      title: "Calculating payroll summary",
      description: "Processing 12 contractor payments with tax adjustments",
      status: "pending",
      progress: 0,
      eta: 5,
    },
    {
      id: "step-3",
      title: "Awaiting CFO approval",
      description: "Manual review required before finalizing batch",
      status: "pending",
      progress: 0,
      action: {
        label: "Review Now",
        onClick: () => {
          toast({
            title: "Approval Simulated",
            description: "CFO approval confirmed — continuing process",
          });
          // Move to next step
          setSteps(prev => prev.map(s => 
            s.id === "step-3" 
              ? { ...s, status: "completed" as TaskStatus, progress: 100, timestamp: new Date() }
              : s
          ));
        },
      },
    },
    {
      id: "step-4",
      title: "Submitting payroll batch",
      description: "Sending finalized batch to payment processor",
      status: "pending",
      progress: 0,
      eta: 3,
    },
  ];

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev];
        
        // Find first non-completed step
        const currentIndex = newSteps.findIndex(s => s.status !== "completed");
        if (currentIndex === -1) {
          setIsRunning(false);
          return newSteps;
        }

        const currentStep = newSteps[currentIndex];

        // If step is awaiting input, don't auto-progress
        if (currentStep.id === "step-3" && currentStep.status === "in-progress") {
          return newSteps.map((s, i) => 
            i === currentIndex 
              ? { ...s, status: "awaiting-input" as TaskStatus, progress: 100 }
              : s
          );
        }

        // Start step if pending
        if (currentStep.status === "pending") {
          return newSteps.map((s, i) => 
            i === currentIndex 
              ? { ...s, status: "in-progress" as TaskStatus, progress: 0 }
              : s
          );
        }

        // Progress the current step
        if (currentStep.status === "in-progress") {
          const increment = 100 / ((currentStep.eta || 3) * 5); // 5 updates per second
          const newProgress = Math.min(currentStep.progress + increment, 100);
          
          if (newProgress >= 100) {
            // Complete this step
            return newSteps.map((s, i) => 
              i === currentIndex 
                ? { 
                    ...s, 
                    status: "completed" as TaskStatus, 
                    progress: 100,
                    timestamp: new Date()
                  }
                : s
            );
          } else {
            // Update progress
            return newSteps.map((s, i) => 
              i === currentIndex 
                ? { 
                    ...s, 
                    progress: newProgress,
                    eta: currentStep.eta ? Math.max(0, currentStep.eta - 0.2) : undefined
                  }
                : s
            );
          }
        }

        return newSteps;
      });
    }, 200); // Update every 200ms for smooth animation

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    setSteps(initialSteps);
    setIsRunning(true);
  };

  const handleReset = () => {
    setSteps([]);
    setIsRunning(false);
  };

  const handleComplete = () => {
    const totalTime = initialSteps.reduce((sum, step) => sum + (step.eta || 0), 0);
    toast({
      title: "Task Complete",
      description: `All 4 steps completed in ${totalTime}s — Payroll ready to submit`,
    });
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
            Genie Task Timeline (Live Progress & ETA Cards)
          </h1>
          <p className="text-muted-foreground mt-2">
            Transparent, real-time view of every background action Genie performs
          </p>
        </div>

        {/* Pattern Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pattern Behavior
            </CardTitle>
            <CardDescription>
              Step-by-step confidence that things are happening with live progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Core Principle</h3>
              <p className="text-sm text-muted-foreground">
                "If Genie acts, users should see it happen." — Visibility of system progress turns 
                automation into reassurance instead of mystery.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Key Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Real-time status updates with animated progress bars</li>
                <li>ETA chips showing estimated completion time</li>
                <li>Visual timeline with connector lines and status icons</li>
                <li>Inline action buttons for steps requiring user input</li>
                <li>Compact/Detailed view toggle for different contexts</li>
                <li>Automatic completion notification with summary</li>
                <li>Persistent timeline in Context Tracker for audit</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Live Demo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Live Timeline Demo</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStart} 
                  disabled={isRunning || steps.length > 0}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Task
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {steps.length > 0 ? (
              <GenieTaskTimeline
                title="October Payroll Processing"
                steps={steps}
                onComplete={handleComplete}
              />
            ) : (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click "Start Task" to begin the demo</p>
                  <p className="text-xs mt-1">Watch real-time progress updates</p>
                </div>
              </Card>
            )}
          </div>

          {/* Static Example */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Completed Example</h2>
            <GenieTaskTimeline
              title="Contract Generation Complete"
              compact={false}
              steps={[
                {
                  id: "c1",
                  title: "Draft contract template",
                  description: "Generated Spain-compliant contractor agreement",
                  status: "completed",
                  progress: 100,
                  timestamp: new Date(Date.now() - 120000),
                },
                {
                  id: "c2",
                  title: "Legal review passed",
                  description: "Automated compliance check successful",
                  status: "completed",
                  progress: 100,
                  timestamp: new Date(Date.now() - 90000),
                },
                {
                  id: "c3",
                  title: "E-signature sent",
                  description: "Document sent to Anna Martinez via DocuSign",
                  status: "completed",
                  progress: 100,
                  timestamp: new Date(Date.now() - 60000),
                },
                {
                  id: "c4",
                  title: "Contract archived",
                  description: "Final version stored in compliance database",
                  status: "completed",
                  progress: 100,
                  timestamp: new Date(Date.now() - 30000),
                },
              ]}
            />
          </div>
        </div>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <h3 className="font-medium">Payroll Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    FX fetch → calculation → CFO approval → batch submission
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <h3 className="font-medium">Contract Workflow</h3>
                  <p className="text-sm text-muted-foreground">
                    Draft → legal review → e-signature → archive
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="font-medium">Compliance Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Document upload → verification → country-specific checks → approval
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎧</div>
                <div>
                  <h3 className="font-medium">Support Escalation</h3>
                  <p className="text-sm text-muted-foreground">
                    Ticket routing → tier assignment → resolution tracking → close
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

export default GenieTaskTimelinePattern;
