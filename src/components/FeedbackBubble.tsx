import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedbackModal } from "./FeedbackModal";
import { CA4_SupportPanel } from "@/components/flows/company-admin-v4/CA4_SupportPanel";

export const FeedbackBubble = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Flow 6 v4 (Agentic): bubble becomes Support + Feedback entry point
  const isFlow6V4 = location.pathname === "/flows/company-admin-dashboard-v4";

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
                isFlow6V4
                  ? cn(
                      "transform-gpu will-change-transform origin-bottom-right",
                      "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
                      "hover:scale-[1.06] hover:bg-primary/10 hover:border-primary/30",
                      "active:scale-[0.98]"
                    )
                  : cn(
                      "transition-all duration-300 ease-out",
                      "hover:scale-110 hover:-translate-y-0.5 hover:bg-primary/10 hover:border-primary/30"
                    ),
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
            <p>{isFlow6V4 ? "Help & feedback" : "Share feedback"}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {isFlow6V4 ? (
        <CA4_SupportPanel isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      ) : (
        <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
