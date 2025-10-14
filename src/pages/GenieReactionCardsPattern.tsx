import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Smile } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactionCard from "@/components/ReactionCard";
import { getReactions, type ReactionRecord } from "@/hooks/useReactionAnalytics";

const GenieReactionCardsPattern: React.FC = () => {
  const [recent, setRecent] = useState<ReactionRecord[]>(() => getReactions(5));

  const onReact = () => setRecent(getReactions(5));

  const examples = useMemo(
    () => [
      {
        id: "m1",
        flowId: "F3-Payroll",
        text: "All payroll edits have been approved by Howard.",
      },
      {
        id: "m2",
        flowId: "F2-Contract",
        text: "Here’s the updated contract. Howard still needs to approve before it’s valid.",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Smile className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Genie Reaction Cards</h1>
            <p className="text-muted-foreground">Pattern 29 — Sentiment feedback loop</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Purpose
            </CardTitle>
            <CardDescription>
              Lightweight, conversational reactions to Genie’s messages to capture instant sentiment and improve tone and clarity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Key Components</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">ReactionCard</Badge>
                <Badge variant="outline">FeedbackBar</Badge>
                <Badge variant="outline">EmojiButton</Badge>
                <Badge variant="outline">Thanks Toast</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2">Behavior</h4>
              <p className="text-sm text-muted-foreground">Appears 1.5s after a message. On tap, logs sentiment with flow id and time; optional “Why?” lets users add a one-line reason.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>React to recent Genie messages below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {examples.map((m) => (
              <div key={m.id} className="rounded-lg border p-4">
                <div className="text-sm">{m.text}</div>
                <ReactionCard flowId={m.flowId} userRole="Admin" messageId={m.id} onReact={onReact} />
              </div>
            ))}

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Recently Logged Feedback</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                {recent.length === 0 && <div>No feedback yet. Try reacting above.</div>}
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="font-medium">{r.sentiment}</span>
                    <span>•</span>
                    <span>{r.flowId}</span>
                    {r.reasonText ? (
                      <>
                        <span>•</span>
                        <span className="truncate">{r.reasonText}</span>
                      </>
                    ) : null}
                    <span className="ml-auto">{new Date(r.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Use Cases */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>• Payroll (F3): Gauge confidence in payout timing.</div>
            <div>• Contracts (F2): Capture clarity issues on clauses.</div>
            <div>• Compliance (F6): Understand friction in document requests.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieReactionCardsPattern;
