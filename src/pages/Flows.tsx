import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Workflow, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const Flows = () => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const patterns = [
    {
      id: "genie-onboarding",
      name: "Genie-Led Conversational Onboarding",
      description: "AI-guided setup process where the agent asks questions and fills forms on behalf of the user",
      behavior: "Agent initiates conversation, validates inputs, and confirms actions before proceeding",
      components: ["KurtAvatar", "AIPromptInput", "VoiceTypeToggle"],
      states: ["idle", "listening", "processing", "confirming"],
      accessibility: "Full keyboard navigation, screen reader announcements for agent responses"
    },
    {
      id: "step-card-progress",
      name: "Step Card Stack + Progress Bar",
      description: "Sequential step cards with visual progress tracking",
      behavior: "Cards expand/collapse, progress updates on completion",
      components: ["StepCard", "ProgressBar"],
      states: ["pending", "active", "completed"],
      accessibility: "ARIA labels for progress, keyboard navigation between steps"
    },
    {
      id: "dashboard-genie-drawer",
      name: "Dashboard-Centered Layout + Collapsible Genie Drawer",
      description: "Agent-first view with expandable context drawer",
      behavior: "Smooth transition between agent-first and split view (50/50)",
      components: ["AgentDrawer", "DashboardDrawer"],
      states: ["agent-first", "split-view", "collapsed"],
      accessibility: "Focus management on drawer open/close"
    },
    {
      id: "contextual-drawer",
      name: "Contextual Drawer / Side Panel",
      description: "Slide-out panel for contextual information and actions",
      behavior: "Opens from right, shows relevant content based on current step",
      components: ["Sheet", "Drawer"],
      states: ["open", "closed", "loading"],
      accessibility: "Trap focus when open, ESC to close"
    },
    {
      id: "hover-toolbar",
      name: "Hover Quick Action Toolbar",
      description: "Contextual actions appear on hover over table rows or cards",
      behavior: "Fade in on hover, position relative to target",
      components: ["InlineToolbar"],
      states: ["hidden", "visible"],
      accessibility: "Keyboard accessible via focus"
    },
    {
      id: "inline-edit",
      name: "Inline Edit Table Cells",
      description: "Click to edit table cells directly without modal",
      behavior: "Transform to input on click, save on blur or Enter",
      components: ["InlineEditContext"],
      states: ["view", "edit", "saving"],
      accessibility: "Enter to edit, ESC to cancel, Tab to next field"
    },
    {
      id: "policy-tags",
      name: "Policy Tag Chips (Mini-Rules)",
      description: "Visual tags representing compliance rules and policies",
      behavior: "Clickable chips that show rule details in popover",
      components: ["Badge", "Popover"],
      states: ["default", "active", "hover"],
      accessibility: "Announced by screen readers, keyboard navigable"
    },
    {
      id: "narrated-insight",
      name: "Narrated Insight / Tooltip Bubble",
      description: "Contextual explanations that appear near UI elements",
      behavior: "Show on hover or focus, auto-dismiss or click to close",
      components: ["Tooltip", "FeedbackBubble"],
      states: ["hidden", "visible"],
      accessibility: "ARIA describedby for associated elements"
    },
    {
      id: "audit-trail",
      name: "Audit Trail Timeline",
      description: "Chronological log of all user and system actions",
      behavior: "Auto-updates as events occur, expandable entries",
      components: ["AgentTaskTimeline"],
      states: ["loading", "loaded", "empty"],
      accessibility: "Semantic time elements, announced updates"
    },
    {
      id: "smart-approval",
      name: "Confirmation Prompt + Smart Approval Modal",
      description: "Intelligent confirmation dialog that highlights changes and implications",
      behavior: "Shows diffs, requires explicit confirm, prevents accidental actions",
      components: ["AgentSmartConfirmation", "AlertDialog"],
      states: ["closed", "open", "confirming"],
      accessibility: "Focus on primary action, ESC to cancel"
    },
    {
      id: "dual-mode",
      name: "Dual Mode (Chat + Manual UI)",
      description: "Toggle between conversational and form-based input",
      behavior: "Seamless switch preserving context and partial input",
      components: ["VoiceTypeToggle", "AgentDualPathPrompt"],
      states: ["chat", "manual"],
      accessibility: "Mode announced on switch"
    },
    {
      id: "data-cards",
      name: "Data Summary Cards",
      description: "KPI and metric cards with consistent styling",
      behavior: "Hover effects, click for details",
      components: ["DataSummaryCard", "DashboardWidget"],
      states: ["default", "hover", "loading"],
      accessibility: "Semantic headings, announced values"
    },
    {
      id: "compliance-checklist",
      name: "Compliance Checklist Blocks",
      description: "Visual checklist for compliance requirements",
      behavior: "Check/uncheck items, show completion percentage",
      components: ["ComplianceChecklistBlock"],
      states: ["unchecked", "checked", "disabled"],
      accessibility: "Checkbox ARIA labels, progress announced"
    },
    {
      id: "notification-center",
      name: "Notification Center + SLA Alerts",
      description: "Centralized notifications with priority and SLA tracking",
      behavior: "Real-time updates, filterable by type, actionable alerts",
      components: ["NotificationCenter"],
      states: ["unread", "read", "dismissed"],
      accessibility: "Live region for new notifications"
    },
    {
      id: "adaptive-widget",
      name: "Adaptive Widget Grid (Dashboard)",
      description: "Responsive dashboard grid that adapts to screen size and content",
      behavior: "Drag and drop, auto-layout, persistent preferences",
      components: ["AdaptiveWidget", "WidgetGrid"],
      states: ["static", "dragging", "resizing"],
      accessibility: "Keyboard navigation between widgets"
    },
    {
      id: "contract-preview",
      name: "Contract Preview & E-Sign Modal",
      description: "Document viewer with signature collection",
      behavior: "Scroll to review, sign button enabled after full view",
      components: ["ContractPreviewModal", "SignatureFlow"],
      states: ["viewing", "signing", "signed"],
      accessibility: "Document structure announced, sign button clearly labeled"
    },
    {
      id: "fx-breakdown",
      name: "FX Breakdown Popover",
      description: "Detailed foreign exchange rate breakdown",
      behavior: "Popover shows rate source, fees, and calculation",
      components: ["FXBreakdownPopover"],
      states: ["closed", "open"],
      accessibility: "Announced values with currency symbols"
    },
    {
      id: "empty-state",
      name: "Empty State / Placeholder",
      description: "Helpful placeholder when no data exists",
      behavior: "Shows illustration, call to action, and helpful text",
      components: ["EmptyStateCard"],
      states: ["empty"],
      accessibility: "Clear messaging about empty state and next actions"
    }
  ];

  const flows = [
    {
      id: "f1-admin-onboarding",
      title: "Flow 1 — Admin Onboarding",
      description: "Complete end-to-end onboarding for system administrators: introduces Genie, captures company settings, sets up Mini-Rules, connects integrations, and lands in Dashboard v3",
      steps: 7,
      patterns: patterns.map(p => p.id),
      path: "/flows/admin/onboarding",
      comingSoon: false
    },
    {
      id: "f2-shortlist-to-contract",
      title: "Flow 2 — Admin Workflow",
      description: "From candidate shortlist to finalized contracts: Kurt guides through draft creation, document bundling & signature collection, compliance review, localized e-signatures, and onboarding completion with inline editing and conversational flow",
      steps: 7,
      patterns: ["genie-onboarding", "inline-edit", "contract-preview", "compliance-checklist", "audit-trail"],
      path: "/flows/contract-flow",
      comingSoon: false
    },
    {
      id: "f3-candidate-onboarding",
      title: "Flow 3 — Candidate Onboarding",
      description: "Candidate-facing onboarding: collects personal information, tax details, compliance requirements, and completes pre-employment data collection with Kurt guidance",
      steps: 5,
      patterns: ["genie-onboarding", "step-card-progress", "inline-edit"],
      path: "/candidate-onboarding/1",
      comingSoon: false
    },
    {
      id: "f4-worker-onboarding",
      title: "Flow 4 — Candidate Onboarding",
      description: "Post-contract onboarding for candidates: verify personal info, compliance docs, payroll setup, work agreements, and checklist completion guided by Kurt",
      steps: 7,
      patterns: ["genie-onboarding", "step-card-progress", "compliance-checklist"],
      path: "/flows/worker-onboarding",
      comingSoon: false
    },
    {
      id: "f5-candidate-checklist",
      title: "Flow 5 — Candidate Checklist",
      description: "Post-onboarding candidate checklist: guided progress, compliance states, payroll readiness, and AI help via Genie.",
      steps: 1,
      patterns: ["data-cards", "compliance-checklist", "genie-onboarding"],
      path: "/flows/candidate-dashboard",
      comingSoon: false
    },
    {
      id: "f2-1-admin-payroll",
      title: "Flow 2.1 — Admin Payroll",
      description: "From compliance review to payroll execution: Kurt guides through payroll batch creation, FX rate review, CFO approval workflow, and batch execution with real-time monitoring and conversational guidance",
      steps: 6,
      patterns: ["genie-onboarding", "fx-breakdown", "smart-approval", "audit-trail", "data-cards"],
      path: "/payroll-batch",
      comingSoon: false
    }
  ];

  const getPatternById = (id: string) => patterns.find(p => p.id === id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Flows</h1>
          <p className="text-muted-foreground">
            End-to-end workflows showing how patterns compose into complete user journeys
          </p>
        </div>

        {/* Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.filter(f => !f.comingSoon).map((flow) => (
            <Link key={flow.id} to={flow.path}>
              <Card className="hover:shadow-lg transition-all group h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all duration-200 group-hover:bg-amber-600 group-hover:border-amber-600">
                      <Workflow className="h-5 w-5 text-amber-600 dark:text-amber-400 transition-colors duration-200 group-hover:text-white" />
                    </div>
                    <CardTitle className="text-lg">{flow.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-3">{flow.description}</CardDescription>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <span className="font-medium">{flow.steps} steps</span>
                    <span>•</span>
                    <span>{flow.patterns.length} patterns</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {flow.patterns.slice(0, 3).map((patternId) => {
                      const pattern = getPatternById(patternId);
                      return (
                        <Badge
                          key={patternId}
                          variant="secondary"
                          className="cursor-pointer hover:bg-muted transition-colors text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedPattern(patternId);
                          }}
                        >
                          {pattern?.name}
                        </Badge>
                      );
                    })}
                    {flow.patterns.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        +{flow.patterns.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                    View flow
                    <ArrowLeft className="w-3.5 h-3.5 ml-1 rotate-180 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Pattern Detail Drawer */}
      <Sheet open={!!selectedPattern} onOpenChange={() => setSelectedPattern(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedPattern && (() => {
            const pattern = getPatternById(selectedPattern);
            if (!pattern) return null;
            
            return (
              <>
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl">{pattern.name}</SheetTitle>
                  <SheetDescription className="text-base">{pattern.description}</SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Behavior</h3>
                    <p className="text-sm text-muted-foreground">{pattern.behavior}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Components Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {pattern.components.map((comp) => (
                        <Badge key={comp} variant="outline">{comp}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">States</h3>
                    <div className="flex flex-wrap gap-2">
                      {pattern.states.map((state) => (
                        <Badge key={state} variant="secondary">{state}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Accessibility</h3>
                    <p className="text-sm text-muted-foreground">{pattern.accessibility}</p>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Flows;
