import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SyncStatusDot, SyncStatus } from "./SyncStatusDot";
import { cn } from "@/lib/utils";

interface ComplianceIconProps {
  status: SyncStatus;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const ComplianceIcon = ({ status, count, onClick, className }: ComplianceIconProps) => {
  const tooltipContent = {
    idle: "Compliance up to date",
    syncing: "Syncing changes...",
    changed: "Updates available",
    error: "Sync failed"
  };

  const showBadge = status === "changed" || status === "error";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn("relative", className)}
            aria-label="Open compliance drawer"
          >
            <Shield className="h-5 w-5 text-foreground/70" />
            
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-background">
                {status === "error" ? (
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                ) : (
                  <span className="text-xs font-medium text-primary">
                    {count || "!"}
                  </span>
                )}
              </span>
            )}
            
            {status === "syncing" && (
              <span className="absolute inset-0 rounded-md border-2 border-primary animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <SyncStatusDot status={status} />
            <span>{tooltipContent[status]}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
