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
      <div className="flex items-center gap-2">
        {stepConfig.map((step, index) => {
          const state = getStepState(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm transition-all",
                  // Current step: subtle gradient background with refined styling
                  state === "active" && "bg-gradient-to-r from-accent/80 to-accent/40 text-accent-foreground font-semibold shadow-sm border border-accent/20",
                  // Completed: muted success styling
                  state === "done" && "bg-muted/60 text-foreground/80 font-medium",
                  // Future: very subtle, neutral
                  state === "todo" && "bg-muted/30 text-muted-foreground/70 font-normal"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-md text-xs font-semibold transition-colors",
                  state === "active" && "bg-foreground/10 text-foreground",
                  state === "done" && "bg-primary/20 text-primary",
                  state === "todo" && "bg-muted/60 text-muted-foreground/60"
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
                  "w-6 h-px transition-colors",
                  completedSteps.includes(step.id) ? "bg-primary/30" : "bg-border/40"
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
