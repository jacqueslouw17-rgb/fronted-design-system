import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustGauge } from "@/components/TrustIndexGauge";
import { useTrustIndex, TrustMetrics } from "@/hooks/useTrustIndex";
import { toast } from "@/hooks/use-toast";
import { ArrowUp, ArrowDown, CheckCircle2, XCircle, Clock } from "lucide-react";

const GenieTrustGaugePattern = () => {
  const { current, history, updateTrust } = useTrustIndex();
  const [isAnimating, setIsAnimating] = useState(false);

  const simulateAction = (actionType: "success" | "failure" | "delay") => {
    setIsAnimating(true);

    let newMetrics: TrustMetrics;
    let message: string;
    let delta: number;

    switch (actionType) {
      case "success":
        // Successful action increases trust
        newMetrics = {
          sentiment: Math.min(100, (current?.metrics.sentiment || 75) + 5),
          slaCompliance: Math.min(100, (current?.metrics.slaCompliance || 80) + 3),
          fxAccuracy: Math.min(100, (current?.metrics.fxAccuracy || 85) + 2),
          legalIntegrity: Math.min(100, (current?.metrics.legalIntegrity || 90) + 1),
          systemUptime: Math.min(100, (current?.metrics.systemUptime || 95) + 1),
        };
        delta = 3;
        message = "✅ All payouts confirmed — no errors. Trust Level increased!";
        break;

      case "failure":
        // Failed action decreases trust
        newMetrics = {
          sentiment: Math.max(0, (current?.metrics.sentiment || 75) - 8),
          slaCompliance: Math.max(0, (current?.metrics.slaCompliance || 80) - 5),
          fxAccuracy: Math.max(0, (current?.metrics.fxAccuracy || 85) - 3),
          legalIntegrity: Math.max(0, (current?.metrics.legalIntegrity || 90) - 2),
          systemUptime: Math.max(0, (current?.metrics.systemUptime || 95) - 4),
        };
        delta = -3;
        message = "⚠️ Payout failed — validation error detected. Trust Level decreased.";
        break;

      case "delay":
        // Delayed action slightly decreases trust
        newMetrics = {
          sentiment: Math.max(0, (current?.metrics.sentiment || 75) - 3),
          slaCompliance: Math.max(0, (current?.metrics.slaCompliance || 80) - 4),
          fxAccuracy: Math.max(0, (current?.metrics.fxAccuracy || 85) - 1),
          legalIntegrity: current?.metrics.legalIntegrity || 90,
          systemUptime: Math.max(0, (current?.metrics.systemUptime || 95) - 2),
        };
        delta = -2;
        message = "⏱️ Action delayed — missed SLA window. Trust Level decreased slightly.";
        break;

      default:
        return;
    }

    const record = updateTrust(newMetrics);

    toast({
      title: message,
      description: `Trust Level: ${record.score} (${delta > 0 ? '+' : ''}${delta})`,
      duration: 3000,
    });

    setTimeout(() => setIsAnimating(false), 700);
  };

  const resetToBaseline = () => {
    const baselineMetrics: TrustMetrics = {
      sentiment: 75,
      slaCompliance: 80,
      fxAccuracy: 85,
      legalIntegrity: 90,
      systemUptime: 95,
    };

    updateTrust(baselineMetrics);
    toast({
      title: "Trust Index Reset",
      description: "Restored to baseline levels.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Pattern 36 — Genie Trust Gauge</h1>
          <p className="text-muted-foreground text-lg">
            Dynamic confidence meter that visualizes user trust and system reliability as a living metric.
          </p>
        </div>

        {/* Live Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>
              Simulate Genie actions to see how trust level responds in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Gauge */}
            <div className="flex justify-center">
            {current && (
                <TrustGauge
                  score={current.score}
                  status={current.status}
                  metrics={current.metrics}
                  delta={current.delta}
                  size="lg"
                  showDetails
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => simulateAction("success")}
                disabled={isAnimating}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Successful Action
              </Button>
              <Button
                onClick={() => simulateAction("failure")}
                disabled={isAnimating}
                variant="outline"
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Failed Action
              </Button>
              <Button
                onClick={() => simulateAction("delay")}
                disabled={isAnimating}
                variant="outline"
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Delayed Action
              </Button>
              <Button
                onClick={resetToBaseline}
                disabled={isAnimating}
                variant="secondary"
              >
                Reset to Baseline
              </Button>
            </div>

            {/* Current Status */}
            {current && (
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Current Level: {current.score}/100</span>
                <Badge variant={current.status === "stable" ? "default" : current.status === "caution" ? "outline" : "destructive"}>
                  {current.status}
                </Badge>
                {current.delta !== 0 && (
                  <span className="flex items-center gap-1">
                    {current.delta > 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-orange-500" />
                    )}
                    {Math.abs(current.delta)} pts
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Trust Events</CardTitle>
              <CardDescription>
                Last {Math.min(5, history.length)} trust level changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 5).map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {record.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={record.status === "stable" ? "default" : record.status === "caution" ? "outline" : "destructive"}>
                            {record.status}
                          </Badge>
                          {record.delta !== 0 && (
                            <span className="text-sm flex items-center gap-1">
                              {record.delta > 0 ? (
                                <ArrowUp className="w-3 h-3 text-green-500" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-orange-500" />
                              )}
                              {Math.abs(record.delta)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary">Latest</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Behavior Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Trust Increases When:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Error-free payroll processing</li>
                  <li>Quick SLA resolutions</li>
                  <li>Accurate FX quotes delivered</li>
                  <li>User confirmations received</li>
                  <li>Timely system responses</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Trust Decreases When:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Failed or delayed payouts</li>
                  <li>SLA breaches occur</li>
                  <li>Validation errors detected</li>
                  <li>Missing compliance alerts</li>
                  <li>System downtime events</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Metric Breakdown</h3>
              <p className="text-sm text-muted-foreground mb-3">
                The trust score is composed of five weighted metrics:
              </p>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Sentiment</span>
                  <span className="text-muted-foreground">40% weight</span>
                </div>
                <div className="flex justify-between">
                  <span>SLA Compliance</span>
                  <span className="text-muted-foreground">25% weight</span>
                </div>
                <div className="flex justify-between">
                  <span>FX Accuracy</span>
                  <span className="text-muted-foreground">15% weight</span>
                </div>
                <div className="flex justify-between">
                  <span>Legal Integrity</span>
                  <span className="text-muted-foreground">10% weight</span>
                </div>
                <div className="flex justify-between">
                  <span>System Uptime</span>
                  <span className="text-muted-foreground">10% weight</span>
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
                <h3 className="font-semibold">Payroll Processing (F3/F11)</h3>
                <p className="text-sm text-muted-foreground">
                  Trust rises after accurate, on-time payroll runs with validated FX quotes.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Contract Management (F2)</h3>
                <p className="text-sm text-muted-foreground">
                  Boost for correct legal clause handling and timely e-sign completion.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Compliance Tracking (F6)</h3>
                <p className="text-sm text-muted-foreground">
                  Drops if missing document alerts are ignored or validation fails.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Support Resolution (F5)</h3>
                <p className="text-sm text-muted-foreground">
                  Increases when SLA breaches are prevented and tickets resolved quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieTrustGaugePattern;
