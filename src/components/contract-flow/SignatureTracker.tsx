import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SignatureStatus = "sent" | "viewed" | "signed" | "declined";

interface SignatureTrackerProps {
  status: SignatureStatus;
  className?: string;
}

const statusConfig: Record<SignatureStatus, { label: string; icon: React.ReactNode; color: string }> = {
  sent: {
    label: "Sent",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  viewed: {
    label: "Viewed",
    icon: <Eye className="h-3 w-3" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  signed: {
    label: "Signed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  declined: {
    label: "Declined",
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export const SignatureTracker: React.FC<SignatureTrackerProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <Badge className={cn("flex items-center gap-1.5", config.color, className)}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};
