import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationData = {
  id: string;
  title: string;
  description: string;
  metrics: {
    label: string;
    value: string;
    tooltip?: string;
  }[];
  changes?: {
    label: string;
    description: string;
    type: "updated" | "added" | "removed";
  }[];
  rationale?: string;
  status?: "ready" | "warning" | "info";
};

type AgentSmartConfirmationProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ConfirmationData;
  onConfirm: () => void;
  onEdit?: () => void;
};

const statusConfig = {
  ready: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    label: "Ready to Execute",
  },
  warning: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    label: "Review Required",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    label: "Additional Info",
  },
};

const changeTypeConfig = {
  updated: { color: "bg-blue-500", label: "Updated" },
  added: { color: "bg-green-500", label: "Added" },
  removed: { color: "bg-orange-500", label: "Removed" },
};

export const AgentSmartConfirmation = ({
  isOpen,
  onClose,
  data,
  onConfirm,
  onEdit,
}: AgentSmartConfirmationProps) => {
  const [showRationale, setShowRationale] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const status = data.status || "ready";
  const StatusIcon = statusConfig[status].icon;

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", statusConfig[status].bgColor)}>
              <StatusIcon className={cn("w-5 h-5", statusConfig[status].color)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{data.title}</DialogTitle>
              <DialogDescription className="mt-1.5">
                {data.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Metrics Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              {data.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-lg font-semibold">{metric.value}</p>
                    </div>
                    {metric.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">{metric.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Changes Highlight */}
          {data.changes && data.changes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Recent Changes
                </h4>
                <div className="space-y-2">
                  {data.changes.map((change, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mt-2",
                          changeTypeConfig[change.type].color
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{change.label}</p>
                          <Badge variant="outline" className="text-xs">
                            {changeTypeConfig[change.type].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {change.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Rationale Toggle */}
          {data.rationale && (
            <>
              <Separator />
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRationale(!showRationale)}
                  className="w-full justify-between h-auto py-2"
                >
                  <span className="text-sm font-semibold">Show Rationale</span>
                  {showRationale ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                <AnimatePresence>
                  {showRationale && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {data.rationale}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Before Running
            </Button>
          )}
          <Button onClick={onClose} variant="ghost">
            Cancel for Now
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? "Executing..." : "Confirm & Execute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgentSmartConfirmation;
