import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface AcknowledgePillProps {
  status: "accepted" | "declined";
  user?: string;
  timestamp?: string;
  autoHide?: boolean;
  className?: string;
}

export const AcknowledgePill: React.FC<AcknowledgePillProps> = ({
  status,
  user = "Kurt",
  timestamp,
  autoHide = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [autoHide]);

  if (!isVisible) return null;

  const isAccepted = status === "accepted";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 animate-in fade-in slide-in-from-top-1",
        isAccepted
          ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
          : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
        className
      )}
    >
      {isAccepted ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-medium">
        {isAccepted ? "Applied" : "Declined"} by {user}
      </span>
      {timestamp && (
        <span className="text-xs opacity-70">{timestamp}</span>
      )}
    </Badge>
  );
};
