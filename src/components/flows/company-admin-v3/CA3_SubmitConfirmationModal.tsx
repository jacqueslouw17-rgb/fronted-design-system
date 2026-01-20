import React from "react";
import { Send, Lock, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CA3_SubmitConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  employeeCount: number;
  contractorCount: number;
  totalAmount: string;
  warningCount?: number;
}

export const CA3_SubmitConfirmationModal: React.FC<CA3_SubmitConfirmationModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  employeeCount,
  contractorCount,
  totalAmount,
  warningCount = 0,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            Submit to Fronted
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fronted will execute payments after you submit this batch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Employees</span>
              <span className="font-medium">{employeeCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contractors</span>
              <span className="font-medium">{contractorCount}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total Payout</span>
              <span className="text-lg font-bold text-primary">{totalAmount}</span>
            </div>
          </div>

          {/* Warnings if any */}
          {warningCount > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {warningCount} warning{warningCount !== 1 ? 's' : ''} acknowledged. 
                These items will proceed as-is.
              </p>
            </div>
          )}

          {/* What happens next */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              What happens next
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-green-text mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Fronted will process all payments
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  FX rates locked, approvals frozen
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Track status in real-time on next screen
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            <Send className="h-4 w-4" />
            Submit now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CA3_SubmitConfirmationModal;
