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
      {/* How Kurt Works Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            How Kurt Works
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Your AI assistant handles the heavy lifting while you stay in control
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">Kurt prepares everything</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The agent asks questions, fills forms, and suggests next steps
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">You review and confirm</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every important action requires your explicit approval
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">Full transparency</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All changes are logged and auditable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We'll Set Up Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
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
      </div>

      {/* Quick Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          ⏱️ <strong>Estimated time:</strong> 7-15 minutes to complete all steps. You can save your progress and continue later if needed.
        </p>
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
