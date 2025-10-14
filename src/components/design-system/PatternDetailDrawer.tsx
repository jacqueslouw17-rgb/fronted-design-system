import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getComponentsByPattern } from "@/data/componentsRegistry";
import { Link, Package, Layers } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Pattern {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

interface PatternDetailDrawerProps {
  pattern: Pattern | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComponentClick: (componentId: string) => void;
}

export const PatternDetailDrawer = ({ pattern, open, onOpenChange, onComponentClick }: PatternDetailDrawerProps) => {
  if (!pattern) return null;

  const Icon = pattern.icon;
  const linkedComponents = getComponentsByPattern(pattern.path);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-muted/50 ${pattern.color}`}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{pattern.title}</SheetTitle>
              <SheetDescription className="mt-1">{pattern.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Pattern Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">Pattern Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pattern.description}
              </p>
            </CardContent>
          </Card>

          {/* Linked Components */}
          {linkedComponents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Linked Components</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Components used in this pattern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {linkedComponents.map((component) => {
                    const CompIcon = component.icon;
                    return (
                      <button
                        key={component.id}
                        onClick={() => {
                          onOpenChange(false);
                          setTimeout(() => onComponentClick(component.id), 300);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded bg-background">
                          <CompIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{component.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {component.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {component.category}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pattern Route */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">Pattern Route</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {pattern.path}
              </code>
            </CardContent>
          </Card>

          {/* View Live Pattern */}
          <a
            href={pattern.path}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-muted hover:border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <Package className="w-4 h-4" />
                  View Live Pattern
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};
