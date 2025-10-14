import { ArrowLeft, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RoleLensProvider, useRoleLens } from "@/contexts/RoleLensContext";
import ToneChip from "@/components/dashboard/ToneChip";
import LensToggle from "@/components/dashboard/LensToggle";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DemoContent = () => {
  const { currentLens, hasPermission } = useRoleLens();

  const mockUserData = {
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@fronted.com",
    country: "United States",
    role: currentLens.role,
  };

  return (
    <div className="space-y-8">
      {/* Header with Lens Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dynamic Role Lens</h1>
          <p className="text-muted-foreground mt-2">
            Adaptive UI that personalizes based on user role
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ToneChip />
          <LensToggle />
        </div>
      </div>

      {/* Current Lens Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Current Lens Configuration
          </CardTitle>
          <CardDescription>How the interface adapts for this role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tone</p>
              <p className="text-lg">{currentLens.tone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">UI Focus</p>
              <p className="text-lg">{currentLens.uiFocus}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Permissions</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${hasPermission('canApprovePayroll') ? 'bg-green-500' : 'bg-muted'}`} />
                <span className="text-sm">Approve Payroll</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${hasPermission('canEditContracts') ? 'bg-green-500' : 'bg-muted'}`} />
                <span className="text-sm">Edit Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${hasPermission('canViewAnalytics') ? 'bg-green-500' : 'bg-muted'}`} />
                <span className="text-sm">View Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${hasPermission('canManageUsers') ? 'bg-green-500' : 'bg-muted'}`} />
                <span className="text-sm">Manage Users</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Default Widgets</p>
            <div className="flex flex-wrap gap-2">
              {currentLens.defaultWidgets.map((widget) => (
                <span
                  key={widget}
                  className="px-2 py-1 bg-muted rounded-md text-sm"
                >
                  {widget}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Grid Demo */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Dashboard Preview</h2>
        <p className="text-muted-foreground mb-6">
          Switch roles above to see how the dashboard adapts
        </p>
        <WidgetGrid userData={mockUserData} />
      </div>

      {/* Pattern Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pattern Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Automatic Adaptation</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Genie tone and language adjust per role</li>
              <li>Dashboard widgets reorder by priority</li>
              <li>Permissions control visible actions</li>
              <li>Greeting messages personalize</li>
              <li>Smooth transitions on lens switch</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Use Cases</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li><strong>Admin:</strong> Global overview, SLA monitoring, full controls</li>
              <li><strong>HR:</strong> Onboarding focus, contract management, people-first</li>
              <li><strong>CFO:</strong> Financial metrics, approval workflows, cost analysis</li>
              <li><strong>Contractor:</strong> Self-service portal, payment tracking, support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DynamicRoleLensPattern = () => {
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

        <RoleLensProvider initialRole="admin">
          <DemoContent />
        </RoleLensProvider>
      </div>
    </div>
  );
};

export default DynamicRoleLensPattern;
