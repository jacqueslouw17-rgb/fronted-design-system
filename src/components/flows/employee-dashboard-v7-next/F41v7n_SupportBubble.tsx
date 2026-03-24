/**
 * F41v7n_SupportBubble - Help bubble for Flow 4.1 v8 Next
 * Standard styling. Isolated — does NOT affect any other flow.
 */

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { F41v7n_SupportPanel } from "./F41v7n_SupportPanel";

export const F41v7n_SupportBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className={cn(
                "fixed bottom-6 right-4 sm:bottom-8 sm:right-8 h-11 w-11 sm:h-12 sm:w-12 rounded-full",
                "bg-primary/5 border border-primary/20",
                "transition-all duration-300 ease-out",
                "hover:scale-110 hover:-translate-y-0.5 hover:bg-primary/10 hover:border-primary/30",
                "shadow-card hover:shadow-elevated",
                "group z-[100]"
              )}
              size="icon"
              variant="ghost"
            >
              <MessageSquare className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs pointer-events-none">
            <p>Help & feedback</p>
          </TooltipContent>
        </Tooltip>
      )}
      <F41v7n_SupportPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
