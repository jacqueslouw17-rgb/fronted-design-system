import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, PenTool, Send, FileCheck, Award } from "lucide-react";
import confetti from "canvas-confetti";
import type { Candidate } from "@/hooks/useContractFlow";

type SigningStep = "drafting" | "sent" | "signing" | "certified";

interface ContractSignaturePhaseProps {
  candidates: Candidate[];
  onComplete: () => void;
}

export const ContractSignaturePhase: React.FC<ContractSignaturePhaseProps> = ({
  candidates,
  onComplete,
}) => {
  const [signingIndex, setSigningIndex] = useState(0);
  const [signedCandidates, setSignedCandidates] = useState<string[]>([]);
  const [candidateSteps, setCandidateSteps] = useState<Record<string, SigningStep>>(
    candidates.reduce((acc, c) => ({ ...acc, [c.id]: "drafting" }), {})
  );

  useEffect(() => {
    // Trigger confetti
    const duration = 1500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 20, spread: 360, ticks: 50, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 30 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.2 }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (signingIndex >= candidates.length) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }

    const currentCandidate = candidates[signingIndex];
    const steps: SigningStep[] = ["drafting", "sent", "signing", "certified"];
    let stepIndex = 0;

    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCandidateSteps(prev => ({
          ...prev,
          [currentCandidate.id]: steps[stepIndex],
        }));
        stepIndex++;
      } else {
        clearInterval(stepInterval);
        setSignedCandidates(prev => [...prev, currentCandidate.id]);
        setSigningIndex(prev => prev + 1);
      }
    }, 500);

    return () => clearInterval(stepInterval);
  }, [signingIndex, candidates, onComplete]);

  const progress = (signedCandidates.length / candidates.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Kurt's message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
      >
        <p className="text-sm text-foreground">
          Preparing for e-signature via localized legal channels…
        </p>
      </motion.div>

      {/* Progress bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Signing Progress</span>
            <span className="text-sm font-semibold text-foreground">
              {signedCandidates.length} / {candidates.length}
            </span>
          </div>
          <Progress value={progress} variant="default" className="h-2" />
        </div>
      </Card>

      {/* Signing cards */}
      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence mode="sync">
          {candidates.map((candidate, index) => {
            const isSigned = signedCandidates.includes(candidate.id);
            const isCurrent = index === signingIndex;
            const currentStep = candidateSteps[candidate.id] || "drafting";

            const stepConfig = {
              drafting: { icon: PenTool, label: "Drafting", color: "text-muted-foreground" },
              sent: { icon: Send, label: "Sent to Contractor", color: "text-primary" },
              signing: { icon: PenTool, label: "Signing", color: "text-primary" },
              certified: { icon: Award, label: "Certified", color: "text-success" },
            };

            const { icon: StepIcon, label: stepLabel, color: stepColor } = stepConfig[currentStep];

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateY: isSigned ? [0, 5, 0] : 0 
                }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.3,
                  rotateY: { duration: 0.5 }
                }}
              >
                <Card className={`p-5 relative overflow-hidden ${
                  isCurrent ? "ring-2 ring-primary" : ""
                }`}>
                  {/* Ink animation overlay */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}

                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{candidate.flag}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                        <p className="text-xs text-muted-foreground">{candidate.role}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Signing via</p>
                        <p className="text-xs font-medium text-foreground">
                          {candidate.signingPortal}
                        </p>
                      </div>

                      {/* Step sequence visualization */}
                      <div className="flex items-center gap-2">
                        {isSigned ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                          >
                            <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          </motion.div>
                        ) : isCurrent ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <StepIcon className={`h-4 w-4 ${stepColor}`} />
                            </motion.div>
                            <span className={`text-xs font-medium ${stepColor}`}>{stepLabel}</span>
                          </motion.div>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
