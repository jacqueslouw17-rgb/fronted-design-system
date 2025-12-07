/**
 * Flow 2 v2 - Stepper Component (F2v2_ namespaced)
 * 
 * Displays the multi-step progress indicator for the v2 flow.
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface F2v2_StepperProps {
  currentStep: number;
  steps: { label: string; route: string }[];
}

export const F2v2_Stepper: React.FC<F2v2_StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <React.Fragment key={step.route}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:block",
                  isCurrent && "text-foreground font-medium",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-0.5",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const F2v2_STEPS = [
  { label: 'Intro', route: '/candidate-data-collection-v2/intro' },
  { label: 'Core', route: '/candidate-data-collection-v2/core' },
  { label: 'Payroll', route: '/candidate-data-collection-v2/payroll' },
  { label: 'Review', route: '/candidate-data-collection-v2/review' },
  { label: 'Success', route: '/candidate-data-collection-v2/success' },
];
