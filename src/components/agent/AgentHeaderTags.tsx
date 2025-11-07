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
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAnyUpdates}
        className="rounded-full h-9 px-4 gap-2 border border-primary/50 text-foreground bg-background/90 backdrop-blur-sm shadow-[0_1px_0_0_hsl(var(--foreground)/0.06),0_10px_24px_-12px_hsl(var(--primary)/0.40)] hover:bg-primary/10 hover:border-primary hover:text-foreground transition-all hover:scale-105"
        aria-label="Any Updates"
      >
        <AlertCircle className="h-3 w-3" />
        <span className="text-sm font-medium">Any Updates?</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAskKurt}
        className="rounded-full h-9 px-4 gap-2 border border-border/50 text-foreground bg-gradient-to-b from-background/90 to-primary/10 shadow-[0_10px_24px_-12px_hsl(var(--primary)/0.35)] hover:to-primary/20 hover:border-primary/30 transition-all hover:scale-105"
        aria-label="Ask Kurt"
      >
        <Sparkles className="h-3 w-3" />
        <span className="text-sm font-medium">Ask Kurt</span>
      </Button>
    </div>
  );
};

export default AgentHeaderTags;
