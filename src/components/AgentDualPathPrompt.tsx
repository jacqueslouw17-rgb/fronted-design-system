import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type PathMode = "ai-led" | "manual" | null;

export type DualPathPromptProps = {
  title: string;
  description?: string;
  aiOption: {
    label: string;
    description: string;
    tooltip?: string;
  };
  manualOption: {
    label: string;
    description: string;
    tooltip?: string;
  };
  onSelect: (mode: PathMode) => void;
  currentMode?: PathMode;
  className?: string;
};

export const AgentDualPathPrompt = ({
  title,
  description,
  aiOption,
  manualOption,
  onSelect,
  currentMode,
  className,
}: DualPathPromptProps) => {
  const [selectedMode, setSelectedMode] = useState<PathMode>(currentMode || null);

  const handleSelect = (mode: PathMode) => {
    setSelectedMode(mode);
    onSelect(mode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      <Card className="p-4 border-2 shadow-lg">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Choice Buttons */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* AI-Led Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Button
              variant="outline"
              className={cn(
                "w-full h-auto flex-col items-start p-4 text-left gap-2 transition-all hover:bg-primary/5 hover:border-primary/40",
                selectedMode === "ai-led" && "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => handleSelect("ai-led")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold">{aiOption.label}</span>
                {aiOption.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{aiOption.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-normal">
                {aiOption.description}
              </p>
            </Button>
            {selectedMode === "ai-led" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {/* Manual Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Button
              variant="outline"
              className={cn(
                "w-full h-auto flex-col items-start p-4 text-left gap-2 transition-all hover:bg-foreground/5 hover:border-border",
                selectedMode === "manual" && "border-border bg-foreground/5 ring-2 ring-border ring-offset-2"
              )}
              onClick={() => handleSelect("manual")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-1.5 rounded-md bg-muted">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-semibold">{manualOption.label}</span>
                {manualOption.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{manualOption.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-normal">
                {manualOption.description}
              </p>
            </Button>
            {selectedMode === "manual" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          You're in control — choose how we work together
        </p>
      </Card>
    </motion.div>
  );
};

export const PathModeBadge = ({ mode }: { mode: PathMode }) => {
  if (!mode) return null;

  const config = {
    "ai-led": {
      label: "AI-Led Mode",
      icon: Sparkles,
      variant: "default" as const,
    },
    manual: {
      label: "Manual Mode",
      icon: User,
      variant: "secondary" as const,
    },
  };

  const { label, icon: Icon, variant } = config[mode];

  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};

export default AgentDualPathPrompt;
