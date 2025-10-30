import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PenTool, Send, Award, Bot } from "lucide-react";
import confetti from "canvas-confetti";
import type { Candidate } from "@/hooks/useContractFlow";
import { SignatureTracker, SignatureStatus } from "./SignatureTracker";
import { AgentHeader } from "@/components/agent/AgentHeader";
import KurtMuteToggle from "@/components/shared/KurtMuteToggle";
import { KurtContextualTags } from "@/components/kurt";
import { KurtIntroTooltip } from "./KurtIntroTooltip";
import { useAgentState } from "@/hooks/useAgentState";

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
  const [signatureStatus, setSignatureStatus] = useState<Record<string, SignatureStatus>>(
    candidates.reduce((acc, c) => ({ ...acc, [c.id]: "sent" as SignatureStatus }), {})
  );
  const [genieMessage, setGenieMessage] = useState("Preparing for e-signature via localized legal channels…");
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const { isSpeaking: isAgentSpeaking } = useAgentState();

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
      setGenieMessage("✅ All contracts signed and certified! Ready to start onboarding.");
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }

    const currentCandidate = candidates[signingIndex];
    const steps: SigningStep[] = ["drafting", "sent", "signing", "certified"];
    const statusSteps: SignatureStatus[] = ["sent", "viewed", "signed", "signed"];
    let stepIndex = 0;

    // Update Genie message
    setGenieMessage(`📧 Sending contract bundle to ${currentCandidate.name} via ${currentCandidate.signingPortal}. I'll track progress in real-time.`);

    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCandidateSteps(prev => ({
          ...prev,
          [currentCandidate.id]: steps[stepIndex],
        }));
        
        // Update signature status
        if (stepIndex < statusSteps.length) {
          setSignatureStatus(prev => ({
            ...prev,
            [currentCandidate.id]: statusSteps[stepIndex],
          }));
        }
        
        // Update Genie message based on step
        if (steps[stepIndex] === "sent") {
          setGenieMessage(`✅ Contract sent to ${currentCandidate.name}. I'm monitoring their activity — I'll let you know when they sign.`);
        } else if (steps[stepIndex] === "signing") {
          setGenieMessage(`🖊️ ${currentCandidate.name} is reviewing the contract now. Almost there...`);
        } else if (steps[stepIndex] === "certified") {
          setGenieMessage(`🎉 ${currentCandidate.name}'s contract is signed and certified! Moving to the next candidate.`);
        }
        
        stepIndex++;
      } else {
        clearInterval(stepInterval);
        setSignedCandidates(prev => [...prev, currentCandidate.id]);
        setSigningIndex(prev => prev + 1);
      }
    }, 1000);

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
      <AgentHeader
        title="Signature Phase"
        subtitle="Kurt can help with: checking status, resending links, or downloading signed contracts."
        showPulse={true}
        isActive={isAgentSpeaking}
        isMuted={isKurtMuted}
        onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
        tags={
          <div className="relative">
            <KurtContextualTags
              flowContext="signature-phase"
              onTagClick={(action) => {
                console.log('Signature action:', action);
              }}
              disabled={false}
            />
            <KurtIntroTooltip context="signature-phase" />
          </div>
        }
      />

      {/* Genie message */}
      <motion.div
        key={genieMessage}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
      >
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-primary mt-0.5" />
          <p className="text-sm text-foreground">
            {genieMessage}
          </p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
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

                      {/* Signature status tracker */}
                      <div className="flex items-center gap-2">
                        {isSigned ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                          >
                            <SignatureTracker status="signed" />
                          </motion.div>
                        ) : isCurrent ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <SignatureTracker status={signatureStatus[candidate.id] || "sent"} />
                          </motion.div>
                        ) : (
                          <SignatureTracker status="sent" />
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
