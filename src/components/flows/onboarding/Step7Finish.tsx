import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Step7Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const Step7Finish = ({ formData, isProcessing: externalProcessing }: Step7Props) => {
  const completedItems = [
    { label: "Organization profile", icon: CheckCircle2, done: !!formData.companyName },
    { label: "Country blocks loaded", icon: CheckCircle2, done: !!formData.selectedCountries },
    { label: "Slack connected", icon: CheckCircle2, done: !!formData.slackConnected },
    { label: "FX rates connected", icon: CheckCircle2, done: !!formData.fxConnected },
    { label: "Mini-Rules configured", icon: CheckCircle2, done: !!formData.miniRules },
    { label: "Transparency Pledge signed", icon: CheckCircle2, done: !!formData.pledgeSigned }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">You're All Set! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Your Fronted workspace is ready
        </p>
      </div>

      {/* What we configured */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
        <Label className="text-sm font-medium">What We've Configured</Label>
        <div className="grid grid-cols-2 gap-2">
          {completedItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card border border-border/30"
              >
                <Icon className={cn(
                  "h-3 w-3 flex-shrink-0",
                  item.done ? "text-green-600" : "text-muted-foreground"
                )} />
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Link to="/dashboard">
          <Button size="lg" className="w-full" disabled={externalProcessing}>
            {externalProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Dashboard...
              </>
            ) : (
              <>
                Open Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </Link>
        <p className="text-xs text-center text-muted-foreground">
          Your dashboard is ready with Agent-First view
        </p>
      </div>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step7Finish;
