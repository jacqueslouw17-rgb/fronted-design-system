import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineEditContextProps {
  content: string;
  onContentChange?: (newContent: string) => void;
  onSelect?: (text: string, position: { x: number; y: number }) => void;
  children?: React.ReactNode;
  className?: string;
}

export const InlineEditContext: React.FC<InlineEditContextProps> = ({
  content,
  onContentChange,
  onSelect,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || "";
    
    if (text && containerRef.current?.contains(selection?.anchorNode || null)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      onSelect?.(text, {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    } else if (!text) {
      onSelect?.("", { x: 0, y: 0 });
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || "";
    onContentChange?.(newContent);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

  // Update content when it changes from parent
  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== content) {
      contentRef.current.textContent = content;
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[200px] rounded-lg border border-border bg-card p-6 transition-all duration-200",
        "hover:border-primary/20 focus-within:border-primary/40",
        className
      )}
    >
      <div 
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        className={cn(
          "prose prose-sm max-w-none text-foreground transition-all duration-300",
          "focus:outline-none whitespace-pre-wrap"
        )}
      >
        {content}
      </div>
      {children}
    </div>
  );
};
