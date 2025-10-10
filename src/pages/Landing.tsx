import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LayoutDashboard, UserPlus, ListChecks, PanelRightOpen, MousePointerClick } from "lucide-react";
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
      description: "Interactive dashboard with widgets and Genie AI assistant",
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
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Design patterns</h1>
          <p className="text-lg text-muted-foreground">
            Explore different interface patterns and interactions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patterns.map((pattern) => {
            const Icon = pattern.icon;
            return (
              <Link key={pattern.path} to={pattern.path}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover-scale group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-primary/10 ${pattern.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{pattern.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {pattern.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-primary group-hover:gap-2 transition-all">
                      View Pattern
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
