import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <motion.button
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAnyUpdates}
        className={cn(
          "group relative px-4 py-2 rounded-full text-xs font-medium",
          "bg-gradient-to-br from-background via-background to-primary/5",
          "border border-border/40 shadow-sm",
          "transition-all duration-300 ease-out",
          "flex items-center gap-2",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
        )}
        aria-label="Any Updates"
      >
        <span className={cn(
          "transition-colors duration-200",
          "text-muted-foreground group-hover:text-primary"
        )}>
          <AlertCircle className="h-3.5 w-3.5" />
        </span>
        <span className="text-foreground">Any Updates?</span>
      </motion.button>
      
      <motion.button
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAskKurt}
        className={cn(
          "group relative px-4 py-2 rounded-full text-xs font-medium",
          "bg-gradient-to-br from-background via-background to-primary/5",
          "border border-border/40 shadow-sm",
          "transition-all duration-300 ease-out",
          "flex items-center gap-2",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
        )}
        aria-label="Ask Kurt"
      >
        <span className={cn(
          "transition-colors duration-200",
          "text-muted-foreground group-hover:text-primary"
        )}>
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="text-foreground">Ask Kurt</span>
      </motion.button>
    </div>
  );
};

export default AgentHeaderTags;
