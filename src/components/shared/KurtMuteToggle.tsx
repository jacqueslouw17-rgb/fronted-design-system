import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KurtMuteToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  className?: string;
}

const KurtMuteToggle = ({ isMuted, onToggle, className = "" }: KurtMuteToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`h-7 w-7 text-muted-foreground hover:text-foreground transition-colors ${className}`}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          {isMuted ? "Kurt is muted — click to hear updates aloud" : "Kurt is speaking — click to mute"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KurtMuteToggle;
