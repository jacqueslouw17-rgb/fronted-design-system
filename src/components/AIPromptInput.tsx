import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Hash, AtSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface AIPromptInputProps {
  visible?: boolean;
  position?: { x: number; y: number };
  onSubmit?: (prompt: string) => void;
  onClose?: () => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  visible = false,
  position,
  onSubmit,
  onClose,
  placeholder = "Ask AI anything...",
  suggestions = ["Improve writing", "Make it shorter", "Fix grammar"],
  className,
}) => {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit?.(prompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose?.();
    }
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 w-[500px] animate-in fade-in-0 slide-in-from-top-2 duration-200",
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
      <div className="rounded-lg border border-border bg-popover/95 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2 p-3">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          
          <Button
            variant="default"
            size="sm"
            className="h-9 rounded-md px-3"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="border-t border-border p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
                  onClick={() => {
                    setPrompt(suggestion);
                    onSubmit?.(suggestion);
                    setPrompt("");
                  }}
                >
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
