import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentInsightCarousel, InsightCardData } from "@/components/AgentInsightCarousel";
import KurtAvatar from "@/components/KurtAvatar";

const GenieInsightCarouselPattern = () => {
  const payrollInsights: InsightCardData[] = [
    {
      id: "accuracy",
      title: "Payroll Accuracy",
      metric: "100%",
      subtitle: "All payments processed correctly",
      icon: "✅",
      trend: {
        direction: "stable",
        value: "0% change",
      },
      details: {
        description:
          "Perfect accuracy maintained for the third consecutive month. All contractor payments were processed without errors or corrections needed.",
        additionalMetrics: [
          { label: "Total Payments", value: "12" },
          { label: "Errors", value: "0" },
          { label: "Corrections", value: "0" },
        ],
        recommendation:
          "Continue current verification processes. Your approval workflow is working excellently.",
      },
    },
    {
      id: "fx-fees",
      title: "FX Fees",
      metric: "1.2%",
      subtitle: "Average currency conversion cost",
      icon: "📉",
      trend: {
        direction: "down",
        value: "-0.3% vs last month",
      },
      details: {
        description:
          "Currency conversion fees have decreased due to favorable exchange rates and consolidated payment batching.",
        additionalMetrics: [
          { label: "Total FX Volume", value: "€52,430" },
          { label: "Total Fees Paid", value: "€629" },
          { label: "Savings vs. Last Month", value: "€157" },
        ],
        recommendation:
          "Consider batching payments on Tuesdays when EUR rates are typically more favorable.",
      },
    },
    {
      id: "payout-time",
      title: "Avg Payout Time",
      metric: "3.1h",
      subtitle: "From approval to completion",
      icon: "⏱️",
      trend: {
        direction: "up",
        value: "+0.4h vs last month",
      },
      progress: {
        value: 75,
        target: 100,
      },
      details: {
        description:
          "Payout processing time increased slightly due to additional compliance checks for new contractors in Spain.",
        additionalMetrics: [
          { label: "Fastest Payout", value: "1.2h" },
          { label: "Slowest Payout", value: "5.8h" },
          { label: "Target Time", value: "<3h" },
        ],
        recommendation:
          "Pre-validate new contractor documents during onboarding to reduce processing delays.",
      },
    },
    {
      id: "compliance",
      title: "Compliance Score",
      metric: "100%",
      subtitle: "0 issues detected",
      icon: "🧾",
      trend: {
        direction: "stable",
        value: "Maintained",
      },
      progress: {
        value: 100,
      },
      details: {
        description:
          "All payroll transactions passed compliance verification. No missing documents or policy violations detected.",
        additionalMetrics: [
          { label: "Documents Verified", value: "48" },
          { label: "Policy Checks", value: "124" },
          { label: "Audit Trail Entries", value: "89" },
        ],
        recommendation:
          "Excellent compliance posture. Schedule quarterly audit review to maintain standards.",
      },
    },
  ];

  const complianceInsights: InsightCardData[] = [
    {
      id: "checklist",
      title: "Checklist Completion",
      metric: "92%",
      icon: "✓",
      trend: {
        direction: "up",
        value: "+8% this week",
      },
      progress: {
        value: 92,
        target: 100,
      },
      details: {
        description: "Strong progress on compliance requirements. Only 2 items remaining.",
        additionalMetrics: [
          { label: "Completed Items", value: "23/25" },
          { label: "In Progress", value: "2" },
          { label: "Overdue", value: "0" },
        ],
        recommendation: "Focus on completing the Spain tax registration and UK contractor insurance verification.",
      },
    },
    {
      id: "expiring-docs",
      title: "Expiring Documents",
      metric: "3",
      subtitle: "In next 30 days",
      icon: "⚠️",
      trend: {
        direction: "stable",
        value: "Normal range",
      },
      details: {
        description: "Three contractor documents will expire within 30 days. Automated renewal reminders have been sent.",
        additionalMetrics: [
          { label: "Work Permits", value: "2" },
          { label: "Tax Certificates", value: "1" },
          { label: "Auto-Reminders Sent", value: "3" },
        ],
        recommendation: "Review expiring documents list and follow up with contractors next week.",
      },
    },
    {
      id: "audits",
      title: "Pending Audits",
      metric: "1",
      subtitle: "Spain Q4 review",
      icon: "📋",
      trend: {
        direction: "stable",
        value: "On schedule",
      },
      details: {
        description: "One audit scheduled for Spain operations. All required documentation is prepared and ready.",
        additionalMetrics: [
          { label: "Documents Prepared", value: "18/18" },
          { label: "Audit Date", value: "Dec 15, 2025" },
          { label: "Status", value: "Ready" },
        ],
        recommendation: "Schedule internal pre-audit review for Dec 10 to ensure everything is perfect.",
      },
    },
  ];

  const supportInsights: InsightCardData[] = [
    {
      id: "sla-resolution",
      title: "SLA Resolution Rate",
      metric: "94%",
      icon: "🎯",
      trend: {
        direction: "up",
        value: "+6% this month",
      },
      progress: {
        value: 94,
        target: 95,
      },
      details: {
        description: "Excellent improvement in SLA compliance. Nearly hitting target performance levels.",
        additionalMetrics: [
          { label: "Tickets Resolved On-Time", value: "47/50" },
          { label: "Avg Resolution Time", value: "2.3h" },
          { label: "Target SLA", value: "95%" },
        ],
        recommendation: "Maintain current response protocols. Consider adding one support agent during peak hours.",
      },
    },
    {
      id: "open-cases",
      title: "Open Cases",
      metric: "8",
      subtitle: "3 high priority",
      icon: "📬",
      trend: {
        direction: "down",
        value: "-4 vs yesterday",
      },
      details: {
        description: "Active case count is decreasing. High priority items are being addressed first.",
        additionalMetrics: [
          { label: "High Priority", value: "3" },
          { label: "Medium Priority", value: "3" },
          { label: "Low Priority", value: "2" },
        ],
        recommendation: "Focus resources on the 3 high priority cases to clear them within 24h.",
      },
    },
    {
      id: "avg-handling",
      title: "Avg Handling Time",
      metric: "18m",
      subtitle: "Per ticket resolution",
      icon: "⚡",
      trend: {
        direction: "down",
        value: "-3m vs last week",
      },
      details: {
        description: "Handling time is improving through better automation and knowledge base updates.",
        additionalMetrics: [
          { label: "Fastest Resolution", value: "5m" },
          { label: "Slowest Resolution", value: "45m" },
          { label: "Target", value: "<20m" },
        ],
        recommendation: "Excellent progress. Share best practices from fastest resolutions with the team.",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patterns
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Agent Insight Carousel (Summarized Highlights)
          </h1>
          <p className="text-muted-foreground mt-2">
            Multiple related insights in a concise, swipeable format within the chat thread
          </p>
        </div>

        {/* Pattern Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Pattern Behavior
            </CardTitle>
            <CardDescription>
              Transform static replies into micro-dashboards that drive clarity and action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Core Principle</h3>
              <p className="text-sm text-muted-foreground">
                "Clarity drives confidence." — Users absorb more when data feels approachable. 
                Genie's carousel transforms analytics into stories, not spreadsheets.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Key Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Horizontal scrollable cards with smooth animations</li>
                <li>Each card highlights a single metric, trend, or recommendation</li>
                <li>Click to expand full details in a contextual drawer</li>
                <li>Trend indicators (up/down/stable) for quick insights</li>
                <li>Progress bars for goal tracking</li>
                <li>Summary text beneath carousel for context</li>
                <li>Keyboard navigation support for accessibility</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <div className="space-y-8">
          {/* Payroll Example */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Payroll Insights Example</h2>
            
            <div className="flex gap-3 items-start bg-muted/30 p-6 rounded-lg">
              <KurtAvatar size="sm" />
              <div className="flex-1 space-y-4">
                <p className="text-sm">
                  <strong>Genie:</strong> "Here's your September payroll summary 👇"
                </p>
                
                <AgentInsightCarousel
                  insights={payrollInsights}
                  summary="Overall: Everything ran smoothly. Your Trust Index improved by +6."
                />
              </div>
            </div>
          </div>

          {/* Compliance Example */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Compliance Insights Example</h2>
            
            <div className="flex gap-3 items-start bg-muted/30 p-6 rounded-lg">
              <KurtAvatar size="sm" />
              <div className="flex-1 space-y-4">
                <p className="text-sm">
                  <strong>Genie:</strong> "Here's your compliance status overview 📋"
                </p>
                
                <AgentInsightCarousel
                  insights={complianceInsights}
                  summary="Great progress! Only 2 checklist items remaining."
                />
              </div>
            </div>
          </div>

          {/* Support Example */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Support Metrics Example</h2>
            
            <div className="flex gap-3 items-start bg-muted/30 p-6 rounded-lg">
              <KurtAvatar size="sm" />
              <div className="flex-1 space-y-4">
                <p className="text-sm">
                  <strong>Genie:</strong> "Your support team performance this week 🎧"
                </p>
                
                <AgentInsightCarousel
                  insights={supportInsights}
                  summary="Excellent improvement across all metrics. Keep it up!"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Carousel Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <h3 className="font-medium">Payroll Module</h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly summary: accuracy, FX fees, payout times, compliance scores
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="font-medium">Compliance Module</h3>
                  <p className="text-sm text-muted-foreground">
                    Checklist completion, expiring documents, pending audits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h3 className="font-medium">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Company-wide trust insights, satisfaction index, SLA scores
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎧</div>
                <div>
                  <h3 className="font-medium">Support Module</h3>
                  <p className="text-sm text-muted-foreground">
                    SLA resolutions, open cases, average handling time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieInsightCarouselPattern;
