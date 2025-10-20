import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getComponentsByPattern } from "@/data/componentsRegistry";
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
}

export const PatternDetailDrawer = ({ pattern, open, onOpenChange }: PatternDetailDrawerProps) => {
  const navigate = useNavigate();
  
  if (!pattern) return null;

  const Icon = pattern.icon;
  const linkedComponents = getComponentsByPattern(pattern.path.replace('/agent-', 'genie-'));

  const handleViewPattern = () => {
    onOpenChange(false);
    navigate(pattern.path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-muted/50`}>
              <Icon className={`w-5 h-5 ${pattern.color}`} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{pattern.title}</SheetTitle>
              <SheetDescription className="mt-1">{pattern.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Components Used */}
          {linkedComponents.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Components Used</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {linkedComponents.length} component{linkedComponents.length !== 1 ? 's' : ''} used in this pattern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {linkedComponents.map((comp) => (
                    <Badge 
                      key={comp.id} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200"
                    >
                      {comp.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Pattern Button */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all group border-primary/20"
            onClick={handleViewPattern}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md bg-muted/50 group-hover:bg-gradient-primary transition-all duration-300`}>
                    <Icon className={`w-5 h-5 ${pattern.color} group-hover:text-primary-foreground transition-colors duration-300`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">View Pattern Implementation</p>
                    <p className="text-xs text-muted-foreground">See this pattern in action</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
