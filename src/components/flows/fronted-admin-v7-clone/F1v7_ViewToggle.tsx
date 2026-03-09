/**
 * F1v7 View Toggle — Glassmorphism pill toggle for Board / List / Table views
 * ISOLATED: Only used in Flow 1 v7 (Future)
 */
import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "board" | "list" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { key: ViewMode; icon: React.ElementType; label: string }[] = [
  { key: "board", icon: LayoutGrid, label: "Board" },
  { key: "list", icon: List, label: "List" },
  { key: "table", icon: Table2, label: "Table" },
];

export const F1v7_ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange }) => {
  return (
    <div className="v7-view-toggle" role="radiogroup" aria-label="View mode">
      {modes.map((mode) => {
        const isActive = value === mode.key;
        const Icon = mode.icon;
        return (
          <button
            key={mode.key}
            role="radio"
            aria-checked={isActive}
            className={cn(
              "v7-view-toggle-item",
              isActive && "v7-view-toggle-item--active"
            )}
            onClick={() => onChange(mode.key)}
          >
            {isActive && (
              <motion.div
                layoutId="v7-view-indicator"
                className="v7-view-toggle-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="h-3.5 w-3.5 relative z-10" />
            <span className="text-[11px] font-medium relative z-10 hidden sm:inline">
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
