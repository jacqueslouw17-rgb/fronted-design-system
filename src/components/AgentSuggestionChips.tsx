import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

type ChipVariant = "default" | "primary" | "info" | "critical" | "disabled";

interface SuggestionChip {
  label: string;
  icon?: LucideIcon;
  variant?: ChipVariant;
  tooltip?: string;
  onAction?: () => void;
  disabled?: boolean;
}

interface AgentSuggestionChipsProps {
  chips: SuggestionChip[];
  className?: string;
}

const SuggestionChipButton = ({ 
  chip, 
  index 
}: { 
  chip: SuggestionChip; 
  index: number;
}) => {
  const Icon = chip.icon;
  const isDisabled = chip.disabled || chip.variant === "disabled";

  const handleClick = () => {
    if (isDisabled) return;
    
    // Show toast
    toast.success(`Action: ${chip.label}`);
    
    // Execute action
    chip.onAction?.();
  };

  const chipButton = (
    <motion.button
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={{ scale: isDisabled ? 1 : 1.04, y: -2 }}
      whileTap={{ scale: isDisabled ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "group relative px-4 py-2 rounded-full text-xs font-medium",
        "bg-gradient-to-br from-background via-background to-primary/5",
        "border border-border/40 shadow-sm",
        "transition-all duration-300 ease-out",
        "flex items-center gap-2",
        !isDisabled && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {Icon && (
        <span className={cn(
          "transition-colors duration-200",
          "text-muted-foreground group-hover:text-primary"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <span className="text-foreground">{chip.label}</span>
    </motion.button>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-wrap justify-center gap-2", className)}
    >
      {visibleChips.map((chip, index) => (
        <SuggestionChipButton 
          key={`${chip.label}-${index}`} 
          chip={chip} 
          index={index}
        />
      ))}
    </motion.div>
  );
};