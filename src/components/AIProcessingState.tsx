import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIProcessingStateProps {
  visible?: boolean;
  position?: { x: number; y: number };
  state?: "thinking" | "editing" | "processing";
  className?: string;
}

export const AIProcessingState: React.FC<AIProcessingStateProps> = ({
  visible = false,
  position,
  state = "thinking",
  className,
}) => {
  if (!visible) return null;

  const stateText = {
    thinking: "Thinking",
    editing: "Editing",
    processing: "Processing",
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-2 rounded-full border border-border bg-popover/95 px-4 py-2 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-1",
        className
      )}
      style={
        position
          ? {
              top: `${position.y}px`,
              left: `${position.x}px`,
              transform: "translateX(-50%)",
            }
          : undefined
      }
    >
      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
      <span className="text-sm font-medium text-foreground">
        {stateText[state]}
        <span className="animate-pulse">...</span>
      </span>
    </div>
  );
};
