import React from "react";
import { Send, Lock, Info, CheckCircle2, AlertTriangle, Users, Briefcase } from "lucide-react";
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
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-xl font-semibold">
            Submit to Fronted?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Total payout - hero */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Payout</p>
            <p className="text-3xl font-bold text-primary">{totalAmount}</p>
          </div>

          {/* Worker breakdown */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{employeeCount}</span>
              <span className="text-muted-foreground">Employees</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{contractorCount}</span>
              <span className="text-muted-foreground">Contractors</span>
            </div>
          </div>

          {/* Warnings if any */}
          {warningCount > 0 && (
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500/5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{warningCount} warning{warningCount !== 1 ? 's' : ''} acknowledged</span>
            </div>
          )}

          <Separator />

          {/* What happens next - compact */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-accent-green-text flex-shrink-0" />
              <span className="text-muted-foreground">Fronted reviews & processes (2-3 days)</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">FX rates locked at time of payout</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Track status in real-time</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Final amount may vary slightly based on FX rates at payment time.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 gap-2">
            <Send className="h-4 w-4" />
            Submit now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CA3_SubmitConfirmationModal;
