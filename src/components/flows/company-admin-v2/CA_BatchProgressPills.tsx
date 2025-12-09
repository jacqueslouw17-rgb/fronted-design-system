import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared batch step type
export type BatchStep = "review" | "exceptions" | "execute" | "track";

interface CA_BatchProgressPillsProps {
  currentStep: BatchStep;
  onStepClick: (step: BatchStep) => void;
  completedSteps: BatchStep[];
  disabled?: boolean;
}

const stepConfig: { id: BatchStep; label: string; number: number }[] = [
  { id: "review", label: "Review", number: 1 },
  { id: "exceptions", label: "Exceptions", number: 2 },
  { id: "execute", label: "Execute", number: 3 },
  { id: "track", label: "Track & Reconcile", number: 4 },
];

export const CA_BatchProgressPills: React.FC<CA_BatchProgressPillsProps> = ({
  currentStep,
  onStepClick,
  completedSteps,
  disabled = false,
}) => {
  const getStepState = (step: BatchStep): "active" | "done" | "todo" => {
    if (step === currentStep) return "active";
    if (completedSteps.includes(step)) return "done";
    return "todo";
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {stepConfig.map((step, index) => {
        const state = getStepState(step.id);
        // Only allow clicking on completed steps (to go back), not future steps
        const isClickable = !disabled && state === "done";
        
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable && state !== "active"}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                state === "active" && "bg-primary text-primary-foreground shadow-md",
                state === "done" && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                state === "todo" && "bg-muted/50 text-muted-foreground cursor-not-allowed",
                isClickable && "hover:scale-105"
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                state === "active" && "bg-primary-foreground/20",
                state === "done" && "bg-primary/30",
                state === "todo" && "bg-muted"
              )}>
                {state === "done" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  step.number
                )}
              </span>
              <span>{step.label}</span>
            </button>
            
            {index < stepConfig.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 rounded-full",
                completedSteps.includes(step.id) ? "bg-primary/40" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
