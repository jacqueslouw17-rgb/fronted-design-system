import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface Step7Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
}

const Step7Finish = ({ formData }: Step7Props) => {
  const completedItems = [
    { label: "Organization profile", icon: CheckCircle2, done: !!formData.companyName },
    { label: "Country blocks loaded", icon: CheckCircle2, done: !!formData.selectedCountries },
    { label: "Slack connected", icon: CheckCircle2, done: !!formData.slackConnected },
    { label: "FX rates connected", icon: CheckCircle2, done: !!formData.fxConnected },
    { label: "Mini-Rules configured", icon: CheckCircle2, done: !!formData.miniRules },
    { label: "Transparency Pledge signed", icon: CheckCircle2, done: !!formData.pledgeSigned }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">You're All Set! 🎉</h2>
          <p className="text-muted-foreground text-lg">
            Your Fronted workspace is ready for action
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">What We've Configured</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background"
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    item.done ? "text-green-600" : "text-muted-foreground"
                  )} />
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Try Genie Now
            </h3>
            <p className="text-sm text-muted-foreground">
              I can help you draft your first contract. Just say something like:
            </p>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-mono">
                "Draft a contract for Anna in Philippines, software developer role"
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                Add a contractor
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                Run payroll
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                View compliance status
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                Check FX rates
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Link to="/dashboard">
          <Button size="lg" className="w-full">
            Open Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
        <p className="text-xs text-center text-muted-foreground">
          Your dashboard features the Agent-First view. Click the drawer icon to see split view.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm">
            <strong>💡 Pro Tip:</strong> You can switch between Agent mode (chat with Genie) and
            Manual mode (traditional forms) anytime using the toggle in the top right.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step7Finish;
