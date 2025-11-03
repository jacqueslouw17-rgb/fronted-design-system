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
  const isUserEditingRef = useRef(false);

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
    isUserEditingRef.current = true;
    const newContent = e.currentTarget.textContent || "";
    onContentChange?.(newContent);
  };

  const handleBlur = () => {
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 100);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

  // Update content only when it changes from parent and user is not editing
  useEffect(() => {
    if (contentRef.current && !isUserEditingRef.current && contentRef.current.textContent !== content) {
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
        onBlur={handleBlur}
        suppressContentEditableWarning
        className={cn(
          "prose prose-sm max-w-none text-foreground transition-all duration-300",
          "focus:outline-none whitespace-pre-wrap min-h-[400px]"
        )}
      >
        {content}
      </div>
      {children}
    </div>
  );
};
