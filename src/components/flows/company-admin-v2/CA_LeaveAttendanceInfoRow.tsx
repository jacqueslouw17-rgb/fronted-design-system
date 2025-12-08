import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface CA_LeaveAttendanceInfoRowProps {
  trackedChanges: number;
  isLocked?: boolean;
  onViewDetails: () => void;
}

export const CA_LeaveAttendanceInfoRow: React.FC<CA_LeaveAttendanceInfoRowProps> = ({
  trackedChanges,
  isLocked = true,
  onViewDetails,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/30 bg-muted/20">
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-xs bg-background">
          Leave & Attendance
        </Badge>
        <span className="text-sm text-muted-foreground">
          {trackedChanges} tracked change{trackedChanges !== 1 ? "s" : ""} · {isLocked ? "Attendance locked for this batch" : "Attendance open"}
        </span>
      </div>
      <button
        onClick={onViewDetails}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        View details
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
