import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualBadgeProps {
  text: string;
  explanation: string;
  onApplyGlobally?: () => void;
  className?: string;
}

export const ContextualBadge: React.FC<ContextualBadgeProps> = ({
  text,
  explanation,
  onApplyGlobally,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <Badge
        variant="secondary"
        className="cursor-pointer hover:scale-105 transition-transform duration-150 bg-primary/10 text-primary hover:bg-primary/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        {text}
      </Badge>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-80"
          >
            <Card className="p-4 shadow-lg border border-primary/20">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-foreground">Kurt's Context</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{explanation}</p>
              {onApplyGlobally && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onApplyGlobally();
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Yes, apply globally
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Keep local version
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
