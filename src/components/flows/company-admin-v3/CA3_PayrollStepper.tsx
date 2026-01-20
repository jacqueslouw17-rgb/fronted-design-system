import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CA3_PayrollStep = "review" | "submissions" | "checks" | "submit" | "track";

interface StepConfig {
  id: CA3_PayrollStep;
  label: string;
}

const steps: StepConfig[] = [
  { id: "review", label: "Review" },
  { id: "submissions", label: "Submissions" },
  { id: "checks", label: "Checks" },
  { id: "submit", label: "Submit" },
  { id: "track", label: "Track" },
];

interface CA3_PayrollStepperProps {
  currentStep: CA3_PayrollStep;
  completedSteps: CA3_PayrollStep[];
  onStepClick?: (step: CA3_PayrollStep) => void;
  blockingCount?: number;
  pendingSubmissions?: number;
}

export const CA3_PayrollStepper: React.FC<CA3_PayrollStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  blockingCount = 0,
  pendingSubmissions = 0,
}) => {
  const stepOrder: CA3_PayrollStep[] = ["review", "submissions", "checks", "submit", "track"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const getStepState = (step: CA3_PayrollStep): "completed" | "active" | "upcoming" => {
    if (completedSteps.includes(step)) return "completed";
    if (step === currentStep) return "active";
    return "upcoming";
  };

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const state = getStepState(step.id);
        const isClickable = state === "completed" || step.id === currentStep;
        
        // Show badge for checks with blocking count
        const showBlockingBadge = step.id === "checks" && blockingCount > 0 && state !== "completed";
        // Show badge for submissions with pending count
        const showSubmissionBadge = step.id === "submissions" && pendingSubmissions > 0 && state !== "completed";

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200",
                "text-xs relative group",
                state === "active" && "text-foreground font-medium",
                state === "completed" && "text-accent-green-text cursor-pointer hover:text-accent-green-text/80",
                state === "upcoming" && "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium transition-all",
                state === "completed" && "bg-accent-green-fill/20 text-accent-green-text",
                state === "active" && "bg-foreground text-background",
                state === "upcoming" && "border border-muted-foreground/20 text-muted-foreground/40"
              )}>
                {state === "completed" ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <span className="hidden sm:inline">{step.label}</span>
              
              {/* Badge for blocking count */}
              {showBlockingBadge && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {blockingCount}
                </span>
              )}
              
              {/* Badge for submissions */}
              {showSubmissionBadge && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                  {pendingSubmissions}
                </span>
              )}
            </button>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-6 h-px transition-colors",
                stepOrder.indexOf(step.id) < currentIndex 
                  ? "bg-accent-green-text/30" 
                  : "bg-border/20"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CA3_PayrollStepper;
