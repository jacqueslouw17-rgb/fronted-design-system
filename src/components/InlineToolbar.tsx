import React, { useState } from "react";
import { Sparkles, Type, MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface InlineToolbarProps {
  visible?: boolean;
  position?: { x: number; y: number };
  onAskAI?: () => void;
  onQuickAction?: (action: string) => void;
  className?: string;
}

export const InlineToolbar: React.FC<InlineToolbarProps> = ({
  visible = false,
  position,
  onAskAI,
  onQuickAction,
  className,
}) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-popover/95 p-1 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2",
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
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-2 text-xs font-medium hover:bg-muted text-foreground"
        onClick={onAskAI}
      >
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        Ask Gelo
      </Button>
      
      <div className="h-4 w-px bg-border" />
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-2 text-xs text-foreground hover:bg-muted"
        onClick={() => onQuickAction?.("improve")}
      >
        <Type className="h-3.5 w-3.5 text-muted-foreground" />
        Improve writing
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 hover:bg-muted"
        onClick={() => onQuickAction?.("more")}
      >
        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
};
