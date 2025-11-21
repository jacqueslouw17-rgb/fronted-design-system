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

const patterns = [
  {
    id: "onboarding",
    title: "Onboarding",
    description: "Guided user onboarding flows with step-by-step instructions.",
    path: "/onboarding",
    icon: UserPlus,
  },
  {
    id: "contract-preview",
    title: "Contract Preview",
    description: "Preview and review contracts before signing.",
    path: "/contract-preview",
    icon: FileText,
  },
  {
    id: "company-switcher",
    title: "Company Switcher",
    description: "Switch between multiple companies in the platform.",
    path: "/company-switcher",
    icon: LayoutDashboard,
  },
  {
    id: "task-list",
    title: "Task List",
    description: "Manage and track tasks with a checklist interface.",
    path: "/task-list",
    icon: ListChecks,
  },
  {
    id: "chat-interface",
    title: "Chat Interface",
    description: "Conversational UI for user-agent interactions.",
    path: "/chat-interface",
    icon: MessageSquare,
  },
  {
    id: "settings-panel",
    title: "Settings Panel",
    description: "User settings and preferences management.",
    path: "/settings-panel",
    icon: PanelRightOpen,
  },
  {
    id: "analytics-dashboard",
    title: "Analytics Dashboard",
    description: "Visualize data and metrics with charts and graphs.",
    path: "/analytics-dashboard",
    icon: BarChart3,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Alert users with important updates and messages.",
    path: "/notifications",
    icon: Bell,
  },
  {
    id: "security",
    title: "Security",
    description: "Manage security settings and permissions.",
    path: "/security",
    icon: ShieldIcon,
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Define and manage workflows and processes.",
    path: "/workflow",
    icon: Workflow,
  },
];

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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 md:p-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {normalizedPatterns.map(pattern => (
                <Card key={pattern.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handlePatternClick(pattern.path)}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <pattern.icon className="h-5 w-5 text-cyan-600" />
                      </div>
                      <CardTitle className="text-lg">{pattern.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">{pattern.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/flows/contract-flow-multi-company">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 transition-all duration-200 group-hover:bg-cyan-600 group-hover:border-cyan-600">
                        <Workflow className="h-5 w-5 text-cyan-600 dark:text-cyan-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 2.1 — Fronted Admin v1</CardTitle>
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

              <Link to="/flows/onboarding-flow">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 transition-all duration-200 group-hover:bg-green-600 group-hover:border-green-600">
                        <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 1 — User Onboarding</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Step-by-step onboarding flow to get new users started quickly.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">5 steps</span>
                      <span>•</span>
                      <span>2 patterns</span>
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
                      <Badge variant="outline" className="text-xs">
                        +1
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/contract-signing-flow">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 transition-all duration-200 group-hover:bg-purple-600 group-hover:border-purple-600">
                        <ClipboardCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 3 — Contract Signing</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Secure contract signing with e-signature integration.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">6 steps</span>
                      <span>•</span>
                      <span>3 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/contract-preview');
                    }}>
                        Contract Preview & E-Sign
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +2
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/notification-flow">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 transition-all duration-200 group-hover:bg-yellow-600 group-hover:border-yellow-600">
                        <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 4 — Notifications</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      User notification management and alerts.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">4 steps</span>
                      <span>•</span>
                      <span>2 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/notifications');
                    }}>
                        Notifications
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +1
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      View flow
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/flows/security-flow">
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 transition-all duration-200 group-hover:bg-red-600 group-hover:border-red-600">
                        <ShieldIcon className="h-5 w-5 text-red-600 dark:text-red-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-lg">Flow 5 — Security Settings</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      Manage user security and permissions.
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">5 steps</span>
                      <span>•</span>
                      <span>3 patterns</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePatternClick('/security');
                    }}>
                        Security
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +2
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {componentsRegistry.map(component => (
                <Card key={component.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleComponentClick(component.id)}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <component.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <CardTitle className="text-lg">{component.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">{component.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>

      <ComponentDetailDrawer component={selectedComponent} open={componentDrawerOpen} onOpenChange={setComponentDrawerOpen} />
      
      <PatternDetailDrawer pattern={selectedPattern} open={patternDrawerOpen} onOpenChange={setPatternDrawerOpen} />
    </div>
  );
};

export default DesignSystem;
