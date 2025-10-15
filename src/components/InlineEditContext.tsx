import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineEditContextProps {
  content: string;
  role?: string;
  onSelect?: (text: string, range: { start: number; end: number }) => void;
  onChange?: (newContent: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const InlineEditContext: React.FC<InlineEditContextProps> = ({
  content,
  role = "user",
  onSelect,
  onChange,
  children,
  className,
}) => {
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || "";
    
    if (text && containerRef.current?.contains(selection?.anchorNode || null)) {
      const range = selection?.getRangeAt(0);
      const preSelectionRange = range?.cloneRange();
      preSelectionRange?.selectNodeContents(containerRef.current);
      preSelectionRange?.setEnd(range?.startContainer || containerRef.current, range?.startOffset || 0);
      
      const start = preSelectionRange?.toString().length || 0;
      const end = start + text.length;
      
      setSelectedText(text);
      setSelectionRange({ start, end });
      onSelect?.(text, { start, end });
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/20",
        className
      )}
      data-role={role}
    >
      <div className="prose prose-sm max-w-none">
        {content}
      </div>
      {children}
    </div>
  );
};
