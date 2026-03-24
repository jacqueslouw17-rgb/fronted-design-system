/**
 * F41v8_SupportBubble - Help bubble for Flow 4.1 v9 Future
 * Glassmorphism styling. Isolated — does NOT affect any other flow.
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
import { F41v8_SupportPanel } from "./F41v8_SupportPanel";

export const F41v8_SupportBubble: React.FC = () => {
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
                "bg-[hsl(172_50%_50%/0.08)] border border-[hsl(172_50%_50%/0.2)]",
                "transform-gpu will-change-transform origin-bottom-right",
                "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
                "hover:scale-[1.06] hover:bg-[hsl(172_50%_50%/0.12)] hover:border-[hsl(172_50%_50%/0.3)]",
                "active:scale-[0.98]",
                "shadow-card hover:shadow-elevated",
                "backdrop-blur-sm",
                "group z-[100]"
              )}
              size="icon"
              variant="ghost"
            >
              <MessageSquare className="h-4 w-4 text-[hsl(172_50%_40%/0.7)] group-hover:text-[hsl(172_50%_40%)] transition-colors" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs pointer-events-none">
            <p>Help & feedback</p>
          </TooltipContent>
        </Tooltip>
      )}
      <F41v8_SupportPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
