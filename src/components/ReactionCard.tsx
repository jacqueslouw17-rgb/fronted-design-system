import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { logReaction, type ReactionRecord, type Sentiment } from "@/hooks/useReactionAnalytics";

export type ReactionCardProps = {
  flowId: string;
  userRole: string;
  messageId?: string;
  delayMs?: number;
  className?: string;
  onReact?: (record: ReactionRecord) => void;
};

const sentiments: { key: Sentiment; emoji: string; label: string }[] = [
  { key: "positive", emoji: "😊", label: "Clear / Helpful" },
  { key: "neutral", emoji: "😐", label: "Okay / Neutral" },
  { key: "negative", emoji: "😕", label: "Confusing / Not helpful" },
];

const EmojiButton: React.FC<{
  active?: boolean;
  onClick?: () => void;
  emoji: string;
  label: string;
}> = ({ active, onClick, emoji, label }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className={cn(
            "h-8 w-8 rounded-md grid place-items-center border transition-all",
            "text-muted-foreground hover:text-foreground",
            active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border bg-background"
          )}
        >
          <span className="text-base leading-none">{emoji}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export const FeedbackBar: React.FC<{
  selected?: Sentiment | null;
  onSelect: (s: Sentiment) => void;
}> = ({ selected, onSelect }) => {
  return (
    <div className="flex items-center gap-2">
      {sentiments.map((s) => (
        <EmojiButton
          key={s.key}
          emoji={s.emoji}
          label={s.label}
          active={selected === s.key}
          onClick={() => onSelect(s.key)}
        />
      ))}
    </div>
  );
};

export const ReactionCard: React.FC<ReactionCardProps> = ({
  flowId,
  userRole,
  messageId,
  delayMs = 1500,
  className,
  onReact,
}) => {
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<Sentiment | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const hint = useMemo(() => "How did this feel?", []);

  const handleSelect = (s: Sentiment) => {
    setSelected(s);
    const rec = logReaction({ flowId, userRole, messageId, sentiment: s });
    onReact?.(rec);
    setAck(true);
    toast({ title: "Thanks for sharing" });
    const t = setTimeout(() => setAck(false), 1200);
    return () => clearTimeout(t);
  };

  const submitWhy = () => {
    if (!selected || !reason.trim()) return;
    const rec = logReaction({ flowId, userRole, messageId, sentiment: selected, reasonText: reason.trim() });
    onReact?.(rec);
    setReason("");
    setShowWhy(false);
    toast({ title: "Got it — thanks!" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn("mt-2", className)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">Feedback</div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex">
                    <FeedbackBar selected={selected} onSelect={handleSelect} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{hint}</TooltipContent>
              </Tooltip>

              {selected && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowWhy((v) => !v)}>
                  Why?
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[20px]">
            <AnimatePresence>
              {ack && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  Thanks for your feedback
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showWhy && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 flex items-center gap-2"
              >
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="One line — what could be better?"
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8" onClick={submitWhy}>
                  Send
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReactionCard;
