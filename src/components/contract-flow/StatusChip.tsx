import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "ready" | "pending" | "review";

interface StatusChipProps {
  type: StatusType;
  label: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ type, label, className }) => {
  const config = {
    ready: {
      icon: CheckCircle2,
      className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
    },
    pending: {
      icon: Clock,
      className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
    },
    review: {
      icon: AlertCircle,
      className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
    },
  };

  const { icon: Icon, className: statusClassName } = config[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        "transition-all duration-200 hover:scale-105",
        statusClassName,
        className
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};
