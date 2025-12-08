// Flow 6 v2 - Company Admin Dashboard - In-Place Sticky Stepper

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, AlertTriangle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_InPlaceStep } from "./CA_InPlaceTypes";

interface CA_InPlaceStepperProps {
  currentStep: CA_InPlaceStep;
  onStepClick: (step: CA_InPlaceStep) => void;
  hasBlockingExceptions: boolean;
  exceptionCount: number;
}

export const CA_InPlaceStepper: React.FC<CA_InPlaceStepperProps> = ({
  currentStep,
  onStepClick,
  hasBlockingExceptions,
  exceptionCount
}) => {
  const steps: { id: CA_InPlaceStep; label: string; icon: React.ElementType }[] = [
    { id: "review", label: "Review", icon: FileText },
    { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
    { id: "execute", label: "Execute", icon: Play }
  ];

  const getStepIndex = (step: CA_InPlaceStep) => steps.findIndex(s => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/40 py-3 px-4 -mx-4">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 px-4 relative",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
                onClick={() => onStepClick(step.id)}
              >
                <span className="flex items-center gap-2">
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full border text-xs font-medium">
                      {index + 1}
                    </span>
                  )}
                  <span className="font-medium">{step.label}</span>
                  {step.id === "exceptions" && exceptionCount > 0 && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "ml-1 text-[10px] h-5 min-w-[20px] px-1",
                        hasBlockingExceptions 
                          ? "bg-red-500/10 text-red-600 border-red-500/30" 
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      )}
                    >
                      {exceptionCount}
                    </Badge>
                  )}
                </span>
              </Button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-px",
                  index < currentIndex ? "bg-primary" : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
