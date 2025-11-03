import React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
}

interface OnboardingStepProgressProps {
  steps: OnboardingStep[];
  className?: string;
}

export const OnboardingStepProgress: React.FC<OnboardingStepProgressProps> = ({
  steps,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Onboarding Progress</h3>
        <span className="text-xs text-muted-foreground">
          {steps.filter((s) => s.status === "completed").length} of {steps.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {step.status === "completed" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {step.status === "current" && (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              )}
              {step.status === "pending" && (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Label and connector */}
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.status === "completed" && "text-green-700 dark:text-green-400",
                  step.status === "current" && "text-primary",
                  step.status === "pending" && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-6 ml-2 mt-1 transition-colors duration-300",
                    step.status === "completed"
                      ? "bg-green-500"
                      : "bg-border"
                  )}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
