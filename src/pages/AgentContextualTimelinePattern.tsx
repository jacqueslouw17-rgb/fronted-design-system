import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Timeline,
  useTimeline,
  LivePulseIndicator,
  type EventType,
  type EventStatus,
  type EventActor,
} from "@/components/AgentContextualTimeline";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function GenieContextualTimelinePattern() {
  const { events, addEvent, clearEvents } = useTimeline();
  const [hasNewEvents, setHasNewEvents] = useState(false);

  const sampleEvents: Array<{
    type: EventType;
    status: EventStatus;
    actor: EventActor;
    actorName: string;
    title: string;
    description: string;
    context?: string;
    metadata?: Record<string, any>;
  }> = [
    {
      type: "contract",
      status: "success",
      actor: "genie",
      actorName: "Genie",
      title: "Contract sent for signature",
      description: "Alex Hansen's contract has been sent for e-signature",
      context: "Remote Engineer - Norway",
      metadata: { contract_id: "CT-2025-001", recipient: "alex@example.com" },
    },
    {
      type: "payroll",
      status: "pending",
      actor: "user",
      actorName: "Ioana Smith",
      title: "Payroll batch submitted",
      description: "September 2025 payroll batch awaiting final approval",
      context: "5 contractors in Philippines - Total: $32,800 USD",
      metadata: { batch_id: "PR-2025-09", total_amount: "$32,800" },
    },
    {
      type: "compliance",
      status: "success",
      actor: "system",
      actorName: "System",
      title: "ID verification completed",
      description: "Government ID verified successfully via Onfido",
      context: "Contractor: Maria Santos (PH)",
      metadata: { verification_id: "VER-12345", confidence: "99%" },
    },
    {
      type: "payout",
      status: "success",
      actor: "genie",
      actorName: "Genie",
      title: "FX payout executed",
      description: "Wise transfer completed at locked rate",
      context: "₱58.23/USD - Total ₱1,905,560",
      metadata: { fx_rate: "58.23", provider: "Wise" },
    },
    {
      type: "support",
      status: "info",
      actor: "user",
      actorName: "Sam Lee",
      title: "Support ticket created",
      description: "Missing payment inquiry submitted",
      context: "Ticket #452 - Auto-escalated to Tier 2",
      metadata: { ticket_id: "452", priority: "high" },
    },
    {
      type: "policy",
      status: "success",
      actor: "user",
      actorName: "Howard Chen",
      title: "Policy change approved",
      description: "Leave days updated from 20 to 24",
      context: "Norway team policy update - Effective Q4 2025",
      metadata: { policy_id: "POL-24", effective_date: "2025-10-01" },
    },
    {
      type: "upload",
      status: "success",
      actor: "genie",
      actorName: "Genie",
      title: "Document uploaded",
      description: "Tax form W-8BEN uploaded for processing",
      context: "Contractor: Alex Hansen",
      metadata: { file_name: "W8BEN_Alex_Hansen.pdf", size: "2.3 MB" },
    },
    {
      type: "approval",
      status: "failed",
      actor: "user",
      actorName: "Legal Team",
      title: "Contract approval rejected",
      description: "Contract requires clause revision before approval",
      context: "Contractor: John Doe",
      metadata: { reason: "Missing IP clause", reviewer: "legal@example.com" },
    },
  ];

  const handleAddRandomEvent = () => {
    const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
    addEvent(randomEvent);
    setHasNewEvents(true);

    toast({
      title: "Event Added",
      description: `${randomEvent.title} added to timeline.`,
    });

    // Auto-reset live indicator
    setTimeout(() => setHasNewEvents(false), 5000);
  };

  const handleClearAll = () => {
    clearEvents();
    setHasNewEvents(false);
    toast({
      title: "Timeline Cleared",
      description: "All events have been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to overview
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Genie Contextual Timeline
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Pattern 25 — Real-Time Event Bridge
              </p>
            </div>
            <LivePulseIndicator active={hasNewEvents} />
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-xl font-semibold mb-3">Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Contextual Timeline creates a living "time spine" that connects every event
            Genie triggers or responds to — across chat, dashboard, and backend systems — into
            one cohesive, visible stream. It transforms invisible automation into visible trust
            signals.
          </p>
        </Card>

        {/* Live Demo Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Live Demo</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRandomEvent}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Random Event
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="gap-2"
                disabled={events.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Add Specific Events</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addEvent(sampleEvents[0]);
                  setHasNewEvents(true);
                  setTimeout(() => setHasNewEvents(false), 5000);
                }}
              >
                Contract Sent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addEvent(sampleEvents[1]);
                  setHasNewEvents(true);
                  setTimeout(() => setHasNewEvents(false), 5000);
                }}
              >
                Payroll Submitted
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addEvent(sampleEvents[2]);
                  setHasNewEvents(true);
                  setTimeout(() => setHasNewEvents(false), 5000);
                }}
              >
                ID Verified
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addEvent(sampleEvents[3]);
                  setHasNewEvents(true);
                  setTimeout(() => setHasNewEvents(false), 5000);
                }}
              >
                Payout Executed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addEvent(sampleEvents[4]);
                  setHasNewEvents(true);
                  setTimeout(() => setHasNewEvents(false), 5000);
                }}
              >
                Support Ticket
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addEvent(sampleEvents[5]);
                  setHasNewEvents(true);
                  setTimeout(() => setHasNewEvents(false), 5000);
                }}
              >
                Policy Approved
              </Button>
            </div>
          </Card>
        </div>

        {/* Timeline Display */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Event Timeline</h3>
          <Timeline showFilters maxHeight="700px" />
        </Card>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">✨ Key Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Real-Time Updates</strong> — LivePulse animation for new events</li>
              <li>• <strong>Actor Identification</strong> — Genie, User, or System avatars</li>
              <li>• <strong>Event Filtering</strong> — Filter by type and status</li>
              <li>• <strong>Expandable Details</strong> — Full context in drawer view</li>
              <li>• <strong>Visual Hierarchy</strong> — Connector lines and timestamps</li>
              <li>• <strong>Persistent State</strong> — Events saved to localStorage</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">🔗 Pattern References</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>P9</strong> — Audit Trail Timeline (expanded)</li>
              <li>• <strong>P23</strong> — Context Memory Thread (integration)</li>
              <li>• <strong>P24</strong> — Confirmation Queue (event logging)</li>
              <li>• <strong>P4</strong> — Contextual Drawer (deep inspection)</li>
              <li>• <strong>P2</strong> — Dashboard Drawer (global access)</li>
            </ul>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">📋 Use Cases Across Flows</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Contract Drafting (F2)</h4>
              <p className="text-sm text-muted-foreground">
                "Contract for Alex sent for approval" — Audit and traceability
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payroll Prep (F3)</h4>
              <p className="text-sm text-muted-foreground">
                "Payroll batch finalized by CFO" — Clear handoff between roles
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payout Orchestration (F4)</h4>
              <p className="text-sm text-muted-foreground">
                "Wise payout executed – FX ₱58.23/USD" — Financial visibility
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Support Escalation (F5)</h4>
              <p className="text-sm text-muted-foreground">
                "Ticket #452 auto-escalated to Tier 2" — SLA accountability
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Compliance Checklist (F6)</h4>
              <p className="text-sm text-muted-foreground">
                "ID doc verified via Onfido" — Regulatory proof
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Contractor Portal (F10)</h4>
              <p className="text-sm text-muted-foreground">
                "Payslip viewed by contractor" — Mutual transparency
              </p>
            </div>
          </div>
        </Card>

        {/* Microcopy Examples */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold text-lg mb-3">💬 Microcopy Examples</h3>
          <div className="space-y-3 text-sm">
            <p className="italic text-muted-foreground">
              "Genie submitted the FX report for your approval."
            </p>
            <p className="italic text-muted-foreground">
              "Contract signed by Alex — added to timeline."
            </p>
            <p className="italic text-muted-foreground">
              "Payroll for September 2025 completed successfully."
            </p>
            <p className="italic text-muted-foreground">
              "Policy change 'Leave Days → 24' approved by Ioana."
            </p>
          </div>
        </Card>

        {/* Implementation Notes */}
        <Card className="p-6 bg-muted/50 border-primary/20">
          <h3 className="font-semibold text-lg mb-3">⚙️ Implementation Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Timeline component integrates with GenieDrawer and DashboardActivity</li>
            <li>• Events persist in localStorage (ready for API integration)</li>
            <li>• LivePulse uses Framer Motion spring animation</li>
            <li>• Event IDs link to MemoryThread context for recall</li>
            <li>• Supports real-time updates via Supabase realtime (future)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
