import React from "react";
import { Check, FileSearch, AlertCircle, Send, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export type CA3_PayrollStep = "review" | "resolve" | "submit" | "track";

interface StepConfig {
  id: CA3_PayrollStep;
  label: string;
  icon: React.ElementType;
}

const steps: StepConfig[] = [
  { id: "review", label: "Review", icon: FileSearch },
  { id: "resolve", label: "Resolve Checks", icon: AlertCircle },
  { id: "submit", label: "Submit", icon: Send },
  { id: "track", label: "Track", icon: Activity },
];

interface CA3_PayrollStepperProps {
  currentStep: CA3_PayrollStep;
  completedSteps: CA3_PayrollStep[];
  onStepClick?: (step: CA3_PayrollStep) => void;
  blockingCount?: number;
}

export const CA3_PayrollStepper: React.FC<CA3_PayrollStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  blockingCount = 0,
}) => {
  const stepOrder: CA3_PayrollStep[] = ["review", "resolve", "submit", "track"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const getStepState = (step: CA3_PayrollStep): "completed" | "active" | "upcoming" => {
    if (completedSteps.includes(step)) return "completed";
    if (step === currentStep) return "active";
    return "upcoming";
  };

  return (
    <div className="flex items-center justify-center gap-1 p-2 rounded-2xl bg-muted/30 border border-border/30 backdrop-blur-sm">
      {steps.map((step, index) => {
        const state = getStepState(step.id);
        const Icon = step.icon;
        const isClickable = state === "completed" || step.id === currentStep;
        const showBadge = step.id === "resolve" && blockingCount > 0 && state !== "completed";

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                "text-sm font-medium relative",
                state === "active" && "bg-primary/15 text-primary border border-primary/30",
                state === "completed" && "bg-accent-green-fill/10 text-accent-green-text hover:bg-accent-green-fill/20 cursor-pointer",
                state === "upcoming" && "text-muted-foreground/60 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full",
                state === "completed" && "bg-accent-green-fill/20",
                state === "active" && "bg-primary/20",
                state === "upcoming" && "bg-muted/50"
              )}>
                {state === "completed" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>
              <span>{step.label}</span>
              
              {/* Badge for blocking count */}
              {showBadge && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {blockingCount}
                </span>
              )}
            </button>
            
            {/* Connector */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-px",
                stepOrder.indexOf(step.id) < currentIndex 
                  ? "bg-accent-green-text/30" 
                  : "bg-border/50"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CA3_PayrollStepper;
