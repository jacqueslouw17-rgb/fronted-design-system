import React, { useState, useEffect } from "react";
import { Wand2, Type, AlignLeft, Languages, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SmartMenuOption {
  label: string;
  icon?: React.ReactNode;
  action: string;
}

interface SmartMenuProps {
  options?: SmartMenuOption[];
  onAction?: (action: string) => void;
  position?: { x: number; y: number };
  visible?: boolean;
  className?: string;
}

const defaultOptions: SmartMenuOption[] = [
  { label: "Rewrite", icon: <Wand2 className="h-4 w-4" />, action: "rewrite" },
  { label: "Simplify", icon: <AlignLeft className="h-4 w-4" />, action: "simplify" },
  { label: "Explain", icon: <FileText className="h-4 w-4" />, action: "explain" },
  { label: "Translate", icon: <Languages className="h-4 w-4" />, action: "translate" },
  { label: "Enhance", icon: <Sparkles className="h-4 w-4" />, action: "enhance" },
];

export const SmartMenu: React.FC<SmartMenuProps> = ({
  options = defaultOptions,
  onAction,
  position,
  visible = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute z-50 flex gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg animate-in fade-in slide-in-from-top-2",
        className
      )}
      style={position ? { top: position.y, left: position.x } : undefined}
    >
      {options.map((option) => (
        <Button
          key={option.action}
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-xs"
          onClick={() => onAction?.(option.action)}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
};
