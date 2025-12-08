import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FXReviewStep = "review-fx" | "exceptions" | "execute" | "track";

interface CA_FXReviewStepperProps {
  currentStep: FXReviewStep;
  completedSteps: FXReviewStep[];
}

const stepConfig: { id: FXReviewStep; label: string; number: number }[] = [
  { id: "review-fx", label: "Review", number: 1 },
  { id: "exceptions", label: "Exceptions", number: 2 },
  { id: "execute", label: "Execute", number: 3 },
  { id: "track", label: "Track & Reconcile", number: 4 },
];

export const CA_FXReviewStepper: React.FC<CA_FXReviewStepperProps> = ({
  currentStep,
  completedSteps,
}) => {
  const getStepState = (step: FXReviewStep): "active" | "done" | "todo" => {
    if (step === currentStep) return "active";
    if (completedSteps.includes(step)) return "done";
    return "todo";
  };

  const currentStepIndex = stepConfig.findIndex(s => s.id === currentStep);

  return (
    <div className="space-y-3">
      {/* Stepper pills */}
      <div className="flex items-center gap-3">
        {stepConfig.map((step, index) => {
          const state = getStepState(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  // Current step: white pill with brand gradient outline and shadow
                  state === "active" && "bg-background border-2 border-primary shadow-md text-foreground",
                  // Completed: soft gradient fill with check
                  state === "done" && "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30",
                  // Future: neutral grey pill
                  state === "todo" && "bg-muted/40 text-muted-foreground border border-border/50"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                  state === "active" && "bg-primary text-primary-foreground",
                  state === "done" && "bg-primary/30 text-primary",
                  state === "todo" && "bg-muted text-muted-foreground"
                )}>
                  {state === "done" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    step.number
                  )}
                </span>
                <span>{step.label}</span>
              </div>
              
              {/* Connector line */}
              {index < stepConfig.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 rounded-full transition-colors",
                  completedSteps.includes(step.id) ? "bg-primary/40" : "bg-border/50"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Step {currentStepIndex + 1} of 4 – {stepConfig[currentStepIndex]?.label === "Review" ? "FX Review" : stepConfig[currentStepIndex]?.label}
      </p>
    </div>
  );
};
