import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentConfirmationCard } from "@/components/AgentConfirmationCard";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { patternLayout } from "@/styles/pattern-layout";

const GenieConfirmationCardPattern = () => {
  return (
    <div className={patternLayout.container}>
      <div className={patternLayout.wrapper}>
        <Link to="/">
          <Button variant="ghost" size="sm" className={patternLayout.backButton}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to overview</span>
          </Button>
        </Link>

        <div className={patternLayout.header}>
          <CardTitle className={patternLayout.headerTitle}>
            Pattern 21 — Genie Confirmation Card
          </CardTitle>
          <CardDescription className={patternLayout.headerDescription}>
            Structured confirmation moments inside Genie for impactful actions with clear visual checkpoints
          </CardDescription>
        </div>

        <Card className={patternLayout.contentCard}>
          <CardHeader>
            <CardTitle className={patternLayout.demoTitle}>Live Examples</CardTitle>
            <CardDescription className={patternLayout.demoDescription}>
              Explore different severity levels and use cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Default Action</h3>
              <AgentConfirmationCard
                title="Send Contract for Signature"
                summary="Alex Hansen – Remote Engineer (Norway)"
                details={[
                  "Contract type: Full-time employment",
                  "Start date: January 15, 2025",
                  "Annual salary: $95,000 USD",
                ]}
                confirmLabel="Send Now"
                cancelLabel="Review Again"
                agentHint="I'll notify Ioana once signed."
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Warning (Financial Impact)</h3>
              <AgentConfirmationCard
                title="Confirm Payroll Run"
                summary="You're about to pay 5 contractors a total of $32,800 USD."
                details={[
                  "FX fee: ≈ $112",
                  "Tax estimate: $2,190",
                  "Net transfer: $30,498",
                ]}
                severity="warning"
                confirmLabel="Confirm Run"
                impactTooltip="This will trigger immediate payouts via Wise to all contractors."
                agentHint="Would you like to notify your CFO too?"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Critical (Legal/Compliance Impact)</h3>
              <AgentConfirmationCard
                title="Terminate Contract"
                summary="This action will permanently end the employment contract with Maria Santos."
                details={[
                  "Final payment: $4,200 due",
                  "Notice period: 30 days",
                  "Compliance check: All documents submitted",
                  "Severance: Not applicable",
                ]}
                severity="critical"
                confirmLabel="Confirm Termination"
                cancelLabel="Cancel"
                impactTooltip="This is a legally binding action that cannot be undone. All relevant parties will be notified."
                agentHint="I can help draft the termination letter if needed."
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Completed State</h3>
              <AgentConfirmationCard
                title="Payroll Run Completed"
                summary="September payroll has been successfully processed for 5 contractors."
                severity="completed"
              />
            </div>
          </CardContent>
        </Card>

        <Card className={patternLayout.contentCard}>
          <CardHeader>
            <CardTitle className={patternLayout.demoTitle}>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={patternLayout.featuresList}>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Severity Variants:</span> Default, Warning, Critical, and Completed states with visual cues
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Expandable Details:</span> Optional breakdown section for complex actions
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Impact Tooltips:</span> Contextual information about action consequences
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Genie Hints:</span> Proactive suggestions and follow-up actions
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Toast Feedback:</span> Immediate confirmation or cancellation messages
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Smooth Animations:</span> Scale-in entrance with fade transitions
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieConfirmationCardPattern;
