import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiffViewer } from "./DiffViewer";
import { cn } from "@/lib/utils";

export type ChangeType = "new" | "modified" | "deprecated";
export type Severity = "low" | "medium" | "high";

export interface RuleChange {
  id: string;
  type: ChangeType;
  name: string;
  effectiveDate: string;
  severity: Severity;
  oldText?: string;
  newText: string;
}

interface RuleChangeChipProps {
  change: RuleChange;
  onOpenModule?: () => void;
  className?: string;
}

export const RuleChangeChip = ({ change, onOpenModule, className }: RuleChangeChipProps) => {
  const [expanded, setExpanded] = useState(false);

  const typeColors = {
    new: "primary",
    modified: "default",
    deprecated: "destructive"
  } as const;

  const severityColors = {
    low: "default",
    medium: "default",
    high: "destructive"
  } as const;

  return (
    <div className={cn("space-y-2", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/40 transition-colors text-left"
      >
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <Badge variant={typeColors[change.type]}>
            {change.type}
          </Badge>
          <span className="font-medium text-sm">{change.name}</span>
          <span className="text-xs text-muted-foreground">
            Effective: {change.effectiveDate}
          </span>
          <Badge variant={severityColors[change.severity]} className="ml-auto">
            {change.severity}
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && change.oldText && (
        <div className="pl-3">
          <DiffViewer
            oldText={change.oldText}
            newText={change.newText}
            onOpenModule={onOpenModule}
          />
        </div>
      )}
    </div>
  );
};
