import { ComponentReference } from "@/data/componentsRegistry";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Package, Layers, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComponentDetailDrawerProps {
  component: ComponentReference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComponentDetailDrawer = ({ component, open, onOpenChange }: ComponentDetailDrawerProps) => {
  const navigate = useNavigate();
  
  if (!component) return null;

  const Icon = component.icon;

  const handlePatternClick = (pattern: string) => {
    onOpenChange(false);
    navigate(`/${pattern}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-muted/50">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{component.name}</SheetTitle>
              <SheetDescription className="mt-1">{component.description}</SheetDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            {component.category}
          </Badge>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* File Path */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">File Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {component.filePath}
              </code>
            </CardContent>
          </Card>

          {/* States */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">State Variants</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Different visual and functional states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {component.states.map((state) => (
                  <div key={state.name} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      {state.name}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex-1">{state.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Props (if available) */}
          {component.props && component.props.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Props & Interactions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {component.props.map((prop) => (
                    <div key={prop.name} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-semibold">{prop.name}</code>
                        <code className="text-xs text-muted-foreground">{prop.type}</code>
                      </div>
                      <p className="text-xs text-muted-foreground">{prop.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Used in Patterns */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">Used in Patterns</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Click to view pattern implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {component.usedInPatterns.map((pattern) => (
                  <Badge 
                    key={pattern} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handlePatternClick(pattern)}
                  >
                    {pattern}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Used in Modules */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">Used in Modules</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {component.usedInModules.map((module) => (
                  <Badge key={module} variant="secondary">
                    {module}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
