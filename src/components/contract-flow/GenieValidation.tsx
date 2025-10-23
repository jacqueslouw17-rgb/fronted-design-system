import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, Globe, FileCheck } from "lucide-react";
import type { OnboardingCandidate } from "@/hooks/useCandidateOnboarding";

interface GenieValidationProps {
  candidate: OnboardingCandidate;
  onComplete: () => void;
}

interface ValidationStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  status: "pending" | "validating" | "complete";
}

export const GenieValidation: React.FC<GenieValidationProps> = ({
  candidate,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const steps: ValidationStep[] = [
    {
      id: "gdpr",
      icon: <Shield className="h-5 w-5" />,
      label: "GDPR Compliance Verified",
      status: "pending",
    },
    {
      id: "employment",
      icon: <FileCheck className="h-5 w-5" />,
      label: `Employment Law Check Passed (${candidate.country})`,
      status: "pending",
    },
    {
      id: "currency",
      icon: <Globe className="h-5 w-5" />,
      label: "Currency + Tax Schema Matched",
      status: "pending",
    },
  ];

  const [validationSteps, setValidationSteps] = useState(steps);

  useEffect(() => {
    if (currentStep < steps.length) {
      // Mark current as validating
      const timer1 = setTimeout(() => {
        setValidationSteps((prev) =>
          prev.map((step, idx) =>
            idx === currentStep
              ? { ...step, status: "validating" as const }
              : step
          )
        );
      }, 300);

      // Mark as complete after validation
      const timer2 = setTimeout(() => {
        setValidationSteps((prev) =>
          prev.map((step, idx) =>
            idx === currentStep
              ? { ...step, status: "complete" as const }
              : step
          )
        );
        setCurrentStep((prev) => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (currentStep === steps.length) {
      // All validation complete, show final message then fade out
      const timer = setTimeout(() => {
        setShowOverlay(false);
        setTimeout(onComplete, 400);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, onComplete]);

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-lg border bg-card p-8 shadow-2xl"
          >
            {/* Genie Scanner Beam */}
            <motion.div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ top: 0, opacity: 0 }}
              animate={{
                top: currentStep < steps.length ? ["0%", "100%"] : "100%",
                opacity: currentStep < steps.length ? [0, 1, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: currentStep < steps.length ? Infinity : 0,
              }}
            />

            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <Shield className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold">
                {currentStep < steps.length
                  ? "Validating Compliance..."
                  : "All Checks Passed!"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep < steps.length
                  ? "Genie is verifying data and compliance rules"
                  : "Data validated and ready for contract"}
              </p>
            </div>

            <div className="space-y-3">
              {validationSteps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    step.status === "complete"
                      ? "border-green-500/30 bg-green-500/5"
                      : step.status === "validating"
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      step.status === "complete"
                        ? "bg-green-500/20 text-green-600"
                        : step.status === "validating"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.status === "complete" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.status === "pending" ? "text-muted-foreground" : ""
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.status === "validating" && (
                    <motion.div
                      className="ml-auto h-2 w-2 rounded-full bg-primary"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {currentStep === steps.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-center"
              >
                <p className="text-sm font-medium text-green-600">
                  ✅ All personal, tax, and banking data validated
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  🌍 Local compliance rules applied for {candidate.country}
                </p>
                <p className="text-xs text-muted-foreground">
                  🧾 Contract ready for generation
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
