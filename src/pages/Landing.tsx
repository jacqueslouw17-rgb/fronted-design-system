import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LayoutDashboard, UserPlus, ListChecks, PanelRightOpen, MousePointerClick, Tags, Shield as ShieldIcon, MessageSquare, ScrollText, CheckSquare, ToggleLeft, Link2, BarChart3, ClipboardCheck, Mic, Bell, LayoutGrid, FileText, DollarSign, Inbox, ShieldCheck, Sparkles as SparklesIcon, Brain, ListTodo, Clock, Activity, RefreshCw, Smile, Shield, Eye, UserCheck, History, Timer, Presentation, Gauge, CheckCircle, GitBranch, Lightbulb, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const patterns = [
    {
      title: "Onboarding Flow",
      description: "Voice-enabled user onboarding with step-by-step guidance",
      icon: UserPlus,
      path: "/onboarding",
      color: "text-blue-500"
    },
    {
      title: "Dashboard",
      description: "Interactive dashboard with widgets and Agent AI assistant",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "text-purple-500"
    },
    {
      title: "Step Card Stack",
      description: "Guided multi-step workflow with progress tracking and expandable cards",
      icon: ListChecks,
      path: "/step-card-pattern",
      color: "text-green-500"
    },
    {
      title: "Contextual Drawer",
      description: "Right-side panel for detailed views, contracts, payroll, and support tickets",
      icon: PanelRightOpen,
      path: "/contextual-drawer",
      color: "text-orange-500"
    },
    {
      title: "Hover Toolbar",
      description: "Quick action toolbar that appears on hover for instant access",
      icon: MousePointerClick,
      path: "/hover-toolbar",
      color: "text-pink-500"
    },
    {
      title: "Smart Tags",
      description: "Dynamic policy chips and mini-rules for automation and compliance",
      icon: Tags,
      path: "/smart-tags",
      color: "text-cyan-500"
    },
    {
      title: "Policy Tag Chips",
      description: "Always-visible rule indicators with status and Agent integration",
      icon: ShieldIcon,
      path: "/policy-tags",
      color: "text-indigo-500"
    },
    {
      title: "Narrated Insight",
      description: "Contextual tooltips and popovers with conversational Agent explanations",
      icon: MessageSquare,
      path: "/narrated-insight",
      color: "text-amber-500"
    },
    {
      title: "Audit Trail Timeline",
      description: "Chronological record of every action for accountability and trust",
      icon: ScrollText,
      path: "/audit-trail",
      color: "text-red-500"
    },
    {
      title: "Confirmation Modal",
      description: "Smart approval prompts with clear summaries before critical actions",
      icon: CheckSquare,
      path: "/confirmation-modal",
      color: "text-teal-500"
    },
    {
      title: "Dual Mode",
      description: "Complete tasks via chat or manual UI — seamlessly synced",
      icon: ToggleLeft,
      path: "/dual-mode",
      color: "text-violet-500"
    },
    {
      title: "Quick Links Hover Bar",
      description: "Context actions appear on hover — clean by default, powerful when needed",
      icon: Link2,
      path: "/quick-links",
      color: "text-emerald-500"
    },
    {
      title: "Data Summary Cards",
      description: "Key metrics and insights in compact, expandable cards — clarity first",
      icon: BarChart3,
      path: "/data-summary",
      color: "text-sky-500"
    },
    {
      title: "Compliance Checklist",
      description: "Modular compliance blocks with country-specific verification and Agent validation",
      icon: ClipboardCheck,
      path: "/compliance-checklist",
      color: "text-lime-500"
    },
    {
      title: "Voice/Type Toggle",
      description: "Switch between voice and text input for natural Agent interactions",
      icon: Mic,
      path: "/voice-type-toggle",
      color: "text-rose-500"
    },
    {
      title: "Notification Center + SLA Alerts",
      description: "Centralized system alerts with SLA timers and Agent notifications",
      icon: Bell,
      path: "/notification-center",
      color: "text-fuchsia-500"
    },
    {
      title: "Adaptive Widget Grid",
      description: "Personalized, draggable, resizable dashboard widgets with role-based layouts",
      icon: LayoutGrid,
      path: "/adaptive-widget-grid",
      color: "text-slate-500"
    },
    {
      title: "Contract Preview & E-Sign",
      description: "In-line contract review and e-signature modal with Agent-powered clause verification",
      icon: FileText,
      path: "/contract-preview",
      color: "text-yellow-500"
    },
    {
      title: "FX Breakdown Popover",
      description: "Transparent currency conversion details with spot rates, spreads, fees, and AI insights",
      icon: DollarSign,
      path: "/fx-breakdown",
      color: "text-green-600"
    },
    {
      title: "Empty State / Placeholder",
      description: "Helpful placeholders that guide users toward their next action",
      icon: Inbox,
      path: "/empty-state",
      color: "text-gray-500"
    },
    {
      title: "Agent Confirmation Card",
      description: "Structured confirmation moments with visual checkpoints for impactful actions",
      icon: ShieldCheck,
      path: "/genie-confirmation",
      color: "text-blue-600"
    },
    {
      title: "Agent Smart Suggestion Chips",
      description: "Instant, one-tap contextual actions that help users move faster through flows",
      icon: SparklesIcon,
      path: "/smart-suggestion-chips",
      color: "text-violet-600"
    },
    {
      title: "Agent Memory Thread",
      description: "Context persistence and recall across sessions — makes Agent feel intelligent",
      icon: Brain,
      path: "/genie-memory-thread",
      color: "text-purple-600"
    },
    {
      title: "Agent Confirmation Queue",
      description: "Pending actions manager for reviewing and confirming Agent-initiated tasks",
      icon: ListTodo,
      path: "/genie-confirmation-queue",
      color: "text-amber-600"
    },
    {
      title: "Agent Contextual Timeline",
      description: "Real-time event bridge connecting all Agent actions into a visible stream",
      icon: Clock,
      path: "/genie-contextual-timeline",
      color: "text-cyan-600"
    },
    {
      title: "Smart Progress",
      description: "Multi-step process tracker with countdown timers and live pulse animations",
      icon: Activity,
      path: "/smart-progress",
      color: "text-teal-600"
    },
    {
      title: "Agent Context Pivot Switcher",
      description: "Seamlessly switch between entity contexts with separate memory threads",
      icon: RefreshCw,
      path: "/genie-context-pivot",
      color: "text-emerald-600"
    },
      {
        title: "Agent Smart Recap",
        description: "Session summaries with contextual next steps and action tracking",
        icon: SparklesIcon,
        path: "/genie-smart-recap",
        color: "text-pink-600"
      },
      {
        title: "Agent Reaction Cards",
        description: "Sentiment feedback loop with lightweight emojis",
        icon: Smile,
        path: "/genie-reaction-cards",
        color: "text-rose-600"
      },
      {
        title: "Trust Index Gauge",
        description: "Visual confidence signal with composite trust scoring",
        icon: Shield,
        path: "/trust-index-gauge",
        color: "text-indigo-700"
      },
      {
        title: "Dynamic Role Lens",
        description: "Role-based UI adaptation with personalized widgets and tone",
        icon: Eye,
        path: "/dynamic-role-lens",
        color: "text-violet-700"
      },
      {
        title: "Agent Action Confirmations (HITL)",
        description: "Human-in-the-loop inline confirmations for high-impact actions",
        icon: UserCheck,
        path: "/genie-action-confirmations",
        color: "text-sky-700"
      },
      {
        title: "Agent Context Tracker",
        description: "Persistent conversation awareness with context switching and memory",
        icon: History,
        path: "/genie-context-tracker",
        color: "text-teal-700"
      },
      {
        title: "Agent Task Timeline",
        description: "Transparent, real-time view of every background action with step-by-step confidence",
        icon: Timer,
        path: "/genie-task-timeline",
        color: "text-orange-700"
      },
      {
        title: "Agent Insight Carousel",
        description: "Multiple related insights in a swipeable, horizontal carousel format",
        icon: Presentation,
        path: "/genie-insight-carousel",
        color: "text-blue-700"
      },
      {
        title: "Agent Trust Gauge",
        description: "Visualize user trust and system confidence as a living, evolving metric",
        icon: Gauge,
        path: "/genie-trust-gauge",
        color: "text-purple-700"
      },
      {
        title: "Agent Smart Confirmation",
        description: "Structured review moments before significant actions with clear summaries",
        icon: CheckCircle,
        path: "/genie-smart-confirmation",
        color: "text-green-700"
      },
      {
        title: "Agent Dual Path Suggestion",
        description: "Choose between AI automation and manual control for every workflow",
        icon: GitBranch,
        path: "/genie-dual-path-suggestion",
        color: "text-cyan-700"
      },
      {
        title: "Agent Predictive Hint Bar",
        description: "Intelligent next-action suggestions based on context and system state",
        icon: Lightbulb,
        path: "/genie-predictive-hint-bar",
        color: "text-yellow-700"
      },
      {
        title: "Agent Multi-Step Recall Thread",
        description: "Pause, remember, and resume multi-step processes without losing context",
        icon: RotateCcw,
        path: "/genie-multi-step-recall",
        color: "text-pink-700"
      }
    ];
const normalizedPatterns = patterns.map(p => ({
  ...p,
  path: p.path.startsWith("/genie-") ? p.path.replace("/genie-", "/agent-") : p.path
}));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold">Design System</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Explore interface patterns and interactions for modern AI agent applications
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {normalizedPatterns.map((pattern) => {
            const Icon = pattern.icon;
            return (
              <Link key={pattern.path} to={pattern.path}>
                <Card className="h-full transition-all duration-300 group cursor-pointer border border-border/60 hover:border-primary/20 hover:shadow-elevated hover:-translate-y-1">
                  <CardHeader className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md bg-muted/50 group-hover:bg-gradient-primary transition-all duration-300 flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${pattern.color} group-hover:text-primary-foreground transition-colors duration-300`} strokeWidth={2} />
                      </div>
                      <CardTitle className="text-base font-semibold leading-snug">{pattern.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {pattern.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      View pattern
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Landing;
