import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { TrustGauge, TrustGaugeMini } from "@/components/TrustIndexGauge";
import { useTrustIndex, type TrustMetrics } from "@/hooks/useTrustIndex";

const TrustIndexGaugePattern: React.FC = () => {
  const { current, history, updateTrust, clearHistory } = useTrustIndex();

  const [metrics, setMetrics] = useState<TrustMetrics>({
    sentiment: 85,
    slaCompliance: 92,
    fxAccuracy: 98,
    legalIntegrity: 88,
    systemUptime: 99,
  });

  const handleUpdate = () => {
    updateTrust(metrics);
  };

  const handleMetricChange = (key: keyof TrustMetrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const simulateScenario = (scenario: "payroll-success" | "sla-breach" | "high-sentiment") => {
    let newMetrics = { ...metrics };
    
    switch (scenario) {
      case "payroll-success":
        newMetrics = {
          sentiment: Math.min(100, metrics.sentiment + 3),
          slaCompliance: Math.min(100, metrics.slaCompliance + 2),
          fxAccuracy: 99,
          legalIntegrity: metrics.legalIntegrity,
          systemUptime: 99,
        };
        break;
      case "sla-breach":
        newMetrics = {
          ...metrics,
          slaCompliance: Math.max(0, metrics.slaCompliance - 15),
        };
        break;
      case "high-sentiment":
        newMetrics = {
          ...metrics,
          sentiment: Math.min(100, metrics.sentiment + 10),
        };
        break;
    }
    
    setMetrics(newMetrics);
    updateTrust(newMetrics);
  };

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
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trust Index Gauge</h1>
            <p className="text-muted-foreground">Pattern 30 — Visual confidence signal</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Purpose
            </CardTitle>
            <CardDescription>
              Quantify how confident users feel in Fronted's reliability, clarity, and responsiveness through a
              composite trust score (0-100) derived from sentiment, SLA compliance, FX accuracy, legal integrity, and
              system uptime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Key Components</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">TrustGauge</Badge>
                <Badge variant="outline">CircularGauge</Badge>
                <Badge variant="outline">MetricsBreakdown</Badge>
                <Badge variant="outline">StatusBadge</Badge>
                <Badge variant="outline">DeltaIndicator</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2">Behavior</h4>
              <p className="text-sm text-muted-foreground">
                The gauge updates in real-time as metrics change. Score &gt;85 = green (stable), 60-84 = amber
                (caution), &lt;60 = red (alert). Hover or click to reveal detailed driver breakdown with weighted
                contributions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Demo */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>Adjust metrics to see the trust index update in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Current Gauge */}
            <div className="flex flex-col items-center gap-6 py-6">
              {current ? (
                <>
                  <TrustGauge
                    score={current.score}
                    status={current.status}
                    metrics={current.metrics}
                    delta={current.delta}
                    size="lg"
                  />
                  <div className="text-sm text-muted-foreground">
                    Click the gauge to view detailed metrics breakdown
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>No trust index recorded yet.</p>
                  <p className="text-xs mt-1">Adjust metrics below and click "Update Trust Index"</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Metric Controls */}
            <div className="space-y-6">
              <h4 className="text-sm font-semibold">Adjust Trust Drivers</h4>

              <div className="grid gap-6">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([v]) => handleMetricChange(key as keyof TrustMetrics, v)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleUpdate} className="flex-1">
                  Update Trust Index
                </Button>
                <Button variant="outline" onClick={clearHistory}>
                  Clear History
                </Button>
              </div>
            </div>

            <Separator />

            {/* Quick Scenarios */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Quick Scenarios</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => simulateScenario("payroll-success")}>
                  ✅ Payroll Success
                </Button>
                <Button variant="outline" size="sm" onClick={() => simulateScenario("sla-breach")}>
                  ⚠️ SLA Breach
                </Button>
                <Button variant="outline" size="sm" onClick={() => simulateScenario("high-sentiment")}>
                  😊 High Sentiment
                </Button>
              </div>
            </div>

            <Separator />

            {/* History */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Recent History</h4>
              <div className="space-y-2">
                {history.length === 0 && (
                  <div className="text-xs text-muted-foreground">No history yet. Update the index to see trends.</div>
                )}
                {history.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-2 rounded border">
                    <TrustGaugeMini record={record} />
                    <div className="text-xs text-muted-foreground">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </div>
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
            <div>• Dashboard: Top-right widget showing overall system confidence.</div>
            <div>• Payroll (F3/F11): Inline gauge in approval modal showing cycle trust.</div>
            <div>• Compliance (F6): Confidence in document validity and audit trail.</div>
            <div>• Support (F5): SLA breaches visibly impact the index.</div>
            <div>• Analytics (F13): Historical trust trends in CFO insight deck.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrustIndexGaugePattern;
