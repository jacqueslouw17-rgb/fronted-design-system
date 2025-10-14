import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentPredictiveHintBar, HintAction } from "@/components/AgentPredictiveHintBar";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  UserPlus,
  Shield,
  Clock,
  Send,
  CheckSquare,
  Calendar,
} from "lucide-react";

const GeniePredictiveHintBarPattern = () => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showHintBar, setShowHintBar] = useState(false);

  const scenarios = [
    {
      id: "after-contract-approval",
      title: "After Contract Approval",
      description: "Two contractors just had their contracts approved",
      context: "Based on recent contract approvals",
      suggestions: [
        {
          id: "setup-payroll",
          label: "Set up payroll",
          context: "Add these contractors to the next payroll cycle",
          urgency: "medium" as const,
          icon: DollarSign,
          onClick: () => {
            toast({
              title: "Opening Payroll Setup",
              description: "Adding 2 contractors to October payroll cycle...",
            });
          },
        },
        {
          id: "request-compliance",
          label: "Request compliance docs",
          context: "Norway requires tax certificates within 7 days",
          urgency: "medium" as const,
          icon: Shield,
          onClick: () => {
            toast({
              title: "Sending Document Requests",
              description: "Requesting tax certificates from 2 contractors...",
            });
          },
        },
        {
          id: "schedule-onboarding",
          label: "Schedule onboarding call",
          context: "Book intro meeting within first week",
          urgency: "low" as const,
          icon: Calendar,
          onClick: () => {
            toast({
              title: "Opening Calendar",
              description: "Preparing onboarding call invitations...",
            });
          },
        },
      ],
    },
    {
      id: "payroll-cutoff-soon",
      title: "Payroll Cutoff Approaching",
      description: "Payroll processing deadline is 2 hours away",
      context: "Payroll cutoff in 2 hours — 3 edits pending",
      suggestions: [
        {
          id: "review-edits",
          label: "Review pending edits",
          context: "3 contractors have updated payment details",
          urgency: "high" as const,
          icon: CheckSquare,
          onClick: () => {
            toast({
              title: "Opening Payroll Review",
              description: "Loading 3 pending contractor edits...",
            });
          },
        },
        {
          id: "confirm-fx",
          label: "Lock FX rates",
          context: "Current spread is favorable at 1.3%",
          urgency: "high" as const,
          icon: DollarSign,
          onClick: () => {
            toast({
              title: "Locking FX Rates",
              description: "Securing current rates for this payroll cycle...",
            });
          },
        },
      ],
    },
    {
      id: "after-hire-created",
      title: "After New Hire Created",
      description: "A new contractor was just added to the system",
      context: "New contractor added — next steps ready",
      suggestions: [
        {
          id: "draft-contract",
          label: "Draft employment contract",
          context: "Use Norway template with standard terms",
          urgency: "medium" as const,
          icon: FileText,
          onClick: () => {
            toast({
              title: "Drafting Contract",
              description: "Generating contract from Norway template...",
            });
          },
        },
        {
          id: "send-invite",
          label: "Send welcome email",
          context: "Include onboarding checklist and portal access",
          urgency: "low" as const,
          icon: Send,
          onClick: () => {
            toast({
              title: "Sending Welcome Email",
              description: "Preparing onboarding materials...",
            });
          },
        },
      ],
    },
    {
      id: "compliance-expiring",
      title: "Compliance Documents Expiring",
      description: "3 tax certificates expire within 7 days",
      context: "3 documents expiring soon — action needed",
      suggestions: [
        {
          id: "request-renewals",
          label: "Request renewals",
          context: "Send automated renewal requests to contractors",
          urgency: "high" as const,
          icon: Shield,
          onClick: () => {
            toast({
              title: "Requesting Document Renewals",
              description: "Sending renewal requests to 3 contractors...",
            });
          },
        },
        {
          id: "review-docs",
          label: "Review documents",
          context: "Check which documents need immediate attention",
          urgency: "medium" as const,
          icon: FileText,
          onClick: () => {
            toast({
              title: "Opening Compliance Dashboard",
              description: "Loading expiring documents...",
            });
          },
        },
      ],
    },
    {
      id: "onboarding-incomplete",
      title: "Incomplete Onboarding",
      description: "2 contractors haven't completed their onboarding checklist",
      context: "2 contractors have incomplete onboarding",
      suggestions: [
        {
          id: "send-reminder",
          label: "Send reminder",
          context: "Gentle nudge to complete remaining steps",
          urgency: "low" as const,
          icon: Send,
          onClick: () => {
            toast({
              title: "Sending Reminders",
              description: "Notifying 2 contractors about pending tasks...",
            });
          },
        },
        {
          id: "review-progress",
          label: "Review progress",
          context: "See which steps are still pending",
          urgency: "low" as const,
          icon: CheckSquare,
          onClick: () => {
            toast({
              title: "Opening Onboarding Dashboard",
              description: "Loading contractor progress...",
            });
          },
        },
      ],
    },
  ];

  const handleScenarioSelect = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setShowHintBar(true);
  };

  const handleDismiss = () => {
    setShowHintBar(false);
    setActiveScenario(null);
    toast({
      title: "Hint Bar Dismissed",
      description: "Got it — I'll stay quiet until something changes.",
    });
  };

  const activeScenarioData = scenarios.find((s) => s.id === activeScenario);

  return (
    <div className="min-h-screen bg-background p-8 pb-32">
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
          <h1 className="text-4xl font-bold mb-2">Pattern 39 — Genie Predictive Hint Bar</h1>
          <p className="text-muted-foreground text-lg">
            Intelligent next-action suggestions based on context, actions, and system state.
          </p>
        </div>

        {/* Live Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>
              Select a scenario to trigger the predictive hint bar at the bottom of the screen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    activeScenario === scenario.id
                      ? "border-primary bg-accent/50"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => handleScenarioSelect(scenario.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{scenario.title}</h3>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {scenario.suggestions.length} suggestions
                        </Badge>
                        {scenario.suggestions.some((s) => s.urgency === "high") && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant={activeScenario === scenario.id ? "default" : "ghost"}>
                      {activeScenario === scenario.id ? "Active" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
                  <h4 className="font-semibold mb-1">Context Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie continuously monitors current screen, task state, and user role to detect
                    workflow opportunities
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Predictive Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on context data and rules, surfaces 1–3 action-driven suggestions in a
                    hint bar
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Transparent Reasoning</h4>
                  <p className="text-sm text-muted-foreground">
                    Each suggestion includes microcontext explaining why it's relevant ("based on
                    recent approval")
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Direct Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Clicking triggers either Genie execution or deep-links to relevant module with
                    context
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Behavioral Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie tracks which suggestions are accepted or ignored to refine future
                    prioritization
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  6
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Graceful Dismissal</h4>
                  <p className="text-sm text-muted-foreground">
                    Users can dismiss the bar anytime; Genie acknowledges and stays quiet until
                    context changes
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
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Onboarding (F1)
                </h3>
                <p className="text-sm text-muted-foreground">
                  After hire creation → Suggest "Create contract" or "Send invite"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contracts (F2)
                </h3>
                <p className="text-sm text-muted-foreground">
                  After approval → Suggest "Add to payroll" or "Request compliance docs"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payroll (F3/F11)
                </h3>
                <p className="text-sm text-muted-foreground">
                  After preview → Suggest "Confirm FX quote" or "Review edits"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Compliance (F6)
                </h3>
                <p className="text-sm text-muted-foreground">
                  After doc upload → Suggest "Verify expiry dates" or "Request renewals"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Dashboard (F13)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Global hints like "2 pending SLAs — review now" or "Payroll cutoff approaching"
                </p>
              </div>
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
              <h4 className="font-semibold mb-2">
                The best assistants don't wait to be asked — they anticipate, then explain
              </h4>
              <p className="text-sm text-muted-foreground">
                Predictive hints bridge intent and action, reducing hesitation and cognitive load
                while preserving user trust through transparency. By surfacing the most relevant
                next step with clear reasoning, Genie becomes an active participant in workflows
                rather than a reactive responder.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Hint Bar */}
      {showHintBar && activeScenarioData && (
        <GeniePredictiveHintBar
          suggestions={activeScenarioData.suggestions}
          context={activeScenarioData.context}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default GeniePredictiveHintBarPattern;
