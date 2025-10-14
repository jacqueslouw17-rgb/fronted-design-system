import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Lightbulb, Clock, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HintAction = {
  id: string;
  label: string;
  context?: string;
  urgency?: "low" | "medium" | "high";
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

export type PredictiveHintBarProps = {
  suggestions: HintAction[];
  context?: string;
  onDismiss?: () => void;
  className?: string;
};

const urgencyConfig = {
  low: { color: "bg-blue-500", label: "Suggested" },
  medium: { color: "bg-orange-500", label: "Soon" },
  high: { color: "bg-red-500", label: "Urgent" },
};

export const GeniePredictiveHintBar = ({
  suggestions,
  context,
  onDismiss,
  className,
}: PredictiveHintBarProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-2xl",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Icon + Context */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm">Next best action</div>
                {context && (
                  <div className="text-xs text-muted-foreground truncate">
                    {context}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                const urgency = suggestion.urgency || "low";
                const urgencyStyle = urgencyConfig[urgency];

                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={suggestion.onClick}
                          className="gap-2 relative hover:bg-accent"
                        >
                          {/* Urgency indicator */}
                          {suggestion.urgency && suggestion.urgency !== "low" && (
                            <span
                              className={cn(
                                "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                                urgencyStyle.color
                              )}
                            />
                          )}
                          
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          <span className="whitespace-nowrap">{suggestion.label}</span>
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </Button>
                      </TooltipTrigger>
                      {suggestion.context && (
                        <TooltipContent side="top">
                          <p className="text-xs max-w-xs">{suggestion.context}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </motion.div>
                );
              })}
            </div>

            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="gap-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Dismiss</span>
            </Button>
          </div>

          {/* Urgency Legend (if any urgent items) */}
          {suggestions.some((s) => s.urgency && s.urgency !== "low") && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t">
              <Info className="w-3 h-3 text-muted-foreground" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {suggestions.some((s) => s.urgency === "high") && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Urgent action needed</span>
                  </div>
                )}
                {suggestions.some((s) => s.urgency === "medium") && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Recommended soon</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const HintActionBadge = ({ urgency }: { urgency: "low" | "medium" | "high" }) => {
  const config = urgencyConfig[urgency];
  return (
    <Badge variant="outline" className="gap-1.5 text-xs">
      <span className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
      {config.label}
    </Badge>
  );
};

export default GeniePredictiveHintBar;
