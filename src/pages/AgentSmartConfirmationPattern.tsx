import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentSmartConfirmation, ConfirmationData } from "@/components/AgentSmartConfirmation";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Play, FileText, DollarSign, CheckCircle2 } from "lucide-react";

const GenieSmartConfirmationPattern = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ConfirmationData | null>(null);

  const scenarios: ConfirmationData[] = [
    {
      id: "payroll-oct",
      title: "October Payroll Run",
      description: "Ready to process monthly payroll for 24 contractors across 2 countries",
      status: "ready",
      metrics: [
        { label: "Contractors", value: "24", tooltip: "All accounts verified and active" },
        { label: "Total Amount", value: "$78,320", tooltip: "Including all fees and FX conversions" },
        { label: "Countries", value: "2", tooltip: "Norway and Philippines" },
        { label: "FX Spread", value: "1.5%", tooltip: "Locked rate from Wise API" },
      ],
      changes: [
        {
          label: "FX Rates Updated",
          description: "NOK and PHP rates refreshed at 9:32 AM",
          type: "updated",
        },
        {
          label: "Approval from Howard",
          description: "CFO approved payroll batch on Oct 28",
          type: "added",
        },
      ],
      rationale:
        "Selected today's rates for faster transfer. All contractors have been active for 90+ days with verified bank accounts. FX spread is 0.3% lower than last month due to market conditions.",
    },
    {
      id: "contract-review",
      title: "Contract Amendment Review",
      description: "Updated terms for Senior Developer role in Oslo",
      status: "warning",
      metrics: [
        { label: "Role", value: "Senior Dev", tooltip: "Full-time contractor position" },
        { label: "Location", value: "Oslo, Norway" },
        { label: "Rate Change", value: "+12%", tooltip: "Annual compensation increase" },
        { label: "Term", value: "12 months", tooltip: "Fixed-term renewal" },
      ],
      changes: [
        {
          label: "Compensation Updated",
          description: "Hourly rate increased from $85 to $95",
          type: "updated",
        },
        {
          label: "IP Clause Added",
          description: "Standard intellectual property agreement included",
          type: "added",
        },
      ],
      rationale:
        "Rate adjustment aligns with market benchmarks for senior developers in Oslo. IP clause is required by legal team for all contractor agreements starting Q4 2025.",
    },
    {
      id: "compliance-submit",
      title: "Compliance Report Submission",
      description: "Q3 2025 compliance documentation ready for regulatory review",
      status: "info",
      metrics: [
        { label: "Documents", value: "47", tooltip: "All required forms and certificates" },
        { label: "Countries", value: "5", tooltip: "Norway, Philippines, US, UK, Germany" },
        { label: "Compliance Score", value: "98%", tooltip: "2 minor items flagged for review" },
        { label: "Due Date", value: "Nov 5", tooltip: "3 days remaining" },
      ],
      changes: [
        {
          label: "Tax Forms Updated",
          description: "Norway tax certificates refreshed",
          type: "updated",
        },
      ],
      rationale:
        "All documents have been validated against current regulations. Two minor items (missing signatures) are non-blocking and can be resolved post-submission.",
    },
  ];

  const handleOpenScenario = (scenario: ConfirmationData) => {
    setSelectedScenario(scenario);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast({
          title: "✅ Approved — Running Now",
          description: `${selectedScenario?.title} has been executed successfully.`,
          duration: 4000,
        });
        setIsModalOpen(false);
        resolve();
      }, 1000);
    });
  };

  const handleEdit = () => {
    toast({
      title: "Opening Editor",
      description: "Redirecting to detailed edit view...",
    });
    setIsModalOpen(false);
  };

  const scenarioIcons = {
    "payroll-oct": DollarSign,
    "contract-review": FileText,
    "compliance-submit": CheckCircle2,
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
        <div>
          <h1 className="text-4xl font-bold mb-2">Pattern 37 — Genie Smart Confirmation</h1>
          <p className="text-muted-foreground text-lg">
            Ensure users remain in control with structured review moments before significant actions.
          </p>
        </div>

        {/* Live Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>
              Click on any scenario to open the Smart Confirmation modal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {scenarios.map((scenario) => {
                const Icon = scenarioIcons[scenario.id as keyof typeof scenarioIcons];
                const statusColors = {
                  ready: "border-green-500/50 hover:border-green-500",
                  warning: "border-orange-500/50 hover:border-orange-500",
                  info: "border-blue-500/50 hover:border-blue-500",
                };

                return (
                  <div
                    key={scenario.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      statusColors[scenario.status || "ready"]
                    }`}
                    onClick={() => handleOpenScenario(scenario)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{scenario.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {scenario.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {scenario.metrics.length} metrics
                            </Badge>
                            {scenario.changes && scenario.changes.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {scenario.changes.length} changes
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="gap-2">
                        <Play className="w-4 h-4" />
                        Review
                      </Button>
                    </div>
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
                  <h4 className="font-semibold mb-1">Genie Signals Readiness</h4>
                  <p className="text-sm text-muted-foreground">
                    After completing an automated task, Genie prompts: "I've prepared the
                    payroll batch — ready to review?"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Smart Confirmation Modal</h4>
                  <p className="text-sm text-muted-foreground">
                    Modal displays 3 layers: Headline Summary, Detail Snapshot, and Change
                    Highlights
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Show Rationale</h4>
                  <p className="text-sm text-muted-foreground">
                    Users can toggle to see Genie's reasoning behind decisions and calculations
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Confirm or Edit</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose "Confirm & Execute" to proceed, or "Edit Before Running" to make
                    changes
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Execution & Logging</h4>
                  <p className="text-sm text-muted-foreground">
                    After confirmation, action executes with toast notification and audit trail
                    logging
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Payroll Processing (F3, F11)</h3>
                <p className="text-sm text-muted-foreground">
                  Final "Approve & Run" check for batch payments with FX rates and fee
                  breakdowns
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Contract Management (F2)</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm clause or term changes before e-signature with legal validation
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Compliance Validation (F6)</h3>
                <p className="text-sm text-muted-foreground">
                  Validate before submitting audit reports or regulatory verification
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Support Escalation (F5)</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm ticket escalation or reassignment with impact summary
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Principles */}
        <Card>
          <CardHeader>
            <CardTitle>Design Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold mb-2">Transparency Precedes Automation</h4>
              <p className="text-sm text-muted-foreground">
                Genie earns user confidence not by hiding complexity, but by revealing it
                elegantly — always giving the human a chance to pause, understand, and approve.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <strong>Clear Hierarchy:</strong> 3-layer structure (Summary → Details →
                Rationale)
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <strong>Active Language:</strong> "Confirm & Execute", "Edit Before Running"
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <strong>Accessible:</strong> ESC closes safely, focus on primary action
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {selectedScenario && (
        <GenieSmartConfirmation
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedScenario}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default GenieSmartConfirmationPattern;
