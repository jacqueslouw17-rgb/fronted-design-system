import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { componentsRegistry, ComponentReference } from "@/data/componentsRegistry";
import { ComponentDetailDrawer } from "@/components/design-system/ComponentDetailDrawer";
import { PatternDetailDrawer } from "@/components/design-system/PatternDetailDrawer";
import { ArrowRight, LayoutDashboard, UserPlus, ListChecks, PanelRightOpen, MousePointerClick, Tags, Shield as ShieldIcon, MessageSquare, ScrollText, CheckSquare, ToggleLeft, Link2, BarChart3, ClipboardCheck, Mic, Bell, LayoutGrid, FileText, DollarSign, Inbox, ShieldCheck, Sparkles as SparklesIcon, Brain, ListTodo, Clock, Activity, RefreshCw, Smile, Shield, Eye, UserCheck, History, Timer, Presentation, Gauge, CheckCircle, GitBranch, Lightbulb, RotateCcw, Workflow, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { getComponentsByPattern } from "@/data/componentsRegistry";
const patterns = [{
  title: "Onboarding Flow",
  description: "Voice-enabled user onboarding with step-by-step guidance",
  icon: UserPlus,
  path: "/patterns/onboarding-flow",
  color: "text-blue-500"
}, {
  title: "Dashboard",
  description: "Interactive dashboard with widgets and Agent AI assistant",
  icon: LayoutDashboard,
  path: "/dashboard",
  color: "text-purple-500"
}, {
  title: "Step Card Stack",
  description: "Guided multi-step workflow with progress tracking and expandable cards",
  icon: ListChecks,
  path: "/step-card-pattern",
  color: "text-green-500"
}, {
  title: "Contextual Drawer",
  description: "Right-side panel for detailed views, contracts, payroll, and support tickets",
  icon: PanelRightOpen,
  path: "/contextual-drawer",
  color: "text-orange-500"
}, {
  title: "Hover Toolbar",
  description: "Quick action toolbar that appears on hover for instant access",
  icon: MousePointerClick,
  path: "/hover-toolbar",
  color: "text-pink-500"
}, {
  title: "Smart Tags",
  description: "Dynamic policy chips and mini-rules for automation and compliance",
  icon: Tags,
  path: "/smart-tags",
  color: "text-cyan-500"
}, {
  title: "Policy Tag Chips",
  description: "Always-visible rule indicators with status and Agent integration",
  icon: ShieldIcon,
  path: "/policy-tags",
  color: "text-indigo-500"
}, {
  title: "Narrated Insight",
  description: "Contextual tooltips and popovers with conversational Agent explanations",
  icon: MessageSquare,
  path: "/narrated-insight",
  color: "text-amber-500"
}, {
  title: "Audit Trail Timeline",
  description: "Chronological record of every action for accountability and trust",
  icon: ScrollText,
  path: "/audit-trail",
  color: "text-red-500"
}, {
  title: "Confirmation Modal",
  description: "Smart approval prompts with clear summaries before critical actions",
  icon: CheckSquare,
  path: "/confirmation-modal",
  color: "text-teal-500"
}, {
  title: "Dual Mode",
  description: "Complete tasks via chat or manual UI — seamlessly synced",
  icon: ToggleLeft,
  path: "/dual-mode",
  color: "text-violet-500"
}, {
  title: "Quick Links Hover Bar",
  description: "Context actions appear on hover — clean by default, powerful when needed",
  icon: Link2,
  path: "/quick-links",
  color: "text-emerald-500"
}, {
  title: "Data Summary Cards",
  description: "Key metrics and insights in compact, expandable cards — clarity first",
  icon: BarChart3,
  path: "/data-summary",
  color: "text-sky-500"
}, {
  title: "Compliance Checklist",
  description: "Modular compliance blocks with country-specific verification and Agent validation",
  icon: ClipboardCheck,
  path: "/compliance-checklist",
  color: "text-lime-500"
}, {
  title: "Voice/Type Toggle",
  description: "Switch between voice and text input for natural Agent interactions",
  icon: Mic,
  path: "/voice-type-toggle",
  color: "text-rose-500"
}, {
  title: "Notification Center + SLA Alerts",
  description: "Centralized system alerts with SLA timers and Agent notifications",
  icon: Bell,
  path: "/notification-center",
  color: "text-fuchsia-500"
}, {
  title: "Adaptive Widget Grid",
  description: "Personalized, draggable, resizable dashboard widgets with role-based layouts",
  icon: LayoutGrid,
  path: "/adaptive-widget-grid",
  color: "text-slate-500"
}, {
  title: "Contract Preview & E-Sign",
  description: "In-line contract review and e-signature modal with Agent-powered clause verification",
  icon: FileText,
  path: "/contract-preview",
  color: "text-yellow-500"
}, {
  title: "FX Breakdown Popover",
  description: "Transparent currency conversion details with spot rates, spreads, fees, and AI insights",
  icon: DollarSign,
  path: "/fx-breakdown",
  color: "text-green-600"
}, {
  title: "Empty State / Placeholder",
  description: "Helpful placeholders that guide users toward their next action",
  icon: Inbox,
  path: "/empty-state",
  color: "text-gray-500"
}, {
  title: "Agent Confirmation Card",
  description: "Structured confirmation moments with visual checkpoints for impactful actions",
  icon: ShieldCheck,
  path: "/genie-confirmation",
  color: "text-blue-600"
}, {
  title: "Agent Smart Suggestion Chips",
  description: "Instant, one-tap contextual actions that help users move faster through flows",
  icon: SparklesIcon,
  path: "/smart-suggestion-chips",
  color: "text-violet-600"
}, {
  title: "Agent Memory Thread",
  description: "Context persistence and recall across sessions — makes Agent feel intelligent",
  icon: Brain,
  path: "/genie-memory-thread",
  color: "text-purple-600"
}, {
  title: "Agent Confirmation Queue",
  description: "Pending actions manager for reviewing and confirming Agent-initiated tasks",
  icon: ListTodo,
  path: "/genie-confirmation-queue",
  color: "text-amber-600"
}, {
  title: "Agent Contextual Timeline",
  description: "Real-time event bridge connecting all Agent actions into a visible stream",
  icon: Clock,
  path: "/genie-contextual-timeline",
  color: "text-cyan-600"
}, {
  title: "Smart Progress",
  description: "Multi-step process tracker with countdown timers and live pulse animations",
  icon: Activity,
  path: "/smart-progress",
  color: "text-teal-600"
}, {
  title: "Agent Context Pivot Switcher",
  description: "Seamlessly switch between entity contexts with separate memory threads",
  icon: RefreshCw,
  path: "/genie-context-pivot",
  color: "text-emerald-600"
}, {
  title: "Agent Smart Recap",
  description: "Session summaries with contextual next steps and action tracking",
  icon: SparklesIcon,
  path: "/genie-smart-recap",
  color: "text-pink-600"
}, {
  title: "Agent Reaction Cards",
  description: "Sentiment feedback loop with lightweight emojis",
  icon: Smile,
  path: "/genie-reaction-cards",
  color: "text-rose-600"
}, {
  title: "Trust Index Gauge",
  description: "Visual confidence signal with composite trust scoring",
  icon: Shield,
  path: "/trust-index-gauge",
  color: "text-indigo-700"
}, {
  title: "Dynamic Role Lens",
  description: "Role-based UI adaptation with personalized widgets and tone",
  icon: Eye,
  path: "/dynamic-role-lens",
  color: "text-violet-700"
}, {
  title: "Agent Action Confirmations",
  description: "Human-in-the-loop inline confirmations for high-impact actions",
  icon: UserCheck,
  path: "/genie-action-confirmations",
  color: "text-sky-700"
}, {
  title: "Agent Context Tracker",
  description: "Persistent conversation awareness with context switching and memory",
  icon: History,
  path: "/genie-context-tracker",
  color: "text-teal-700"
}, {
  title: "Agent Task Timeline",
  description: "Transparent, real-time view of every background action with step-by-step confidence",
  icon: Timer,
  path: "/genie-task-timeline",
  color: "text-orange-700"
}, {
  title: "Agent Insight Carousel",
  description: "Multiple related insights in a swipeable, horizontal carousel format",
  icon: Presentation,
  path: "/genie-insight-carousel",
  color: "text-blue-700"
}, {
  title: "Agent Trust Gauge",
  description: "Visualize user trust and system confidence as a living, evolving metric",
  icon: Gauge,
  path: "/genie-trust-gauge",
  color: "text-purple-700"
}, {
  title: "Agent Smart Confirmation",
  description: "Structured review moments before significant actions with clear summaries",
  icon: CheckCircle,
  path: "/genie-smart-confirmation",
  color: "text-green-700"
}, {
  title: "Agent Dual Path Suggestion",
  description: "Choose between AI automation and manual control for every workflow",
  icon: GitBranch,
  path: "/genie-dual-path-suggestion",
  color: "text-cyan-700"
}, {
  title: "Agent Predictive Hint Bar",
  description: "Intelligent next-action suggestions based on context and system state",
  icon: Lightbulb,
  path: "/genie-predictive-hint-bar",
  color: "text-yellow-700"
}, {
  title: "Agent Multi-Step Recall Thread",
  description: "Pause, remember, and resume multi-step processes without losing context",
  icon: RotateCcw,
  path: "/genie-multi-step-recall",
  color: "text-pink-700"
}, {
  title: "Contextual Inline Actions",
  description: "AI-assisted inline editing with contextual suggestions and decision flows",
  icon: SparklesIcon,
  path: "/patterns/contextual-inline-actions",
  color: "text-indigo-700"
}];
const normalizedPatterns = patterns.map(p => ({
  ...p,
  path: p.path.startsWith("/genie-") ? p.path.replace("/genie-", "/agent-") : p.path
}));
const DesignSystem = () => {
  const [selectedComponent, setSelectedComponent] = useState<ComponentReference | null>(null);
  const [componentDrawerOpen, setComponentDrawerOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<typeof normalizedPatterns[0] | null>(null);
  const [patternDrawerOpen, setPatternDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "flows" || tabParam === "components" ? tabParam : "patterns";
  const handleComponentClick = (componentId: string) => {
    const component = componentsRegistry.find(c => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
      setComponentDrawerOpen(true);
    }
  };
  const handlePatternClick = (patternPath: string) => {
    const pattern = normalizedPatterns.find(p => p.path === patternPath);
    if (pattern) {
      setSelectedPattern(pattern);
      setPatternDrawerOpen(true);
    }
  };
  return <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold">Design System</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Unified library of Patterns and Components for the Fronted Agent platform
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="flows">Flows</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {normalizedPatterns.map(pattern => {
              const Icon = pattern.icon;
              const linkedComponents = getComponentsByPattern(pattern.path.replace('/agent-', 'genie-'));
              return <Link key={pattern.path} to={pattern.path}>
                    <Card className="h-full transition-all duration-300 group cursor-pointer border border-border/60 hover:border-primary/20 hover:shadow-elevated hover:-translate-y-1 flex flex-col">
                      <CardHeader className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md bg-muted/50 group-hover:bg-gradient-primary transition-all duration-300 flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${pattern.color} group-hover:text-primary-foreground transition-colors duration-300`} strokeWidth={2} />
                          </div>
                          <CardTitle className="text-base font-semibold leading-snug">{pattern.title}</CardTitle>
                        </div>
                        <CardDescription className="text-xs leading-relaxed">
                          {pattern.description}
                        </CardDescription>
                        {linkedComponents.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">
                            {linkedComponents.slice(0, 3).map(comp => <Badge key={comp.id} variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleComponentClick(comp.id);
                      }}>
                                {comp.name}
                              </Badge>)}
                            {linkedComponents.length > 3 && <Badge variant="outline" className="text-xs">
                                +{linkedComponents.length - 3}
                              </Badge>}
                          </div>}
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          View pattern
                          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>;
            })}
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/flows/admin/onboarding">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all duration-200 group-hover:bg-amber-600 group-hover:border-amber-600">
                        <Workflow className="h-5 w-5 text-amber-600 dark:text-amber-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 1 — Admin Onboarding</CardTitle>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                        🔒
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Complete end-to-end onboarding for system administrators: introduces Genie, captures company settings, sets up Mini-Rules, connects integrations, and lands in Dashboard v3
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">7 steps</span>
                      <span>•</span>
                      <span>18 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational Onboarding
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/step-card-pattern');
                    }}>
                        Step Card Stack + Progress Bar
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/dashboard');
                    }}>
                        Dashboard-Centered Layout + Collapsible Genie Drawer
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +15
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        View flow
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <a href="/docs/Flow1_Admin_Onboarding_Data_Model.md" download="Flow1_Admin_Onboarding_Data_Model.md" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                        Data Model
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/flows/contract-flow">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition-all duration-200 group-hover:bg-emerald-600 group-hover:border-emerald-600">
                        <Workflow className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 2 - Admin Contracting</CardTitle>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                        🔒
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      From candidate shortlist to finalized contracts: Kurt guides through draft creation, compliance review, localized e-signatures, and onboarding completion with inline editing and conversational flow
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">6 steps</span>
                      <span>•</span>
                      <span>5 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/contract-preview');
                    }}>
                        Contract Preview & E-Sign
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +3
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        View flow
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <a href="/docs/Flow2_Admin_Contracting_Data_Model.md" download="Flow2_Admin_Contracting_Data_Model.md" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                        Data Model
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/candidate-onboarding">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 transition-all duration-200 group-hover:bg-violet-600 group-hover:border-violet-600">
                        <UserCheck className="h-5 w-5 text-violet-600 dark:text-violet-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 3 - Candidate Data Collection</CardTitle>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                        🔒
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Transition candidates from offer acceptance to contract-ready status: collect personal, tax, and banking details with Genie validation, compliance checking, and ATS integration
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">4 steps</span>
                      <span>•</span>
                      <span>4 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/confirmation-modal');
                    }}>
                        Smart Approval
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/compliance-checklist');
                    }}>
                        Compliance Checklist
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +1
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        View flow
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <a href="/docs/Flow3_Candidate_Data_Collection_Data_Model.md" download="Flow3_Candidate_Data_Collection_Data_Model.md" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                        Data Model
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/worker-onboarding">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition-all duration-200 group-hover:bg-emerald-600 group-hover:border-emerald-600">
                        <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 4 — Candidate Onboarding</CardTitle>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                        🔒
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Post-contract onboarding for workers: verify personal info, upload compliance docs, set up payroll, complete work setup, and review onboarding checklist for a smooth first day. Locked for backend build — no further changes allowed.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">7 steps</span>
                      <span>•</span>
                      <span>5 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Step Card Stack + Progress Bar
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/compliance-checklist');
                    }}>
                        Compliance Checklist
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/smart-progress');
                    }}>
                        Checklist Progress
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +2
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        View flow
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <a href="/docs/Flow4_Candidate_Onboarding_Data_Model.md" download="Flow4_Candidate_Onboarding_Data_Model.md" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                        Data Model
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/candidate-dashboard">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 transition-all duration-200 group-hover:bg-blue-600 group-hover:border-blue-600">
                        <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 5 — Candidate Dashboard</CardTitle>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                        🔒
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Post-onboarding candidate dashboard: contract review & signing with DocuSign sub-statuses, document management, and certification tracking. Locked — finalized flow.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">2 steps</span>
                      <span>•</span>
                      <span>3 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/data-summary');
                    }}>
                        Data Summary Cards
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/compliance-checklist');
                    }}>
                        Compliance Checklist
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        View flow
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <a href="/docs/Flow5_Candidate_Dashboard_Data_Model.md" download="Flow5_Candidate_Dashboard_Data_Model.md" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                        Data Model
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/contract-flow-multi-company">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 transition-all duration-200 group-hover:bg-cyan-600 group-hover:border-cyan-600">
                        <Workflow className="h-5 w-5 text-cyan-600 dark:text-cyan-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 2.1 — Fronted Admin Contra         </CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Multi-company version of Flow 2: Switch between companies and manage contracts across multiple organizations. Includes company switcher dropdown with 'Add New Company' action.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">7 steps</span>
                      <span>•</span>
                      <span>5 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/contract-preview');
                    }}>
                        Contract Preview & E-Sign
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +3
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/payroll-batch">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all duration-200 group-hover:bg-amber-600 group-hover:border-amber-600">
                        <Workflow className="h-5 w-5 text-amber-600 dark:text-amber-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 2.1 — Admin Payroll</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      From compliance review to payroll execution: Kurt guides through payroll batch creation, FX rate review, CFO approval workflow, and batch execution with real-time monitoring and conversational guidance
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">6 steps</span>
                      <span>•</span>
                      <span>5 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational Onboarding
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/fx-breakdown');
                    }}>
                        FX Breakdown Popover
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/confirmation-modal');
                    }}>
                        Confirmation Prompt + Smart Approval Modal
                      </Badge>
                      <Badge variant="outline" className="text-xs">+2</Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/employee-payroll">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 transition-all duration-200 group-hover:bg-blue-600 group-hover:border-blue-600">
                        <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 5.1 — Employee Payroll</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Duplicate of Flow 5 for employee payroll cycle. Will later be updated to support the employee payroll cycle (after payroll posting & payslips). Currently a clean clone — no modifications yet.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">2 steps</span>
                      <span>•</span>
                      <span>3 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/data-summary');
                    }}>
                        Data Summary Cards
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/compliance-checklist');
                    }}>
                        Compliance Checklist
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/contractor-payroll">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 transition-all duration-200 group-hover:bg-blue-600 group-hover:border-blue-600">
                        <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg flex-1">Flow 5.2 — Contractor Payroll</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Duplicate of Flow 5 for contractor-specific payout views. Will later be updated to support contractor-specific payout views. Currently a clean clone — no modifications yet.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">2 steps</span>
                      <span>•</span>
                      <span>3 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/data-summary');
                    }}>
                        Data Summary Cards
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/compliance-checklist');
                    }}>
                        Compliance Checklist
                      </Badge>
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/onboarding');
                    }}>
                        Genie-Led Conversational
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

            </div>
          </TabsContent>

          <TabsContent value="components" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {componentsRegistry.sort((a, b) => a.name.localeCompare(b.name)).map(component => {
              const Icon = component.icon;
              return <Card key={component.id} className="h-full transition-all duration-300 group cursor-pointer border border-border/60 hover:border-primary/20 hover:shadow-elevated hover:-translate-y-1" onClick={() => handleComponentClick(component.id)}>
                      <CardHeader className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300 flex-shrink-0">
                            <Icon className="w-5 h-5 group-hover:text-primary transition-colors duration-300" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold leading-snug truncate">
                              {component.name}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs mt-1">
                              {component.category}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-xs leading-relaxed">
                          {component.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">States:</span>
                          <div className="flex flex-wrap gap-1">
                            {component.states.slice(0, 2).map(state => <Badge key={state.name} variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200">
                                {state.name}
                              </Badge>)}
                            {component.states.length > 2 && <Badge variant="outline" className="text-xs">
                                +{component.states.length - 2}
                              </Badge>}
                          </div>
                        </div>
                        {component.usedInPatterns.length > 0 && <p className="text-xs text-muted-foreground">
                            Used in {component.usedInPatterns.length} pattern{component.usedInPatterns.length !== 1 ? 's' : ''}
                          </p>}
                      </CardContent>
                    </Card>;
            })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ComponentDetailDrawer component={selectedComponent} open={componentDrawerOpen} onOpenChange={setComponentDrawerOpen} />
      
      <PatternDetailDrawer pattern={selectedPattern} open={patternDrawerOpen} onOpenChange={setPatternDrawerOpen} />
    </div>;
};
export default DesignSystem;