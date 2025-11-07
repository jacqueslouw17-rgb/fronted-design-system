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
        variant="outline"
        size="sm"
        onClick={onAnyUpdates}
        className="rounded-full h-9 px-4 gap-2 border-primary/40 text-foreground bg-background/80 backdrop-blur-sm shadow-[0_2px_0_0_hsl(var(--foreground)/0.06),0_8px_24px_-12px_hsl(var(--primary)/0.35)] hover:bg-primary/5 hover:border-primary/50 transition-all"
        aria-label="Any Updates"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Any Updates?
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAskKurt}
        className="rounded-full h-9 px-4 gap-2 border-primary/20 text-foreground/90 bg-gradient-to-b from-background/80 to-primary/10 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.35)] hover:from-background/70 hover:to-primary/15 hover:border-primary/30 transition-all"
        aria-label="Ask Kurt"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask Kurt
      </Button>
    </div>
  );
};

export default AgentHeaderTags;
