import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CA4_PayrollStep = "submissions" | "submit" | "track";

interface StepConfig {
  id: CA4_PayrollStep;
  label: string;
}

const steps: StepConfig[] = [
  { id: "submissions", label: "Submissions" },
  { id: "submit", label: "Submit" },
  { id: "track", label: "Track" },
];

interface CA4_PayrollStepperProps {
  currentStep: CA4_PayrollStep;
  completedSteps: CA4_PayrollStep[];
  onStepClick?: (step: CA4_PayrollStep) => void;
  pendingSubmissions?: number;
  isSubmitted?: boolean; // When true, all steps before Track are locked
}

export const CA4_PayrollStepper: React.FC<CA4_PayrollStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  pendingSubmissions = 0,
  isSubmitted = false,
}) => {
  const stepOrder: CA4_PayrollStep[] = ["submissions", "submit", "track"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const getStepState = (step: CA4_PayrollStep): "completed" | "active" | "upcoming" | "locked" => {
    // If submitted, all steps except track are locked
    if (isSubmitted && step !== "track") return "locked";
    if (completedSteps.includes(step)) return "completed";
    if (step === currentStep) return "active";
    return "upcoming";
  };

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const state = getStepState(step.id);
        const isClickable = (state === "completed" || step.id === currentStep) && state !== "locked";
        
        // Show badge for submissions with pending count
        const showSubmissionBadge = step.id === "submissions" && pendingSubmissions > 0 && state !== "completed" && state !== "locked";

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150",
                "text-xs relative",
                state === "active" && "text-foreground font-medium",
                state === "completed" && "text-muted-foreground cursor-pointer hover:text-foreground",
                state === "upcoming" && "text-muted-foreground/70 cursor-not-allowed",
                state === "locked" && "text-muted-foreground/70 cursor-not-allowed opacity-80"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-medium transition-all",
                state === "completed" && "bg-accent-green-fill/15 text-accent-green-text",
                state === "active" && "bg-foreground/10 text-foreground",
                state === "upcoming" && "bg-muted/20 text-muted-foreground/30",
                state === "locked" && "bg-muted/10 text-muted-foreground/30"
              )}>
                {state === "completed" || state === "locked" ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <span className="hidden sm:inline">{step.label}</span>
              
              {/* Badge for submissions - subtle */}
              {showSubmissionBadge && (
                <span className="flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-amber-500/80 text-white text-[9px] font-medium">
                  {pendingSubmissions}
                </span>
              )}
            </button>
            
            {/* Connector - very subtle */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-4 h-px transition-colors",
                stepOrder.indexOf(step.id) < currentIndex 
                  ? "bg-accent-green-text/15" 
                  : "bg-border/5"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CA4_PayrollStepper;
