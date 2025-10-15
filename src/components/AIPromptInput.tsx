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
        "fixed z-50 w-[500px] animate-in fade-in slide-in-from-top-2",
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
      <div className="rounded-lg border border-border bg-popover shadow-lg">
        <div className="flex items-center gap-2 border-b border-border p-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 w-7 rounded-full p-0"
              onClick={handleSubmit}
              disabled={!prompt.trim()}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="p-3">
            <p className="mb-2 text-xs text-muted-foreground">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setPrompt(suggestion);
                    onSubmit?.(suggestion);
                  }}
                >
                  <Sparkles className="mr-1 h-3 w-3 text-muted-foreground" />
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
