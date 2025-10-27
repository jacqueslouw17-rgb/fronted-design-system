import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep1Welcome = ({ formData, onComplete, isProcessing }: Step1Props) => {
  const workerName = formData.workerName || "there";

  const handleStart = () => {
    onComplete("welcome");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold">Hi {workerName}! 👋</h2>
        
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-lg text-foreground">
            Welcome to Fronted!
          </p>
          <p className="text-muted-foreground">
            We'll help you complete a few quick tasks so your first day is smooth & compliant.
          </p>
          <p className="text-sm text-muted-foreground">
            This should only take about 10 minutes.
          </p>
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-sm">What we'll cover:</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>✓ Verify your personal information</li>
          <li>✓ Upload compliance documents</li>
          <li>✓ Set up payroll details</li>
          <li>✓ Complete work setup preferences</li>
          <li>✓ Review your onboarding checklist</li>
        </ul>
      </div>

      <Button
        onClick={handleStart}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Starting..." : "Start Onboarding"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkerStep1Welcome;
