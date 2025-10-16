import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceBadgeProps {
  country: string;
  status: "compliant" | "pending_review" | "requires_action" | "non_compliant";
  message?: string;
  className?: string;
}

const statusConfig = {
  compliant: {
    icon: CheckCircle2,
    label: "Compliant",
    color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  pending_review: {
    icon: Clock,
    label: "Pending Review",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  requires_action: {
    icon: AlertTriangle,
    label: "Requires Action",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
  non_compliant: {
    icon: XCircle,
    label: "Non-Compliant",
    color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
};

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  country,
  status,
  message,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", config.color, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label} for {country}</span>
    </Badge>
  );

  if (message) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
