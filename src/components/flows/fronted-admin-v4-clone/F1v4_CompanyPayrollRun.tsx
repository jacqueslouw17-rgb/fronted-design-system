/**
 * F1v4_CompanyPayrollRun - Company-level payroll run controller cockpit
 * 
 * Clean 4-step workflow: Review → Exceptions → Approve → Track & Reconcile
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2,
  Users,
  Briefcase,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_PayrollStepper, F1v4_PayrollStep } from "./F1v4_PayrollStepper";
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
    <div className="max-w-6xl mx-auto p-8 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-foreground">{company.name}</h1>
            <p className="text-xs text-muted-foreground">{company.payPeriod}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {company.employeeCount} employees
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            {company.contractorCount} contractors
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            {company.currencyCount} currencies
          </span>
        </div>
      </div>

      {/* Stepper - Hidden after approval */}
      {!isApproved && (
        <F1v4_PayrollStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          exceptionsCount={exceptionsCount}
        />
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
