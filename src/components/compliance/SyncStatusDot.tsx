import { cn } from "@/lib/utils";

export type SyncStatus = "idle" | "syncing" | "changed" | "error";

interface SyncStatusDotProps {
  status: SyncStatus;
  className?: string;
}

export const SyncStatusDot = ({ status, className }: SyncStatusDotProps) => {
  const dotClasses = {
    idle: "bg-muted border-border",
    syncing: "bg-primary/20 border-primary animate-pulse",
    changed: "bg-primary border-primary",
    error: "bg-destructive/20 border-destructive"
  };

  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full border",
        dotClasses[status],
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
};
