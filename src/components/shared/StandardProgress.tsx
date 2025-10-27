import { Progress } from "@/components/ui/progress";

interface StandardProgressProps {
  currentStep: number;
  totalSteps: number;
  variant?: "default" | "secondary" | "accent";
  showLabel?: boolean;
  className?: string;
}

const StandardProgress = ({
  currentStep,
  totalSteps,
  variant = "default",
  showLabel = true,
  className = ""
}: StandardProgressProps) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground/80">Progress</span>
          <span className="text-sm font-semibold text-foreground">
            {currentStep} / {totalSteps}
          </span>
        </div>
      )}
      <Progress value={percentage} variant={variant} className="h-1.5" />
    </div>
  );
};

export default StandardProgress;
