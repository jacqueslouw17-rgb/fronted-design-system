import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, PenTool } from "lucide-react";
import confetti from "canvas-confetti";
import type { Candidate } from "@/hooks/useContractFlow";

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

    const timer = setTimeout(() => {
      setSignedCandidates(prev => [...prev, candidates[signingIndex].id]);
      setSigningIndex(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
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

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Signing via</p>
                        <p className="text-xs font-medium text-foreground">
                          {candidate.signingPortal}
                        </p>
                      </div>

                      {isSigned ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        </motion.div>
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <PenTool className="h-5 w-5 text-primary" />
                        </motion.div>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
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
