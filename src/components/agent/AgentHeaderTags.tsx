import React from "react";
import { Button } from "@/components/ui/button";
import { BellRing, MessageCircle } from "lucide-react";

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
        className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all rounded-xl shadow-sm"
        aria-label="Any Updates"
      >
        <BellRing className="h-3.5 w-3.5" />
        Any Updates?
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAskKurt}
        className="gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all rounded-xl shadow-sm"
        aria-label="Ask Kurt"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Ask Kurt
      </Button>
    </div>
  );
};

export default AgentHeaderTags;
