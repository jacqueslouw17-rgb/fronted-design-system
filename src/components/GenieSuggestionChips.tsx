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

interface GenieSuggestionChipsProps {
  chips: SuggestionChip[];
  className?: string;
}

const getChipStyles = (variant: ChipVariant = "default") => {
  const baseStyles = "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95";
  
  const variantStyles = {
    default: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
    primary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    info: "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
    critical: "border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10",
    disabled: "border border-muted bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60 hover:scale-100",
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

export const GenieSuggestionChips = ({ chips, className }: GenieSuggestionChipsProps) => {
  if (!chips.length) return null;

  // Limit to max 5 chips as per spec
  const visibleChips = chips.slice(0, 5);

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
