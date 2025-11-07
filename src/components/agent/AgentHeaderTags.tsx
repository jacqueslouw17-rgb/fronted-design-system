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
        className="rounded-full h-9 px-4 gap-2 border border-primary/30 text-foreground bg-background/90 backdrop-blur-sm shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        aria-label="Any Updates"
      >
        <AlertCircle className="h-3 w-3" />
        <span className="text-sm font-medium">Any Updates?</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAskKurt}
        className="rounded-full h-9 px-4 gap-2 border border-border/50 text-foreground bg-background/90 shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all"
        aria-label="Ask Kurt"
      >
        <Sparkles className="h-3 w-3" />
        <span className="text-sm font-medium">Ask Kurt</span>
      </Button>
    </div>
  );
};

export default AgentHeaderTags;
