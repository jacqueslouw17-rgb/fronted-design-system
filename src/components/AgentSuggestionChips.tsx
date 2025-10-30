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
  const baseStyles = "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95";
  
  const variantStyles = {
    default: "border border-border bg-background hover:bg-primary/5 hover:border-primary/40",
    primary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    info: "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
    critical: "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
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