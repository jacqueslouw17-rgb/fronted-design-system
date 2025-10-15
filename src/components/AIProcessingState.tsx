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
        "fixed z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200",
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
      <div className="rounded-lg border border-border bg-popover/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="font-medium text-foreground">
            {state === "thinking" ? "Gelo is thinking..." : "Applying changes..."}
          </span>
        </div>
      </div>
    </div>
  );
};
