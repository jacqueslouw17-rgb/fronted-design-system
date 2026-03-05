import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleFlowGroupProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleFlowGroup = ({ label, children, defaultOpen = true }: CollapsibleFlowGroupProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full group cursor-pointer"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && children}
    </div>
  );
};

export default CollapsibleFlowGroup;
