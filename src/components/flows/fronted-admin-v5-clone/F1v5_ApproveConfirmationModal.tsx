/**
 * F1v4_ApproveConfirmationModal - Confirmation modal for payroll approval
 * 
 * Reused from CA3_SubmitConfirmationModal with messaging for external payment processing
 */

import React from "react";
import { FileCheck, Lock, Info, CheckCircle2, AlertTriangle, Users, Briefcase, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface F1v4_ApproveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  companyName: string;
  employeeCount: number;
  contractorCount: number;
  totalAmount: string;
  warningCount?: number;
}

export const F1v4_ApproveConfirmationModal: React.FC<F1v4_ApproveConfirmationModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  companyName,
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
            Approve & Lock Run?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            This locks the payroll numbers for {companyName}.
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
              <Lock className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Numbers locked, no further edits</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-accent-green-text flex-shrink-0" />
              <span className="text-muted-foreground">Payment summary generated</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Payments processed externally</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Track & reconcile status</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 gap-2">
            <FileCheck className="h-4 w-4" />
            Confirm & Lock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default F1v4_ApproveConfirmationModal;
