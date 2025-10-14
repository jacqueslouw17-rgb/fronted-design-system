import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentDualPathPrompt, PathModeBadge, PathMode } from "@/components/AgentDualPathPrompt";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, DollarSign, UserPlus, Shield, Headphones } from "lucide-react";
import KurtAvatar from "@/components/KurtAvatar";

const GenieDualPathSuggestionPattern = () => {
  const [currentMode, setCurrentMode] = useState<PathMode>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: "onboarding",
      icon: UserPlus,
      trigger: "New Contractor Added",
      title: "Set up contractor onboarding",
      description: "Howard approved a new contractor in Norway. Would you like me to set up their contract automatically?",
      aiOption: {
        label: "Let Genie handle it",
        description: "I'll draft the contract and prepare all documents for review",
        tooltip: "Genie will create a contract based on the country template and show you before sending",
      },
      manualOption: {
        label: "I'll do it manually",
        description: "I'll guide you through the contract creation process step-by-step",
        tooltip: "You maintain full control while Genie provides contextual assistance",
      },
      aiResponse: "Got it! I'll draft the Norway contractor agreement and show you before sending it for signature.",
      manualResponse: "Sure thing! You can start here: Create Contract → Select Norway Template. I'll stay ready if you need help filling the details.",
    },
    {
      id: "payroll",
      icon: DollarSign,
      trigger: "Payroll Due Tomorrow",
      title: "Process monthly payroll",
      description: "October payroll for 24 contractors is ready. Should I prepare the batch automatically?",
      aiOption: {
        label: "Let Genie handle it",
        description: "I'll prep the batch with current FX rates and validate all accounts",
        tooltip: "Automated preparation with Smart Confirmation before execution",
      },
      manualOption: {
        label: "I'll upload CSV",
        description: "I'll manually upload and review the payroll spreadsheet",
        tooltip: "Full manual control over payroll data entry and validation",
      },
      aiResponse: "Perfect! I'll fetch the latest FX rates, validate all 24 contractor accounts, and show you the summary before processing.",
      manualResponse: "No problem! Head to Payroll → Upload CSV. I'll validate the data as you upload and flag any issues.",
    },
    {
      id: "contract-amendment",
      icon: FileText,
      trigger: "Contract Update Requested",
      title: "Update contractor terms",
      description: "Senior Developer in Oslo requested a rate increase. Want me to generate the amendment?",
      aiOption: {
        label: "Let Genie handle it",
        description: "I'll create the amendment from the existing contract and highlight changes",
        tooltip: "Automated document generation with change tracking and legal validation",
      },
      manualOption: {
        label: "I'll edit directly",
        description: "I'll open the contract editor and make changes myself",
        tooltip: "Direct editing with Genie providing suggestions and validation",
      },
      aiResponse: "On it! I'll generate the amendment with the new rate ($85 → $95/hr) and show you the clause changes before finalizing.",
      manualResponse: "Great! Opening the contract editor. I'll highlight the compensation clause and suggest market-aligned language as you edit.",
    },
    {
      id: "compliance",
      icon: Shield,
      trigger: "Document Expiring Soon",
      title: "Renew compliance documents",
      description: "3 tax certificates expire next week. Should I request renewals automatically?",
      aiOption: {
        label: "Let Genie handle it",
        description: "I'll send renewal requests and track responses",
        tooltip: "Automated compliance tracking with deadline monitoring",
      },
      manualOption: {
        label: "I'll review first",
        description: "Show me which documents need renewal and I'll decide",
        tooltip: "Manual review of each document before taking action",
      },
      aiResponse: "Starting renewal workflow! I'll send requests to the 3 contractors and notify you when documents are uploaded.",
      manualResponse: "Here's the list: Norway (2 certs), Philippines (1 cert). Click any to see details and manually send renewal requests.",
    },
    {
      id: "support",
      icon: Headphones,
      trigger: "SLA Breach Risk",
      title: "Escalate support ticket",
      description: "Ticket #2847 is approaching SLA deadline. Would you like me to escalate automatically?",
      aiOption: {
        label: "Let Genie handle it",
        description: "I'll escalate to senior support and notify the contractor",
        tooltip: "Automated escalation with tracking and notifications",
      },
      manualOption: {
        label: "Let me decide",
        description: "Show me the ticket details first",
        tooltip: "Review ticket context before deciding on escalation",
      },
      aiResponse: "Escalating now! I'll assign to Sarah (senior support) and send an update to the contractor about the timeline.",
      manualResponse: "Here's the ticket summary: Payment issue, contractor in Philippines, 4h remaining on SLA. View full details to decide next steps.",
    },
  ];

  const handleModeSelect = (scenarioId: string, mode: PathMode) => {
    setCurrentMode(mode);
    setSelectedScenario(scenarioId);

    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const response = mode === "ai-led" ? scenario.aiResponse : scenario.manualResponse;

    toast({
      title: mode === "ai-led" ? "✨ AI-Led Mode Activated" : "🧑‍💻 Manual Mode Activated",
      description: response,
      duration: 5000,
    });
  };

  const resetDemo = () => {
    setCurrentMode(null);
    setSelectedScenario(null);
  };

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Pattern 38 — Genie Dual Path Suggestion</h1>
            <p className="text-muted-foreground text-lg">
              Let users choose between AI automation and manual control for every key workflow.
            </p>
          </div>
          {currentMode && (
            <div className="flex items-center gap-3">
              <PathModeBadge mode={currentMode} />
              <Button variant="outline" size="sm" onClick={resetDemo}>
                Reset Demo
              </Button>
            </div>
          )}
        </div>

        {/* Live Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>
              Select a scenario to see the dual path prompt in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario Cards */}
            <div className="grid gap-4">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isSelected = selectedScenario === scenario.id;

                return (
                  <div key={scenario.id} className="space-y-3">
                    <div
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-accent/50"
                          : "border-border hover:border-muted-foreground cursor-pointer"
                      }`}
                      onClick={() => !isSelected && setSelectedScenario(scenario.id)}
                    >
                      <div className="flex items-start gap-3">
                        <KurtAvatar size="sm" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1.5">
                              <Icon className="w-3 h-3" />
                              {scenario.trigger}
                            </Badge>
                          </div>
                          <p className="text-sm">{scenario.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Show Dual Path Prompt for selected scenario */}
                    {isSelected && (
                      <AgentDualPathPrompt
                        title={scenario.title}
                        description="Choose your preferred approach"
                        aiOption={scenario.aiOption}
                        manualOption={scenario.manualOption}
                        onSelect={(mode) => handleModeSelect(scenario.id, mode)}
                        currentMode={currentMode}
                      />
                    )}
                  </div>
                );
              })}
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
                  <h4 className="font-semibold mb-1">Task Trigger Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie detects a task opportunity (new hire, payroll due, document expiring) and
                    surfaces a dual path prompt
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Clear Choice Presentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Two distinct options: "Let Genie handle it" (automated) or "I'll do it manually"
                    (guided)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI-Led Path</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie automates the workflow with intermediate Smart Confirmations (Pattern 37)
                    for transparency
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Manual Path</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie becomes a supportive guide, showing next steps and staying ready to assist
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Preference Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Genie logs choices to personalize future interactions ("You usually prefer
                    manual contract reviews")
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  6
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Reversibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Users can switch paths anytime via toggle or chat command ("Switch to manual
                    mode")
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
                  "Shall I send the invite automatically or would you like to review first?"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contracting (F2)
                </h3>
                <p className="text-sm text-muted-foreground">
                  "Want me to generate a draft from the country template or start from scratch?"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payroll (F3/F11)
                </h3>
                <p className="text-sm text-muted-foreground">
                  "I can prep payroll automatically or you can upload a custom CSV"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Compliance (F6)
                </h3>
                <p className="text-sm text-muted-foreground">
                  "Should I verify document validity now or leave it for your review?"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Support (F5)
                </h3>
                <p className="text-sm text-muted-foreground">
                  "Would you like me to escalate this ticket automatically or review it first?"
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
              <h4 className="font-semibold mb-2">Empowerment Builds Trust</h4>
              <p className="text-sm text-muted-foreground">
                True confidence comes not from removing choice, but from giving it gracefully. Genie
                is powerful — but only as powerful as the user's comfort with its autonomy. By
                offering clear paths and honoring user preferences, we build trust through
                transparency and respect for human agency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieDualPathSuggestionPattern;
