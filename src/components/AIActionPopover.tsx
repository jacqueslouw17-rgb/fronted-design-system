import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

interface AIActionPopoverProps {
  suggestion?: string;
  confidence?: number;
  loading?: boolean;
  visible?: boolean;
  className?: string;
}

export const AIActionPopover: React.FC<AIActionPopoverProps> = ({
  suggestion,
  confidence = 0.85,
  loading = false,
  visible = false,
  className,
}) => {
  if (!visible) return null;

  return (
    <Card
      className={cn(
        "mt-2 border-primary/20 bg-accent/30 p-4 animate-in fade-in slide-in-from-top-1",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Kurt is drafting...</p>
            <p className="text-xs text-muted-foreground">Analyzing your content</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">AI Suggestion</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {Math.round(confidence * 100)}% confident
            </span>
          </div>
          <p className="text-sm text-foreground">{suggestion}</p>
        </div>
      )}
    </Card>
  );
};
