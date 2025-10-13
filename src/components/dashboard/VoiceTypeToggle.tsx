import { Mic, Keyboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VoiceTypeToggleProps {
  mode: "voice" | "text";
  isListening?: boolean;
  isProcessing?: boolean;
  error?: string | null;
  onToggle: () => void;
  disabled?: boolean;
}

const VoiceTypeToggle = ({ 
  mode, 
  isListening = false, 
  isProcessing = false,
  error,
  onToggle,
  disabled = false
}: VoiceTypeToggleProps) => {
  const isVoiceMode = mode === "voice";
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Status Light */}
        {isVoiceMode && (
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            isListening && !error ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted",
            error && "bg-destructive"
          )} />
        )}

        {/* Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              disabled={disabled || isProcessing}
              className={cn(
                "relative transition-all duration-200",
                isListening && "text-primary"
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isVoiceMode ? (
                <>
                  <Mic className={cn(
                    "h-4 w-4 transition-transform",
                    isListening && "scale-110"
                  )} />
                  {/* Waveform effect when listening */}
                  {isListening && (
                    <span className="absolute inset-0 rounded-md bg-primary/10 animate-pulse" />
                  )}
                </>
              ) : (
                <Keyboard className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {error ? (
              <span className="text-destructive text-xs">{error}</span>
            ) : isVoiceMode ? (
              <span>Switch to typing — precise and quiet</span>
            ) : (
              <span>Switch to voice mode — talk naturally</span>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default VoiceTypeToggle;
