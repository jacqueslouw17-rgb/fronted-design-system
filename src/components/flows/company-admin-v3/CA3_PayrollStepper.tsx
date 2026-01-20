import React from "react";
import { Check, FileSearch, Inbox, AlertCircle, Send, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export type CA3_PayrollStep = "review" | "submissions" | "checks" | "submit" | "track";

interface StepConfig {
  id: CA3_PayrollStep;
  label: string;
  icon: React.ElementType;
}

const steps: StepConfig[] = [
  { id: "review", label: "Review", icon: FileSearch },
  { id: "submissions", label: "Submissions", icon: Inbox },
  { id: "checks", label: "Checks", icon: AlertCircle },
  { id: "submit", label: "Submit", icon: Send },
  { id: "track", label: "Track", icon: Activity },
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
    <div className="flex items-center justify-center gap-0.5 py-2 px-3 rounded-full bg-muted/20 border border-border/20 backdrop-blur-sm">
      {steps.map((step, index) => {
        const state = getStepState(step.id);
        const Icon = step.icon;
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
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                "text-xs font-medium relative",
                state === "active" && "bg-primary/10 text-primary",
                state === "completed" && "text-accent-green-text hover:bg-accent-green-fill/10 cursor-pointer",
                state === "upcoming" && "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-4 h-4 rounded-full",
                state === "completed" && "bg-accent-green-fill/20",
                state === "active" && "bg-primary/20"
              )}>
                {state === "completed" ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <Icon className="h-2.5 w-2.5" />
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              
              {/* Badge for blocking count */}
              {showBlockingBadge && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {blockingCount}
                </span>
              )}
              
              {/* Badge for submissions */}
              {showSubmissionBadge && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingSubmissions}
                </span>
              )}
            </button>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-4 h-px",
                stepOrder.indexOf(step.id) < currentIndex 
                  ? "bg-accent-green-text/40" 
                  : "bg-border/30"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CA3_PayrollStepper;
