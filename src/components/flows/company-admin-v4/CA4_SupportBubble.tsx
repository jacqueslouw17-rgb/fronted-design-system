/**
 * CA4_SupportBubble - Bottom-right bubble for Flow 6 v4
 * 
 * Uses the same visual style as the original FeedbackBubble,
 * but opens the CA4_SupportPanel with Support + Feedback cards.
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
import { CA4_SupportPanel } from "./CA4_SupportPanel";

export const CA4_SupportBubble: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {!isModalOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "fixed bottom-8 right-8 h-12 w-12 rounded-full",
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
          <TooltipContent side="left" className="text-xs">
            <p>Help & feedback</p>
          </TooltipContent>
        </Tooltip>
      )}

      <CA4_SupportPanel 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
