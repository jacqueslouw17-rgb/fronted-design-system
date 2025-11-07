import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles } from "lucide-react";

interface AgentHeaderTagsProps {
  onAnyUpdates: () => void;
  onAskKurt: () => void;
  className?: string;
}

export const AgentHeaderTags: React.FC<AgentHeaderTagsProps> = ({
  onAnyUpdates,
  onAskKurt,
  className = "",
}) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAnyUpdates}
        className="rounded-full h-10 px-5 gap-2 border border-primary/40 text-foreground bg-background/95 backdrop-blur-sm shadow-[0_12px_28px_-12px_hsl(var(--primary)/0.45)] hover:bg-primary/5 hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 transition-all"
        aria-label="Any Updates"
      >
        <AlertCircle className="h-3 w-3 text-primary" />
        <span className="text-sm font-medium">Any Updates?</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAskKurt}
        className="rounded-full h-10 px-5 gap-2 border border-border/50 text-foreground bg-gradient-to-b from-background/95 to-primary/10 shadow-[0_10px_24px_-12px_hsl(var(--primary)/0.35)] hover:to-primary/20 hover:border-primary/30 hover:scale-105 transition-all"
        aria-label="Ask Kurt"
      >
        <Sparkles className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm font-medium">Ask Kurt</span>
      </Button>
    </div>
  );
};

export default AgentHeaderTags;
