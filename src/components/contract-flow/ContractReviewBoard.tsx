import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, DollarSign, Calendar, Clock } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import { KurtIntroTooltip } from "./KurtIntroTooltip";
import { useAgentState } from "@/hooks/useAgentState";

interface ContractReviewBoardProps {
  candidates: Candidate[];
  onStartSigning: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export const ContractReviewBoard: React.FC<ContractReviewBoardProps> = ({
  candidates,
  onStartSigning,
  onBack,
  onClose,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [loadingCardIds, setLoadingCardIds] = useState<Set<string>>(new Set());
  const { isSpeaking: isAgentSpeaking } = useAgentState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AgentHeader
        title="Review Contracts"
        subtitle="Ready to send contract bundles to your candidates for electronic signature."
        showPulse={true}
        isActive={isAgentSpeaking}
        showInput={false}
      />

      {/* Review cards */}
      <div className="grid gap-3 grid-cols-1 max-w-lg mx-auto">
        {candidates.map((candidate, index) => {
          const isLoading = loadingCardIds.has(candidate.id);
          
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            >
              <Card className="p-4 hover:shadow-elevated transition-shadow relative overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm">
                {/* Loading color animation overlay */}
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 pointer-events-none z-10"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                )}
                
                <div className="relative space-y-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        {candidate.name}
                        <span className="text-base">{candidate.flag}</span>
                      </h4>
                      <p className="text-xs text-muted-foreground">{candidate.role}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-medium text-foreground">{candidate.salary}</span>
                      <span className="text-[11px] text-muted-foreground">{candidate.startDate}</span>
                    </div>
                  </div>

                  {/* Compliance checks inline */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                      Compliance passed
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                      Currency ({candidate.currency})
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                      Policy aligned
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="flex justify-center gap-3"
      >
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsSending(true);
            
            // Trigger loading animation for each card sequentially
            candidates.forEach((candidate, index) => {
              setTimeout(() => {
                setLoadingCardIds(prev => new Set([...prev, candidate.id]));
              }, index * 400); // Stagger by 400ms
            });
            
            // After all cards are loaded, proceed to signing
            const totalDelay = candidates.length * 400 + 1200;
            setTimeout(() => {
              onStartSigning();
            }, totalDelay);
          }}
          disabled={isSending}
          className="bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
          size="lg"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Preparing signatures...
            </>
          ) : (
            "Send for Signature"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
