import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlowContext } from "./KurtCoilot";

interface KurtRightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  flowContext: FlowContext;
  className?: string;
}

export const KurtRightPanel: React.FC<KurtRightPanelProps> = ({
  isOpen,
  onClose,
  content,
  flowContext,
  className,
}) => {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 h-full w-full md:w-[480px] bg-card border-l border-border shadow-2xl z-50",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">Kurt's Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  {getContextLabel(flowContext)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100vh-88px)]">
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="prose prose-sm max-w-none"
                >
                  <p className="text-foreground whitespace-pre-wrap">{content}</p>
                </motion.div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function getContextLabel(context: FlowContext): string {
  const labels: Record<FlowContext, string> = {
    "contract-creation": "Contract Creation",
    "admin-onboarding": "Admin Onboarding",
    "candidate-onboarding": "Candidate Onboarding",
    "checklist": "Checklist Progress",
    "payroll": "Payroll",
  };

  return labels[context] || "Analysis";
}
