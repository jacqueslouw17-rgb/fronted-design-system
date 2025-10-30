import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, DollarSign, Calendar, Clock } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { AgentHeader } from "@/components/agent/AgentHeader";
import KurtMuteToggle from "@/components/shared/KurtMuteToggle";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
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
  const [globalComment, setGlobalComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingCardIds, setLoadingCardIds] = useState<Set<string>>(new Set());
  const [isKurtMuted, setIsKurtMuted] = useState(false);
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
        subtitle="Kurt can help with: highlighting changes, checking compliance, or previewing contracts."
        showPulse={true}
        isActive={isAgentSpeaking}
        isMuted={isKurtMuted}
        onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
        tags={
          <AgentSuggestionChips
            chips={[
              {
                label: "Highlight Changes",
                variant: "primary",
                onAction: () => console.log('Review action: highlight-changes'),
              },
              {
                label: "Check Compliance",
                variant: "default",
                onAction: () => console.log('Review action: check-compliance'),
              },
              {
                label: "Preview Contracts",
                variant: "default",
                onAction: () => console.log('Review action: preview-contracts'),
              },
            ]}
          />
        }
      />

      {/* Review cards */}
      <div className={`grid gap-4 ${candidates.length <= 2 ? 'grid-cols-2 justify-center max-w-2xl mx-auto' : 'grid-cols-3'}`}>
        {candidates.map((candidate, index) => {
          const isLoading = loadingCardIds.has(candidate.id);
          
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            >
              <Card className="p-5 hover:shadow-elevated transition-shadow relative overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm">
                {/* Loading color animation overlay */}
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 pointer-events-none z-10"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                )}
                
                <div className="space-y-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{candidate.flag}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                      <p className="text-xs text-muted-foreground">{candidate.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">Compliance check passed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">Currency verified ({candidate.currency})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">Country policy aligned</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{candidate.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{candidate.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{candidate.noticePeriod}</span>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  className="flex justify-center"
                >
                  <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Reviewed
                  </Badge>
                </motion.div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Comment section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <Card className="p-4 border border-border/40 bg-card/50 backdrop-blur-sm">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Review Comment (Optional)
          </label>
          <Textarea
            placeholder="Add any notes or comments..."
            value={globalComment}
            onChange={(e) => setGlobalComment(e.target.value)}
            className="mb-3 min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground italic">
            Ensure notice period aligns with region policy.
          </p>
        </Card>
      </motion.div>

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
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
          className="w-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
          size="lg"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Sending to candidates...
            </>
          ) : (
            "Send to Candidates"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
