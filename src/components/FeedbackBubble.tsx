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
              "fixed bottom-6 right-6 h-12 w-12 rounded-full z-50",
              "bg-card border border-border",
              "transition-all duration-300 ease-out",
              "hover:scale-110 hover:-translate-y-0.5",
              "shadow-card hover:shadow-elevated",
              "group"
            )}
            size="icon"
            variant="ghost"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          <p>Share feedback</p>
        </TooltipContent>
      </Tooltip>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
