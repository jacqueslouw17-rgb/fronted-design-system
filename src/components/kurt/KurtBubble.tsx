import React from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KurtState } from "./KurtCoilot";

interface KurtBubbleProps {
  state: KurtState;
  message?: string;
  workingText?: string;
  onMinimize?: () => void;
  className?: string;
}

export const KurtBubble: React.FC<KurtBubbleProps> = ({
  state,
  message,
  workingText,
  onMinimize,
  className,
}) => {
  return (
    <motion.div
      layout
      className={cn(
        "relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Avatar with state indicator */}
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">K</span>
            </div>
            {/* Breathing animation ring */}
            {state !== "inactive" && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-sm">Kurt</h3>
            <p className="text-xs text-muted-foreground">
              {getStatusText(state)}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMinimize}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 min-w-[320px]">
        {state === "thinking" || state === "working" ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>{workingText || "Processing..."}</span>
          </div>
        ) : state === "responding" && message ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-foreground"
          >
            {message}
          </motion.p>
        ) : state === "idle" ? (
          <p className="text-sm text-muted-foreground">
            I'll stay here if you need me 👋
          </p>
        ) : null}
      </div>

      {/* Progress bar for working state */}
      {state === "working" && (
        <motion.div
          className="h-1 bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};

function getStatusText(state: KurtState): string {
  switch (state) {
    case "thinking":
      return "Thinking...";
    case "working":
      return "Working on it...";
    case "responding":
      return "Here you go";
    case "idle":
      return "Ready to help";
    default:
      return "AI Co-pilot";
  }
}
