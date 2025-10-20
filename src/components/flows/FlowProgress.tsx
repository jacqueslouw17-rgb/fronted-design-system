import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStep {
  id: string;
  label: string;
}

interface FlowProgressProps {
  steps: FlowStep[];
  currentStep: string;
  completedSteps: string[];
}

const FlowProgress = ({ steps, currentStep, completedSteps }: FlowProgressProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isPast = index < currentIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && !isCompleted && "bg-primary/20 text-primary border-2 border-primary",
                      !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 text-center max-w-[100px] transition-colors",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors duration-200",
                      isPast || isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlowProgress;
