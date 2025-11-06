import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckCircle2, ChevronDown, ChevronRight, Upload, AlertCircle } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface Exception {
  id: string;
  candidateName: string;
  candidateFlag: string;
  issue: string;
  suggestedAction: string;
  actions: {
    label: string;
    action: string;
    variant?: "default" | "outline" | "secondary";
  }[];
}

interface ResolveExceptionsDrawerProps {
  open: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onResolve: (candidateId: string, action: string, actionLabel: string) => void;
}

export const ResolveExceptionsDrawer: React.FC<ResolveExceptionsDrawerProps> = ({
  open,
  onClose,
  candidates,
  onResolve,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());

  // Generate exceptions from candidates
  const exceptions: Exception[] = candidates
    .filter((c, idx) => {
      // Create some exceptions for demo - in real app this would come from actual data
      return idx === 0 || idx === 2; // First and third candidates have issues
    })
    .map((c, idx) => {
      if (idx === 0) {
        return {
          id: c.id,
          candidateName: c.name,
          candidateFlag: c.flag,
          issue: "Missing tax form",
          suggestedAction: "Upload form or mark as exempt.",
          actions: [
            { label: "Upload", action: "upload-form", variant: "default" as const },
            { label: "Mark Exempt", action: "mark-exempt", variant: "outline" as const },
          ],
        };
      } else {
        return {
          id: c.id,
          candidateName: c.name,
          candidateFlag: c.flag,
          issue: "Bank detail mismatch",
          suggestedAction: "Re-verify IBAN or ignore.",
          actions: [
            { label: "Verify", action: "verify-bank", variant: "default" as const },
            { label: "Ignore", action: "ignore-mismatch", variant: "outline" as const },
          ],
        };
      }
    });

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAction = (exception: Exception, action: string, label: string) => {
    // Mark as resolved
    setResolvedItems((prev) => new Set([...prev, exception.id]));
    
    // Collapse the item
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.delete(exception.id);
      return next;
    });

    // Notify parent
    onResolve(exception.id, action, `${exception.candidateName} — ${label}`);
  };

  const allResolved = exceptions.every((e) => resolvedItems.has(e.id));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            Resolve Compliance Exceptions
          </SheetTitle>
          <SheetDescription>
            Genie found items that need admin confirmation before proceeding.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {exceptions.map((exception) => {
              const isExpanded = expandedItems.has(exception.id);
              const isResolved = resolvedItems.has(exception.id);

              return (
                <motion.div
                  key={exception.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isResolved
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Header */}
                  <button
                    onClick={() => !isResolved && toggleExpanded(exception.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors disabled:cursor-not-allowed"
                    disabled={isResolved}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{exception.candidateFlag}</span>
                      <div className="text-left">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {exception.candidateName}
                          {isResolved && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                          {!isResolved && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                          {exception.issue}
                        </div>
                      </div>
                    </div>

                    {!isResolved && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    )}
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && !isResolved && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t bg-muted/30 space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              → Suggested Action:
                            </span>{" "}
                            {exception.suggestedAction}
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {exception.actions.map((actionBtn) => (
                              <Button
                                key={actionBtn.action}
                                variant={actionBtn.variant || "default"}
                                size="sm"
                                onClick={() =>
                                  handleAction(exception, actionBtn.action, actionBtn.label)
                                }
                                className="flex-1"
                              >
                                {actionBtn.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Resolved State */}
                  {isResolved && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 pb-3 text-sm text-success font-medium"
                    >
                      ✓ Resolved
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Summary State */}
        {allResolved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-lg bg-success/10 border border-success/30"
          >
            <div className="flex items-center gap-2 text-success font-medium mb-3">
              <CheckCircle2 className="h-5 w-5" />
              All exceptions resolved
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Ready for next payroll cycle.
            </p>
            <Button onClick={onClose} variant="default" className="w-full">
              Return to Review Summary
            </Button>
          </motion.div>
        )}

        {/* Bottom Actions (when not all resolved) */}
        {!allResolved && (
          <div className="mt-6 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
