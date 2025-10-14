import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ConfirmationQueue,
  QueueBadge,
  QueueDrawer,
  useConfirmationQueue,
  type QueueModule,
} from "@/components/AgentConfirmationQueue";
import { toast } from "@/hooks/use-toast";

export default function GenieConfirmationQueuePattern() {
  const { pendingCount, addItem, updateStatus } = useConfirmationQueue();

  const handleAddSample = (module: QueueModule) => {
    const samples = {
      contract: {
        title: "Approve Contract for Alex Hansen",
        context: "Remote Engineer - Norway",
        description: "Standard contractor agreement with Norwegian policy rules applied.",
        module: "contract" as QueueModule,
      },
      payroll: {
        title: "Approve September Payroll",
        context: "5 contractors in Philippines - Total: $32,800 USD",
        description: "Includes FX fees ($112) and estimated tax ($2,190).",
        module: "payroll" as QueueModule,
      },
      compliance: {
        title: "Validate ID Document",
        context: "Contractor: Maria Santos (PH)",
        description: "Government-issued ID uploaded for KYC verification.",
        module: "compliance" as QueueModule,
      },
      support: {
        title: "Escalate Support Ticket #54",
        context: "Missing payment report - SLA expires today",
        description: "Contractor Sam Lee reported payment not received.",
        module: "support" as QueueModule,
      },
      policy: {
        title: "Review Policy Change",
        context: "Norway tax withholding update",
        description: "New tax rate (22% → 24%) effective Q4 2025.",
        module: "policy" as QueueModule,
      },
    };

    const sample = samples[module];
    addItem(sample);

    toast({
      title: "Confirmation Added",
      description: `${sample.title} added to queue.`,
    });
  };

  const handleApprove = (id: string) => {
    updateStatus(id, "approved");
    toast({
      title: "✅ Action Approved",
      description: "The confirmation has been processed successfully.",
    });
  };

  const handleReject = (id: string, reason?: string) => {
    updateStatus(id, "rejected");
    toast({
      title: "❌ Action Rejected",
      description: reason || "The confirmation has been rejected.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to overview
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Agent Confirmation Queue
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Pattern 24 — Pending Actions Manager
              </p>
            </div>
          </div>

          <QueueDrawer />
        </div>

        {/* Description */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-xl font-semibold mb-3">Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Confirmation Queue gives users a single place to review, confirm, or reject
            pending actions Agent has initiated — without losing context or searching through
            chats or dashboards. It ensures nothing slips through while maintaining a
            lightweight conversational experience.
          </p>
        </Card>

        {/* Live Demo Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Live Demo</h2>
            <div className="flex items-center gap-2">
              <QueueBadge count={pendingCount} />
            </div>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Add Sample Confirmations</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSample("contract")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Contract
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSample("payroll")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Payroll
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSample("compliance")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Compliance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSample("support")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSample("policy")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Policy
              </Button>
            </div>
          </Card>
        </div>

        {/* Queue Display */}
        <Card className="p-6">
          <ConfirmationQueue onApprove={handleApprove} onReject={handleReject} />
        </Card>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">✨ Key Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Live Badge Count</strong> — Shows pending confirmations in topbar</li>
              <li>• <strong>Quick Actions</strong> — Approve or reject with one click</li>
              <li>• <strong>Context Tags</strong> — Module and status indicators</li>
              <li>• <strong>Rejection Comments</strong> — Optional reason for rejection</li>
              <li>• <strong>Recent Activity</strong> — Completed actions archived automatically</li>
              <li>• <strong>Drawer View</strong> — Expandable queue from any screen</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">🔗 Pattern References</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>P21</strong> — Confirmation Card (base UI unit)</li>
              <li>• <strong>P23</strong> — Context Memory Thread (integration)</li>
              <li>• <strong>P9</strong> — Audit Trail Timeline (logging)</li>
              <li>• <strong>P11</strong> — Dual Mode (chat + dashboard)</li>
              <li>• <strong>P5</strong> — Hover Quick Toolbar (shortcuts)</li>
            </ul>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">📋 Use Cases</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Contract Drafting (F2)</h4>
              <p className="text-sm text-muted-foreground">
                "Approve contract for Alex Hansen (Norway)" — Legal HITL control
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payroll Prep (F3)</h4>
              <p className="text-sm text-muted-foreground">
                "Approve September payroll summary" — Reduce payroll errors
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payout Orchestration (F4)</h4>
              <p className="text-sm text-muted-foreground">
                "Confirm FX rate lock" — Compliance + accuracy
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Compliance Checklist (F6)</h4>
              <p className="text-sm text-muted-foreground">
                "Validate ID document for PH team" — Traceable verification
              </p>
            </div>
          </div>
        </Card>

        {/* Microcopy Examples */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold text-lg mb-3">💬 Microcopy Examples</h3>
          <div className="space-y-3 text-sm">
            <p className="italic text-muted-foreground">
              "Your approval is needed for September payroll in PH."
            </p>
            <p className="italic text-muted-foreground">
              "The FX rate will lock at ₱58.23/USD — confirm to proceed?"
            </p>
            <p className="italic text-muted-foreground">
              "Contract for Alex Hansen updated with your policy — ready for approval."
            </p>
            <p className="italic text-muted-foreground">
              "You have 3 pending confirmations. Let's review them now?"
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
