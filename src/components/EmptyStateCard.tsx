import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateCardProps {
  // Content
  title: string;
  description: string;
  icon?: LucideIcon;
  illustration?: ReactNode;
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  // Optional elements
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  genieHint?: string;
  tooltip?: string;
  
  // State
  state?: "default" | "pending" | "empty-filter" | "error" | "completed";
  
  // Styling
  className?: string;
}

export const EmptyStateCard = ({
  title,
  description,
  icon: Icon,
  illustration,
  primaryAction,
  secondaryAction,
  badge,
  genieHint,
  tooltip,
  state = "default",
  className,
}: EmptyStateCardProps) => {
  const isPending = state === "pending";
  
  const getStateColor = () => {
    switch (state) {
      case "error":
        return "text-destructive";
      case "completed":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center p-8 md:p-12">
        {/* Badge */}
        {badge && (
          <Badge variant={badge.variant || "secondary"} className="mb-4">
            {badge.label}
          </Badge>
        )}

        {/* Illustration or Icon */}
        <div className="mb-6 relative">
          {isPending ? (
            <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
          ) : illustration ? (
            illustration
          ) : Icon ? (
            <Icon className={cn("h-16 w-16", getStateColor())} />
          ) : null}
        </div>

        {/* Header with optional tooltip */}
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {title}
          </h3>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || "default"}
                disabled={isPending}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                disabled={isPending}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}

        {/* Genie Hint */}
        {genieHint && (
          <>
            <Separator className="mb-4 max-w-md" />
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-md">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 2v20M2 12h20" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <p className="text-sm text-left text-foreground">
                  <span className="font-medium">Genie: </span>
                  {genieHint}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
