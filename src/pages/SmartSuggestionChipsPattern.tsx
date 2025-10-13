import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenieSuggestionChips } from "@/components/GenieSuggestionChips";
import { ArrowLeft, CheckCircle2, Eye, FileText, Edit, Settings, DollarSign, BarChart3, MessageSquare, AlertTriangle, Send, Download, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { patternLayout } from "@/styles/pattern-layout";
import KurtAvatar from "@/components/KurtAvatar";

const SmartSuggestionChipsPattern = () => {
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
            Pattern 22 — Genie Smart Suggestion Chips
          </CardTitle>
          <CardDescription className={patternLayout.headerDescription}>
            Instant, one-tap contextual actions that help users move faster through flows without typing
          </CardDescription>
        </div>

        <Card className={patternLayout.contentCard}>
          <CardHeader>
            <CardTitle className={patternLayout.demoTitle}>Live Examples</CardTitle>
            <CardDescription className={patternLayout.demoDescription}>
              Smart chips appear contextually after Genie responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Contract Review Context */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Context 1: Contract Review</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <KurtAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">
                      The draft contract for Alex Hansen (Norway) is ready.
                    </p>
                    <GenieSuggestionChips
                      chips={[
                        { label: "Approve & Send", icon: CheckCircle2, variant: "primary", tooltip: "Send contract for signature" },
                        { label: "Edit Clauses", icon: Edit, variant: "default", tooltip: "Modify contract terms" },
                        { label: "Preview Contract", icon: Eye, variant: "default", tooltip: "View full contract" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Run Context */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Context 2: Payroll Run</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <KurtAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">
                      September payroll summary prepared. Total payout $32,800 USD.
                    </p>
                    <GenieSuggestionChips
                      chips={[
                        { label: "View Breakdown", icon: FileText, variant: "default", tooltip: "See detailed breakdown" },
                        { label: "Edit Rates", icon: Settings, variant: "default", tooltip: "Adjust payment rates" },
                        { label: "Confirm Run", icon: DollarSign, variant: "primary", tooltip: "Execute payroll run" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Support Ticket Context */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Context 3: Support Ticket</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <KurtAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">
                      Contractor Sam reported a missing payment.
                    </p>
                    <GenieSuggestionChips
                      chips={[
                        { label: "View Ticket", icon: Eye, variant: "default", tooltip: "Open ticket details" },
                        { label: "Assign to Ops", icon: MessageSquare, variant: "default", tooltip: "Route to operations team" },
                        { label: "Set SLA Timer", icon: Calendar, variant: "info", tooltip: "Configure response deadline" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Insight Context */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Context 4: Dashboard Insight</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <KurtAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">
                      You're trending 8% over average contractor costs this quarter.
                    </p>
                    <GenieSuggestionChips
                      chips={[
                        { label: "View Breakdown", icon: BarChart3, variant: "default", tooltip: "See cost analysis" },
                        { label: "Explain Why", icon: MessageSquare, variant: "info", tooltip: "Get detailed explanation" },
                        { label: "Suggest Actions", icon: AlertTriangle, variant: "critical", tooltip: "Review cost-saving options" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* All Variants Showcase */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">All Chip Variants</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Default</p>
                  <GenieSuggestionChips
                    chips={[
                      { label: "View Details", icon: Eye, variant: "default" },
                      { label: "Edit", icon: Edit, variant: "default" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Primary</p>
                  <GenieSuggestionChips
                    chips={[
                      { label: "Confirm", icon: CheckCircle2, variant: "primary" },
                      { label: "Send", icon: Send, variant: "primary" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Info</p>
                  <GenieSuggestionChips
                    chips={[
                      { label: "Learn More", icon: MessageSquare, variant: "info" },
                      { label: "View Stats", icon: BarChart3, variant: "info" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Critical</p>
                  <GenieSuggestionChips
                    chips={[
                      { label: "Review Risk", icon: AlertTriangle, variant: "critical" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Disabled</p>
                  <GenieSuggestionChips
                    chips={[
                      { label: "Waiting Approval", variant: "disabled" },
                      { label: "Processing", variant: "disabled" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Max 5 Chips Demo */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Maximum Chips Display (5)</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <KurtAvatar size="sm" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">
                      Multiple actions available for this contract.
                    </p>
                    <GenieSuggestionChips
                      chips={[
                        { label: "Approve", icon: CheckCircle2, variant: "primary" },
                        { label: "Preview", icon: Eye, variant: "default" },
                        { label: "Edit", icon: Edit, variant: "default" },
                        { label: "Download", icon: Download, variant: "default" },
                        { label: "Send", icon: Send, variant: "default" },
                        { label: "This won't show", variant: "default" }, // 6th chip won't display
                      ]}
                    />
                  </div>
                </div>
              </div>
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
                  <span className={patternLayout.featureLabel}>Contextual Actions:</span> Chips appear based on conversation context with intelligent predictions
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>5 Visual Variants:</span> Default, Primary, Info, Critical, and Disabled states
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Optional Icons:</span> Visual clarity with Lucide icons for each action
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Tooltips:</span> Contextual explanations for each action on hover
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Smooth Animations:</span> Fade-in entrance, pulse feedback, and scale interactions
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Horizontal Scroll:</span> Clean overflow handling for multiple chips
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Toast Feedback:</span> Immediate confirmation when actions are triggered
                </div>
              </li>
              <li className={patternLayout.featureItem}>
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <div className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Smart Limiting:</span> Maximum 5 chips displayed for focused decision-making
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartSuggestionChipsPattern;
