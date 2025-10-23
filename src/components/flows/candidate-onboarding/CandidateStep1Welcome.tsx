import { Button } from "@/components/ui/button";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep1Welcome = ({ 
  formData, 
  onComplete, 
  isProcessing = false,
  isLoadingFields = false
}: Step1Props) => {
  const firstName = formData.fullName?.split(' ')[0] || "there";

  const handleStart = () => {
    onComplete("welcome_start", {});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4 text-center">
        <h3 className="text-2xl font-semibold">
          Hi {firstName} 👋 Welcome to Fronted!
        </h3>
        <p className="text-muted-foreground text-lg">
          I'll help you complete a few quick details so we can finalize your contract.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        {isProcessing ? (
          <Button disabled size="lg" className="min-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleStart} 
            size="lg"
            className="min-w-[200px]"
          >
            Start
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep1Welcome;
