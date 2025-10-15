import React from "react";
import { Check, X, Pen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface DecisionBarProps {
  onAccept?: () => void;
  onDecline?: () => void;
  onEdit?: () => void;
  visible?: boolean;
  className?: string;
}

export const DecisionBar: React.FC<DecisionBarProps> = ({
  onAccept,
  onDecline,
  onEdit,
  visible = false,
  className,
}) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex items-center gap-2 rounded-lg border border-border bg-background/95 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in slide-in-from-top-2",
        className
      )}
    >
      <span className="text-sm font-medium text-muted-foreground">Review AI changes:</span>
      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={onEdit}
        >
          <Pen className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-destructive hover:text-destructive"
          onClick={onDecline}
        >
          <X className="h-3.5 w-3.5" />
          Decline
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-2"
          onClick={onAccept}
        >
          <Check className="h-3.5 w-3.5" />
          Accept
        </Button>
      </div>
    </div>
  );
};
