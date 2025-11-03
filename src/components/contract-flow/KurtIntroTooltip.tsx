import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface KurtIntroTooltipProps {
  onDismiss?: () => void;
  context?: string;
}

export const KurtIntroTooltip: React.FC<KurtIntroTooltipProps> = ({
  onDismiss,
  context = "contract-creation"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if tooltip has been shown before for this context
    const storageKey = `kurt-intro-shown-${context}`;
    const hasBeenShown = localStorage.getItem(storageKey);
    
    if (!hasBeenShown) {
      // Show after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [context]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Mark as shown in localStorage
    localStorage.setItem(`kurt-intro-shown-${context}`, 'true');
    onDismiss?.();
  };

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getMessage = () => {
    switch (context) {
      case "contract-creation":
        return "Hi there! I can show you what's missing, review the contract, or auto-fill data — just click a tag below to start.";
      case "contract-bundle":
        return "I can auto-attach required documents, check compliance, or review the bundle for you.";
      case "contract-review":
        return "I'm here to highlight changes, verify compliance, or preview contracts before sending.";
      case "signature-phase":
        return "I'll help you track signing status, resend links, or download signed contracts.";
      case "admin-dashboard":
        return "Hi there! I can track progress, resend links, or mark tasks complete — just click a tag below.";
      default:
        return "I can help you with this workflow — click any tag below to see what I can do.";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && !hasShown && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-50",
            "w-80 p-4 rounded-lg shadow-2xl",
            "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
            "border border-primary/30 backdrop-blur-sm",
            "-bottom-20"
          )}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Dismiss tooltip"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-full bg-primary/10">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                {getMessage()}
              </p>
            </div>
          </div>

          {/* Arrow pointing up */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gradient-to-br from-primary/10 to-background border-l border-t border-primary/30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
