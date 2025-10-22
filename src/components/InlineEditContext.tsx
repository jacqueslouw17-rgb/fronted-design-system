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

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("selectionchange", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("selectionchange", handleTextSelection);
    };
  }, []);

  // Format content with enhanced heading hierarchy
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line is a numbered heading (e.g., "1. POSITION AND DUTIES")
      const isHeading = /^\d+\.\s+[A-Z\s]+$/.test(line.trim());
      // Check if line is the main title
      const isTitle = line.trim() === 'EMPLOYMENT AGREEMENT';
      
      if (isTitle) {
        return (
          <div key={index} className="font-semibold mb-4">
            {line}
          </div>
        );
      } else if (isHeading) {
        return (
          <div key={index} className="font-semibold mt-6 mb-2">
            {line}
          </div>
        );
      } else if (line.trim()) {
        return <div key={index}>{line}</div>;
      } else {
        return <div key={index} className="h-4" />;
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[200px] rounded-lg border border-border bg-card p-6 transition-all duration-200",
        "hover:border-muted-foreground/20",
        className
      )}
    >
      <div 
        className="prose prose-sm max-w-none text-foreground transition-all duration-300"
      >
        {formatContent(content)}
      </div>
      {children}
    </div>
  );
};
