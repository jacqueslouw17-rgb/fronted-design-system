import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Plus, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEdit: () => void;
  onAddAdjustment: () => void;
  onSkipInBatch: () => void;
  onResetToDefaults: () => void;
  className?: string;
}

export const CA_BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkEdit,
  onAddAdjustment,
  onSkipInBatch,
  onResetToDefaults,
  className,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-primary/20 rounded-t-lg",
        className
      )}
    >
      <span className="text-sm font-medium text-foreground">
        {selectedCount} worker{selectedCount !== 1 ? "s" : ""} selected
      </span>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" className="h-8 text-xs gap-1.5">
              Bulk actions
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg z-50">
            <DropdownMenuItem
              onClick={onBulkEdit}
              className="gap-2 cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              <span>Edit payroll for selected…</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onAddAdjustment}
              className="gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add one-time adjustment…</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onSkipInBatch}
              className="gap-2 cursor-pointer"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip in this batch</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onResetToDefaults}
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to defaults</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={onClearSelection}
        >
          Clear selection
        </Button>
      </div>
    </div>
  );
};
