import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedbackModal } from "./FeedbackModal";

export const FeedbackBubble = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevated z-50",
              "bg-background border-2 transition-all duration-200",
              "hover:scale-105 hover:shadow-overlay",
              "border-[hsl(var(--accent-purple-outline))]"
            )}
            size="icon"
          >
            <MessageSquare className="h-5 w-5 text-[hsl(var(--accent-purple-outline))]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-sm">Share feedback or improvement ideas</p>
        </TooltipContent>
      </Tooltip>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
