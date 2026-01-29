/**
 * F1v4_CompanyPayrollRun - Company-level payroll run controller cockpit
 * 
 * Clean 4-step workflow: Review → Exceptions → Approve → Track & Reconcile
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_PayrollStep } from "./F1v4_PayrollStepper";
import { F1v4_ReviewStep } from "./F1v4_ReviewStep";
import { F1v4_ExceptionsStep } from "./F1v4_ExceptionsStep";
import { F1v4_ApproveStep } from "./F1v4_ApproveStep";
import { F1v4_TrackStep } from "./F1v4_TrackStep";

interface F1v4_CompanyPayrollRunProps {
  company: CompanyPayrollData;
  initialStep?: number; // 1=review, 2=exceptions, 3=approve, 4=track
}

const stepMap: Record<number, F1v4_PayrollStep> = {
  1: "review",
  2: "exceptions",
  3: "approve",
  4: "track",
};

// Minimal inline stepper matching Flow 6 v3 pattern
interface StepConfig {
  id: F1v4_PayrollStep;
  label: string;
}

const steps: StepConfig[] = [
  { id: "review", label: "Review" },
  { id: "exceptions", label: "Exceptions" },
  { id: "approve", label: "Approve" },
  { id: "track", label: "Track" },
];

export const F1v4_CompanyPayrollRun: React.FC<F1v4_CompanyPayrollRunProps> = ({
  company,
  initialStep,
}) => {
  // Determine initial step based on prop
  const getInitialStep = (): F1v4_PayrollStep => {
    if (initialStep && stepMap[initialStep]) {
      return stepMap[initialStep];
    }
    return "review";
  };

  const getInitialCompletedSteps = (): F1v4_PayrollStep[] => {
    if (!initialStep) return [];
    const steps: F1v4_PayrollStep[] = [];
    if (initialStep >= 2) steps.push("review");
    if (initialStep >= 3) steps.push("exceptions");
    if (initialStep >= 4) steps.push("approve");
    return steps;
  };

  const [currentStep, setCurrentStep] = useState<F1v4_PayrollStep>(getInitialStep);
  const [completedSteps, setCompletedSteps] = useState<F1v4_PayrollStep[]>(getInitialCompletedSteps);
  const [isApproved, setIsApproved] = useState(initialStep === 4);
  const [exceptionsCount, setExceptionsCount] = useState(company.blockingExceptions);
  const stepOrder: F1v4_PayrollStep[] = ["review", "exceptions", "approve", "track"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const getStepState = (step: F1v4_PayrollStep): "completed" | "active" | "upcoming" => {
    if (completedSteps.includes(step)) return "completed";
    if (step === currentStep) return "active";
    return "upcoming";
  };

  const handleStepClick = (step: F1v4_PayrollStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const goToExceptions = () => {
    setCompletedSteps(prev => {
      const steps: F1v4_PayrollStep[] = [...prev];
      if (!steps.includes("review")) steps.push("review");
      return steps;
    });
    setCurrentStep("exceptions");
  };

  const goToApprove = () => {
    setCompletedSteps(prev => {
      const steps: F1v4_PayrollStep[] = [...prev];
      if (!steps.includes("review")) steps.push("review");
      if (!steps.includes("exceptions")) steps.push("exceptions");
      return steps;
    });
    setCurrentStep("approve");
  };

  const goToTrack = () => {
    setCompletedSteps(prev => {
      const steps: F1v4_PayrollStep[] = [...prev];
      if (!steps.includes("review")) steps.push("review");
      if (!steps.includes("exceptions")) steps.push("exceptions");
      if (!steps.includes("approve")) steps.push("approve");
      return steps;
    });
    setIsApproved(true);
    setCurrentStep("track");
    toast.success("Payroll numbers approved and locked");
  };

  const handleResolveException = () => {
    setExceptionsCount(prev => Math.max(0, prev - 1));
    toast.success("Exception resolved");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "review":
        return (
          <F1v4_ReviewStep
            company={company}
            onContinue={goToExceptions}
          />
        );
      case "exceptions":
        return (
          <F1v4_ExceptionsStep
            company={company}
            exceptionsCount={exceptionsCount}
            onResolve={handleResolveException}
            onContinue={goToApprove}
          />
        );
      case "approve":
        return (
          <F1v4_ApproveStep
            company={company}
            onApprove={goToTrack}
          />
        );
      case "track":
        return (
          <F1v4_TrackStep
            company={company}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 pb-32 space-y-5">
      {/* Minimal Stepper - Hidden after approval */}
      {!isApproved && (
        <div className="flex items-center gap-1">
          {steps.map((step, index) => {
            const state = getStepState(step.id);
            const isClickable = state === "completed" || step.id === currentStep;
            const showExceptionsBadge = step.id === "exceptions" && exceptionsCount > 0 && state !== "completed";

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isClickable && handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150",
                    "text-xs relative",
                    state === "active" && "text-foreground font-medium",
                    state === "completed" && "text-muted-foreground cursor-pointer hover:text-foreground",
                    state === "upcoming" && "text-muted-foreground/70 cursor-not-allowed"
                  )}
                >
                  {/* Step indicator */}
                  <div className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-medium transition-all",
                    state === "completed" && "bg-accent-green-fill/15 text-accent-green-text",
                    state === "active" && "bg-foreground/10 text-foreground",
                    state === "upcoming" && "bg-muted/20 text-muted-foreground/30"
                  )}>
                    {state === "completed" ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <span className="hidden sm:inline">{step.label}</span>
                  
                  {/* Exceptions badge */}
                  {showExceptionsBadge && (
                    <span className="flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-destructive/90 text-white text-[9px] font-medium">
                      {exceptionsCount}
                    </span>
                  )}
                </button>
                
                {/* Connector */}
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
      )}

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderStepContent()}
      </motion.div>
    </div>
  );
};

export default F1v4_CompanyPayrollRun;
