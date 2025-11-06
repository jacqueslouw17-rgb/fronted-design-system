import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep1Welcome = ({ onComplete, isProcessing }: Step1Props) => {
  const handleStart = () => {
    onComplete("welcome");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* What We'll Set Up Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          What We'll Set Up
        </h3>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4">
          <ul className="space-y-2.5">
            {[
              "Verify and confirm your personal information",
              "Upload compliance and identity documents",
              "Set up payroll and banking details",
              "Configure work setup preferences",
              "Review your onboarding checklist"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kurt Assistant Callout */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#EAF3FF] dark:bg-primary/10 border border-primary/20">
          <span className="text-lg leading-none flex-shrink-0">💡</span>
          <p className="text-sm text-foreground/90 leading-relaxed">
            You'll have <span className="font-medium">Kurt</span>, your AI assistant, helping with setup and next steps whenever you need guidance.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <Button
          onClick={handleStart}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
};

export default WorkerStep1Welcome;
