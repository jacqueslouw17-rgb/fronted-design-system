import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

const Flows = () => {
  const roles = [
    {
      id: "admin",
      title: "Admin",
      description: "Onboarding and configuration flows for system administrators",
      icon: UserCog,
      flowCount: 1,
      path: "/flows/admin"
    }
  ];

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
            End-to-end workflows organized by role, showing how patterns compose into complete user journeys
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Link key={role.id} to={role.path}>
                <Card className="hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-all duration-200 group-hover:bg-amber-600 group-hover:border-amber-600">
                        <IconComponent className="h-6 w-6 text-amber-600 dark:text-amber-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                      <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {role.flowCount} {role.flowCount === 1 ? 'flow' : 'flows'}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Flows;
