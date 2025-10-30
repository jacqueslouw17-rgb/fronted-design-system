import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ChipVariant = "default" | "primary" | "info" | "critical" | "disabled";

interface SuggestionChip {
  label: string;
  icon?: LucideIcon;
  variant?: ChipVariant;
  tooltip?: string;
  onAction?: () => void;
}

interface AgentSuggestionChipsProps {
  chips: SuggestionChip[];
  className?: string;
}

const getChipStyles = (variant: ChipVariant = "default") => {
  const baseStyles = "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 border border-border/30 backdrop-blur-sm";
  
  const variantStyles = {
    default: "bg-background/60 hover:bg-primary/[0.03] hover:border-primary/30",
    primary: "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 border-secondary/20",
    info: "bg-primary/[0.03] text-primary hover:bg-primary/[0.06] border-primary/20",
    critical: "bg-destructive/[0.06] text-destructive hover:bg-destructive/10 border-destructive/20",
    disabled: "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50 hover:scale-100 border-muted/30",
  };

  return cn(baseStyles, variantStyles[variant]);
};

const SuggestionChipButton = ({ 
  chip, 
  index 
}: { 
  chip: SuggestionChip; 
  index: number;
}) => {
  const Icon = chip.icon;
  const isDisabled = chip.variant === "disabled";

  const handleClick = () => {
    if (isDisabled) return;
    
    // Pulse animation feedback
    const button = document.getElementById(`chip-${index}`);
    if (button) {
      button.classList.add("animate-pulse");
      setTimeout(() => button.classList.remove("animate-pulse"), 300);
    }

    // Show toast
    toast.success(`Action: ${chip.label}`);
    
    // Execute action
    chip.onAction?.();
  };

  const chipButton = (
    <Button
      id={`chip-${index}`}
      variant="ghost"
      size="sm"
      className={getChipStyles(chip.variant)}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {chip.label}
    </Button>
  );

  if (chip.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {chipButton}
          </TooltipTrigger>
          <TooltipContent>
            <p>{chip.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return chipButton;
};

export const AgentSuggestionChips = ({ chips, className }: AgentSuggestionChipsProps) => {
  if (!chips.length) return null;

  // Limit to max 5 chips as per spec
  const visibleChips = chips.slice(0, 5);

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {visibleChips.map((chip, index) => (
          <SuggestionChipButton 
            key={`${chip.label}-${index}`} 
            chip={chip} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};