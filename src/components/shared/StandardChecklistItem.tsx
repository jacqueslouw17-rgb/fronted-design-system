import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardChecklistItemProps {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  status?: "pending" | "completed" | "overdue" | "in-progress";
  disabled?: boolean;
  className?: string;
}

const StandardChecklistItem = ({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  status = "pending",
  disabled = false,
  className = ""
}: StandardChecklistItemProps) => {
  const statusConfig = {
    pending: { icon: Clock, label: "Pending", variant: "outline" as const, color: "text-muted-foreground" },
    "in-progress": { icon: Clock, label: "In Progress", variant: "default" as const, color: "text-blue-600 dark:text-blue-400" },
    completed: { icon: Check, label: "Completed", variant: "default" as const, color: "text-emerald-600 dark:text-emerald-400" },
    overdue: { icon: AlertCircle, label: "Overdue", variant: "destructive" as const, color: "text-destructive" }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/40 transition-all duration-200",
      checked && "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium leading-tight cursor-pointer",
              checked && "line-through text-muted-foreground"
            )}
          >
            {title}
          </label>
          
          <Badge 
            variant={config.variant}
            className="flex items-center gap-1 text-xs shrink-0"
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        
        {description && (
          <p className={cn(
            "text-xs text-muted-foreground leading-tight",
            checked && "line-through"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StandardChecklistItem;
