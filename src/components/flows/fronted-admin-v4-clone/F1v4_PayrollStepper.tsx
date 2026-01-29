/**
 * F1v4_PayrollStepper - Premium minimal stepper for payroll workflow
 * 
 * 4 steps: Review → Exceptions → Approve → Track & Reconcile
 */

import React from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type F1v4_PayrollStep = "review" | "submissions" | "exceptions" | "approve" | "track";

interface StepConfig {
  id: F1v4_PayrollStep;
  label: string;
}

// Map internal step names to display - "submissions" maps to "Review" label
const steps: StepConfig[] = [
  { id: "submissions", label: "Review" },
  { id: "exceptions", label: "Exceptions" },
  { id: "approve", label: "Approve" },
  { id: "track", label: "Track & Reconcile" },
];

interface F1v4_PayrollStepperProps {
  currentStep: F1v4_PayrollStep;
  completedSteps: F1v4_PayrollStep[];
  onStepClick?: (step: F1v4_PayrollStep) => void;
  exceptionsCount?: number;
}

export const F1v4_PayrollStepper: React.FC<F1v4_PayrollStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  exceptionsCount = 0,
}) => {
  const stepOrder: F1v4_PayrollStep[] = ["submissions", "exceptions", "approve", "track"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const getStepState = (step: F1v4_PayrollStep): "completed" | "active" | "upcoming" => {
    if (completedSteps.includes(step)) return "completed";
    if (step === currentStep) return "active";
    return "upcoming";
  };

  return (
    <div className="flex items-center gap-1 p-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/40">
      {steps.map((step, index) => {
        const state = getStepState(step.id);
        const isClickable = state === "completed" || step.id === currentStep;
        const showExceptionsBadge = step.id === "exceptions" && exceptionsCount > 0 && state !== "completed";

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150",
                "text-sm relative",
                state === "active" && "bg-background shadow-sm text-foreground font-medium",
                state === "completed" && "text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/50",
                state === "upcoming" && "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium transition-all",
                state === "completed" && "bg-accent-green-fill/15 text-accent-green-text",
                state === "active" && "bg-primary/10 text-primary",
                state === "upcoming" && "bg-muted/30 text-muted-foreground/40"
              )}>
                {state === "completed" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <span>{step.label}</span>
              
              {/* Exceptions badge */}
              {showExceptionsBadge && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive/90 text-white text-[10px] font-medium">
                  {exceptionsCount}
                </span>
              )}
            </button>
            
            {/* Connector */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-px transition-colors",
                stepOrder.indexOf(step.id) < currentIndex 
                  ? "bg-accent-green-text/20" 
                  : "bg-border/30"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default F1v4_PayrollStepper;
